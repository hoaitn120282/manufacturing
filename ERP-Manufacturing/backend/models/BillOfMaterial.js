const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BillOfMaterial = sequelize.define('BillOfMaterial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1.0'
  },
  description: {
    type: DataTypes.TEXT
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  effective_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expiry_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'bill_of_materials',
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'version']
    }
  ]
});

module.exports = BillOfMaterial;