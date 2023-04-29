const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const httpMocks = require('node-mocks-http');
const { config } = require('../../config/config');
config.jwtPrivateKey = 'test_private_key';

describe('auth middleware', () => {
    const validToken = jwt.sign({ id: 1, isAdmin: true }, config.jwtPrivateKey);

    test('should call next() if a valid token is provided', () => {
        const req = httpMocks.createRequest({
            headers: { Authorization: `Bearer ${validToken}` },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(1);
        expect(req.user.isAdmin).toBe(true);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('should return a 401 status and send "Access denied. No token provided." if no token is provided', () => {
        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getData()).toBe('Access denied. No token provided.');
        expect(next).toHaveBeenCalledTimes(0);
    });

    test('should return a 400 status and send "Invalid token" if an invalid token is provided', () => {
        const req = httpMocks.createRequest({
            headers: { Authorization: 'Bearer invalid-token' },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        auth(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res._getData()).toBe('Invalid token');
        expect(next).toHaveBeenCalledTimes(0);
    });
});
