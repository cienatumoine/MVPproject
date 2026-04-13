// routes/auth.js
// Handles user registration, login, and logout.

require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const { User } = require('../database/models');
const { requireAuth } = require('../middleware/auth');

// Helper: generate JWT for a user
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
}

// ---------------------------------------------
// POST /auth/register
// Public registration endpoint
// ---------------------------------------------
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'client' } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      role,
      passwordHash
    });

    // Return user info (without password) + token if you want
    const token = generateToken(newUser);

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
// POST /auth/login
// Authenticates a user and returns a JWT
// ---------------------------------------------
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------
// POST /auth/logout
// For JWT (stateless), just a placeholder
// ---------------------------------------------
router.post('/logout', requireAuth, (req, res) => {
  // In stateless JWT, logout is handled client-side by discarding the token.
  // Here we just respond OK so the client can clear its stored token.
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;