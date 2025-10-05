const { sequelize } = require('../config/database');

// Import all models for comprehensive seeding
const {
  // User Management & Authentication
  User, Role, Permission, RolePermission,

  // Production Management Models
  Product, ProductionOrder, BillOfMaterial, BOMItem, WorkOrder, ProductionSchedule,

  // Inventory Management Models
  Category, InventoryItem, Warehouse, InventoryTransaction, StockLocation, Lot,

  // Sales Management Models
  Customer, SalesOrder, SalesOrderItem, Quotation, QuotationItem, Shipment,

  // Quality Management Models
  QualityControl, QualityStandard, QualityTest, QualityReport,

  // Maintenance Management Models
  Equipment, MaintenanceSchedule, MaintenanceOrder, MaintenanceHistory,

  // HRM Models
  Employee, Department, Attendance, Payroll,

  // Finance Models
  Account, Transaction, Invoice, Payment,

  // Procurement Models
  Supplier, PurchaseOrder, PurchaseOrderItem, PurchaseRequest
} = require('../models');

const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

const seedData = async () => {
  try {
    logger.info('Starting comprehensive database seeding...');

    // Force sync database (recreate tables)
    await sequelize.sync({ force: true });
    logger.info('Database tables created');

    // ==========================================
    // 1. ROLES AND PERMISSIONS (Foundation)
    // ==========================================
    const roles = await Role.bulkCreate([
      { name: 'admin', description: 'System Administrator' },
      { name: 'manager', description: 'General Manager' },
      { name: 'production_manager', description: 'Production Manager' },
      { name: 'sales_manager', description: 'Sales Manager' },
      { name: 'warehouse_manager', description: 'Warehouse Manager' },
      { name: 'quality_manager', description: 'Quality Manager' },
      { name: 'maintenance_manager', description: 'Maintenance Manager' },
      { name: 'hr_manager', description: 'Human Resources Manager' },
      { name: 'finance_manager', description: 'Finance Manager' },
      { name: 'procurement_manager', description: 'Procurement Manager' },
      { name: 'operator', description: 'Production Operator' },
      { name: 'technician', description: 'Maintenance Technician' },
      { name: 'quality_inspector', description: 'Quality Inspector' },
      { name: 'sales_rep', description: 'Sales Representative' },
      { name: 'user', description: 'General User' }
    ]);
    logger.info('Roles seeded');

    const permissions = await Permission.bulkCreate([
      // Production permissions
      { name: 'create_production', description: 'Create Production Orders', module: 'production', action: 'create' },
      { name: 'read_production', description: 'View Production Orders', module: 'production', action: 'read' },
      { name: 'update_production', description: 'Update Production Orders', module: 'production', action: 'update' },
      { name: 'delete_production', description: 'Delete Production Orders', module: 'production', action: 'delete' },
      
      // Inventory permissions
      { name: 'create_inventory', description: 'Create Inventory Items', module: 'inventory', action: 'create' },
      { name: 'read_inventory', description: 'View Inventory Items', module: 'inventory', action: 'read' },
      { name: 'update_inventory', description: 'Update Inventory Items', module: 'inventory', action: 'update' },
      { name: 'delete_inventory', description: 'Delete Inventory Items', module: 'inventory', action: 'delete' },
      
      // Sales permissions
      { name: 'create_sales', description: 'Create Sales Orders', module: 'sales', action: 'create' },
      { name: 'read_sales', description: 'View Sales Orders', module: 'sales', action: 'read' },
      { name: 'update_sales', description: 'Update Sales Orders', module: 'sales', action: 'update' },
      { name: 'delete_sales', description: 'Delete Sales Orders', module: 'sales', action: 'delete' },
      
      // Quality permissions
      { name: 'create_quality', description: 'Create Quality Records', module: 'quality', action: 'create' },
      { name: 'read_quality', description: 'View Quality Records', module: 'quality', action: 'read' },
      { name: 'update_quality', description: 'Update Quality Records', module: 'quality', action: 'update' },
      
      // Maintenance permissions
      { name: 'create_maintenance', description: 'Create Maintenance Orders', module: 'maintenance', action: 'create' },
      { name: 'read_maintenance', description: 'View Maintenance Orders', module: 'maintenance', action: 'read' },
      { name: 'update_maintenance', description: 'Update Maintenance Orders', module: 'maintenance', action: 'update' },
      
      // HR permissions
      { name: 'manage_employees', description: 'Manage Employees', module: 'hr', action: 'manage' },
      { name: 'read_employees', description: 'View Employees', module: 'hr', action: 'read' },
      
      // Finance permissions
      { name: 'create_financial', description: 'Create Financial Records', module: 'finance', action: 'create' },
      { name: 'read_financial', description: 'View Financial Records', module: 'finance', action: 'read' },
      { name: 'update_financial', description: 'Update Financial Records', module: 'finance', action: 'update' },
      
      // Procurement permissions
      { name: 'create_procurement', description: 'Create Purchase Orders', module: 'procurement', action: 'create' },
      { name: 'read_procurement', description: 'View Purchase Orders', module: 'procurement', action: 'read' },
      { name: 'update_procurement', description: 'Update Purchase Orders', module: 'procurement', action: 'update' },
      
      // User management
      { name: 'manage_users', description: 'Manage Users', module: 'users', action: 'manage' },
      { name: 'read_users', description: 'View Users', module: 'users', action: 'read' }
    ]);
    logger.info('Permissions seeded');

    // ==========================================
    // 2. DEPARTMENTS
    // ==========================================
    const departments = await Department.bulkCreate([
      { name: 'Production', code: 'PROD', description: 'Manufacturing and production operations', cost_center: 'CC-001', is_active: true },
      { name: 'Quality Assurance', code: 'QA', description: 'Quality control and testing', cost_center: 'CC-002', is_active: true },
      { name: 'Maintenance', code: 'MAINT', description: 'Equipment maintenance and repair', cost_center: 'CC-003', is_active: true },
      { name: 'Warehouse', code: 'WH', description: 'Inventory and logistics', cost_center: 'CC-004', is_active: true },
      { name: 'Sales & Marketing', code: 'SALES', description: 'Sales and customer relations', cost_center: 'CC-005', is_active: true },
      { name: 'Human Resources', code: 'HR', description: 'Employee management and development', cost_center: 'CC-006', is_active: true },
      { name: 'Finance & Accounting', code: 'FIN', description: 'Financial operations and accounting', cost_center: 'CC-007', is_active: true },
      { name: 'Procurement', code: 'PROC', description: 'Purchasing and vendor management', cost_center: 'CC-008', is_active: true },
      { name: 'Engineering', code: 'ENG', description: 'Product design and engineering', cost_center: 'CC-009', is_active: true },
      { name: 'IT Department', code: 'IT', description: 'Information technology and systems', cost_center: 'CC-010', is_active: true }
    ]);
    logger.info('Departments seeded');

    // ==========================================
    // 3. EMPLOYEES
    // ==========================================
    const employees = await Employee.bulkCreate([
      // Management
      { employee_id: 'EMP-001', first_name: 'John', last_name: 'Smith', email: 'john.smith@company.com', 
        phone: '+1-555-0001', hire_date: new Date('2020-01-15'), job_title: 'General Manager', 
        department_id: 1, salary: 120000, employment_type: 'full_time', status: 'active',
        address: '123 Manager St, City, State 12345', emergency_contact: 'Jane Smith', emergency_phone: '+1-555-1001' },
      
      { employee_id: 'EMP-002', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@company.com', 
        phone: '+1-555-0002', hire_date: new Date('2020-03-10'), job_title: 'Production Manager', 
        department_id: 1, manager_id: 1, salary: 85000, employment_type: 'full_time', status: 'active',
        address: '456 Production Ave, City, State 12345', emergency_contact: 'Mike Johnson', emergency_phone: '+1-555-1002' },
      
      { employee_id: 'EMP-003', first_name: 'Michael', last_name: 'Davis', email: 'michael.davis@company.com', 
        phone: '+1-555-0003', hire_date: new Date('2021-06-15'), job_title: 'Quality Manager', 
        department_id: 2, manager_id: 1, salary: 75000, employment_type: 'full_time', status: 'active',
        address: '789 Quality Blvd, City, State 12345', emergency_contact: 'Lisa Davis', emergency_phone: '+1-555-1003' },
      
      { employee_id: 'EMP-004', first_name: 'Emily', last_name: 'Wilson', email: 'emily.wilson@company.com', 
        phone: '+1-555-0004', hire_date: new Date('2021-08-20'), job_title: 'Maintenance Manager', 
        department_id: 3, manager_id: 1, salary: 70000, employment_type: 'full_time', status: 'active',
        address: '321 Maintenance Rd, City, State 12345', emergency_contact: 'Robert Wilson', emergency_phone: '+1-555-1004' },
      
      { employee_id: 'EMP-005', first_name: 'David', last_name: 'Brown', email: 'david.brown@company.com', 
        phone: '+1-555-0005', hire_date: new Date('2022-01-10'), job_title: 'Warehouse Manager', 
        department_id: 4, manager_id: 1, salary: 65000, employment_type: 'full_time', status: 'active',
        address: '654 Warehouse Way, City, State 12345', emergency_contact: 'Mary Brown', emergency_phone: '+1-555-1005' },
      
      // Operations Staff
      { employee_id: 'EMP-006', first_name: 'James', last_name: 'Miller', email: 'james.miller@company.com', 
        phone: '+1-555-0006', hire_date: new Date('2022-04-15'), job_title: 'Production Operator', 
        department_id: 1, manager_id: 2, hourly_rate: 25.50, employment_type: 'full_time', status: 'active',
        address: '987 Worker St, City, State 12345', emergency_contact: 'Susan Miller', emergency_phone: '+1-555-1006' },
      
      { employee_id: 'EMP-007', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa.anderson@company.com', 
        phone: '+1-555-0007', hire_date: new Date('2022-07-01'), job_title: 'Quality Inspector', 
        department_id: 2, manager_id: 3, hourly_rate: 23.00, employment_type: 'full_time', status: 'active',
        address: '147 Inspector Ave, City, State 12345', emergency_contact: 'Tom Anderson', emergency_phone: '+1-555-1007' },
      
      { employee_id: 'EMP-008', first_name: 'Robert', last_name: 'Taylor', email: 'robert.taylor@company.com', 
        phone: '+1-555-0008', hire_date: new Date('2022-09-15'), job_title: 'Maintenance Technician', 
        department_id: 3, manager_id: 4, hourly_rate: 28.00, employment_type: 'full_time', status: 'active',
        address: '258 Tech Lane, City, State 12345', emergency_contact: 'Nancy Taylor', emergency_phone: '+1-555-1008' },
      
      { employee_id: 'EMP-009', first_name: 'Maria', last_name: 'Garcia', email: 'maria.garcia@company.com', 
        phone: '+1-555-0009', hire_date: new Date('2023-01-20'), job_title: 'Warehouse Operator', 
        department_id: 4, manager_id: 5, hourly_rate: 22.00, employment_type: 'full_time', status: 'active',
        address: '369 Storage Dr, City, State 12345', emergency_contact: 'Carlos Garcia', emergency_phone: '+1-555-1009' },
      
      { employee_id: 'EMP-010', first_name: 'Kevin', last_name: 'Martinez', email: 'kevin.martinez@company.com', 
        phone: '+1-555-0010', hire_date: new Date('2023-05-01'), job_title: 'Sales Representative', 
        department_id: 5, salary: 55000, employment_type: 'full_time', status: 'active',
        address: '741 Sales Blvd, City, State 12345', emergency_contact: 'Anna Martinez', emergency_phone: '+1-555-1010' }
    ]);
    logger.info('Employees seeded');

    // Update department managers
    await Department.update({ manager_id: 2 }, { where: { id: 1 } }); // Production
    await Department.update({ manager_id: 3 }, { where: { id: 2 } }); // Quality
    await Department.update({ manager_id: 4 }, { where: { id: 3 } }); // Maintenance
    await Department.update({ manager_id: 5 }, { where: { id: 4 } }); // Warehouse

    // ==========================================
    // 4. USERS (AUTHENTICATION)
    // ==========================================
    const users = await User.bulkCreate([
      {
        email: 'admin@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'System',
        last_name: 'Administrator',
        role_id: 1, // admin
        employee_id: 1,
        is_active: true
      },
      {
        email: 'john.smith@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'John',
        last_name: 'Smith',
        role_id: 2, // manager
        employee_id: 1,
        is_active: true
      },
      {
        email: 'sarah.johnson@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Sarah',
        last_name: 'Johnson',
        role_id: 3, // production_manager
        employee_id: 2,
        is_active: true
      },
      {
        email: 'michael.davis@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Michael',
        last_name: 'Davis',
        role_id: 6, // quality_manager
        employee_id: 3,
        is_active: true
      },
      {
        email: 'emily.wilson@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Emily',
        last_name: 'Wilson',
        role_id: 7, // maintenance_manager
        employee_id: 4,
        is_active: true
      },
      {
        email: 'david.brown@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'David',
        last_name: 'Brown',
        role_id: 5, // warehouse_manager
        employee_id: 5,
        is_active: true
      },
      {
        email: 'james.miller@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'James',
        last_name: 'Miller',
        role_id: 11, // operator
        employee_id: 6,
        is_active: true
      },
      {
        email: 'lisa.anderson@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Lisa',
        last_name: 'Anderson',
        role_id: 13, // quality_inspector
        employee_id: 7,
        is_active: true
      },
      {
        email: 'robert.taylor@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Robert',
        last_name: 'Taylor',
        role_id: 12, // technician
        employee_id: 8,
        is_active: true
      },
      {
        email: 'kevin.martinez@company.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Kevin',
        last_name: 'Martinez',
        role_id: 14, // sales_rep
        employee_id: 10,
        is_active: true
      }
    ]);
    logger.info('Users seeded');

    // ==========================================
    // 5. SUPPLIERS
    // ==========================================
    const suppliers = await Supplier.bulkCreate([
      { name: 'Steel Dynamics Inc', supplier_code: 'SUP-001', email: 'orders@steeldynamics.com', phone: '+1-555-2001' },
      { name: 'Electronic Components Ltd', supplier_code: 'SUP-002', email: 'sales@electroniccomponents.com', phone: '+1-555-2002' },
      { name: 'Industrial Tools Corp', supplier_code: 'SUP-003', email: 'purchasing@industrialtools.com', phone: '+1-555-2003' },
      { name: 'Quality Materials Inc', supplier_code: 'SUP-004', email: 'orders@qualitymaterials.com', phone: '+1-555-2004' },
      { name: 'Advanced Machinery Co', supplier_code: 'SUP-005', email: 'sales@advancedmachinery.com', phone: '+1-555-2005' }
    ]);
    logger.info('Suppliers seeded');

    // ==========================================
    // 6. CATEGORIES
    // ==========================================
    const categories = await Category.bulkCreate([
      { name: 'Raw Materials', description: 'Basic materials for production', category_type: 'raw_material' },
      { name: 'Finished Goods', description: 'Completed products ready for sale', category_type: 'finished_good' },
      { name: 'Components', description: 'Parts and components for assembly', category_type: 'component' },
      { name: 'Consumables', description: 'Consumable items and supplies', category_type: 'consumable' },
      { name: 'Tools & Equipment', description: 'Tools and equipment', category_type: 'equipment' },
      { name: 'Packaging Materials', description: 'Materials for packaging products', category_type: 'packaging' }
    ]);
    logger.info('Categories seeded');

    // ==========================================
    // 7. WAREHOUSES & STOCK LOCATIONS
    // ==========================================
    const warehouses = await Warehouse.bulkCreate([
      {
        name: 'Main Warehouse',
        code: 'WH-MAIN',
        description: 'Primary storage facility',
        address: '123 Industrial Drive',
        city: 'Manufacturing City',
        state: 'CA',
        postal_code: '90210',
        country: 'USA',
        warehouse_type: 'main'
      },
      {
        name: 'Raw Materials Warehouse',
        code: 'WH-RAW',
        description: 'Raw materials storage',
        address: '456 Storage Lane',
        city: 'Manufacturing City',
        state: 'CA',
        postal_code: '90211',
        country: 'USA',
        warehouse_type: 'branch'
      },
      {
        name: 'Finished Goods Warehouse',
        code: 'WH-FG',
        description: 'Finished goods storage',
        address: '789 Finished Goods Blvd',
        city: 'Manufacturing City',
        state: 'CA',
        postal_code: '90212',
        country: 'USA',
        warehouse_type: 'branch'
      }
    ]);
    logger.info('Warehouses seeded');

    const stockLocations = await StockLocation.bulkCreate([
      { warehouse_id: 1, location_code: 'A-01-01', location_name: 'Aisle A, Rack 1, Level 1', zone: 'A', is_active: true },
      { warehouse_id: 1, location_code: 'A-01-02', location_name: 'Aisle A, Rack 1, Level 2', zone: 'A', is_active: true },
      { warehouse_id: 1, location_code: 'B-01-01', location_name: 'Aisle B, Rack 1, Level 1', zone: 'B', is_active: true },
      { warehouse_id: 2, location_code: 'RM-01-01', location_name: 'Raw Materials Section 1', zone: 'RM', is_active: true },
      { warehouse_id: 2, location_code: 'RM-02-01', location_name: 'Raw Materials Section 2', zone: 'RM', is_active: true },
      { warehouse_id: 3, location_code: 'FG-01-01', location_name: 'Finished Goods Section 1', zone: 'FG', is_active: true }
    ]);
    logger.info('Stock locations seeded');

    // ==========================================
    // 8. PRODUCTS & BILL OF MATERIALS
    // ==========================================
    const products = await Product.bulkCreate([
      {
        name: 'Industrial Widget Pro',
        sku: 'IWP-001',
        description: 'High-performance industrial widget with advanced features',
        category_id: 2,
        standard_cost: 45.50,
        selling_price: 89.99,
        minimum_stock: 100,
        maximum_stock: 1000,
        reorder_point: 200,
        product_type: 'finished_good',
        uom: 'each',
        weight: 2.5,
        dimensions: '10x8x5 cm'
      },
      {
        name: 'Standard Widget',
        sku: 'SW-001',
        description: 'Standard widget for general industrial applications',
        category_id: 2,
        standard_cost: 25.00,
        selling_price: 49.99,
        minimum_stock: 150,
        maximum_stock: 1500,
        reorder_point: 300,
        product_type: 'finished_good',
        uom: 'each',
        weight: 1.8,
        dimensions: '8x6x4 cm'
      },
      {
        name: 'Premium Widget Deluxe',
        sku: 'PWD-001',
        description: 'Premium widget with luxury finishes and enhanced durability',
        category_id: 2,
        standard_cost: 75.00,
        selling_price: 149.99,
        minimum_stock: 50,
        maximum_stock: 500,
        reorder_point: 100,
        product_type: 'finished_good',
        uom: 'each',
        weight: 3.2,
        dimensions: '12x10x6 cm'
      },
      // Raw Materials
      {
        name: 'High-Grade Steel Rod',
        sku: 'STL-ROD-001',
        description: 'Premium steel rod for manufacturing',
        category_id: 1,
        standard_cost: 18.50,
        selling_price: 0,
        minimum_stock: 500,
        maximum_stock: 5000,
        reorder_point: 1000,
        product_type: 'raw_material',
        uom: 'kg',
        weight: 1.0
      },
      {
        name: 'Aluminum Sheet',
        sku: 'ALU-SHT-001',
        description: 'Lightweight aluminum sheet for components',
        category_id: 1,
        standard_cost: 12.75,
        selling_price: 0,
        minimum_stock: 200,
        maximum_stock: 2000,
        reorder_point: 400,
        product_type: 'raw_material',
        uom: 'sheet',
        weight: 0.8
      },
      // Components
      {
        name: 'Electronic Controller',
        sku: 'ELEC-CTRL-001',
        description: 'Advanced electronic controller for widget assembly',
        category_id: 3,
        standard_cost: 35.00,
        selling_price: 0,
        minimum_stock: 100,
        maximum_stock: 1000,
        reorder_point: 200,
        product_type: 'component',
        uom: 'each',
        weight: 0.2
      },
      {
        name: 'Precision Bearing',
        sku: 'BEAR-001',
        description: 'High-precision bearing for smooth operation',
        category_id: 3,
        standard_cost: 8.25,
        selling_price: 0,
        minimum_stock: 300,
        maximum_stock: 3000,
        reorder_point: 600,
        product_type: 'component',
        uom: 'each',
        weight: 0.1
      },
      {
        name: 'Custom Gasket',
        sku: 'GASK-001',
        description: 'Custom rubber gasket for sealing',
        category_id: 3,
        standard_cost: 2.50,
        selling_price: 0,
        minimum_stock: 500,
        maximum_stock: 5000,
        reorder_point: 1000,
        product_type: 'component',
        uom: 'each',
        weight: 0.05
      }
    ]);
    logger.info('Products seeded');

    // Bill of Materials
    const billOfMaterials = await BillOfMaterial.bulkCreate([
      { product_id: 1, bom_number: 'BOM-IWP-001', version: '1.0', status: 'active', description: 'BOM for Industrial Widget Pro' },
      { product_id: 2, bom_number: 'BOM-SW-001', version: '1.0', status: 'active', description: 'BOM for Standard Widget' },
      { product_id: 3, bom_number: 'BOM-PWD-001', version: '1.0', status: 'active', description: 'BOM for Premium Widget Deluxe' }
    ]);
    logger.info('Bill of Materials seeded');

    // BOM Items
    await BOMItem.bulkCreate([
      // Industrial Widget Pro BOM
      { bom_id: 1, product_id: 4, quantity_required: 0.5, unit_cost: 18.50, line_number: 1 }, // Steel Rod
      { bom_id: 1, product_id: 5, quantity_required: 1.0, unit_cost: 12.75, line_number: 2 }, // Aluminum Sheet
      { bom_id: 1, product_id: 6, quantity_required: 1.0, unit_cost: 35.00, line_number: 3 }, // Electronic Controller
      { bom_id: 1, product_id: 7, quantity_required: 2.0, unit_cost: 8.25, line_number: 4 }, // Precision Bearing
      { bom_id: 1, product_id: 8, quantity_required: 1.0, unit_cost: 2.50, line_number: 5 }, // Custom Gasket
      
      // Standard Widget BOM
      { bom_id: 2, product_id: 4, quantity_required: 0.3, unit_cost: 18.50, line_number: 1 }, // Steel Rod
      { bom_id: 2, product_id: 7, quantity_required: 1.0, unit_cost: 8.25, line_number: 2 }, // Precision Bearing
      { bom_id: 2, product_id: 8, quantity_required: 1.0, unit_cost: 2.50, line_number: 3 }, // Custom Gasket
      
      // Premium Widget Deluxe BOM
      { bom_id: 3, product_id: 4, quantity_required: 0.8, unit_cost: 18.50, line_number: 1 }, // Steel Rod
      { bom_id: 3, product_id: 5, quantity_required: 1.5, unit_cost: 12.75, line_number: 2 }, // Aluminum Sheet
      { bom_id: 3, product_id: 6, quantity_required: 2.0, unit_cost: 35.00, line_number: 3 }, // Electronic Controller
      { bom_id: 3, product_id: 7, quantity_required: 4.0, unit_cost: 8.25, line_number: 4 }, // Precision Bearing
      { bom_id: 3, product_id: 8, quantity_required: 2.0, unit_cost: 2.50, line_number: 5 }  // Custom Gasket
    ]);
    logger.info('BOM Items seeded');

    // ==========================================
    // 9. INVENTORY ITEMS
    // ==========================================
    const inventoryItems = await InventoryItem.bulkCreate([
      // Finished Goods
      {
        name: 'Industrial Widget Pro',
        sku: 'IWP-001',
        description: 'High-performance industrial widget with advanced features',
        category_id: 2,
        unit_cost: 45.50,
        current_stock: 250,
        minimum_stock: 100,
        maximum_stock: 1000,
        reorder_point: 200,
        item_type: 'finished_good',
        warehouse_id: 3,
        location_id: 6
      },
      {
        name: 'Standard Widget',
        sku: 'SW-001',
        description: 'Standard widget for general industrial applications',
        category_id: 2,
        unit_cost: 25.00,
        current_stock: 400,
        minimum_stock: 150,
        maximum_stock: 1500,
        reorder_point: 300,
        item_type: 'finished_good',
        warehouse_id: 3,
        location_id: 6
      },
      {
        name: 'Premium Widget Deluxe',
        sku: 'PWD-001',
        description: 'Premium widget with luxury finishes and enhanced durability',
        category_id: 2,
        unit_cost: 75.00,
        current_stock: 120,
        minimum_stock: 50,
        maximum_stock: 500,
        reorder_point: 100,
        item_type: 'finished_good',
        warehouse_id: 3,
        location_id: 6
      },
      // Raw Materials
      {
        name: 'High-Grade Steel Rod',
        sku: 'STL-ROD-001',
        description: 'Premium steel rod for manufacturing',
        category_id: 1,
        unit_cost: 18.50,
        current_stock: 2500,
        minimum_stock: 500,
        maximum_stock: 5000,
        reorder_point: 1000,
        item_type: 'raw_material',
        warehouse_id: 2,
        location_id: 4
      },
      {
        name: 'Aluminum Sheet',
        sku: 'ALU-SHT-001',
        description: 'Lightweight aluminum sheet for components',
        category_id: 1,
        unit_cost: 12.75,
        current_stock: 800,
        minimum_stock: 200,
        maximum_stock: 2000,
        reorder_point: 400,
        item_type: 'raw_material',
        warehouse_id: 2,
        location_id: 5
      },
      // Components
      {
        name: 'Electronic Controller',
        sku: 'ELEC-CTRL-001',
        description: 'Advanced electronic controller for widget assembly',
        category_id: 3,
        unit_cost: 35.00,
        current_stock: 180,
        minimum_stock: 100,
        maximum_stock: 1000,
        reorder_point: 200,
        item_type: 'component',
        warehouse_id: 1,
        location_id: 1
      },
      {
        name: 'Precision Bearing',
        sku: 'BEAR-001',
        description: 'High-precision bearing for smooth operation',
        category_id: 3,
        unit_cost: 8.25,
        current_stock: 1200,
        minimum_stock: 300,
        maximum_stock: 3000,
        reorder_point: 600,
        item_type: 'component',
        warehouse_id: 1,
        location_id: 2
      },
      {
        name: 'Custom Gasket',
        sku: 'GASK-001',
        description: 'Custom rubber gasket for sealing',
        category_id: 3,
        unit_cost: 2.50,
        current_stock: 2500,
        minimum_stock: 500,
        maximum_stock: 5000,
        reorder_point: 1000,
        item_type: 'component',
        warehouse_id: 1,
        location_id: 3
      },
      // Low stock items for testing
      {
        name: 'Low Stock Alert Test',
        sku: 'LOW-STK-001',
        description: 'Item with low stock for testing alerts',
        category_id: 1,
        unit_cost: 15.00,
        current_stock: 25, // Below minimum
        minimum_stock: 100,
        maximum_stock: 1000,
        reorder_point: 200,
        item_type: 'raw_material',
        warehouse_id: 2,
        location_id: 4
      }
    ]);
    logger.info('Inventory items seeded');

    // ==========================================
    // 10. CUSTOMERS
    // ==========================================
    const customers = await Customer.bulkCreate([
      {
        name: 'ABC Manufacturing Corp',
        customer_code: 'CUST-001',
        email: 'orders@abcmanufacturing.com',
        phone: '+1-555-3001',
        billing_address: '789 Business Blvd, Business City, NY 10001',
        shipping_address: '789 Business Blvd, Business City, NY 10001',
        credit_limit: 100000,
        payment_terms: 'Net 30',
        customer_type: 'business',
        tax_id: 'TAX-001-ABC',
        industry: 'Manufacturing'
      },
      {
        name: 'XYZ Industries Inc',
        customer_code: 'CUST-002',
        email: 'purchasing@xyzindustries.com',
        phone: '+1-555-3002',
        billing_address: '321 Industrial Ave, Factory Town, TX 75001',
        shipping_address: '321 Industrial Ave, Factory Town, TX 75001',
        credit_limit: 150000,
        payment_terms: 'Net 45',
        customer_type: 'business',
        tax_id: 'TAX-002-XYZ',
        industry: 'Automotive'
      },
      {
        name: 'Global Solutions Ltd',
        customer_code: 'CUST-003',
        email: 'orders@globalsolutions.com',
        phone: '+1-555-3003',
        billing_address: '555 Corporate Way, Metro City, FL 33101',
        shipping_address: '555 Corporate Way, Metro City, FL 33101',
        credit_limit: 200000,
        payment_terms: 'Net 30',
        customer_type: 'business',
        tax_id: 'TAX-003-GLS',
        industry: 'Technology'
      },
      {
        name: 'Industrial Partners Co',
        customer_code: 'CUST-004',
        email: 'procurement@industrialpartners.com',
        phone: '+1-555-3004',
        billing_address: '147 Partnership Dr, Industrial Zone, CA 90210',
        shipping_address: '147 Partnership Dr, Industrial Zone, CA 90210',
        credit_limit: 75000,
        payment_terms: 'Net 15',
        customer_type: 'business',
        tax_id: 'TAX-004-IPC',
        industry: 'Construction'
      },
      {
        name: 'Tech Innovations Inc',
        customer_code: 'CUST-005',
        email: 'supply@techinnovations.com',
        phone: '+1-555-3005',
        billing_address: '963 Innovation Blvd, Silicon Valley, CA 94000',
        shipping_address: '963 Innovation Blvd, Silicon Valley, CA 94000',
        credit_limit: 120000,
        payment_terms: 'Net 30',
        customer_type: 'business',
        tax_id: 'TAX-005-TII',
        industry: 'Electronics'
      }
    ]);
    logger.info('Customers seeded');

    // ==========================================
    // 11. EQUIPMENT & MAINTENANCE
    // ==========================================
    const equipment = await Equipment.bulkCreate([
      {
        equipment_id: 'EQ-001',
        name: 'CNC Machine Alpha',
        equipment_type: 'machine',
        manufacturer: 'Precision Tools Inc',
        model: 'PT-CNC-5000',
        serial_number: 'SN-001-2020',
        purchase_date: new Date('2020-05-15'),
        installation_date: new Date('2020-06-01'),
        warranty_expiry_date: new Date('2025-06-01'),
        purchase_cost: 150000,
        current_value: 120000,
        departmentId: 1,
        location: 'Production Floor A',
        status: 'operational',
        criticality: 'high'
      },
      {
        equipment_id: 'EQ-002',
        name: 'Quality Testing Station',
        equipment_type: 'test_equipment',
        manufacturer: 'QualityTech Solutions',
        model: 'QT-TEST-300',
        serial_number: 'SN-002-2021',
        purchase_date: new Date('2021-03-10'),
        installation_date: new Date('2021-03-25'),
        warranty_expiry_date: new Date('2026-03-25'),
        purchase_cost: 45000,
        current_value: 38000,
        departmentId: 2,
        location: 'Quality Lab',
        status: 'operational',
        criticality: 'medium'
      },
      {
        equipment_id: 'EQ-003',
        name: 'Hydraulic Press Beta',
        equipment_type: 'machine',
        manufacturer: 'Heavy Industries Corp',
        model: 'HI-PRESS-800',
        serial_number: 'SN-003-2019',
        purchase_date: new Date('2019-08-20'),
        installation_date: new Date('2019-09-15'),
        warranty_expiry_date: new Date('2024-09-15'),
        purchase_cost: 85000,
        current_value: 60000,
        departmentId: 1,
        location: 'Production Floor B',
        status: 'maintenance',
        criticality: 'high'
      },
      {
        equipment_id: 'EQ-004',
        name: 'Automated Conveyor System',
        equipment_type: 'conveyor',
        manufacturer: 'Automation Systems Ltd',
        model: 'AS-CONV-1200',
        serial_number: 'SN-004-2022',
        purchase_date: new Date('2022-01-15'),
        installation_date: new Date('2022-02-10'),
        warranty_expiry_date: new Date('2027-02-10'),
        purchase_cost: 65000,
        current_value: 58000,
        departmentId: 4,
        location: 'Warehouse Floor',
        status: 'operational',
        criticality: 'medium'
      }
    ]);
    logger.info('Equipment seeded');

    // Maintenance Schedules
    const maintenanceSchedules = await MaintenanceSchedule.bulkCreate([
      {
        equipmentId: 1,
        schedule_name: 'CNC Machine Weekly Maintenance',
        maintenance_type: 'preventive',
        frequency: 'weekly',
        frequency_value: 7,
        next_due_date: new Date('2024-10-13'),
        estimated_duration: 2,
        assigned_to: 8,
        priority: 'medium',
        status: 'active'
      },
      {
        equipmentId: 2,
        schedule_name: 'Quality Station Monthly Calibration',
        maintenance_type: 'calibration',
        frequency: 'monthly',
        frequency_value: 30,
        next_due_date: new Date('2024-10-20'),
        estimated_duration: 4,
        assigned_to: 8,
        priority: 'high',
        status: 'active'
      },
      {
        equipmentId: 3,
        schedule_name: 'Hydraulic Press Quarterly Service',
        maintenance_type: 'preventive',
        frequency: 'quarterly',
        frequency_value: 90,
        next_due_date: new Date('2024-11-01'),
        estimated_duration: 8,
        assigned_to: 8,
        priority: 'high',
        status: 'active'
      }
    ]);
    logger.info('Maintenance schedules seeded');

    // Maintenance Orders
    const maintenanceOrders = await MaintenanceOrder.bulkCreate([
      {
        order_number: 'MO-2024-001',
        equipmentId: 1,
        maintenance_type: 'preventive',
        priority: 'medium',
        status: 'completed',
        reported_by: 6,
        assigned_to: 8,
        description: 'Weekly preventive maintenance - lubrication and inspection',
        scheduled_date: new Date('2024-10-01'),
        actual_start_date: new Date('2024-10-01'),
        actual_end_date: new Date('2024-10-01'),
        actual_duration: 2,
        labor_cost: 100.00,
        parts_cost: 25.50,
        total_cost: 125.50
      },
      {
        order_number: 'MO-2024-002',
        equipmentId: 3,
        maintenance_type: 'corrective',
        priority: 'high',
        status: 'in_progress',
        reported_by: 6,
        assigned_to: 8,
        description: 'Hydraulic system pressure issue - urgent repair needed',
        scheduled_date: new Date('2024-10-05'),
        actual_start_date: new Date('2024-10-05'),
        estimated_duration: 6,
        labor_cost: 300.00,
        parts_cost: 450.00,
        total_cost: 750.00
      },
      {
        order_number: 'MO-2024-003',
        equipmentId: 2,
        maintenance_type: 'calibration',
        priority: 'high',
        status: 'scheduled',
        reported_by: 7,
        assigned_to: 8,
        description: 'Monthly calibration of testing equipment',
        scheduled_date: new Date('2024-10-20'),
        estimated_duration: 4,
        labor_cost: 200.00,
        parts_cost: 0.00,
        total_cost: 200.00
      }
    ]);
    logger.info('Maintenance orders seeded');

    // ==========================================
    // 12. QUALITY MANAGEMENT
    // ==========================================
    const qualityStandards = await QualityStandard.bulkCreate([
      {
        standard_code: 'QS-001',
        name: 'Widget Dimensional Tolerance',
        description: 'Dimensional tolerance standards for all widget products',
        category: 'dimensional',
        specification: 'Length: ±0.1mm, Width: ±0.1mm, Height: ±0.05mm',
        test_method: 'Caliper measurement at 3 points',
        acceptance_criteria: 'All measurements within tolerance',
        revision: '1.0',
        status: 'active'
      },
      {
        standard_code: 'QS-002',
        name: 'Electronic Controller Performance',
        description: 'Performance standards for electronic controllers',
        category: 'performance',
        specification: 'Response time: <100ms, Accuracy: ±0.1%, Operating temp: -20°C to +60°C',
        test_method: 'Automated test bench with signal generator',
        acceptance_criteria: 'All parameters within specification',
        revision: '1.0',
        status: 'active'
      },
      {
        standard_code: 'QS-003',
        name: 'Surface Finish Quality',
        description: 'Surface finish requirements for machined components',
        category: 'surface',
        specification: 'Ra value: ≤1.6 μm for critical surfaces',
        test_method: 'Surface roughness measurement using profilometer',
        acceptance_criteria: 'Ra value within specification',
        revision: '1.0',
        status: 'active'
      }
    ]);
    logger.info('Quality standards seeded');

    const qualityTests = await QualityTest.bulkCreate([
      {
        test_code: 'QT-001',
        name: 'Dimensional Inspection',
        description: 'Comprehensive dimensional inspection of finished products',
        test_type: 'inspection',
        standard_id: 1,
        duration_minutes: 15,
        equipment_required: 'Calipers, Height Gauge, Coordinate Measuring Machine',
        sample_size: 'Per lot: 5% or minimum 3 pieces',
        test_procedure: '1. Calibrate measuring equipment 2. Measure critical dimensions 3. Record results 4. Compare with standards',
        pass_criteria: 'All measurements within tolerance',
        is_active: true
      },
      {
        test_code: 'QT-002',
        name: 'Electronic Controller Test',
        description: 'Functional testing of electronic controllers',
        test_type: 'functional',
        standard_id: 2,
        duration_minutes: 30,
        equipment_required: 'Automated test bench, Signal generator, Oscilloscope',
        sample_size: '100% testing required',
        test_procedure: '1. Connect to test bench 2. Run automated test sequence 3. Verify response times 4. Check accuracy',
        pass_criteria: 'All parameters within specification',
        is_active: true
      },
      {
        test_code: 'QT-003',
        name: 'Surface Roughness Test',
        description: 'Surface finish quality verification',
        test_type: 'measurement',
        standard_id: 3,
        duration_minutes: 10,
        equipment_required: 'Surface roughness tester (profilometer)',
        sample_size: 'Per batch: minimum 2 pieces',
        test_procedure: '1. Clean surface 2. Position profilometer 3. Take measurements at 3 locations 4. Calculate average Ra value',
        pass_criteria: 'Average Ra ≤ 1.6 μm',
        is_active: true
      }
    ]);
    logger.info('Quality tests seeded');

    // ==========================================
    // 13. SALES ORDERS & QUOTATIONS
    // ==========================================
    const quotations = await Quotation.bulkCreate([
      {
        quotation_number: 'QUO-2024-001',
        customer_id: 1,
        quotation_date: new Date('2024-09-15'),
        valid_until: new Date('2024-10-15'),
        status: 'sent',
        priority: 'medium',
        subtotal: 4499.50,
        tax_amount: 449.95,
        total_amount: 4949.45,
        created_by: 10,
        notes: 'Standard pricing for Industrial Widget Pro - bulk order discount applied'
      },
      {
        quotation_number: 'QUO-2024-002',
        customer_id: 3,
        quotation_date: new Date('2024-09-20'),
        valid_until: new Date('2024-10-20'),
        status: 'approved',
        priority: 'high',
        subtotal: 14999.00,
        tax_amount: 1499.90,
        total_amount: 16498.90,
        created_by: 10,
        notes: 'Premium Widget Deluxe order - rush delivery requested'
      }
    ]);
    logger.info('Quotations seeded');

    await QuotationItem.bulkCreate([
      // Quotation 1 items
      { quotation_id: 1, product_id: 1, line_number: 1, quantity: 50, unit_price: 89.99, line_total: 4499.50, 
        description: 'Industrial Widget Pro - 50 units with bulk discount' },
      
      // Quotation 2 items
      { quotation_id: 2, product_id: 3, line_number: 1, quantity: 100, unit_price: 149.99, line_total: 14999.00, 
        description: 'Premium Widget Deluxe - 100 units for technology integration project' }
    ]);
    logger.info('Quotation items seeded');

    const salesOrders = await SalesOrder.bulkCreate([
      {
        order_number: 'SO-2024-001',
        customer_id: 1,
        quotation_id: null,
        order_date: new Date('2024-09-25'),
        required_date: new Date('2024-10-25'),
        status: 'confirmed',
        priority: 'medium',
        subtotal: 2249.75,
        tax_amount: 224.98,
        total_amount: 2474.73,
        created_by: 10,
        notes: 'Standard order - regular delivery schedule'
      },
      {
        order_number: 'SO-2024-002',
        customer_id: 2,
        quotation_id: null,
        order_date: new Date('2024-09-28'),
        required_date: new Date('2024-10-28'),
        status: 'in_production',
        priority: 'high',
        subtotal: 3599.64,
        tax_amount: 359.96,
        total_amount: 3959.60,
        created_by: 10,
        notes: 'Mix order - Industrial and Standard widgets'
      },
      {
        order_number: 'SO-2024-003',
        customer_id: 3,
        quotation_id: 2,
        order_date: new Date('2024-10-01'),
        required_date: new Date('2024-10-15'),
        status: 'confirmed',
        priority: 'high',
        subtotal: 14999.00,
        tax_amount: 1499.90,
        total_amount: 16498.90,
        created_by: 10,
        notes: 'Premium order from approved quotation - rush delivery'
      },
      {
        order_number: 'SO-2024-004',
        customer_id: 4,
        quotation_id: null,
        order_date: new Date('2024-10-03'),
        required_date: new Date('2024-11-03'),
        status: 'draft',
        priority: 'low',
        subtotal: 1999.60,
        tax_amount: 199.96,
        total_amount: 2199.56,
        created_by: 10,
        notes: 'Pending customer confirmation'
      }
    ]);
    logger.info('Sales orders seeded');

    await SalesOrderItem.bulkCreate([
      // SO-2024-001 items
      { sales_order_id: 1, product_id: 1, line_number: 1, quantity_ordered: 25, unit_price: 89.99, line_total: 2249.75 },
      
      // SO-2024-002 items  
      { sales_order_id: 2, product_id: 1, line_number: 1, quantity_ordered: 20, unit_price: 89.99, line_total: 1799.80 },
      { sales_order_id: 2, product_id: 2, line_number: 2, quantity_ordered: 36, unit_price: 49.99, line_total: 1799.64 },
      
      // SO-2024-003 items
      { sales_order_id: 3, product_id: 3, line_number: 1, quantity_ordered: 100, unit_price: 149.99, line_total: 14999.00 },
      
      // SO-2024-004 items
      { sales_order_id: 4, product_id: 2, line_number: 1, quantity_ordered: 40, unit_price: 49.99, line_total: 1999.60 }
    ]);
    logger.info('Sales order items seeded');

    // ==========================================
    // 14. PRODUCTION ORDERS & SCHEDULES
    // ==========================================
    const productionOrders = await ProductionOrder.bulkCreate([
      {
        order_number: 'PRO-2024-001',
        product_id: 1,
        quantity_planned: 25,
        quantity_produced: 25,
        start_date: new Date('2024-09-26'),
        due_date: new Date('2024-10-10'),
        actual_start_date: new Date('2024-09-26'),
        actual_end_date: new Date('2024-10-08'),
        status: 'completed',
        priority: 'medium',
        sales_order_id: 1,
        created_by: 3,
        notes: 'Completed ahead of schedule'
      },
      {
        order_number: 'PRO-2024-002',
        product_id: 1,
        quantity_planned: 20,
        quantity_produced: 15,
        start_date: new Date('2024-09-29'),
        due_date: new Date('2024-10-13'),
        actual_start_date: new Date('2024-09-29'),
        status: 'in_progress',
        priority: 'high',
        sales_order_id: 2,
        created_by: 3,
        notes: 'Currently in production - on track'
      },
      {
        order_number: 'PRO-2024-003',
        product_id: 2,
        quantity_planned: 36,
        quantity_produced: 10,
        start_date: new Date('2024-10-01'),
        due_date: new Date('2024-10-15'),
        actual_start_date: new Date('2024-10-01'),
        status: 'in_progress',
        priority: 'high',
        sales_order_id: 2,
        created_by: 3,
        notes: 'Parallel production with PRO-2024-002'
      },
      {
        order_number: 'PRO-2024-004',
        product_id: 3,
        quantity_planned: 100,
        quantity_produced: 0,
        start_date: new Date('2024-10-05'),
        due_date: new Date('2024-10-12'),
        status: 'planned',
        priority: 'high',
        sales_order_id: 3,
        created_by: 3,
        notes: 'Rush order - premium widgets for tech client'
      }
    ]);
    logger.info('Production orders seeded');

    const productionSchedules = await ProductionSchedule.bulkCreate([
      {
        schedule_name: 'October Widget Production',
        production_order_id: 2,
        start_date: new Date('2024-09-29'),
        end_date: new Date('2024-10-13'),
        status: 'active',
        created_by: 3,
        notes: 'Industrial Widget Pro production schedule'
      },
      {
        schedule_name: 'October Standard Widget Batch',
        production_order_id: 3,
        start_date: new Date('2024-10-01'),
        end_date: new Date('2024-10-15'),
        status: 'active',
        created_by: 3,
        notes: 'Standard Widget production - parallel line'
      },
      {
        schedule_name: 'Premium Widget Rush Order',
        production_order_id: 4,
        start_date: new Date('2024-10-05'),
        end_date: new Date('2024-10-12'),
        status: 'planned',
        created_by: 3,
        notes: 'Rush production for Global Solutions Ltd order'
      }
    ]);
    logger.info('Production schedules seeded');

    // ==========================================
    // 15. PROCUREMENT
    // ==========================================
    const purchaseRequests = await PurchaseRequest.bulkCreate([
      {
        request_number: 'PR-2024-001',
        requested_by: 5,
        department_id: 4,
        request_date: new Date('2024-09-20'),
        required_date: new Date('2024-10-05'),
        status: 'approved',
        priority: 'medium',
        justification: 'Restock low inventory items for production needs',
        total_estimated_cost: 25000.00,
        approved_by: 1,
        approval_date: new Date('2024-09-22')
      },
      {
        request_number: 'PR-2024-002',
        requested_by: 3,
        department_id: 1,
        request_date: new Date('2024-10-01'),
        required_date: new Date('2024-10-15'),
        status: 'pending',
        priority: 'high',
        justification: 'Urgent material needs for premium widget rush order',
        total_estimated_cost: 15000.00
      }
    ]);
    logger.info('Purchase requests seeded');

    const purchaseOrders = await PurchaseOrder.bulkCreate([
      {
        order_number: 'PO-2024-001',
        supplier_id: 1,
        purchase_request_id: 1,
        order_date: new Date('2024-09-23'),
        required_date: new Date('2024-10-03'),
        status: 'confirmed',
        priority: 'medium',
        subtotal: 23750.00,
        tax_amount: 2375.00,
        shipping_cost: 250.00,
        total_amount: 26375.00,
        created_by: 1,
        notes: 'Standard material restock order'
      },
      {
        order_number: 'PO-2024-002',
        supplier_id: 2,
        purchase_request_id: 1,
        order_date: new Date('2024-09-24'),
        required_date: new Date('2024-10-05'),
        status: 'received',
        priority: 'medium',
        subtotal: 7000.00,
        tax_amount: 700.00,
        shipping_cost: 150.00,
        total_amount: 7850.00,
        created_by: 1,
        received_date: new Date('2024-10-02'),
        notes: 'Electronic components - delivered early'
      },
      {
        order_number: 'PO-2024-003',
        supplier_id: 4,
        purchase_request_id: 2,
        order_date: new Date('2024-10-02'),
        required_date: new Date('2024-10-12'),
        status: 'pending',
        priority: 'high',
        subtotal: 12750.00,
        tax_amount: 1275.00,
        shipping_cost: 200.00,
        total_amount: 14225.00,
        created_by: 1,
        notes: 'Rush order for premium widget materials'
      }
    ]);
    logger.info('Purchase orders seeded');

    await PurchaseOrderItem.bulkCreate([
      // PO-2024-001 items
      { purchase_order_id: 1, product_id: 4, line_number: 1, quantity_ordered: 500, unit_price: 18.50, line_total: 9250.00 },
      { purchase_order_id: 1, product_id: 5, line_number: 2, quantity_ordered: 200, unit_price: 12.75, line_total: 2550.00 },
      { purchase_order_id: 1, product_id: 7, line_number: 3, quantity_ordered: 1500, unit_price: 8.00, line_total: 12000.00 },
      
      // PO-2024-002 items
      { purchase_order_id: 2, product_id: 6, line_number: 1, quantity_ordered: 200, unit_price: 35.00, line_total: 7000.00 },
      
      // PO-2024-003 items
      { purchase_order_id: 3, product_id: 4, line_number: 1, quantity_ordered: 300, unit_price: 18.50, line_total: 5550.00 },
      { purchase_order_id: 3, product_id: 5, line_number: 2, quantity_ordered: 400, unit_price: 12.75, line_total: 5100.00 },
      { purchase_order_id: 3, product_id: 6, line_number: 3, quantity_ordered: 60, unit_price: 35.00, line_total: 2100.00 }
    ]);
    logger.info('Purchase order items seeded');

    // ==========================================
    // 16. FINANCE & ACCOUNTING
    // ==========================================
    const accounts = await Account.bulkCreate([
      { account_code: '1100', account_name: 'Cash and Cash Equivalents', account_type: 'asset', parent_id: null, is_active: true },
      { account_code: '1200', account_name: 'Accounts Receivable', account_type: 'asset', parent_id: null, is_active: true },
      { account_code: '1300', account_name: 'Inventory Assets', account_type: 'asset', parent_id: null, is_active: true },
      { account_code: '1400', account_name: 'Property, Plant & Equipment', account_type: 'asset', parent_id: null, is_active: true },
      { account_code: '2100', account_name: 'Accounts Payable', account_type: 'liability', parent_id: null, is_active: true },
      { account_code: '2200', account_name: 'Accrued Expenses', account_type: 'liability', parent_id: null, is_active: true },
      { account_code: '3100', account_name: 'Retained Earnings', account_type: 'equity', parent_id: null, is_active: true },
      { account_code: '4100', account_name: 'Sales Revenue', account_type: 'revenue', parent_id: null, is_active: true },
      { account_code: '5100', account_name: 'Cost of Goods Sold', account_type: 'expense', parent_id: null, is_active: true },
      { account_code: '5200', account_name: 'Operating Expenses', account_type: 'expense', parent_id: null, is_active: true }
    ]);
    logger.info('Accounts seeded');

    const invoices = await Invoice.bulkCreate([
      {
        invoice_number: 'INV-2024-001',
        customer_id: 1,
        sales_order_id: 1,
        invoice_date: new Date('2024-10-08'),
        due_date: new Date('2024-11-07'),
        status: 'sent',
        subtotal: 2249.75,
        tax_amount: 224.98,
        total_amount: 2474.73,
        created_by: 1,
        notes: 'Invoice for SO-2024-001 - Net 30 terms'
      },
      {
        invoice_number: 'INV-2024-002',
        customer_id: 2,
        sales_order_id: 2,
        invoice_date: new Date('2024-10-05'),
        due_date: new Date('2024-11-19'),
        status: 'paid',
        subtotal: 3599.64,
        tax_amount: 359.96,
        total_amount: 3959.60,
        paid_amount: 3959.60,
        paid_date: new Date('2024-10-18'),
        created_by: 1,
        notes: 'Invoice for SO-2024-002 - Paid early with discount'
      }
    ]);
    logger.info('Invoices seeded');

    const payments = await Payment.bulkCreate([
      {
        payment_number: 'PAY-2024-001',
        invoice_id: 2,
        customer_id: 2,
        payment_date: new Date('2024-10-18'),
        amount: 3959.60,
        payment_method: 'bank_transfer',
        status: 'completed',
        reference_number: 'TXN-XYZ-001',
        processed_by: 1,
        notes: 'Early payment - customer took advantage of 2% discount'
      }
    ]);
    logger.info('Payments seeded');

    const transactions = await Transaction.bulkCreate([
      {
        transaction_number: 'TXN-2024-001',
        transaction_date: new Date('2024-10-08'),
        transaction_type: 'sale',
        account_id: 8, // Sales Revenue
        amount: 2474.73,
        description: 'Revenue from Invoice INV-2024-001',
        reference_type: 'invoice',
        reference_id: 1,
        created_by: 1
      },
      {
        transaction_number: 'TXN-2024-002',
        transaction_date: new Date('2024-10-08'),
        transaction_type: 'receivable',
        account_id: 2, // Accounts Receivable
        amount: 2474.73,
        description: 'Accounts Receivable for Invoice INV-2024-001',
        reference_type: 'invoice',
        reference_id: 1,
        created_by: 1
      },
      {
        transaction_number: 'TXN-2024-003',
        transaction_date: new Date('2024-10-18'),
        transaction_type: 'payment',
        account_id: 1, // Cash
        amount: 3959.60,
        description: 'Payment received for Invoice INV-2024-002',
        reference_type: 'payment',
        reference_id: 1,
        created_by: 1
      }
    ]);
    logger.info('Transactions seeded');

    // ==========================================
    // 17. INVENTORY TRANSACTIONS
    // ==========================================
    await InventoryTransaction.bulkCreate([
      // Raw material receipts from purchase orders
      {
        transaction_number: 'IT-2024-001',
        inventory_item_id: 4, // Steel Rod
        transaction_type: 'receipt',
        quantity: 500,
        unit_cost: 18.50,
        total_cost: 9250.00,
        transaction_date: new Date('2024-10-02'),
        reference_type: 'purchase_order',
        reference_id: 1,
        warehouse_id: 2,
        location_id: 4,
        performed_by: 5
      },
      {
        transaction_number: 'IT-2024-002',
        inventory_item_id: 5, // Aluminum Sheet
        transaction_type: 'receipt',
        quantity: 200,
        unit_cost: 12.75,
        total_cost: 2550.00,
        transaction_date: new Date('2024-10-02'),
        reference_type: 'purchase_order',
        reference_id: 1,
        warehouse_id: 2,
        location_id: 5,
        performed_by: 5
      },
      {
        transaction_number: 'IT-2024-003',
        inventory_item_id: 6, // Electronic Controller
        transaction_type: 'receipt',
        quantity: 200,
        unit_cost: 35.00,
        total_cost: 7000.00,
        transaction_date: new Date('2024-10-02'),
        reference_type: 'purchase_order',
        reference_id: 2,
        warehouse_id: 1,
        location_id: 1,
        performed_by: 5
      },
      
      // Material consumption for production
      {
        transaction_number: 'IT-2024-004',
        inventory_item_id: 4, // Steel Rod
        transaction_type: 'consumption',
        quantity: -12.5, // 25 units * 0.5 kg per unit
        unit_cost: 18.50,
        total_cost: -231.25,
        transaction_date: new Date('2024-09-26'),
        reference_type: 'production_order',
        reference_id: 1,
        warehouse_id: 2,
        location_id: 4,
        performed_by: 6
      },
      {
        transaction_number: 'IT-2024-005',
        inventory_item_id: 6, // Electronic Controller
        transaction_type: 'consumption',
        quantity: -25,
        unit_cost: 35.00,
        total_cost: -875.00,
        transaction_date: new Date('2024-09-26'),
        reference_type: 'production_order',
        reference_id: 1,
        warehouse_id: 1,
        location_id: 1,
        performed_by: 6
      },
      
      // Finished goods production
      {
        transaction_number: 'IT-2024-006',
        inventory_item_id: 1, // Industrial Widget Pro
        transaction_type: 'production',
        quantity: 25,
        unit_cost: 45.50,
        total_cost: 1137.50,
        transaction_date: new Date('2024-10-08'),
        reference_type: 'production_order',
        reference_id: 1,
        warehouse_id: 3,
        location_id: 6,
        performed_by: 6
      },
      
      // Sales shipments
      {
        transaction_number: 'IT-2024-007',
        inventory_item_id: 1, // Industrial Widget Pro
        transaction_type: 'shipment',
        quantity: -25,
        unit_cost: 45.50,
        total_cost: -1137.50,
        transaction_date: new Date('2024-10-10'),
        reference_type: 'sales_order',
        reference_id: 1,
        warehouse_id: 3,
        location_id: 6,
        performed_by: 5
      }
    ]);
    logger.info('Inventory transactions seeded');

    // ==========================================
    // 18. QUALITY CONTROL RECORDS
    // ==========================================
    const qualityControls = await QualityControl.bulkCreate([
      {
        inspection_number: 'QC-2024-001',
        product_id: 1,
        batch_number: 'BATCH-IWP-001',
        inspection_date: new Date('2024-10-08'),
        inspection_type: 'finished_goods',
        inspector_id: 7,
        standard_id: 1,
        test_id: 1,
        sample_size: 5,
        passed_quantity: 5,
        failed_quantity: 0,
        result: 'pass',
        notes: 'All dimensional measurements within tolerance',
        defect_description: null,
        corrective_action: null
      },
      {
        inspection_number: 'QC-2024-002',
        product_id: 6,
        batch_number: 'BATCH-CTRL-001',
        inspection_date: new Date('2024-10-02'),
        inspection_type: 'incoming',
        inspector_id: 7,
        standard_id: 2,
        test_id: 2,
        sample_size: 10,
        passed_quantity: 9,
        failed_quantity: 1,
        result: 'conditional_pass',
        notes: 'Minor performance deviation in one unit',
        defect_description: 'Response time slightly above specification in unit #7',
        corrective_action: 'Returned defective unit to supplier, rest approved for use'
      },
      {
        inspection_number: 'QC-2024-003',
        product_id: 2,
        batch_number: 'BATCH-SW-001',
        inspection_date: new Date('2024-10-01'),
        inspection_type: 'in_process',
        inspector_id: 7,
        standard_id: 3,
        test_id: 3,
        sample_size: 3,
        passed_quantity: 3,
        failed_quantity: 0,
        result: 'pass',
        notes: 'Surface finish quality meets requirements',
        defect_description: null,
        corrective_action: null
      }
    ]);
    logger.info('Quality control records seeded');

    const qualityReports = await QualityReport.bulkCreate([
      {
        report_number: 'QR-2024-001',
        report_date: new Date('2024-10-08'),
        report_type: 'daily',
        department_id: 2,
        period_start: new Date('2024-10-08'),
        period_end: new Date('2024-10-08'),
        total_inspections: 3,
        passed_inspections: 2,
        failed_inspections: 0,
        conditional_inspections: 1,
        pass_rate: 100.0,
        created_by: 3,
        summary: 'All inspections completed successfully. One conditional pass for electronic controllers with minor deviation.',
        recommendations: 'Continue monitoring electronic controller supplier quality. Consider additional incoming inspection criteria.'
      }
    ]);
    logger.info('Quality reports seeded');

    // ==========================================
    // 19. LOTS & SHIPMENTS
    // ==========================================
    const lots = await Lot.bulkCreate([
      {
        lot_number: 'LOT-IWP-2024-001',
        product_id: 1,
        production_order_id: 1,
        quantity: 25,
        production_date: new Date('2024-10-08'),
        expiry_date: new Date('2026-10-08'),
        status: 'available',
        warehouse_id: 3,
        location_id: 6,
        notes: 'First production lot of Industrial Widget Pro for Q4 2024'
      },
      {
        lot_number: 'LOT-SW-2024-001',
        product_id: 2,
        production_order_id: 3,
        quantity: 10,
        production_date: new Date('2024-10-05'),
        expiry_date: new Date('2026-10-05'),
        status: 'available',
        warehouse_id: 3,
        location_id: 6,
        notes: 'Partial lot from ongoing Standard Widget production'
      }
    ]);
    logger.info('Lots seeded');

    const shipments = await Shipment.bulkCreate([
      {
        shipment_number: 'SHIP-2024-001',
        sales_order_id: 1,
        shipment_date: new Date('2024-10-10'),
        carrier: 'FastShip Logistics',
        tracking_number: 'FS-123456789',
        shipping_cost: 125.50,
        status: 'delivered',
        delivered_date: new Date('2024-10-12'),
        notes: 'Delivered on time to ABC Manufacturing Corp'
      },
      {
        shipment_number: 'SHIP-2024-002',
        sales_order_id: 2,
        shipment_date: new Date('2024-10-15'),
        carrier: 'Global Express',
        tracking_number: 'GE-987654321',
        shipping_cost: 189.75,
        status: 'in_transit',
        notes: 'Mixed shipment to XYZ Industries - partial delivery'
      }
    ]);
    logger.info('Shipments seeded');

    // ==========================================
    // 20. WORK ORDERS & ATTENDANCE
    // ==========================================
    const workOrders = await WorkOrder.bulkCreate([
      {
        work_order_number: 'WO-2024-001',
        production_order_id: 1,
        operation_name: 'Machining',
        operation_sequence: 1,
        assigned_to: 6,
        status: 'completed',
        start_date: new Date('2024-09-26'),
        due_date: new Date('2024-10-05'),
        actual_start_date: new Date('2024-09-26'),
        actual_end_date: new Date('2024-10-02'),
        estimated_hours: 40,
        actual_hours: 36,
        hourly_rate: 25.50,
        labor_cost: 918.00
      },
      {
        work_order_number: 'WO-2024-002',
        production_order_id: 1,
        operation_name: 'Assembly',
        operation_sequence: 2,
        assigned_to: 6,
        status: 'completed',
        start_date: new Date('2024-10-03'),
        due_date: new Date('2024-10-08'),
        actual_start_date: new Date('2024-10-03'),
        actual_end_date: new Date('2024-10-07'),
        estimated_hours: 20,
        actual_hours: 18,
        hourly_rate: 25.50,
        labor_cost: 459.00
      },
      {
        work_order_number: 'WO-2024-003',
        production_order_id: 2,
        operation_name: 'Machining',
        operation_sequence: 1,
        assigned_to: 6,
        status: 'in_progress',
        start_date: new Date('2024-09-29'),
        due_date: new Date('2024-10-10'),
        actual_start_date: new Date('2024-09-29'),
        estimated_hours: 32,
        actual_hours: 24,
        hourly_rate: 25.50,
        labor_cost: 612.00
      }
    ]);
    logger.info('Work orders seeded');

    const attendanceRecords = await Attendance.bulkCreate([
      // Recent attendance records for employees
      { employee_id: 6, date: new Date('2024-10-01'), clock_in: '08:00', clock_out: '17:00', hours_worked: 8.0, status: 'present' },
      { employee_id: 6, date: new Date('2024-10-02'), clock_in: '08:00', clock_out: '17:00', hours_worked: 8.0, status: 'present' },
      { employee_id: 6, date: new Date('2024-10-03'), clock_in: '08:00', clock_out: '17:00', hours_worked: 8.0, status: 'present' },
      { employee_id: 6, date: new Date('2024-10-04'), clock_in: '08:00', clock_out: '17:00', hours_worked: 8.0, status: 'present' },
      
      { employee_id: 7, date: new Date('2024-10-01'), clock_in: '09:00', clock_out: '18:00', hours_worked: 8.0, status: 'present' },
      { employee_id: 7, date: new Date('2024-10-02'), clock_in: '09:00', clock_out: '18:00', hours_worked: 8.0, status: 'present' },
      { employee_id: 7, date: new Date('2024-10-03'), clock_in: '09:00', clock_out: '18:00', hours_worked: 8.0, status: 'present' },
      { employee_id: 7, date: new Date('2024-10-04'), clock_in: '09:00', clock_out: '18:00', hours_worked: 8.0, status: 'present' },
      
      { employee_id: 8, date: new Date('2024-10-01'), clock_in: '07:30', clock_out: '16:30', hours_worked: 8.0, status: 'present' },
      { employee_id: 8, date: new Date('2024-10-02'), clock_in: '07:30', clock_out: '16:30', hours_worked: 8.0, status: 'present' },
      { employee_id: 8, date: new Date('2024-10-03'), clock_in: '07:30', clock_out: '18:30', hours_worked: 10.0, status: 'present' }, // Overtime
      { employee_id: 8, date: new Date('2024-10-04'), clock_in: '07:30', clock_out: '16:30', hours_worked: 8.0, status: 'present' }
    ]);
    logger.info('Attendance records seeded');

    // ==========================================
    // 21. PAYROLL (Sample records)
    // ==========================================
    const payrollRecords = await Payroll.bulkCreate([
      { employee_id: 1, pay_period_start: new Date('2024-09-16'), pay_period_end: new Date('2024-09-30'), 
        gross_pay: 4615.38, net_pay: 3230.77 }, // Manager bi-weekly
      { employee_id: 2, pay_period_start: new Date('2024-09-16'), pay_period_end: new Date('2024-09-30'), 
        gross_pay: 3269.23, net_pay: 2288.46 }, // Production Manager
      { employee_id: 6, pay_period_start: new Date('2024-09-16'), pay_period_end: new Date('2024-09-30'), 
        gross_pay: 2040.00, net_pay: 1530.00 }, // Operator (80 hours * $25.50)
      { employee_id: 7, pay_period_start: new Date('2024-09-16'), pay_period_end: new Date('2024-09-30'), 
        gross_pay: 1840.00, net_pay: 1403.20 }, // Quality Inspector (80 hours * $23.00)
      { employee_id: 8, pay_period_start: new Date('2024-09-16'), pay_period_end: new Date('2024-09-30'), 
        gross_pay: 2352.00, net_pay: 1764.00 }  // Technician (84 hours * $28.00, includes 4 OT hours)
    ]);
    logger.info('Payroll records seeded');

    // ==========================================
    // 22. MAINTENANCE HISTORY
    // ==========================================
    const maintenanceHistory = await MaintenanceHistory.bulkCreate([
      {
        equipmentId: 1,
        maintenance_order_id: 1,
        maintenance_date: new Date('2024-10-01'),
        maintenance_type: 'preventive',
        description: 'Weekly lubrication and inspection completed',
        performed_by: 8,
        duration_hours: 2,
        parts_used: 'Lubricating oil, filters',
        labor_cost: 100.00,
        parts_cost: 25.50,
        total_cost: 125.50,
        next_maintenance_due: new Date('2024-10-08'),
        notes: 'All systems operating normally. No issues found.'
      },
      {
        equipmentId: 3,
        maintenance_order_id: 2,
        maintenance_date: new Date('2024-10-05'),
        maintenance_type: 'corrective',
        description: 'Hydraulic system repair - replaced faulty valve',
        performed_by: 8,
        duration_hours: 6,
        parts_used: 'Hydraulic valve assembly, seals, hydraulic fluid',
        labor_cost: 300.00,
        parts_cost: 450.00,
        total_cost: 750.00,
        notes: 'Emergency repair completed. System tested and operational.'
      }
    ]);
    logger.info('Maintenance history seeded');

    logger.info('===============================================');
    logger.info('COMPREHENSIVE DATABASE SEEDING COMPLETED!');
    logger.info('===============================================');
    logger.info('');
    logger.info('🎯 SEEDED DATA SUMMARY:');
    logger.info('👥 Users & Roles: 10 users, 15 roles, 26 permissions');
    logger.info('🏭 Departments: 10 departments with managers');
    logger.info('👨‍💼 Employees: 10 employees across all departments');
    logger.info('🏭 Suppliers: 5 suppliers for procurement');
    logger.info('📦 Products: 8 products (3 finished goods, 2 raw materials, 3 components)');
    logger.info('📋 BOMs: 3 complete Bill of Materials with items');
    logger.info('🏪 Warehouses: 3 warehouses with 6 stock locations');
    logger.info('📦 Inventory: 9 inventory items with realistic stock levels');
    logger.info('🧾 Customers: 5 business customers');
    logger.info('💰 Sales: 2 quotations, 4 sales orders with items');
    logger.info('🏭 Production: 4 production orders, 3 schedules');
    logger.info('📝 Procurement: 2 purchase requests, 3 purchase orders');
    logger.info('⚙️ Equipment: 4 pieces of equipment with maintenance');
    logger.info('🔧 Maintenance: 3 orders, 3 schedules, 2 history records');
    logger.info('✅ Quality: 3 standards, 3 tests, 3 control records, 1 report');
    logger.info('💵 Finance: 10 accounts, 2 invoices, 1 payment, 3 transactions');
    logger.info('📊 Inventory Txns: 7 transactions (receipts, consumption, production, shipments)');
    logger.info('📦 Lots & Shipments: 2 lots, 2 shipments');
    logger.info('👷 Work Orders: 3 work orders with labor tracking');
    logger.info('📅 Attendance: 12 attendance records');
    logger.info('💰 Payroll: 5 payroll records');
    logger.info('');
    logger.info('🔐 DEMO LOGIN CREDENTIALS:');
    logger.info('┌─────────────────────────────────────────────────────────────┐');
    logger.info('│ ROLE                 │ EMAIL                  │ PASSWORD     │');
    logger.info('├─────────────────────────────────────────────────────────────┤');
    logger.info('│ System Admin         │ admin@company.com      │ password123  │');
    logger.info('│ General Manager      │ john.smith@company.com │ password123  │');
    logger.info('│ Production Manager   │ sarah.johnson@comp...  │ password123  │');
    logger.info('│ Quality Manager      │ michael.davis@comp...  │ password123  │');
    logger.info('│ Maintenance Manager  │ emily.wilson@comp...   │ password123  │');
    logger.info('│ Warehouse Manager    │ david.brown@comp...    │ password123  │');
    logger.info('│ Production Operator  │ james.miller@comp...   │ password123  │');
    logger.info('│ Quality Inspector    │ lisa.anderson@comp...  │ password123  │');
    logger.info('│ Maintenance Tech     │ robert.taylor@comp...  │ password123  │');
    logger.info('│ Sales Representative │ kevin.martinez@comp... │ password123  │');
    logger.info('└─────────────────────────────────────────────────────────────┘');
    logger.info('');
    logger.info('🚀 Ready for full ERP system testing and development!');
    logger.info('===============================================');

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;