const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualityStandard = sequelize.define('QualityStandard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  standard_type: {
    type: DataTypes.ENUM('ISO', 'GMP', 'HACCP', 'custom'),
    defaultValue: 'custom'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'quality_standards'
});

module.exports = QualityStandard;