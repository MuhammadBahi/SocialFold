const jwt = require('jsonwebtoken')
const users = require('../Schema/SignIn-Schema')

function isLogedIn(req,res,next) {
    if (req.cookies.token === "" || !req.cookies.token) return res.redirect('/login')
    else{
        let data = jwt.verify(req.cookies.token,'shhh')
        req.user = data
        
        
    }
   
    next()
}

module.exports = isLogedIn