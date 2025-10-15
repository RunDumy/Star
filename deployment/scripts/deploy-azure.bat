@echo off
echo 🚀 STAR Platform - Azure App Service Deployment
echo.
echo This script builds the frontend and deploys the complete app to Azure App Service
echo where Flask serves both the API and the React frontend.
echo.

REM Step 1: Build Frontend
echo ✅ Step 1: Building Next.js Frontend...
cd /d "C:\Users\fudos\PycharmProjects\Star\star-frontend"
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

REM Step 2: Copy Frontend to Backend
echo ✅ Step 2: Copying frontend to backend static folder...
robocopy "C:\Users\fudos\PycharmProjects\Star\star-frontend\out" "C:\Users\fudos\PycharmProjects\Star\star-backend\star_backend_flask\static" /E /Y >nul
if errorlevel 8 (
    echo ❌ File copy failed!
    pause
    exit /b 1
)

REM Step 3: Navigate to Backend
cd /d "C:\Users\fudos\PycharmProjects\Star\star-backend"

echo ✅ Step 3: Deployment Options:
echo.
echo 📦 Option 1: Azure CLI Deployment
echo    az webapp up --name your-app-name --resource-group your-rg --location eastus
echo.
echo 📦 Option 2: Git Deployment 
echo    git add .
echo    git commit -m "Deploy combined frontend + backend"
echo    git push azure main
echo.
echo 📦 Option 3: ZIP Deployment
echo    Zip the star-backend folder and upload via Azure Portal
echo.
echo 🧪 Option 4: Test Locally First
echo    cd star-backend/star_backend_flask
echo    python app.py
echo    Open: http://localhost:5000 (serves both API and frontend)
echo.

echo 📁 Files ready for deployment in: star-backend/
echo 🌐 Frontend will be served from: https://your-app.azurewebsites.net/
echo 🔌 API endpoints available at: https://your-app.azurewebsites.net/api/*
echo.

REM Step 4: Test Local Server Option
echo 🧪 Would you like to test locally first? (y/n)
set /p test_local=
if /i "%test_local%"=="y" (
    echo Starting local Flask server...
    cd /d "C:\Users\fudos\PycharmProjects\Star\star-backend\star_backend_flask"
    python app.py
) else (
    echo Skipping local test. Deploy to Azure when ready!
)

pause