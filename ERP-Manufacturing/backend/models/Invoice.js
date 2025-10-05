const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoice_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  invoice_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'invoices' });
module.exports = Invoice;
