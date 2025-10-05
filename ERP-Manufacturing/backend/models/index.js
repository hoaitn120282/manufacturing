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
  // User and Role associations
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
  
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

  // Production associations
  Product.hasMany(ProductionOrder, { foreignKey: 'product_id', as: 'production_orders' });
  ProductionOrder.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  
  Product.hasMany(BillOfMaterial, { foreignKey: 'product_id', as: 'boms' });
  BillOfMaterial.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  
  BillOfMaterial.hasMany(BOMItem, { foreignKey: 'bom_id', as: 'items' });
  BOMItem.belongsTo(BillOfMaterial, { foreignKey: 'bom_id', as: 'bom' });
  BOMItem.belongsTo(InventoryItem, { foreignKey: 'material_id', as: 'material' });
  
  ProductionOrder.hasMany(WorkOrder, { foreignKey: 'production_order_id', as: 'work_orders' });
  WorkOrder.belongsTo(ProductionOrder, { foreignKey: 'production_order_id', as: 'production_order' });

  // Inventory associations
  Category.hasMany(InventoryItem, { foreignKey: 'category_id', as: 'items' });
  InventoryItem.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  
  Warehouse.hasMany(StockLocation, { foreignKey: 'warehouse_id', as: 'locations' });
  StockLocation.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
  
  InventoryItem.hasMany(InventoryTransaction, { foreignKey: 'item_id', as: 'transactions' });
  InventoryTransaction.belongsTo(InventoryItem, { foreignKey: 'item_id', as: 'item' });
  
  InventoryItem.hasMany(Lot, { foreignKey: 'item_id', as: 'lots' });
  Lot.belongsTo(InventoryItem, { foreignKey: 'item_id', as: 'item' });

  // Sales associations
  Customer.hasMany(SalesOrder, { foreignKey: 'customer_id', as: 'sales_orders' });
  SalesOrder.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  
  SalesOrder.hasMany(SalesOrderItem, { foreignKey: 'sales_order_id', as: 'items' });
  SalesOrderItem.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'sales_order' });
  SalesOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  
  Customer.hasMany(Quotation, { foreignKey: 'customer_id', as: 'quotations' });
  Quotation.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
  
  Quotation.hasMany(QuotationItem, { foreignKey: 'quotation_id', as: 'items' });
  QuotationItem.belongsTo(Quotation, { foreignKey: 'quotation_id', as: 'quotation' });

  // Additional associations can be added for other modules...
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