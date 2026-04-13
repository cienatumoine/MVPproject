// Load Sequelize instance and all models
const sequelize = require('../setup');
const User = require('./User');
const Service = require('./Service');
const IpRecord = require('./IpRecord');
const AccessLog = require('./AccessLog');

// ============================
// Model Relationships
// ============================

// A User can register multiple approved IP addresses
// Each IP record belongs to exactly one User
User.hasMany(IpRecord, { foreignKey: 'userId' });
IpRecord.belongsTo(User, { foreignKey: 'userId' });

// A Service can have many IP addresses associated with it
// Each IP record belongs to exactly one Service
Service.hasMany(IpRecord, { foreignKey: 'serviceId' });
IpRecord.belongsTo(Service, { foreignKey: 'serviceId' });

// Access logs track which user attempted access
// Each log entry must reference a User
User.hasMany(AccessLog, { foreignKey: 'userId' });
AccessLog.belongsTo(User, { foreignKey: 'userId' });

// Access logs also record the service being accessed
// Each log entry belongs to a single Service
Service.hasMany(AccessLog, { foreignKey: 'serviceId' });
AccessLog.belongsTo(Service, { foreignKey: 'serviceId' });

// Export Sequelize instance and all models for use in the app
module.exports = {
  sequelize,
  User,
  Service,
  IpRecord,
  AccessLog
};