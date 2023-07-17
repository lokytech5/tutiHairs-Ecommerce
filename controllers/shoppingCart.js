const Cart = require('../models/shoppingCart')
const Product = require('../models/product')

function formatCart(cart) {
    const formattedItems = cart.items.map((item) => ({
        product_id: item.product.id.toString('hex'),
        product_name: item.product.name,
        description: item.product.description,
        price: item.product.price || 0,
        image: item.product.image,
        color: item.product.color,
        length: item.product.length,
        grams: item.product.grams,
        inches: item.product.inches,
        quantity: item.quantity,
    }));

    const formattedCart = {
        user_id: cart.user.toString(),
        items: formattedItems,
        total: formattedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0),
    };

    return formattedCart;
}


exports.getCart = async (req, res) => {

    try {
        const cart = await Cart.findOne({ user: req.user._id }).exec();

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
        const cart = await Cart.findOne({ user: req.user._id }).exec();

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
    // Extract user from req (assuming user is added to req in a middleware)
    const user = req.user;
    const { product, quantity, color, inches, grams, length } = req.body;

    if (quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be greater than 0." });
    }


    try {
        // Find the product in the database
        const productData = await Product.findById(product);

        if (!productData) {
            // If product is not found, return an error response
            return res.status(404).json({ message: "Product not found." });
        }
        // Find the cart for the user
        let cart = await Cart.findOne({ user: user._id });

        // If the user doesn't have a cart, create one
        if (!cart) {
            cart = new Cart({ user: user._id });
        }

        // Check if product already exists in the cart
        const productInCart = cart.items.find(item => item.product.id.toString() === product);

        // If product exists, increase the quantity
        if (productInCart) {
            productInCart.quantity += quantity;
        } else {
            // If product doesn't exist in the cart, add new item
            cart.items.push({
                product: {
                    id: productData._id.toString(),
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    image: productData.image,
                    color: color || productData.color,
                    inches: inches || productData.inches,
                    grams: grams || productData.grams,
                    length: length || productData.length
                },
                quantity: quantity,
            });
        }
        // Save the cart
        await cart.save();
        const formattedCart = formatCart(cart);
        // Send success response
        res.status(200).json(formattedCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


exports.updateCartItem = async (req, res) => {

    const { product, quantity, color, inches, grams, length } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const productData = await Product.findById(product)

        if (!productData) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productSnapshot = {
            id: productData._id.toString(),
            name: productData.name,
            description: productData.description,
            price: productData.price,
            image: productData.image,
            color: color || productData.color,
            inches: inches || productData.inches,
            grams: grams || productData.grams,
            length: length || productData.length
        };

        const itemIndex = cart.items.findIndex((item) => item.product.id.toString() === product);

        if (itemIndex > -1) {
            cart.items[itemIndex].product = productSnapshot;
            cart.items[itemIndex].quantity = quantity;
        } else {
            cart.items.push({ product: productSnapshot, quantity });
        }

        await cart.save();

        // Format the response
        const formattedCart = formatCart(cart);

        res.status(200).json(formattedCart);
    } catch (error) {
        console.error('Error in updateCartItem:', error);
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

        cart.items = cart.items.filter((item) => {
            return item.product.id.toString() !== product_id;
        });

        if (initialCartItemsCount === cart.items.length) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        await cart.save();

        const formattedCart = formatCart(cart);

        res.status(200).json(formattedCart);
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
        const formattedCart = formatCart(cart);

        res.status(200).json(formattedCart);
        // res.status(200).json({ message: 'Cart emptied successfully' });
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

        cart.items = await Promise.all(items.map(async item => {
            const productData = await Product.findById(item.product);
            if (!productData) {
                throw new Error("Product not found");
            }

            return {
                product: {
                    id: productData._id.toString(),
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    image: productData.image,
                    color: item.color || productData.color,
                    length: item.length || productData.length,
                    grams: item.grams || productData.grams,
                    inches: item.inches || productData.inches,
                },
                quantity: item.quantity
            };
        }));
        await cart.save();
        const formattedCart = formatCart(cart);

        res.status(200).json(formattedCart);
    } catch (error) {
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

            //Merge the guest cart items with the authenticated user's cart items
            userCart.items = [...userCart.items, ...await Promise.all(guestCartItems.map(async item => {
                const productData = await Product.findById(item.product);
                if (!productData) {
                    throw new Error("Product not found")
                }
                return {
                    product: {
                        id: productData._id.toString(),
                        name: productData.name,
                        description: productData.description,
                        price: productData.price,
                        image: productData.image,
                        color: item.color || productData.color,
                        length: item.length || productData.length,
                        grams: item.grams || productData.grams,
                        inches: item.inches || productData.inches,
                    },
                    quantity: item.quantity

                };
            }))];

            // Save the authenticated user's cart
            await userCart.save();
        }

        res.status(200).json({ message: "Cart synced successfully." });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
};


exports.mergeGuestCart = async (req, res) => {
    const { guestCartId } = req.body;
    try {
        const guestCart = await Cart.findOne({ _id: guestCartId, user: null });
        if (!guestCart) {
            return res.status(404).json({ error: 'Guest cart not found' });
        }

        let userCart = await Cart.findOne({ user: req.user._id });
        if (!userCart) {
            guestCart.user = req.user._id;
            await guestCart.save();
            return res.status(200).json({ message: 'Cart transferred successfully' });
        }

        // Merge the guest cart items with the authenticated user's cart items
        userCart.items = [...userCart.items, ...await Promise.all(guestCart.items.map(async item => {
            const productData = await Product.findById(item.product.id);
            if (!productData) {
                throw new Error("Product not found.");
            }
            return {
                product: {
                    id: productData._id.toString(),
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    image: productData.image,
                    color: item.color || productData.color,
                    length: item.length || productData.length,
                    grams: item.grams || productData.grams,
                    inches: item.inches || productData.inches,
                },
                quantity: item.quantity
            };
        }))];

        await userCart.save();
        await guestCart.remove();  // remove the guest cart after merging

        res.status(200).json({ message: 'Cart merged successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


