const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const path = require('path')

// Import configurations and utilities
const config = require('./utils/config')
const { connectWithMonitoring, checkDatabaseHealth } = require('./utils/database')
const { logRequest, errorHandler, logger } = require('./utils/logger')
const { generalLimiter, authLimiter, uploadLimiter, commentLimiter } = require('./middleware/rateLimiter')
const { handleUploadError } = require('./middleware/fileUpload')

// Import routes
const SignInRroute = require('./routers/sign_In-route')
const LoginRroute = require('./routers/login')
const profileRroute = require('./routers/profile')
const HomeRroute = require('./routers/home')
const PostRroute = require('./routers/post')
const NotificationRoute = require('./routers/notification')

const app = express()

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'", "data:", "https:"]
        }
    },
    crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Cookie parser
app.use(cookieParser())

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// View engine
app.set('view engine', 'ejs')

// Request logging
app.use(logRequest)

// Rate limiting
app.use(generalLimiter)

// Routes with specific rate limiting
app.use('/login', authLimiter)
app.use('/signup', authLimiter)
app.use('/post', uploadLimiter)
app.use('/comment', commentLimiter)

// File upload error handling
app.use(handleUploadError)

// Routes
app.use(SignInRroute)
app.use(LoginRroute)
app.use(profileRroute)
app.use(HomeRroute)
app.use(PostRroute)
app.use(NotificationRoute)

// Basic routes
app.get('/SignIn', (req, res) => {
    res.render("Sgin")
})

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await checkDatabaseHealth()
        const uptime = process.uptime()
        const memoryUsage = process.memoryUsage()
        
        res.status(200).json({
            status: 'OK',
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
            database: dbHealth,
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
            },
            environment: config.NODE_ENV
        })
    } catch (error) {
        logger.error('Health check failed:', error)
        res.status(500).json({
            status: 'ERROR',
            message: 'Health check failed',
            error: error.message
        })
    }
})

// API documentation endpoint
app.get('/api/docs', (req, res) => {
    res.json({
        message: 'SocialFold API Documentation',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /signup': 'Register new user',
                'POST /login': 'User login',
                'GET /logout': 'User logout'
            },
            posts: {
                'GET /': 'Get home feed',
                'POST /post': 'Create new post',
                'POST /like/:postId': 'Like/unlike post',
                'GET /comments/:postId': 'Get post comments',
                'POST /comment/:postId': 'Add comment'
            },
            profile: {
                'GET /profile/:username': 'Get user profile',
                'POST /profile/update': 'Update profile',
                'POST /profile/photo': 'Upload profile photo',
                'POST /follow/:userId': 'Follow/unfollow user'
            },
            notifications: {
                'GET /notifications': 'Get user notifications',
                'GET /notifications/unread-count': 'Get unread count',
                'POST /notifications/:id/read': 'Mark as read'
            }
        }
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method
    })
})

// Global error handler
app.use(errorHandler)

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully')
    process.exit(0)
})

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully')
    process.exit(0)
})

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
    process.exit(1)
})

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectWithMonitoring(config.MONGODB_URI)
        
        // Start server
        app.listen(config.PORT, () => {
            logger.info(`Server is running on port ${config.PORT}`)
            logger.info(`Environment: ${config.NODE_ENV}`)
            logger.info(`Health check: http://localhost:${config.PORT}/health`)
            logger.info(`API docs: http://localhost:${config.PORT}/api/docs`)
        })
    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()