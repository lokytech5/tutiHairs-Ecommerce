const admin = require('../../middleware/admin');
const httpMocks = require('node-mocks-http');

describe('admin middleware', () => {
    test('should call next() if user is an admin', () => {
        const req = httpMocks.createRequest({ user: { isAdmin: true } });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        admin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test('should return a 403 status and send "Access Denied not an Administrator" if user is not an admin', () => {
        const req = httpMocks.createRequest({ user: { isAdmin: false } });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        admin(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(res._getData()).toBe('Access Denied not an Administrator');
        expect(next).toHaveBeenCalledTimes(0);
    });
});
