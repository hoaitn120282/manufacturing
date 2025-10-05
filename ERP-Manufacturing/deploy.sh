#!/bin/bash

# Manufacturing ERP System - Production Deployment Script
# This script automates the deployment process for production environment

set -e  # Exit on any error

echo "🏭 Manufacturing ERP System - Production Deployment"
echo "=========================================================="

# Configuration
APP_USER="erp"
APP_DIR="/home/$APP_USER/manufacturing-erp"
BACKUP_DIR="/home/$APP_USER/backups"
LOG_DIR="/home/$APP_USER/logs"
NGINX_SITE="manufacturing-erp"
DOMAIN="yourdomain.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL is not installed"
        exit 1
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed"
        exit 1
    fi
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx is not installed"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

setup_directories() {
    log_info "Setting up directories..."
    
    mkdir -p $BACKUP_DIR
    mkdir -p $LOG_DIR
    mkdir -p /home/$APP_USER/uploads
    mkdir -p /home/$APP_USER/scripts
    
    log_success "Directories created"
}

backup_database() {
    if [ "$1" = "--skip-backup" ]; then
        log_warning "Skipping database backup"
        return
    fi
    
    log_info "Creating database backup..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/pre_deployment_backup_$TIMESTAMP.sql"
    
    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw manufacturing_erp_prod; then
        pg_dump -h localhost -U erp_admin manufacturing_erp_prod > $BACKUP_FILE
        gzip $BACKUP_FILE
        log_success "Database backup created: $BACKUP_FILE.gz"
    else
        log_warning "Production database not found, skipping backup"
    fi
}

deploy_backend() {
    log_info "Deploying backend..."
    
    cd $APP_DIR/backend
    
    # Install dependencies
    npm install --production
    
    # Run database migrations if needed
    if [ -f "database/migrate.js" ]; then
        node database/migrate.js
    fi
    
    # Restart PM2 process
    if pm2 list | grep -q "erp-backend"; then
        pm2 restart erp-backend
    else
        pm2 start ecosystem.config.js
    fi
    
    log_success "Backend deployed"
}

deploy_frontend() {
    log_info "Deploying frontend..."
    
    cd $APP_DIR/frontend
    
    # Install dependencies
    npm install
    
    # Build production bundle
    npm run build
    
    # Copy to nginx directory
    sudo rm -rf /var/www/$NGINX_SITE/*
    sudo cp -r build/* /var/www/$NGINX_SITE/
    sudo chown -R www-data:www-data /var/www/$NGINX_SITE
    
    log_success "Frontend deployed"
}

setup_nginx() {
    log_info "Setting up Nginx configuration..."
    
    # Create nginx config if it doesn't exist
    if [ ! -f "/etc/nginx/sites-available/$NGINX_SITE" ]; then
        log_warning "Nginx configuration not found. Please create it manually."
        return
    fi
    
    # Test nginx configuration
    sudo nginx -t
    
    # Reload nginx
    sudo systemctl reload nginx
    
    log_success "Nginx configured"
}

setup_ssl() {
    log_info "Setting up SSL certificate..."
    
    if command -v certbot &> /dev/null; then
        # Check if certificate already exists
        if sudo certbot certificates | grep -q "$DOMAIN"; then
            log_info "SSL certificate already exists for $DOMAIN"
        else
            sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        fi
    else
        log_warning "Certbot not installed. SSL setup skipped."
    fi
    
    log_success "SSL setup completed"
}

setup_monitoring() {
    log_info "Setting up monitoring scripts..."
    
    # Create health check script
    cat > /home/$APP_USER/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health check script
if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "$(date): Backend is down, restarting..." >> /home/erp/logs/health-check.log
    pm2 restart erp-backend
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "$(date): Warning: Disk usage is at ${DISK_USAGE}%" >> /home/erp/logs/health-check.log
fi
EOF
    
    chmod +x /home/$APP_USER/scripts/health-check.sh
    
    # Add to crontab if not already present
    (crontab -l 2>/dev/null | grep -v health-check.sh; echo "*/5 * * * * /home/$APP_USER/scripts/health-check.sh") | crontab -
    
    log_success "Monitoring scripts setup completed"
}

run_tests() {
    log_info "Running tests..."
    
    cd $APP_DIR/backend
    
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        npm test
        log_success "Tests passed"
    else
        log_warning "No tests found, skipping"
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check PM2 status
    if ! pm2 list | grep -q "online.*erp-backend"; then
        log_error "Backend is not running"
        exit 1
    fi
    
    # Check health endpoint
    sleep 5
    if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_error "Health check failed"
        exit 1
    fi
    
    # Check nginx status
    if ! sudo systemctl is-active --quiet nginx; then
        log_error "Nginx is not running"
        exit 1
    fi
    
    log_success "Deployment verification passed"
}

show_status() {
    echo
    log_info "Deployment Status:"
    echo "=================="
    
    # PM2 status
    echo "PM2 Processes:"
    pm2 list
    
    # Nginx status
    echo
    echo "Nginx Status:"
    sudo systemctl status nginx --no-pager -l
    
    # Database connection
    echo
    echo "Database Status:"
    if pg_isready -h localhost -p 5432; then
        echo "✅ PostgreSQL is ready"
    else
        echo "❌ PostgreSQL connection failed"
    fi
    
    # Application health
    echo
    echo "Application Health:"
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ Application is healthy"
    else
        echo "❌ Application health check failed"
    fi
}

# Main deployment function
main() {
    echo
    log_info "Starting deployment process..."
    
    check_prerequisites
    setup_directories
    
    # Parse command line arguments
    SKIP_BACKUP=false
    SKIP_TESTS=false
    
    for arg in "$@"; do
        case $arg in
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            *)
                ;;
        esac
    done
    
    if [ "$SKIP_BACKUP" = false ]; then
        backup_database
    fi
    
    deploy_backend
    deploy_frontend
    setup_nginx
    setup_ssl
    setup_monitoring
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    verify_deployment
    show_status
    
    echo
    log_success "🎉 Deployment completed successfully!"
    echo
    log_info "Application URLs:"
    echo "  - Frontend: https://$DOMAIN"
    echo "  - Backend API: https://$DOMAIN/api"
    echo "  - Health Check: https://$DOMAIN/api/health"
    echo
    log_info "Useful commands:"
    echo "  - View logs: pm2 logs erp-backend"
    echo "  - Restart app: pm2 restart erp-backend"
    echo "  - Monitor: pm2 monit"
    echo "  - Nginx status: sudo systemctl status nginx"
}

# Run main function
main "$@"