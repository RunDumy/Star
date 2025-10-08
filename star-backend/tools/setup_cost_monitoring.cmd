@echo off
:: Script to set up cost monitoring and budget alerts for Azure resources
setlocal enabledelayedexpansion

echo Setting up cost monitoring and budget alerts for STAR backend on Azure...

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
for /f "tokens=*" %%a in ('az account show --query id -o tsv') do (
    set SUBSCRIPTION_ID=%%a
)

set RESOURCE_GROUP=%1
if "%RESOURCE_GROUP%"=="" set RESOURCE_GROUP=star-backend-rg

set MONTHLY_BUDGET_AMOUNT=%2
if "%MONTHLY_BUDGET_AMOUNT%"=="" set MONTHLY_BUDGET_AMOUNT=100

set ALERT_EMAIL=%3
if "%ALERT_EMAIL%"=="" set ALERT_EMAIL=admin@example.com

set CONTACT_NAME=%4
if "%CONTACT_NAME%"=="" set CONTACT_NAME=STAR Admin

echo Using the following configuration:
echo - Subscription ID: %SUBSCRIPTION_ID%
echo - Resource Group: %RESOURCE_GROUP%
echo - Monthly Budget Amount: $%MONTHLY_BUDGET_AMOUNT%
echo - Alert Email: %ALERT_EMAIL%
echo - Contact Name: %CONTACT_NAME%

:: Confirm before proceeding
set /p CONFIRM="Do you want to continue with these settings? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Operation cancelled.
    exit /b 1
)

:: Check if resource group exists
echo Checking if resource group exists...
az group show --name "%RESOURCE_GROUP%" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Resource group %RESOURCE_GROUP% does not exist.
    exit /b 1
)

:: Create budget alert
echo Creating budget alert for the resource group...

:: First, get the scope
set SCOPE=/subscriptions/%SUBSCRIPTION_ID%/resourceGroups/%RESOURCE_GROUP%

:: Create action group for alerts
echo Creating action group for budget alerts...
az monitor action-group create ^
    --name "STAR-Budget-Alerts" ^
    --resource-group "%RESOURCE_GROUP%" ^
    --short-name "BudgetAlert" ^
    --action email "%CONTACT_NAME%" "%ALERT_EMAIL%"

if %ERRORLEVEL% neq 0 (
    echo Failed to create action group for alerts.
    exit /b 1
)

:: Get action group ID
for /f "tokens=*" %%a in ('az monitor action-group show --name "STAR-Budget-Alerts" --resource-group "%RESOURCE_GROUP%" --query id -o tsv') do (
    set ACTION_GROUP_ID=%%a
)

:: Get current date for budget time period
for /f "tokens=*" %%a in ('powershell -Command "Get-Date -Format yyyy-MM-01"') do (
    set CURRENT_DATE=%%a
)

:: Create budget with alerts
echo Creating budget with alerts...
az consumption budget create ^
    --budget-name "STAR-Monthly-Budget" ^
    --amount "%MONTHLY_BUDGET_AMOUNT%" ^
    --time-grain "Monthly" ^
    --time-period "%CURRENT_DATE%" ^
    --scope "%SCOPE%" ^
    --category "Cost" ^
    --notifications "actual_50=ActualCost>=50;Percentage;STAR-Budget-Alerts;%ALERT_EMAIL%" ^
    --notifications "actual_80=ActualCost>=80;Percentage;STAR-Budget-Alerts;%ALERT_EMAIL%" ^
    --notifications "actual_100=ActualCost>=100;Percentage;STAR-Budget-Alerts;%ALERT_EMAIL%" ^
    --notifications "forecasted_100=ForecastedCost>=100;Percentage;STAR-Budget-Alerts;%ALERT_EMAIL%"

if %ERRORLEVEL% neq 0 (
    echo Failed to create budget. This could be due to insufficient permissions or because the consumption feature is not registered.
    echo Attempting to register Microsoft.Consumption provider...
    
    az provider register --namespace "Microsoft.Consumption"
    echo Please wait a few minutes for the registration to complete, then run this script again.
    exit /b 1
)

:: Create cost analysis export
echo Setting up daily cost export to storage...

:: Create storage account for cost data
for /f "tokens=*" %%a in ('powershell -Command "Get-Date -UFormat %%s"') do (
    set TIMESTAMP=%%a
)
set TIMESTAMP=%TIMESTAMP:.=%
set STORAGE_ACCOUNT_NAME=starcostexport%TIMESTAMP%
echo Creating storage account %STORAGE_ACCOUNT_NAME%...

