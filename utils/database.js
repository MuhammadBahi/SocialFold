const mongoose = require('mongoose')
const { logDatabaseQuery } = require('./logger')

// Database indexes for better performance
const createIndexes = async () => {
    try {
        // User indexes
        await mongoose.model('Users').createIndexes([
            { username: 1 }, // Unique username lookup
            { email: 1 }, // Unique email lookup
            { createdAt: -1 }, // Recent users
            { followers: 1 }, // Followers count queries
            { following: 1 } // Following count queries
        ])
        
        // Post indexes
        await mongoose.model('BlogPost').createIndexes([
            { users: 1 }, // User's posts
            { createdAt: -1 }, // Recent posts
            { likes: 1 }, // Posts by likes
            { title: 'text', content: 'text' }, // Text search
            { 'users.username': 1 } // Posts by username
        ])
        
        // Comment indexes
        await mongoose.model('Comments').createIndexes([
            { post: 1 }, // Comments for a post
            { user: 1 }, // User's comments
            { createdAt: -1 }, // Recent comments
            { likes: 1 } // Comments by likes
        ])
        
        // Notification indexes
        await mongoose.model('Notifications').createIndexes([
            { recipient: 1 }, // User's notifications
            { read: 1 }, // Unread notifications
            { createdAt: -1 }, // Recent notifications
            { type: 1 } // Notifications by type
        ])
        
        console.log('Database indexes created successfully')
    } catch (error) {
        console.error('Error creating indexes:', error)
    }
}

// Database connection with monitoring
const connectWithMonitoring = async (uri) => {
    const startTime = Date.now()
    
    try {
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false
        })
        
        const duration = Date.now() - startTime
        logDatabaseQuery('connect', 'database', duration, true)
        
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        
        // Create indexes after connection
        await createIndexes()
        
        // Monitor database events
        mongoose.connection.on('error', (error) => {
            logDatabaseQuery('error', 'database', 0, false)
            console.error('MongoDB connection error:', error)
        })
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected')
        })
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected')
        })
        
        return conn
    } catch (error) {
        const duration = Date.now() - startTime
        logDatabaseQuery('connect', 'database', duration, false)
        throw error
    }
}

// Query performance monitoring
const monitorQuery = (operation, collection) => {
    return async (query) => {
        const startTime = Date.now()
        try {
            const result = await query
            const duration = Date.now() - startTime
            logDatabaseQuery(operation, collection, duration, true)
            return result
        } catch (error) {
            const duration = Date.now() - startTime
            logDatabaseQuery(operation, collection, duration, false)
            throw error
        }
    }
}

// Database health check
const checkDatabaseHealth = async () => {
    try {
        const startTime = Date.now()
        await mongoose.connection.db.admin().ping()
        const duration = Date.now() - startTime
        
        return {
            status: 'healthy',
            responseTime: duration,
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        }
    }
}

// Database statistics
const getDatabaseStats = async () => {
    try {
        const stats = await mongoose.connection.db.stats()
        return {
            collections: stats.collections,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize
        }
    } catch (error) {
        console.error('Error getting database stats:', error)
        return null
    }
}

// Clean up old data (maintenance)
const cleanupOldData = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        
        // Clean up old notifications (older than 30 days)
        const deletedNotifications = await mongoose.model('Notifications').deleteMany({
            createdAt: { $lt: thirtyDaysAgo },
            read: true
        })
        
        // Clean up old logs (if any)
        // This would depend on your logging strategy
        
        console.log(`Cleaned up ${deletedNotifications.deletedCount} old notifications`)
        
        return {
            notificationsDeleted: deletedNotifications.deletedCount,
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        console.error('Error cleaning up old data:', error)
        throw error
    }
}

module.exports = {
    connectWithMonitoring,
    monitorQuery,
    checkDatabaseHealth,
    getDatabaseStats,
    cleanupOldData,
    createIndexes
} 