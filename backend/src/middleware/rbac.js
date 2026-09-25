const { error } = require('../utils/response');

/**
 * Role-Based Access Control middleware
 * @param  {...string} allowedRoles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Unauthorized. Please log in.', 401);
    }

    // SUPER_ADMIN has platform-wide access
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res,
        `Forbidden: Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

const requireSuperAdmin = requireRole('SUPER_ADMIN');
const requireBusinessOwner = requireRole('BUSINESS_OWNER');
const requireAgentOrOwner = requireRole('BUSINESS_OWNER', 'SUPPORT_AGENT');

module.exports = {
  requireRole,
  requireSuperAdmin,
  requireBusinessOwner,
  requireAgentOrOwner,
};
