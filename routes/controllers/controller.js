const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
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
    }
}