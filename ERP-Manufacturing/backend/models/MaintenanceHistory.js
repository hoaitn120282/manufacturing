const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const MaintenanceHistory = sequelize.define('MaintenanceHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  equipment_id: { type: DataTypes.INTEGER, allowNull: false },
  maintenance_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'maintenance_history' });
module.exports = MaintenanceHistory;
