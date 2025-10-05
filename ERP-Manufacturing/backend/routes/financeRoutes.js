const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const financeController = require('../controllers/financeController');
const router = express.Router();

router.use(protect);

// Chart of Accounts
router.get('/accounts', financeController.getAccounts);
router.post('/accounts', financeController.createAccount);
router.put('/accounts/:id', financeController.updateAccount);

// Invoice Management
router.get('/invoices', financeController.getInvoices);
router.get('/invoices/:id', financeController.getInvoice);
router.post('/invoices', financeController.createInvoice);
router.put('/invoices/:id', financeController.updateInvoice);
router.post('/invoices/:id/payment', financeController.markInvoicePaid);

// Payment Management
router.get('/payments', financeController.getPayments);
router.post('/payments', financeController.createPayment);

// Financial Reports
router.get('/reports/income-statement', financeController.getIncomeStatement);
router.get('/reports/balance-sheet', financeController.getBalanceSheet);
router.get('/reports/cash-flow', financeController.getCashFlow);

// Dashboard
router.get('/dashboard', financeController.getFinanceDashboard);

module.exports = router;
