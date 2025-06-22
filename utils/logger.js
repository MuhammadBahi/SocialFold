const winston = require('winston')
const path = require('path')
const config = require('./config')

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
)

// Create logger instance
const logger = winston.createLogger({
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'social-app' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
})

// If we're not in production, log to console as well
if (config.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }))
}

// Create logs directory if it doesn't exist
const fs = require('fs')
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
}

// Custom logging functions
const logRequest = (req, res, next) => {
    const start = Date.now()
    
    res.on('finish', () => {
        const duration = Date.now() - start
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user ? req.user._id : 'anonymous'
        }
        
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData)
        } else {
            logger.info('HTTP Request', logData)
        }
    })
    
    next()
}

const logError = (error, req = null) => {
    const errorData = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    }
    
    if (req) {
        errorData.request = {
            method: req.method,
            url: req.url,
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user ? req.user._id : 'anonymous'
        }
    }
    
    logger.error('Application Error', errorData)
}

const logSecurityEvent = (event, details) => {
    logger.warn('Security Event', {
        event,
        details,
        timestamp: new Date().toISOString()
    })
}

const logDatabaseQuery = (operation, collection, duration, success = true) => {
    const logData = {
        operation,
        collection,
        duration: `${duration}ms`,
        success,
        timestamp: new Date().toISOString()
    }
    
    if (success) {
        logger.debug('Database Query', logData)
    } else {
        logger.error('Database Query Failed', logData)
    }
}

const logFileUpload = (filename, size, type, userId) => {
    logger.info('File Upload', {
        filename,
        size: `${size} bytes`,
        type,
        userId,
        timestamp: new Date().toISOString()
    })
}

const logUserAction = (action, userId, details = {}) => {
    logger.info('User Action', {
        action,
        userId,
        details,
        timestamp: new Date().toISOString()
    })
}

// Error handling middleware
const errorHandler = (error, req, res, next) => {
    logError(error, req)
    
    // Don't leak error details in production
    if (config.NODE_ENV === 'production') {
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
    
    res.status(500).json({
        success: false,
        message: error.message,
        stack: error.stack
    })
}

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

module.exports = {
    logger,
    logRequest,
    logError,
    logSecurityEvent,
    logDatabaseQuery,
    logFileUpload,
    logUserAction,
    errorHandler,
    asyncHandler
} 