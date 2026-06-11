// Middleware factory: restrict to specific roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route requires role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { requireRole };
