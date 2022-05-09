const mongoose = require('mongoose');

const { Schema } = mongoose;

const ReplySchema = new Schema(
    {
        text: {
            type: String,
            required: true,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: 'Thought',
            required: true,
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        anonymous: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Reply = mongoose.model('Reply', ReplySchema, 'replies');

module.exports = { Reply, ReplySchema };
