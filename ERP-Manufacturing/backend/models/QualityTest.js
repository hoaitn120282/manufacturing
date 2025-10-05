const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualityTest = sequelize.define('QualityTest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quality_control_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quality_controls',
      key: 'id'
    }
  },
  standard_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quality_standards',
      key: 'id'
    }
  },
  test_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  test_type: {
    type: DataTypes.ENUM('IQC', 'IPQC', 'OQC', 'final'),
    allowNull: false
  },
  test_method: {
    type: DataTypes.STRING
  },
  measured_value: {
    type: DataTypes.DECIMAL(15, 4)
  },
  expected_value: {
    type: DataTypes.DECIMAL(15, 4)
  },
  tolerance: {
    type: DataTypes.DECIMAL(15, 4)
  },
  unit_of_measure: {
    type: DataTypes.STRING
  },
  result_text: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'passed', 'failed'),
    defaultValue: 'pending'
  },
  test_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  tested_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  equipment_used: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'quality_tests'
});

module.exports = QualityTest;