const { check, body } = require('express-validator');

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
]