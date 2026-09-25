const logger = require('../utils/logger');
const { error } = require('../utils/response');

/**
 * Global centralized error handler
 * Never leaks raw stack traces in production
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, err.stack);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return error(res, 'File size exceeds allowed limit (10MB maximum).', 400);
    }
    return error(res, `File upload error: ${err.message}`, 400);
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? ` (${err.meta.target.join(', ')})` : '';
    return error(res, `A record with this identifier already exists${fields}.`, 409);
  }

  // Prisma record not found error
  if (err.code === 'P2025') {
    return error(res, 'The requested resource could not be found.', 404);
  }

  // JSON syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return error(res, 'Malformed JSON in request body.', 400);
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error. Please try again later.'
    : err.message || 'An unexpected error occurred.';

  return error(res, message, statusCode);
};

module.exports = errorHandler;
