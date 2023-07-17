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
    image: {
        type: String,
        required: true,
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassTypePrice',
        required: true,
    },
    selectedServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
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
            paymentStatus: {
                type: String,
                default: 'pending',
                enum: ['pending', 'paid']
            },
            accessStatus: {
                type: String,
                default: 'pending',
                enum: ['pending', 'granted']
            }
        },
    ],
}));

module.exports = trainingClass;