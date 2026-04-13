// Express router for all Service-related endpoints.
// Provides full CRUD operations for the Service model with role-based access control.
const express = require('express');
const router = express.Router();

const { Service } = require('../database/models');
const { requireAuth, requireRole } = require('../middleware/auth');
const checkIPAccess = require('../middleware/checkIPAccess');

// -------------------------
// GET /services
// Returns a list of all services in the system.
// Any authenticated user can access this.
// -------------------------
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// GET /services/:id
// Returns a single service by primary key.
// Any authenticated user can view details.
// -------------------------
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// GET /services/:id/access-check
// Checks whether the current authenticated user, from their current IP,
// is allowed to access this service based on IPRecord entries.
// -------------------------
router.get('/:id/access-check', requireAuth, checkIPAccess, async (req, res, next) => {
  try {
    // checkIPAccess already validated IP and service and attached them
    const service = req.service || (await Service.findByPk(req.params.id));

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.status(200).json({
      message: 'Access granted for this IP and user',
      service,
      ip: req.clientIp,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------
// POST /services
// Creates a new service.
// Restricted to admin users.
// 'name' is required and must be unique due to model constraints.
// -------------------------
router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Basic validation before hitting Sequelize validations
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newService = await Service.create({ name, description });

    res.status(201).json(newService);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// PUT /services/:id
// Updates an existing service. Only provided fields are updated.
// Restricted to admin users.
// -------------------------
router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description, active } = req.body;
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (active !== undefined) service.active = active;

    await service.save();
    res.json(service);
  } catch (err) {
    next(err);
  }
});

// -------------------------
// DELETE /services/:id
// Deletes a service permanently.
// Restricted to admin users.
// Returns 204 No Content on success.
// -------------------------
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const deleted = await Service.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Export router for use in app.js
module.exports = router;