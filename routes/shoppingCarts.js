const shoppingCartController = require('../controllers/shoppingCart')
const cartItemValidation = require('../validation/cartItemValidation')
const auth = require('../middleware/auth.js')
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();

router.get('/', auth, shoppingCartController.getCart);
router.post('/', auth, cartItemValidation, shoppingCartController.addItemToCart);
router.get('/summary', auth, shoppingCartController.getCartSummary);
router.put('/:id', auth, cartItemValidation, shoppingCartController.updateCartItem);
router.delete('/:id', auth, shoppingCartController.deleteCartItem);
router.delete('/', auth, shoppingCartController.emptyCart);


module.exports = router;