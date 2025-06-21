const mongoose = require('mongoose')
const user = require('../Schema/SignIn-Schema')

module.exports = mongoose.model("Users",user)