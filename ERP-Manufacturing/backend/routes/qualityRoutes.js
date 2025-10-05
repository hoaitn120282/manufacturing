const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const qualityController = require('../controllers/qualityController');
const router = express.Router();

router.use(protect);

// Quality Controls
router.get('/controls', qualityController.getQualityControls);
router.post('/controls', qualityController.createQualityControl);
router.put('/controls/:id', qualityController.updateQualityControl);
router.delete('/controls/:id', qualityController.deleteQualityControl);

// Quality Standards
router.get('/standards', qualityController.getQualityStandards);
router.post('/standards', qualityController.createQualityStandard);
router.put('/standards/:id', qualityController.updateQualityStandard);

// Quality Tests
router.get('/tests', qualityController.getQualityTests);
router.post('/tests', qualityController.createQualityTest);

// Quality Reports
router.get('/reports', qualityController.getQualityReports);
router.post('/reports', qualityController.createQualityReport);

// Dashboard
router.get('/dashboard', qualityController.getQualityDashboard);

module.exports = router;
