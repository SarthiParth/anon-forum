const { Thought } = require('../models/thought');

async function createThought(req, res, next) {
    if (!req.body.text) {
        const err = new Error('No text provided');
        err.status = 400;
        err.name = 'MissingRequiredPayload';
        return next(err);
    }
    try {
        const thought = await Thought.create({
            text: req.body.text,
            postedBy: req.user._id,
            anonymous: req.body.anonymous,
        });

        res.status(201).send({
            ok: true,
            message: 'Thought created successfully',
            thought,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { createThought };
