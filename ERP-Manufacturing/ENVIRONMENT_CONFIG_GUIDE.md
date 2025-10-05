# Environment Configuration Guide

## 📋 **Overview**

Hướng dẫn cấu hình các biến môi trường cho hệ thống Manufacturing ERP System.

## 🔧 **Files Created**

### Backend
- `<filepath>backend/.env</filepath>` - Development configuration
- `<filepath>backend/.env.production</filepath>` - Production configuration
- `<filepath>backend/.env.example</filepath>` - Template (existing)

### Frontend
- `<filepath>frontend/.env</filepath>` - Development configuration
- `<filepath>frontend/.env.production</filepath>` - Production configuration
- `<filepath>frontend/.env.example</filepath>` - Template (existing)

## 🏗️ **Backend Configuration**

### 🔌 **Server Settings**
```env
PORT=5000                    # Server port
NODE_ENV=development         # Environment mode
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
```

### 🗄️ **Database Configuration**
```env
DB_HOST=localhost           # PostgreSQL host
DB_PORT=5432               # PostgreSQL port
DB_NAME=manufacturing_erp_dev  # Database name
DB_USER=erp_user           # Database username
DB_PASSWORD=erp_password_2024  # Database password
```

### 🔐 **Security Settings**
```env
JWT_SECRET=your_secure_jwt_key  # JWT signing key (min 32 chars)
JWT_EXPIRE=7d                   # JWT expiration time
BCRYPT_ROUNDS=12               # Password hashing rounds
RATE_LIMIT_MAX=100             # API rate limit per window
```

### 📧 **Email Configuration**
```env
EMAIL_HOST=smtp.gmail.com      # SMTP server
EMAIL_PORT=587                 # SMTP port
EMAIL_USER=your_email@gmail.com  # SMTP username
EMAIL_PASS=your_app_password   # SMTP password (use app password)
```

### 📁 **File Upload**
```env
UPLOAD_PATH=uploads            # Upload directory
MAX_FILE_SIZE=10485760        # Max file size (10MB)
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf  # Allowed file types
```

## 🎨 **Frontend Configuration**

### 🌐 **API Settings**
```env
REACT_APP_API_URL=http://localhost:5000/api  # Backend API URL
REACT_APP_SOCKET_URL=http://localhost:5000   # Socket.IO URL
```

### 🎯 **Application Info**
```env
REACT_APP_COMPANY_NAME=Your Manufacturing Company  # Company name
REACT_APP_SYSTEM_NAME=Manufacturing ERP System     # System name
REACT_APP_VERSION=1.0.0                           # Version number
```

### 🎨 **Theme Configuration**
```env
REACT_APP_THEME_MODE=light        # Default theme (light/dark)
REACT_APP_PRIMARY_COLOR=#1976d2   # Primary color
REACT_APP_SECONDARY_COLOR=#dc004e # Secondary color
```

### ⚡ **Performance Settings**
```env
REACT_APP_API_TIMEOUT=30000          # API request timeout (30s)
REACT_APP_DEBOUNCE_DELAY=500         # Input debounce delay (500ms)
REACT_APP_DASHBOARD_REFRESH_INTERVAL=300000  # Dashboard refresh (5min)
```

## 🔧 **Setup Instructions**

### 1. **Development Setup**

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

### 2. **Production Setup**

```bash
# Backend
cd backend
cp .env.production .env
# Edit .env with production values

# Frontend
cd frontend
cp .env.production .env
# Edit .env with production values
```

## 🔒 **Security Recommendations**

### **Backend Security**
- ✅ Use strong, unique JWT secrets (min 64 chars for production)
- ✅ Use app passwords for email accounts, not main passwords
- ✅ Enable SSL for production database connections
- ✅ Set appropriate rate limits for your traffic
- ✅ Use Redis for session storage in production

### **Frontend Security**
- ✅ Disable debug mode in production
- ✅ Disable Redux DevTools in production
- ✅ Use HTTPS URLs for production API
- ✅ Disable source maps in production

## 🗄️ **Database Setup**

### **PostgreSQL Setup**
```sql
-- Create database
CREATE DATABASE manufacturing_erp_dev;

-- Create user
CREATE USER erp_user WITH PASSWORD 'erp_password_2024';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE manufacturing_erp_dev TO erp_user;
```

## 📧 **Email Setup**

### **Gmail Configuration**
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in EMAIL_PASS

### **Custom SMTP**
```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_smtp_password
```

## 🚀 **Production Checklist**

### **Backend Production**
- [ ] Change NODE_ENV to production
- [ ] Use secure database credentials
- [ ] Enable SSL for database
- [ ] Set strong JWT secrets
- [ ] Configure production email SMTP
- [ ] Set appropriate rate limits
- [ ] Enable Redis caching
- [ ] Configure proper logging paths

### **Frontend Production**
- [ ] Update API URLs to production
- [ ] Disable debug mode
- [ ] Disable Redux DevTools
- [ ] Enable service worker
- [ ] Disable source maps
- [ ] Set shorter session timeout
- [ ] Configure CDN for assets

## 🔍 **Environment Validation**

### **Backend Validation**
```javascript
// Check required environment variables
const requiredEnvVars = [
  'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
  'JWT_SECRET', 'EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required`);
  }
});
```

### **Frontend Validation**
```javascript
// Check required React environment variables
const requiredReactEnvVars = [
  'REACT_APP_API_URL',
  'REACT_APP_SOCKET_URL'
];

requiredReactEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Environment variable ${envVar} is required`);
  }
});
```

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Database Connection Failed**
   - Check DB_HOST, DB_PORT, DB_NAME
   - Verify user permissions
   - Check PostgreSQL service status

2. **JWT Authentication Failed**
   - Verify JWT_SECRET is set
   - Check JWT_EXPIRE format (e.g., '7d', '24h')

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check EMAIL_PORT and EMAIL_HOST
   - Enable "Less secure app access" if using Gmail

4. **Frontend API Calls Failed**
   - Check REACT_APP_API_URL
   - Verify backend is running on correct port
   - Check CORS configuration

## 📞 **Support**

If you encounter issues with environment configuration, please check:
1. All required variables are set
2. Values match your infrastructure
3. Firewall/network connectivity
4. Service dependencies are running

---
*Configuration Guide by: MiniMax Agent | Date: 2025-10-03*