require('dotenv').config()

const config = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/SocialFold',
    
    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production',
    
    // File Upload Configuration
    UPLOAD_PATH: process.env.UPLOAD_PATH || './public/uploads',
    PROFILE_PHOTOS_PATH: process.env.PROFILE_PHOTOS_PATH || './public/profile-photos',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    
    // CORS Configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100, // requests per window
    
    // Password Configuration
    BCRYPT_SALT_ROUNDS: 12,
    
    // Email Configuration (for future use)
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    
    // Cloud Storage (for future use)
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    
    // Redis (for future use)
    REDIS_URL: process.env.REDIS_URL,
    
    // Validation
    MIN_PASSWORD_LENGTH: 8,
    MAX_USERNAME_LENGTH: 30,
    MIN_USERNAME_LENGTH: 3,
    MAX_POST_LENGTH: 1000,
    MAX_COMMENT_LENGTH: 500
}

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI']
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar] && config.NODE_ENV === 'production') {
        console.error(`Missing required environment variable: ${envVar}`)
        process.exit(1)
    }
})

module.exports = config 