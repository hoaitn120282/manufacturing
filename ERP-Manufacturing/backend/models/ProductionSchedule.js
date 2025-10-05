const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductionSchedule = sequelize.define('ProductionSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  production_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'production_orders',
      key: 'id'
    }
  },
  scheduled_start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  scheduled_end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  work_center: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity_required: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed'),
    defaultValue: 'scheduled'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'production_schedules'
});

module.exports = ProductionSchedule;