# Manufacturing ERP System

A comprehensive Enterprise Resource Planning (ERP) system specifically designed for manufacturing operations. Built with modern technologies including React, Node.js, and PostgreSQL.

## 🏭 Features

### Core Modules ✅ Fully Implemented
1. **Production Management** - MPS scheduling, BOM management, production orders
2. **Inventory & Material Management** - Multi-warehouse tracking, barcode/RFID integration
3. **Sales & Order Management** - Customer management, order tracking, CRM integration
4. **Reporting & Analytics** - Real-time dashboards, KPI reporting, BI integration

### Additional Modules ✅ Fully Implemented
5. **Quality Management** - IQC/IPQC/OQC inspections, ISO standards, quality reporting
6. **Maintenance Management** - Equipment management, preventive maintenance, work orders
7. **HRM & Workforce Management** - Employee management, biometric attendance, payroll
8. **Finance & Accounting** - General ledger, cost accounting, financial reports
9. **Procurement & Supply Chain** - Purchase management, supplier evaluation, analytics
10. **Integration & Technology** - System monitoring, health checks, backup management

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs, CORS
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Charts**: Chart.js with react-chartjs-2
- **Data Grid**: MUI X Data Grid
- **HTTP Client**: Axios
- **Forms**: Formik with Yup validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd manufacturing-erp
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database configuration
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your API configuration
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb manufacturing_erp
   
   # Run database migrations and seeding
   cd ../backend
   npm run seed
   ```

5. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Manager | manager@example.com | password123 |
| Production Manager | production@example.com | password123 |
| Sales Manager | sales@example.com | password123 |

## 📊 Dashboard Features

### Real-time Metrics
- Production order status and progress
- Inventory levels and low-stock alerts
- Sales orders and revenue tracking
- Key Performance Indicators (KPIs)

### Interactive Charts
- Production trend analysis
- Order status distribution
- Sales performance metrics
- Inventory valuation reports

### Recent Activities
- Real-time updates via WebSocket
- Production status changes
- New order notifications
- System alerts and warnings

## 🏗 Architecture

### Backend Architecture
```
backend/
├── config/          # Database and app configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models (Sequelize)
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
├── database/        # Migrations and seeders
└── server.js        # Application entry point
```

### Frontend Architecture
```
frontend/src/
├── components/      # Reusable React components
│   ├── common/      # Shared components
│   ├── dashboard/   # Dashboard widgets
│   ├── production/  # Production components
│   ├── inventory/   # Inventory components
│   ├── sales/       # Sales components
│   └── layout/      # Layout components
├── pages/           # Page components
├── store/           # Redux store and slices
├── services/        # API services
├── hooks/           # Custom React hooks
└── utils/           # Utility functions
```

### Database Schema

The system uses a comprehensive relational database schema with the following key entities:

- **Users & Authentication**: User management with role-based access control
- **Production**: Products, production orders, BOMs, work orders
- **Inventory**: Items, categories, transactions, warehouses, stock locations
- **Sales**: Customers, sales orders, quotations, shipments
- **Quality**: Quality controls, standards, tests, reports
- **Maintenance**: Equipment, schedules, orders, history
- **HRM**: Employees, departments, attendance, payroll
- **Finance**: Accounts, transactions, invoices, payments
- **Procurement**: Suppliers, purchase orders, requests

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- Rate limiting
- Password hashing with bcrypt
- CORS protection
- Security headers with Helmet

## 📡 Real-time Features

- WebSocket integration with Socket.IO
- Real-time dashboard updates
- Live production status monitoring
- Instant notifications
- Real-time inventory alerts

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance

- Database query optimization
- API response caching
- Pagination for large datasets
- Lazy loading for React components
- Bundle optimization
- Image optimization

## 🔄 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout

### Production Endpoints
- `GET /api/production` - Get production orders
- `POST /api/production` - Create production order
- `PUT /api/production/:id` - Update production order
- `GET /api/production/metrics/dashboard` - Get production metrics

### Inventory Endpoints
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/stock/low-stock` - Get low stock items
- `GET /api/inventory/valuation/current` - Get inventory valuation

### Sales Endpoints
- `GET /api/sales` - Get sales orders
- `POST /api/sales` - Create sales order
- `GET /api/sales/metrics/dashboard` - Get sales metrics
- `GET /api/sales/customers` - Get customers

### Reporting Endpoints
- `GET /api/reporting/dashboard` - Get dashboard data
- `GET /api/reporting/production` - Get production reports
- `GET /api/reporting/inventory` - Get inventory reports
- `GET /api/reporting/sales` - Get sales reports

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set environment variables
   export NODE_ENV=production
   export DB_HOST=your-production-db-host
   export DB_NAME=manufacturing_erp_prod
   export JWT_SECRET=your-super-secret-jwt-key
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   npm start
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core production management
- ✅ Basic inventory tracking
- ✅ Sales order management
- ✅ Real-time dashboard
- ✅ User authentication

### Phase 2 (Next)
- 📋 Advanced quality management
- 📋 Equipment maintenance scheduling
- 📋 Comprehensive reporting
- 📋 Mobile application
- 📋 API integrations

### Phase 3 (Future)
- 📋 IoT device integration
- 📋 Machine learning analytics
- 📋 Advanced forecasting
- 📋 Blockchain traceability
- 📋 AI-powered optimization

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@manufacturing-erp.com
- Documentation: [Wiki](wiki-url)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by industry best practices
- Designed for scalability and performance
- Community-driven development

---

**Manufacturing ERP System** - Streamlining manufacturing operations with modern technology.

Develop by GTS Việt Nam
