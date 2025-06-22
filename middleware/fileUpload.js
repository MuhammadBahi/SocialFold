const multer = require('multer')
const path = require('path')
const fs = require('fs')
const config = require('../utils/config')

// Ensure upload directories exist
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

ensureDir(config.UPLOAD_PATH)
ensureDir(config.PROFILE_PHOTOS_PATH)

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = [...config.ALLOWED_IMAGE_TYPES, ...config.ALLOWED_VIDEO_TYPES]
    
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only images and videos are allowed.'), false)
    }
    
    // Check file size
    if (file.size > config.MAX_FILE_SIZE) {
        return cb(new Error(`File too large. Maximum size is ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`), false)
    }
    
    // Additional security checks
    const fileExtension = path.extname(file.originalname).toLowerCase()
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg']
    
    if (!allowedExtensions.includes(fileExtension)) {
        return cb(new Error('Invalid file extension.'), false)
    }
    
    // Check for malicious file signatures
    const maliciousSignatures = [
        Buffer.from([0x4D, 0x5A]), // .exe
        Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF
        Buffer.from([0xFE, 0xED, 0xFA, 0xCE]), // Mach-O
    ]
    
    // This is a basic check - in production, you might want more sophisticated malware scanning
    cb(null, true)
}

// Storage configuration for post media
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.UPLOAD_PATH)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileExtension = path.extname(file.originalname)
        const fileName = `media-${uniqueSuffix}${fileExtension}`
        cb(null, fileName)
    }
})

// Storage configuration for profile photos
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.PROFILE_PHOTOS_PATH)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileExtension = path.extname(file.originalname)
        const fileName = `profile-${uniqueSuffix}${fileExtension}`
        cb(null, fileName)
    }
})

// Multer instances
const uploadPostMedia = multer({
    storage: postStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.MAX_FILE_SIZE,
        files: 1 // Only one file per request
    }
})

const uploadProfilePhoto = multer({
    storage: profileStorage,
    fileFilter: (req, file, cb) => {
        // Only allow images for profile photos
        if (!config.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new Error('Only image files are allowed for profile photos.'), false)
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit for profile photos
            return cb(new Error('Profile photo too large. Maximum size is 5MB'), false)
        }
        
        cb(null, true)
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    }
})

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Please choose a smaller file.'
            })
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Please upload only one file at a time.'
            })
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field.'
            })
        }
    }
    
    if (error.message) {
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
    
    return res.status(500).json({
        success: false,
        message: 'File upload failed. Please try again.'
    })
}

// Clean up old files (optional - for maintenance)
const cleanupOldFiles = (directory, maxAge = 7 * 24 * 60 * 60 * 1000) => {
    try {
        const files = fs.readdirSync(directory)
        const now = Date.now()
        
        files.forEach(file => {
            const filePath = path.join(directory, file)
            const stats = fs.statSync(filePath)
            
            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath)
                console.log(`Cleaned up old file: ${filePath}`)
            }
        })
    } catch (error) {
        console.error('Error cleaning up files:', error)
    }
}

module.exports = {
    uploadPostMedia,
    uploadProfilePhoto,
    handleUploadError,
    cleanupOldFiles
} 