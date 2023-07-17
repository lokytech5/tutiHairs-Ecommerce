const mongoose = require('mongoose');

const service = mongoose.model('Service', new mongoose.Schema({
    serviceName: {
        type: String,
        enum: ['Demonstrative Advert', 'Repost on WhatsApp', 'Repost Advert', 'Extra Vip Contacts', 'private Training', 'Regular Training'],
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}));

module.exports = service;