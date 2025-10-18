@echo off
REM STAR Platform Deployment Script
REM This script helps deploy the STAR platform to Vercel + Fly.io + Supabase

echo ========================================
echo   STAR Platform Deployment Script
echo ========================================
echo.

REM Check if required tools are installed
echo Checking required tools...

where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Supabase CLI is not installed.
    echo Please install it from: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

where fly >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Fly CLI is not installed.
    echo Please install it from: https://fly.io/docs/hands-on/install-flyctl/
    pause
    exit /b 1
)

where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Vercel CLI is not installed.
    echo Please install it with: npm install -g vercel
    pause
    exit /b 1
)

echo All required tools are installed.
echo.

REM Step 1: Supabase Setup
echo ========================================
echo Step 1: Setting up Supabase
echo ========================================
echo.

set /p SUPABASE_PROJECT="Enter your Supabase project reference (from https://supabase.com/dashboard): "
if "%SUPABASE_PROJECT%"=="" (
    echo ERROR: Supabase project reference is required.
    pause
    exit /b 1
)

echo Supabase project: %SUPABASE_PROJECT%
echo.

REM Initialize Supabase locally (optional)
echo Initializing Supabase locally...
supabase init
if %errorlevel% neq 0 (
    echo WARNING: Local Supabase init failed. Continuing with deployment...
)

echo.
echo Please complete these Supabase setup steps manually:
echo 1. Go to https://supabase.com/dashboard
echo 2. Create a new project or use existing: %SUPABASE_PROJECT%
echo 3. Go to SQL Editor and run the contents of supabase_schema.sql
echo 4. Go to Settings ^> API and copy your project URL and anon key
echo.
pause

REM Step 2: Environment Variables Setup
echo ========================================
echo Step 2: Setting up Environment Variables
echo ========================================
echo.

if not exist ".env.template" (
    echo ERROR: .env.template file not found.
    pause
    exit /b 1
)

echo Copying environment template...
copy .env.template .env.local
copy .env.template star-backend\.env

echo.
echo IMPORTANT: Edit the following files with your actual values:
echo - .env.local (for frontend)
echo - star-backend\.env (for backend)
echo.
echo Required values to fill in:
echo - SUPABASE_URL
echo - SUPABASE_ANON_KEY
echo - AGORA_APP_ID (from https://console.agora.io)
echo.
pause

REM Step 3: Backend Deployment to Fly.io
echo ========================================
echo Step 3: Deploying Backend to Fly.io
echo ========================================
echo.

cd star-backend

echo Logging into Fly.io...
fly auth login

set /p FLY_APP_NAME="Enter your Fly.io app name (or press Enter for 'star-backend'): "
if "%FLY_APP_NAME%"=="" set FLY_APP_NAME=star-backend

echo Deploying to Fly.io app: %FLY_APP_NAME%

REM Update fly.toml with app name
powershell -Command "(Get-Content fly.toml) -replace 'app = \"star-backend\"', 'app = \"%FLY_APP_NAME%\"' | Set-Content fly.toml"

echo Deploying backend...
fly launch --copy-config
if %errorlevel% neq 0 (
    echo ERROR: Backend deployment failed.
    cd ..
    pause
    exit /b 1
)

echo Backend deployed successfully!
fly status

cd ..
echo.

REM Step 4: Frontend Deployment to Vercel
echo ========================================
echo Step 4: Deploying Frontend to Vercel
echo ========================================
echo.

cd star-frontend

echo Logging into Vercel...
vercel login

echo Deploying frontend...
vercel --prod
if %errorlevel% neq 0 (
    echo ERROR: Frontend deployment failed.
    cd ..
    pause
    exit /b 1
)

echo Frontend deployed successfully!

REM Get deployment URLs
for /f "tokens=*" %%i in ('vercel --ls ^| findstr "https://"') do set VERCEL_URL=%%i

cd ..
echo.

REM Step 5: Final Configuration
echo ========================================
echo Step 5: Final Configuration
echo ========================================
echo.

echo Deployment Summary:
echo ===================
echo Backend (Fly.io): https://%FLY_APP_NAME%.fly.dev
if defined VERCEL_URL (
    echo Frontend (Vercel): %VERCEL_URL%
) else (
    echo Frontend (Vercel): Check Vercel dashboard for URL
)
echo Supabase: https://%SUPABASE_PROJECT%.supabase.co
echo.

echo Next Steps:
echo ===========
echo 1. Update your frontend .env.local with the backend URL
echo 2. Update vercel.json with the correct backend URL
echo 3. Test the deployed application
echo 4. Set up custom domain if needed
echo.

echo Deployment completed successfully!
echo.

pause