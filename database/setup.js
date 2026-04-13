// database/setup.js

const { Sequelize } = require('sequelize');

// Create Sequelize instance (SQLite for MVP project)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false, // optional: hides SQL logs during tests
});

module.exports = sequelize;