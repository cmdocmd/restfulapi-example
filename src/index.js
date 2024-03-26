const express = require('express');
const bodyParser = require('body-parser');

const Post = require('../models/Post');
const User = require('../models/User');

const app = express();
const PORT = 3500; // PORT Number 

app.use(bodyParser.json());

app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT} Port`);
});