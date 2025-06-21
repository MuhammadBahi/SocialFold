const user = require('../modules/user')
const bcrypt = require('bcrypt')

module.exports.register =  async function (req,res){
    let {name,username,email,password} = req.body

    const salt = await bcrypt.genSalt(7) 
    const newpassword = await bcrypt.hash(password,salt)
    
    await user.create({
        name,
        username,
        email,
        password:newpassword,
    })
    res.redirect('/')
}

