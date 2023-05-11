const shoppingCartController = require('../controllers/shoppingCart')
const cartItemValidation = require('../validation/cartItemValidation')
const auth = require('../middleware/auth.js')
const optionalAuth = require('../middleware/optionalAuth')
const guestCart = require('../middleware/guestCart');
const express = require('express');
const router = express.Router();

router.get('/', auth, shoppingCartController.getCart);
router.post('/', auth, cartItemValidation, shoppingCartController.addItemToCart);
router.post('/syncGuestCart', optionalAuth, guestCart, shoppingCartController.syncGuestCart);
router.get('/summary', auth, shoppingCartController.getCartSummary);
router.put('/sync', auth, shoppingCartController.syncCart);
router.delete('/', auth, shoppingCartController.emptyCart);
router.delete('/:productId', auth, shoppingCartController.deleteCartItem);



module.exports = router;