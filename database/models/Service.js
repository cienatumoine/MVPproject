// Service model:
// Represents an internal application or tool that requires IP-based access control.
// Each Service can be linked to multiple IP Records, defining which IPs are allowed.

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../setup');

class Service extends Model {}

Service.init(
  {
    // Unique name of the service (e.g., "InternalDashboard").
    // Must be unique to prevent duplicate service entries.
    name: { type: DataTypes.STRING, allowNull: false, unique: true },

    // Optional description of what the service does.
    description: { type: DataTypes.TEXT },

    // Whether the service is currently active.
    // Services can be toggled instead of deleted.
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
  },
  {
    // Pass initialized Sequelize instance and define model name.
    sequelize,
    modelName: 'Service'
  }
);

module.exports = Service;