const express = require('express')
const router = express.Router()

const {
    register
} = require('./controllers/controller')
const {
    checkRegister, duplicateAccount, checkLogin
} = require('./middleware/middleware')

router.post(
    '/register',
    checkRegister,
    duplicateAccount,
    register
)
router.post(
    '/login',
    checkLogin
)

module.exports = router