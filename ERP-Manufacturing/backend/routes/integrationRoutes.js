const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const integrationController = require('../controllers/integrationController');
const router = express.Router();

router.use(protect);

// System Health & Monitoring
router.get('/health', integrationController.getSystemHealth);
router.get('/analytics/api', integrationController.getAPIAnalytics);

// Integration Status
router.get('/status', integrationController.getIntegrationStatus);

// Database Management
router.get('/database', integrationController.getDatabaseInfo);

// System Configuration
router.get('/config', integrationController.getSystemConfig);

// Backup & Maintenance
router.post('/backup', integrationController.createBackup);
router.get('/backup/history', integrationController.getBackupHistory);

// System Logs
router.get('/logs', integrationController.getSystemLogs);

// Dashboard
router.get('/dashboard', integrationController.getIntegrationDashboard);

module.exports = router;