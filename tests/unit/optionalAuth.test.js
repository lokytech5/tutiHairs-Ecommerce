const jwt = require('jsonwebtoken');
const optionalAuth = require('../../middleware/optionalAuth');
const httpMocks = require('node-mocks-http');
const { config } = require('../../config/config');

// Set a temporary jwtPrivateKey value for testing
config.jwtPrivateKey = 'test_private_key';

describe('optionalAuth middleware', () => {
    const validToken = jwt.sign({ id: 1, isAdmin: true }, config.jwtPrivateKey);

    test('should call next() and set req.user to null if no token is provided', () => {
        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
        const next = jest.fn();

        optionalAuth(req, res, next);

        expect(req.user).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('should call next() and set req.user to decoded payload if a valid token is provided', () => {
        const req = httpMocks.createRequest({
            cookies: { token: validToken },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        optionalAuth(req, res, next);

        expect(req.user).toBeDefined();
        expect(req.user.id).toBe(1);
        expect(req.user.isAdmin).toBe(true);
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('should call next() and set req.user to null if an invalid token is provided', () => {
        const req = httpMocks.createRequest({
            cookies: { token: 'invalid-token' },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        optionalAuth(req, res, next);

        expect(req.user).toBeNull();
        expect(next).toHaveBeenCalledTimes(1);
    });
});
