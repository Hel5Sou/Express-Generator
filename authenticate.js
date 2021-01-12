const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt; // here are many methods for authentication flow
const jwt = require('jsonwebtoken'); //for create, sign, and verify tokens

const config = require('./config'); //the freshly created config


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 }); //this is creating token for 1 hour 
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //sent from client as a authorization Header and as a Bearer Token
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use( //check the documentation for the jwtPassport
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload', jwt_payload);
            User.findOne({ _id: jwt_payload._id }, (err, user) => { //error callback
                if (err) {
                    return done(err, false); //no user found + done function is written in the passport 
                } else if (user) { //done callback, null = no error
                    return done(null, user);
                } else {
                    return done(null, false); //no error and no user was found
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', { session: false }); //we are not using sessions but tokens