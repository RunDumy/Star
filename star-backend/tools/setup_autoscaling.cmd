@echo off
:: Script to configure autoscaling for Azure App Service for STAR backend
setlocal enabledelayedexpansion

echo Setting up autoscaling for STAR backend on Azure App Service...

:: Check if Azure CLI is installed
where az >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Azure CLI is not installed. Please install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
    exit /b 1
)

:: Check if logged in to Azure
az account show >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Not logged in to Azure. Please run 'az login' first.
    exit /b 1
)

:: Parameters (can be customized)
set RESOURCE_GROUP=%1
if "%RESOURCE_GROUP%"=="" set RESOURCE_GROUP=star-backend-rg

set APP_NAME=%2
if "%APP_NAME%"=="" set APP_NAME=star-backend

set MIN_INSTANCES=%3
if "%MIN_INSTANCES%"=="" set MIN_INSTANCES=1

set MAX_INSTANCES=%4
if "%MAX_INSTANCES%"=="" set MAX_INSTANCES=5

set DEFAULT_INSTANCES=%5
if "%DEFAULT_INSTANCES%"=="" set DEFAULT_INSTANCES=2

echo Using the following configuration:
echo - Resource Group: %RESOURCE_GROUP%
echo - App Name: %APP_NAME%
echo - Min Instances: %MIN_INSTANCES%
echo - Max Instances: %MAX_INSTANCES%
echo - Default Instances: %DEFAULT_INSTANCES%

:: Confirm before proceeding
set /p CONFIRM="Do you want to continue with these settings? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Operation cancelled.
    exit /b 1
)

:: Check if App Service exists
echo Checking if App Service exists...
az webapp show --name "%APP_NAME%" --resource-group "%RESOURCE_GROUP%" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo App Service %APP_NAME% does not exist in resource group %RESOURCE_GROUP%.
    exit /b 1
)

:: Create autoscale settings
echo Creating autoscale settings...

:: Get the App Service Plan ID
for /f "tokens=*" %%a in ('az webapp show --name "%APP_NAME%" --resource-group "%RESOURCE_GROUP%" --query "appServicePlanId" -o tsv') do (
    set APP_SERVICE_PLAN_ID=%%a
)

:: Configure autoscaling
az monitor autoscale create ^
    --resource-group "%RESOURCE_GROUP%" ^
    --resource "!APP_SERVICE_PLAN_ID!" ^
    --resource-type "Microsoft.Web/serverFarms" ^
    --name "STAR-Backend-AutoscaleConfig" ^
    --min-count "%MIN_INSTANCES%" ^
    --max-count "%MAX_INSTANCES%" ^
    --count "%DEFAULT_INSTANCES%"

if %ERRORLEVEL% neq 0 (
    echo Failed to create basic autoscale settings.
    exit /b 1
)

:: Add CPU rule (scale out)
echo Adding CPU scale-out rule...
az monitor autoscale rule create ^
    --resource-group "%RESOURCE_GROUP%" ^
    --autoscale-name "STAR-Backend-AutoscaleConfig" ^
    --condition "Percentage CPU > 75 avg 5m" ^
    --scale out 1

if %ERRORLEVEL% neq 0 (
    echo Failed to create CPU scale-out rule.
)

:: Add CPU rule (scale in)
echo Adding CPU scale-in rule...
az monitor autoscale rule create ^
    --resource-group "%RESOURCE_GROUP%" ^
    --autoscale-name "STAR-Backend-AutoscaleConfig" ^
    --condition "Percentage CPU < 25 avg 5m" ^
    --scale in 1

if %ERRORLEVEL% neq 0 (
    echo Failed to create CPU scale-in rule.
)

:: Add memory rule (scale out)
echo Adding memory scale-out rule...
az monitor autoscale rule create ^
    --resource-group "%RESOURCE_GROUP%" ^
    --autoscale-name "STAR-Backend-AutoscaleConfig" ^
    --condition "MemoryPercentage > 75 avg 5m" ^
    --scale out 1

if %ERRORLEVEL% neq 0 (
    echo Failed to create memory scale-out rule.
)

:: Add HTTP queue rule (scale out)
echo Adding HTTP queue scale-out rule...
az monitor autoscale rule create ^
    --resource-group "%RESOURCE_GROUP%" ^
    --autoscale-name "STAR-Backend-AutoscaleConfig" ^
    --condition "HttpQueueLength > 100 avg 5m" ^
    --scale out 1

if %ERRORLEVEL% neq 0 (
    echo Failed to create HTTP queue scale-out rule.
)

:: Schedule scale out for peak hours (example: weekdays 8 AM to 6 PM)
echo Adding schedule-based scaling rules...
az monitor autoscale profile create ^
    --resource-group "%RESOURCE_GROUP%" ^
    --autoscale-name "STAR-Backend-AutoscaleConfig" ^
    --name "WeekdayPeakHours" ^
    --start "2023-01-01T08:00" ^
    --end "2023-12-31T18:00" ^
    --timezone "Eastern Standard Time" ^
    --recurrence "1 2 3 4 5" ^
    --min-count 2 ^
    --max-count "%MAX_INSTANCES%" ^
    --count 3

if %ERRORLEVEL% neq 0 (
    echo Failed to create schedule-based scaling rule.
)

echo Autoscaling configured successfully for %APP_NAME%!
echo The application will automatically scale between %MIN_INSTANCES% and %MAX_INSTANCES% instances based on:
echo - CPU usage (scale out when ^> 75%%, scale in when ^< 25%%)
echo - Memory usage (scale out when ^> 75%%)
echo - HTTP request queue length (scale out when ^> 100)
echo - Schedule: More instances during weekday business hours

for /f "tokens=*" %%a in ('az account show --query id -o tsv') do (
    set SUBSCRIPTION_ID=%%a
)

echo.
echo You can monitor the autoscaling activity in the Azure portal:
echo https://portal.azure.com/#resource/subscriptions/!SUBSCRIPTION_ID!/resourceGroups/%RESOURCE_GROUP%/providers/Microsoft.Web/serverFarms/!APP_SERVICE_PLAN_ID:*/=!/scaleOut

endlocal