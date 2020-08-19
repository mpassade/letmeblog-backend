const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

module.exports = {
    checkRegister: (req, res, next) => {
        const { firstName, lastName, email, username } = req.body
        if (!firstName || !lastName || !email || !username){
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
    }
}