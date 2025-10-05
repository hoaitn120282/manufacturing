const { Equipment, MaintenanceOrder, MaintenanceSchedule, MaintenanceHistory, Employee } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class MaintenanceController {
  // Equipment Management
  async getEquipment(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;

      const whereClause = {};
      if (status) whereClause.status = status;

      const { count, rows } = await Equipment.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: MaintenanceSchedule, 
            attributes: ['next_maintenance_date', 'maintenance_type'],
            order: [['next_maintenance_date', 'ASC']],
            limit: 1
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
      logger.error('Error fetching equipment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createEquipment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const equipment = await Equipment.create(req.body);
      
      logger.info(`Equipment created: ${equipment.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: equipment });
    } catch (error) {
      logger.error('Error creating equipment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateEquipment(req, res) {
    try {
      const { id } = req.params;
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        return res.status(404).json({ success: false, message: 'Equipment not found' });
      }

      await equipment.update(req.body);
      
      logger.info(`Equipment updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: equipment });
    } catch (error) {
      logger.error('Error updating equipment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async deleteEquipment(req, res) {
    try {
      const { id } = req.params;
      const equipment = await Equipment.findByPk(id);

      if (!equipment) {
        return res.status(404).json({ success: false, message: 'Equipment not found' });
      }

      await equipment.destroy();
      
      logger.info(`Equipment deleted: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Equipment deleted successfully' });
    } catch (error) {
      logger.error('Error deleting equipment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Maintenance Orders
  async getMaintenanceOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const status = req.query.status;
      const priority = req.query.priority;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;

      const { count, rows } = await MaintenanceOrder.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Equipment, 
            attributes: ['name', 'code', 'location'] 
          },
          { 
            model: Employee, 
            as: 'assignedTechnician', 
            attributes: ['first_name', 'last_name', 'email'] 
          }
        ],
        limit,
        offset,
        order: [['scheduled_date', 'ASC']]
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
      logger.error('Error fetching maintenance orders:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createMaintenanceOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const maintenanceOrder = await MaintenanceOrder.create({
        ...req.body,
        created_by: req.user.id
      });

      const result = await MaintenanceOrder.findByPk(maintenanceOrder.id, {
        include: [
          { model: Equipment, attributes: ['name', 'code', 'location'] },
          { model: Employee, as: 'assignedTechnician', attributes: ['first_name', 'last_name', 'email'] }
        ]
      });

      logger.info(`Maintenance order created: ${maintenanceOrder.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating maintenance order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateMaintenanceOrder(req, res) {
    try {
      const { id } = req.params;
      const maintenanceOrder = await MaintenanceOrder.findByPk(id);

      if (!maintenanceOrder) {
        return res.status(404).json({ success: false, message: 'Maintenance order not found' });
      }

      await maintenanceOrder.update(req.body);

      const result = await MaintenanceOrder.findByPk(id, {
        include: [
          { model: Equipment, attributes: ['name', 'code', 'location'] },
          { model: Employee, as: 'assignedTechnician', attributes: ['first_name', 'last_name', 'email'] }
        ]
      });

      logger.info(`Maintenance order updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating maintenance order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async completeMaintenanceOrder(req, res) {
    try {
      const { id } = req.params;
      const { completion_notes, parts_used, labor_hours } = req.body;

      const maintenanceOrder = await MaintenanceOrder.findByPk(id);

      if (!maintenanceOrder) {
        return res.status(404).json({ success: false, message: 'Maintenance order not found' });
      }

      // Update maintenance order status
      await maintenanceOrder.update({
        status: 'completed',
        completion_date: new Date(),
        completion_notes,
        parts_used,
        labor_hours
      });

      // Create maintenance history record
      await MaintenanceHistory.create({
        equipment_id: maintenanceOrder.equipment_id,
        maintenance_order_id: maintenanceOrder.id,
        maintenance_type: maintenanceOrder.maintenance_type,
        maintenance_date: new Date(),
        technician_id: maintenanceOrder.assigned_technician_id,
        parts_used,
        labor_hours,
        cost: req.body.cost || 0,
        notes: completion_notes
      });

      logger.info(`Maintenance order completed: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Maintenance order completed successfully' });
    } catch (error) {
      logger.error('Error completing maintenance order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Maintenance Schedules
  async getMaintenanceSchedules(req, res) {
    try {
      const schedules = await MaintenanceSchedule.findAll({
        include: [
          { model: Equipment, attributes: ['name', 'code', 'location'] }
        ],
        order: [['next_maintenance_date', 'ASC']]
      });

      res.json({ success: true, data: schedules });
    } catch (error) {
      logger.error('Error fetching maintenance schedules:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createMaintenanceSchedule(req, res) {
    try {
      const schedule = await MaintenanceSchedule.create(req.body);
      
      const result = await MaintenanceSchedule.findByPk(schedule.id, {
        include: [{ model: Equipment, attributes: ['name', 'code', 'location'] }]
      });

      logger.info(`Maintenance schedule created: ${schedule.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating maintenance schedule:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateMaintenanceSchedule(req, res) {
    try {
      const { id } = req.params;
      const schedule = await MaintenanceSchedule.findByPk(id);

      if (!schedule) {
        return res.status(404).json({ success: false, message: 'Maintenance schedule not found' });
      }

      await schedule.update(req.body);
      
      const result = await MaintenanceSchedule.findByPk(id, {
        include: [{ model: Equipment, attributes: ['name', 'code', 'location'] }]
      });

      logger.info(`Maintenance schedule updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating maintenance schedule:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Maintenance History
  async getMaintenanceHistory(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const equipment_id = req.query.equipment_id;

      const whereClause = {};
      if (equipment_id) whereClause.equipment_id = equipment_id;

      const { count, rows } = await MaintenanceHistory.findAndCountAll({
        where: whereClause,
        include: [
          { model: Equipment, attributes: ['name', 'code', 'location'] },
          { model: Employee, as: 'technician', attributes: ['first_name', 'last_name'] }
        ],
        limit,
        offset,
        order: [['maintenance_date', 'DESC']]
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
      logger.error('Error fetching maintenance history:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Maintenance Dashboard
  async getMaintenanceDashboard(req, res) {
    try {
      const totalEquipment = await Equipment.count();
      const activeEquipment = await Equipment.count({ where: { status: 'active' } });
      const inMaintenanceEquipment = await Equipment.count({ where: { status: 'maintenance' } });
      
      const pendingOrders = await MaintenanceOrder.count({ where: { status: 'pending' } });
      const inProgressOrders = await MaintenanceOrder.count({ where: { status: 'in_progress' } });
      const overdueOrders = await MaintenanceOrder.count({
        where: {
          status: { [Op.ne]: 'completed' },
          scheduled_date: { [Op.lt]: new Date() }
        }
      });

      // Upcoming maintenance (next 7 days)
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const upcomingMaintenance = await MaintenanceSchedule.findAll({
        where: {
          next_maintenance_date: {
            [Op.between]: [new Date(), nextWeek]
          }
        },
        include: [{ model: Equipment, attributes: ['name', 'code'] }],
        order: [['next_maintenance_date', 'ASC']]
      });

      // Recent maintenance activities
      const recentActivities = await MaintenanceHistory.findAll({
        include: [
          { model: Equipment, attributes: ['name', 'code'] },
          { model: Employee, as: 'technician', attributes: ['first_name', 'last_name'] }
        ],
        limit: 10,
        order: [['maintenance_date', 'DESC']]
      });

      // Equipment downtime analysis
      const equipmentDowntime = await Equipment.findAll({
        attributes: ['id', 'name', 'code', 'total_downtime_hours'],
        order: [['total_downtime_hours', 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalEquipment,
            activeEquipment,
            inMaintenanceEquipment,
            pendingOrders,
            inProgressOrders,
            overdueOrders
          },
          upcomingMaintenance,
          recentActivities,
          equipmentDowntime
        }
      });
    } catch (error) {
      logger.error('Error fetching maintenance dashboard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new MaintenanceController();