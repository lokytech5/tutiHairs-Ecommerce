const Orders = require('../models/order');
const { validationResult } = require('express-validator')


function formatOrder(order) {
    const userName = `${order.user.firstName || ''} ${order.user.username || ''} ${order.user.lastName || ''}`.trim();

    // Calculate the correct total price
    const correctTotalPrice = order.items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
    );

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


exports.createOrder = async (req, res) => {

    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newOrder = new Orders(req.body);
        await newOrder.save();

        // Populate the order with the necessary product details
        const populatedOrder = await Orders.findById(newOrder._id)
            .populate('user', 'username email') // <- only username and email fields
            .populate('items.product', 'name price'); // <- only name and price fields

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
        const updatedOrder = await Orders.findByIdAndUpdate(req.params.id, req.body, { new: true });
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