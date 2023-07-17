const { body, validationResult } = require('express-validator');

exports.createClassTypePriceValidator = [
    body('classType')
        .trim()
        .notEmpty()
        .withMessage('Class type is required')
        .isIn(['Sponsor Advert Class', 'Human Hair Class', 'Hairblend & Attachment Class',
            'Kiddies Wears Importation Class', 'Bags, Dress & Shoes Importation Class'])
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
        .isIn(['Sponsor Advert Class', 'Human Hair Class', 'Hairblend & Attachment Class',
            'Kiddies Wears Importation Class', 'Bags, Dress & Shoes Importation Class'])
        .withMessage('Invalid class type'),

    body('image')
        .optional()
        .notEmpty().withMessage('Image must not be empty')
        .isURL().withMessage('Image must be a valid URL'),

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
