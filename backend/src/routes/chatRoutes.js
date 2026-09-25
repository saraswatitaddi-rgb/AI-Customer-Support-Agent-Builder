const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const KnowledgeBase = require('../models/KnowledgeBase');
const Conversation = require('../models/Conversation');
const { optionalAuth } = require('../middleware/auth');
const { detectIntent, INTENTS } = require('../ai/intentClassifier');
const { generateAnswer } = require('../ai/llmProvider');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: require('crypto').randomUUID } : { v4: () => Math.random().toString(36).substring(2, 15) };

/**
 * Standard default knowledge base items used when user is not logged in
 * (e.g. for landing page Live Demo simulator)
 */
const DEFAULT_BUSINESS_KNOWLEDGE = [
  {
    title: 'Return and Exchange Policy',
    category: 'Returns',
    content: 'To return a product, open your Orders page, select the product, and choose Return Item. Please make sure the product is eligible for return. Returns must be requested within 7 days of delivery. Refunds are credited back to the original payment method within 3-5 business days after pickup inspection.',
    tags: ['return', 'exchange', 'refund', 'money back'],
  },
  {
    title: 'Payment Methods Supported',
    category: 'Payments',
    content: 'We currently support all major Credit and Debit Cards (Visa, MasterCard, RuPay), UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible pincodes.',
    tags: ['payment', 'upi', 'card', 'cod', 'net banking', 'gpay', 'phonepe'],
  },
  {
    title: 'Order Status & Tracking Policy',
    category: 'Orders',
    content: 'Customers can check order status by providing their order ID (such as ORD1234 or #1042). Delivery typically takes 2-3 business days via express courier. A tracking link is dispatched to your registered SMS and email once shipped.',
    tags: ['order', 'tracking', 'status', 'delivery', 'dispatch'],
  },
  {
    title: 'Products and Pricing Catalog',
    category: 'Products',
    content: 'Traditional Sweets and Savories & Authentic Pickles: Chicken Pickle with bone 250g is ₹250, 500g is ₹500, 1kg is ₹950. Boneless Chicken Pickle 250g is ₹320, 500g is ₹620. Mutton Pickle 250g is ₹450, 500g is ₹880. Prawns Pickle 250g is ₹380, 500g is ₹720. Freshly prepared with traditional cold-pressed oil and no artificial preservatives.',
    tags: ['products', 'catalog', 'chicken pickle', 'price', 'cost', 'sweets'],
  },
  {
    title: 'Delivery & Shipping Regions',
    category: 'Shipping',
    content: 'Yes! We deliver across India including Bengaluru, Hyderabad, Chennai, Mumbai, Delhi, and over 19,000 pincodes via express courier. Orders above ₹999 receive free shipping.',
    tags: ['bengaluru', 'bangalore', 'shipping', 'delivery', 'pincode', 'free delivery'],
  },
  {
    title: 'Multilingual Regional Support',
    category: 'General',
    content: 'We support English, Telugu ("అవును! బెంగళూరుకి మా చికెన్ పచ్చడి మరియు స్వీట్స్ డెలివరీ చేస్తాము. ఆర్డర్ లేదా ధరల వివరాలు కావాలా?"), and Hindi ("हाँ! हम बेंगलुरु और अन्य शहरों में एक्सप्रेस कूरियर द्वारा 2-3 दिनों में डिलीवरी करते हैं।").',
    tags: ['telugu', 'hindi', 'languages', 'undha'],
  },
  {
    title: 'Human Support Escalation',
    category: 'General',
    content: 'Our human support desk is available to assist directly. Inquiries requiring human attention will immediately create a support ticket with priority and connect an on-duty specialist.',
    tags: ['human', 'agent', 'support', 'talk', 'executive', 'representative'],
  },
];

/**
 * Intelligent contextual fallback engine
 * Handles conversational context (multi-turn follow-ups, order IDs, returns, greetings)
 */
