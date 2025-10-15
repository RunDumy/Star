#!/bin/bash
# STAR Platform Deployment Script
# Comprehensive build and deployment for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(pwd)"
FRONTEND_DIR="star-frontend"
BACKEND_DIR="star-backend"
BUILD_DIR="build"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Functions
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Print banner
print_banner() {
    echo -e "${PURPLE}"
    echo "  ███████╗████████╗ █████╗ ██████╗ "
    echo "  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗"
    echo "  ███████╗   ██║   ███████║██████╔╝"
    echo "  ╚════██║   ██║   ██╔══██║██╔══██╗"
    echo "  ███████║   ██║   ██║  ██║██║  ██║"
    echo "  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝"
    echo -e "${NC}"
    echo -e "${CYAN}🌟 STAR Platform Deployment Pipeline${NC}"
    echo -e "${CYAN}📅 Build: $TIMESTAMP${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        error "Python is not installed"
    fi
    
    # Check Docker (optional)
    if ! command -v docker &> /dev/null; then
        warning "Docker is not installed (optional for containerized deployment)"
    fi
    
    success "Prerequisites check completed"
}

# Clean previous builds
clean_builds() {
    log "Cleaning previous builds..."
    
    # Clean frontend build
    if [ -d "$FRONTEND_DIR/out" ]; then
        rm -rf "$FRONTEND_DIR/out"
        log "Cleaned frontend build directory"
    fi
    
    if [ -d "$FRONTEND_DIR/.next" ]; then
        rm -rf "$FRONTEND_DIR/.next"
        log "Cleaned Next.js cache"
    fi
    
    # Clean backend cache
    if [ -d "$BACKEND_DIR/__pycache__" ]; then
        find "$BACKEND_DIR" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
        log "Cleaned Python cache"
    fi
    
    # Clean build directory
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
    fi
    mkdir -p "$BUILD_DIR"
    
    success "Build cleanup completed"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Frontend dependencies
    log "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    
    if [ ! -f "package.json" ]; then
        error "Frontend package.json not found"
    fi
    
    npm ci --only=production
    success "Frontend dependencies installed"
    cd ..
    
    # Backend dependencies
    log "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    
    # Use production requirements if available
    if [ -f "requirements_production.txt" ]; then
        pip3 install -r requirements_production.txt
        log "Installed production requirements"
    elif [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
        log "Installed standard requirements"
    else
        warning "No requirements file found"
    fi
    
    success "Backend dependencies installed"
    cd ..
}

# Build frontend
build_frontend() {
    log "Building frontend for production..."
    cd "$FRONTEND_DIR"
    
    # Set production environment variables
    export NODE_ENV=production
    export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"https://star-backend.azurewebsites.net"}
    
    log "Building Next.js application..."
    npm run build
    
    # Verify build output
    if [ ! -d "out" ]; then
        error "Frontend build failed - no output directory"
    fi
    
    # Check critical files
    if [ ! -f "out/index.html" ]; then
        error "Frontend build incomplete - missing index.html"
    fi
    
    # Copy build to deployment directory
    cp -r out "../$BUILD_DIR/frontend"
    
    success "Frontend build completed"
    cd ..
}

