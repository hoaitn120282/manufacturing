const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipment = sequelize.define('Equipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  manufacturer: {
    type: DataTypes.STRING
  },
  model: {
    type: DataTypes.STRING
  },
  serial_number: {
    type: DataTypes.STRING
  },
  purchase_date: {
    type: DataTypes.DATE
  },
  purchase_cost: {
    type: DataTypes.DECIMAL(15, 2)
  },
  warranty_expiry: {
    type: DataTypes.DATE
  },
  location: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'inactive', 'retired'),
    defaultValue: 'active'
  },
  department_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  responsible_employee_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'equipment'
});

module.exports = Equipment;
