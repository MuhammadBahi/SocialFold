const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/DBConnect')
const SignInRroute = require('./routers/sign_In-route')
const LoginRroute = require('./routers/login')
const profileRroute = require('./routers/profile')
const cookieParser = require('cookie-parser')
const HomeRroute = require('./routers/home')
const PostRroute = require('./routers/post')
const NotificationRoute = require('./routers/notification')
const app = express()

// Environment variables
const PORT = process.env.PORT || 3000

app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())

app.use(cors())

// Routes
app.use(SignInRroute)
app.use(LoginRroute)
app.use(profileRroute)
app.use(HomeRroute)
app.use(PostRroute)
app.use(NotificationRoute)

app.get('/SignIn',(req,res)=>{
    res.render("Sgin")
})

// Health check endpoint for deployment
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
            console.log(`Health check: http://localhost:${PORT}/health`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()