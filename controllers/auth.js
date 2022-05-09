const passport = require('passport');

const { User } = require('../models/user');

const { getToken } = require('../utils/auth');

async function signup(req, res, next) {
    const user = new User({
        fullName: req.body.fullName,
        username: req.body.username,
    });
    try {
        const userAccount = await User.register(user, req.body.password);
        const token = getToken({ _id: userAccount._id });
        userAccount.accessToken = token;
        await userAccount.save();

        res.status(201).send({
            ok: true,
            message: 'Signup successful',
            user: userAccount.toProfileJSON(),
        });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    // eslint-disable-next-line no-unused-vars
    passport.authenticate('local', (error, user, info) => {
        if (error) {
            return next(error);
        }
        if (!user) {
            const err = new Error('Authentication failed');
            err.status = 403;
            err.name = 'AuthFailed';
            return next(err);
        }

        req.login(user, async (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }
            const token = getToken({
                _id: req.user._id,
            });
            try {
                const userDoc = await User.findById(req.user._id);

                userDoc.accessToken = token;
                userDoc.lastLogin = Date.now();
                await userDoc.save();

                res.status(200).send({
                    ok: true,
                    message: 'Login successful',
                    user: userDoc.toProfileJSON(),
                    token,
                });
            } catch (err) {
                next(err);
            }
        });
    })(req, res, next);
}

async function logout(req, res, next) {
    try {
        const user = await User.findById(req.user._id);
        user.accessToken = null;
        await user.save();

        res.status(200).send({
            ok: true,
            message: 'Logout successful',
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { signup, login, logout };
