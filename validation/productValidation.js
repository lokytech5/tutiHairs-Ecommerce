const { check, body } = require('express-validator');

exports.createProductValidator = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),

    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .custom((value, { req }) => {
            const parsedPrice = parseFloat(value.replace(/,/g, ''));

            if (isNaN(parsedPrice)) {
                throw new Error('Price must be a valid number');
            }

            req.body.price = parsedPrice;
            return true;
        }),

    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Category must be a valid ObjectId'),

    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isNumeric().withMessage('Stock must be a number')
];


exports.updateProductValidator = [
    body('name')
        .optional()
        .notEmpty().withMessage('Name must not be empty')
        .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),

    body('description')
        .optional()
        .notEmpty().withMessage('Description must not be empty')
        .isLength({ min: 1, max: 500 }).withMessage('Description must be between 1 and 500 characters'),

    body('price')
        .optional()
        .notEmpty().withMessage('Price must not be empty')
        .custom((value, { req }) => {
            const parsedPrice = parseFloat(value.replace(/,/g, ''));

            if (isNaN(parsedPrice)) {
                throw new Error('Price must be a valid number');
            }

            req.body.price = parsedPrice;
            return true;
        }),

    body('image')
        .optional()
        .notEmpty().withMessage('Image must not be empty')
        .isURL().withMessage('Image must be a valid URL'),

    body('category')
        .optional()
        .notEmpty().withMessage('Category must not be empty')
        .isMongoId().withMessage('Category must be a valid ObjectId'),

    body('stock')
        .optional()
        .notEmpty().withMessage('Stock must not be empty')
        .isNumeric().withMessage('Stock must be a number')
];