const { body, validationResult } = require('express-validator');

exports.createClassTypePriceValidator = [
    body('classType')
        .trim()
        .notEmpty()
        .withMessage('Class type is required')
        .isIn(['Sponsor Advert', 'Human Hair Class', 'Hairblend Class'])
        .withMessage('Class type must be one of the following: Sponsor Advert, Human Hair Class, or Hairblend Class'),

    body('price')
        .isNumeric()
        .withMessage('Price must be a numeric value')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than 0'),
];

exports.updateClassTypePriceValidator = [
    body('classType')
        .optional()
        .isIn(['Sponsor Advert', 'Human Hair Class', 'Hairblend Class'])
        .withMessage('Invalid class type'),
    body('price')
        .optional()
        .isNumeric()
        .withMessage('Price must be a number')
        .custom((value) => value >= 0)
        .withMessage('Price must be a non-negative number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
