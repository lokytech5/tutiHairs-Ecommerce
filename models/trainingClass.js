const mongoose = require('mongoose');

const trainingClass = mongoose.model('TrainingClass', new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassTypePrice',
        required: true,
    },
    maxParticipants: {
        type: Number,
        required: true,
    },
    maxRegistrations: {
        type: Number,
        required: true,
    },
    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            registrationDate: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}));

module.exports = trainingClass;