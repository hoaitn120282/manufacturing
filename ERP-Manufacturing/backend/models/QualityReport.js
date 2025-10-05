const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualityReport = sequelize.define('QualityReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  report_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: { type: DataTypes.STRING }
}, { tableName: 'quality_reports' });

module.exports = QualityReport;
