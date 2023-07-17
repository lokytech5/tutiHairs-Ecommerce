const orderController = require('../controllers/ordersController');
const { createOrderValidator } = require('../validation/ordersValidation');
const auth = require('../middleware/auth.js')
const admin = require('../middleware/admin');
const express = require('express');
const order = require('../models/order');
const router = express.Router();


router.get('/', auth, admin, orderController.getAllOrders);
router.post('/', auth, createOrderValidator, orderController.createOrder);
router.get('/by/:id', auth, orderController.getOrderById);
router.get('/:userId', auth, orderController.getOrdersByUserId);
router.put('/:id', auth, orderController.updateOrder);
router.put('/:id', auth, orderController.completePurchase)
router.delete('/:id', auth, orderController.deleteOrder);



module.exports = router;