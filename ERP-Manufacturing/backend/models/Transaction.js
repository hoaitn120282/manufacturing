const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  transaction_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  transaction_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'transactions' });
module.exports = Transaction;
