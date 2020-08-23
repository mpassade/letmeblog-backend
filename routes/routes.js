const express = require('express')
const router = express.Router()
const passport = require('passport')


const {
    register, setPwd, login, chkTmpPwd, getUser, changePwd
} = require('./controllers/controller')
const {
    checkRegister, duplicateAccount, checkLogin, checkPwds,
    checkTemp, checkNewPwd, checkPwds2, checkOld
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
    login
)
router.put(
    '/set-password/:id',
    checkPwds,
    checkTemp,
    checkNewPwd,
    setPwd
)
router.get('/check-temp-pwd/:id', chkTmpPwd)
router.get(
    '/user',
    passport.authenticate('jwt', {
        session: false
    }), 
    getUser
)
router.put(
    '/change-password/:username',
    checkPwds2,
    checkOld,
    checkNewPwd,
    changePwd
)

module.exports = router