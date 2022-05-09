const { Thought } = require('../models/thought');
const { Reply } = require('../models/reply');

async function createThought(req, res, next) {
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

async function deleteThought(req, res, next) {
    try {
        const thought = await Thought.findById(req.params.thoughtId);
        if (!thought) {
            const err = new Error('No thought found with given id');
            err.status = 404;
            err.name = 'DocumentNotFound';
            return next(err);
        }
        if (String(thought.postedBy) !== String(req.user._id)) {
            const err = new Error('You can only delete your posted thoughts');
            err.status = 403;
            err.name = 'InsufficientPermissions';
            return next(err);
        }

        await Thought.deleteOne({
            _id: thought._id,
            postedBy: req.user._id,
        });
        await Reply.deleteMany({
            parent: thought._id,
        });

        res.status(200).send({
            ok: true,
            message: 'Thought and its replies deleted successfully',
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { createThought, deleteThought };
