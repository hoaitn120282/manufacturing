const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lot = sequelize.define('Lot', {
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
  lot_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  manufacture_date: {
    type: DataTypes.DATE
  },
  expiry_date: {
    type: DataTypes.DATE
  },
  received_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  quantity_received: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  quantity_available: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  supplier_lot_number: {
    type: DataTypes.STRING
  },
  quality_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'quarantine'),
    defaultValue: 'pending'
  },
  location_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'stock_locations',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'lots',
  indexes: [
    {
      unique: true,
      fields: ['item_id', 'lot_number']
    }
  ]
});

module.exports = Lot;