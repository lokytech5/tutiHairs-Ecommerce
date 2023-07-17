const mongoose = require('mongoose')

const trainingClassOrder = mongoose.model('TrainingClassOrder', new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    trainingClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingClass',
        required: true
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
    }],
    totalCost: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}));
module.exports = trainingClassOrder