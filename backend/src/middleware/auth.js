const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { error } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'Token has expired. Please log in again.', 401);
      }
      return error(res, 'Invalid authentication token.', 401);
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return error(res, 'User no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return next(err);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token for optionalAuth
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
};
