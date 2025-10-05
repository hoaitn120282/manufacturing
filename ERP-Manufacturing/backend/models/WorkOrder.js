const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  work_order_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  production_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'production_orders',
      key: 'id'
    }
  },
  work_center: {
    type: DataTypes.STRING,
    allowNull: false
  },
  operation_sequence: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  operation_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  planned_start_time: {
    type: DataTypes.DATE
  },
  planned_end_time: {
    type: DataTypes.DATE
  },
  actual_start_time: {
    type: DataTypes.DATE
  },
  actual_end_time: {
    type: DataTypes.DATE
  },
  standard_hours: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0
  },
  actual_hours: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'on_hold'),
    defaultValue: 'not_started'
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'work_orders'
});

module.exports = WorkOrder;