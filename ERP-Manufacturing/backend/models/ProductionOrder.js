const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductionOrder = sequelize.define('ProductionOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity_planned: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  quantity_produced: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  quantity_rejected: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_start_date: {
    type: DataTypes.DATE
  },
  actual_end_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('planned', 'released', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'planned'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sales_order_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'sales_orders',
      key: 'id'
    }
  }
}, {
  tableName: 'production_orders'
});

module.exports = ProductionOrder;