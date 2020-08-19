const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

module.exports = {
    checkRegister: (req, res, next) => {
        const { fname, lname, email, username } = req.body
        if (!fname || !lname || !email || !username){
            return res.json({
                error: ['All fields are required']
            })
        }
        next()
    },

    duplicateAccount: (req, res, next) => {
        User.findOne({email: req.body.email}).then(user => {
            if(user){
                return res.json({
                    error: ['An account with that email address already exists']
                })
            }
            User.findOne({username: req.body.username}).then(user1 => {
                if(user1){
                    return res.json({
                        error: ['An account with that username already exists']
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
                error: ['All fields are required']
            })
        }
        next()
    }
}