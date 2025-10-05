const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  supplier_id: { type: DataTypes.INTEGER, allowNull: false },
  order_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'purchase_orders' });
module.exports = PurchaseOrder;
