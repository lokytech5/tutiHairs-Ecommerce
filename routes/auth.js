const express = require('express');
const authController = require('../controllers/authController')
const { authValidator, forgotPasswordValidation, resetPasswordValidation } = require('../validation/authValidation')

const router = express.Router();

router.post('/', authValidator, authController.createAuth);
router.post('/forgotPassword', forgotPasswordValidation, authController.forgotPassword);
router.post('/resetPassword', resetPasswordValidation, authController.resetPassword);
router.post('/verify', authController.verifyEmail);

module.exports = router;