const { body } = require('express-validator');

exports.createServiceValidator = [
    body('serviceName')
        .notEmpty().withMessage('serviceName is required')
        .isLength({ min: 1, max: 500 }).withMessage('serviceName must be between 1 and 100 characters'),

    body('description')
        .notEmpty().withMessage('description is required')
        .isLength({ min: 1, max: 500 }).withMessage('description must be between 1 and 100 characters'),

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
]