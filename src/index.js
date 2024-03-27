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



app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT} Port`);
});