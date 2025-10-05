const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../config/database');
const { User, Role, Product, Category, ProductionOrder } = require('../models');

describe('Production Endpoints', () => {
  let authToken;
  let testProduct;
  let testCategory;

  beforeAll(async () => {
    // Setup test database
    await sequelize.sync({ force: true });
    
    // Create test role and user
    const role = await Role.create({
      name: 'production_manager',
      description: 'Production Manager'
    });

    const user = await User.create({
      email: 'production@test.com',
      password: 'password123',
      first_name: 'Production',
      last_name: 'Manager',
      role_id: role.id
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'production@test.com',
        password: 'password123'
      });
    
    authToken = loginRes.body.data.token;

    // Create test category and product
    testCategory = await Category.create({
      name: 'Test Category',
      description: 'Test category for production'
    });

    testProduct = await Product.create({
      name: 'Test Product',
      sku: 'TEST-001',
      category_id: testCategory.id,
      standard_cost: 10.00,
      selling_price: 20.00
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/production', () => {
    it('should get production orders', async () => {
      const res = await request(app)
        .get('/api/production')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.production_orders).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should reject unauthorized requests', async () => {
      const res = await request(app)
        .get('/api/production')
        .expect(401);

      expect(res.body.error).toBe('Not authorized, no token');
    });
  });

  describe('POST /api/production', () => {
    it('should create production order', async () => {
      const orderData = {
        product_id: testProduct.id,
        quantity_planned: 100,
        start_date: '2024-01-15',
        due_date: '2024-01-30',
        priority: 'medium',
        notes: 'Test production order'
      };

      const res = await request(app)
        .post('/api/production')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.order_number).toBeDefined();
      expect(res.body.data.product_id).toBe(testProduct.id);
      expect(res.body.data.quantity_planned).toBe(100);
    });

    it('should reject invalid product_id', async () => {
      const orderData = {
        product_id: 99999,
        quantity_planned: 100,
        start_date: '2024-01-15',
        due_date: '2024-01-30',
        priority: 'medium'
      };

      const res = await request(app)
        .post('/api/production')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(500); // Should handle foreign key constraint
    });
  });

  describe('GET /api/production/metrics/dashboard', () => {
    it('should get production metrics', async () => {
      const res = await request(app)
        .get('/api/production/metrics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.total_orders).toBeDefined();
      expect(res.body.data.orders_by_status).toBeDefined();
    });
  });
});