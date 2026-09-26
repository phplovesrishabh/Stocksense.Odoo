/**
 * requireRole — Express middleware factory.
 *
 * Usage:
 *   router.post('/products', authenticate, requireRole(['manager']), createProduct);
 *
 * @param {string[]} allowedRoles  Array of roles permitted to access the route.
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // authenticate middleware must run before requireRole
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }

    next();
  };
}

module.exports = { requireRole };
