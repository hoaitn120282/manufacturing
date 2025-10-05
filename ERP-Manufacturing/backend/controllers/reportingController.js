const { ProductionOrder, SalesOrder, InventoryItem, User } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Production metrics
    const totalProductionOrders = await ProductionOrder.count({
      where: { created_at: { [Op.gte]: startOfMonth } }
    });

    const completedProductionOrders = await ProductionOrder.count({
      where: { 
        status: 'completed',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    // Sales metrics
    const totalSalesOrders = await SalesOrder.count({
      where: { created_at: { [Op.gte]: startOfMonth } }
    });

    const totalRevenue = await SalesOrder.sum('total_amount', {
      where: { 
        status: 'delivered',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    // Inventory metrics
    const totalInventoryItems = await InventoryItem.count({
      where: { is_active: true }
    });

    const lowStockItems = await InventoryItem.count({
      where: {
        current_stock: { [Op.lte]: require('sequelize').col('minimum_stock') },
        is_active: true
      }
    });

    // Recent activities (last 10)
    const recentActivities = [
      ...(await ProductionOrder.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'order_number', 'status', 'created_at'],
        raw: true
      })).map(order => ({
        ...order,
        type: 'production',
        description: `Production Order ${order.order_number} ${order.status}`
      })),
      
      ...(await SalesOrder.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'order_number', 'status', 'created_at'],
        raw: true
      })).map(order => ({
        ...order,
        type: 'sales',
        description: `Sales Order ${order.order_number} ${order.status}`
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          production_orders: totalProductionOrders,
          completed_production: completedProductionOrders,
          sales_orders: totalSalesOrders,
          total_revenue: totalRevenue || 0,
          inventory_items: totalInventoryItems,
          low_stock_alerts: lowStockItems
        },
        recent_activities: recentActivities
      }
    });
  } catch (error) {
    logger.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

const getProductionReports = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let whereClause = {};
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [start_date, end_date]
      };
    }

    const productionData = await ProductionOrder.findAll({
      where: whereClause,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('quantity_planned')), 'total_planned'],
        [require('sequelize').fn('SUM', require('sequelize').col('quantity_produced')), 'total_produced']
      ],
      group: ['status'],
      raw: true
    });

    // Production efficiency over time
    const dailyProduction = await ProductionOrder.findAll({
      where: {
        ...whereClause,
        status: 'completed'
      },
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('actual_end_date')), 'date'],
        [require('sequelize').fn('SUM', require('sequelize').col('quantity_produced')), 'daily_output']
      ],
      group: [require('sequelize').fn('DATE', require('sequelize').col('actual_end_date'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('actual_end_date')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        production_by_status: productionData,
        daily_production: dailyProduction
      }
    });
  } catch (error) {
    logger.error('Get production reports error:', error);
    res.status(500).json({ error: 'Failed to get production reports' });
  }
};

const getInventoryReports = async (req, res) => {
  try {
    // Stock levels by category
    const stockByCategory = await InventoryItem.findAll({
      attributes: [
        'category_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'item_count'],
        [require('sequelize').fn('SUM', require('sequelize').col('current_stock')), 'total_stock'],
        [require('sequelize').fn('SUM', require('sequelize').literal('current_stock * unit_cost')), 'total_value']
      ],
      where: { is_active: true },
      group: ['category_id'],
      raw: true
    });

    // Top items by value
    const topItemsByValue = await InventoryItem.findAll({
      attributes: [
        'id', 'name', 'sku', 'current_stock', 'unit_cost',
        [require('sequelize').literal('current_stock * unit_cost'), 'total_value']
      ],
      where: { is_active: true },
      order: [[require('sequelize').literal('current_stock * unit_cost'), 'DESC']],
      limit: 10,
      raw: true
    });

    // Items requiring reorder
    const reorderItems = await InventoryItem.findAll({
      where: {
        current_stock: { [Op.lte]: require('sequelize').col('reorder_point') },
        is_active: true
      },
      attributes: ['id', 'name', 'sku', 'current_stock', 'reorder_point', 'minimum_stock']
    });

    res.json({
      success: true,
      data: {
        stock_by_category: stockByCategory,
        top_items_by_value: topItemsByValue,
        reorder_required: reorderItems
      }
    });
  } catch (error) {
    logger.error('Get inventory reports error:', error);
    res.status(500).json({ error: 'Failed to get inventory reports' });
  }
};

