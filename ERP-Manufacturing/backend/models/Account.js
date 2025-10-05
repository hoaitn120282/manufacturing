const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Account = sequelize.define('Account', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  account_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  account_name: { type: DataTypes.STRING, allowNull: false },
  account_type: { type: DataTypes.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'), allowNull: false }
}, { tableName: 'accounts' });
module.exports = Account;
