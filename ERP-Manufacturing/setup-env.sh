#!/bin/bash

# ==============================================
# Manufacturing ERP - Environment Setup Script
# ==============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏭 Manufacturing ERP - Environment Setup${NC}"
echo "=========================================="

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create environment file from template
create_env_from_template() {
    local dir=$1
    local env_type=${2:-"development"}
    
    cd "$dir"
    
    if [ "$env_type" = "production" ]; then
        if [ -f ".env.production" ] && [ ! -f ".env" ]; then
            cp .env.production .env
            print_status "Created .env from .env.production template in $dir"
        elif [ ! -f ".env" ]; then
            cp .env.example .env
            print_warning "Created .env from .env.example in $dir (consider using .env.production for production)"
        fi
    else
        if [ -f ".env.example" ] && [ ! -f ".env" ]; then
            cp .env.example .env
            print_status "Created .env from .env.example template in $dir"
        fi
    fi
    
    cd - > /dev/null
}

# Function to validate backend environment
validate_backend_env() {
    print_info "Validating backend environment..."
    
    cd backend
    
    if [ ! -f ".env" ]; then
        print_error "Backend .env file not found"
        return 1
    fi
    
    # Source the .env file
    set -a
    source .env
    set +a
    
    # Check required variables
    required_vars=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_status "Backend environment validation passed"
    else
        print_error "Missing required backend environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    cd - > /dev/null
}

# Function to validate frontend environment
validate_frontend_env() {
    print_info "Validating frontend environment..."
    
    cd frontend
    
    if [ ! -f ".env" ]; then
        print_error "Frontend .env file not found"
        return 1
    fi
    
    # Source the .env file
    set -a
    source .env
    set +a
    
    # Check required variables
    if [ -z "$REACT_APP_API_URL" ] || [ -z "$REACT_APP_SOCKET_URL" ]; then
        print_error "Missing required frontend environment variables: REACT_APP_API_URL, REACT_APP_SOCKET_URL"
        return 1
    fi
    
    print_status "Frontend environment validation passed"
    
    cd - > /dev/null
}

# Function to check system dependencies
check_dependencies() {
    print_info "Checking system dependencies..."
    
    # Check Node.js
    if command_exists node; then
        node_version=$(node -v)
        print_status "Node.js found: $node_version"
    else
        print_error "Node.js not found. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        npm_version=$(npm -v)
        print_status "npm found: $npm_version"
    else
        print_error "npm not found. Please install npm"
        exit 1
    fi
    
    # Check PostgreSQL
    if command_exists psql; then
        psql_version=$(psql --version | head -n1)
        print_status "PostgreSQL found: $psql_version"
    else
        print_warning "PostgreSQL not found. Please install PostgreSQL 12+"
    fi
    
    # Check Redis (optional)
    if command_exists redis-cli; then
        print_status "Redis found (optional but recommended)"
    else
        print_warning "Redis not found (optional for caching)"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing project dependencies..."
    
    # Backend dependencies
    print_info "Installing backend dependencies..."
    cd backend
    if [ -f "package.json" ]; then
        npm install
        print_status "Backend dependencies installed"
    else
        print_error "Backend package.json not found"
        exit 1
    fi
    cd - > /dev/null
    
    # Frontend dependencies
    print_info "Installing frontend dependencies..."
    cd frontend
    if [ -f "package.json" ]; then
        npm install
        print_status "Frontend dependencies installed"
    else
        print_error "Frontend package.json not found"
        exit 1
    fi
    cd - > /dev/null
}

# Function to setup database
setup_database() {
    print_info "Setting up database..."
    
    cd backend
    
    # Source backend env
    set -a
    source .env
    set +a
    
    # Check if database exists
    if command_exists psql; then
        print_info "Checking database connection..."
        
        # Try to connect to database
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
            print_status "Database connection successful"
        else
            print_warning "Cannot connect to database. Please ensure:"
            echo "  - PostgreSQL is running"
            echo "  - Database '$DB_NAME' exists"
            echo "  - User '$DB_USER' has proper permissions"
        fi
    fi
    
    cd - > /dev/null
}

# Function to create basic directory structure
create_directories() {
    print_info "Creating necessary directories..."
    
    # Backend directories
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p backend/backups
    
    # Frontend build directory (for production)
    mkdir -p frontend/build
    
    print_status "Directory structure created"
}

# Main function
main() {
    echo ""
    print_info "Starting environment setup..."
    echo ""
    
    # Parse command line arguments
    ENV_TYPE="development"
    SKIP_DEPS=false
    SKIP_VALIDATION=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --production)
                ENV_TYPE="production"
                shift
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-validation)
                SKIP_VALIDATION=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --production      Setup for production environment"
                echo "  --skip-deps       Skip dependency installation"
                echo "  --skip-validation Skip environment validation"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    print_info "Environment type: $ENV_TYPE"
    echo ""
    
    # Check system dependencies
    check_dependencies
    echo ""
    
    # Create environment files
    print_info "Setting up environment files..."
    create_env_from_template "backend" "$ENV_TYPE"
    create_env_from_template "frontend" "$ENV_TYPE"
    echo ""
    
    # Create directories
    create_directories
    echo ""
    
    # Install dependencies
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
        echo ""
    fi
    
    # Validate environment
    if [ "$SKIP_VALIDATION" = false ]; then
        validate_backend_env
        validate_frontend_env
        echo ""
    fi
    
    # Setup database
    setup_database
    echo ""
    
    # Final message
    print_status "Environment setup completed!"
    echo ""
    print_info "Next steps:"
    echo "1. Edit backend/.env with your database credentials"
    echo "2. Edit frontend/.env with your API URL"
    echo "3. Run 'npm run dev' in backend directory"
    echo "4. Run 'npm start' in frontend directory"
    echo ""
    print_info "For production deployment, run: ./deploy.sh"
}

# Run main function
main "$@"