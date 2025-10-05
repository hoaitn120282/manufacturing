const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  payment_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  payment_date: { type: DataTypes.DATE, allowNull: false }
}, { tableName: 'payments' });
module.exports = Payment;
