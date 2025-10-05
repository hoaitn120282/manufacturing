module.exports = {
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    PRODUCTION_MANAGER: 'production_manager',
    SALES_MANAGER: 'sales_manager',
    WAREHOUSE_MANAGER: 'warehouse_manager',
    OPERATOR: 'operator',
    SALES_REP: 'sales_rep',
    USER: 'user'
  },

  PRODUCTION_STATUSES: {
    PLANNED: 'planned',
    RELEASED: 'released',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  SALES_ORDER_STATUSES: {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    IN_PRODUCTION: 'in_production',
    READY_TO_SHIP: 'ready_to_ship',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  INVENTORY_TRANSACTION_TYPES: {
    RECEIPT: 'receipt',
    ISSUE: 'issue',
    TRANSFER: 'transfer',
    ADJUSTMENT: 'adjustment',
    RETURN: 'return'
  },

  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  }
};
