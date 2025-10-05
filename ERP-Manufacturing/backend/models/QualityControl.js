const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualityControl = sequelize.define('QualityControl', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inspection_number: {
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
  production_order_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'production_orders',
      key: 'id'
    }
  },
  batch_number: {
    type: DataTypes.STRING
  },
  quantity_inspected: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  quantity_passed: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  quantity_failed: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  inspection_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  inspector_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  inspection_type: {
    type: DataTypes.ENUM('incoming', 'in_process', 'final', 'audit'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'passed', 'failed', 'conditional'),
    defaultValue: 'pending'
  },
  overall_result: {
    type: DataTypes.ENUM('pass', 'fail', 'conditional'),
    defaultValue: 'pass'
  },
  defects_found: {
    type: DataTypes.TEXT
  },
  corrective_actions: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'quality_controls'
});

module.exports = QualityControl;