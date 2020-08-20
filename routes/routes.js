const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')

const {
    register, setPwd
} = require('./controllers/controller')
const {
    checkRegister, duplicateAccount, checkLogin, checkPwds,
    checkTemp, checkNewPwd
} = require('./middleware/middleware')

router.post(
    '/register',
    checkRegister,
    duplicateAccount,
    register
)
router.post(
    '/login',
    checkLogin,
    passport.authenticate('local-login', 
    )
    // }), (req, res) => {
    //     console.log(res)
    //     const token = jwt.sign({id: req.user.id}, 'jwt_secret')
    //     res.json({token: token})
    // }
)
router.put(
    '/set-password/:id',
    checkPwds,
    checkTemp,
    checkNewPwd,
    setPwd
)

module.exports = router