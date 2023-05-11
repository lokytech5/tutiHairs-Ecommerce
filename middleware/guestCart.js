const Cart = require('../models/shoppingCart');

// A middleware to handle guest carts for unauthenticated users
async function guestCartMiddleware(req, res, next) {
    if (req.user) {
        next();
    } else {
        // Create a guest cart if it doesn't exist
        let cart = await Cart.findOne({ user: null });

        if (!cart) {
            cart = new Cart({ user: null, items: [] });
            await cart.save();
        }

        // Attach the guest cart to the request object
        req.guestCart = cart;
        next();
    }
}

module.exports = guestCartMiddleware;
