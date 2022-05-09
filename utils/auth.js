const passport = require('passport');
const jwt = require('jsonwebtoken');

// Define all the authentication strategies
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const config = require('../config/base');

const { User } = require('../models/user');
const { InsufficientPermissions } = require('./errors');

// Implementation of the local passport strategy
passport.use(new LocalStrategy(User.authenticate()));

// Register the serializers for passport to be able to
// access the user attributes while authentication
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

// Implementation of the jsonwebtoken based passport strategy
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.secretKey,
        },
        (jwtPayload, done) => {
            User.findOne({ _id: jwtPayload._id }, (err, user) => {
                if (err) {
                    console.error(err);
                    return done(err, false);
                }
                if (user && user.accessToken) {
                    return done(null, user);
                }
                return done(null, false);
            });
        }
    )
);

// Create a signed jwt with the payload using the app's secret key
exports.getToken = (payload, expiry) =>
    jwt.sign(payload, config.secretKey, {
        expiresIn: expiry || 24 * 60 * 60,
    });

// Middleware implementation to verify a user based on JWT token, disables
// session handling
exports.verifyUser = passport.authenticate('jwt', { session: false });

// Middleware implementation to force only user themselves can access the resource
exports.verifyRequestUserAuthorization = (req, res, next) => {
    if (String(req.user._id) === String(req.params.userId)) {
        next();
    } else {
        next(InsufficientPermissions);
    }
};
