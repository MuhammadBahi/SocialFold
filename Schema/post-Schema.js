const DB = require('../config/DBConnect')
const mongoose = require('mongoose')

const Post_Schema = mongoose.Schema({

    title:String,
    content:String,
    image:{
        type:String,
        default:null
    },
    media: {
        filename: String,
        path: String,
        type: {
            type: String,
            enum: ['image', 'video']
        }
    },
    time:{
        type:Date,
        default:Date.now()
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ],
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comments"
        }
    ],
    views:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ],
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Users"
        }
    ]
})

module.exports = Post_Schema