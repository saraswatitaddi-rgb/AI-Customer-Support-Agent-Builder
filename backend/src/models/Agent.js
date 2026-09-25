const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an agent name'],
      trim: true,
      default: 'Support Assistant AI',
    },
    description: {
      type: String,
      default: 'Customer support, order status, return assistance, and product inquiries.',
    },
    tone: {
      type: String,
      enum: ['Friendly', 'Professional', 'Casual', 'Formal'],
      default: 'Friendly',
    },
    language: {
      type: String,
      default: 'English',
    },
    businessInformation: {
      type: String,
      default: 'E-commerce business providing customer support for orders, shipping, and products.',
    },
    instructions: {
      type: String,
      default: 'Be polite, helpful, and answer questions accurately using the knowledge base. If information is missing, offer human support assistance.',
    },
    welcomeMessage: {
      type: String,
      default: 'Hello! How can I assist you with your orders or questions today?',
    },
    fallbackMessage: {
      type: String,
      default: "I'm sorry, I don't have enough information about that yet. Please contact our support team.",
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Agent', agentSchema);
