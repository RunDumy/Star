# PowerShell script to setup and run STAR backend locally with Docker

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "STAR Backend Docker Setup" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    $null = docker info
    Write-Host "[INFO] Docker is running." -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Set environment variables for Docker Compose
Write-Host "[INFO] Setting up environment variables..." -ForegroundColor Yellow
$env:REDIS_URL = "redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341"
$env:REDIS_HOST = "redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com"
$env:REDIS_PORT = "11341"
$env:REDIS_USERNAME = "default"
$env:REDIS_PASSWORD = "dpQqYc6wimd8CoOazLDvrE6TlNt4un6b"
$env:COSMOS_ENDPOINT = "https://star-cosmos.documents.azure.com:443/"
$env:COSMOS_KEY = "your-cosmos-key-here"
$env:SECRET_KEY = "8d6448401426f23350520f5b4d4dadb088a9e6be0fb2ecc86a206b7cb358b722"
$env:JWT_SECRET_KEY = "55bd7933fcfd0f10912b92788a36e0124a2e7c2330b586bfae32d2d28e9da16e"
$env:JWT_ALGORITHM = "HS256"
$env:AGORA_APP_ID = "d146ac692e604e7b9a99c9568ccbcd23"
$env:AGORA_APP_CERTIFICATE = "f5e4c9a8466141d588644f9043ce4a84"
$env:SPOTIPY_CLIENT_ID = "dcc37439570a47b1a79db76e3bd35a22"
$env:SPOTIPY_CLIENT_SECRET = "c2e06d864bca407bab4a6dfbf80993d5"
$env:ALLOWED_ORIGINS = "http://localhost:3000"
$env:PORT = "5000"
$env:PYTHON_VERSION = "3.13.4"

# Navigate to Docker Compose directory
Set-Location -Path "..\..\config\docker"

Write-Host "[INFO] Building and starting Docker containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up --build -d star-backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start Docker containers." -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Docker containers started successfully." -ForegroundColor Green
Write-Host "[INFO] Backend is running at http://localhost:5000" -ForegroundColor Green

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "To check logs, run: docker-compose logs -f star-backend" -ForegroundColor Magenta
Write-Host "To stop the containers, run: docker-compose down" -ForegroundColor Magenta
Write-Host "===================================================" -ForegroundColor Cyan

# Test the API health endpoint
Write-Host "[INFO] Testing API health endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Invoke-RestMethod -Uri "http://localhost:5000/api/health"

Write-Host ""
Write-Host "[INFO] Setup complete!" -ForegroundColor Green