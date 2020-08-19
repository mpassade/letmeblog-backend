const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const router = require('./routes/routes')
require('dotenv').config()

const port = process.env.PORT

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())
// app.use((req, res, next) => {
//     res.locals.user = req.user
//     next()
// })
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