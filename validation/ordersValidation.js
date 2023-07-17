const { check, body } = require('express-validator');

exports.createOrderValidator = [
    body('user')
        .notEmpty()
        .withMessage('User is required'),


    body('items')
        .isArray({ min: 1 })
        .withMessage('Items must be an array with at least one item'),


    body('items.*.product')
        .notEmpty()
        .withMessage('Product is required for each item'),


    body('items.*.quantity')
        .isInt({ gt: 0 })
        .withMessage('Quantity must be a positive integer'),


    body('shipping.method')
        .notEmpty()
        .withMessage('Shipping method is required'),

    body('shipping.state')
        .notEmpty()
        .withMessage('Shipping state is required')
];



exports.updateOrderValidator = [
    body('user')
    .optional()
    .notEmpty()
    .withMessage('User cannot be empty'),


    body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item'),

    body('items.*.product')
    .optional()
    .notEmpty()
    .withMessage('Product cannot be empty for each item'),


    body('items.*.quantity')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a positive integer'),


    body('shipping.method')
        .optional()
        .notEmpty()
        .withMessage('Shipping method cannot be empty'),

    body('shipping.state')
        .optional()
        .notEmpty()
        .withMessage('Shipping state cannot be empty'),

    body('status')
    .optional()
        .isIn(['Pending', 'Shipped', 'Delivered', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Shipped, Delivered, Canceled'),
];