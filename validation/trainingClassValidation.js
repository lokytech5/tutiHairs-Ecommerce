const { check, body } = require('express-validator');

exports.createTrainingClassValidator = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5 })
        .withMessage('Title should be at least 5 characters long'),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10 })
        .withMessage('Description should be at least 10 characters long'),
    body('registrationDeadline')
        .notEmpty()
        .withMessage('DeadLine date is required')
        .isISO8601()
        .withMessage('DeadLine date must be a valid ISO 8601 date'),
    body('type')
        .notEmpty()
        .withMessage('Class type is required')
        .isMongoId()
        .withMessage('Class type must be a valid MongoDB ObjectId'),
    body('maxParticipants')
        .notEmpty()
        .withMessage('Maximum participants is required')
        .isInt({ min: 1 })
        .withMessage('Maximum participants must be an integer greater than 0'),
    body('maxRegistrations')
        .notEmpty()
        .withMessage('Maximum registrations is required')
        .isInt({ min: 1 })
        .withMessage('Maximum registrations must be an integer greater than 0'),

];


exports.updateTrainingClassValidator = [
    body('title')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('type')
        .optional()
        .isMongoId()
        .withMessage('Invalid ClassTypePrice ID'),
    body('maxParticipants')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max participants must be at least 1')
        .toInt(),
];


exports.registerUserForTrainingClassValidator = [
    check('id', 'Training class ID is required') // Specify the parameter name instead of 'trainingClassId'
        .notEmpty()
        .withMessage('Training class ID is required')
        .isMongoId()
        .withMessage('Training class ID must be a valid MongoDB ID'),
    (req, res, next) => {
        if (!req.user) {
            check('email')
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Email must be a valid email address')
                .normalizeEmail()
                .run(req);

            check('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long')
                .run(req);

            check('firstName')
                .notEmpty()
                .withMessage('FirstName is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('FirstName must be between 2 and 50 characters long')
                .trim()
                .escape()
                .run(req);

            check('lastName')
                .notEmpty()
                .withMessage('LastName is required')
                .isLength({ min: 2, max: 50 })
                .withMessage('LastName must be between 2 and 50 characters long')
                .trim()
                .escape()
                .run(req);

            check('phone')
                .notEmpty()
                .trim()
                .isLength({ min: 10, max: 15 })
                .withMessage('Phone number must be between 10 and 15 characters')
                .escape()
                .run(req);
        }
        next();
    },
];

exports.unregisterUserForTrainingClassValidator = [
    check('id')
        .isMongoId()
        .withMessage('Invalid training class ID'),
];