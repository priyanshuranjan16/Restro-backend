const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { hasPermission, hasAnyPermission, hasAllPermissions } = require('../config/permissions');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Token is not valid. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated. Please contact support.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Server error in authentication.' 
    });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    // Check if user has any of the required permissions
    if (!hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Require all specified permissions
const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    // Check if user has all of the required permissions
    if (!hasAllPermissions(req.user.role, permissions)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = { 
  auth, 
  optionalAuth, 
  authorize, 
  requirePermission, 
  requireAllPermissions 
};
