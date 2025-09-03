const { validationResult } = require('express-validator');

// Middleware to check for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Please provide a valid email address'
    },
    normalizeEmail: true,
    trim: true
  },
  
  password: {
    in: ['body'],
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long'
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  
  firstName: {
    in: ['body'],
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'First name must be between 2 and 50 characters'
    },
    trim: true,
    escape: true
  },
  
  lastName: {
    in: ['body'],
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Last name must be between 2 and 50 characters'
    },
    trim: true,
    escape: true
  },
  
  businessName: {
    in: ['body'],
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'Business name must be between 2 and 100 characters'
    },
    trim: true,
    escape: true
  },
  
  businessType: {
    in: ['body'],
    isIn: {
      options: [['restaurant', 'cafe', 'food-truck', 'catering', 'bakery', 'other']],
      errorMessage: 'Please select a valid business type'
    }
  },
  
  phone: {
    in: ['body'],
    matches: {
      options: /^[\+]?[1-9][\d]{0,15}$/,
      errorMessage: 'Please provide a valid phone number'
    },
    trim: true
  }
};

module.exports = {
  validate,
  commonValidations
};
