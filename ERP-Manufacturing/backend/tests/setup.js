const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');

// Setup test environment
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.DB_NAME = 'manufacturing_erp_test';
  
  // Suppress console logs during tests
  logger.transports.forEach((t) => (t.silent = true));
});

// Cleanup after all tests
afterAll(async () => {
  await sequelize.close();
});

// Global test timeout
jest.setTimeout(10000);