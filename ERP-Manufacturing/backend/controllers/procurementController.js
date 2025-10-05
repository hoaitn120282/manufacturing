const { PurchaseOrder, PurchaseOrderItem, PurchaseRequest, InventoryItem, Product, Supplier } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class ProcurementController {
  // Purchase Requests
  async getPurchaseRequests(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const department = req.query.department;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (department) whereClause.department = department;

      const { count, rows } = await PurchaseRequest.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Product, 
            attributes: ['name', 'sku'] 
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
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
      logger.error('Error fetching purchase requests:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createPurchaseRequest(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Generate request number
      const currentYear = new Date().getFullYear();
      const requestCount = await PurchaseRequest.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(currentYear, 0, 1),
            [Op.lt]: new Date(currentYear + 1, 0, 1)
          }
        }
      });
      
      const request_number = `PR-${currentYear}-${String(requestCount + 1).padStart(4, '0')}`;

      const purchaseRequest = await PurchaseRequest.create({
        ...req.body,
        request_number,
        requested_by: req.user.id
      });

      const result = await PurchaseRequest.findByPk(purchaseRequest.id, {
        include: [{ model: Product, attributes: ['name', 'sku'] }]
      });

      logger.info(`Purchase request created: ${purchaseRequest.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating purchase request:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updatePurchaseRequest(req, res) {
    try {
      const { id } = req.params;
      const purchaseRequest = await PurchaseRequest.findByPk(id);

      if (!purchaseRequest) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      if (purchaseRequest.status === 'approved' || purchaseRequest.status === 'completed') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot update approved or completed purchase request' 
        });
      }

      await purchaseRequest.update(req.body);
      
      const result = await PurchaseRequest.findByPk(id, {
        include: [{ model: Product, attributes: ['name', 'sku'] }]
      });

      logger.info(`Purchase request updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating purchase request:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async approvePurchaseRequest(req, res) {
    try {
      const { id } = req.params;
      const { approval_notes } = req.body;

      const purchaseRequest = await PurchaseRequest.findByPk(id);

      if (!purchaseRequest) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      if (purchaseRequest.status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only pending requests can be approved' 
        });
      }

      await purchaseRequest.update({
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date(),
        approval_notes
      });

      logger.info(`Purchase request approved: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Purchase request approved successfully' });
    } catch (error) {
      logger.error('Error approving purchase request:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async rejectPurchaseRequest(req, res) {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;

      const purchaseRequest = await PurchaseRequest.findByPk(id);

      if (!purchaseRequest) {
        return res.status(404).json({ success: false, message: 'Purchase request not found' });
      }

      await purchaseRequest.update({
        status: 'rejected',
        rejected_by: req.user.id,
        rejected_at: new Date(),
        rejection_reason
      });

      logger.info(`Purchase request rejected: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Purchase request rejected' });
    } catch (error) {
      logger.error('Error rejecting purchase request:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Purchase Orders
  async getPurchaseOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const supplier_id = req.query.supplier_id;
      const date_from = req.query.date_from;
      const date_to = req.query.date_to;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (supplier_id) whereClause.supplier_id = supplier_id;
      if (date_from && date_to) {
        whereClause.order_date = {
          [Op.between]: [new Date(date_from), new Date(date_to)]
        };
      }

      const { count, rows } = await PurchaseOrder.findAndCountAll({
        where: whereClause,
        include: [
          { model: Supplier, attributes: ['name', 'email', 'phone'] },
          { 
            model: PurchaseOrderItem, 
            include: [{ model: Product, attributes: ['name', 'sku'] }]
          }
        ],
        limit,
        offset,
        order: [['order_date', 'DESC']]
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
      logger.error('Error fetching purchase orders:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getPurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [
          { model: Supplier, attributes: ['name', 'email', 'phone', 'address'] },
          { 
            model: PurchaseOrderItem, 
            include: [{ model: Product, attributes: ['name', 'sku', 'unit'] }]
          }
        ]
      });

      if (!purchaseOrder) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      res.json({ success: true, data: purchaseOrder });
    } catch (error) {
      logger.error('Error fetching purchase order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createPurchaseOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { items, ...orderData } = req.body;

      // Generate order number
      const currentYear = new Date().getFullYear();
      const orderCount = await PurchaseOrder.count({
        where: {
          order_date: {
            [Op.gte]: new Date(currentYear, 0, 1),
            [Op.lt]: new Date(currentYear + 1, 0, 1)
          }
        }
      });
      
      const order_number = `PO-${currentYear}-${String(orderCount + 1).padStart(4, '0')}`;

      // Calculate total amount
      let total_amount = 0;
      for (const item of items) {
        total_amount += item.quantity * item.unit_price;
      }

      const transaction = await sequelize.transaction();

      try {
        // Create purchase order
        const purchaseOrder = await PurchaseOrder.create({
          ...orderData,
          order_number,
          total_amount,
          created_by: req.user.id
        }, { transaction });

        // Create purchase order items
        for (const item of items) {
          await PurchaseOrderItem.create({
            purchase_order_id: purchaseOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
            specifications: item.specifications
          }, { transaction });
        }

        await transaction.commit();

        const result = await PurchaseOrder.findByPk(purchaseOrder.id, {
          include: [
            { model: Supplier, attributes: ['name', 'email', 'phone'] },
            { 
              model: PurchaseOrderItem, 
              include: [{ model: Product, attributes: ['name', 'sku'] }]
            }
          ]
        });

        logger.info(`Purchase order created: ${purchaseOrder.id} by user ${req.user.id}`);
        res.status(201).json({ success: true, data: result });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error('Error creating purchase order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updatePurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const purchaseOrder = await PurchaseOrder.findByPk(id);

      if (!purchaseOrder) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      if (purchaseOrder.status === 'completed' || purchaseOrder.status === 'cancelled') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot update completed or cancelled purchase order' 
        });
      }

      await purchaseOrder.update(req.body);
      
      const result = await PurchaseOrder.findByPk(id, {
        include: [
          { model: Supplier, attributes: ['name', 'email', 'phone'] },
          { 
            model: PurchaseOrderItem, 
            include: [{ model: Product, attributes: ['name', 'sku'] }]
          }
        ]
      });

      logger.info(`Purchase order updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating purchase order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async receivePurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const { received_items, receiving_notes } = req.body;

      const purchaseOrder = await PurchaseOrder.findByPk(id, {
        include: [{ model: PurchaseOrderItem }]
      });

      if (!purchaseOrder) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      if (purchaseOrder.status !== 'confirmed') {
        return res.status(400).json({ 
          success: false, 
          message: 'Only confirmed orders can be received' 
        });
      }

      const transaction = await sequelize.transaction();

      try {
        let allItemsReceived = true;

        // Update purchase order items with received quantities
        for (const receivedItem of received_items) {
          const orderItem = await PurchaseOrderItem.findByPk(receivedItem.id, { transaction });
          
          if (orderItem) {
            const newReceivedQty = (orderItem.received_quantity || 0) + receivedItem.received_quantity;
            await orderItem.update({
              received_quantity: newReceivedQty,
              received_date: new Date()
            }, { transaction });

            // Update inventory
            const inventoryItem = await InventoryItem.findOne({
              where: { product_id: orderItem.product_id },
              transaction
            });

            if (inventoryItem) {
              await inventoryItem.update({
                quantity_on_hand: inventoryItem.quantity_on_hand + receivedItem.received_quantity
              }, { transaction });
            } else {
              // Create new inventory item if it doesn't exist
              await InventoryItem.create({
                product_id: orderItem.product_id,
                quantity_on_hand: receivedItem.received_quantity,
                minimum_stock_level: 10, // Default minimum
                maximum_stock_level: 1000, // Default maximum
                reorder_point: 20, // Default reorder point
                location: 'Main Warehouse'
              }, { transaction });
            }

            // Check if all items are fully received
            if (newReceivedQty < orderItem.quantity) {
              allItemsReceived = false;
            }
          }
        }

        // Update purchase order status
        const newStatus = allItemsReceived ? 'completed' : 'partially_received';
        await purchaseOrder.update({
          status: newStatus,
          received_date: allItemsReceived ? new Date() : null,
          receiving_notes
        }, { transaction });

        await transaction.commit();

        logger.info(`Purchase order received: ${id} by user ${req.user.id}`);
        res.json({ success: true, message: 'Purchase order received successfully' });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error('Error receiving purchase order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async cancelPurchaseOrder(req, res) {
    try {
      const { id } = req.params;
      const { cancellation_reason } = req.body;

      const purchaseOrder = await PurchaseOrder.findByPk(id);

      if (!purchaseOrder) {
        return res.status(404).json({ success: false, message: 'Purchase order not found' });
      }

      if (purchaseOrder.status === 'completed') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot cancel completed purchase order' 
        });
      }

      await purchaseOrder.update({
        status: 'cancelled',
        cancelled_by: req.user.id,
        cancelled_at: new Date(),
        cancellation_reason
      });

      logger.info(`Purchase order cancelled: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Purchase order cancelled successfully' });
    } catch (error) {
      logger.error('Error cancelling purchase order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Supplier Management
  async getSuppliers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { contact_person: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Supplier.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['name', 'ASC']]
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
      logger.error('Error fetching suppliers:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createSupplier(req, res) {
    try {
      const supplier = await Supplier.create(req.body);
      
      logger.info(`Supplier created: ${supplier.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      logger.error('Error creating supplier:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id);

      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found' });
      }

      await supplier.update(req.body);
      
      logger.info(`Supplier updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: supplier });
    } catch (error) {
      logger.error('Error updating supplier:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Supply Chain Analytics
  async getSupplyChainAnalytics(req, res) {
    try {
      // Purchase order summary
      const totalOrders = await PurchaseOrder.count();
      const pendingOrders = await PurchaseOrder.count({ where: { status: 'pending' } });
      const completedOrders = await PurchaseOrder.count({ where: { status: 'completed' } });
      
      // Supplier performance
      const supplierPerformance = await PurchaseOrder.findAll({
        attributes: [
          'supplier_id',
          [sequelize.fn('COUNT', sequelize.col('PurchaseOrder.id')), 'order_count'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_order_value'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_value']
        ],
        include: [{ model: Supplier, attributes: ['name'] }],
        group: ['supplier_id', 'Supplier.id'],
        order: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']],
        limit: 10
      });

      // Purchase trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const purchaseTrends = await PurchaseOrder.findAll({
        attributes: [
          [sequelize.fn('YEAR', sequelize.col('order_date')), 'year'],
          [sequelize.fn('MONTH', sequelize.col('order_date')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
        ],
        where: {
          order_date: { [Op.gte]: sixMonthsAgo }
        },
        group: [
          sequelize.fn('YEAR', sequelize.col('order_date')),
          sequelize.fn('MONTH', sequelize.col('order_date'))
        ],
        order: [
          [sequelize.fn('YEAR', sequelize.col('order_date')), 'ASC'],
          [sequelize.fn('MONTH', sequelize.col('order_date')), 'ASC']
        ]
      });

      // Top products by purchase volume
      const topProducts = await PurchaseOrderItem.findAll({
        attributes: [
          'product_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
          [sequelize.fn('SUM', sequelize.col('total_price')), 'total_value']
        ],
        include: [{ model: Product, attributes: ['name', 'sku'] }],
        group: ['product_id', 'Product.id'],
        order: [[sequelize.fn('SUM', sequelize.col('total_price')), 'DESC']],
        limit: 10
      });

      // Recent purchase requests
      const recentRequests = await PurchaseRequest.findAll({
        include: [{ model: Product, attributes: ['name', 'sku'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalOrders,
            pendingOrders,
            completedOrders
          },
          supplierPerformance,
          purchaseTrends,
          topProducts,
          recentRequests
        }
      });
    } catch (error) {
      logger.error('Error fetching supply chain analytics:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Procurement Dashboard
  async getProcurementDashboard(req, res) {
    try {
      const pendingRequests = await PurchaseRequest.count({ where: { status: 'pending' } });
      const approvedRequests = await PurchaseRequest.count({ where: { status: 'approved' } });
      const activeOrders = await PurchaseOrder.count({ 
        where: { status: { [Op.in]: ['pending', 'confirmed', 'partially_received'] } } 
      });
      
      // Monthly spending
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const monthlySpending = await PurchaseOrder.sum('total_amount', {
        where: {
          order_date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      }) || 0;

      // Overdue orders
      const overdueOrders = await PurchaseOrder.findAll({
        where: {
          status: { [Op.ne]: 'completed' },
          expected_delivery_date: { [Op.lt]: new Date() }
        },
        include: [{ model: Supplier, attributes: ['name'] }],
        order: [['expected_delivery_date', 'ASC']],
        limit: 10
      });

      // Recent activities
      const recentActivities = await PurchaseOrder.findAll({
        include: [{ model: Supplier, attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        data: {
          summary: {
            pendingRequests,
            approvedRequests,
            activeOrders,
            monthlySpending
          },
          overdueOrders,
          recentActivities
        }
      });
    } catch (error) {
      logger.error('Error fetching procurement dashboard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new ProcurementController();