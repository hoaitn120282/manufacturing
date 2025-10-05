const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BOMItem = sequelize.define('BOMItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bom_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bill_of_materials',
      key: 'id'
    }
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inventory_items',
      key: 'id'
    }
  },
  quantity_required: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false
  },
  unit_of_measure: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scrap_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  is_critical: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'bom_items'
});

module.exports = BOMItem;