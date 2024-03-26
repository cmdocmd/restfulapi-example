const express = require('express');
const bodyParser = require('body-parser');

const Post = require('../models/Post');
const User = require('../models/User');

const app = express();
const PORT = 3500; // PORT Number 

app.use(bodyParser.json());

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

app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT} Port`);
});