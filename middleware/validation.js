const { body, validationResult } = require('express-validator')
const config = require('../utils/config')

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        })
    }
    next()
}

// User registration validation
const validateSignup = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    
    body('username')
        .trim()
        .isLength({ min: config.MIN_USERNAME_LENGTH, max: config.MAX_USERNAME_LENGTH })
        .withMessage(`Username must be between ${config.MIN_USERNAME_LENGTH} and ${config.MAX_USERNAME_LENGTH} characters`)
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .toLowerCase(),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: config.MIN_PASSWORD_LENGTH })
        .withMessage(`Password must be at least ${config.MIN_PASSWORD_LENGTH} characters long`)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    handleValidationErrors
]

// User login validation
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
]

// Post creation validation
const validatePost = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    
    body('content')
        .trim()
        .isLength({ min: 1, max: config.MAX_POST_LENGTH })
        .withMessage(`Content must be between 1 and ${config.MAX_POST_LENGTH} characters`),
    
    handleValidationErrors
]

// Comment validation
const validateComment = [
    body('content')
        .trim()
        .isLength({ min: 1, max: config.MAX_COMMENT_LENGTH })
        .withMessage(`Comment must be between 1 and ${config.MAX_COMMENT_LENGTH} characters`)
        .escape(), // Prevent XSS
    
    handleValidationErrors
]

// Profile update validation
const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters')
        .escape(),
    
    body('location')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location must be less than 100 characters'),
    
    body('website')
        .optional()
        .trim()
        .isURL()
        .withMessage('Please provide a valid website URL'),
    
    handleValidationErrors
]

// Password reset validation
const validatePasswordReset = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    handleValidationErrors
]

// New password validation
const validateNewPassword = [
    body('password')
        .isLength({ min: config.MIN_PASSWORD_LENGTH })
        .withMessage(`Password must be at least ${config.MIN_PASSWORD_LENGTH} characters long`)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password')
            }
            return true
        }),
    
    handleValidationErrors
]

// Search validation
const validateSearch = [
    body('query')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters')
        .escape(),
    
    handleValidationErrors
]

// Sanitize user input (general purpose)
const sanitizeInput = (req, res, next) => {
    // Sanitize common fields
    if (req.body.title) req.body.title = req.body.title.trim()
    if (req.body.content) req.body.content = req.body.content.trim()
    if (req.body.name) req.body.name = req.body.name.trim()
    if (req.body.bio) req.body.bio = req.body.bio.trim()
    
    next()
}

module.exports = {
    validateSignup,
    validateLogin,
    validatePost,
    validateComment,
    validateProfileUpdate,
    validatePasswordReset,
    validateNewPassword,
    validateSearch,
    sanitizeInput,
    handleValidationErrors
} 