const express = require('express');

const cors = require('../utils/cors');

const { verifyUser } = require('../utils/auth');

const {
    getAllThoughts,
    getIndividualThought,
    getUserThoughts,
    createThought,
    deleteThought,
} = require('../controllers/thought');

// Initialise the authentication router
const thoughtRouter = express.Router();

// Include the body parser to parse the body in json
thoughtRouter.use(express.json());

// Enable CORS for all routes
thoughtRouter.use(cors.corsWithOptions);

// Define all the routes for thoughts
thoughtRouter
    .route('/')
    .get(verifyUser, getAllThoughts)
    .post(verifyUser, createThought);

thoughtRouter
    .route('/:thoughtId')
    .get(verifyUser, getIndividualThought)
    .delete(verifyUser, deleteThought);

thoughtRouter.route('/user/:userId').get(verifyUser, getUserThoughts);

module.exports = thoughtRouter;
