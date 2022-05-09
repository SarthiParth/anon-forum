const mongoose = require('mongoose');

const { Schema } = mongoose;

const ThoughtSchema = new Schema(
    {
        text: {
            type: String,
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

const Thought = mongoose.model('Thought', ThoughtSchema, 'thoughts');

module.exports = { Thought, ThoughtSchema };
