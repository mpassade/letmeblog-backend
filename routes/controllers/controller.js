const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer")
const nanoid = require('nanoid').nanoid

module.exports = {
    register: (req, res) => {
        const temp = nanoid()
        const newUser = new User()
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(temp, salt)

        newUser.firstName = req.body.fname
        newUser.lastName = req.body.lname
        newUser.email = req.body.email
        newUser.username = req.body.username
        newUser.password = hash

        newUser.save().then(user => {
            const main = async () => {
                let transporter = nodemailer.createTransport({
                    host: process.env.SMTP_URI,
                    port: process.env.SMTP_PORT,
                    secure: false,
                    auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_SECRET
                    }
                })
                let mailOptions = {
                    from: "Let Me Blog Team <letmeblog.team@gmail.com>",
                    to: req.body.email,
                    subject: "Welcome to Let Me Blog!",
                    text: `Hi ${req.body.fname},\nPlease click the following link and use the temporary password to set a new password and complete your registration.\nTemporary Password: ${temp}\nLink: http://localhost:3000/set-password/${user._id}`,
                    html: `<p>Hi ${req.body.fname},</p><p>Please click the below link and use the following temporary password to set a new password and complete your registration.</p><p>Temporary Password: ${temp}</p><a href='http://localhost:3000/set-password/${user._id}'>Complete Registration</a>`,
                }
                await transporter.sendMail(mailOptions)
            }
            main().then(() => {
                return res.json({
                    type: 'success',
                    text: 'An email from letmeblog.team@gmail.com was just sent to you. Please follow its directions to complete your registration.'
                })
            })
            .catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    setPwd: (req, res) => {
        User.findOne({_id: req.params.id})
        .then(user => {
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(req.body.newPass, salt)
            user.password = hash
            user.tempPassword = false
            user.save().then(() => {
                return res.json({
                    type: 'success',
                    text: 'Password set! Please login below'
                })
            }).catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    login: (req, res) => {
        User.findOne({username: req.body.username}).then(user => {
            if (!user){
                return res.json({
                    type: 'error',
                    text: 'An account with that username does not exist'
                })
            }
            if (user.tempPassword===true){
                return res.json({
                    type: 'error',
                    text: "Please follow the link in the email and set a new password"
                })
            }
            bcrypt.compare(req.body.password, user.password)
            .then((result) => {
                if (!result) {
                    return res.json({
                        type: 'error',
                        text: 'Check email and password'
                    })
                }
                const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
                return res.json({token})
            }).catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    chkTmpPwd: (req, res) => {
        User.findById(req.params.id).then(user => {
            if (user.tempPassword){
                return res.json({tempPwd: true})
            }
            return res.json({tempPwd: false})
        }).catch(() => {
            return res.json({tempPwd: false})
        })
    },

    getUser: (req, res) => {
        if (!req.user){
            return res.json({isAuthenticated: false})
        }
        return res.json({user: {
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            bio: req.user.bio,
            picture: req.user.picture,
            blogPosts: req.user.blogPosts,
            follows: req.user.follows.length,
            followedBy: req.user.followedBy.length
        }})
    },

    changePwd: (req, res) => {
        User.findOne({username: req.params.username})
        .then(user => {
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(req.body.newPass, salt)
            user.password = hash
            user.save().then(() => {
                return res.json({
                    type: 'success',
                    text: 'Password changed!'
                })
            }).catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    }
}