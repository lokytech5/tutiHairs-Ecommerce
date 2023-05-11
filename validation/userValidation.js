const { check, body, validationResult } = require('express-validator');

exports.createUserValidator = [
    check('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),

    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 5, max: 100 })
        .withMessage('Password must be between 6 and 100 characters'),
];


exports.updateUserValidator = [
    check('username')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),

    check('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 3, max: 128 })
        .withMessage('Password must be between 3 and 128 characters'),

    check('email')
        .optional({ checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            console.log("Validation Errors:", errors.array());
            console.log("Request Body:", req.body);
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
];


exports.updateUserProfileValidator = [
    body('profile.firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),

    body('profile.lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),

    body('profile.phone')
        .optional()
        .trim()
        .isLength({ min: 10, max: 15 })
        .withMessage('Phone number must be between 10 and 15 characters'),

    // Add validation for other fields as necessary
];

exports.validateNotificationPreferences = [
    check('emailNotifications')
        .optional()
        .isBoolean()
        .withMessage('Email notifications preference must be a boolean value'),

    check('pushNotifications')
        .optional()
        .isBoolean()
        .withMessage('Push notifications preference must be a boolean value'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    },
];