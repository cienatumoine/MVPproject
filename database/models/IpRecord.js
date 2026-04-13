const { DataTypes, Model } = require('sequelize');
const sequelize = require('../setup');

// IpRecord model:
// Stores approved IP addresses and the user/service they belong to.
// This table is central to the access control system.
class IpRecord extends Model {}

IpRecord.init(
  {
    // The actual IP address being approved for access
    ipAddress: { type: DataTypes.STRING, allowNull: false },

    // Optional human-readable label (e.g., "Office Router", "VPN Gateway")
    label: { type: DataTypes.STRING },

    // Foreign key: the user this IP address belongs to
    userId: { type: DataTypes.INTEGER, allowNull: false },

    // Foreign key: service that this IP has access to (optional)
    serviceId: { type: DataTypes.INTEGER, allowNull: true }
  },
  {
    // Link model to the Sequelize connection
    sequelize,

    // Table name will be "IpRecords" by default
    modelName: 'IpRecord'
  }
);

module.exports = IpRecord;