const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Equipment = sequelize.define('Equipment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('active', 'maintenance', 'inactive'), defaultValue: 'active' }
}, { tableName: 'equipment' });
module.exports = Equipment;
