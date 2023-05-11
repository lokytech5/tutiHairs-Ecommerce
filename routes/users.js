const userController = require('../controllers/userController');
const { createUserValidator,
    updateUserValidator,
    updateUserProfileValidator,
    validateNotificationPreferences } = require('../validation/userValidation');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { avatarUpload } = require('../middleware/upload')
const express = require('express');
const router = express.Router();


router.get('/', [auth, admin], userController.getAllUsers);
router.get('/me', auth, userController.getUserProfile);
router.delete('/me', auth, userController.deleteOwnUser);
router.put('/profile', auth, updateUserProfileValidator, userController.updateUserProfile);
router.put('/notification', auth, validateNotificationPreferences, userController.updateNotificationPreferences)
router.post('/upload-avatar', auth, avatarUpload.single('avatar'), userController.uploadAvatar)
router.post('/verify-password', auth, userController.verifyCurrentPassword)
router.post('/', createUserValidator, userController.createUsers);
router.get('/:id', [auth, admin], userController.getUsersById);
router.put('/:id', auth, updateUserValidator, userController.updateUsers);
router.delete('/:id', [auth, admin], userController.deleteUserById);



module.exports = router;