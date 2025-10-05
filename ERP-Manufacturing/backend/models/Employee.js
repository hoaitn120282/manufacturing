const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  hire_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  manager_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  salary: {
    type: DataTypes.DECIMAL(15, 2)
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(8, 2)
  },
  employment_type: {
    type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'temporary'),
    defaultValue: 'full_time'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'terminated'),
    defaultValue: 'active'
  },
  address: {
    type: DataTypes.TEXT
  },
  emergency_contact: {
    type: DataTypes.STRING
  },
  emergency_phone: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'employees'
});

module.exports = Employee;