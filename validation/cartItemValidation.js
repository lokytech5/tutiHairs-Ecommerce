const { validationResult } = require('express-validator');

const cartItemValidation = (req, res, next) => {
    if (!req.body) {
        console.log('Request body is missing');
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { product, quantity } = req.body;

    // Input validation
    if (!product || !quantity || quantity <= 0) {
        console.log('Invalid input data');
        return res.status(400).json({ error: "Invalid input data" });
    }

    next();
};

module.exports = cartItemValidation;
