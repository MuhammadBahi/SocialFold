const DB = require('../config/DBConnect')
const mongoose = require('mongoose')

const Comment_Schema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogPost",
        required: true
    },
    time: {
        type: Date,
        default: Date.now()
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }]
})

module.exports = Comment_Schema 