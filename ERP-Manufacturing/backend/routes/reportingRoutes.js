const express = require('express');
const {
  getDashboardData,
  getProductionReports,
  getInventoryReports,
  getSalesReports,
  getFinancialReports,
  getKPIMetrics,
  generateCustomReport
} = require('../controllers/reportingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardData);
router.get('/production', getProductionReports);
router.get('/inventory', getInventoryReports);
router.get('/sales', getSalesReports);
router.get('/financial', authorize('manager', 'finance_manager'), getFinancialReports);
router.get('/kpi', getKPIMetrics);
router.post('/custom', authorize('manager', 'admin'), generateCustomReport);

module.exports = router;