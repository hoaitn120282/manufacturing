const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  },
  maintenance_type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'predictive'),
    allowNull: false,
    defaultValue: 'preventive'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estimated_duration: {
    type: DataTypes.INTEGER // minutes
  },
  frequency_days: {
    type: DataTypes.INTEGER // frequency in days
  },
  last_performed: {
    type: DataTypes.DATE
  },
  next_due: {
    type: DataTypes.DATE
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'overdue', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'maintenance_schedules'
});

module.exports = MaintenanceSchedule;
