const request = require('supertest');
const { app, bcrypt } = require('./index');
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

// Creating a new user TEST
describe('POST /auth/signup', () => {
    test('should create a new user', async () => {
        const user = {
            username: 'test',
            email: 'test@gmail.com',
            password: 'testpass'
        }
        const hashedPass = await bcrypt.hash(user.password, 10);
    
        User.create = jest.fn()
            .mockResolvedValueOnce({
                id: 1,
                username: user.username,
                email: user.email,
                password: hashedPass
            });
    
        const response = await request(app).post('/auth/signup').send(user);
    
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('User created successfully');
    });

    test('should return status 400 for invalid input', async () => {
        const user = {
            username: '',
            email: 'test@gmail.com',
            password: 'testpass'
        }

        const response = await request(app).post('/auth/signup').send(user);
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.text)).toEqual({ error: "Invalid input. Username, email, or password is empty or exceeds maximum length." });
    });

    test('should return status 500 for internal server error', async () => {
        User.create = jest.fn().mockRejectedValue(new Error('Database Error'));

        const user = {
            username: 'test',
            email: 'test@gmail.com',
            password: 'testpass'
        }

        const response = await request(app).post('/auth/signup').send(user);
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error')
    });
});