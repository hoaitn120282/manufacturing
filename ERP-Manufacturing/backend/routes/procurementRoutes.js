const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const procurementController = require('../controllers/procurementController');
const router = express.Router();

router.use(protect);

// Purchase Requests
router.get('/requests', procurementController.getPurchaseRequests);
router.post('/requests', procurementController.createPurchaseRequest);
router.put('/requests/:id', procurementController.updatePurchaseRequest);
router.post('/requests/:id/approve', procurementController.approvePurchaseRequest);
router.post('/requests/:id/reject', procurementController.rejectPurchaseRequest);

// Purchase Orders
router.get('/orders', procurementController.getPurchaseOrders);
router.get('/orders/:id', procurementController.getPurchaseOrder);
router.post('/orders', procurementController.createPurchaseOrder);
router.put('/orders/:id', procurementController.updatePurchaseOrder);
router.post('/orders/:id/receive', procurementController.receivePurchaseOrder);
router.post('/orders/:id/cancel', procurementController.cancelPurchaseOrder);

// Supplier Management
router.get('/suppliers', procurementController.getSuppliers);
router.post('/suppliers', procurementController.createSupplier);
router.put('/suppliers/:id', procurementController.updateSupplier);

// Analytics & Reports
router.get('/analytics', procurementController.getSupplyChainAnalytics);
router.get('/dashboard', procurementController.getProcurementDashboard);

module.exports = router;
