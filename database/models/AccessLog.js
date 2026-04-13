// AccessLog model: stores every access attempt made to the system.
// This table allows auditors and security teams to review which IPs attempted access,
// whether the request was allowed or denied, and why.

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../setup');

class AccessLog extends Model {}

AccessLog.init(
  {
    // The IP address that attempted access
    ipAddressTried: { type: DataTypes.STRING, allowNull: false },

    // The system's decision for this attempt ("allowed" or "denied")
    decision: { type: DataTypes.STRING, allowNull: false },

    // Optional explanation for the decision (ex: "IP not recognized", "Service mismatch")
    reason: { type: DataTypes.STRING },

    // Optional reference to the user associated with this IP (if known)
    userId: { type: DataTypes.INTEGER, allowNull: true },

    // Optional reference to the service the IP attempted to access
    serviceId: { type: DataTypes.INTEGER, allowNull: true }
  },
  {
    sequelize,
    modelName: 'AccessLog' // Table name will be "AccessLogs"
  }
);

module.exports = AccessLog;