const jwt = require('jsonwebtoken');
const { config } = require('../config/config')


function auth(req, res, next) {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    console.log('Requested route:', req.path); // Add this line
    console.log('Token:', token);
    if (!token) return res.status(401).send('Access denied. No token provided.')

    try {
        const decoded = jwt.verify(token, config.jwtPrivateKey);
        console.log('Decoded user:', decoded);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid token')
    }
}

module.exports = auth;