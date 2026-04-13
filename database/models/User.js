// User model: represents system users who can be linked to IP records
// and associated with services through those IP records. 
// In the final project, users authenticate using email + password,
// and roles determine what actions they are allowed to perform.

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../setup');

class User extends Model {}

User.init(
  {
    // Display name for the user, required field
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    // Email must be unique—used for login and user identification
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },

    // Hashed password (plain text is NEVER stored)
    // This will be created using bcrypt during registration.
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // Role is used for authorization rules (admin, sec, client, etc.)
    role: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      defaultValue: 'client' 
    }
  },
  { 
    sequelize, 
    modelName: 'User' // Maps to Users table in SQLite
  }
);

module.exports = User;