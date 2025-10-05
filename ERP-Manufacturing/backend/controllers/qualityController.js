const { QualityControl, QualityStandard, QualityTest, QualityReport, Product, ProductionOrder } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class QualityController {
  // Quality Controls
  async getQualityControls(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;

      const whereClause = {};
      if (status) whereClause.status = status;

      const { count, rows } = await QualityControl.findAndCountAll({
        where: whereClause,
        include: [
          { model: Product, attributes: ['name', 'sku'] },
          { model: ProductionOrder, attributes: ['order_number'] }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          limit
        }
      });
    } catch (error) {
      logger.error('Error fetching quality controls:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createQualityControl(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const qualityControl = await QualityControl.create({
        ...req.body,
        inspector_id: req.user.id
      });

      const result = await QualityControl.findByPk(qualityControl.id, {
        include: [
          { model: Product, attributes: ['name', 'sku'] },
          { model: ProductionOrder, attributes: ['order_number'] }
        ]
      });

      logger.info(`Quality control created: ${qualityControl.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating quality control:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateQualityControl(req, res) {
    try {
      const { id } = req.params;
      const qualityControl = await QualityControl.findByPk(id);

      if (!qualityControl) {
        return res.status(404).json({ success: false, message: 'Quality control not found' });
      }

      await qualityControl.update(req.body);
      const result = await QualityControl.findByPk(id, {
        include: [
          { model: Product, attributes: ['name', 'sku'] },
          { model: ProductionOrder, attributes: ['order_number'] }
        ]
      });

      logger.info(`Quality control updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating quality control:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async deleteQualityControl(req, res) {
    try {
      const { id } = req.params;
      const qualityControl = await QualityControl.findByPk(id);

      if (!qualityControl) {
        return res.status(404).json({ success: false, message: 'Quality control not found' });
      }

      await qualityControl.destroy();
      logger.info(`Quality control deleted: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Quality control deleted successfully' });
    } catch (error) {
      logger.error('Error deleting quality control:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Quality Standards
  async getQualityStandards(req, res) {
    try {
      const standards = await QualityStandard.findAll({
        include: [{ model: Product, attributes: ['name', 'sku'] }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ success: true, data: standards });
    } catch (error) {
      logger.error('Error fetching quality standards:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createQualityStandard(req, res) {
    try {
      const standard = await QualityStandard.create(req.body);
      const result = await QualityStandard.findByPk(standard.id, {
        include: [{ model: Product, attributes: ['name', 'sku'] }]
      });

      logger.info(`Quality standard created: ${standard.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating quality standard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateQualityStandard(req, res) {
    try {
      const { id } = req.params;
      const standard = await QualityStandard.findByPk(id);

      if (!standard) {
        return res.status(404).json({ success: false, message: 'Quality standard not found' });
      }

      await standard.update(req.body);
      const result = await QualityStandard.findByPk(id, {
        include: [{ model: Product, attributes: ['name', 'sku'] }]
      });

      logger.info(`Quality standard updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating quality standard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Quality Tests
  async getQualityTests(req, res) {
    try {
      const tests = await QualityTest.findAll({
        include: [
          { model: QualityControl, attributes: ['test_name', 'status'] },
          { model: Product, attributes: ['name', 'sku'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ success: true, data: tests });
    } catch (error) {
      logger.error('Error fetching quality tests:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createQualityTest(req, res) {
    try {
      const test = await QualityTest.create(req.body);
      const result = await QualityTest.findByPk(test.id, {
        include: [
          { model: QualityControl, attributes: ['test_name', 'status'] },
          { model: Product, attributes: ['name', 'sku'] }
        ]
      });

      logger.info(`Quality test created: ${test.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating quality test:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Quality Reports
  async getQualityReports(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await QualityReport.findAndCountAll({
        include: [
          { model: Product, attributes: ['name', 'sku'] },
          { model: QualityControl, attributes: ['test_name', 'status'] }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          limit
        }
      });
    } catch (error) {
      logger.error('Error fetching quality reports:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createQualityReport(req, res) {
    try {
      const report = await QualityReport.create(req.body);
      const result = await QualityReport.findByPk(report.id, {
        include: [
          { model: Product, attributes: ['name', 'sku'] },
          { model: QualityControl, attributes: ['test_name', 'status'] }
        ]
      });

      logger.info(`Quality report created: ${report.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating quality report:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Quality Dashboard Analytics
  async getQualityDashboard(req, res) {
    try {
      const totalTests = await QualityControl.count();
      const passedTests = await QualityControl.count({ where: { status: 'passed' } });
      const failedTests = await QualityControl.count({ where: { status: 'failed' } });
      const pendingTests = await QualityControl.count({ where: { status: 'pending' } });

      const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;

      // Recent quality controls
      const recentControls = await QualityControl.findAll({
        include: [
          { model: Product, attributes: ['name', 'sku'] },
          { model: ProductionOrder, attributes: ['order_number'] }
        ],
        limit: 10,
        order: [['createdAt', 'DESC']]
      });

      // Quality trends (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const qualityTrends = await QualityControl.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "passed" THEN 1 ELSE 0 END')), 'passed'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "failed" THEN 1 ELSE 0 END')), 'failed']
        ],
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo }
        },
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalTests,
            passedTests,
            failedTests,
            pendingTests,
            passRate
          },
          recentControls,
          qualityTrends
        }
      });
    } catch (error) {
      logger.error('Error fetching quality dashboard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new QualityController();