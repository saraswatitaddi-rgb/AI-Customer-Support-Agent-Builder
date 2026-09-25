const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas or local MongoDB instance
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('your_mongodb_atlas_connection_string')) {
    console.error('\x1b[31m=================================================================\x1b[0m');
    console.error('\x1b[31m[MongoDB Error] MONGODB_URI is missing or not configured in backend/.env!\x1b[0m');
    console.error('\x1b[33mPlease configure a valid MongoDB Atlas connection string in backend/.env:\x1b[0m');
    console.error('Example: MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai_support_builder?retryWrites=true&w=majority');
    console.error('Local fallback: MONGODB_URI=mongodb://127.0.0.1:27017/ai_support_builder');
    console.error('\x1b[31m=================================================================\x1b[0m');
    throw new Error('MONGODB_URI is missing in environment variables. Please provide a valid MongoDB connection string in backend/.env');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`\x1b[32m[MongoDB Connected]\x1b[0m Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('\x1b[31m[MongoDB Connection Error]\x1b[0m Failed to connect to MongoDB:', err.message);
    throw err;
  }
};

module.exports = connectDB;
