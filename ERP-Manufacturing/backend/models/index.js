const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');

// Production Management Models
const Product = require('./Product');
const ProductionOrder = require('./ProductionOrder');
const BillOfMaterial = require('./BillOfMaterial');
const BOMItem = require('./BOMItem');
const WorkOrder = require('./WorkOrder');
const ProductionSchedule = require('./ProductionSchedule');

// Inventory Management Models
const Category = require('./Category');
const InventoryItem = require('./InventoryItem');
const Warehouse = require('./Warehouse');
const InventoryTransaction = require('./InventoryTransaction');
const StockLocation = require('./StockLocation');
const Lot = require('./Lot');

// Sales Management Models
const Customer = require('./Customer');
const SalesOrder = require('./SalesOrder');
const SalesOrderItem = require('./SalesOrderItem');
const Quotation = require('./Quotation');
const QuotationItem = require('./QuotationItem');
const Shipment = require('./Shipment');

// Quality Management Models
const QualityControl = require('./QualityControl');
const QualityStandard = require('./QualityStandard');
const QualityTest = require('./QualityTest');
const QualityReport = require('./QualityReport');

// Maintenance Management Models
const Equipment = require('./Equipment');
const MaintenanceSchedule = require('./MaintenanceSchedule');
const MaintenanceOrder = require('./MaintenanceOrder');
const MaintenanceHistory = require('./MaintenanceHistory');

// HRM Models
const Employee = require('./Employee');
const Department = require('./Department');
const Attendance = require('./Attendance');
const Payroll = require('./Payroll');

// Finance Models
const Account = require('./Account');
const Transaction = require('./Transaction');
const Invoice = require('./Invoice');
const Payment = require('./Payment');

// Procurement Models
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const PurchaseRequest = require('./PurchaseRequest');

