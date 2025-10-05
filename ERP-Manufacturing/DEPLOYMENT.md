# Manufacturing ERP System - Hướng Dẫn Triển Khai Production

## 🚀 Triển Khai Production

### 1. Chuẩn Bị Môi Trường

#### Yêu Cầu Hệ Thống
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Amazon Linux 2
- **Node.js**: v16.x trở lên
- **PostgreSQL**: v12.x trở lên
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB+)
- **Disk**: Tối thiểu 50GB (khuyến nghị 100GB+)
- **CPU**: Tối thiểu 2 cores (khuyến nghị 4 cores+)

#### Cài Đặt Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Cấu Hình Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE manufacturing_erp_prod;
CREATE USER erp_admin WITH PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE manufacturing_erp_prod TO erp_admin;
\q

# Configure PostgreSQL for production
sudo nano /etc/postgresql/12/main/postgresql.conf

# Add/modify these settings:
# max_connections = 100
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100
# random_page_cost = 1.1
# effective_io_concurrency = 200

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Triển Khai Application

```bash
# Create application user
sudo useradd -m -s /bin/bash erp
sudo usermod -aG sudo erp

# Switch to application user
sudo su - erp

# Clone repository
git clone <your-repository-url> /home/erp/manufacturing-erp
cd /home/erp/manufacturing-erp

# Setup backend
cd backend
npm install --production

# Create production environment file
cp .env.example .env.production
nano .env.production
```

#### Production Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manufacturing_erp_prod
DB_USER=erp_admin
DB_PASSWORD=YourSecurePassword123!

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-minimum-64-characters-long-for-production
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Security Configuration
BCRYPT_ROUNDS=14
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=50

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com

# File Upload
UPLOAD_PATH=/home/erp/uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=/home/erp/logs/app.log
```

#### Setup Frontend

```bash
# Build frontend
cd ../frontend
npm install
npm run build

# Copy build files to nginx directory
sudo mkdir -p /var/www/manufacturing-erp
sudo cp -r build/* /var/www/manufacturing-erp/
sudo chown -R www-data:www-data /var/www/manufacturing-erp
```

### 4. Cấu Hình PM2

```bash
# Create PM2 ecosystem file
cat > /home/erp/manufacturing-erp/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'erp-backend',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_file: './backend/.env.production',
    error_file: '/home/erp/logs/pm2-error.log',
    out_file: '/home/erp/logs/pm2-out.log',
    log_file: '/home/erp/logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p /home/erp/logs

# Start application with PM2
cd /home/erp/manufacturing-erp
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u erp --hp /home/erp
```

### 5. Cấu Hình Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/manufacturing-erp
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be added by certbot)
    
    # Frontend
    location / {
        root /var/www/manufacturing-erp;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/manufacturing-erp /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. Cấu Hình SSL

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432  # PostgreSQL (only if external access needed)
sudo ufw status
```

### 8. Monitoring và Logging

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/manufacturing-erp
```

```
/home/erp/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 9. Database Backup Script

```bash
# Create backup script
sudo nano /home/erp/scripts/backup-database.sh
```

```bash
#!/bin/bash

# Configuration
DB_NAME="manufacturing_erp_prod"
DB_USER="erp_admin"
BACKUP_DIR="/home/erp/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/erp_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "erp_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

```bash
# Make executable
chmod +x /home/erp/scripts/backup-database.sh

# Add to crontab for daily backups
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /home/erp/scripts/backup-database.sh
```

### 10. Health Monitoring

```bash
# Create monitoring script
sudo nano /home/erp/scripts/health-check.sh
```

```bash
#!/bin/bash

# Check if backend is running
if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "Backend is down, restarting..."
    pm2 restart erp-backend
    # Send notification (implement your notification method)
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "Warning: Disk usage is at ${DISK_USAGE}%"
    # Send alert (implement your alert method)
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 85 ]; then
    echo "Warning: Memory usage is at ${MEM_USAGE}%"
    # Send alert (implement your alert method)
fi
```

```bash
# Make executable and add to crontab
chmod +x /home/erp/scripts/health-check.sh

# Add to crontab for every 5 minutes
crontab -e

# Add this line
*/5 * * * * /home/erp/scripts/health-check.sh
```

## 🔒 Security Checklist

- [x] Use strong passwords for database and JWT secrets
- [x] Enable SSL/TLS encryption
- [x] Configure firewall rules
- [x] Regular security updates
- [x] Database access restrictions
- [x] Rate limiting enabled
- [x] Input validation and sanitization
- [x] Security headers configured
- [x] Regular backups
- [x] Monitoring and alerting

## 🔄 Maintenance

### Regular Tasks

1. **Daily**: Check application logs and metrics
2. **Weekly**: Review backup integrity
3. **Monthly**: Security updates and patches
4. **Quarterly**: Performance optimization review

### Commands

```bash
# View PM2 status
pm2 status

# View logs
pm2 logs erp-backend

# Restart application
pm2 restart erp-backend

# Update application
cd /home/erp/manufacturing-erp
git pull
cd backend && npm install --production
cd ../frontend && npm run build
sudo cp -r build/* /var/www/manufacturing-erp/
pm2 restart erp-backend
```

## 🆘 Troubleshooting

### Common Issues

1. **Application won't start**:
   ```bash
   pm2 logs erp-backend
   ```

2. **Database connection issues**:
   ```bash
   sudo systemctl status postgresql
   ```

3. **Nginx issues**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **SSL certificate issues**:
   ```bash
   sudo certbot certificates
   ```

### Performance Monitoring

```bash
# Check system resources
htop
iostat

# Check database performance
sudo -u postgres psql manufacturing_erp_prod -c "SELECT * FROM pg_stat_activity;"

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```