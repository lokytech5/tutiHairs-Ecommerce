function admin(req, res, next) {
    if (!req.user.isAdmin) return res.status(403).send('Access Denied not an Administrator');
    next();
}

module.exports = admin;