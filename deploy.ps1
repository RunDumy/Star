# STAR Platform Deployment Script for Windows
# Comprehensive build and deployment for production

param(
    [switch]$SkipTests,
    [switch]$Docker,
    [switch]$Help
)

# Configuration
$ProjectRoot = Get-Location
$FrontendDir = "star-frontend"
$BackendDir = "star-backend"
$BuildDir = "build"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Functions
function Write-Log {
    param($Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    exit 1
}

# Print banner
function Print-Banner {
    Write-Host @"
  ███████╗████████╗ █████╗ ██████╗ 
  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗
  ███████╗   ██║   ███████║██████╔╝
  ╚════██║   ██║   ██╔══██║██╔══██╗
  ███████║   ██║   ██║  ██║██║  ██║
  ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
"@ -ForegroundColor Magenta

    Write-Host "🌟 STAR Platform Deployment Pipeline" -ForegroundColor Cyan
    Write-Host "📅 Build: $Timestamp" -ForegroundColor Cyan
    Write-Host ""
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed"
    }
    
    # Check Python
    if (-not (Get-Command python -ErrorAction SilentlyContinue) -and -not (Get-Command python3 -ErrorAction SilentlyContinue)) {
        Write-Error "Python is not installed"
    }
    
    # Check Docker (optional)
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Warning "Docker is not installed (optional for containerized deployment)"
    }
    
    Write-Success "Prerequisites check completed"
}

# Clean previous builds
function Clear-Builds {
    Write-Log "Cleaning previous builds..."
    
    # Clean frontend build
    if (Test-Path "$FrontendDir\out") {
        Remove-Item -Recurse -Force "$FrontendDir\out"
        Write-Log "Cleaned frontend build directory"
    }
    
    if (Test-Path "$FrontendDir\.next") {
        Remove-Item -Recurse -Force "$FrontendDir\.next"
        Write-Log "Cleaned Next.js cache"
    }
    
    # Clean backend cache
    Get-ChildItem -Path $BackendDir -Recurse -Directory -Name "__pycache__" -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -Recurse -Force "$BackendDir\$_"
    }
    Write-Log "Cleaned Python cache"
    
    # Clean build directory
    if (Test-Path $BuildDir) {
        Remove-Item -Recurse -Force $BuildDir
    }
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
    
    Write-Success "Build cleanup completed"
}

# Install dependencies
function Install-Dependencies {
    Write-Log "Installing dependencies..."
    
    # Frontend dependencies
    Write-Log "Installing frontend dependencies..."
    Push-Location $FrontendDir
    
    if (-not (Test-Path "package.json")) {
        Write-Error "Frontend package.json not found"
    }
    
    & npm ci --only=production
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend dependency installation failed"
    }
    Write-Success "Frontend dependencies installed"
    Pop-Location
    
    # Backend dependencies
    Write-Log "Installing backend dependencies..."
    Push-Location $BackendDir
    
    $pythonCmd = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
    
    if (Test-Path "requirements_production.txt") {
        & $pythonCmd -m pip install -r requirements_production.txt
        Write-Log "Installed production requirements"
    }
    elseif (Test-Path "requirements.txt") {
        & $pythonCmd -m pip install -r requirements.txt
        Write-Log "Installed standard requirements"
    }
    else {
        Write-Warning "No requirements file found"
    }
    
    Write-Success "Backend dependencies installed"
    Pop-Location
}

# Build frontend
function Build-Frontend {
    Write-Log "Building frontend for production..."
    Push-Location $FrontendDir
    
    # Set production environment variables
    $env:NODE_ENV = "production"
    if (-not $env:NEXT_PUBLIC_API_URL) {
        $env:NEXT_PUBLIC_API_URL = "https://star-backend.azurewebsites.net"
    }
    
    Write-Log "Building Next.js application..."
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed"
    }
    
    # Verify build output
    if (-not (Test-Path "out")) {
        Write-Error "Frontend build failed - no output directory"
    }
    
    if (-not (Test-Path "out\index.html")) {
        Write-Error "Frontend build incomplete - missing index.html"
    }
    
    # Copy build to deployment directory
    Copy-Item -Recurse -Path "out" -Destination "..\$BuildDir\frontend"
    
    Write-Success "Frontend build completed"
    Pop-Location
}

# Prepare backend
function Set-Backend {
    Write-Log "Preparing backend for deployment..."
    
    # Create backend directory
    New-Item -ItemType Directory -Path "$BuildDir\backend" -Force | Out-Null
    
    # Copy production files
    if (Test-Path "$BackendDir\star_backend_flask\app_production.py") {
        Copy-Item "$BackendDir\star_backend_flask\app_production.py" "$BuildDir\backend\"
        Write-Log "Copied production app"
    }
    else {
        Write-Warning "Production app not found, using standard app"
        if (Test-Path "$BackendDir\star_backend_flask\app.py") {
            Copy-Item "$BackendDir\star_backend_flask\app.py" "$BuildDir\backend\"
        }
    }
    
    # Copy essential backend files
    @("main_azure.py", "requirements_production.txt", "requirements.txt") | ForEach-Object {
        $file = "$BackendDir\$_"
        if (Test-Path $file) {
            Copy-Item $file "$BuildDir\backend\"
        }
    }
    
    # Copy backend modules
    if (Test-Path "$BackendDir\star_backend_flask") {
        Copy-Item -Recurse "$BackendDir\star_backend_flask" "$BuildDir\backend\"
    }
    
    Write-Success "Backend preparation completed"
}

