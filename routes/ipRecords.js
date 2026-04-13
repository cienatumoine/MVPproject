// routes/ipRecords.js
// Handles CRUD operations for approved IPs.
// Each IP is tied to a user and a service.

const express = require('express');
const router = express.Router();

const { IpRecord } = require('../database/models');
const { requireAuth } = require('../middleware/auth');

// -------------------------
// GET /ips
// Admin: see all IP records
// Client: see only their own
// -------------------------
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const where =
      req.user.role === 'admin'
        ? {}
        : { userId: req.user.id }; // match model field names

    const ips = await IpRecord.findAll({ where });
    res.json(ips);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// GET /ips/:id
// Admin: can see any record
// Client: can only see their own
// -------------------------
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const ip = await IpRecord.findByPk(req.params.id);

    if (!ip) {
      return res.status(404).json({ error: 'IP record not found' });
    }

    // ownership check for non-admins
    if (req.user.role !== 'admin' && ip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your IP record' });
    }

    res.json(ip);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// POST /ips
// Creates a new IP record for the authenticated user.
// userId comes from req.user.id (never from the body).
// -------------------------
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { serviceId, ipAddress, label } = req.body;

    if (!ipAddress || !serviceId) {
      return res
        .status(400)
        .json({ error: 'ipAddress and serviceId are required' });
    }

    const newRecord = await IpRecord.create({
      ipAddress,
      label,
      serviceId,        // <-- lowercase, matches model
      userId: req.user.id // <-- lowercase, matches model
    });

    res.status(201).json(newRecord);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// PUT /ips/:id
// Admin: can update any record
// Client: can only update their own
// -------------------------
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { ipAddress, label, serviceId } = req.body;

    const ip = await IpRecord.findByPk(req.params.id);
    if (!ip) {
      return res.status(404).json({ error: 'IP record not found' });
    }

    // ownership check for non-admins
    if (req.user.role !== 'admin' && ip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your IP record' });
    }

    if (ipAddress !== undefined) ip.ipAddress = ipAddress;
    if (label !== undefined) ip.label = label;
    if (serviceId !== undefined) ip.serviceId = serviceId;

    await ip.save();
    res.json(ip);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// DELETE /ips/:id
// Admin: can delete any record
// Client: can delete only their own
// -------------------------
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const ip = await IpRecord.findByPk(req.params.id);
    if (!ip) {
      return res.status(404).json({ error: 'IP record not found' });
    }

    if (req.user.role !== 'admin' && ip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: not your IP record' });
    }

    await ip.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;