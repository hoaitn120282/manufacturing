/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - first_name
 *         - last_name
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated user ID
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         first_name:
 *           type: string
 *           description: User's first name
 *         last_name:
 *           type: string
 *           description: User's last name
 *         role_id:
 *           type: integer
 *           description: User's role ID
 *         is_active:
 *           type: boolean
 *           description: Whether user account is active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *       example:
 *         id: 1
 *         email: admin@example.com
 *         first_name: Admin
 *         last_name: User
 *         role_id: 1
 *         is_active: true
 *         created_at: 2024-01-01T00:00:00.000Z
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *       example:
 *         email: admin@example.com
 *         password: password123
 *
 *     ProductionOrder:
 *       type: object
 *       required:
 *         - product_id
 *         - quantity_planned
 *         - due_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated order ID
 *         order_number:
 *           type: string
 *           description: Auto-generated order number
 *         product_id:
 *           type: integer
 *           description: Product to be manufactured
 *         quantity_planned:
 *           type: number
 *           description: Planned quantity to produce
 *         quantity_produced:
 *           type: number
 *           description: Actual quantity produced
 *         start_date:
 *           type: string
 *           format: date
 *           description: Production start date
 *         due_date:
 *           type: string
 *           format: date
 *           description: Production due date
 *         status:
 *           type: string
 *           enum: [planned, released, in_progress, completed, cancelled]
 *           description: Current order status
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Order priority
 *       example:
 *         id: 1
 *         order_number: PO-2024-0001
 *         product_id: 1
 *         quantity_planned: 100
 *         quantity_produced: 0
 *         start_date: 2024-01-15
 *         due_date: 2024-01-30
 *         status: planned
 *         priority: medium
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         details:
 *           type: array
 *           items:
 *             type: object
 *           description: Detailed error information
 *       example:
 *         error: Validation failed
 *         details: [{"field": "email", "message": "Email is required"}]
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Production
 *     description: Production management operations
 *   - name: Inventory
 *     description: Inventory management operations
 *   - name: Sales
 *     description: Sales management operations
 *   - name: Reports
 *     description: Reporting and analytics
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/production:
 *   get:
 *     summary: Get production orders
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, released, in_progress, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Production orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     production_orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductionOrder'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *   post:
 *     summary: Create production order
 *     tags: [Production]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductionOrder'
 *     responses:
 *       201:
 *         description: Production order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProductionOrder'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */