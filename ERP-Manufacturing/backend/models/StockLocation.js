const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockLocation = sequelize.define('StockLocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  aisle: {
    type: DataTypes.STRING
  },
  rack: {
    type: DataTypes.STRING
  },
  shelf: {
    type: DataTypes.STRING
  },
  bin: {
    type: DataTypes.STRING
  },
  location_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'stock_locations'
});

module.exports = StockLocation;