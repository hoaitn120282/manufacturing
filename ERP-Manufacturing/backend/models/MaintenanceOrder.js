const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceOrder = sequelize.define('MaintenanceOrder', {
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
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  maintenance_type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'predictive', 'emergency'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  scheduled_date: {
    type: DataTypes.DATE
  },
  started_at: {
    type: DataTypes.DATE
  },
  completed_at: {
    type: DataTypes.DATE
  },
  estimated_duration: {
    type: DataTypes.INTEGER // minutes
  },
  actual_duration: {
    type: DataTypes.INTEGER // minutes
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  parts_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  labor_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  total_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'maintenance_orders'
});

module.exports = MaintenanceOrder;
