const { error } = require('../utils/response');

/**
 * Tenant isolation middleware
 * Ensures the authenticated user belongs to an active business
 */
const requireTenant = (req, res, next) => {
  if (!req.user) {
    return error(res, 'Authentication required.', 401);
  }

  // Super admins bypass single-tenant scope
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.user.businessId) {
    return error(
      res,
      'No business associated with this account. Please complete onboarding.',
      403
    );
  }

  // Ensure request is bound to user's business
  req.businessId = req.user.businessId;
  next();
};

/**
 * Validates that an entity belongs to the active tenant
 * Returns 404 or 403 if it belongs to another tenant
 */
const verifyEntityTenant = (entity, reqBusinessId) => {
  if (!entity) return false;
  if (!entity.businessId) return true;
  return entity.businessId === reqBusinessId;
};

module.exports = {
  requireTenant,
  verifyEntityTenant,
};
