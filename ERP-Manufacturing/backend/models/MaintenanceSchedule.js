const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  equipment_id: { type: DataTypes.INTEGER, allowNull: false },
  scheduled_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'maintenance_schedules' });
module.exports = MaintenanceSchedule;
