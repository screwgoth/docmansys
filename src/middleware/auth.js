const jwt = require('jsonwebtoken');
const config = require('../config');
const UserRepository = require('../repositories/userRepository');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Fetch fresh user data to ensure permissions are up-to-date
    const user = await UserRepository.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Check if user has required permission
 */
const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermission,
        yourPermissions: userPermissions
      });
    }

    next();
  };
};

/**
 * Check if user has ANY of the required permissions
 */
const hasAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.some(perm => userPermissions.includes(perm));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermissions,
        yourPermissions: userPermissions
      });
    }

    next();
  };
};

/**
 * Check if user has ALL of the required permissions
 */
const hasAllPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPerms = requiredPermissions.every(perm => userPermissions.includes(perm));
    
    if (!hasAllPerms) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermissions,
        yourPermissions: userPermissions
      });
    }

    next();
  };
};

/**
 * Check if user has one of the required roles (for backward compatibility)
 */
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    
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
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole
};
