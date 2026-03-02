const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');

/**
 * Verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Check if user has required permission
 */
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const permissions = User.PERMISSIONS[userRole] || [];
    
    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermission,
        role: userRole
      });
    }

    next();
  };
};

/**
 * Check if user has one of the required roles
 */
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied',
        allowedRoles,
        yourRole: userRole
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  hasRole
};
