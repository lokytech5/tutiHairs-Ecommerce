const mongoose = require('mongoose');

const category = mongoose.model('Category', new mongoose.Schema({
    name: {
        type: String,
        enum: ['Luxury Hair', 'Natural Hair', 'Closure', 'Frontal', 'Wigs', 'Bundles', 'Bone Straight Hairs'],
        required: true,
        trim: true,
        min: 3,
        max: 100,
    },

    description: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 100,
    },

    colors: {
        type: [String],
        required: true,
    },

    inches: { // Add Field is required for all categories names
        type: Number,
        required: true,
        min: 1,
        max: 40,
    },

    length: { // This field is only required for Closure and Frontals
        type: [String],
        required: false,
        enum: [
            '2x4',
            '2x6',
            '3x3',
            '4x4',
            '13x2',
            '13x4',
            '13x5'
        ],
        default: undefined,
    },

    grams: { //this field is only required for Bundles
        type: Number,
        required: false,
        min: 1,
        max: 500,
        default: undefined,
    }
}));

module.exports = category;