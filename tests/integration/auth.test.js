const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { config } = require('../../config/config');
const User = require('../../models/user');
const { server } = require('../../app');
const sendOTPEmail = require('../../mails/email').sendOTPEmail;
config.jwtPrivateKey = 'test_private_key';



jest.mock('../../mails/email', () => {
    return {
        sendOTPEmail: jest.fn(),
    };
});

// Set up test data and clean up
beforeAll(async () => {
    const password = await bcrypt.hash('TestPassword123', 10);
    const user = new User({ username: 'testuser', email: 'test@example.com', password });
    await user.save();
});

afterAll(async () => {
    await User.deleteMany();
});


describe('POST /auth', () => {
    test('should return a token and username when valid credentials are provided', async () => {
        const response = await request(server)
            .post('/api/auth')
            .send({ username: 'testuser', password: 'TestPassword123' });

        if (response.status !== 200) {
            console.log('Error response body:', response.body);
        }

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('username', 'testuser');
    });

    test('should return an error when invalid credentials are provided', async () => {
        const response = await request(server)
            .post('/api/auth')
            .send({ username: 'testuser', password: 'WrongPassword' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('msg', 'Invalid username or password');
    });
});
