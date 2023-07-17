const mongoose = require('mongoose');

const classTypePrice = mongoose.model('ClassTypePrice', new mongoose.Schema({
    classType: {
        type: String,
        enum: ['Sponsor Advert Class', 'Human Hair Class', 'Hairblend & Attachment Class',
            'Kiddies Wears Importation Class', 'Bags, Dress & Shoes Importation Class',],
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
}));

module.exports = classTypePrice;