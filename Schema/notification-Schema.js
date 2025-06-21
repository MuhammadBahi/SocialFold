const DB = require('../config/DBConnect')
const mongoose = require('mongoose')

const Notification_Schema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    type: {
        type: String,
        enum: ['follow', 'post', 'like', 'comment'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogPost"
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    read: {
        type: Boolean,
        default: false
    },
    time: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Notification_Schema 