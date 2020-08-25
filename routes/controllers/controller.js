const User = require('../models/userModel')
const Blog = require('../models/blogModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer")
const multer = require('multer')
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
            id: req.user._id,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            bio: req.user.bio,
            picture: req.user.picture,
            blogPosts: req.user.blogPosts,
            follows: req.user.follows,
            followedBy: req.user.followedBy.length,
            privacy: req.user.private ? 'private' : 'public'
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
    },

    editProfile: (req, res) => {
        const { fname, lname, email, username, privacy, bio } = req.body
        User.findOne({_id: req.params.id})
        .then(user => {
            user.firstName = fname
            user.lastName = lname
            user.username = username
            user.bio = bio
            user.private = privacy==='private'
            if (user.email!==email){
                const code = nanoid()
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
                        to: email,
                        subject: "Email Verification",
                        text: `Hi ${fname},\nPlease go to the below link to verify your new email address.\nhttp://localhost:3000/verify-email/${user._id}/${code}/${email}`,
                        html: `<p>Hi ${fname},</p><p>Please click the below link to verify your new email address.</p><a href="http://localhost:3000/verify-email/${user._id}/${code}/${email}">Verify Email</a>`,
                    }
                    await transporter.sendMail(mailOptions)
                }
                main().catch(err => {
                    console.log(`Server Error: ${err}`)
                })
                user.verificationCode = code
            }
            user.save().then(savedUser => {
                if (savedUser.email!==email){
                    return res.json({
                        user: {
                            id: savedUser._id,
                            username: savedUser.username,
                            firstName: savedUser.firstName,
                            lastName: savedUser.lastName,
                            email: savedUser.email,
                            bio: savedUser.bio,
                            picture: savedUser.picture,
                            blogPosts: savedUser.blogPosts,
                            follows: savedUser.follows.length,
                            followedBy: savedUser.followedBy.length,
                            privacy: savedUser.private ? 'private' : 'public'
                        },
                        message: {
                            type: 'success',
                            text: 'An email from letmeblog.team@gmail.com was just sent to you. Please click the link in it to verify your new email address.'
                        }
                    })
                } else {
                    return res.json({
                        user: {
                            id: savedUser._id,
                            username: savedUser.username,
                            firstName: savedUser.firstName,
                            lastName: savedUser.lastName,
                            email: savedUser.email,
                            bio: savedUser.bio,
                            picture: savedUser.picture,
                            blogPosts: savedUser.blogPosts,
                            follows: savedUser.follows.length,
                            followedBy: savedUser.followedBy.length,
                            privacy: savedUser.private ? 'private' : 'public'
                        },
                        message: {
                            type: 'success',
                            text: 'Profile Updated!'
                        }
                    })
                }
            }).catch(err => {
                console.log(`Server Error: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    verify: (req, res) => {
        User.findById(req.params.id).then(user => {
            if (user){
                if (user.verificationCode===req.params.code){
                    user.email = req.params.email
                    user.verificationCode = ''
                    user.save().then(savedUser => {
                        return res.json({
                            type: 'success',
                            text: 'Email Changed!'
                        })
                    })
                } else {
                    return res.json({
                        message: 'User not found'
                    })
                }
            } else {
                return res.json({
                    message: 'User not found'
                })
            }
        }).catch(() => {
            return res.json({
                message: 'User not found'
            })
        })
    },

    uploadPhoto: (req, res) => {
        User.findById(req.params.id).then(user => {
            const storage = multer.diskStorage({
                destination: (request, file, cb) => {
                    cb(null, '../letmeblog-frontend/public/images/profile-photos/')
                },
                filename: (request, file, cb) => {
                    cb(null, Date.now() + '.' + file.mimetype.slice(6) )
                }
            })
            const upload = multer({ storage: storage }).single('file')
            upload(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    return console.log(err)
                } else if (err) {
                    return console.log(err)
                }
                user.picture = '/images/profile-photos/' + req.file.filename
                user.save().then(savedUser => {
                    res.json({
                        user: {
                            picture: savedUser.picture
                        },
                        message: {
                            type: 'success',
                            text: 'Photo Changed!'
                        }
                    })
                })
            })
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    post: (req, res) => {
        const {title, blog} = req.body
        if (!title || !blog){
            return res.json({
                type: 'error',
                text: 'All fields are required'
            })
        }
        User.findById(req.params.id).then(user => {
            const blogPost = new Blog()
            blogPost.title = title
            blogPost.content = blog
            blogPost.author = user._id
            blogPost.save().then(posted => {
                user.blogPosts.unshift(posted._id)
                user.save().then(() => {
                    return res.json({type: 'success'})
                }).catch(err => {
                    console.log(`Server Error1: ${err}`)
                })
            }).catch(err => {
                console.log(`Server Error2: ${err}`)
            })
        }).catch(err => {
            console.log(`Server Error3: ${err}`)
        })
    },

    getUserBlog: (req, res) => {
        if (!req.user){
            return res.json({isAuthenticated: false})
        }
        const user = {
            id: req.user._id,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            bio: req.user.bio,
            picture: req.user.picture,
            blogPosts: req.user.blogPosts,
            follows: req.user.follows.length,
            followedBy: req.user.followedBy.length,
            privacy: req.user.private ? 'private' : 'public'
        }
        Blog.find({author: req.user._id}).then(blogs => {
                return res.json({
                    user,
                    blogs: blogs.reverse()
                })
            
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    search: (req, res) => {
        User.find({username: {$regex: req.params.value, $options: 'i'}})
        .then(users => {
            return res.json({users})
        }).catch(err => {
            console.log(`Server Error: ${err}`)
        })
    },

    follow: (req, res) => {
        User.findById(req.params.id).then(user => {
            User.findById(req.params.id2).then(user2 => {
                user.follows.push(user2._id)
                user.save().then(savedUser => {
                    user2.followedBy.push(savedUser._id)
                    user2.save().then(() => {
                        return res.json({
                            user: {
                                id: savedUser._id,
                                username: savedUser.username,
                                firstName: savedUser.firstName,
                                lastName: savedUser.lastName,
                                email: savedUser.email,
                                bio: savedUser.bio,
                                picture: savedUser.picture,
                                blogPosts: savedUser.blogPosts,
                                follows: savedUser.follows,
                                followedBy: savedUser.followedBy.length,
                                privacy: savedUser.private ? 'private' : 'public'
                            }
                        })
                    }).catch(err => {
                        console.log(`Server Error1: ${err}`)
                    })
                }).catch(err => {
                    console.log(`Server Error2: ${err}`)
                })
            }).catch(err => {
            console.log(`Server Error3: ${err}`)
        })
        }).catch(err => {
            console.log(`Server Error4: ${err}`)
        })
    },

    unfollow: (req, res) => {
        User.findOneAndUpdate({_id: req.params.id}, {$pullAll: {follows: [req.params.id2]}}, {new: true})
        .then(user => {
            User.findOneAndUpdate({_id: req.params.id2}, {$pullAll: {followedBy: [req.params.id]}})
            .then(() => {
                return res.json({
                    user: {
                        id: user._id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        bio: user.bio,
                        picture: user.picture,
                        blogPosts: user.blogPosts,
                        follows: user.follows,
                        followedBy: user.followedBy.length,
                        privacy: user.private ? 'private' : 'public'
                    }
                })
            }).catch(err => {
                console.log(`Server Error1: ${err}`)
            })
        }).catch(err => {
        console.log(`Server Error2: ${err}`)
        })
    }
}