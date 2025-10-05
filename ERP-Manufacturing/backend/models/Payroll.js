const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Payroll = sequelize.define('Payroll', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  pay_period: { type: DataTypes.STRING, allowNull: false },
  gross_pay: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 }
}, { tableName: 'payroll' });
module.exports = Payroll;
