const express = require('express')
const User = require('../modules/user')
const route = express.Router()
const cors = require('cors');
const cookieParser = require('cookie-parser');
const isLogedIn = require('../utils/isLogeedIn')
const {home} = require('../controllers/homecontrollers')

// app.use(cookieParser());
route.use(express.json());
route.use(express.urlencoded({extended:true}))

route.use(cookieParser())
route.get('/',isLogedIn,home)



module.exports = route