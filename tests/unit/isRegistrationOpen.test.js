const isRegistrationOpen = require('../../middleware/isRegistrationOpen');
const httpMocks = require('node-mocks-http');
const TrainingClass = require('../../models/trainingClass');

jest.mock('../../models/trainingClass');

describe('isRegistrationOpen middleware', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should call next() if the training class registration is open', async () => {
        const trainingClass = {
            _id: '1',
            registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // One day in the future
            maxRegistrations: 5,
            participants: [],
        };

        TrainingClass.findById = jest.fn().mockResolvedValue(trainingClass);

        const req = httpMocks.createRequest({
            params: { id: '1' },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await isRegistrationOpen(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    test('should return a 404 status and error message if training class is not found', async () => {
        TrainingClass.findById = jest.fn().mockResolvedValue(null);

        const req = httpMocks.createRequest({
            params: { id: '1' },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await isRegistrationOpen(req, res, next);

        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Training class not found' });
        expect(next).toHaveBeenCalledTimes(0);
    });

    // ... more tests

    test('should return a 403 status and error message if registration is closed due to deadline', async () => {
        const trainingClass = {
            _id: '1',
            registrationDeadline: new Date(Date.now() - 1000 * 60 * 60 * 24), // One day in the past
            maxRegistrations: 5,
            participants: [],
        };

        TrainingClass.findById = jest.fn().mockResolvedValue(trainingClass);

        const req = httpMocks.createRequest({
            params: { id: '1' },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await isRegistrationOpen(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Registration is closed for this training class' });
        expect(next).toHaveBeenCalledTimes(0);
    });


    test('should return a 403 status and error message if registration is closed due to reaching maximum registrations', async () => {
        const trainingClass = {
            _id: '1',
            registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24), // One day in the future
            maxRegistrations: 1,
            participants: [{ userId: '1' }], // Already one participant registered
        };

        TrainingClass.findById = jest.fn().mockResolvedValue(trainingClass);

        const req = httpMocks.createRequest({
            params: { id: '1' },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await isRegistrationOpen(req, res, next);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Registration is closed for this training class, maximum registrations reached' });
        expect(next).toHaveBeenCalledTimes(0);
    });


    test('should return a 500 status and error message if there is an error', async () => {
        TrainingClass.findById = jest.fn().mockRejectedValue(new Error('Database error'));

        const req = httpMocks.createRequest({
            params: { id: '1' },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await isRegistrationOpen(req, res, next);

        expect(res.statusCode).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Database error' });
        expect(next).toHaveBeenCalledTimes(0);
    });

});
