const rateLimit = require('express-rate-limit')
const config = require('../utils/config')

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
        })
    }
})

// Stricter limiter for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again later.',
            retryAfter: 900
        })
    }
})

// File upload limiter
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: {
        error: 'Too many file uploads, please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many file uploads, please try again later.',
            retryAfter: 3600
        })
    }
})

// Comment limiter
const commentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 comments per minute
    message: {
        error: 'Too many comments, please slow down.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many comments, please slow down.',
            retryAfter: 60
        })
    }
})

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    commentLimiter
} 