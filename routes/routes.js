const express = require('express')
const router = express.Router()

const {
    register
} = require('./controllers/controller')
const {
    checkRegister, duplicateAccount
} = require('./middleware/middleware')

router.post(
    '/register',
    checkRegister,
    duplicateAccount,
    register
)

module.exports = router