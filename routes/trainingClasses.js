const trainingClassController = require('../controllers/trainingClassController')
const { createTrainingClassValidator,
    updateTrainingClassValidator,
    registerUserForTrainingClassValidator,
    unregisterUserForTrainingClassValidator } = require('../validation/trainingClassValidation')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const isRegistrationOpen = require('../middleware/isRegistrationOpen')
const optionalAuth = require('../middleware/optionalAuth')

const express = require('express');
const router = express.Router();

router.get('/', trainingClassController.getAllTrainingClasses);
router.get('/userTrainingClasses', auth, trainingClassController.getUserTrainingClasses);
router.delete('/:id/unregister', unregisterUserForTrainingClassValidator, trainingClassController.unregisterUsersForTrainingClass);
router.post('/:id/register', [optionalAuth, isRegistrationOpen], registerUserForTrainingClassValidator, trainingClassController.registerUsersForTrainingClass);
router.get('/:id', trainingClassController.getTrainingClassById);
router.post('/', createTrainingClassValidator, trainingClassController.createTrainingClasses);
router.put('/:id', updateTrainingClassValidator, trainingClassController.updateTrainingClasses);
router.delete('/:id', trainingClassController.deleteTrainingClasses);

module.exports = router;