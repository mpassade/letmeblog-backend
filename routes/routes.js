const express = require('express')
const router = express.Router()
const passport = require('passport')


const {
    register, setPwd, login, chkTmpPwd, getUser, changePwd,
    editProfile, verify, uploadPhoto, post, getUserBlog, search,
    follow, unfollow, getOther, home, searchAll
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
router.get(
    '/user-blog',
    passport.authenticate('jwt', {
        session: false
    }), 
    getUserBlog
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
router.put(
    '/verify-email/:id/:code/:email',
    verify
)
router.post(
    '/upload/:id',
    uploadPhoto
)
router.post(
    '/create-post/:id',
    post
)
router.get(
    '/search/:value',
    search
)
router.put(
    '/follow/:id/:id2',
    follow
)
router.put(
    '/unfollow/:id/:id2',
    unfollow
)
router.get(
    '/other-user-blog/:username',
    getOther
)
router.get(
    '/other-auth/:username',
    passport.authenticate('jwt', {
        session: false
    }), 
    getOther
)
router.get(
    '/home',
    passport.authenticate('jwt', {
        session: false
    }), 
    home
)
router.get(
    '/search-all',
    searchAll
)

module.exports = router