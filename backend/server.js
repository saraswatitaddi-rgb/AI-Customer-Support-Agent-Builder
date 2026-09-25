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

// API Route Mounts
const authRoutes = require('./src/routes/authRoutes');
const agentRoutes = require('./src/routes/agentRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/chat', chatRoutes);

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
