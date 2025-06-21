const mongoose = require('mongoose')
const BlogPost = require('../Schema/post-Schema')

module.exports = mongoose.model("BlogPost",BlogPost)