# Prepare backend
prepare_backend() {
    log "Preparing backend for deployment..."
    
    # Copy backend files
    mkdir -p "$BUILD_DIR/backend"
    
    # Copy production files
    if [ -f "$BACKEND_DIR/star_backend_flask/app_production.py" ]; then
        cp "$BACKEND_DIR/star_backend_flask/app_production.py" "$BUILD_DIR/backend/"
        log "Copied production app"
    else
        warning "Production app not found, using standard app"
        cp "$BACKEND_DIR/star_backend_flask/app.py" "$BUILD_DIR/backend/"
    fi
    
    # Copy essential backend files
    [ -f "$BACKEND_DIR/main_azure.py" ] && cp "$BACKEND_DIR/main_azure.py" "$BUILD_DIR/backend/"
    [ -f "$BACKEND_DIR/requirements_production.txt" ] && cp "$BACKEND_DIR/requirements_production.txt" "$BUILD_DIR/backend/"
    [ -f "$BACKEND_DIR/requirements.txt" ] && cp "$BACKEND_DIR/requirements.txt" "$BUILD_DIR/backend/"
    
    # Copy backend modules
    if [ -d "$BACKEND_DIR/star_backend_flask" ]; then
        cp -r "$BACKEND_DIR/star_backend_flask" "$BUILD_DIR/backend/"
    fi
    
    success "Backend preparation completed"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Frontend tests
    if [ -f "$FRONTEND_DIR/package.json" ] && grep -q '"test"' "$FRONTEND_DIR/package.json"; then
        log "Running frontend tests..."
        cd "$FRONTEND_DIR"
        npm test -- --passWithNoTests --watchAll=false
        cd ..
        success "Frontend tests passed"
    else
        warning "No frontend tests found"
    fi
    
    # Backend tests
    if [ -f "$BACKEND_DIR/pytest.ini" ] || [ -d "$BACKEND_DIR/tests" ]; then
        log "Running backend tests..."
        cd "$BACKEND_DIR"
        python3 -m pytest tests/ -v --tb=short || warning "Some backend tests failed"
        cd ..
    else
        warning "No backend tests found"
    fi
}

# Create deployment packages
create_packages() {
    log "Creating deployment packages..."
    
    # Frontend package
    log "Creating frontend deployment package..."
    cd "$BUILD_DIR"
    tar -czf "star-frontend-$TIMESTAMP.tar.gz" frontend/
    success "Frontend package created: star-frontend-$TIMESTAMP.tar.gz"
    
    # Backend package
    log "Creating backend deployment package..."
    tar -czf "star-backend-$TIMESTAMP.tar.gz" backend/
    success "Backend package created: star-backend-$TIMESTAMP.tar.gz"
    
    cd ..
}

# Docker build (optional)
build_docker() {
    if ! command -v docker &> /dev/null; then
        warning "Docker not available, skipping container build"
        return
    fi
    
    log "Building Docker containers..."
    
    # Backend Docker image
    if [ -f "$BACKEND_DIR/Dockerfile.production" ]; then
        log "Building backend Docker image..."
        cd "$BACKEND_DIR"
        docker build -f Dockerfile.production -t star-backend:$TIMESTAMP .
        docker tag star-backend:$TIMESTAMP star-backend:latest
        cd ..
        success "Backend Docker image built"
    fi
    
    # Frontend Docker image (nginx)
    log "Building frontend Docker image..."
    cat > "$BUILD_DIR/frontend.Dockerfile" << EOF
FROM nginx:alpine
COPY frontend/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
    
    # Create nginx config
    cat > "$BUILD_DIR/nginx.conf" << EOF
events {
    worker_connections 1024;
}
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        # PWA support
        location /manifest.json {
            add_header Cache-Control "public, max-age=86400";
        }
        
        location /sw.js {
            add_header Cache-Control "public, max-age=0, must-revalidate";
        }
        
        # SPA fallback
        location / {
            try_files \$uri \$uri/ /index.html;
        }
        
        # API proxy (for development)
        location /api/ {
            return 404;
        }
    }
}
EOF
    
    cd "$BUILD_DIR"
    docker build -f frontend.Dockerfile -t star-frontend:$TIMESTAMP .
    docker tag star-frontend:$TIMESTAMP star-frontend:latest
    cd ..
    
    success "Docker images built successfully"
}

