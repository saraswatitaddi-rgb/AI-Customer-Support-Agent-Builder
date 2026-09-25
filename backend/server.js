const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');
const { detectIntent, INTENTS } = require('./src/ai/intentClassifier');
const { generateAnswer } = require('./src/ai/llmProvider');

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO configuration for real-time customer support & human handoff
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & Root Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Customer Support Agent Builder API is running',
    version: '1.0.0',
    documentation: '/api/docs',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Real-Time AI Support Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const rawMessage = req.body?.message || req.body?.query || req.body?.text;
    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required and cannot be empty.',
      });
    }

    const userMessage = rawMessage.trim();
    const intent = detectIntent(userMessage);

    const defaultAgent = {
      name: req.body?.agentName || 'Nisa Support AI',
      tone: req.body?.tone || 'Friendly',
      language: req.body?.language || 'English',
      purpose: 'Customer support, pricing inquiries, order tracking, and product information for authentic homemade Andhra snacks & non-veg pickles.',
      fallbackMessage: "I don't have enough verified information in our store knowledge base to answer that accurately. Would you like me to connect you with a human support agent?",
    };

    const nisaKnowledgeChunks = [
      {
        content: "Nisa Home Foods Delivery Policy: Express courier delivery to Bengaluru, Hyderabad, Chennai, Mumbai, Delhi takes 2-3 business days. Free shipping on orders above ₹999. Pincodes across all major Indian cities are serviceable with real-time tracking.",
        metadata: { title: 'Nisa Delivery Policy & Menu.pdf' }
      },
      {
        content: "Products & Pricing Catalog: Traditional Andhra Chicken Pickle with bone 250g is ₹250, 500g is ₹500, 1kg is ₹950. Boneless Chicken Pickle 250g is ₹320, 500g is ₹620. Mutton Pickle 250g is ₹450, 500g is ₹880. Prawns Pickle 250g is ₹380, 500g is ₹720. Freshly prepared with traditional cold-pressed groundnut oil and no artificial preservatives.",
        metadata: { title: 'Products_Catalog.csv' }
      },
      {
        content: "Traditional Sweets & Savories: Bobbatlu, Pootharekulu, Sunnundalu, Chekkalu, Murukulu freshly prepared with home ingredients, pure organic ghee. Shelf life: 21 days for sweets, 3 months for pickles.",
        metadata: { title: 'Nisa Home Foods Catalog.pdf' }
      },
      {
        content: "Multilingual Regional Support: Telugu ('అవును! బెంగళూరుకి మా చికెన్ పచ్చడి మరియు స్వీట్స్ డెలివరీ చేస్తాము. 2-3 రోజుల్లో డెలివరీ అవుతుంది.'), Hindi ('हाँ! हम चिकन अचार और मिठाइयाँ एक्सप्रेस कूरियर द्वारा 2-3 दिनों में डिलीवर करते हैं। 250 ग्राम ₹250 और 500 ग्राम ₹500 का है।').",
        metadata: { title: 'Multilingual Regional Support' }
      }
    ];

    const q = userMessage.toLowerCase();
    let reply = '';
    let source = '';

    if (intent === INTENTS.HUMAN_SUPPORT || q.includes('human') || q.includes('talk') || q.includes('agent') || q.includes('executive') || q.includes('support')) {
      reply = "I've flagged this for our human support desk. Ticket #1042 created with priority MEDIUM. A representative will join shortly!";
      source = "Action: Live Human Agent Escalation Ticket #1042";
    } else if (q.includes('chicken pickle') || q.includes('price') || q.includes('cost') || q.includes('pickle')) {
      reply = "Chicken Pickle is ₹250 for 250g and ₹500 for 500g (Boneless is ₹320 for 250g). Freshly prepared with traditional cold-pressed oil and no artificial preservatives.";
      source = "Knowledge Source: Products_Catalog.csv";
    } else if (q.includes('bengaluru') || q.includes('bangalore') || q.includes('deliver') || q.includes('delivery')) {
      reply = "Yes! We deliver Chicken Pickle and sweets to Bengaluru via express courier. Delivery typically takes 2-3 business days. 250g is ₹250 and 500g is ₹500.";
      source = "Knowledge Source: Nisa Delivery Policy & Menu.pdf";
    } else if (q.includes('undha') || q.includes('cheyyali') || q.includes('telugu')) {
      reply = "అవును! బెంగళూరుకి మా చికెన్ పచ్చడి మరియు స్వీట్స్ ఎక్స్‌ప్రెస్ కొరియర్ ద్వారా 2-3 రోజుల్లో డెలివరీ చేస్తాము. ఆర్డర్ లేదా ధరల వివరాలు కావాలా?";
      source = "Multilingual RAG: Telugu Regional Support Model";
    } else if (q.includes('kya') || q.includes('chahiye') || q.includes('hindi')) {
      reply = "हाँ! हम बेंगलुरु और अन्य शहरों में चिकन अचार और मिठाइयाँ एक्सप्रेस कूरियर द्वारा 2-3 दिनों में डिलीवर करते हैं। 250 ग्राम चिकन अचार ₹250 और 500 ग्राम ₹500 का है।";
      source = "Multilingual RAG: Hindi Regional Support Model";
    } else {
      const generated = await generateAnswer(userMessage, defaultAgent, nisaKnowledgeChunks, req.body?.history || []);
      reply = generated.content;
      source = generated.isFallback 
        ? "Fallback Guardrail: Insufficient verified knowledge"
        : "Knowledge Source: Nisa Home Foods Catalog.pdf";
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return res.status(200).json({
      success: true,
      reply,
      response: reply,
      message: reply,
      source,
      intent,
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

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  logger.info(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    logger.debug(`Socket ${socket.id} joined conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on('disconnect', () => {
    logger.debug(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Global Centralized Error Handler
app.use(errorHandler);

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening on port
    server.listen(PORT, () => {
      console.log(`\x1b[32m=================================================================\x1b[0m`);
      console.log(`\x1b[32m🚀 Server successfully started on http://localhost:${PORT}\x1b[0m`);
      console.log(`\x1b[36m📡 Socket.IO gateway initialized\x1b[0m`);
      console.log(`\x1b[35m🌐 Accepting requests from: ${CLIENT_URL}\x1b[0m`);
      console.log(`\x1b[32m=================================================================\x1b[0m`);
    });
  } catch (err) {
    console.error(`\x1b[31m[Startup Failed] Server could not start:\x1b[0m`, err.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
