const mongoose = require('mongoose');

const curatedCollection = mongoose.model('CuratedCollection', new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    bannerImage: {
        type: String,
    },
    product: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],

},

    {
        timestamps: true,
    }

));

module.exports = curatedCollection;