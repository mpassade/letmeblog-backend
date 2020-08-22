const mongoose = require('mongoose')
const moment = require('moment')

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true
    },
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
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    timestamp: {
        type: String,
        default: () => moment().format('MMMM Do YYYY, h:mm:ss a')
    }
})

module.exports = mongoose.model('Blog', BlogSchema)