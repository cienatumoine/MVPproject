// app.js
require('dotenv').config();

const express = require('express');
const app = express();

const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const ipRoutes = require('./routes/ipRecords');
const logRoutes = require('./routes/logs');
const authRoutes = require('./routes/auth');

const { requireAuth, requireRole } = require('./middleware/auth');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Core middleware
app.use(express.json());
app.use(logger);

// Public auth routes
app.use('/auth', authRoutes);

// Protected / RBAC routes
app.use(
  '/users',
  requireAuth,
  requireRole('admin'), // only admins manage users
  userRoutes
);

// Example: services available to authenticated users
app.use('/services', requireAuth, serviceRoutes);

// Example: IP records available to admins + security roles
app.use(
  '/ips',
  requireAuth,
  requireRole('admin', 'security'),
  ipRoutes
);

// Example: logs available to admins and auditors
app.use(
  '/logs',
  requireAuth,
  requireRole('admin', 'auditor'),
  logRoutes
);

//API Splash screen
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>IP Access Control API</title>
        <style>
          body {
            background: #0d0d0d;
            color: #cfcfcf;
            font-family: Arial, sans-serif;
            padding: 40px;
          }
          h1 {
            color: #6abdfc;
          }
          .tag {
            background: #222;
            padding: 6px 10px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 10px;
            font-size: 14px;
            color: #8ae2a3;
          }
          a {
            color: #6abdfc;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1> IP Access Control API</h1>
        <p>Your API is running successfully on Render.</p>

        <div class="tag">Authentication Ready</div>
        <div class="tag">Role-based Authorization</div>
        <div class="tag">IP Address Restrictions</div>
        <div class="tag">Sequelize + SQLite</div>

        <h3 style="margin-top:30px;">📘 Documentation</h3>
        <p>
          Use the Postman Collection to interact with protected endpoints:<br>
          👉 <a href="https://documenter.getpostman.com/view/48299445/2sBXitDTLB " target="_blank">
            Open Postman Documentation
          </a>
        </p>

        <h3> Status: Live</h3>
        <p>Requests may take a few seconds to wake the service on the free tier.</p>
      </body>
    </html>
  `);
});




// Error handler
app.use(errorHandler);

module.exports = app;