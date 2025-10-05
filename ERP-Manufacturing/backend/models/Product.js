const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  unit_of_measure: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pcs'
  },
  standard_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  selling_price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  lead_time_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  minimum_stock: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  maximum_stock: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  reorder_point: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  image_url: {
    type: DataTypes.STRING
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  product_type: {
    type: DataTypes.ENUM('finished_good', 'raw_material', 'work_in_progress', 'component'),
    defaultValue: 'finished_good'
  }
}, {
  tableName: 'products'
});

module.exports = Product;