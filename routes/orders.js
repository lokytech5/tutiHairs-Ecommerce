const orderController = require('../controllers/ordersController');
const { createOrderValidator } = require('../validation/ordersValidation');
const auth = require('../middleware/auth.js')
const admin = require('../middleware/admin');
const express = require('express');
const order = require('../models/order');
const router = express.Router();


router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', createOrderValidator, orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);



module.exports = router;