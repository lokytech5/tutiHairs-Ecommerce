const mongoose = require('mongoose');

const verifiedPhoneNumber = mongoose.model('verifiedPhoneNumber', new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true // Each phone number should only appear once in this collection
    },
    verifiedAt: {
        type: Date,
        default: Date.now
    }
}));

module.exports = verifiedPhoneNumber;