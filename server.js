// server.js
require('dotenv').config();

const app = require('./app');
const sequelize = require('./database/setup');

const PORT = process.env.PORT || 8000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();