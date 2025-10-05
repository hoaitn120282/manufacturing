const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QualityReport = sequelize.define('QualityReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  report_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  quality_control_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'quality_controls',
      key: 'id'
    }
  },
  report_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  summary: {
    type: DataTypes.TEXT
  },
  findings: {
    type: DataTypes.TEXT
  },
  recommendations: {
    type: DataTypes.TEXT
  },
  corrective_actions: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('draft', 'completed', 'approved'),
    defaultValue: 'draft'
  },
  generated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'quality_reports'
});

module.exports = QualityReport;
