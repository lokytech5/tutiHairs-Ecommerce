const { check, body, validationResult } = require('express-validator');

exports.authValidator = [
    check('username')
        .not()
        .isEmpty()
        .withMessage("Username name is required")
        .trim(),

    check('password')
        .not()
        .isEmpty()
        .withMessage("Password is required")
        .trim(),
];

exports.forgotPasswordValidation = [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];


exports.resetPasswordValidation = [
    body('newPassword')
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 characters long.'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];



