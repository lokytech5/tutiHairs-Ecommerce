const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        unique: true,
    },
    items: [{
        product: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            description: String,
            price: Number,
            image: String,
            color: String,
            length: String,
            grams: Number,
            inches: Number,
        },
        quantity: Number
    }],
});

const shoppingCart = mongoose.model('Cart', CartSchema);
module.exports = shoppingCart;