@echo off
:: Script to set up Azure Cache for Redis for STAR backend
setlocal enabledelayedexpansion

echo Setting up Azure Cache for Redis for STAR backend...

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

set LOCATION=%2
if "%LOCATION%"=="" set LOCATION=eastus

set REDIS_NAME=%3
if "%REDIS_NAME%"=="" set REDIS_NAME=star-redis

set SKU=%4
if "%SKU%"=="" set SKU=Standard

set VM_SIZE=%5
if "%VM_SIZE%"=="" set VM_SIZE=C1

echo Using the following configuration:
echo - Resource Group: %RESOURCE_GROUP%
echo - Location: %LOCATION%
echo - Redis Name: %REDIS_NAME%
echo - SKU: %SKU%
echo - VM Size: %VM_SIZE%

:: Confirm before proceeding
set /p CONFIRM="Do you want to continue with these settings? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Operation cancelled.
    exit /b 1
)

:: Create resource group if it doesn't exist
echo Checking if resource group exists...
az group show --name "%RESOURCE_GROUP%" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Creating resource group %RESOURCE_GROUP%...
    az group create --name "%RESOURCE_GROUP%" --location "%LOCATION%"
    if %ERRORLEVEL% neq 0 (
        echo Failed to create resource group.
        exit /b 1
    )
)

:: Create Azure Cache for Redis
echo Creating Azure Cache for Redis instance...
az redis create ^
    --name "%REDIS_NAME%" ^
    --resource-group "%RESOURCE_GROUP%" ^
    --location "%LOCATION%" ^
    --sku "%SKU%" ^
    --vm-size "%VM_SIZE%" ^
    --enable-non-ssl-port false

if %ERRORLEVEL% neq 0 (
    echo Failed to create Azure Cache for Redis instance.
    exit /b 1
)

:: Get Redis connection information
echo Retrieving Redis connection information...
for /f "tokens=*" %%a in ('az redis show --name "%REDIS_NAME%" --resource-group "%RESOURCE_GROUP%" --query "hostName" -o tsv') do (
    set REDIS_HOST=%%a
)

for /f "tokens=*" %%a in ('az redis show --name "%REDIS_NAME%" --resource-group "%RESOURCE_GROUP%" --query "sslPort" -o tsv') do (
    set REDIS_PORT=%%a
)

for /f "tokens=*" %%a in ('az redis list-keys --name "%REDIS_NAME%" --resource-group "%RESOURCE_GROUP%" --query "primaryKey" -o tsv') do (
    set REDIS_KEY=%%a
)

if "!REDIS_HOST!"=="" (
    echo Failed to retrieve Redis connection information.
    exit /b 1
)

:: Generate connection string
set REDIS_URL=redis://:!REDIS_KEY!@!REDIS_HOST!:!REDIS_PORT!?ssl=true

:: Print connection information
echo Azure Cache for Redis has been created successfully!
echo Connection Information:
echo - Host: !REDIS_HOST!
echo - Port: !REDIS_PORT!
echo - Connection String: !REDIS_URL!

:: Instructions for environment variables
echo.
echo Add the following to your environment variables:
echo AZURE_REDIS_URL=!REDIS_URL!

:: Add firewall rule for Azure App Service if needed
echo.
set /p ADD_FIREWALL="Do you want to add a firewall rule for Azure App Service outbound IPs? (y/n): "
if /i "%ADD_FIREWALL%"=="y" (
    echo Adding firewall rules for Azure App Service outbound IPs...
    
    :: Get the App Service name
    set /p APP_SERVICE_NAME="Enter the name of your Azure App Service: "
    set APP_SERVICE_RG=%RESOURCE_GROUP%
    
    :: Get outbound IPs for the App Service
    echo Retrieving outbound IPs for App Service !APP_SERVICE_NAME!...
    for /f "tokens=*" %%a in ('az webapp show --name "!APP_SERVICE_NAME!" --resource-group "!APP_SERVICE_RG!" --query "outboundIpAddresses" -o tsv') do (
        set OUTBOUND_IPS=%%a
    )
    
    if "!OUTBOUND_IPS!"=="" (
        echo Failed to retrieve outbound IPs for App Service.
    ) else (
        :: Add firewall rules for each IP
        for %%i in (!OUTBOUND_IPS:,= !) do (
            echo Adding firewall rule for IP: %%i
            set IP_NAME=%%i
            set IP_NAME=!IP_NAME:.=-!
            az redis firewall-rules create ^
                --name "AppService-!IP_NAME!" ^
                --resource-group "%RESOURCE_GROUP%" ^
                --redis-name "%REDIS_NAME%" ^
                --start-ip "%%i" ^
                --end-ip "%%i"
        )
        echo Firewall rules added successfully!
    )
)

echo.
echo Setup complete! You can now use Azure Cache for Redis with your STAR backend.

endlocal