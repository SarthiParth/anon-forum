const express = require('express');

const cors = require('../utils/cors');

const { verifyUser } = require('../utils/auth');

const { signup, login, logout } = require('../controllers/auth');

// Initialise the authentication router
const authRouter = express.Router();

// Include the body parser to parse the body in json
authRouter.use(express.json());

// Enable CORS for all routes
authRouter.use(cors.corsWithOptions);

// Define all authentication routes
authRouter.route('/signup').post(signup);
authRouter.route('/login').post(login);
authRouter.route('/logout').post(verifyUser, logout);

module.exports = authRouter;
