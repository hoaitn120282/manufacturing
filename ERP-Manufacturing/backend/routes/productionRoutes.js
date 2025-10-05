const express = require('express');
const {
  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  updateProductionOrder,
  deleteProductionOrder,
  updateProductionStatus,
  getProductionSchedule,
  getProductionMetrics
} = require('../controllers/productionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateProductionOrder } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getProductionOrders)
  .post(authorize('manager', 'production_manager'), validateProductionOrder, createProductionOrder);

router.route('/:id')
  .get(getProductionOrderById)
  .put(authorize('manager', 'production_manager'), updateProductionOrder)
  .delete(authorize('admin', 'manager'), deleteProductionOrder);

router.put('/:id/status', authorize('production_manager', 'operator'), updateProductionStatus);
router.get('/schedule/view', getProductionSchedule);
router.get('/metrics/dashboard', getProductionMetrics);

module.exports = router;