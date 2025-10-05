const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
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
    allowNull: false,
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
  unit_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  current_stock: {
    type: DataTypes.DECIMAL(15, 2),
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
  safety_stock: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  item_type: {
    type: DataTypes.ENUM('raw_material', 'finished_good', 'work_in_progress', 'component', 'consumable'),
    defaultValue: 'raw_material'
  },
  is_serialized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_lot_tracked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shelf_life_days: {
    type: DataTypes.INTEGER
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  barcode: {
    type: DataTypes.STRING
  },
  qr_code: {
    type: DataTypes.STRING
  },
  image_url: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'inventory_items'
});

module.exports = InventoryItem;