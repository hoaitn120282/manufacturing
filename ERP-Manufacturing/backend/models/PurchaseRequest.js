const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PurchaseRequest = sequelize.define('PurchaseRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  request_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  requested_date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' }
}, { tableName: 'purchase_requests' });
module.exports = PurchaseRequest;
