const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualityControl = sequelize.define('QualityControl', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  test_name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'passed', 'failed'), defaultValue: 'pending' }
}, { tableName: 'quality_controls' });

module.exports = QualityControl;