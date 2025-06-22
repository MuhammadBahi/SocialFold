const User = require('../modules/user')
const bcrypt = require('bcrypt')
const config = require('../utils/config')

module.exports.register = async function (req, res) {
    try {
        let { name, username, email, password } = req.body

        // Basic validation
        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        })
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            })
        }

        const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS)
        const newpassword = await bcrypt.hash(password, salt)
        
        await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: newpassword,
        })
        
        res.redirect('/login')
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        })
    }
}

