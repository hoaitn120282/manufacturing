const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceHistory = sequelize.define('MaintenanceHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  maintenance_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'maintenance_orders',
      key: 'id'
    }
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  performed_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  performed_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  work_performed: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  parts_used: {
    type: DataTypes.JSON
  },
  time_spent: {
    type: DataTypes.INTEGER // minutes
  },
  cost: {
    type: DataTypes.DECIMAL(15, 2)
  },
  result: {
    type: DataTypes.ENUM('successful', 'partial', 'failed'),
    defaultValue: 'successful'
  },
  next_maintenance_date: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'maintenance_history'
});

module.exports = MaintenanceHistory;
