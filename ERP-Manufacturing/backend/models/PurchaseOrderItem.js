const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  purchase_order_id: { type: DataTypes.INTEGER, allowNull: false },
  item_id: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
}, { tableName: 'purchase_order_items' });
module.exports = PurchaseOrderItem;
