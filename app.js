const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const passport = require('passport')
const router = require('./routes/routes')
require('dotenv').config()
require('./lib/passport.js')

const port = process.env.PORT

app.use(morgan('dev'))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false}));
app.use(cors())
app.use(passport.initialize())
app.use('/', router)

mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected')
}).catch(err => {
    console.log(`MongoDB Error: ${err}`)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})