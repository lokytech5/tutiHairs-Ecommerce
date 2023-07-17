const mongoose = require('mongoose');

const product = mongoose.model('Product', new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        set: (value) => {
            if (typeof value === 'string') {
                return parseFloat(value.replace(/,/g, ''));
            }
            return value;
        },
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            username: {
                type: String,
                required: true,
            },
            review: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
        },
    ],

    averageRating: {
        type: Number,
        default: 0,
    },
},
    
    {
        timestamps: true,
    }
));

module.exports = product;