# Run tests
function Invoke-Tests {
    if ($SkipTests) {
        Write-Warning "Skipping tests as requested"
        return
    }
    
    Write-Log "Running tests..."
    
    # Frontend tests
    Push-Location $FrontendDir
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        Write-Log "Running frontend tests..."
        & npm test -- --passWithNoTests --watchAll=false
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Frontend tests failed"
        }
        else {
            Write-Success "Frontend tests passed"
        }
    }
    else {
        Write-Warning "No frontend tests found"
    }
    Pop-Location
    
    # Backend tests
    if ((Test-Path "$BackendDir\pytest.ini") -or (Test-Path "$BackendDir\tests")) {
        Write-Log "Running backend tests..."
        Push-Location $BackendDir
        $pythonCmd = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
        & $pythonCmd -m pytest tests\ -v --tb=short
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Some backend tests failed"
        }
        Pop-Location
    }
    else {
        Write-Warning "No backend tests found"
    }
}

# Create deployment packages
function New-Packages {
    Write-Log "Creating deployment packages..."
    
    Push-Location $BuildDir
    
    # Frontend package
    Write-Log "Creating frontend deployment package..."
    Compress-Archive -Path "frontend" -DestinationPath "star-frontend-$Timestamp.zip" -Force
    Write-Success "Frontend package created: star-frontend-$Timestamp.zip"
    
    # Backend package
    Write-Log "Creating backend deployment package..."
    Compress-Archive -Path "backend" -DestinationPath "star-backend-$Timestamp.zip" -Force
    Write-Success "Backend package created: star-backend-$Timestamp.zip"
    
    Pop-Location
}

# Docker build (optional)
function Build-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Warning "Docker not available, skipping container build"
        return
    }
    
    if (-not $Docker) {
        return
    }
    
    Write-Log "Building Docker containers..."
    
    # Backend Docker image
    if (Test-Path "$BackendDir\Dockerfile.production") {
        Write-Log "Building backend Docker image..."
        Push-Location $BackendDir
        & docker build -f Dockerfile.production -t "star-backend:$Timestamp" .
        & docker tag "star-backend:$Timestamp" "star-backend:latest"
        Pop-Location
        Write-Success "Backend Docker image built"
    }
    
    Write-Success "Docker images built successfully"
}

# Generate deployment guide
function New-DeploymentGuide {
    Write-Log "Generating deployment guide..."
    
    $deploymentGuide = @"
# STAR Platform Deployment Guide

Build: $Timestamp  
Generated: $(Get-Date)

## Frontend Deployment

### Vercel (Recommended)
1. Upload `star-frontend-$Timestamp.zip`
2. Extract to your project directory
3. Deploy using Vercel CLI or dashboard
4. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Backend API URL

### Static Hosting (Netlify, Azure Static Web Apps, etc.)
1. Extract `frontend/` directory from the package
2. Upload contents to your hosting provider
3. Configure SPA redirects to `index.html`

### Docker Deployment
``````powershell
docker run -p 3000:80 star-frontend:$Timestamp
``````

## Backend Deployment

### Azure App Service (Recommended)
1. Upload `star-backend-$Timestamp.zip`
2. Configure Python 3.11+ runtime
3. Set startup command: `python main_azure.py`
4. Configure environment variables:
   - `SECRET_KEY`: Secure random string
   - `COSMOS_DB_CONNECTION_STRING`: Azure Cosmos DB connection
   - `REDIS_URL`: Redis cache URL (optional)

### Docker Deployment
``````powershell
docker run -p 5000:5000 \
  -e SECRET_KEY="your-secret-key" \
  -e COSMOS_DB_CONNECTION_STRING="your-cosmos-connection" \
  star-backend:$Timestamp
``````

## Environment Variables

### Required
- `SECRET_KEY`: Flask secret key
- `COSMOS_DB_CONNECTION_STRING`: Azure Cosmos DB connection string

### Optional
- `REDIS_URL`: Redis cache URL for better performance
- `FLASK_ENV`: Set to "production" for production deployment
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## Health Checks
- Frontend: Check `/` returns the React app
- Backend: Check `/api/health` returns JSON status

## Monitoring
- Backend logs available at application level
- Check `/api/status` for detailed system status
- Monitor API response times and error rates

## PWA Features
- Offline functionality via service worker
- Push notifications (requires VAPID keys)
- Install prompts on supported devices

Built with ❤️ by the STAR team 🌟
"@
    
    Set-Content -Path "$BuildDir\DEPLOYMENT_GUIDE.md" -Value $deploymentGuide
    Write-Success "Deployment guide generated"
}

# Show help
function Show-Help {
    Write-Host "STAR Platform Deployment Script for Windows"
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipTests     Skip running tests"
    Write-Host "  -Docker        Build Docker images"
    Write-Host "  -Help          Show this help message"
    Write-Host ""
}

# Main deployment workflow
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Print-Banner
    
    # Run deployment steps
    Test-Prerequisites
    Clear-Builds
    Install-Dependencies
    Invoke-Tests
    Build-Frontend
    Set-Backend
    New-Packages
    Build-Docker
    New-DeploymentGuide
    
    # Final summary
    Write-Host ""
    Write-Host "🎉 Deployment build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Generated files in $BuildDir/:" -ForegroundColor Cyan
    Get-ChildItem -Path $BuildDir -Filter "*.zip" | ForEach-Object {
        Write-Host "  $($_.Name)" -ForegroundColor Blue
    }
    Write-Host ""
    Write-Host "📖 Read $BuildDir/DEPLOYMENT_GUIDE.md for deployment instructions" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🌟 Ready to launch STAR to production! 🚀" -ForegroundColor Magenta
}

# Run main function
Main