const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { config } = require('../config/config')
const saltRounds = 10;


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    username: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    avatar: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        default: null,
    },
    profile: {
        firstName: {
            type: String,
            minlength: 2,
            maxlength: 50
        },
        lastName: {
            type: String,
            minlength: 2,
            maxlength: 50
        },
        phone: {
            type: String,
            minlength: 10,
            maxlength: 15
        },
    },

    notificationPreferences: {
        emailNotifications: {
            type: Boolean,
            default: true,
        },
        pushNotifications: {
            type: Boolean,
            default: true,
        },

    },

    isAdmin: {
        type: Boolean,
        default: false,
    },
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.jwtPrivateKey, { expiresIn: config.jwtExpiresIn });
    return token;
}

userSchema.methods.hashPassword = async function () {
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
};

const User = mongoose.model('User', userSchema);

module.exports = User;