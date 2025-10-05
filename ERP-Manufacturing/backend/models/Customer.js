const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  website: {
    type: DataTypes.STRING
  },
  billing_address: {
    type: DataTypes.TEXT
  },
  shipping_address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  state: {
    type: DataTypes.STRING
  },
  postal_code: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  tax_id: {
    type: DataTypes.STRING
  },
  credit_limit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  payment_terms: {
    type: DataTypes.STRING,
    defaultValue: 'Net 30'
  },
  customer_type: {
    type: DataTypes.ENUM('individual', 'business'),
    defaultValue: 'business'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT
  },
  assigned_salesperson: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'id'
    }
  }
}, {
  tableName: 'customers'
});

module.exports = Customer;