# Azure App Service Configuration Script for STAR Platform
# PowerShell version for Windows environments

Write-Host "Configuring STAR Platform environment variables..." -ForegroundColor Green

# Set essential application settings
az webapp config appsettings set `
    --name star-app-backend `
    --resource-group star-app-rg-centralus `
    --settings `
    "SECRET_KEY=u9rBZF6vpyLXz81mSnt3abEgD7wok0POfqejKUG5McYVJN4ChWAxlTHQsd2RIi" `
    "JWT_SECRET_KEY=W4CRXn05Y3zhbucfw9xrgotUNZKO8yBH2sQeImGJSiq7lpkLMPjd6EvFTa1VDA" `
    "AZURE_COSMOS_URL=https://star-cosmos-free.documents.azure.com:443/" `
    "AZURE_COSMOS_KEY=M51eSqBch5JqN5g4GPIEP02eLXQyOTvDhK3OnJ8ANr6NbqhUJxi2lXXbyrpbblmiRXiYkW18cwykACDbWS8ByA==" `
    "AZURE_COSMOS_DATABASE=star-db" `
    "COSMOS_DB_CONNECTION_STRING=AccountEndpoint=https://star-cosmos-free.documents.azure.com:443/;AccountKey=M51eSqBch5JqN5g4GPIEP02eLXQyOTvDhK3OnJ8ANr6NbqhUJxi2lXXbyrpbblmiRXiYkW18cwykACDbWS8ByA==;" `
    "FLASK_ENV=production" `
    "PYTHONPATH=/home/site/wwwroot"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Environment variables configured successfully!" -ForegroundColor Green
    
    # Restart the app service to apply changes
    Write-Host "Restarting Azure App Service..." -ForegroundColor Yellow
    az webapp restart --name star-app-backend --resource-group star-app-rg-centralus
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Configuration complete!" -ForegroundColor Green
        Write-Host "Application should be available at:" -ForegroundColor Cyan
        Write-Host "https://star-app-backend.azurewebsites.net" -ForegroundColor Cyan
        
        # Wait a moment for restart and test
        Write-Host "Waiting 30 seconds for service restart..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host "Testing health endpoint..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "https://star-app-backend.azurewebsites.net/api/health" -TimeoutSec 30
            Write-Host "Health check successful!" -ForegroundColor Green
            Write-Host $response -ForegroundColor White
        }
        catch {
            Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Service may still be starting up. Please try again in a few minutes." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Failed to restart the application!" -ForegroundColor Red
    }
}
else {
    Write-Host "Failed to configure environment variables!" -ForegroundColor Red
}