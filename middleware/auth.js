// middleware/auth.js
// Handles JWT authentication and role-based authorization.

require('dotenv').config();
const jwt = require('jsonwebtoken');

// Authenticate any logged-in user via JWT
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7); // remove "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info from token to request
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('JWT verification error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired, please log in again' });
    }

    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Restrict route to specific roles
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};