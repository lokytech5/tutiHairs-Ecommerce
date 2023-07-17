const express = require('express');
const ecommercePayment = require('../payment/ecommercePayment');
const trainingPayment = require('../payment/trainingPayment')

const router = express.Router();

router.post('/ecommerce/', ecommercePayment.initializeTransaction);
router.post('/ecommerce/verify', ecommercePayment.verifyTransaction);
router.post('/ecommerce/webhook', express.json({ type: 'application/json' }), ecommercePayment.handleWebhook);

router.post('/training/', trainingPayment.initializeTransaction);
router.post('/taining/verify', trainingPayment.verifyTransaction);

module.exports = router;