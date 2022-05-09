const { Reply } = require('../models/reply');
const { Thought } = require('../models/thought');
const {
    InsufficientPermissions,
    DocumentNotFound,
} = require('../utils/errors');

async function createReply(req, res, next) {
    try {
        const thought = await Thought.findById(req.params.thoughtId);
        if (!thought) {
            return next(DocumentNotFound);
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
            return next(DocumentNotFound);
        }
        if (String(reply.postedBy) !== String(req.user._id)) {
            return next(InsufficientPermissions);
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
