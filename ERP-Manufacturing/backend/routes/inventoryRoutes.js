const express = require('express');
const {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryTransactions,
  createInventoryTransaction,
  getStockLevels,
  getLowStockItems,
  getInventoryValuation
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateInventoryItem } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInventoryItems)
  .post(authorize('manager', 'warehouse_manager'), validateInventoryItem, createInventoryItem);

router.route('/:id')
  .get(getInventoryItemById)
  .put(authorize('manager', 'warehouse_manager'), updateInventoryItem)
  .delete(authorize('admin', 'manager'), deleteInventoryItem);

router.get('/transactions/history', getInventoryTransactions);
router.post('/transactions', createInventoryTransaction);
router.get('/stock/levels', getStockLevels);
router.get('/stock/low-stock', getLowStockItems);
router.get('/valuation/current', getInventoryValuation);

module.exports = router;