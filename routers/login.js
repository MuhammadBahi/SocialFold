const express = require('express')
const User = require('../modules/user')
const route = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const  isLogedIn  = require('../utils/isLogeedIn')
const {login} = require('../controllers/logincontrollers')

route.get('/login',login)
route.get('/logout', (req,res)=>{
    res.cookie('token',"")
    res.redirect('/login')
})

route.post('/log', async(req,res)=>{
    let {email,password} = req.body
    const logUser = await User.findOne({email})
    if (!logUser) return res.send('not fonted')

    const passwordverified = await bcrypt.compare(password,logUser.password)

    if (!passwordverified) return res.send('password are wrong')
    
    const token = jwt.sign({_id:logUser._id,email:logUser.email},'shhh')
    
    res.cookie("token",token)
    res.redirect('/')
})

module.exports = route