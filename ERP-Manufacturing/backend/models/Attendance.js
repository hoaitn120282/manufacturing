const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  employee_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  check_in: { type: DataTypes.TIME },
  check_out: { type: DataTypes.TIME }
}, { tableName: 'attendance' });
module.exports = Attendance;
