const mongoose = require('mongoose');

const messageItemSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'agent', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  source: {
    type: String,
  },
  intent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: 'Guest Customer',
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'escalated'],
      default: 'active',
    },
    messages: [messageItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Conversation', conversationSchema);
