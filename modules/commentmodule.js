const mongoose = require('mongoose')
const CommentSchema = require('../Schema/comment-Schema')

module.exports = mongoose.model("Comment", CommentSchema) 