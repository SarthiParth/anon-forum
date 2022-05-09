const createError = require('http-errors');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const passport = require('passport');

// Import all the internal routers from the app

// Initialise the express application
const app = express();

// Setting up the base middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use morgan logging for requests and responses
// Use predefined 'dev' format for local development and custom string for deployments
if (process.env.NODE_ENV) {
    app.use(
        morgan(
            ':remote-addr - :date[clf] - :method :url :status - :response-time ms'
        )
    );
} else {
    app.use(morgan('dev'));
}

// Disable "x-powered-by" from response header
app.disable('x-powered-by');

// Passport middleware initialization. It also sets up the user
// serializers and deserializers which will be enable app to
// access user attributes while authentication
app.use(passport.initialize());

// Setup up the router for unregistered users (signup/login/logout)

// Setup routers for endpoints backed by authentication systems

// Middleware to server the static files from public
// directory
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'dev' ? err : {};

    res.status(err.status || 500).send({
        ok: false,
        error: err.name || 'Internal Server Error',
        message:
            err.message || 'Something went wrong, please retry in a while!',
    });
});

module.exports = app;