// Define associations
const defineAssociations = () => {
  // =====================================
  // USER MANAGEMENT & AUTHENTICATION
  // =====================================
  
  // User and Role associations
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
  
  // User and Employee relationship
  User.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  Employee.hasOne(User, { foreignKey: 'employee_id', as: 'user' });
  
  // Role and Permission many-to-many
  Role.belongsToMany(Permission, { 
    through: RolePermission, 
    foreignKey: 'role_id', 
    as: 'permissions' 
  });
  Permission.belongsToMany(Role, { 
    through: RolePermission, 
    foreignKey: 'permission_id', 
    as: 'roles' 
  });

  // =====================================
  // HUMAN RESOURCES MANAGEMENT
  // =====================================
  
  // Employee and Department
  Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
  
  // Employee self-referencing (Manager relationship)
  Employee.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
  Employee.hasMany(Employee, { foreignKey: 'manager_id', as: 'subordinates' });
  
  // Department Manager
  Department.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
  
  // Employee Attendance
  Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendance_records' });
  Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
  
  // Employee Payroll
  Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payroll_records' });
  Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

  // =====================================
  // PRODUCTION MANAGEMENT
  // =====================================
  
  // Product relationships
  Product.hasMany(ProductionOrder, { foreignKey: 'product_id', as: 'production_orders' });
  ProductionOrder.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  
  Product.hasMany(BillOfMaterial, { foreignKey: 'product_id', as: 'boms' });
  BillOfMaterial.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  
  // Bill of Materials and Items
  BillOfMaterial.hasMany(BOMItem, { foreignKey: 'bom_id', as: 'items' });
  BOMItem.belongsTo(BillOfMaterial, { foreignKey: 'bom_id', as: 'bom' });
  BOMItem.belongsTo(InventoryItem, { foreignKey: 'material_id', as: 'material' });
  
  // Production Order and Work Orders
  ProductionOrder.hasMany(WorkOrder, { foreignKey: 'production_order_id', as: 'work_orders' });
  WorkOrder.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'production_order' });
  
  // Production Order and Sales Order
  ProductionOrder.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'sales_order' });
  SalesOrder.hasMany(ProductionOrder, { foreignKey: 'sales_order_id', as: 'production_orders' });
  
  // Production Order created by User
  ProductionOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(ProductionOrder, { foreignKey: 'created_by', as: 'created_production_orders' });
  
  // Production Schedule
  ProductionSchedule.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'production_order' });
  ProductionOrder.hasMany(ProductionSchedule, { foreignKey: 'production_order_id', as: 'schedules' });
  
  ProductionSchedule.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
  Equipment.hasMany(ProductionSchedule, { foreignKey: 'equipment_id', as: 'schedules' });

  // =====================================
  // INVENTORY MANAGEMENT
  // =====================================
  
  // Category and Inventory Items
  Category.hasMany(InventoryItem, { foreignKey: 'category_id', as: 'items' });
  InventoryItem.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  
  // Warehouse and Stock Locations
  Warehouse.hasMany(StockLocation, { foreignKey: 'warehouse_id', as: 'locations' });
  StockLocation.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
  
  // Inventory Transactions
  InventoryItem.hasMany(InventoryTransaction, { foreignKey: 'item_id', as: 'transactions' });
  InventoryTransaction.belongsTo(InventoryItem, { foreignKey: 'item_id', as: 'item' });
  
  InventoryTransaction.belongsTo(StockLocation, { foreignKey: 'location_id', as: 'location' });
  StockLocation.hasMany(InventoryTransaction, { foreignKey: 'location_id', as: 'transactions' });
  
  InventoryTransaction.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(InventoryTransaction, { foreignKey: 'created_by', as: 'inventory_transactions' });
  
  // Inventory Lots
  InventoryItem.hasMany(Lot, { foreignKey: 'item_id', as: 'lots' });
  Lot.belongsTo(InventoryItem, { foreignKey: 'item_id', as: 'item' });
  
  Lot.belongsTo(StockLocation, { foreignKey: 'location_id', as: 'location' });
  StockLocation.hasMany(Lot, { foreignKey: 'location_id', as: 'lots' });

  // =====================================
  // SALES MANAGEMENT
  // =====================================
  
  // Customer and Sales Orders
  Customer.hasMany(SalesOrder, { foreignKey: 'customer_id', as: 'sales_orders' });
  SalesOrder.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  
  // Sales Order Items
  SalesOrder.hasMany(SalesOrderItem, { foreignKey: 'sales_order_id', as: 'items' });
  SalesOrderItem.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'sales_order' });
  SalesOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Product.hasMany(SalesOrderItem, { foreignKey: 'product_id', as: 'sales_order_items' });
  
  // Sales Order created by User
  SalesOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(SalesOrder, { foreignKey: 'created_by', as: 'created_sales_orders' });
  
  // Customer Quotations
  Customer.hasMany(Quotation, { foreignKey: 'customer_id', as: 'quotations' });
  Quotation.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  
  Quotation.hasMany(QuotationItem, { foreignKey: 'quotation_id', as: 'items' });
  QuotationItem.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });
  QuotationItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Product.hasMany(QuotationItem, { foreignKey: 'product_id', as: 'quotation_items' });
  
  // Shipments
  Shipment.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'sales_order' });
  SalesOrder.hasMany(Shipment, { foreignKey: 'sales_order_id', as: 'shipments' });
  
  Shipment.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Customer.hasMany(Shipment, { foreignKey: 'customer_id', as: 'shipments' });

  // =====================================
  // QUALITY MANAGEMENT
  // =====================================
  
  // Quality Control
  QualityControl.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Product.hasMany(QualityControl, { foreignKey: 'product_id', as: 'quality_controls' });
  
  QualityControl.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'production_order' });
  ProductionOrder.hasMany(QualityControl, { foreignKey: 'production_order_id', as: 'quality_controls' });
  
  QualityControl.belongsTo(Employee, { foreignKey: 'inspector_id', as: 'inspector' });
  Employee.hasMany(QualityControl, { foreignKey: 'inspector_id', as: 'quality_inspections' });
  
  // Quality Standards
  QualityStandard.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Product.hasMany(QualityStandard, { foreignKey: 'product_id', as: 'quality_standards' });
  
  // Quality Tests
  QualityTest.belongsTo(QualityControl, { foreignKey: 'quality_control_id', as: 'quality_control' });
  QualityControl.hasMany(QualityTest, { foreignKey: 'quality_control_id', as: 'tests' });
  
  QualityTest.belongsTo(QualityStandard, { foreignKey: 'standard_id', as: 'standard' });
  QualityStandard.hasMany(QualityTest, { foreignKey: 'standard_id', as: 'tests' });
  
  // Quality Reports
  QualityReport.belongsTo(QualityControl, { foreignKey: 'quality_control_id', as: 'quality_control' });
  QualityControl.hasOne(QualityReport, { foreignKey: 'quality_control_id', as: 'report' });
  
  QualityReport.belongsTo(User, { foreignKey: 'generated_by', as: 'generator' });
  User.hasMany(QualityReport, { foreignKey: 'generated_by', as: 'generated_quality_reports' });
  
  QualityReport.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
  User.hasMany(QualityReport, { foreignKey: 'approved_by', as: 'approved_quality_reports' });

  // =====================================
  // MAINTENANCE MANAGEMENT
  // =====================================
  
  // Equipment and Maintenance
  MaintenanceOrder.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
  Equipment.hasMany(MaintenanceOrder, { foreignKey: 'equipment_id', as: 'maintenance_orders' });
  
  MaintenanceOrder.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignee' });
  Employee.hasMany(MaintenanceOrder, { foreignKey: 'assigned_to', as: 'assigned_maintenance' });
  
  MaintenanceOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(MaintenanceOrder, { foreignKey: 'created_by', as: 'created_maintenance_orders' });
  
  // Equipment Department and Responsible Employee
  Equipment.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Department.hasMany(Equipment, { foreignKey: 'department_id', as: 'equipment' });
  
  Equipment.belongsTo(Employee, { foreignKey: 'responsible_employee_id', as: 'responsible_employee' });
  Employee.hasMany(Equipment, { foreignKey: 'responsible_employee_id', as: 'responsible_equipment' });
  
  // Maintenance Schedule
  MaintenanceSchedule.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
  Equipment.hasMany(MaintenanceSchedule, { foreignKey: 'equipment_id', as: 'maintenance_schedules' });
  
  MaintenanceSchedule.belongsTo(Employee, { foreignKey: 'assigned_to', as: 'assignee' });
  Employee.hasMany(MaintenanceSchedule, { foreignKey: 'assigned_to', as: 'assigned_schedules' });
  
  // Maintenance History
  MaintenanceHistory.belongsTo(MaintenanceOrder, { foreignKey: 'maintenance_order_id', as: 'maintenance_order' });
  MaintenanceOrder.hasMany(MaintenanceHistory, { foreignKey: 'maintenance_order_id', as: 'history' });
  
  MaintenanceHistory.belongsTo(Employee, { foreignKey: 'performed_by', as: 'performer' });
  Employee.hasMany(MaintenanceHistory, { foreignKey: 'performed_by', as: 'performed_maintenance' });

  // =====================================
  // FINANCE MANAGEMENT
  // =====================================
  
  // Accounts and Transactions
  Transaction.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });
  Account.hasMany(Transaction, { foreignKey: 'account_id', as: 'transactions' });
  
  Transaction.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(Transaction, { foreignKey: 'created_by', as: 'created_transactions' });
  
  // Invoices
  Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Customer.hasMany(Invoice, { foreignKey: 'customer_id', as: 'invoices' });
  
  Invoice.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'sales_order' });
  SalesOrder.hasMany(Invoice, { foreignKey: 'sales_order_id', as: 'invoices' });
  
  // Payments
  Payment.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
  Invoice.hasMany(Payment, { foreignKey: 'invoice_id', as: 'payments' });
  
  Payment.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  Customer.hasMany(Payment, { foreignKey: 'customer_id', as: 'payments' });

  // =====================================
  // PROCUREMENT MANAGEMENT
  // =====================================
  
  // Purchase Orders
  PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
  Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id', as: 'purchase_orders' });
  
  PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  User.hasMany(PurchaseOrder, { foreignKey: 'created_by', as: 'created_purchase_orders' });
  
  // Purchase Order Items
  PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items' });
  PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchase_order' });
  
  PurchaseOrderItem.belongsTo(InventoryItem, { foreignKey: 'item_id', as: 'item' });
  InventoryItem.hasMany(PurchaseOrderItem, { foreignKey: 'item_id', as: 'purchase_order_items' });
  
  // Purchase Requests
  PurchaseRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });
  User.hasMany(PurchaseRequest, { foreignKey: 'requested_by', as: 'purchase_requests' });
  
  PurchaseRequest.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
  Department.hasMany(PurchaseRequest, { foreignKey: 'department_id', as: 'purchase_requests' });
};

// Initialize associations
defineAssociations();

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Product,
  ProductionOrder,
  BillOfMaterial,
  BOMItem,
  WorkOrder,
  ProductionSchedule,
  Category,
  InventoryItem,
  Warehouse,
  InventoryTransaction,
  StockLocation,
  Lot,
  Customer,
  SalesOrder,
  SalesOrderItem,
  Quotation,
  QuotationItem,
  Shipment,
  QualityControl,
  QualityStandard,
  QualityTest,
  QualityReport,
  Equipment,
  MaintenanceSchedule,
  MaintenanceOrder,
  MaintenanceHistory,
  Employee,
  Department,
  Attendance,
  Payroll,
  Account,
  Transaction,
  Invoice,
  Payment,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseRequest
};