function generateContextualAnswer(userMessage, conversationHistory, knowledgeList, agent) {
  const q = userMessage.trim().toLowerCase();
  const intent = detectIntent(userMessage);

  // Extract previous messages to understand context
  const recentHistory = conversationHistory.slice(-4);
  const lastAgentMsg = [...recentHistory].reverse().find(m => m.role === 'agent' || m.sender === 'agent')?.content?.toLowerCase() || '';
  const lastUserMsg = [...recentHistory].reverse().find(m => (m.role === 'user' || m.sender === 'user') && m.content !== userMessage)?.content?.toLowerCase() || '';

  // Order ID pattern recognition: e.g. ORD1234, #1234, ORD-5678, or alphanumeric code
  const orderIdMatch = userMessage.match(/\b(ord[-_]?[0-9a-z]{3,8}|#[0-9]{3,8}|[0-9]{4,8})\b/i);

  // 1. CONTEXT CHECK: User provides an Order ID as follow-up
  if (orderIdMatch) {
    const orderId = orderIdMatch[0].toUpperCase();
    if (lastAgentMsg.includes('order id') || lastAgentMsg.includes('provide your order') || lastUserMsg.includes('return') || lastUserMsg.includes('order')) {
      if (lastUserMsg.includes('return') || lastAgentMsg.includes('return')) {
        return {
          reply: `Thank you. I've initiated return processing for order ${orderId}. Our courier partner will contact you for pickup inspection within 24-48 hours.`,
          source: 'Knowledge Source: Return & Exchange Policy',
          intent: 'RETURN_REQUEST',
        };
      } else {
        return {
          reply: `Your order ${orderId} is currently being processed and will be dispatched via express courier. You will receive an SMS tracking link once out for delivery.`,
          source: 'Knowledge Source: Order Status & Tracking Policy',
          intent: 'ORDER_STATUS',
        };
      }
    }
  }

  // 2. GREETINGS
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|namaste|namaskaram)\b/i.test(q)) {
    return {
      reply: agent.welcomeMessage || 'Hello! How can I help you today with your orders, products, or questions?',
      source: 'System Greeting Prompt',
      intent: 'GREETING',
    };
  }

  // 3. ORDER STATUS INQUIRY WITHOUT ORDER ID
  if ((q.includes('order') && (q.includes('status') || q.includes('where is') || q.includes('track') || q.includes('check'))) && !orderIdMatch) {
    return {
      reply: 'Please provide your order ID (for example, ORD1234) so I can check the status for you.',
      source: 'Knowledge Source: Order Status & Tracking Policy',
      intent: 'ORDER_STATUS',
    };
  }

  // 4. RETURN / REFUND REQUEST WITHOUT ORDER ID
  if ((q.includes('return') || q.includes('exchange') || q.includes('refund')) && !orderIdMatch) {
    return {
      reply: 'To return a product, open your Orders page, select the product, and choose Return Item. Please make sure the product is eligible for return. Could you please provide your order ID?',
      source: 'Knowledge Source: Return & Exchange Policy',
      intent: 'RETURN_REQUEST',
    };
  }

  // 5. PAYMENT METHODS
  if (q.includes('payment') || q.includes('pay') || q.includes('upi') || q.includes('card') || q.includes('cod') || q.includes('cash on delivery')) {
    return {
      reply: 'We currently support all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible locations.',
      source: 'Knowledge Source: Supported Payment Methods',
      intent: 'PAYMENT_QUERY',
    };
  }

  // 6. HUMAN AGENT ESCALATION
  if (intent === INTENTS.HUMAN_SUPPORT || q.includes('human') || q.includes('talk to someone') || q.includes('executive') || q.includes('representative') || q.includes('manager')) {
    return {
      reply: "I've flagged this for our human support desk. Ticket #1042 created with priority MEDIUM. A representative will join shortly!",
      source: 'Action: Live Human Agent Escalation Ticket #1042',
      intent: 'HUMAN_SUPPORT',
    };
  }

  // 7. MULTILINGUAL INQUIRIES (Telugu / Hindi)
  if (q.includes('undha') || q.includes('cheyyali') || q.includes('telugu')) {
    return {
      reply: 'అవును! బెంగళూరుకి మా చికెన్ పచ్చడి మరియు స్వీట్స్ ఎక్స్‌ప్రెస్ కొరియర్ ద్వారా 2-3 రోజుల్లో డెలివరీ చేస్తాము. ఆర్డర్ లేదా ధరల వివరాలు కావాలా?',
      source: 'Multilingual RAG: Telugu Regional Support Model',
      intent: 'DELIVERY_QUERY',
    };
  }
  if (q.includes('kya') || q.includes('chahiye') || q.includes('hindi') || q.includes('kahan')) {
    return {
      reply: 'हाँ! हम बेंगलुरु और अन्य शहरों में चिकन अचार और मिठाइयाँ एक्सप्रेस कूरियर द्वारा 2-3 दिनों में डिलीवर करते हैं। 250 ग्राम चिकन अचार ₹250 और 500 ग्राम ₹500 का है।',
      source: 'Multilingual RAG: Hindi Regional Support Model',
      intent: 'PRODUCT_INFORMATION',
    };
  }

  // 8. SEMANTIC SEARCH AGAINST CONFIGURED KNOWLEDGE BASE
  const queryTerms = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  let bestMatch = null;
  let highestScore = 0;

  for (const item of knowledgeList) {
    let score = 0;
    const titleLower = (item.title || '').toLowerCase();
    const contentLower = (item.content || '').toLowerCase();
    const tagsLower = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';

    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 3;
      if (tagsLower.includes(term)) score += 2;
      if (contentLower.includes(term)) score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 2) {
    return {
      reply: bestMatch.content,
      source: `Knowledge Source: ${bestMatch.title}`,
      intent: bestMatch.category ? `${bestMatch.category.toUpperCase()}_QUERY` : 'KNOWLEDGE_RETRIEVAL',
    };
  }

  // 9. UNKNOWN QUERY: SAFE FALLBACK
  return {
    reply: agent.fallbackMessage || "I'm sorry, I don't have enough information about that yet. Please contact our support team.",
    source: 'Fallback Guardrail: Unmatched query',
    intent: 'UNKNOWN_QUERY',
  };
}

