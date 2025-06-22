const express = require('express')
const User = require('../modules/user')
const route = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const isLogedIn = require('../utils/isLogeedIn')
const { login } = require('../controllers/logincontrollers')

route.get('/login', login)
route.get('/logout', (req, res) => {
    res.cookie('token', "", { 
        expires: new Date(0),
        httpOnly: true,
        secure: config.NODE_ENV === 'production'
    })
    res.redirect('/login')
})

route.post('/log', async (req, res) => {
    try {
        let { email, password } = req.body
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            })
        }
        
        const logUser = await User.findOne({ email })
        if (!logUser) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            })
        }

        const passwordverified = await bcrypt.compare(password, logUser.password)

        if (!passwordverified) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            })
        }
        
        const token = jwt.sign(
            { _id: logUser._id, email: logUser.email },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        )
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: config.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        
        res.redirect('/')
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
})

module.exports = route