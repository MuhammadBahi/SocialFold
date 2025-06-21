const DB = require('../config/DBConnect')
const mongoose = require('mongoose')

const Sigin_User = mongoose.Schema({
    name:String,
    username:String,
    email:String,
    password:String,
    image:{
        type:String,
        default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
    },
    time:{
        type:Date,
        default:Date.now()
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ],
    blogposts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"BlogPost"
        }
    ]
})

module.exports = Sigin_User