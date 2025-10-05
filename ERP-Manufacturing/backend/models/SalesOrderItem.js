const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SalesOrderItem = sequelize.define('SalesOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sales_orders',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  line_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity_ordered: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  quantity_shipped: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  line_total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  required_date: {
    type: DataTypes.DATE
  },
  promised_date: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'sales_order_items'
});

module.exports = SalesOrderItem;