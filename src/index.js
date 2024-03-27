const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Post = require('../models/Post');
const User = require('../models/User');

const app = express();
const PORT = 3500; // PORT Number 

app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors()); // allow cors to prevent browser from blocking it.

const AuthenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    jwt.verify(token, "wfh13102003", (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
}

// Retrieve a list of all users
app.get('/users', async (req, res) => {
    try {
        const UsersList = await User.findAll();
        res.json(UsersList);
    } catch (err) { // error handeling
        console.error('Error retrieving users: ', err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Creating a new user using POST request
app.post('/auth/signup', async (req, res) => {
    try {
    const {username, email, password} = req.body // POST request uses Body
    if (username === "" || email === "" || password === "" || username.length > 255 || email.length > 255 || password.length > 255)
    {
        return res.status(400).json({ error: "Invalid input. Username, email, or password is empty or exceeds maximum length." });
    }
    const hashedPass = await bcrypt.hash(password, 10); // Hashing password
        const newUser = await User.create({
            username: username,
            email: email,
            password: hashedPass
        });
        res.send('User created successfully: ' + JSON.stringify(newUser));
    } catch (err) {
        console.error('Error creating a new user: ', err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// User Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password} = req.body;
        if (email === "" || password === "" || email.length > 255 || password.length > 255)
        {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const user = await User.findOne({where: { email }});
        if (!user)
        {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, 'wfh13102003', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (err)
    {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Retrieve details of specific user
app.get('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            return res.status(400).send("Invalid ID parameter. It must be an Integer");
        }
        const user = await User.findByPk(id);
        if (!user)
        {
            return res.status(404).send('User not found');
        }
        res.send('Retreieved User with id: ' + id + " " + JSON.stringify(user));

    } catch (err) {
            console.error('Error retreving user with id: ' + id, err); // show console error
            res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Update details of specific user
app.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { username, email, password } = req.body;

        if (username.length > 255 || email.length > 255 || password.length > 255)
        {
            return res.status(400).json({ error: "Invalid input. Username, email, or password is exceeds maximum length." });
        }

        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            return res.status(400).send("Invalid ID parameter. It must be an Integer");
        }

        const user = await User.findByPk(id); 

        if (!user)
        {
            return res.status(404).send('User not found');
        }

        await user.update({
            username: username || user.username, // in case username is not provided keep the default one.
            email: email || user.email, //
            password: password || user.password //
        });

        res.send('User updated successfully');
    } catch (err) {
        console.error('Error in updating user with id: ' + id, err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Delete a specific user
app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;

        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {  
            return res.status(400).send("Invalid ID parameter. It must be an Integer");
        }
        const user = await User.findByPk(id); 
        if (!user)
        {
            return res.status(404).send('User not found');
        }
        await user.destroy();

        res.send("User deleted successfuly");
    } catch (err) {
        console.error('Error in deleting user with id: ' + id, err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Retrieve a list of all posts
app.get('/posts', async (req, res) => {
    try {
        const UsersList = await Post.findAll();
        res.json(UsersList);
    } catch (err) { // error handeling
        console.error('Error retrieving posts: ', err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Create a new post
app.post("/posts", AuthenticateToken, async (req, res) => {
    try {
        const {title, content, authorId} = req.body 

        if (!Number.isInteger(parseInt(authorId))) // Invalid authorId
        {  
            return res.status(400).send("Invalid ID parameter. It must be an Integer");
        }

        if (title === "" || content === "" || title.length > 255)
        {
            return res.status(400).json({ error: "Invalid input. title or content is empty or exceeds maximum length." });
        }
            const newPost = await Post.create({
                title: title,
                content: content,
                authorId: authorId
            });
            res.send('Post created successfully: ' + JSON.stringify(newPost));
        } catch (err) {
            console.error('Error creating a new Post: ', err); // show console error
            res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Retrieve details of specific post
app.get('/posts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            return res.status(400).send("Invalid ID parameter. It must be an Integer");
        }
        const post = await Post.findByPk(id);
        if (!post)
        {
            return res.status(404).send('Post not found');
        }
        res.send('Retreieved Post with id: ' + id + " " + JSON.stringify(post));

    } catch (err) {
            console.error('Error retreving post with id: ' + id, err); // show console error
            res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Update details of specific post
app.put('/posts/:id', AuthenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { title, content, authorId } = req.body;

        if (title.length > 255)
        {
            res.status(400).json({ error: "Invalid input. title is exceeds maximum length." });
        }

        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            return res.status(400).send("Invalid ID parameter. It must be an Integer");
        }

        const post = await Post.findByPk(id);
        if (!post)
        {
            return res.status(404).send('Post not found');
        }

        await post.update({
            title: title || post.title, // in case title is not provided keep the default one.
            content: content || post.content, //
            authorId: authorId || post.authorId //
        });

        res.send('Post updated successfully');
    } catch (err) {
        console.error('Error in updating post with id: ' + id, err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Delete a specific post
app.delete('/posts/:id', AuthenticateToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            return res.status(400).send("Invalid ID parameter. It must be an Integer");
        }
        const post = await Post.findByPk(id); 
        if (!post)
        {
            return res.status(404).send('Post not found');
        }

        await post.destroy();

        res.send("Post deleted successfuly");
    } catch (err) {
        console.error('Error in deleting post with id: ' + id, err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});


app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT} Port`);
});