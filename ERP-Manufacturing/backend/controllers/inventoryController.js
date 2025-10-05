const { InventoryItem, Category, InventoryTransaction, Warehouse } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

const getInventoryItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const items = await InventoryItem.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: 'category' }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        items: items.rows,
        pagination: {
          total: items.count,
          page: parseInt(page),
          pages: Math.ceil(items.count / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get inventory items error:', error);
    res.status(500).json({ error: 'Failed to get inventory items' });
  }
};

const getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Get inventory item by ID error:', error);
    res.status(500).json({ error: 'Failed to get inventory item' });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    const createdItem = await InventoryItem.findByPk(item.id, {
      include: [{ model: Category, as: 'category' }]
    });

    res.status(201).json({ success: true, data: createdItem });
  } catch (error) {
    logger.error('Create inventory item error:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.update(req.body);
    const updatedItem = await InventoryItem.findByPk(item.id, {
      include: [{ model: Category, as: 'category' }]
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    logger.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.destroy();
    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    logger.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};

const getInventoryTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.findAll({
      include: [{ model: InventoryItem, as: 'item' }],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    logger.error('Get inventory transactions error:', error);
    res.status(500).json({ error: 'Failed to get inventory transactions' });
  }
};

const createInventoryTransaction = async (req, res) => {
  try {
    const transaction = await InventoryTransaction.create({
      ...req.body,
      created_by: req.user.id
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    logger.error('Create inventory transaction error:', error);
    res.status(500).json({ error: 'Failed to create inventory transaction' });
  }
};

const getStockLevels = async (req, res) => {
  try {
    const stockLevels = await InventoryItem.findAll({
      attributes: ['id', 'name', 'sku', 'current_stock', 'minimum_stock', 'maximum_stock'],
      where: { is_active: true }
    });

    res.json({ success: true, data: stockLevels });
  } catch (error) {
    logger.error('Get stock levels error:', error);
    res.status(500).json({ error: 'Failed to get stock levels' });
  }
};

const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.findAll({
      where: {
        current_stock: { [Op.lte]: require('sequelize').col('minimum_stock') },
        is_active: true
      },
      attributes: ['id', 'name', 'sku', 'current_stock', 'minimum_stock']
    });

    res.json({ success: true, data: lowStockItems });
  } catch (error) {
    logger.error('Get low stock items error:', error);
    res.status(500).json({ error: 'Failed to get low stock items' });
  }
};

const getInventoryValuation = async (req, res) => {
  try {
    const valuation = await InventoryItem.findAll({
      attributes: [
        'id', 'name', 'sku', 'current_stock', 'unit_cost',
        [require('sequelize').literal('current_stock * unit_cost'), 'total_value']
      ],
      where: { is_active: true }
    });

    const totalValue = valuation.reduce((sum, item) => sum + parseFloat(item.dataValues.total_value || 0), 0);

    res.json({ 
      success: true, 
      data: { 
        items: valuation,
        total_inventory_value: totalValue.toFixed(2)
      } 
    });
  } catch (error) {
    logger.error('Get inventory valuation error:', error);
    res.status(500).json({ error: 'Failed to get inventory valuation' });
  }
};

module.exports = {
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
};
