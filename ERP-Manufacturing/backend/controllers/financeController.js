const { Account, Invoice, Payment, Customer, PurchaseOrder } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class FinanceController {
  // Chart of Accounts
  async getAccounts(req, res) {
    try {
      const type = req.query.type;
      const parent_id = req.query.parent_id;

      const whereClause = {};
      if (type) whereClause.account_type = type;
      if (parent_id) whereClause.parent_account_id = parent_id;

      const accounts = await Account.findAll({
        where: whereClause,
        include: [
          {
            model: Account,
            as: 'parent_account',
            attributes: ['account_name', 'account_code']
          },
          {
            model: Account,
            as: 'sub_accounts',
            attributes: ['id', 'account_name', 'account_code', 'balance']
          }
        ],
        order: [['account_code', 'ASC']]
      });

      res.json({ success: true, data: accounts });
    } catch (error) {
      logger.error('Error fetching accounts:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createAccount(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const account = await Account.create(req.body);
      
      const result = await Account.findByPk(account.id, {
        include: [
          {
            model: Account,
            as: 'parent_account',
            attributes: ['account_name', 'account_code']
          }
        ]
      });

      logger.info(`Account created: ${account.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating account:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateAccount(req, res) {
    try {
      const { id } = req.params;
      const account = await Account.findByPk(id);

      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }

      await account.update(req.body);
      
      const result = await Account.findByPk(id, {
        include: [
          {
            model: Account,
            as: 'parent_account',
            attributes: ['account_name', 'account_code']
          }
        ]
      });

      logger.info(`Account updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating account:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Invoice Management
  async getInvoices(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const customer_id = req.query.customer_id;
      const date_from = req.query.date_from;
      const date_to = req.query.date_to;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (customer_id) whereClause.customer_id = customer_id;
      if (date_from && date_to) {
        whereClause.invoice_date = {
          [Op.between]: [new Date(date_from), new Date(date_to)]
        };
      }

      const { count, rows } = await Invoice.findAndCountAll({
        where: whereClause,
        include: [
          { model: Customer, attributes: ['name', 'email', 'phone'] }
        ],
        limit,
        offset,
        order: [['invoice_date', 'DESC']]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          limit
        }
      });
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id, {
        include: [
          { model: Customer, attributes: ['name', 'email', 'phone', 'address'] }
        ]
      });

      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      res.json({ success: true, data: invoice });
    } catch (error) {
      logger.error('Error fetching invoice:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createInvoice(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Generate invoice number
      const currentYear = new Date().getFullYear();
      const invoiceCount = await Invoice.count({
        where: {
          invoice_date: {
            [Op.gte]: new Date(currentYear, 0, 1),
            [Op.lt]: new Date(currentYear + 1, 0, 1)
          }
        }
      });
      
      const invoice_number = `INV-${currentYear}-${String(invoiceCount + 1).padStart(4, '0')}`;

      const invoice = await Invoice.create({
        ...req.body,
        invoice_number,
        created_by: req.user.id
      });

      const result = await Invoice.findByPk(invoice.id, {
        include: [{ model: Customer, attributes: ['name', 'email', 'phone'] }]
      });

      logger.info(`Invoice created: ${invoice.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating invoice:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id);

      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      if (invoice.status === 'paid') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot update paid invoice' 
        });
      }

      await invoice.update(req.body);
      
      const result = await Invoice.findByPk(id, {
        include: [{ model: Customer, attributes: ['name', 'email', 'phone'] }]
      });

      logger.info(`Invoice updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating invoice:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async markInvoicePaid(req, res) {
    try {
      const { id } = req.params;
      const { payment_amount, payment_method, payment_reference } = req.body;

      const invoice = await Invoice.findByPk(id);

      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      if (invoice.status === 'paid') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invoice is already paid' 
        });
      }

      // Create payment record
      const payment = await Payment.create({
        invoice_id: id,
        amount: payment_amount,
        payment_method,
        payment_reference,
        payment_date: new Date(),
        status: 'completed'
      });

      // Update invoice status
      const totalPaid = await Payment.sum('amount', {
        where: { invoice_id: id, status: 'completed' }
      });

      const status = totalPaid >= invoice.total_amount ? 'paid' : 'partially_paid';
      await invoice.update({ 
        status,
        paid_amount: totalPaid,
        payment_date: status === 'paid' ? new Date() : null
      });

      logger.info(`Invoice payment recorded: ${id} - Amount: ${payment_amount}`);
      res.json({ success: true, message: 'Payment recorded successfully', data: { payment, invoice } });
    } catch (error) {
      logger.error('Error recording invoice payment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Payment Management
  async getPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const payment_method = req.query.payment_method;
      const status = req.query.status;
      const date_from = req.query.date_from;
      const date_to = req.query.date_to;

      const whereClause = {};
      if (payment_method) whereClause.payment_method = payment_method;
      if (status) whereClause.status = status;
      if (date_from && date_to) {
        whereClause.payment_date = {
          [Op.between]: [new Date(date_from), new Date(date_to)]
        };
      }

      const { count, rows } = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Invoice, 
            attributes: ['invoice_number', 'total_amount'],
            include: [{ model: Customer, attributes: ['name'] }]
          }
        ],
        limit,
        offset,
        order: [['payment_date', 'DESC']]
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          limit
        }
      });
    } catch (error) {
      logger.error('Error fetching payments:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createPayment(req, res) {
    try {
      const payment = await Payment.create(req.body);
      
      const result = await Payment.findByPk(payment.id, {
        include: [
          { 
            model: Invoice, 
            attributes: ['invoice_number', 'total_amount'],
            include: [{ model: Customer, attributes: ['name'] }]
          }
        ]
      });

      logger.info(`Payment created: ${payment.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating payment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Financial Reports
  async getIncomeStatement(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // Revenue from invoices
      const revenue = await Invoice.sum('total_amount', {
        where: {
          status: 'paid',
          payment_date: {
            [Op.between]: [new Date(start_date), new Date(end_date)]
          }
        }
      }) || 0;

      // Expenses from purchase orders
      const expenses = await PurchaseOrder.sum('total_amount', {
        where: {
          status: 'completed',
          order_date: {
            [Op.between]: [new Date(start_date), new Date(end_date)]
          }
        }
      }) || 0;

      const grossProfit = revenue - expenses;
      const netIncome = grossProfit; // Simplified calculation

      res.json({
        success: true,
        data: {
          period: { start_date, end_date },
          revenue,
          expenses,
          grossProfit,
          netIncome
        }
      });
    } catch (error) {
      logger.error('Error generating income statement:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getBalanceSheet(req, res) {
    try {
      const { as_of_date } = req.query;
      const asOfDate = as_of_date ? new Date(as_of_date) : new Date();

      // Get account balances by type
      const assets = await Account.findAll({
        where: { account_type: 'asset' },
        attributes: ['account_name', 'balance']
      });

      const liabilities = await Account.findAll({
        where: { account_type: 'liability' },
        attributes: ['account_name', 'balance']
      });

      const equity = await Account.findAll({
        where: { account_type: 'equity' },
        attributes: ['account_name', 'balance']
      });

      const totalAssets = assets.reduce((sum, account) => sum + (account.balance || 0), 0);
      const totalLiabilities = liabilities.reduce((sum, account) => sum + (account.balance || 0), 0);
      const totalEquity = equity.reduce((sum, account) => sum + (account.balance || 0), 0);

      res.json({
        success: true,
        data: {
          asOfDate,
          assets: {
            accounts: assets,
            total: totalAssets
          },
          liabilities: {
            accounts: liabilities,
            total: totalLiabilities
          },
          equity: {
            accounts: equity,
            total: totalEquity
          },
          balanceCheck: totalAssets === (totalLiabilities + totalEquity)
        }
      });
    } catch (error) {
      logger.error('Error generating balance sheet:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getCashFlow(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // Cash inflows (payments received)
      const cashInflows = await Payment.sum('amount', {
        where: {
          status: 'completed',
          payment_date: {
            [Op.between]: [new Date(start_date), new Date(end_date)]
          }
        }
      }) || 0;

      // Cash outflows (purchase orders and expenses)
      const cashOutflows = await PurchaseOrder.sum('total_amount', {
        where: {
          status: 'completed',
          order_date: {
            [Op.between]: [new Date(start_date), new Date(end_date)]
          }
        }
      }) || 0;

      const netCashFlow = cashInflows - cashOutflows;

      // Monthly cash flow breakdown
      const monthlyFlow = await Payment.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('payment_date')), 'year'],
          [sequelize.fn('MONTH', sequelize.col('payment_date')), 'month'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'inflow']
        ],
        where: {
          status: 'completed',
          payment_date: {
            [Op.between]: [new Date(start_date), new Date(end_date)]
          }
        },
        group: [
          sequelize.fn('YEAR', sequelize.col('payment_date')),
          sequelize.fn('MONTH', sequelize.col('payment_date'))
        ],
        order: [
          [sequelize.fn('YEAR', sequelize.col('payment_date')), 'ASC'],
          [sequelize.fn('MONTH', sequelize.col('payment_date')), 'ASC']
        ]
      });

      res.json({
        success: true,
        data: {
          period: { start_date, end_date },
          summary: {
            cashInflows,
            cashOutflows,
            netCashFlow
          },
          monthlyFlow
        }
      });
    } catch (error) {
      logger.error('Error generating cash flow report:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Finance Dashboard
  async getFinanceDashboard(req, res) {
    try {
      // Current month summary
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const monthlyRevenue = await Invoice.sum('total_amount', {
        where: {
          status: 'paid',
          payment_date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }) || 0;

      const monthlyExpenses = await PurchaseOrder.sum('total_amount', {
        where: {
          status: 'completed',
          order_date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }) || 0;

      // Outstanding invoices
      const outstandingInvoices = await Invoice.findAll({
        where: { status: { [Op.in]: ['pending', 'partially_paid'] } },
        include: [{ model: Customer, attributes: ['name'] }],
        order: [['due_date', 'ASC']],
        limit: 10
      });

      const totalOutstanding = await Invoice.sum('total_amount', {
        where: { status: { [Op.in]: ['pending', 'partially_paid'] } }
      }) || 0;

      // Recent payments
      const recentPayments = await Payment.findAll({
        include: [
          { 
            model: Invoice, 
            attributes: ['invoice_number'],
            include: [{ model: Customer, attributes: ['name'] }]
          }
        ],
        order: [['payment_date', 'DESC']],
        limit: 10
      });

      // Revenue trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const revenueTrends = await Invoice.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('payment_date')), 'year'],
          [sequelize.fn('MONTH', sequelize.col('payment_date')), 'month'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
        ],
        where: {
          status: 'paid',
          payment_date: { [Op.gte]: sixMonthsAgo }
        },
        group: [
          sequelize.fn('YEAR', sequelize.col('payment_date')),
          sequelize.fn('MONTH', sequelize.col('payment_date'))
        ],
        order: [
          [sequelize.fn('YEAR', sequelize.col('payment_date')), 'ASC'],
          [sequelize.fn('MONTH', sequelize.col('payment_date')), 'ASC']
        ]
      });

      res.json({
        success: true,
        data: {
          summary: {
            monthlyRevenue,
            monthlyExpenses,
            monthlyProfit: monthlyRevenue - monthlyExpenses,
            totalOutstanding
          },
          outstandingInvoices,
          recentPayments,
          revenueTrends
        }
      });
    } catch (error) {
      logger.error('Error fetching finance dashboard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new FinanceController();