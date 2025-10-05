const express = require('express');
const {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  updateOrderStatus,
  getSalesMetrics,
  getCustomers,
  createCustomer
} = require('../controllers/salesController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateSalesOrder } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSalesOrders)
  .post(authorize('manager', 'sales_manager'), validateSalesOrder, createSalesOrder);

router.route('/:id')
  .get(getSalesOrderById)
  .put(authorize('manager', 'sales_manager'), updateSalesOrder)
  .delete(authorize('admin', 'manager'), deleteSalesOrder);

router.put('/:id/status', authorize('sales_manager', 'sales_rep'), updateOrderStatus);
router.get('/metrics/dashboard', getSalesMetrics);
router.get('/customers', getCustomers);
router.post('/customers', authorize('manager', 'sales_manager'), createCustomer);

module.exports = router;