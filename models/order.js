const mongoose = require('mongoose');

const order = mongoose.model('Order', new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shipping: {
        name: {
            type: 'string',
            minlength: 2,
            maxlength: 100,
            required: true,
        },
        address: {
            type: 'string',
            required: true,
        },
        city: {
            type: 'string',
            required: true,
        },
        state: {
            type: 'string',
            required: true,
        },
        postalCode: {
            type: 'Number',
            required: true,
        },
        phone: {
            type: String,
            minlength: 10,
            maxlength: 15,
            required: true,
        },

        method: {
            type: 'String',
            required: true,
        },

        cost: {
            type: 'Number',
            required: true,
        }
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
}));

module.exports = order;