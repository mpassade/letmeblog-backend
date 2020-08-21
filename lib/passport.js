const passport = require('passport')
const passportJWT = require("passport-jwt")
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const User = require('../routes/models/userModel')

passport.use(
    'jwt',
    new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    (jwt_payload, done) => {
        User.findById(jwt_payload.id).then(user => {
            return done(null, user)
        }).catch(err => {
            return done(err, false, {
                message: 'Invalid Token'
            })
        })
    }
))