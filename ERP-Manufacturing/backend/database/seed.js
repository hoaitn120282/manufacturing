const { sequelize } = require('../config/database');
const {
  User, Role, Permission, RolePermission,
  Product, Category, InventoryItem,
  Customer, SalesOrder, SalesOrderItem,
  ProductionOrder, Warehouse
} = require('../models');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

const seedData = async () => {
  try {
    logger.info('Starting database seeding...');

    // Force sync database (recreate tables)
    await sequelize.sync({ force: true });
    logger.info('Database tables created');

    // Seed Roles
    const roles = await Role.bulkCreate([
      { name: 'admin', description: 'System Administrator' },
      { name: 'manager', description: 'General Manager' },
      { name: 'production_manager', description: 'Production Manager' },
      { name: 'sales_manager', description: 'Sales Manager' },
      { name: 'warehouse_manager', description: 'Warehouse Manager' },
      { name: 'operator', description: 'Production Operator' },
      { name: 'sales_rep', description: 'Sales Representative' },
      { name: 'user', description: 'General User' }
    ]);
    logger.info('Roles seeded');

    // Seed Permissions
    const permissions = await Permission.bulkCreate([
      { name: 'create_production', description: 'Create Production Orders', module: 'production', action: 'create' },
      { name: 'read_production', description: 'View Production Orders', module: 'production', action: 'read' },
      { name: 'update_production', description: 'Update Production Orders', module: 'production', action: 'update' },
      { name: 'delete_production', description: 'Delete Production Orders', module: 'production', action: 'delete' },
      { name: 'create_inventory', description: 'Create Inventory Items', module: 'inventory', action: 'create' },
      { name: 'read_inventory', description: 'View Inventory Items', module: 'inventory', action: 'read' },
      { name: 'update_inventory', description: 'Update Inventory Items', module: 'inventory', action: 'update' },
      { name: 'create_sales', description: 'Create Sales Orders', module: 'sales', action: 'create' },
      { name: 'read_sales', description: 'View Sales Orders', module: 'sales', action: 'read' },
      { name: 'manage_users', description: 'Manage Users', module: 'users', action: 'manage' }
    ]);
    logger.info('Permissions seeded');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'password123',
      first_name: 'Admin',
      last_name: 'User',
      role_id: 1, // admin role
      is_active: true
    });

    // Create sample users
    const users = await User.bulkCreate([
      {
        email: 'manager@example.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'John',
        last_name: 'Manager',
        role_id: 2,
        is_active: true
      },
      {
        email: 'production@example.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Production',
        last_name: 'Manager',
        role_id: 3,
        is_active: true
      },
      {
        email: 'sales@example.com',
        password: await bcrypt.hash('password123', 12),
        first_name: 'Sales',
        last_name: 'Manager',
        role_id: 4,
        is_active: true
      }
    ]);
    logger.info('Users seeded');

    // Seed Categories
    const categories = await Category.bulkCreate([
      { name: 'Raw Materials', description: 'Basic materials for production' },
      { name: 'Finished Goods', description: 'Completed products ready for sale' },
      { name: 'Components', description: 'Parts and components' },
      { name: 'Consumables', description: 'Consumable items' }
    ]);
    logger.info('Categories seeded');

    // Seed Products
    const products = await Product.bulkCreate([
      {
        name: 'Widget A',
        sku: 'WID-A-001',
        description: 'High-quality widget for industrial use',
        category_id: 2,
        standard_cost: 25.50,
        selling_price: 45.00,
        minimum_stock: 100,
        maximum_stock: 1000,
        reorder_point: 200,
        product_type: 'finished_good'
      },
      {
        name: 'Widget B',
        sku: 'WID-B-001',
        description: 'Premium widget with advanced features',
        category_id: 2,
        standard_cost: 35.00,
        selling_price: 65.00,
        minimum_stock: 50,
        maximum_stock: 500,
        reorder_point: 100,
        product_type: 'finished_good'
      },
      {
        name: 'Steel Rod',
        sku: 'STL-ROD-001',
        description: 'High-grade steel rod for manufacturing',
        category_id: 1,
        standard_cost: 15.00,
        selling_price: 0,
        minimum_stock: 200,
        maximum_stock: 2000,
        reorder_point: 400,
        product_type: 'raw_material'
      },
      {
        name: 'Electronic Component X',
        sku: 'ELEC-X-001',
        description: 'Electronic component for widget assembly',
        category_id: 3,
        standard_cost: 8.50,
        selling_price: 0,
        minimum_stock: 500,
        maximum_stock: 5000,
        reorder_point: 1000,
        product_type: 'component'
      }
    ]);
    logger.info('Products seeded');

    // Seed Inventory Items
    const inventoryItems = await InventoryItem.bulkCreate([
      {
        name: 'Widget A',
        sku: 'WID-A-001',
        description: 'High-quality widget for industrial use',
        category_id: 2,
        unit_cost: 25.50,
        current_stock: 150,
        minimum_stock: 100,
        maximum_stock: 1000,
        reorder_point: 200,
        item_type: 'finished_good'
      },
      {
        name: 'Widget B',
        sku: 'WID-B-001',
        description: 'Premium widget with advanced features',
        category_id: 2,
        unit_cost: 35.00,
        current_stock: 75,
        minimum_stock: 50,
        maximum_stock: 500,
        reorder_point: 100,
        item_type: 'finished_good'
      },
      {
        name: 'Steel Rod',
        sku: 'STL-ROD-001',
        description: 'High-grade steel rod for manufacturing',
        category_id: 1,
        unit_cost: 15.00,
        current_stock: 1200,
        minimum_stock: 200,
        maximum_stock: 2000,
        reorder_point: 400,
        item_type: 'raw_material'
      },
      {
        name: 'Electronic Component X',
        sku: 'ELEC-X-001',
        description: 'Electronic component for widget assembly',
        category_id: 3,
        unit_cost: 8.50,
        current_stock: 2500,
        minimum_stock: 500,
        maximum_stock: 5000,
        reorder_point: 1000,
        item_type: 'component'
      },
      {
        name: 'Low Stock Item',
        sku: 'LOW-STK-001',
        description: 'Item with low stock for testing alerts',
        category_id: 1,
        unit_cost: 12.00,
        current_stock: 15, // Below minimum
        minimum_stock: 50,
        maximum_stock: 500,
        reorder_point: 100,
        item_type: 'raw_material'
      }
    ]);
    logger.info('Inventory items seeded');

    // Seed Warehouses
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
      }
    ]);
    logger.info('Warehouses seeded');

    // Seed Customers
    const customers = await Customer.bulkCreate([
      {
        name: 'ABC Manufacturing Corp',
        customer_code: 'CUST-001',
        email: 'orders@abcmanufacturing.com',
        phone: '+1-555-0101',
        billing_address: '789 Business Blvd, Business City, NY 10001',
        shipping_address: '789 Business Blvd, Business City, NY 10001',
        credit_limit: 50000,
        payment_terms: 'Net 30',
        customer_type: 'business'
      },
      {
        name: 'XYZ Industries',
        customer_code: 'CUST-002',
        email: 'purchasing@xyzindustries.com',
        phone: '+1-555-0102',
        billing_address: '321 Industrial Ave, Factory Town, TX 75001',
        shipping_address: '321 Industrial Ave, Factory Town, TX 75001',
        credit_limit: 75000,
        payment_terms: 'Net 45',
        customer_type: 'business'
      },
      {
        name: 'Global Solutions Inc',
        customer_code: 'CUST-003',
        email: 'orders@globalsolutions.com',
        phone: '+1-555-0103',
        billing_address: '555 Corporate Way, Metro City, FL 33101',
        shipping_address: '555 Corporate Way, Metro City, FL 33101',
        credit_limit: 100000,
        payment_terms: 'Net 30',
        customer_type: 'business'
      }
    ]);
    logger.info('Customers seeded');

    // Seed Sales Orders
    const salesOrders = await SalesOrder.bulkCreate([
      {
        order_number: 'SO-2024-0001',
        customer_id: 1,
        order_date: new Date('2024-01-15'),
        required_date: new Date('2024-02-15'),
        status: 'confirmed',
        priority: 'medium',
        subtotal: 2250.00,
        tax_amount: 225.00,
        total_amount: 2475.00,
        created_by: 1
      },
      {
        order_number: 'SO-2024-0002',
        customer_id: 2,
        order_date: new Date('2024-01-20'),
        required_date: new Date('2024-02-20'),
        status: 'in_production',
        priority: 'high',
        subtotal: 3250.00,
        tax_amount: 325.00,
        total_amount: 3575.00,
        created_by: 1
      },
      {
        order_number: 'SO-2024-0003',
        customer_id: 3,
        order_date: new Date('2024-01-25'),
        required_date: new Date('2024-02-25'),
        status: 'draft',
        priority: 'low',
        subtotal: 1800.00,
        tax_amount: 180.00,
        total_amount: 1980.00,
        created_by: 1
      }
    ]);
    logger.info('Sales orders seeded');

    // Seed Sales Order Items
    await SalesOrderItem.bulkCreate([
      {
        sales_order_id: 1,
        product_id: 1,
        line_number: 1,
        quantity_ordered: 50,
        unit_price: 45.00,
        line_total: 2250.00
      },
      {
        sales_order_id: 2,
        product_id: 1,
        line_number: 1,
        quantity_ordered: 30,
        unit_price: 45.00,
        line_total: 1350.00
      },
      {
        sales_order_id: 2,
        product_id: 2,
        line_number: 2,
        quantity_ordered: 30,
        unit_price: 65.00,
        line_total: 1950.00
      },
      {
        sales_order_id: 3,
        product_id: 2,
        line_number: 1,
        quantity_ordered: 40,
        unit_price: 45.00,
        line_total: 1800.00
      }
    ]);
    logger.info('Sales order items seeded');

    // Seed Production Orders
    const productionOrders = await ProductionOrder.bulkCreate([
      {
        order_number: 'PO-2024-0001',
        product_id: 1,
        quantity_planned: 50,
        quantity_produced: 45,
        start_date: new Date('2024-01-16'),
        due_date: new Date('2024-02-14'),
        actual_start_date: new Date('2024-01-16'),
        status: 'in_progress',
        priority: 'medium',
        sales_order_id: 1,
        created_by: 1
      },
      {
        order_number: 'PO-2024-0002',
        product_id: 1,
        quantity_planned: 30,
        quantity_produced: 30,
        start_date: new Date('2024-01-21'),
        due_date: new Date('2024-02-19'),
        actual_start_date: new Date('2024-01-21'),
        actual_end_date: new Date('2024-02-18'),
        status: 'completed',
        priority: 'high',
        sales_order_id: 2,
        created_by: 1
      },
      {
        order_number: 'PO-2024-0003',
        product_id: 2,
        quantity_planned: 30,
        quantity_produced: 0,
        start_date: new Date('2024-01-22'),
        due_date: new Date('2024-02-20'),
        status: 'planned',
        priority: 'high',
        sales_order_id: 2,
        created_by: 1
      },
      {
        order_number: 'PO-2024-0004',
        product_id: 2,
        quantity_planned: 40,
        quantity_produced: 0,
        start_date: new Date('2024-02-01'),
        due_date: new Date('2024-02-28'),
        status: 'planned',
        priority: 'low',
        sales_order_id: 3,
        created_by: 1
      }
    ]);
    logger.info('Production orders seeded');

    logger.info('Database seeding completed successfully!');
    logger.info('==================================================');
    logger.info('Demo Login Credentials:');
    logger.info('Email: admin@example.com | Password: password123');
    logger.info('Email: manager@example.com | Password: password123');
    logger.info('Email: production@example.com | Password: password123');
    logger.info('Email: sales@example.com | Password: password123');
    logger.info('==================================================');

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