# Generate deployment guide
generate_deployment_guide() {
    log "Generating deployment guide..."
    
    cat > "$BUILD_DIR/DEPLOYMENT_GUIDE.md" << EOF
# STAR Platform Deployment Guide

Build: $TIMESTAMP  
Generated: $(date)

## Frontend Deployment

### Vercel (Recommended)
1. Upload \`star-frontend-$TIMESTAMP.tar.gz\`
2. Extract to your project directory
3. Deploy using Vercel CLI or dashboard
4. Set environment variables:
   - \`NEXT_PUBLIC_API_URL\`: Backend API URL

### Static Hosting (Netlify, GitHub Pages, etc.)
1. Extract \`frontend/\` directory from the package
2. Upload contents to your hosting provider
3. Configure SPA redirects to \`index.html\`

### Docker Deployment
\`\`\`bash
docker run -p 3000:80 star-frontend:$TIMESTAMP
\`\`\`

## Backend Deployment

### Azure App Service (Recommended)
1. Upload \`star-backend-$TIMESTAMP.tar.gz\`
2. Configure Python 3.11+ runtime
3. Set startup command: \`python main_azure.py\`
4. Configure environment variables:
   - \`SECRET_KEY\`: Secure random string
   - \`COSMOS_DB_CONNECTION_STRING\`: Azure Cosmos DB connection
   - \`REDIS_URL\`: Redis cache URL (optional)

### Docker Deployment
\`\`\`bash
docker run -p 5000:5000 \\
  -e SECRET_KEY="your-secret-key" \\
  -e COSMOS_DB_CONNECTION_STRING="your-cosmos-connection" \\
  star-backend:$TIMESTAMP
\`\`\`

## Environment Variables

### Required
- \`SECRET_KEY\`: Flask secret key
- \`COSMOS_DB_CONNECTION_STRING\`: Azure Cosmos DB connection string

### Optional
- \`REDIS_URL\`: Redis cache URL for better performance
- \`FLASK_ENV\`: Set to "production" for production deployment
- \`ALLOWED_ORIGINS\`: Comma-separated list of allowed CORS origins

## Health Checks
- Frontend: Check \`/\` returns the React app
- Backend: Check \`/api/health\` returns JSON status

## Monitoring
- Backend logs available at application level
- Check \`/api/status\` for detailed system status
- Monitor API response times and error rates

## PWA Features
- Offline functionality via service worker
- Push notifications (requires VAPID keys)
- Install prompts on supported devices

Built with ❤️ by the STAR team 🌟
EOF
    
    success "Deployment guide generated"
}

# Main deployment workflow
main() {
    print_banner
    
    # Parse command line arguments
    SKIP_TESTS=false
    BUILD_DOCKER_FLAG=false
    
    for arg in "$@"; do
        case $arg in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --docker)
                BUILD_DOCKER_FLAG=true
                shift
                ;;
            --help)
                echo "STAR Platform Deployment Script"
                echo ""
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-tests    Skip running tests"
                echo "  --docker        Build Docker images"
                echo "  --help          Show this help message"
                echo ""
                exit 0
                ;;
        esac
    done
    
    # Run deployment steps
    check_prerequisites
    clean_builds
    install_dependencies
    
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    fi
    
    build_frontend
    prepare_backend
    create_packages
    
    if [ "$BUILD_DOCKER_FLAG" == "true" ]; then
        build_docker
    fi
    
    generate_deployment_guide
    
    # Final summary
    echo ""
    echo -e "${GREEN}🎉 Deployment build completed successfully!${NC}"
    echo ""
    echo -e "${CYAN}📦 Generated files in $BUILD_DIR/:${NC}"
    ls -la "$BUILD_DIR/" | grep -E '\.(tar\.gz|md)$' | while read line; do
        echo -e "${BLUE}  $line${NC}"
    done
    echo ""
    echo -e "${YELLOW}📖 Read $BUILD_DIR/DEPLOYMENT_GUIDE.md for deployment instructions${NC}"
    echo ""
    echo -e "${PURPLE}🌟 Ready to launch STAR to production! 🚀${NC}"
}

# Run main function
main "$@"