:: Get location from resource group
for /f "tokens=*" %%a in ('az group show --name "%RESOURCE_GROUP%" --query location -o tsv') do (
    set LOCATION=%%a
)

az storage account create ^
    --name "%STORAGE_ACCOUNT_NAME%" ^
    --resource-group "%RESOURCE_GROUP%" ^
    --location "%LOCATION%" ^
    --sku "Standard_LRS" ^
    --kind "StorageV2"

if %ERRORLEVEL% neq 0 (
    echo Failed to create storage account for cost export.
    exit /b 1
)

:: Create container
echo Creating storage container for cost data...
for /f "tokens=*" %%a in ('az storage account keys list --account-name "%STORAGE_ACCOUNT_NAME%" --query "[0].value" -o tsv') do (
    set STORAGE_KEY=%%a
)

az storage container create ^
    --name "costdata" ^
    --account-name "%STORAGE_ACCOUNT_NAME%" ^
    --account-key "%STORAGE_KEY%"

if %ERRORLEVEL% neq 0 (
    echo Failed to create storage container for cost data.
    exit /b 1
)

:: Set up cost export
echo Setting up scheduled cost export...

for /f "tokens=*" %%a in ('az storage account show --name "%STORAGE_ACCOUNT_NAME%" --resource-group "%RESOURCE_GROUP%" --query id -o tsv') do (
    set STORAGE_ACCOUNT_ID=%%a
)

:: Get dates for recurrence period
for /f "tokens=*" %%a in ('powershell -Command "Get-Date -Format yyyy-MM-dd"') do (
    set TODAY=%%a
)

for /f "tokens=*" %%a in ('powershell -Command "(Get-Date).AddYears(10).ToString('yyyy-MM-dd')"') do (
    set FUTURE_DATE=%%a
)

az costmanagement export create ^
    --name "DailyCostExport" ^
    --type "ActualCost" ^
    --scope "subscriptions/%SUBSCRIPTION_ID%" ^
    --storage-account-id "%STORAGE_ACCOUNT_ID%" ^
    --storage-container "costdata" ^
    --timeframe "MonthToDate" ^
    --recurrence "Daily" ^
    --recurrence-period "from=%TODAY%T00:00:00Z to=%FUTURE_DATE%T00:00:00Z" ^
    --schedule "StartDate=%TODAY%T00:00:00Z EndDate=%FUTURE_DATE%T00:00:00Z Recurrence=Daily" ^
    --dataset-configuration "granularity=Daily columns=Date,ResourceId,ResourceType,ResourceLocation,ResourceGroupName,ServiceName,ServiceTier,Meter,MeterCategory,MeterSubCategory,Product"

if %ERRORLEVEL% neq 0 (
    echo Failed to set up cost export. This might require additional permissions.
) else (
    echo Cost export set up successfully.
)

:: Generate cost optimization recommendations
echo Generating cost optimization recommendations...
az advisor recommendation list ^
    --filter "Category eq 'Cost'" ^
    --query "[?contains(resourceMetadata.resourceId, '%RESOURCE_GROUP%')].{Impact:impact, Recommendation:shortDescription.solution, Resource:resourceMetadata.resourceName, ResourceType:resourceMetadata.resourceType, AnnualSavings:extendedProperties.annualSavingsAmount}" ^
    -o table

echo Cost monitoring setup completed for STAR backend on Azure!
echo Budget alerts will be sent to %ALERT_EMAIL% when costs reach 50%%, 80%%, and 100%% of $%MONTHLY_BUDGET_AMOUNT%.
echo Daily cost data will be exported to the storage account %STORAGE_ACCOUNT_NAME%.
echo.
echo Additional cost management recommendations:
echo 1. Use Azure Advisor regularly to check for cost optimization opportunities
echo 2. Set up scheduled VM shutdowns for development/test environments
echo 3. Use Azure Reserved Instances for predictable workloads
echo 4. Consider Azure Spot Instances for batch processing jobs
echo 5. Implement auto-scaling to match resource allocation with demand

echo.
echo You can access cost management in the Azure portal:
echo https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/costanalysis/scope/%%2Fsubscriptions%%2F%SUBSCRIPTION_ID%/resourceGroups%%2F%RESOURCE_GROUP%

endlocal