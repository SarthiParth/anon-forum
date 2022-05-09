const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: 30,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            minLength: 3,
            maxLength: 10,
        },
        accessToken: String,
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.plugin(passportLocalMongoose, {
    lastLoginField: 'lastLogin',
});

// Defining a static method on User schema
// eslint-disable-next-line func-names
UserSchema.methods.toProfileJSON = function () {
    return {
        fullName: this.fullName,
        username: this.username,
        _id: this._id,
    };
};

const User = mongoose.model('User', UserSchema, 'users');

module.exports = { User, UserSchema };
