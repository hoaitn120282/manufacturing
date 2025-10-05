const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'inventory_items',
      key: 'id'
    }
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'warehouses',
      key: 'id'
    }
  },
  transaction_type: {
    type: DataTypes.ENUM('receipt', 'issue', 'transfer', 'adjustment', 'return'),
    allowNull: false
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  unit_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  reference_number: {
    type: DataTypes.STRING
  },
  reference_type: {
    type: DataTypes.ENUM('production_order', 'sales_order', 'purchase_order', 'manual', 'transfer'),
    defaultValue: 'manual'
  },
  reference_id: {
    type: DataTypes.INTEGER
  },
  notes: {
    type: DataTypes.TEXT
  },
  lot_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'lots',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'inventory_transactions'
});

module.exports = InventoryTransaction;