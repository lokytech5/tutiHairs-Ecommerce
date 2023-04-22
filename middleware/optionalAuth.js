const jwt = require('jsonwebtoken');
const { config } = require('../config/config')

function optionalAuth(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, config.jwtPrivateKey);
        req.user = decoded;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
}

module.exports = optionalAuth;