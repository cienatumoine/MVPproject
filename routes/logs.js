// Express router for all Log-related endpoints.
// Provides read-only access to logs with role-based access control.

const express = require('express');
const router = express.Router();

const { Log } = require('../database/models'); // make sure Log exists in your models index
const { requireAuth, requireRole } = require('../middleware/auth');

// -------------------------
// GET /logs
// Admins and auditors can see all logs.
// -------------------------
router.get(
  '/',
  requireAuth,
  requireRole('admin', 'auditor'),
  async (req, res, next) => {
    try {
      const logs = await Log.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.json(logs);
    } catch (err) {
      next(err);
    }
  }
);

// -------------------------
// GET /logs/:id
// Admins and auditors can view a single log entry.
// -------------------------
router.get(
  '/:id',
  requireAuth,
  requireRole('admin', 'auditor'),
  async (req, res, next) => {
    try {
      const log = await Log.findByPk(req.params.id);

      if (!log) {
        return res.status(404).json({ error: 'Log not found' });
      }

      res.json(log);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;