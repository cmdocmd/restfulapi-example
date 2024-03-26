const { Sequelize } = require('sequelize');

//schema name, username, password
const sequelize = new Sequelize("nanovoltz", "root", "wfh13102003", {
    host: "localhost",
    dialect: "mysql"
});

module.exports = sequelize;
