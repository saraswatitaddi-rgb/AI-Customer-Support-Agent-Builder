const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const KnowledgeBase = require('../models/KnowledgeBase');
const Conversation = require('../models/Conversation');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');

/**
 * @route   GET /api/agent
 * @desc    Get authenticated user's AI Agent configuration
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    let agent = await Agent.findOne({ userId: req.user._id });
    if (!agent) {
      agent = await Agent.create({
        userId: req.user._id,
        name: `${req.user.name.split(' ')[0]}'s Support AI`,
      });
    }

    const knowledgeCount = await KnowledgeBase.countDocuments({ userId: req.user._id });

    return res.status(200).json({
      success: true,
      agent,
      knowledgeCount,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/agent
 * @desc    Update AI Agent configuration
 * @access  Private
 */
router.put('/', authenticate, async (req, res, next) => {
  try {
    const {
      name,
      description,
      tone,
      language,
      businessInformation,
      instructions,
      welcomeMessage,
      fallbackMessage,
      temperature,
    } = req.body;

    let agent = await Agent.findOne({ userId: req.user._id });
    if (!agent) {
      agent = new Agent({ userId: req.user._id });
    }

    if (name) agent.name = name.trim();
    if (description !== undefined) agent.description = description;
    if (tone) agent.tone = tone;
    if (language) agent.language = language;
    if (businessInformation !== undefined) agent.businessInformation = businessInformation;
    if (instructions !== undefined) agent.instructions = instructions;
    if (welcomeMessage !== undefined) agent.welcomeMessage = welcomeMessage;
    if (fallbackMessage !== undefined) agent.fallbackMessage = fallbackMessage;
    if (temperature !== undefined) agent.temperature = Number(temperature);

    await agent.save();

    return res.status(200).json({
      success: true,
      message: 'Agent configuration updated successfully.',
      agent,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/agent/knowledge
 * @desc    Get all knowledge base items & FAQs for authenticated user's agent
 * @access  Private
 */
router.get('/knowledge', authenticate, async (req, res, next) => {
  try {
    const knowledgeItems = await KnowledgeBase.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: knowledgeItems.length,
      knowledge: knowledgeItems,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/agent/knowledge
 * @desc    Create a new knowledge base item / FAQ
 * @access  Private
 */
router.post('/knowledge', authenticate, async (req, res, next) => {
  try {
    const { title, category, content, tags } = req.body;

    if (!title || !title.trim()) {
      return error(res, 'Please provide a title for the knowledge item.', 400);
    }
    if (!content || !content.trim()) {
      return error(res, 'Please provide content or an FAQ answer.', 400);
    }

    const agent = await Agent.findOne({ userId: req.user._id });

    const newItem = await KnowledgeBase.create({
      userId: req.user._id,
      agentId: agent?._id,
      title: title.trim(),
      category: category || 'General',
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Knowledge base item added successfully.',
      item: newItem,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/agent/knowledge/:id
 * @desc    Delete a knowledge base item
 * @access  Private
 */
router.delete('/knowledge/:id', authenticate, async (req, res, next) => {
  try {
    const item = await KnowledgeBase.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      return error(res, 'Knowledge base item not found or unauthorized.', 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Knowledge item deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/agent/conversations
 * @desc    Get recent chat sessions & conversations
 * @access  Private
 */
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
