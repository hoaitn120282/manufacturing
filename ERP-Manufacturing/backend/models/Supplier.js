const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  supplier_code: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING }
}, { tableName: 'suppliers' });
module.exports = Supplier;
