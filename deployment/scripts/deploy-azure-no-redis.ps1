# STAR Platform - Azure App Service Deployment Script (No Redis)
# Optimized for F1 tier deployment

param(
    [string]$AppName = "star-app-backend",
    [string]$ResourceGroup = "star-app-rg-centralus"
)

$ErrorActionPreference = "Stop"

Write-Host "🌟 STAR Platform - Azure Deployment (No Redis)" -ForegroundColor Magenta
Write-Host "App Name: $AppName" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Cyan

try {
    # Step 1: Verify Azure authentication
    Write-Host "`n🔐 Checking Azure authentication..." -ForegroundColor Yellow
    $context = az account show --output json 2>$null | ConvertFrom-Json
    if (!$context) {
        Write-Host "Please login to Azure..." -ForegroundColor Red
        az login
        $context = az account show --output json | ConvertFrom-Json
    }
    Write-Host "✅ Authenticated as: $($context.user.name)" -ForegroundColor Green

    # Step 2: Configure environment variables (no Redis)
    Write-Host "`n⚙️ Configuring environment variables..." -ForegroundColor Yellow
    az webapp config appsettings set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --settings `
        "COSMOS_DB_CONNECTION_STRING=AccountEndpoint=https://star-cosmos-free.documents.azure.com:443/;AccountKey=M51eSqBch5JqN5g4GPIEP02eLXQyOTvDhK3OnJ8ANr6NbqhUJxi2lXXbyrpbblmiRXiYkW18cwykACDbWS8ByA==;" `
        "COSMOS_DB_DATABASE_NAME=star-db" `
        "FLASK_ENV=production" `
        "SECRET_KEY=u9rBZF6vpyLXz81mSnt3abEgD7wok0POfqejKUG5McYVJN4ChWAxlTHQsd2RIi" `
        "JWT_SECRET_KEY=W4CRXn05Y3zhbucfw9xrgotUNZKO8yBH2sQeImGJSiq7lpkLMPjd6EvFTa1VDA" `
        "AGORA_APP_ID=5d835f5e1f244f259d6e8681479c54cf" `
        "AGORA_APP_CERTIFICATE=99c4d072d6694249a72d1716a75ffab5" `
        "WEBSITE_PYTHON_VERSION=3.10" `
        "SCM_DO_BUILD_DURING_DEPLOYMENT=false" `
        "WEBSOCKETS_ENABLED=true" `
        "NO_REDIS=true" `
        "PYTHONPATH=/home/site/wwwroot"
    
    Write-Host "✅ Environment variables configured" -ForegroundColor Green

    # Step 3: Build frontend (if exists)
    Write-Host "`n🏗️ Building frontend..." -ForegroundColor Yellow
    if (Test-Path "star-frontend") {
        Push-Location "star-frontend"
        
        if (Test-Path "package.json") {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
            npm install
            Write-Host "Building frontend..." -ForegroundColor Yellow
            npm run build
            
            # Copy built frontend to backend static folder
            $staticPath = "..\star-backend\star_backend_flask\static"
            if (!(Test-Path $staticPath)) {
                New-Item -Type Directory -Path $staticPath -Force
            }
            
            if (Test-Path "out") {
                Copy-Item -Recurse -Path "out\*" -Destination $staticPath -Force
                Write-Host "✅ Frontend built and copied to backend" -ForegroundColor Green
            }
            elseif (Test-Path ".next") {
                Copy-Item -Recurse -Path ".next\*" -Destination $staticPath -Force
                Write-Host "✅ Frontend built (.next) and copied to backend" -ForegroundColor Green
            }
            else {
                Write-Host "⚠️ Frontend build output not found, creating placeholder" -ForegroundColor Yellow
                @"
<!DOCTYPE html>
<html>
<head>
    <title>Star App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #000; color: #fff; text-align: center; }
        h1 { color: #007cba; }
        .loading { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
    </style>
</head>
<body>
    <h1 class="loading">🌟 Star App Loading...</h1>
    <p>The cosmic platform is initializing...</p>
    <script>setTimeout(() => location.reload(), 5000);</script>
</body>
</html>
"@ | Out-File -FilePath "$staticPath\index.html" -Encoding UTF8
            }
        }
        else {
            Write-Host "⚠️ package.json not found in star-frontend" -ForegroundColor Yellow
        }
        
        Pop-Location
    }
    else {
        Write-Host "⚠️ Frontend directory not found, creating basic static files" -ForegroundColor Yellow
        $staticPath = "star-backend\star_backend_flask\static"
        if (!(Test-Path $staticPath)) {
            New-Item -Type Directory -Path $staticPath -Force
        }
        @"
<!DOCTYPE html>
<html>
<head>
    <title>Star App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>🌟 Welcome to Star App</h1>
    <p><a href="/register">Register</a> | <a href="/collaborative-cosmos">Cosmos</a></p>
</body>
</html>
"@ | Out-File -FilePath "$staticPath\index.html" -Encoding UTF8
    }

    # Step 4: Prepare deployment package
    Write-Host "`n📦 Preparing deployment package..." -ForegroundColor Yellow
    Push-Location "star-backend"
    
    # Copy the no-redis app as main app
    Copy-Item "star_backend_flask\app_no_redis.py" "star_backend_flask\app.py" -Force
    Copy-Item "star_backend_flask\requirements_no_redis.txt" "star_backend_flask\requirements.txt" -Force
    
    # Create startup script for Linux App Service
    @"
#!/bin/bash
echo "Starting STAR Backend (No Redis)..."
cd /home/site/wwwroot/star_backend_flask
python -m pip install --upgrade pip
pip install -r requirements.txt
echo "Dependencies installed, starting application..."
gunicorn --bind=0.0.0.0:8000 --timeout=120 --workers=1 --access-logfile=- --error-logfile=- app:app
"@ | Out-File -FilePath "startup.sh" -Encoding UTF8 -NoNewline
    
    # Create web.config for Windows containers (fallback)
    @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="PythonHandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified"/>
    </handlers>
    <httpPlatform processPath="C:\Python310\python.exe"
                  arguments="star_backend_flask\app.py"
                  stdoutLogEnabled="true"
                  stdoutLogFile="D:\home\LogFiles\python.log"
                  startupTimeLimit="60"
                  requestTimeout="00:04:00">
      <environmentVariables>
        <environmentVariable name="PYTHONPATH" value="D:\home\site\wwwroot" />
      </environmentVariables>
    </httpPlatform>
  </system.webServer>
</configuration>
"@ | Out-File -FilePath "web.config" -Encoding UTF8

    # Create deployment ZIP
    $deploymentFiles = @(
        "star_backend_flask"
    )
    
    # Add startup files if they exist
    if (Test-Path "startup.sh") { $deploymentFiles += "startup.sh" }
    if (Test-Path "web.config") { $deploymentFiles += "web.config" }
    
    # Remove old deployment file if it exists
    if (Test-Path "star-deployment.zip") {
        Remove-Item "star-deployment.zip" -Force
    }
    
    Compress-Archive -Path $deploymentFiles -DestinationPath "star-deployment.zip" -Force
    Write-Host "✅ Deployment package created: $(Get-Item 'star-deployment.zip' | ForEach-Object { [math]::Round($_.Length/1MB, 2) }) MB" -ForegroundColor Green

    # Step 5: Deploy to Azure
    Write-Host "`n🚀 Deploying to Azure..." -ForegroundColor Yellow
    az webapp deploy `
        --name $AppName `
        --resource-group $ResourceGroup `
        --src-path "star-deployment.zip" `
        --type zip `
        --timeout 300
    
    Write-Host "✅ Code deployed" -ForegroundColor Green

    # Step 6: Configure startup command
    Write-Host "`n⚙️ Configuring startup command..." -ForegroundColor Yellow
    az webapp config set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --startup-file "cd star_backend_flask && gunicorn --bind=0.0.0.0:8000 --timeout=120 --workers=1 --access-logfile=- --error-logfile=- app:app"
    
    Write-Host "✅ Startup command configured" -ForegroundColor Green

    # Step 7: Restart app service
    Write-Host "`n🔄 Restarting app service..." -ForegroundColor Yellow
    az webapp restart --name $AppName --resource-group $ResourceGroup
    
    Pop-Location

    # Step 8: Wait and test deployment
    $AppUrl = "https://$AppName.azurewebsites.net"
    Write-Host "`n🧪 Testing deployment..." -ForegroundColor Yellow
    Write-Host "App URL: $AppUrl" -ForegroundColor Cyan
    
    Write-Host "Waiting 45 seconds for app to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 45
    
    $testsPassed = 0
    $totalTests = 3
    
    # Test health endpoint
    try {
        Write-Host "Testing health endpoint..." -ForegroundColor Yellow
        $healthResponse = Invoke-WebRequest -Uri "$AppUrl/api/health" -UseBasicParsing -TimeoutSec 30
        if ($healthResponse.StatusCode -eq 200) {
            Write-Host "✅ Health check passed (Status: $($healthResponse.StatusCode))" -ForegroundColor Green
            $testsPassed++
        }
        else {
            Write-Host "⚠️ Health check returned status: $($healthResponse.StatusCode)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test register endpoint
    try {
        Write-Host "Testing register endpoint..." -ForegroundColor Yellow
        $registerResponse = Invoke-WebRequest -Uri "$AppUrl/register" -UseBasicParsing -TimeoutSec 30
        if ($registerResponse.StatusCode -eq 200 -and $registerResponse.Content.Contains("Join the Star Platform")) {
            Write-Host "✅ Register page accessible and contains expected content" -ForegroundColor Green
            $testsPassed++
        }
        else {
            Write-Host "⚠️ Register page accessible but content may be incorrect" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Register endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test collaborative cosmos endpoint
    try {
        Write-Host "Testing collaborative-cosmos endpoint..." -ForegroundColor Yellow
        $cosmosResponse = Invoke-WebRequest -Uri "$AppUrl/collaborative-cosmos" -UseBasicParsing -TimeoutSec 30
        if ($cosmosResponse.StatusCode -eq 200 -and $cosmosResponse.Content.Contains("Collaborative Cosmos")) {
            Write-Host "✅ Collaborative Cosmos page accessible and contains expected content" -ForegroundColor Green
            $testsPassed++
        }
        else {
            Write-Host "⚠️ Collaborative Cosmos page accessible but content may be incorrect" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Collaborative Cosmos endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n📊 Test Results: $testsPassed/$totalTests tests passed" -ForegroundColor Cyan
    
    if ($testsPassed -eq $totalTests) {
        Write-Host "`n🎉 Deployment Complete and All Tests Passed!" -ForegroundColor Green
    }
    else {
        Write-Host "`n⚠️ Deployment Complete but Some Tests Failed" -ForegroundColor Yellow
        Write-Host "Check the application logs for more details:" -ForegroundColor Yellow
        Write-Host "az webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor Yellow
    }
    
    Write-Host "`n🌟 Your STAR app is live at: $AppUrl" -ForegroundColor Cyan
    Write-Host "📋 Quick Links:" -ForegroundColor Cyan
    Write-Host "   Health Check: $AppUrl/api/health" -ForegroundColor White
    Write-Host "   Register: $AppUrl/register" -ForegroundColor White
    Write-Host "   Cosmic Realm: $AppUrl/collaborative-cosmos" -ForegroundColor White
    Write-Host "   API Token: $AppUrl/api/v1/stream/token" -ForegroundColor White

}
catch {
    Write-Host "`n❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "   1. Check Azure App Service logs:" -ForegroundColor White
    Write-Host "      az webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor Gray
    Write-Host "   2. Verify resource group and app name are correct" -ForegroundColor White
    Write-Host "   3. Ensure you have proper permissions for the subscription" -ForegroundColor White
    Write-Host "   4. Check if the App Service is running:" -ForegroundColor White
    Write-Host "      az webapp show --name $AppName --resource-group $ResourceGroup" -ForegroundColor Gray
    exit 1
}