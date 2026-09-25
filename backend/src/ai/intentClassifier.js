/**
 * Multilingual Customer Support Intent Classifier
 * Supports English, Telugu, Hindi, and Hinglish/Teluglish
 */

const INTENTS = {
  PRODUCT_INFORMATION: 'PRODUCT_INFORMATION',
  ORDER_STATUS: 'ORDER_STATUS',
  DELIVERY: 'DELIVERY',
  REFUND: 'REFUND',
  PAYMENT: 'PAYMENT',
  CANCELLATION: 'CANCELLATION',
  COMPLAINT: 'COMPLAINT',
  GENERAL_QUERY: 'GENERAL_QUERY',
  HUMAN_SUPPORT: 'HUMAN_SUPPORT',
};

const INTENT_PATTERNS = [
  {
    intent: INTENTS.HUMAN_SUPPORT,
    regex: /(speak|talk|chat|connect|transfer|escalate|person|agent|executive|manager|real person|human support|customer care|manishi|matladali|baat karni|pratinidhi|kisi se baat)/i,
    score: 1.0,
  },
  {
    intent: INTENTS.ORDER_STATUS,
    regex: /(where is my order|track|tracking|order status|order id|dispatch|shipped|package location|order eppudu|order kahan|status check|order no)/i,
    score: 0.95,
  },
  {
    intent: INTENTS.DELIVERY,
    regex: /(deliver|delivery|shipping|ship to|courier|bengaluru|bangalore|hyderabad|chennai|mumbai|delhi|pincode|charges|address|undha|delivery untada|deliver karte|kab tak pahunchega|delivery time|free delivery)/i,
    score: 0.9,
  },
  {
    intent: INTENTS.REFUND,
    regex: /(refund|money back|return|replace|damaged|spoiled|wrong item|reimbursement|wapas|paise wapas|marpu|return policy)/i,
    score: 0.9,
  },
  {
    intent: INTENTS.CANCELLATION,
    regex: /(cancel|cancellation|stop order|dont want|voddu|cancel cheyyali|order radd|cancel karna)/i,
    score: 0.9,
  },
  {
    intent: INTENTS.PAYMENT,
    regex: /(pay|payment|upi|gpay|phonepe|paytm|credit card|cod|cash on delivery|net banking|bill|invoice|paise kaise|ela pay cheyali)/i,
    score: 0.85,
  },
  {
    intent: INTENTS.COMPLAINT,
    regex: /(complaint|bad quality|late|angry|terrible|worst|not received|stale|smell|horrible|cheated|dhoka|anyaayam|fir)/i,
    score: 0.85,
  },
  {
    intent: INTENTS.PRODUCT_INFORMATION,
    regex: /(product|price|cost|how much|rate|menu|items|sell|available|ingredients|pickle|sweets|snacks|mixture|murukulu|chicken|shelf life|kg|grams|dharalu|entha|kya kya hai|kya bechte ho)/i,
    score: 0.8,
  },
];

/**
 * Classifies customer message into standardized intent
 * @param {string} text
 * @returns {string} One of INTENTS enum
 */
function detectIntent(text) {
  if (!text || typeof text !== 'string') {
    return INTENTS.GENERAL_QUERY;
  }

  const clean = text.toLowerCase().trim();

  for (const item of INTENT_PATTERNS) {
    if (item.regex.test(clean)) {
      return item.intent;
    }
  }

  return INTENTS.GENERAL_QUERY;
}

module.exports = {
  INTENTS,
  detectIntent,
};
