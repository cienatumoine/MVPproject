// Express router for handling access log retrieval
const express = require('express');
const router = express.Router();

// Import AccessLog model to query stored log entries
const { AccessLog } = require('../database/models');

// -------------------------------------------------------
// GET /logs - Return all access logs in the system
// Used for auditing and debugging access attempts.
// -------------------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    // Retrieve every log entry from the database
    const logs = await AccessLog.findAll();
    res.json(logs);
  } catch (err) {
    // Pass errors to centralized error handler middleware
    next(err);
  }
});

// Export router so it can be mounted in app.js
module.exports = router;