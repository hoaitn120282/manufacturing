const { ProductionOrder, Product, SalesOrder, WorkOrder, User } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

// @desc    Get all production orders
// @route   GET /api/production
// @access  Private
const getProductionOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (search) {
      whereClause.order_number = { [Op.iLike]: `%${search}%` };
    }

    const productionOrders = await ProductionOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'first_name', 'last_name'],
          foreignKey: 'created_by'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        production_orders: productionOrders.rows,
        pagination: {
          total: productionOrders.count,
          page: parseInt(page),
          pages: Math.ceil(productionOrders.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get production orders error:', error);
    res.status(500).json({ error: 'Failed to get production orders' });
  }
};

// @desc    Get production order by ID
// @route   GET /api/production/:id
// @access  Private
const getProductionOrderById = async (req, res) => {
  try {
    const productionOrder = await ProductionOrder.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'description']
        },
        {
          model: WorkOrder,
          as: 'work_orders'
        }
      ]
    });

    if (!productionOrder) {
      return res.status(404).json({ error: 'Production order not found' });
    }

    res.json({
      success: true,
      data: productionOrder
    });
  } catch (error) {
    logger.error('Get production order by ID error:', error);
    res.status(500).json({ error: 'Failed to get production order' });
  }
};

// @desc    Create production order
// @route   POST /api/production
// @access  Private (Manager/Production Manager)
const createProductionOrder = async (req, res) => {
  try {
    const {
      product_id,
      quantity_planned,
      start_date,
      due_date,
      priority,
      notes,
      sales_order_id
    } = req.body;

    // Generate order number
    const orderCount = await ProductionOrder.count();
    const order_number = `PO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

    const productionOrder = await ProductionOrder.create({
      order_number,
      product_id,
      quantity_planned,
      start_date,
      due_date,
      priority,
      notes,
      sales_order_id,
      created_by: req.user.id
    });

    const createdOrder = await ProductionOrder.findByPk(productionOrder.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }
      ]
    });

    // Emit real-time update
    req.io.emit('production_order_created', createdOrder);

    logger.info(`Production order created: ${order_number} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    logger.error('Create production order error:', error);
    res.status(500).json({ error: 'Failed to create production order' });
  }
};

// @desc    Update production order
// @route   PUT /api/production/:id
// @access  Private (Manager/Production Manager)
const updateProductionOrder = async (req, res) => {
  try {
    const productionOrder = await ProductionOrder.findByPk(req.params.id);
    if (!productionOrder) {
      return res.status(404).json({ error: 'Production order not found' });
    }

    const {
      quantity_planned,
      start_date,
      due_date,
      priority,
      notes,
      status
    } = req.body;

    await productionOrder.update({
      quantity_planned: quantity_planned || productionOrder.quantity_planned,
      start_date: start_date || productionOrder.start_date,
      due_date: due_date || productionOrder.due_date,
      priority: priority || productionOrder.priority,
      notes: notes || productionOrder.notes,
      status: status || productionOrder.status
    });

    const updatedOrder = await ProductionOrder.findByPk(productionOrder.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }
      ]
    });

    // Emit real-time update
    req.io.emit('production_order_updated', updatedOrder);

    logger.info(`Production order updated: ${productionOrder.order_number} by ${req.user.email}`);

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    logger.error('Update production order error:', error);
    res.status(500).json({ error: 'Failed to update production order' });
  }
};

// @desc    Delete production order
// @route   DELETE /api/production/:id
// @access  Private (Admin/Manager)
const deleteProductionOrder = async (req, res) => {
  try {
    const productionOrder = await ProductionOrder.findByPk(req.params.id);
    if (!productionOrder) {
      return res.status(404).json({ error: 'Production order not found' });
    }

    await productionOrder.destroy();

    logger.info(`Production order deleted: ${productionOrder.order_number} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Production order deleted successfully'
    });
  } catch (error) {
    logger.error('Delete production order error:', error);
    res.status(500).json({ error: 'Failed to delete production order' });
  }
};

// @desc    Update production status
// @route   PUT /api/production/:id/status
// @access  Private (Production Manager/Operator)
const updateProductionStatus = async (req, res) => {
  try {
    const { status, quantity_produced, quantity_rejected } = req.body;

    const productionOrder = await ProductionOrder.findByPk(req.params.id);
    if (!productionOrder) {
      return res.status(404).json({ error: 'Production order not found' });
    }

    const updateData = { status };
    
    if (quantity_produced !== undefined) {
      updateData.quantity_produced = quantity_produced;
    }
    
    if (quantity_rejected !== undefined) {
      updateData.quantity_rejected = quantity_rejected;
    }

    if (status === 'in_progress' && !productionOrder.actual_start_date) {
      updateData.actual_start_date = new Date();
    }

    if (status === 'completed') {
      updateData.actual_end_date = new Date();
    }

    await productionOrder.update(updateData);

    // Emit real-time update
    req.io.emit('production_status_updated', {
      id: productionOrder.id,
      status,
      quantity_produced,
      quantity_rejected
    });

    logger.info(`Production order status updated: ${productionOrder.order_number} to ${status}`);

    res.json({
      success: true,
      message: 'Production status updated successfully'
    });
  } catch (error) {
    logger.error('Update production status error:', error);
    res.status(500).json({ error: 'Failed to update production status' });
  }
};

// @desc    Get production schedule
// @route   GET /api/production/schedule/view
// @access  Private
const getProductionSchedule = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = {
      status: {
        [Op.in]: ['planned', 'released', 'in_progress']
      }
    };

    if (start_date && end_date) {
      whereClause.start_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const schedule = await ProductionOrder.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku']
        }
      ],
      order: [['start_date', 'ASC']]
    });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    logger.error('Get production schedule error:', error);
    res.status(500).json({ error: 'Failed to get production schedule' });
  }
};

// @desc    Get production metrics
// @route   GET /api/production/metrics/dashboard
// @access  Private
const getProductionMetrics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total orders this month
    const totalOrders = await ProductionOrder.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Orders by status
    const ordersByStatus = await ProductionOrder.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Production efficiency (completed vs planned)
    const completedOrders = await ProductionOrder.findAll({
      where: {
        status: 'completed',
        created_at: {
          [Op.gte]: startOfMonth
        }
      },
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').col('quantity_produced')), 'total_produced'],
        [require('sequelize').fn('SUM', require('sequelize').col('quantity_planned')), 'total_planned']
      ],
      raw: true
    });

    const efficiency = completedOrders[0]?.total_planned > 0 
      ? (completedOrders[0]?.total_produced / completedOrders[0]?.total_planned * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        orders_by_status: ordersByStatus,
        production_efficiency: `${efficiency}%`,
        total_produced: completedOrders[0]?.total_produced || 0,
        total_planned: completedOrders[0]?.total_planned || 0
      }
    });
  } catch (error) {
    logger.error('Get production metrics error:', error);
    res.status(500).json({ error: 'Failed to get production metrics' });
  }
};

module.exports = {
  getProductionOrders,
  getProductionOrderById,
  createProductionOrder,
  updateProductionOrder,
  deleteProductionOrder,
  updateProductionStatus,
  getProductionSchedule,
  getProductionMetrics
};