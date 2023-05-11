const { body } = require('express-validator');

exports.createCuratedCollectionValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('product')
        .isArray()
        .withMessage('Products must be an array of product IDs'),
    body('product.*')
        .isMongoId()
        .withMessage('Each product ID must be a valid MongoDB ObjectID'),
];

exports.updateCuratedCollectionValidation = [
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('product')
        .optional()
        .isArray()
        .withMessage('Products must be an array of product IDs'),
    body('product.*')
        .isMongoId()
        .withMessage('Each product ID must be a valid MongoDB ObjectID'),
];
