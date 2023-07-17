const { check, validationResult } = require('express-validator');

exports.validateCreateTrainingClassOrder = [
    check('trainingClassId')
        .not()
        .isEmpty()
        .withMessage('TrainingClassId is required')
        .isMongoId()
        .withMessage('TrainingClassId should be a valid MongoID'),
    check('servicesIds')
        .optional()
        .isArray()
        .withMessage('servicesIds should be an array')
        .custom((value, { req }) => {
            if (value.length > 0) {
                for (let i = 0; i < value.length; i++) {
                    if (!value[i].match(/^[0-9a-fA-F]{24}$/)) {
                        throw new Error('Each serviceId should be a valid MongoID');
                    }
                }
            }
            return true;
        }),
];
