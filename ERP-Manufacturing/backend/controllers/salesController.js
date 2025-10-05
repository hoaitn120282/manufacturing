const { SalesOrder, SalesOrderItem, Customer, Product } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

const getSalesOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause.order_number = { [Op.iLike]: `%${search}%` };
    }

    const salesOrders = await SalesOrder.findAndCountAll({
      where: whereClause,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_code'] },
        { model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        sales_orders: salesOrders.rows,
        pagination: {
          total: salesOrders.count,
          page: parseInt(page),
          pages: Math.ceil(salesOrders.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get sales orders error:', error);
    res.status(500).json({ error: 'Failed to get sales orders' });
  }
};

const getSalesOrderById = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    res.json({ success: true, data: salesOrder });
  } catch (error) {
    logger.error('Get sales order by ID error:', error);
    res.status(500).json({ error: 'Failed to get sales order' });
  }
};

const createSalesOrder = async (req, res) => {
  try {
    const { customer_id, items, ...orderData } = req.body;

    // Generate order number
    const orderCount = await SalesOrder.count();
    const order_number = `SO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.quantity_ordered * item.unit_price;
    });

    const salesOrder = await SalesOrder.create({
      ...orderData,
      order_number,
      customer_id,
      subtotal,
      total_amount: subtotal, // Simplified - no tax/discount calculation
      created_by: req.user.id
    });

    // Create order items
    for (const item of items) {
      await SalesOrderItem.create({
        ...item,
        sales_order_id: salesOrder.id,
        line_total: item.quantity_ordered * item.unit_price
      });
    }

    const createdOrder = await SalesOrder.findByPk(salesOrder.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    req.io.emit('sales_order_created', createdOrder);

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    logger.error('Create sales order error:', error);
    res.status(500).json({ error: 'Failed to create sales order' });
  }
};

const updateSalesOrder = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id);
    if (!salesOrder) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    await salesOrder.update(req.body);
    const updatedOrder = await SalesOrder.findByPk(salesOrder.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: SalesOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    req.io.emit('sales_order_updated', updatedOrder);

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    logger.error('Update sales order error:', error);
    res.status(500).json({ error: 'Failed to update sales order' });
  }
};

const deleteSalesOrder = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id);
    if (!salesOrder) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    await salesOrder.destroy();
    res.json({ success: true, message: 'Sales order deleted successfully' });
  } catch (error) {
    logger.error('Delete sales order error:', error);
    res.status(500).json({ error: 'Failed to delete sales order' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const salesOrder = await SalesOrder.findByPk(req.params.id);
    
    if (!salesOrder) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    await salesOrder.update({ status });
    
    req.io.emit('sales_order_status_updated', {
      id: salesOrder.id,
      status
    });

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

const getSalesMetrics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalOrders = await SalesOrder.count({
      where: { created_at: { [Op.gte]: startOfMonth } }
    });

    const totalRevenue = await SalesOrder.sum('total_amount', {
      where: { 
        status: 'delivered',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    const ordersByStatus = await SalesOrder.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        total_revenue: totalRevenue || 0,
        orders_by_status: ordersByStatus
      }
    });
  } catch (error) {
    logger.error('Get sales metrics error:', error);
    res.status(500).json({ error: 'Failed to get sales metrics' });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: customers });
  } catch (error) {
    logger.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customerCount = await Customer.count();
    const customer_code = `CUST-${String(customerCount + 1).padStart(4, '0')}`;

    const customer = await Customer.create({
      ...req.body,
      customer_code
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    logger.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

module.exports = {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  updateOrderStatus,
  getSalesMetrics,
  getCustomers,
  createCustomer
};
