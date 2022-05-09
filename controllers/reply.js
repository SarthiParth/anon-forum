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

async function deleteReply(req, res, next) {
    try {
        const reply = await Reply.findById(req.params.replyId);
        if (!reply) {
            const err = new Error('No reply found with given id');
            err.status = 404;
            err.name = 'DocumentNotFound';
            return next(err);
        }
        if (String(reply.postedBy) !== String(req.user._id)) {
            const err = new Error('You can only delete your posted replies');
            err.status = 403;
            err.name = 'InsufficientPermissions';
            return next(err);
        }

        await Reply.deleteOne({
            _id: reply._id,
            postedBy: req.user._id,
        });

        res.status(200).send({
            ok: true,
            message: 'Reply deleted successfully',
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { createReply, deleteReply };
