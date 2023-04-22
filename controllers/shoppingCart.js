const Cart = require('../models/shoppingCart')

const { validationResult } = require('express-validator')


function formatCart(cart) {
    const formattedItems = cart.items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
    }));

    const formattedCart = {
        user_id: cart.user,
        items: formattedItems,
        total: formattedItems.reduce((acc, curr) => acc + curr.subtotal, 0),
    };

    return formattedCart;
}


exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').exec();

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const formattedCart = formatCart(cart);
        res.status(200).json(formattedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getCartSummary = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').exec();

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        let totalPrice = 0;
        let totalItems = 0;

        cart.items.forEach(item => {
            totalPrice += item.product.price * item.quantity;
            totalItems += item.quantity;
        });

        const cartSummary = {
            totalPrice,
            totalItems,
        };

        res.status(200).json(cartSummary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.addItemToCart = async (req, res) => {
    const { product, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id })

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === product.toString());

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product, quantity });
        }

        await cart.save();

        // Populate product information
        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        // Format the response
        const formattedCart = formatCart(populatedCart);

        res.status(200).json(formattedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    const { product, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === product.toString());

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            cart.items.push({ product, quantity });
        }

        // Populate product information
        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        // Format the response
        const formattedCart = formatCart(populatedCart);

        res.status(200).json(formattedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCartItem = async (req, res) => {
    const cartItemId = req.params.id;

    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const initialCartItemsCount = cart.items.length;

        cart.items = cart.items.filter((item) => item._id.toString() !== cartItemId);

        if (initialCartItemsCount === cart.items.length) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        await cart.save();

        // Populate product information
        const populatedCart = await Cart.findOne({ user: req.user._id }).populate('items.product').exec();

        res.status(200).json(populatedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Empty the cart
exports.emptyCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.items = [];

        await cart.save();

        res.status(200).json({ message: 'Cart emptied successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

