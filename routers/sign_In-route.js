const express = require('express')
const route = express.Router()


const {register} = require('../controllers/sigin_In_controolers')

route.post('/register',register)

module.exports = route