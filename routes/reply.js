const express = require('express');

const cors = require('../utils/cors');

const { verifyUser } = require('../utils/auth');

const { createReply, deleteReply } = require('../controllers/reply');

// Initialise the authentication router
const replyRouter = express.Router();

// Include the body parser to parse the body in json
replyRouter.use(express.json());

// Enable CORS for all routes
replyRouter.use(cors.corsWithOptions);

// Define all the routes for thoughts
replyRouter.route('/:thoughtId').post(verifyUser, createReply);
replyRouter.route('/:replyId').delete(verifyUser, deleteReply);

module.exports = replyRouter;
