const express = require('express')
const router = express.Router()
const passport = require('passport')


const {
    register, setPwd, login, chkTmpPwd, getUser, changePwd,
    editProfile
} = require('./controllers/controller')
const {
    checkRegister, duplicateAccount, checkLogin, checkPwds,
    checkTemp, checkNewPwd, checkPwds2, checkOld, checkEdit
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
router.put(
    '/edit-profile/:id',
    checkEdit,
    editProfile
)

module.exports = router