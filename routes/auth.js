const express = require('express');
const authController = require('../controllers/authController')
const { authValidator } = require('../validation/authValidation')

const router = express.Router();

router.post('/', authValidator, authController.createAuth);

module.exports = router;