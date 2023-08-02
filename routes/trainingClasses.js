const trainingClassController = require('../controllers/trainingClassController')
const { createTrainingClassValidator,
    updateTrainingClassValidator,
    registerUserForTrainingClassValidator,
    unregisterUserForTrainingClassValidator } = require('../validation/trainingClassValidation')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const isRegistrationOpen = require('../middleware/isRegistrationOpen')
const optionalAuth = require('../middleware/optionalAuth')
const { trainingClassUpload } = require('../middleware/upload');

const express = require('express');
const router = express.Router();

router.get('/', trainingClassController.getAllTrainingClasses);
router.post('/verify-phone', trainingClassController.verifyPhoneNumber)
router.get('/userTrainingClasses', auth, trainingClassController.getUserTrainingClasses);
router.delete('/:id/unregister', unregisterUserForTrainingClassValidator, trainingClassController.unregisterUsersForTrainingClass);
router.post('/:id/register', [auth, isRegistrationOpen], registerUserForTrainingClassValidator, trainingClassController.registerUsersForTrainingClass);
router.get('/:id', trainingClassController.getTrainingClassById);
router.post('/', trainingClassUpload.single('image'), createTrainingClassValidator, trainingClassController.createTrainingClasses);
router.put('/:id', updateTrainingClassValidator, trainingClassController.updateTrainingClasses);
router.delete('/:id', trainingClassController.deleteTrainingClasses);


router.put('/:trainingClassId/updatePaymentStatus/:userId', trainingClassController.updatePaymentStatus);


module.exports = router;