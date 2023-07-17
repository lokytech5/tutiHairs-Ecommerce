const mongoose = require('mongoose');

const productViewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true // Ensure that each product has only one view count document
    },
    viewCount: {
        type: Number,
        required: true,
        default: 0 // Initialize view count to 0
    }
});

module.exports = mongoose.model('ProductView', productViewSchema);
