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
    }));

    const formattedCart = {
        user_id: cart.user,
        items: formattedItems,
        total: formattedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
    };

    return formattedCart;
}


exports.getCart = async (req, res) => {
    console.log('User ID:', req.user._id);

    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').exec();
        console.log('Fetched cart:', cart);

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const formattedCart = formatCart(cart);
        res.status(200).json(formattedCart);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.getCartSummary = async (req, res) => {
    console.log('User ID:', req.user._id);

    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').exec();
        console.log('Fetched cart:', cart);

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
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.addItemToCart = async (req, res) => {
    console.log('Route handler addItemToCart executed');

    const { product, quantity } = req.body;

    try {
        // Check if the user is authenticated
        if (!req.user) {
            // Handle the case when the user is not authenticated, e.g., create a guest cart
            // You can either return an error or create a guest cart on the client-side
            return res.status(401).json({ error: 'User not authenticated' });
        }
        console.log('Finding cart...');
        let cart = await Cart.findOne({ user: req.user._id })

        if (!cart) {
            console.log('Creating new cart...');
            cart = new Cart({ user: req.user._id, items: [] });
            await cart.save();
        }

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === product.toString());

        if (itemIndex > -1) {
            console.log('Updating cart item quantity...');
            cart.items[itemIndex].quantity += quantity;
        } else {
            console.log('Adding new cart item...');
            cart.items.push({ product, quantity });
        }

        console.log('Saving cart...');
        await cart.save();

        // Populate product information
        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        // Format the response
        const formattedCart = formatCart(populatedCart);

        res.status(200).json(formattedCart);
    } catch (error) {
        console.error('Error in addItemToCart:', error);
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

    const product_id = req.params.productId;

    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const initialCartItemsCount = cart.items.length;
        console.log("Removing item with product_id:", product_id);

        // Log the cart items for debugging
        console.log("Cart items before filtering:", cart.items);
        cart.items = cart.items.filter((item) => {
            console.log("Comparing", item.product.toString(), "with", product_id);
            return item.product._id.toString() !== product_id;
        });

        console.log("Cart items after filtering:", cart.items);

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


exports.syncCart = async (req, res) => {

    const items = req.body.items || [];

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        cart.items = items.map(item => ({
            product: item.product_id,
            quantity: item.quantity,
        }));

        await cart.save();

        // Populate product information
        const populatedCart = await Cart.findById(cart._id).populate('items.product');

        // Format the response
        const formattedCart = formatCart(populatedCart);

        res.status(200).json(formattedCart);
    } catch (error) {
        console.error('Error in syncCart:', error);
        res.status(500).json({ error: error.message });
    }
};


exports.syncGuestCart = async (req, res) => {

    try {
        // Get the guest cart items from the request
        const guestCartItems = req.body.items || [];

        if (req.user) {
            // Find the authenticated user's cart or create a new one if it doesn't exist
            let userCart = await Cart.findOne({ user: req.user._id });
            if (!userCart) {
                userCart = new Cart({ user: req.user._id, items: [] });
            }

            // Merge the guest cart items with the authenticated user's cart items
            userCart.items = [...userCart.items, ...guestCartItems];

            // Save the authenticated user's cart
            await userCart.save();

            // // Clear the guest cart
            // guestCart.items = [];
            // await guestCart.save();
        }

        res.status(200).json({ message: "Cart synced successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};



