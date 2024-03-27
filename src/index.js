const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const Post = require('../models/Post');
const User = require('../models/User');

const app = express();
const PORT = 3500; // PORT Number 

app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors()); // allow cors to prevent browser from blocking it.

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
app.post('/users', async (req, res) => {
    try {
    const {username, email, password} = req.body // POST request uses Body

        const newUser = await User.create({
            username: username,
            email: email,
            password: password
        });
        res.send('User created successfully: ' + JSON.stringify(newUser));
    } catch (err) {
        console.error('Error creating a new user: ', err); // show console error
        res.status(500).send("Internal Server Error"); // reply with an error
    }
});

// Retrieve details of specific user
app.get('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            res.status(400).send("Invalid ID parameter. It must be an Integer");   
            return;
        }
        const user = await User.findByPk(id); // TODO handle NULL
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

        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            res.status(400).send("Invalid ID parameter. It must be an Integer");   
            return;
        }

        const user = await User.findByPk(id); // TODO handle NULL

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
        const { username, email, password } = req.body;

        if (!Number.isInteger(parseInt(id))) // Invalid ID
        {
            res.status(400).send("Invalid ID parameter. It must be an Integer");   
            return;
        }
        const user = await User.findByPk(id); // TODO handle NULL

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
app.post("/posts", async (req, res) => {
    try {
        const {title, content, authorId} = req.body 
    
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
            res.status(400).send("Invalid ID parameter. It must be an Integer");   
            return;
        }
        const post = await Post.findByPk(id); // TODO handle NULL
        res.send('Retreieved Post with id: ' + id + " " + JSON.stringify(post));

    } catch (err) {
            console.error('Error retreving post with id: ' + id, err); // show console error
            res.status(500).send("Internal Server Error"); // reply with an error
    }
});


app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT} Port`);
});