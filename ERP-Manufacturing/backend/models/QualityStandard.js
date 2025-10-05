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
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  standard_type: {
    type: DataTypes.ENUM('ISO', 'GMP', 'HACCP', 'custom'),
    defaultValue: 'custom'
  },
  parameter_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit_of_measure: {
    type: DataTypes.STRING
  },
  min_value: {
    type: DataTypes.DECIMAL(15, 4)
  },
  max_value: {
    type: DataTypes.DECIMAL(15, 4)
  },
  target_value: {
    type: DataTypes.DECIMAL(15, 4)
  },
  tolerance: {
    type: DataTypes.DECIMAL(15, 4)
  },
  test_method: {
    type: DataTypes.STRING
  },
  frequency: {
    type: DataTypes.STRING
  },
  is_critical: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'quality_standards'
});

module.exports = QualityStandard;