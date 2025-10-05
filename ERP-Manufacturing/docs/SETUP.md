# Manufacturing ERP System - Setup Guide

## Prerequisites

Before setting up the Manufacturing ERP System, ensure you have the following installed:

### Required Software

- **Node.js**: Version 16.x or higher
- **npm**: Usually comes with Node.js
- **PostgreSQL**: Version 12.x or higher
- **Git**: For version control

### Optional Tools

- **pgAdmin**: PostgreSQL administration tool
- **Postman**: API testing tool
- **VS Code**: Recommended code editor

## Step-by-Step Setup

### 1. Database Setup

#### Install PostgreSQL

**On Windows:**

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Add PostgreSQL to your system PATH

**On macOS:**

```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

**On Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Create Database

1. **Access PostgreSQL:**

   ```bash
   # Login as postgres user
   sudo -u postgres psql

   # Or on Windows
   psql -U postgres
   ```

2. **Create Database and User:**

   ```sql
   -- Create database
   CREATE DATABASE manufacturing_erp;

   -- Create user (optional)
   CREATE USER erp_user WITH PASSWORD 'your_password';

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE manufacturing_erp TO erp_user;

   -- Exit
   \q
   ```

### 2. Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd manufacturing-erp/backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   ```bash
   cp .env.example .env
   ```

4. **Edit .env file:**

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=manufacturing_erp
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d

   # Security
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=100
   ```

5. **Initialize Database:**

   ```bash
   # Run database seeding (creates tables and sample data)
   npm run seed
   ```

6. **Start Backend Server:**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Or production mode
   npm start
   ```

   The backend server will start on http://localhost:5000

### 3. Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**

   ```bash
   cp .env.example .env
   ```

4. **Edit .env file:**

   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_VERSION=1.0.0
   REACT_APP_COMPANY_NAME=Your Manufacturing Company
   REACT_APP_SYSTEM_NAME=Manufacturing ERP System
   ```

5. **Start Frontend Server:**

   ```bash
   npm start
   ```

   The frontend application will start on http://localhost:3000

### 4. Verification

1. **Check Backend:**

   - Visit http://localhost:5000/health
   - Should return: `{"status":"OK","timestamp":"...","uptime":...}`

2. **Check Frontend:**

   - Visit http://localhost:3000
   - Should display the login page

3. **Test Login:**
   - Email: `admin@example.com`
   - Password: `password123`

## Troubleshooting

### Common Issues

#### Database Connection Issues

**Error: "ECONNREFUSED" or "Connection refused"**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Start PostgreSQL if not running
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS
```

**Error: "database does not exist"**

```bash
# Create the database
createb manufacturing_erp

# Or via psql
psql -U postgres -c "CREATE DATABASE manufacturing_erp;"
```

**Error: "authentication failed"**

- Check your database credentials in `.env`
- Ensure the database user has proper permissions

#### Node.js Issues

**Error: "Cannot find module"**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port already in use"**

```bash
# Find process using the port
lsof -i :5000  # For backend
lsof -i :3000  # For frontend

# Kill the process
kill -9 <PID>

# Or use different ports in .env files
```

#### Frontend Issues

**Error: "Network Error" or API calls failing**

- Ensure backend server is running on port 5000
- Check REACT_APP_API_URL in frontend/.env
- Verify CORS settings in backend

### Performance Optimization

#### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
```

#### Backend Optimization

- Enable compression middleware
- Use Redis for session storage (optional)
- Configure connection pooling

#### Frontend Optimization

- Enable production build optimizations
- Use lazy loading for routes
- Optimize bundle size

## Production Deployment

### Environment Setup

1. **Production Environment Variables:**

   ```env
   NODE_ENV=production
   PORT=5000

   # Use production database
   DB_HOST=your-production-db-host
   DB_NAME=manufacturing_erp_prod
   DB_USER=your-production-user
   DB_PASSWORD=your-strong-production-password

   # Strong JWT secret
   JWT_SECRET=your-very-long-and-secure-jwt-secret-key

   # Security settings
   BCRYPT_ROUNDS=14
   RATE_LIMIT_WINDOW=15
   RATE_LIMIT_MAX=50
   ```

2. **Build Frontend:**

   ```bash
   cd frontend
   npm run build

   # Serve built files with backend
   cp -r build/* ../backend/public/
   ```

3. **Process Management:**

   ```bash
   # Install PM2 for process management
   npm install -g pm2

   # Start application
   cd backend
   pm2 start server.js --name "erp-backend"

   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure firewall rules
- [ ] Enable database SSL
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Backup database regularly
- [ ] Use environment variables for secrets

### Backup Strategy

1. **Database Backup:**

   ```bash
   # Create backup
   pg_dump -U username -h hostname manufacturing_erp > backup.sql

   # Restore backup
   psql -U username -h hostname manufacturing_erp < backup.sql
   ```

2. **Automated Backups:**
   ```bash
   # Add to crontab for daily backups
   0 2 * * * pg_dump -U username manufacturing_erp > /backup/erp_$(date +\%Y\%m\%d).sql
   ```

## Next Steps

1. **Customize the System:**

   - Modify company branding
   - Add custom fields
   - Configure business rules

2. **User Management:**

   - Create user accounts
   - Assign roles and permissions
   - Configure user groups

3. **Data Import:**

   - Import existing customer data
   - Import product catalog
   - Import inventory data

4. **Integration:**

   - Connect to existing systems
   - Configure API integrations
   - Set up automated workflows

5. **Training:**
   - Train users on the system
   - Create user documentation
   - Set up support processes

## Support

If you encounter any issues during setup:

1. Check the logs:

   ```bash
   # Backend logs
   tail -f backend/logs/combined.log

   # Frontend logs
   # Check browser console for errors
   ```

2. Verify system requirements
3. Check firewall and network settings
4. Review environment variables
5. Consult the troubleshooting section above

For additional support, please refer to the main README.md or create an issue in the repository.

---

**Happy Manufacturing! 🏭**
