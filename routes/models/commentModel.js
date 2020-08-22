const mongoose = require('mongoose')
const moment = require('moment')

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: {
        type: Number,
        default: 0
    },
    blogPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
    timestamp: {
        type: String,
        default: () => moment().format('MMMM Do YYYY, h:mm:ss a')
    }
})

module.exports = mongoose.model('Comment', CommentSchema)