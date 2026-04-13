// Express router for handling all User-related endpoints
const express = require('express');
const router = express.Router();

// Import User model to interact with the users table
const { User } = require('../database/models');

// Auth + role middleware: only admins can manage users
const { requireAuth, requireRole } = require('../middleware/auth');

// Lock down entire /users router to admin-only
router.use(requireAuth, requireRole('admin'));

// ---------------------------------------------
// GET /users - Retrieve all users (admin only)
// ---------------------------------------------
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
// GET /users/:id - Retrieve a single user by ID (admin only)
// ---------------------------------------------
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role']
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
// POST /users - Create a new user (admin only)
// NOTE: Public registration should use /auth/register.
// ---------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const { name, email, role, passwordHash } = req.body;

    if (!name || !email || !passwordHash) {
      return res
        .status(400)
        .json({ error: 'Name, email, and passwordHash are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const newUser = await User.create({ name, email, role, passwordHash });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
// PUT /users/:id - Update an existing user (admin only)
// ---------------------------------------------
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
// DELETE /users/:id - Remove a user permanently (admin only)
// ---------------------------------------------
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });

    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Export router so it can be mounted in app.js
module.exports = router;