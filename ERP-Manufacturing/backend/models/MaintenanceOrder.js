const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const MaintenanceOrder = sequelize.define('MaintenanceOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  equipment_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'maintenance_orders' });
module.exports = MaintenanceOrder;
