const passport = require('passport')
const passportJWT = require("passport-jwt")
const LocalStrategy = require('passport-local').Strategy
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const User = require('../routes/models/userModel')

passport.use(
    'local-login',
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, username, password, done) => {
            User.findOne({username}, (err, user) => {
                if (err){ 
                    return done(err, null) 
                }
                if (!user){
                    return done(null, false, {message: 'An account with that username does not exist'})
                }
                if (user.tempPassword===true){
                    return done(null, false, {message: 'Please follow the link in the email and set a new password'})
                }
                bcrypt.compare(password, user.password)
                .then((result) => {
                    if (!result) {
                        return done(null, false, {message: 'Check email and password'})
                    } else {
                        return done(null, user)
                    }
                }).catch((error) => {
                    return done(error, null);
                })
            })
        }
    )
)

passport.use(new JWTStrategy({
	jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
	secretOrKey: 'jwt_secret'
}, (jwt_payload, done) => {
	User.findById(jwt_payload.id).then(user => {
		return done(null, user)
	}).catch(err => {
		return done(err, false, {
			message: 'Token not matched.'
		})
	})
}))