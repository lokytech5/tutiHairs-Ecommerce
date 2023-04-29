const express = require('express');
const paymentController = require('../payment/paymentController');

const router = express.Router();

router.post('/', paymentController.initializeTransaction);
router.post('/verify', paymentController.verifyTransaction);
router.post('/webhook', express.json({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;