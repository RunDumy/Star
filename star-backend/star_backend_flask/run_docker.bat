@echo off
REM Setup and run the STAR backend locally with Docker

echo ===================================================
echo STAR Backend Docker Setup
echo ===================================================

REM Check if Docker is running
docker info > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    exit /b 1
)

echo [INFO] Docker is running.

REM Set environment variables for Docker Compose
echo [INFO] Setting up environment variables...
set REDIS_URL=redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341
set REDIS_HOST=redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com
set REDIS_PORT=11341
set REDIS_USERNAME=default
set REDIS_PASSWORD=dpQqYc6wimd8CoOazLDvrE6TlNt4un6b
set SUPABASE_URL=https://hiwmpmvqcxzshdmhhlsb.supabase.co
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpd21wbXZxY3h6c2hkbWhobHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NDAzMjcsImV4cCI6MjA3NDUxNjMyN30.RXa8Bx3Pwy9Du2j-XD8WaGDjuCVe9H-PLTgMLJa11ZE
set SECRET_KEY=8d6448401426f23350520f5b4d4dadb088a9e6be0fb2ecc86a206b7cb358b722
set JWT_SECRET=55bd7933fcfd0f10912b92788a36e0124a2e7c2330b586bfae32d2d28e9da16e
set JWT_ALGORITHM=HS256
set AGORA_APP_ID=d146ac692e604e7b9a99c9568ccbcd23
set AGORA_APP_CERTIFICATE=f5e4c9a8466141d588644f9043ce4a84
set SPOTIPY_CLIENT_ID=dcc37439570a47b1a79db76e3bd35a22
set SPOTIPY_CLIENT_SECRET=c2e06d864bca407bab4a6dfbf80993d5
set ALLOWED_ORIGINS=http://localhost:3000
set PORT=5000
set PYTHON_VERSION=3.13.4

REM Navigate to Docker Compose directory
cd ..\..\config\docker

echo [INFO] Building and starting Docker containers...
docker-compose -f docker-compose.yml up --build -d star-backend

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start Docker containers.
    exit /b 1
)

echo [INFO] Docker containers started successfully.
echo [INFO] Backend is running at http://localhost:5000

echo ===================================================
echo To check logs, run: docker-compose logs -f star-backend
echo To stop the containers, run: docker-compose down
echo ===================================================

REM Test the API health endpoint
echo [INFO] Testing API health endpoint...
timeout /t 5 /nobreak > nul
curl -s http://localhost:5000/api/health

echo.
echo [INFO] Setup complete!