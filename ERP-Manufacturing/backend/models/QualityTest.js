const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualityTest = sequelize.define('QualityTest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  test_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  test_type: {
    type: DataTypes.ENUM('IQC', 'IPQC', 'OQC'),
    allowNull: false
  },
  result: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'passed', 'failed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'quality_tests'
});

module.exports = QualityTest;