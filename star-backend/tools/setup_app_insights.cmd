@echo off
REM Script to set up Azure Application Insights for STAR backend

REM Parameters
set RESOURCE_GROUP=star-app-rg
set LOCATION=eastus
set APP_INSIGHTS_NAME=star-app-insights
set APP_SERVICE_NAME=star-app-backend

REM Check dependencies
echo Checking dependencies...
where az >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Azure CLI is not installed. Please install it first.
    exit /b 1
)

REM Create Application Insights resource if it doesn't exist
echo Checking if Application Insights resource exists...
az monitor app-insights component show --app %APP_INSIGHTS_NAME% --resource-group %RESOURCE_GROUP% >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Creating Application Insights resource...
    az monitor app-insights component create ^
        --app %APP_INSIGHTS_NAME% ^
        --resource-group %RESOURCE_GROUP% ^
        --location %LOCATION% ^
        --kind web ^
        --application-type web
) else (
    echo Application Insights resource already exists.
)

REM Get the instrumentation key
echo Retrieving instrumentation key...
for /f "delims=" %%i in ('az monitor app-insights component show --app %APP_INSIGHTS_NAME% --resource-group %RESOURCE_GROUP% --query instrumentationKey -o tsv') do set INSTRUMENTATION_KEY=%%i

echo Instrumentation Key: %INSTRUMENTATION_KEY%

REM Update App Service settings to include the instrumentation key
echo Updating App Service settings...
az webapp config appsettings set ^
    --name %APP_SERVICE_NAME% ^
    --resource-group %RESOURCE_GROUP% ^
    --settings APPINSIGHTS_INSTRUMENTATIONKEY=%INSTRUMENTATION_KEY%

echo Creating sample dashboard for Application Insights...
az portal dashboard create ^
    --resource-group %RESOURCE_GROUP% ^
    --name "star-app-dashboard" ^
    --location %LOCATION% ^
    --input-path dashboard-template.json

echo Application Insights setup complete.
echo You can view your application insights in the Azure portal at:
echo https://portal.azure.com/#resource/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/%RESOURCE_GROUP%/providers/Microsoft.Insights/components/%APP_INSIGHTS_NAME%/overview