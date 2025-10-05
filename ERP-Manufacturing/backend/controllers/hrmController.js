const { Employee, Department, Attendance, Payroll } = require('../models');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class HRMController {
  // Employee Management
  async getEmployees(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const department_id = req.query.department_id;
      const status = req.query.status;
      const search = req.query.search;

      const whereClause = {};
      if (department_id) whereClause.department_id = department_id;
      if (status) whereClause.status = status;
      if (search) {
        whereClause[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { employee_id: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Employee.findAndCountAll({
        where: whereClause,
        include: [
          { model: Department, attributes: ['name', 'code'] }
        ],
        attributes: { exclude: ['password'] }, // Don't return password
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
      logger.error('Error fetching employees:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id, {
        include: [
          { model: Department, attributes: ['name', 'code'] }
        ],
        attributes: { exclude: ['password'] }
      });

      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      res.json({ success: true, data: employee });
    } catch (error) {
      logger.error('Error fetching employee:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createEmployee(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      // Hash password if provided
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 12);
      }

      const employee = await Employee.create(req.body);
      
      const result = await Employee.findByPk(employee.id, {
        include: [{ model: Department, attributes: ['name', 'code'] }],
        attributes: { exclude: ['password'] }
      });

      logger.info(`Employee created: ${employee.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error creating employee:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id);

      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      // Hash password if being updated
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 12);
      }

      await employee.update(req.body);
      
      const result = await Employee.findByPk(id, {
        include: [{ model: Department, attributes: ['name', 'code'] }],
        attributes: { exclude: ['password'] }
      });

      logger.info(`Employee updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error updating employee:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findByPk(id);

      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      // Soft delete - update status instead of actually deleting
      await employee.update({ status: 'terminated' });
      
      logger.info(`Employee terminated: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Employee terminated successfully' });
    } catch (error) {
      logger.error('Error terminating employee:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Department Management
  async getDepartments(req, res) {
    try {
      const departments = await Department.findAll({
        include: [
          {
            model: Employee,
            attributes: ['id'],
            where: { status: 'active' },
            required: false
          }
        ],
        attributes: {
          include: [
            [sequelize.fn('COUNT', sequelize.col('Employees.id')), 'employee_count']
          ]
        },
        group: ['Department.id'],
        order: [['name', 'ASC']]
      });

      res.json({ success: true, data: departments });
    } catch (error) {
      logger.error('Error fetching departments:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async createDepartment(req, res) {
    try {
      const department = await Department.create(req.body);
      
      logger.info(`Department created: ${department.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: department });
    } catch (error) {
      logger.error('Error creating department:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const department = await Department.findByPk(id);

      if (!department) {
        return res.status(404).json({ success: false, message: 'Department not found' });
      }

      await department.update(req.body);
      
      logger.info(`Department updated: ${id} by user ${req.user.id}`);
      res.json({ success: true, data: department });
    } catch (error) {
      logger.error('Error updating department:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Attendance Management
  async getAttendance(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const employee_id = req.query.employee_id;
      const date_from = req.query.date_from;
      const date_to = req.query.date_to;

      const whereClause = {};
      if (employee_id) whereClause.employee_id = employee_id;
      if (date_from && date_to) {
        whereClause.date = {
          [Op.between]: [new Date(date_from), new Date(date_to)]
        };
      }

      const { count, rows } = await Attendance.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Employee, 
            attributes: ['first_name', 'last_name', 'employee_id'],
            include: [{ model: Department, attributes: ['name'] }]
          }
        ],
        limit,
        offset,
        order: [['date', 'DESC'], ['check_in', 'DESC']]
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
      logger.error('Error fetching attendance:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async recordAttendance(req, res) {
    try {
      const { employee_id, check_in, check_out, date, status } = req.body;

      // Check if attendance already exists for this employee and date
      const existingAttendance = await Attendance.findOne({
        where: { employee_id, date }
      });

      let attendance;
      if (existingAttendance) {
        // Update existing attendance
        await existingAttendance.update({ check_in, check_out, status });
        attendance = existingAttendance;
      } else {
        // Create new attendance record
        attendance = await Attendance.create({
          employee_id,
          date,
          check_in,
          check_out,
          status
        });
      }

      const result = await Attendance.findByPk(attendance.id, {
        include: [
          { 
            model: Employee, 
            attributes: ['first_name', 'last_name', 'employee_id'],
            include: [{ model: Department, attributes: ['name'] }]
          }
        ]
      });

      logger.info(`Attendance recorded: ${attendance.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error recording attendance:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async checkIn(req, res) {
    try {
      const { employee_id } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      // Check if already checked in today
      const existingAttendance = await Attendance.findOne({
        where: { employee_id, date: today }
      });

      if (existingAttendance && existingAttendance.check_in) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee already checked in today' 
        });
      }

      let attendance;
      if (existingAttendance) {
        await existingAttendance.update({ check_in: now, status: 'present' });
        attendance = existingAttendance;
      } else {
        attendance = await Attendance.create({
          employee_id,
          date: today,
          check_in: now,
          status: 'present'
        });
      }

      logger.info(`Employee checked in: ${employee_id} at ${now}`);
      res.json({ success: true, data: attendance });
    } catch (error) {
      logger.error('Error checking in employee:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async checkOut(req, res) {
    try {
      const { employee_id } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      const attendance = await Attendance.findOne({
        where: { employee_id, date: today }
      });

      if (!attendance || !attendance.check_in) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee has not checked in today' 
        });
      }

      if (attendance.check_out) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee already checked out today' 
        });
      }

      await attendance.update({ check_out: now });

      logger.info(`Employee checked out: ${employee_id} at ${now}`);
      res.json({ success: true, data: attendance });
    } catch (error) {
      logger.error('Error checking out employee:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Payroll Management
  async getPayrolls(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const month = req.query.month;
      const year = req.query.year;

      const whereClause = {};
      if (month) whereClause.pay_month = month;
      if (year) whereClause.pay_year = year;

      const { count, rows } = await Payroll.findAndCountAll({
        where: whereClause,
        include: [
          { 
            model: Employee, 
            attributes: ['first_name', 'last_name', 'employee_id'],
            include: [{ model: Department, attributes: ['name'] }]
          }
        ],
        limit,
        offset,
        order: [['pay_year', 'DESC'], ['pay_month', 'DESC']]
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
      logger.error('Error fetching payrolls:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async generatePayroll(req, res) {
    try {
      const { employee_id, pay_month, pay_year, basic_salary } = req.body;

      // Check if payroll already exists
      const existingPayroll = await Payroll.findOne({
        where: { employee_id, pay_month, pay_year }
      });

      if (existingPayroll) {
        return res.status(400).json({
          success: false,
          message: 'Payroll already exists for this employee and period'
        });
      }

      // Calculate working days and attendance
      const startDate = new Date(pay_year, pay_month - 1, 1);
      const endDate = new Date(pay_year, pay_month, 0);
      
      const attendanceRecords = await Attendance.findAll({
        where: {
          employee_id,
          date: { [Op.between]: [startDate, endDate] },
          status: 'present'
        }
      });

      const working_days = attendanceRecords.length;
      const total_working_days = 30; // Assuming 30 working days per month
      
      // Calculate salary components
      const overtime_hours = req.body.overtime_hours || 0;
      const overtime_rate = req.body.overtime_rate || 0;
      const overtime_pay = overtime_hours * overtime_rate;
      
      const allowances = req.body.allowances || 0;
      const deductions = req.body.deductions || 0;
      
      const gross_salary = (basic_salary / total_working_days) * working_days + overtime_pay + allowances;
      const net_salary = gross_salary - deductions;

      const payroll = await Payroll.create({
        employee_id,
        pay_month,
        pay_year,
        basic_salary,
        overtime_hours,
        overtime_pay,
        allowances,
        deductions,
        gross_salary,
        net_salary,
        working_days,
        status: 'draft'
      });

      const result = await Payroll.findByPk(payroll.id, {
        include: [
          { 
            model: Employee, 
            attributes: ['first_name', 'last_name', 'employee_id'],
            include: [{ model: Department, attributes: ['name'] }]
          }
        ]
      });

      logger.info(`Payroll generated: ${payroll.id} by user ${req.user.id}`);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error generating payroll:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async approvePayroll(req, res) {
    try {
      const { id } = req.params;
      const payroll = await Payroll.findByPk(id);

      if (!payroll) {
        return res.status(404).json({ success: false, message: 'Payroll not found' });
      }

      await payroll.update({ 
        status: 'approved',
        approved_by: req.user.id,
        approved_at: new Date()
      });

      logger.info(`Payroll approved: ${id} by user ${req.user.id}`);
      res.json({ success: true, message: 'Payroll approved successfully' });
    } catch (error) {
      logger.error('Error approving payroll:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // HRM Dashboard
  async getHRMDashboard(req, res) {
    try {
      const totalEmployees = await Employee.count({ where: { status: 'active' } });
      const totalDepartments = await Department.count();
      
      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await Attendance.count({
        where: { date: today, status: 'present' }
      });
      const attendanceRate = totalEmployees > 0 ? ((todayAttendance / totalEmployees) * 100).toFixed(2) : 0;

      // Employee by department
      const employeesByDepartment = await Department.findAll({
        include: [
          {
            model: Employee,
            attributes: ['id'],
            where: { status: 'active' },
            required: false
          }
        ],
        attributes: [
          'name',
          [sequelize.fn('COUNT', sequelize.col('Employees.id')), 'count']
        ],
        group: ['Department.id']
      });

      // Recent hirings (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentHirings = await Employee.findAll({
        where: {
          hire_date: { [Op.gte]: thirtyDaysAgo },
          status: 'active'
        },
        include: [{ model: Department, attributes: ['name'] }],
        attributes: ['first_name', 'last_name', 'hire_date', 'position'],
        order: [['hire_date', 'DESC']],
        limit: 10
      });

      // Attendance trends (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const attendanceTrends = await Attendance.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('date')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'present_count']
        ],
        where: {
          date: { [Op.gte]: sevenDaysAgo },
          status: 'present'
        },
        group: [sequelize.fn('DATE', sequelize.col('date'))],
        order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']]
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalEmployees,
            totalDepartments,
            todayAttendance,
            attendanceRate
          },
          employeesByDepartment,
          recentHirings,
          attendanceTrends
        }
      });
    } catch (error) {
      logger.error('Error fetching HRM dashboard:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new HRMController();