const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        unique: true
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true
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
        default: '/images/profile-photos/default.png'
    },
    private: {
        type: Boolean,
        default: true
    },
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    blogPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }]
})

module.exports = mongoose.model('User', UserSchema)