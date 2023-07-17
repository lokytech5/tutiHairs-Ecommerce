const serviceController = require('../controllers/serviceController')
const { createServiceValidator } = require('../validation/serviceValidation')
const express = require('express');
const router = express.Router();


router.get('/', serviceController.getAllServices);
router.post('/', createServiceValidator, serviceController.createServices);


module.exports = router;