const getSalesReports = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let whereClause = {};
    if (start_date && end_date) {
      whereClause.order_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    // Sales by status
    const salesByStatus = await SalesOrder.findAll({
      where: whereClause,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_value']
      ],
      group: ['status'],
      raw: true
    });

    // Monthly sales trend
    const monthlySales = await SalesOrder.findAll({
      where: whereClause,
      attributes: [
        [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('order_date')), 'month'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'total_sales'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'order_count']
      ],
      group: [require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('order_date'))],
      order: [[require('sequelize').fn('DATE_TRUNC', 'month', require('sequelize').col('order_date')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        sales_by_status: salesByStatus,
        monthly_sales: monthlySales
      }
    });
  } catch (error) {
    logger.error('Get sales reports error:', error);
    res.status(500).json({ error: 'Failed to get sales reports' });
  }
};

const getFinancialReports = async (req, res) => {
  try {
    // Basic financial metrics
    const totalRevenue = await SalesOrder.sum('total_amount', {
      where: { status: 'delivered' }
    });

    const pendingRevenue = await SalesOrder.sum('total_amount', {
      where: { status: { [Op.in]: ['confirmed', 'in_production', 'ready_to_ship'] } }
    });

    // Inventory valuation
    const inventoryValue = await InventoryItem.findAll({
      attributes: [
        [require('sequelize').fn('SUM', require('sequelize').literal('current_stock * unit_cost')), 'total_inventory_value']
      ],
      where: { is_active: true },
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue || 0,
        pending_revenue: pendingRevenue || 0,
        inventory_value: inventoryValue[0]?.total_inventory_value || 0
      }
    });
  } catch (error) {
    logger.error('Get financial reports error:', error);
    res.status(500).json({ error: 'Failed to get financial reports' });
  }
};

const getKPIMetrics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Production KPIs
    const totalPlanned = await ProductionOrder.sum('quantity_planned', {
      where: { 
        status: 'completed',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    const totalProduced = await ProductionOrder.sum('quantity_produced', {
      where: { 
        status: 'completed',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    const productionEfficiency = totalPlanned > 0 ? ((totalProduced / totalPlanned) * 100).toFixed(2) : 0;

    // On-time delivery
    const totalDeliveries = await SalesOrder.count({
      where: { 
        status: 'delivered',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    const onTimeDeliveries = await SalesOrder.count({
      where: { 
        status: 'delivered',
        created_at: { [Op.gte]: startOfMonth },
        [Op.and]: [
          require('sequelize').where(
            require('sequelize').col('delivered_date'),
            '<=',
            require('sequelize').col('promised_date')
          )
        ]
      }
    });

    const onTimeDeliveryRate = totalDeliveries > 0 ? ((onTimeDeliveries / totalDeliveries) * 100).toFixed(2) : 0;

    // Quality metrics (simplified)
    const totalOrders = await ProductionOrder.count({
      where: { 
        status: 'completed',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    const qualityRate = 95; // Placeholder - would be calculated from quality data

    res.json({
      success: true,
      data: {
        production_efficiency: `${productionEfficiency}%`,
        on_time_delivery_rate: `${onTimeDeliveryRate}%`,
        quality_rate: `${qualityRate}%`,
        total_orders_completed: totalOrders
      }
    });
  } catch (error) {
    logger.error('Get KPI metrics error:', error);
    res.status(500).json({ error: 'Failed to get KPI metrics' });
  }
};

const generateCustomReport = async (req, res) => {
  try {
    const { report_type, parameters } = req.body;

    // This would contain logic for generating custom reports
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Custom report generation is not yet implemented',
      data: {
        report_type,
        parameters,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Generate custom report error:', error);
    res.status(500).json({ error: 'Failed to generate custom report' });
  }
};

module.exports = {
  getDashboardData,
  getProductionReports,
  getInventoryReports,
  getSalesReports,
  getFinancialReports,
  getKPIMetrics,
  generateCustomReport
};
