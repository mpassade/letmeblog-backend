const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

module.exports = {
    checkRegister: (req, res, next) => {
        const { fname, lname, email, username } = req.body
        if (!fname || !lname || !email || !username){
            return res.json({
                type: 'error',
                text: 'All fields are required'
            })
        }
        next()
    },

    duplicateAccount: (req, res, next) => {
        User.findOne({email: req.body.email}).then(user => {
            if(user){
                return res.json({
                    type: 'error',
                    text: 'An account with that email address already exists'
                })
            }
            User.findOne({username: req.body.username}).then(user1 => {
                if(user1){
                    return res.json({
                        type: 'error',
                        text: 'An account with that username already exists'
                    })
                }
                next()
            }).catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    checkLogin: (req, res, next) => {
        const {username, password} = req.body
        if (!username || !password){
            return res.json({
                type: 'error',
                text: 'All fields are required'
            })
        }
        User.findOne({username}).then(user => {
            if (!user){
                return res.json({
                    type: 'error',
                    text: 'An account with that username does not exist'
                })
            }
            if (user.tempPassword===true){
                return res.json({
                    type: 'error',
                    text: "You're using a temp password. Please follow the link in the email and set a new password."
                })
            }
            bcrypt.compare(password, user.password)
            .then((result) => {
                if (!result) {
                    console.log('err 3')
                    return done(null, false, {message: 'Check email and password'})
                }
            }).catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
        next()
    },

    checkPwds: (req, res, next) => {
        const { tempPass, newPass, confirmNew } = req.body
        if (!tempPass || !newPass || !confirmNew){
            return res.json({
                type: 'error',
                text: 'All fields are required'
            })
        }
        next()
    },

    checkTemp: (req, res, next) => {
        User.findOne({_id: req.params.id})
        .then(user => {
            bcrypt.compare(req.body.tempPass, user.password)
            .then(result => {
                if (result){
                    return next()
                }
                return res.json({
                    type: 'error',
                    text: 'Invalid Temporary Password'
                })
            }).catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    checkNewPwd: (req, res, next) => {
        const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/
        if (req.body.newPass !== req.body.confirmNew){
            return res.json({
                type: 'error',
                text: "New passwords don't match"
            })
        }
        if (!regex.test(req.body.newPass) ||
            req.body.newPass.length<8 ||
            req.body.newPass.length>32){
                return res.json({
                    type: 'error',
                    text: 'Password must be between 8 and 32 characters long. It must contain at least 1 lowercase letter, 1 uppercase letter, and 1 number.'
                })
        }
        next()
    },
}