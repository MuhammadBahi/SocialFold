module.exports.login = (req,res)=>{
    if(req.cookies.token){
        try{
            const data = jwt.verify(req.cookies.token,'shhh')
            res.redirect('/')
        }catch(err){
            res.render('login')
        }
    }
    res.render('login')
}