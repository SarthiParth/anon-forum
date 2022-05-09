const { ObjectId } = require('mongoose').Types;
const { Thought } = require('../models/thought');
const { Reply } = require('../models/reply');

const {
    InsufficientPermissions,
    DocumentNotFound,
} = require('../utils/errors');

function generateAggPipeline(query, skip, limit, reqUserId) {
    const pipeline = [
        {
            $match: query,
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $lookup: {
                from: 'users',
                localField: 'postedBy',
                foreignField: '_id',
                pipeline: [{ $project: { fullName: 1, username: 1 } }],
                as: 'author',
            },
        },
        {
            $unwind: {
                path: '$author',
            },
        },
        {
            $addFields: {
                postedBy: {
                    $cond: [
                        {
                            $or: [
                                { $eq: ['$anonymous', false] },
                                {
                                    $eq: ['$author._id', reqUserId],
                                },
                            ],
                        },
                        '$author',
                        'anonymous',
                    ],
                },
            },
        },
        {
            $lookup: {
                from: 'replies',
                localField: '_id',
                foreignField: 'parent',
                as: 'allReplies',
            },
        },
        {
            $addFields: {
                totalReplies: { $size: '$allReplies' },
            },
        },
        {
            $project: {
                text: 1,
                anonymous: 1,
                createdAt: 1,
                postedBy: 1,
                totalReplies: 1,
            },
        },
        {
            $lookup: {
                from: 'replies',
                localField: '_id',
                foreignField: 'parent',
                pipeline: [
                    { $sort: { createdAt: 1 } },
                    { $limit: 2 },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'postedBy',
                            foreignField: '_id',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                    },
                                },
                            ],
                            as: 'author',
                        },
                    },
                    {
                        $unwind: {
                            path: '$author',
                        },
                    },
                    {
                        $addFields: {
                            postedBy: {
                                $cond: [
                                    {
                                        $or: [
                                            { $eq: ['$anonymous', false] },
                                            {
                                                $eq: ['$author._id', reqUserId],
                                            },
                                        ],
                                    },
                                    '$author',
                                    'anonymous',
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            text: 1,
                            anonymous: 1,
                            createdAt: 1,
                            postedBy: 1,
                        },
                    },
                ],
                as: 'firstTwoReplies',
            },
        },
    ];
    return pipeline;
}

async function getAllThoughts(req, res, next) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const pipeline = generateAggPipeline({}, skip, limit, req.user._id);

    try {
        const thoughts = await Thought.aggregate(pipeline);

        const totalThoughts = await Thought.countDocuments();

        res.status(200).send({
            ok: true,
            count: thoughts.length,
            thoughts,
            meta: {
                totalThoughts,
                totalPages: Math.ceil(totalThoughts / limit),
            },
        });
    } catch (err) {
        next(err);
    }
}

async function getIndividualThought(req, res, next) {
    try {
        let thought;
        const thoughtDoc = await Thought.findById(req.params.thoughtId);

        if (
            !thoughtDoc.anonymous ||
            String(thoughtDoc.postedBy) === String(req.user._id)
        ) {
            thought = await Thought.findById(req.params.thoughtId).populate({
                path: 'postedBy',
                select: 'fullName username',
            });
        } else {
            thought = { ...thoughtDoc._doc };
            thought.postedBy = 'anonymous';
        }

        const allReplies = await Reply.find({
            parent: req.params.thoughtId,
        }).populate({ path: 'postedBy', select: 'fullName username' });

        const replies = allReplies.map((reply) => {
            const replyCopy = { ...reply._doc };
            if (
                replyCopy.anonymous &&
                String(replyCopy.postedBy._id) !== String(req.user._id)
            ) {
                replyCopy.postedBy = 'anonymous';
            }
            return replyCopy;
        });

        res.status(200).send({
            ok: true,
            thought,
            replies,
        });
    } catch (err) {
        next(err);
    }
}

async function getUserThoughts(req, res, next) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.params.userId === String(req.user._id)) {
        query.postedBy = req.user._id;
    } else {
        query.postedBy = new ObjectId(req.params.userId);
        query.anonymous = false;
    }

    const pipeline = generateAggPipeline(query, skip, limit, req.user._id);
    try {
        const thoughts = await Thought.aggregate(pipeline);

        const totalThoughts = await Thought.countDocuments(query);

        res.status(200).send({
            ok: true,
            count: thoughts.length,
            thoughts,
            meta: {
                totalThoughts,
                totalPages: Math.ceil(totalThoughts / limit),
            },
        });
    } catch (err) {
        next(err);
    }
}

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
            return next(DocumentNotFound);
        }
        if (String(thought.postedBy) !== String(req.user._id)) {
            return next(InsufficientPermissions);
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

module.exports = {
    getAllThoughts,
    getIndividualThought,
    getUserThoughts,
    createThought,
    deleteThought,
};
