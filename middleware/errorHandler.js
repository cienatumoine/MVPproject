// Global error-handling middleware.
// This catches any errors thrown in routes, controllers, or Sequelize operations
// and ensures the API responds with a clean, consistent JSON structure.

const { requireAuth, requireRole } = require('../middleware/auth');


function errorHandler(err, req, res, next) {
    console.error('Error:', err); // Log full error details for debugging (not exposed to client)
  
    // Handle Sequelize validation and uniqueness errors.
    // These errors occur when input fails model validation or violates constraints.
    if (
      err.name === 'SequelizeValidationError' ||
      err.name === 'SequelizeUniqueConstraintError'
    ) {
      return res.status(400).json({
        error: 'Validation error',
        // Sequelize provides detailed messages describing which fields failed
        details: err.errors?.map(e => e.message) || []
      });
    }
  
    // Fallback for general server errors or custom errors that set err.status.
    const status = err.status || 500;
  
    // Return a clean error response without exposing stack traces.
    res.status(status).json({
      error: err.message || 'Internal server error'
    });
  }
  
  module.exports = errorHandler;
  