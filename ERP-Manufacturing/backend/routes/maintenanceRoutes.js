const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const maintenanceController = require('../controllers/maintenanceController');
const router = express.Router();

router.use(protect);

// Equipment Management
router.get('/equipment', maintenanceController.getEquipment);
router.post('/equipment', maintenanceController.createEquipment);
router.put('/equipment/:id', maintenanceController.updateEquipment);
router.delete('/equipment/:id', maintenanceController.deleteEquipment);

// Maintenance Orders
router.get('/orders', maintenanceController.getMaintenanceOrders);
router.post('/orders', maintenanceController.createMaintenanceOrder);
router.put('/orders/:id', maintenanceController.updateMaintenanceOrder);
router.post('/orders/:id/complete', maintenanceController.completeMaintenanceOrder);

// Maintenance Schedules
router.get('/schedules', maintenanceController.getMaintenanceSchedules);
router.post('/schedules', maintenanceController.createMaintenanceSchedule);
router.put('/schedules/:id', maintenanceController.updateMaintenanceSchedule);

// Maintenance History
router.get('/history', maintenanceController.getMaintenanceHistory);

// Dashboard
router.get('/dashboard', maintenanceController.getMaintenanceDashboard);

module.exports = router;
