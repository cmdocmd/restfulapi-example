const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./User');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

Post.belongsTo(User, { foreignKey: 'authorId', as: 'author'});

module.exports = Post;