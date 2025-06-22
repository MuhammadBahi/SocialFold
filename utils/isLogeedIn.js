const jwt = require('jsonwebtoken')
const User = require('../modules/user')
const config = require('./config')

async function isLogedIn(req, res, next) {
    try {
        if (!req.cookies.token || req.cookies.token === "") {
            return res.redirect('/login')
        }
        
        const decoded = jwt.verify(req.cookies.token, config.JWT_SECRET)
        
        // Verify user still exists in database
        const user = await User.findById(decoded._id).select('-password')
        if (!user) {
            res.cookie('token', "", { 
                expires: new Date(0),
                httpOnly: true,
                secure: config.NODE_ENV === 'production'
            })
            return res.redirect('/login')
        }
        
        req.user = user
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        
        // Clear invalid token
        res.cookie('token', "", { 
            expires: new Date(0),
            httpOnly: true,
            secure: config.NODE_ENV === 'production'
        })
        
        return res.redirect('/login')
    }
}

module.exports = isLogedIn