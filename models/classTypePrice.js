const mongoose = require('mongoose');

const classTypePrice = mongoose.model('ClassTypePrice', new mongoose.Schema({
    classType: {
        type: String,
        enum: ['Sponsor Advert', 'Human Hair Class', 'Hairblend Class'],
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
}));

module.exports = classTypePrice;