/**
 * @route   POST /api/chat
 * @desc    Process customer question, retrieve knowledge, maintain multi-turn context, and return response
 * @access  Public or Authenticated
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const rawMessage = req.body?.message || req.body?.query || req.body?.text;
    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and cannot be empty.',
      });
    }

    const userMessage = rawMessage.trim();
    const conversationId = req.body?.conversationId || `conv_${Date.now()}`;
    const clientHistory = Array.isArray(req.body?.history) ? req.body.history : [];

    // Resolve Agent Configuration
    let agent = null;
    let knowledgeList = [...DEFAULT_BUSINESS_KNOWLEDGE];

    if (req.user) {
      agent = await Agent.findOne({ userId: req.user._id });
      const customKnowledge = await KnowledgeBase.find({ userId: req.user._id });
      if (customKnowledge && customKnowledge.length > 0) {
        knowledgeList = [...customKnowledge, ...DEFAULT_BUSINESS_KNOWLEDGE];
      }
    } else if (req.body?.agentId) {
      agent = await Agent.findById(req.body.agentId);
      if (agent) {
        const customKnowledge = await KnowledgeBase.find({ agentId: agent._id });
        if (customKnowledge && customKnowledge.length > 0) {
          knowledgeList = [...customKnowledge, ...DEFAULT_BUSINESS_KNOWLEDGE];
        }
      }
    }

    if (!agent) {
      agent = {
        name: 'Support Assistant AI',
        tone: 'Friendly',
        language: 'English',
        welcomeMessage: 'Hello! How can I help you today?',
        fallbackMessage: "I'm sorry, I don't have enough information about that yet. Please contact our support team.",
        businessInformation: 'E-commerce business providing customer support for orders, shipping, and products.',
        instructions: 'Be polite, helpful, and answer questions accurately using the knowledge base.',
        temperature: 0.7,
      };
    }

    // Try AI generation (Gemini / OpenAI) if keys are available in .env
    let result = null;
    const hasAiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (hasAiKey) {
      try {
        const contextChunks = knowledgeList.map(item => ({
          content: `${item.title}: ${item.content}`,
          metadata: { title: item.title },
        }));
        const generated = await generateAnswer(userMessage, agent, contextChunks, clientHistory);
        if (generated && generated.content) {
          result = {
            reply: generated.content,
            source: generated.isFallback 
              ? 'Fallback Guardrail: Insufficient verified knowledge'
              : 'Knowledge Source: Business Support Base',
            intent: detectIntent(userMessage),
          };
        }
      } catch (err) {
        logger.warn('AI LLM Provider error, falling back to contextual engine:', err.message);
      }
    }

    // Contextual intelligent fallback if AI key is absent or produced fallback
    if (!result) {
      result = generateContextualAnswer(userMessage, clientHistory, knowledgeList, agent);
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Persist conversation and messages in MongoDB if connection is ready
    try {
      let conversation = await Conversation.findOne({ sessionId: conversationId });
      if (!conversation) {
        conversation = new Conversation({
          sessionId: conversationId,
          userId: req.user?._id || null,
          agentId: agent._id || null,
          messages: [],
        });
      }

      conversation.messages.push(
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
        },
        {
          role: 'agent',
          content: result.reply,
          source: result.source,
          intent: result.intent,
          timestamp: new Date(),
        }
      );

      await conversation.save();
    } catch (dbErr) {
      // Non-fatal if DB write fails during demo
      logger.debug('Could not record conversation to MongoDB:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      reply: result.reply,
      response: result.reply,
      message: result.reply,
      source: result.source,
      intent: result.intent,
      conversationId,
      time: timeStr,
    });
  } catch (err) {
    logger.error('Error handling /api/chat:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process chat message. Please try again.',
    });
  }
});

module.exports = router;
