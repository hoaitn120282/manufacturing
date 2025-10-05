const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shipment_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sales_orders',
      key: 'id'
    }
  },
  ship_date: {
    type: DataTypes.DATE
  },
  delivery_date: {
    type: DataTypes.DATE
  },
  tracking_number: {
    type: DataTypes.STRING
  },
  carrier: {
    type: DataTypes.STRING
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('preparing', 'shipped', 'in_transit', 'delivered', 'returned'),
    defaultValue: 'preparing'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'shipments'
});

module.exports = Shipment;