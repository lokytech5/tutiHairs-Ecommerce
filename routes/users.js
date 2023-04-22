const userController = require('../controllers/userController');
const { createUserValidator, updateUserValidator, updateUserProfileValidator } = require('../validation/userValidation');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { avatarUpload } = require('../middleware/upload')
const express = require('express');
const router = express.Router();


router.get('/', [auth, admin], userController.getAllUsers);
router.get('/me', auth, userController.getUserProfile);
router.put('/profile', auth, avatarUpload.single('avatar'), updateUserProfileValidator, userController.updateUserProfile);
router.post('/', createUserValidator, userController.createUsers);
router.get('/:id', [auth, admin], userController.getUsersById);
router.put('/:id', auth, updateUserValidator, userController.updateUsers);
router.delete('/:id', [auth, admin], userController.deleteUsers);


module.exports = router;