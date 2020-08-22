const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        max: 32
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        max: 32
    },
    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        unique: true,
        max: 32
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        max: 16
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 32
    },
    verificationCode: {
        type: String,
        default: ''
    },
    tempPassword: {
        type: Boolean,
        default: true
    },
    bio: {
        type: String,
        trim: true
    },
    picture: {
        type: String,
        default: '/images/profile-pics/default.png'
    },
    blogPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]
})

module.exports = mongoose.model('User', UserSchema)