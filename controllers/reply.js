const { Reply } = require('../models/reply');
const { Thought } = require('../models/thought');

async function createReply(req, res, next) {
    try {
        const thought = await Thought.findById(req.params.thoughtId);
        if (!thought) {
            const err = new Error('No thought found with given id');
            err.status = 404;
            err.name = 'DocumentNotFound';
            return next(err);
        }

        const reply = await Reply.create({
            text: req.body.text,
            parent: thought._id,
            postedBy: req.user._id,
            anonymous: req.body.anonymous,
        });

        res.status(201).send({
            ok: true,
            message: 'Reply created successfully',
            reply,
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { createReply };
