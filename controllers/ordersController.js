const Orders = require('../models/order');
const { validationResult } = require('express-validator');
const Product = require('../models/product');
const { sendOrderConfirmationEmail } = require('../mails/email')


function formatOrder(order) {
    // Check if order.user is not null
    if (!order.user) {
        throw new Error(`User not found for order with id: ${order._id}`);
    }

    const userName = `${order.user.firstName || ''} ${order.user.username || ''} ${order.user.lastName || ''}`.trim();

    // Calculate the correct total price
    const correctTotalPrice = order.items.reduce(
        (total, item) => {
            return total + item.product.price * item.quantity;
        },
        0
    ) + (order.shipping.cost || 0);


    return {
        id: order._id,
        user: {
            id: order.user._id,
            name: userName || 'N/A',
            email: order.user.email,
        },
        items: order.items.map(item => ({
            id: item._id,
            product: {
                id: item.product._id,
                name: item.product.name,
                price: item.product.price,
            },
            quantity: item.quantity,
            subtotal: item.quantity * item.product.price,
        })),
        totalPrice: correctTotalPrice, // Use the correct total price here
        status: order.status,
        orderDate: order.orderDate,
        shipping: order.shipping,
    };
}

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Orders.find().populate('user items.product');

        // Format the orders using the formatOrder function
        const formattedOrders = orders.map(formatOrder);

        res.status(200).json({ orders: formattedOrders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Orders.findById(req.params.id)
            .populate('user', 'username email') // <- only username and email fields
            .populate('items.product', 'name price'); // <- only name and price fields

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Use formatOrder function to format the order before sending it in the response
        const formattedOrder = formatOrder(order);
        res.status(200).json(formattedOrder);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getOrdersByUserId = async (req, res) => {
    try {

        const orders = await Orders.find({ user: req.params.userId }).populate('user items.product');
        // Check the length of the orders array to see if any orders were found
        if (orders.length === 0) {
            return res.status(404).json({ error: 'No orders found for this user' });
        }

        const formattedOrders = orders.map(formatOrder);
        res.status(200).json({ orders: formattedOrders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//new code
exports.createOrder = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Fetch product prices from the database
        const productIds = req.body.items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        // Check if all products exist
        if (products.length !== productIds.length) {
            return res.status(400).send({ error: 'One or more products are invalid or do not exist' });
        }

        const productMap = products.reduce((acc, product) => {
            acc[product._id] = product;
            return acc;
        }, {});

         // Check for product availability and item data consistency
         for (let item of req.body.items) {
            const product = productMap[item.product];
            if (!product || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
                return res.status(400).send({ error: 'Invalid product quantity or product does not exist' });
            }
            if (item.selectedColor && product.availableColors && !product.availableColors.includes(item.selectedColor)) {
                return res.status(400).send({ error: 'Selected color is not available for this product' });
            }
        }

         // Validate shipping details
         const { shipping } = req.body;
         if (!shipping || !shipping.cost || typeof shipping.cost !== 'number') {
             return res.status(400).send({ error: 'Invalid shipping cost' });
         }

         // Validate shipping info completeness
        if (!shipping.address || !shipping.city || !shipping.state || !shipping.postalCode || !shipping.phone) {
            return res.status(400).send({ error: 'Incomplete shipping details' });
        }

        // Use the provided shipping cost from the frontend
        const shippingCost = req.body.shipping.cost;

        const newOrder = new Orders({
            ...req.body,
            shipping: {
                 ...shipping,
                 cost: shippingCost
                     },
            items: req.body.items.map(item => ({
                product: productMap[item.product],
                quantity: item.quantity,
                selectedColor: item.selectedColor
            })),
            totalPrice: req.body.items.reduce(
                (total, item) => {
                    return total + (productMap[item.product].price * item.quantity);
                },
                0
            ) + shippingCost,
            status: 'Pending',  // Initial order status
            orderDate: new Date() // Current date/time
        });

        await newOrder.save();

        // Populate the order with the necessary product details
        const populatedOrder = await Orders.findById(newOrder._id)
            .populate('user', 'username email')
            .populate('items.product', 'name price');

        // Use the formatOrder function to format the response
        const formattedOrder = formatOrder(populatedOrder);
        res.status(201).json(formattedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateOrder = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        // Calculate the shipping cost
        const shippingCost = calculateShippingCost(req.body.shipping.method, req.body.shipping.state);

        // Check for an error from calculateShippingCost
        if (shippingCost.error) {
            return res.status(400).json({ error: shippingCost.error });
        }

        // Define the updated fields variable first
        let updatedFields = {
            ...req.body,
            shipping: {
                ...req.body.shipping,
                cost: shippingCost
            },
            items: req.body.items.map(item => ({ // map each item of the array
                product: productMap[item.product]._id, // replace string id with product object
                quantity: item.quantity,
            })),
        };

        // Fetch product prices from the database
        // If items are present in the body, fetch product prices from the database
        if (req.body.items) {
            const productIds = req.body.items.map(item => item.product);
            const products = await Product.find({ _id: { $in: productIds } });
            const productMap = products.reduce((acc, product) => {
                acc[product._id] = product;
                return acc;
            }, {});

            if (!productMap) {
                return res.status(400).json({ error: products.errors });
            }

            // Include the items and total price in the updated fields
            updatedFields = {
                ...updatedFields,
                totalPrice: req.body.items.reduce(
                    (total, item) => total + (productMap[item.product].price * item.quantity),
                    0
                ) + shippingCost,
            };
        }

        const updatedOrder = await Orders.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Populate the order with the necessary product details
        const populatedOrder = await Orders.findById(updatedOrder._id)
            .populate('user', 'username email') // <- only username and email fields
            .populate('items.product', 'name price'); // <- only name and price fields

        const formattedUpdatedOrder = formatOrder(populatedOrder);
        res.status(200).json(formattedUpdatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Orders.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.completePurchase = async (req, res) => {
    try {
        console.log("Received order ID:", req.params.id);  
        const updatedOrder = await Orders.findByIdAndUpdate(
            req.params.id,
            { status: 'Processing' },
            { new: true }
        );

        if (!updatedOrder) {
            console.log("Order not found for ID:", req.params.id);
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log("Order updated:", updatedOrder); 

        // Populate the order with the necessary product details
        const populatedOrder = await Orders.findById(updatedOrder._id)
            .populate('user', 'username email') // <- only username and email fields
            .populate('items.product', 'name price'); // <- only name and price fields

        const formattedUpdatedOrder = formatOrder(populatedOrder);
        console.log("Order to be emailed:", formattedUpdatedOrder);
        // Send confirmation email after purchase
        await sendOrderConfirmationEmail(populatedOrder.user.email, formattedUpdatedOrder);
        console.log('Email sent for order ID:', req.params.id);

        res.status(200).json(formattedUpdatedOrder);
    } catch (error) {
        console.error("Error in completePurchase:", error); 
        res.status(500).json({ error: error.message });
    }
};
