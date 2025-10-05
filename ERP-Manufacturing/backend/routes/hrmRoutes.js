const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const hrmController = require('../controllers/hrmController');
const router = express.Router();

router.use(protect);

// Employee Management
router.get('/employees', hrmController.getEmployees);
router.get('/employees/:id', hrmController.getEmployee);
router.post('/employees', hrmController.createEmployee);
router.put('/employees/:id', hrmController.updateEmployee);
router.delete('/employees/:id', hrmController.deleteEmployee);

// Department Management
router.get('/departments', hrmController.getDepartments);
router.post('/departments', hrmController.createDepartment);
router.put('/departments/:id', hrmController.updateDepartment);

// Attendance Management
router.get('/attendance', hrmController.getAttendance);
router.post('/attendance', hrmController.recordAttendance);
router.post('/attendance/checkin', hrmController.checkIn);
router.post('/attendance/checkout', hrmController.checkOut);

// Payroll Management
router.get('/payroll', hrmController.getPayrolls);
router.post('/payroll/generate', hrmController.generatePayroll);
router.post('/payroll/:id/approve', hrmController.approvePayroll);

// Dashboard
router.get('/dashboard', hrmController.getHRMDashboard);

module.exports = router;
