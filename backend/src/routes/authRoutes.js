const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');
const KnowledgeBase = require('../models/KnowledgeBase');
const config = require('../config/env');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');

/**
 * Generate JWT Token helper
 */
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, create default agent, and return token
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate presence
    if (!name || !name.trim()) {
      return error(res, 'Please provide your full name.', 400);
    }
    if (!email || !email.trim()) {
      return error(res, 'Please provide your email address.', 400);
    }
    if (!password || password.length < 6) {
      return error(res, 'Password must be at least 6 characters long.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return error(res, 'An account with this email address already exists. Please sign in instead.', 409);
    }

    // Create user (password is automatically hashed via pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // Automatically create a default AI Agent for the new user
    const defaultAgent = await Agent.create({
      userId: user._id,
      name: `${user.name.split(' ')[0]}'s Support AI`,
      description: 'Customer support, order status, return assistance, and product inquiries.',
      tone: 'Friendly',
      language: 'English',
      businessInformation: 'E-commerce business providing customer support for orders, shipping, and products.',
      instructions: 'Be polite, helpful, and answer questions accurately using the knowledge base. If information is missing, offer human support assistance.',
      welcomeMessage: 'Hello! How can I assist you with your orders or questions today?',
      fallbackMessage: "I'm sorry, I don't have enough information about that yet. Please contact our support team.",
    });

    // Populate default core FAQs in Knowledge Base
    const defaultKnowledge = [
      {
        userId: user._id,
        agentId: defaultAgent._id,
        title: 'Return & Exchange Policy',
        category: 'Returns',
        content: 'To return a product, open your Orders page, select the product, and choose Return Item. Returns are accepted within 7 days of delivery for eligible items in original packaging. Refunds are processed to the original payment method within 3-5 business days after pickup.',
        tags: ['return', 'refund', 'exchange', 'policy'],
      },
      {
        userId: user._id,
        agentId: defaultAgent._id,
        title: 'Supported Payment Methods',
        category: 'Payments',
        content: 'We support all major Credit and Debit Cards (Visa, MasterCard, RuPay), UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible pincodes.',
        tags: ['payment', 'upi', 'cards', 'cod'],
      },
      {
        userId: user._id,
        agentId: defaultAgent._id,
        title: 'Order Status & Tracking',
        category: 'Orders',
        content: 'Customers can check order status by providing their Order ID (e.g. ORD1234). Express shipping delivers within 2-3 business days. Tracking links are sent via SMS and email once dispatched.',
        tags: ['order', 'tracking', 'status', 'shipping'],
      },
      {
        userId: user._id,
        agentId: defaultAgent._id,
        title: 'Customer Support Hours & Contact',
        category: 'General',
        content: 'Our support team is available 24/7 via live chat. You can also reach our human support desk by requesting agent assistance or emailing support@agentcraft.ai.',
        tags: ['hours', 'contact', 'human support', 'escalation'],
      },
    ];

    await KnowledgeBase.insertMany(defaultKnowledge);

    const token = generateToken(user._id, user.email);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, verify password, and return token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return error(res, 'Please provide your email address.', 400);
    }
    if (!password) {
      return error(res, 'Please provide your password.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for user in MongoDB
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return error(res, 'Invalid email or password. Please check your credentials.', 401);
    }

    // Verify password with bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password. Please check your credentials.', 401);
    }

    const token = generateToken(user._id, user.email);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile and active agent
 * @access  Private (Requires JWT)
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const agent = await Agent.findOne({ userId: user._id });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      agent: agent || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (stateless JWT client cleanup)
 * @access  Public
 */
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = router;
