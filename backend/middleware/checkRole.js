/**
 * Middleware to check if user has required role
 * @param {Array} allowedRoles - Array of allowed roles
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu amalni bajarish uchun huquqingiz yoq'
      });
    }

    next();
  };
};

module.exports = checkRole; 