# STAR Platform - Azure App Service Deployment Script
# Quick deployment to Azure App Service with PWA support

param(
    [string]$AppName = "",
    [string]$ResourceGroup = "star-rg",
    [string]$Location = "East US"
)

# Configuration
$ErrorActionPreference = "Stop"

Write-Host "STAR Platform - Azure Deployment Starting..." -ForegroundColor Magenta

# Generate unique app name if not provided
if ([string]::IsNullOrEmpty($AppName)) {
    $Timestamp = Get-Date -Format "yyyyMMdd"
    $AppName = "star-app-$Timestamp"
}

Write-Host "App Name: $AppName" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Cyan
Write-Host "Location: $Location" -ForegroundColor Cyan

try {
    # Step 1: Login to Azure (if not already logged in)
    Write-Host "`nChecking Azure authentication..." -ForegroundColor Yellow
    
    $context = az account show --output json 2>$null | ConvertFrom-Json
    if (!$context) {
        Write-Host "Please login to Azure..." -ForegroundColor Yellow
        az login
    }
    else {
        Write-Host "Already logged in as: $($context.user.name)" -ForegroundColor Green
    }

    # Step 2: Create Resource Group
    Write-Host "`nCreating resource group..." -ForegroundColor Yellow
    
    $rgExists = az group exists --name $ResourceGroup --output tsv
    if ($rgExists -eq "false") {
        az group create --name $ResourceGroup --location $Location
        Write-Host "Resource group '$ResourceGroup' created" -ForegroundColor Green
    }
    else {
        Write-Host "Resource group '$ResourceGroup' already exists" -ForegroundColor Green
    }

    # Step 3: Create App Service Plan (Free F1 tier)
    Write-Host "`nCreating App Service plan..." -ForegroundColor Yellow
    
    $planName = "$AppName-plan"
    az appservice plan create `
        --name $planName `
        --resource-group $ResourceGroup `
        --sku F1 `
        --is-linux
    
    Write-Host "App Service plan '$planName' created" -ForegroundColor Green

    # Step 4: Create Web App
    Write-Host "`nCreating Web App..." -ForegroundColor Yellow
    
    az webapp create `
        --resource-group $ResourceGroup `
        --plan $planName `
        --name $AppName `
        --runtime "PYTHON|3.11"
    
    Write-Host "Web App '$AppName' created" -ForegroundColor Green

    # Step 5: Configure App Settings
    Write-Host "`nConfiguring app settings..." -ForegroundColor Yellow
    
    az webapp config appsettings set `
        --resource-group $ResourceGroup `
        --name $AppName `
        --settings `
        FLASK_ENV=production `
        SECRET_KEY="$(New-Guid)" `
        PYTHONPATH="/home/site/wwwroot" `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true
    
    Write-Host "App settings configured" -ForegroundColor Green

    # Step 6: Set Startup Command
    Write-Host "`nSetting startup command..." -ForegroundColor Yellow
    
    az webapp config set `
        --resource-group $ResourceGroup `
        --name $AppName `
        --startup-file "gunicorn --bind=0.0.0.0:8000 --timeout=120 main_azure:application"
    
    Write-Host "Startup command configured" -ForegroundColor Green

    # Step 7: Deploy Code
    Write-Host "`nDeploying code..." -ForegroundColor Yellow
    
    # Navigate to backend directory
    Push-Location "star-backend"
    
    # Deploy using ZIP deployment
    az webapp deployment source config-zip `
        --resource-group $ResourceGroup `
        --name $AppName `
        --src (Resolve-Path ".")
    
    Pop-Location
    
    Write-Host "Code deployed successfully" -ForegroundColor Green

    # Step 8: Get App URL
    $AppUrl = "https://$AppName.azurewebsites.net"
    
    Write-Host "`nDeployment Complete!" -ForegroundColor Green
    Write-Host "Your STAR app is live at: $AppUrl" -ForegroundColor Cyan
    Write-Host "Health Check: $AppUrl/api/health" -ForegroundColor Cyan
    Write-Host "PWA Manifest: $AppUrl/manifest.json" -ForegroundColor Cyan
    
    # Optional: Open in browser
    $openBrowser = Read-Host "`nOpen in browser? (y/n)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
        Start-Process $AppUrl
    }

}
catch {
    Write-Host "`nDeployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the Azure portal for detailed logs" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nSTAR Platform deployment completed successfully!" -ForegroundColor Magenta