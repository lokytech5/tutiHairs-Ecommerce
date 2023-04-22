const _ = require('lodash');
const User = require('../models/user');
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt');


exports.createAuth = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({ error: 'Request body is missing' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password)

        if (!validPassword) {
            return res.status(400).json({ msg: 'Invalid username or password' });
        }
        const token = user.generateAuthToken();
        res.send({ token, username: user.username });

    } catch (error) {
        console.error(error.message);
        res.status(500).send({ error: 'Error saving user to database' });
    }
}