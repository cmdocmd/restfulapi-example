const request = require('supertest');
const app = require('./index');
const Post = require('../models/Post');
const User = require('../models/User');

// Retrieve a list of all users TEST
describe('GET /users', () => {
    test('should return a list of users', async () => {

        const mockUsers = [
            { id: 1, username: 'ahmed', email: 'ahmed@gmail.com' },
            { id: 2, username: 'ammar', email: 'ammar@gmail.com' },
            { id: 3, username: 'yazan', email: 'yazan@gmail.com' },
        ];

        User.findAll = jest.fn().mockResolvedValue(mockUsers);
        const response = await request(app).get('/users');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockUsers);

    });
    it('should handle errors and return 500 status', async () => {
        User.findAll = jest.fn().mockRejectedValue(new Error('Database error'));
        const response = await request(app).get('/users');
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});