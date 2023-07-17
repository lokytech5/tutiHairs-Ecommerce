const express = require('express')
const trainingClassOrderController = require('../controllers/trainingClassOrderController')
const { validateCreateTrainingClassOrder } = require('../validation/trainingClassOrderValidation')
const optionalAuth = require('../middleware/optionalAuth')
const auth = require('../middleware/auth')
const router = express.Router()


router.post('/', auth, validateCreateTrainingClassOrder, trainingClassOrderController.createTrainingClassOrder);
router.get('/:id',  auth, trainingClassOrderController.getTrainingClassOrderById)


module.exports = router;