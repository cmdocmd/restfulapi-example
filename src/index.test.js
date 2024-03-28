const request = require('supertest');
const { app, bcrypt, jwt } = require('./index');

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

// Login User Test
describe('POST /auth/login', () => {
    test('should login a user with valid credentials', async () => {
        const user = {
            email: 'test@gmail.com',
            password: 'testpass'
        }

        User.findOne = jest.fn().mockResolvedValue({
            id: 1,
            email: user.email,
            password: await bcrypt.hash(user.password, 10)
        });

        const response = await request(app).post('/auth/login').send(user);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
    });

    test('should return an error for invalid credentials', async () => {
        const user = {
            email: 'test@gmail.com',
            password: 'invalidpass'
        }
        User.findOne = jest.fn().mockResolvedValue(null);
        const response = await request(app).post('/auth/login').send(user);

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({ error: 'Invalid email or password' });
    });

    test('should handle server errors', async () => {
        const user = {
            email: 'test@gmail.com',
            password: 'testpass'
        }

        User.findOne = jest.fn().mockResolvedValue(new Error('Database Error'));
        const response = await request(app).post('/auth/login').send(user);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({error: 'Internal Server Error'});
    });
});

// Retrieve a user with specific id test
describe('GET /users/:id', () => {
    test('should retrieve a user by id', async () => {
        const user = {
            id: 1,
            username: 'test',
            email: 'test@gmail.com',
            password: 'testpass'
        }

        User.findByPk = jest.fn().mockResolvedValue(user);

        const response = await request(app).get('/users/1');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(user);
    });

    test('should handle invalid id parameter', async () => {
        const response = await request(app).get('/users/abc');

        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Invalid ID parameter. It must be an Integer');
    });

    test('should handle user not found', async () => {
        User.findByPk = jest.fn().mockResolvedValue(null);
        const response = await request(app).get('/users/990');

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('User not found');
    });

    test('should handle internal server errors', async () => {
        User.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/users/1');

        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});

// Update details of a specific user
describe('PUT /users/:id', () => {
    test('should update a user by id', async () => {
        const user = {
            id: 1,
            username: 'test',
            email: 'test@gmail.com',
            password: 'testpass'
        };

        const updatedUser = {
            id: 1,
            username: 'updated_test',
            email: 'updated_test@gmail.com',
            password: 'updated_testpass'
        };

        User.findByPk = jest.fn().mockResolvedValue(user);
        User.update = jest.fn().mockResolvedValue(updatedUser);

        const response = await request(app)
            .put('/users/1')
            .send({
                username: 'updated_test',
                email: 'updated_test@gmail.com',
                password: 'updated_testpass'
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('User updated successfully');
    });

    test('should handle invalid id parameter', async () => {
        const response = await request(app).put('/users/abc');

        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Invalid ID parameter. It must be an Integer');
    });

    test('should handle user not found', async () => {
        User.findByPk = jest.fn().mockResolvedValue(null);

        const response = await request(app).put('/users/990');

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('User not found');
    });
    
    test('should handle server errors', async () => {
        User.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/users/1')
            .send({
                username: 'updated_test',
                email: 'updated_test@gmail.com',
                password: 'updated_testpass'
            });

        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });    
});

// Delete a specific user TEST
describe('DELETE /users/:id', () => {
    test('should delete a user with specific id', async () => {
        const user = {
            id: 1,
            username: 'test',
            email: 'test@gmail.com',
            password: 'testpass'
        }

        User.findByPk = jest.fn().mockResolvedValue(user);
        user.destroy = jest.fn().mockResolvedValue();

        const response = await request(app).delete('/users/1');

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('User deleted successfuly');
        expect(User.findByPk).toHaveBeenCalledWith("1");
        expect(user.destroy).toHaveBeenCalled();
    });

    test('should handle invalid id parameter', async () => {
        const response = await request(app).delete('/users/abc');

        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Invalid ID parameter. It must be an Integer');
    });

    test('should handle user not found', async () => {
        User.findByPk = jest.fn().mockResolvedValue(null);

        const response = await request(app).delete('/users/990');

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('User not found');
    });

    test('should handle server errors', async () => {
        User.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

        const response = await request(app).delete('/users/1');

        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});

// Retrieve a list of all posts Test
describe('GET /posts', () => {
    test('should return a list of all posts', async () => {
        const mockPosts = [
            { id: 1, title: 'Post 1', content: 'Content 1' },
            { id: 2, title: 'Post 2', content: 'Content 2' }
        ];
        Post.findAll = jest.fn().mockResolvedValue(mockPosts);

        const response = await request(app).get('/posts');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockPosts);
        expect(Post.findAll).toHaveBeenCalled();
    });
    test('should handle server errors', async () => {
        Post.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/posts');
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});

// Create a new post Test
describe('POST /posts', () => {
    test('should create a new post', async () => {
        const postData = {
            title: 'Test Post',
            content: 'Test Content',
            authorId: 123
        };

        Post.create = jest.fn()
        .mockResolvedValueOnce({ 
            title: postData.title,
            content: postData.content,
            authorId: postData.authorId
        });

        const token = jwt.sign({ userId: 123 }, 'wfh13102003');

        const response = await request(app)
            .post('/posts')
            .set('Authorization', token)
            .send(postData);

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Post created successfully');
    });

    test('should handle invalid authorid', async () => {
        const invalidPostData = {
            title: 'Test Post',
            content: 'Test Content',
            authorId: 'invalid'
        };
        const token = jwt.sign({ userId: 123 }, 'wfh13102003');

        const response = await request(app)
            .post('/posts')
            .set('Authorization', token)
            .send(invalidPostData);

        expect(response.statusCode).toBe(400);
    });

    test('should return 400 if title or content is empty or exceeds maximum length', async () => {
        const invalidPostData = {
            title: '',
            content: 'a'.repeat(256),
            authorId: 123
        };

        const token = jwt.sign({ userId: 123 }, 'wfh13102003');

        const response = await request(app)
            .post('/posts')
            .set('Authorization', token)
            .send(invalidPostData);

        expect(response.statusCode).toBe(400);
    });

    test('should handle internal server error', async () => {
        const postData = {
            title: 'Test Post',
            content: 'Test Content',
            authorId: 123
        };

        Post.create = jest.fn().mockImplementationOnce(() => {
            throw new Error('Sample Error');
        });

        const token = jwt.sign({ userId: 123 }, 'wfh13102003');

        const response = await request(app)
            .post('/posts')
            .set('Authorization', token)
            .send(postData);

        expect(response.statusCode).toBe(500);
    });
});

// Retrieve details of specific post test
describe('GET /posts/:id', () => {
    test('should retrieve a post with specific id', async () => {
        const post = {
            id: 1,
            title: 'Test Title',
            content: 'Test Content'
        }

        Post.findByPk = jest.fn().mockResolvedValueOnce(post);

        const response = await request(app).get('/posts/1');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(post);
    });

    test('should handle invalid id parameter', async () => {
        const response = await request(app).get('/posts/abc');

        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Invalid ID parameter. It must be an Integer');
    });

    test('should handle post not found', async () => {
        User.findByPk = jest.fn().mockResolvedValue(null);
        const response = await request(app).get('/posts/990');

        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('Post not found');
    });

    test('should handle internal server errors', async () => {
        Post.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/posts/1');

        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });

});

// Update details of specific post
describe('PUT /posts/:id', () => {
    const token = jwt.sign({ userId: 123 }, 'wfh13102003');
    test('should update details of specific post', async () => {
        
        const post = {
            title: 'Updated Title',
            content: 'Updated Content',
            authorId: 2
        }

        Post.findByPk = jest.fn().mockResolvedValueOnce({id:1, title: 'Test Title', content: 'Test Content', authorId: 2});
        Post.update = jest.fn().mockResolvedValueOnce([1]);

        const response = await request(app).put('/posts/2').set('Authorization', token).send(post);

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Post updated successfully');
    });

    test('should handle invalid id', async () => {
        const response = await request(app).put('/posts/invalid').set('Authorization', token).send({});

        expect(response.statusCode).toBe(400);
    });

    test('should handle post not found', async () => {
        Post.findByPk = jest.fn().mockResolvedValue(null);
        const response = await request(app).put('/posts/999').set('Authorization', token).send({});

        expect(response.statusCode).toBe(404);
    });

    test('should handle internal server error', async () => {
        Post.findByPk = jest.fn().mockImplementationOnce(() => {
            throw new Error('Database Error');
        });

        const response = await request(app).put('/posts/1').set('Authorization', token).send({});

        expect(response.statusCode).toBe(500);
    });
});