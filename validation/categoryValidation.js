const { check, body } = require('express-validator');

exports.createCategoryValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage("Category name is required")
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Category name must be between 3 and 50 characters"),

    body('colors')
        .isArray()
        .withMessage('Colors must be an array of strings')
        .notEmpty()
        .withMessage('Colors cannot be an empty array'),

    body('inches')
        .isInt({ min: 1, max: 40 })
        .withMessage('Inches must be an integer between 1 and 40'),

    body('grams')
        .if(body('name').equals('Bundles'))
        .isInt({ min: 1, max: 500 })
        .withMessage('Grams must be an integer between 1 and 500'),

    body('length')
        .if(body('name').custom(name => {
            return name === "Closure" || name === "Frontal";
        }))
        .isArray()
        .withMessage('Length must be an array of strings')
        .custom(length => {
            const validLengths = ['2x4', '2x6', '3x3', '4x4', '13x2', '13x4', '13x5'];
            return length.every(value => validLengths.includes(value));
        })
        .withMessage('Invalid length(s) provided')

]


exports.updateCategoryValidator = [
    check("name")
        .optional()
        .not()
        .isEmpty()
        .withMessage("Category name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Category name must be between 3 and 100 characters"),

    check('description')
        .optional()
        .not()
        .isEmpty()
        .withMessage("Description is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Description must be between 3 and 100 characters"),

    check('colors')
        .optional()
        .isArray()
        .withMessage('Colors must be an array of strings'),

    check('inches')
        .optional()
        .isInt({ min: 1, max: 40 })
        .withMessage('Inches must be an integer between 1 and 40'),

    check('grams')
        .optional()
        .isInt({ min: 1, max: 500 })
        .withMessage('Grams must be an integer between 1 and 500'),

    body('image')
        .optional()
        .notEmpty().withMessage('Image must not be empty')
        .isURL().withMessage('Image must be a valid URL'),

    check('length')
        .optional()
        .custom((length, { req }) => {
            if (['Closure', 'Frontal'].includes(req.body.name)) {
                if (Array.isArray(length)) {
                    const validLengths = ['2x4', '2x6', '3x3', '4x4', '13x2', '13x4', '13x5'];
                    return length.every(value => validLengths.includes(value));
                } else {
                    throw new Error('Length must be an array of strings');
                }
            }
            return true;
        })
];



