# Azure Resource Creation Script for Star Platform
# This script creates all necessary Azure resources for the Star social media platform

# Set variables with unique names
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$resourceGroupName = "star-rg-$timestamp"
$location = "West US 2"  # Try a different region for Cosmos DB
$cosmosAccountName = "star-cosmos-$timestamp"
$redisName = "star-redis-$timestamp"
$storageAccountName = "starstrg$timestamp"  # Must be 3-24 chars, lowercase
$webPubSubName = "star-pubsub-$timestamp"
$appInsightsName = "star-appinsights-$timestamp"
$appServicePlanName = "star-plan-$timestamp"
$appServiceName = "star-backend-$timestamp"
$staticWebAppName = "star-frontend-$timestamp"

# Login to Azure (uncomment if needed)
# az login

# Create Resource Group
Write-Host "Creating Resource Group: $resourceGroupName"
az group create --name $resourceGroupName --location $location

# Create Cosmos DB Account (try different region if East US fails)
Write-Host "Creating Cosmos DB Account: $cosmosAccountName"
try {
    az cosmosdb create `
        --name $cosmosAccountName `
        --resource-group $resourceGroupName `
        --locations regionName=$location failoverPriority=0 `
        --kind GlobalDocumentDB `
        --default-consistency-level "Session"
}
catch {
    Write-Host "Cosmos DB creation failed in $location, trying East US..."
    az cosmosdb create `
        --name $cosmosAccountName `
        --resource-group $resourceGroupName `
        --locations regionName="East US" failoverPriority=0 `
        --kind GlobalDocumentDB `
        --default-consistency-level "Session"
}

# Create Cosmos DB Database and Containers
Write-Host "Creating Cosmos DB Database and Containers"
az cosmosdb sql database create `
    --account-name $cosmosAccountName `
    --resource-group $resourceGroupName `
    --name "star-db"

az cosmosdb sql container create `
    --account-name $cosmosAccountName `
    --resource-group $resourceGroupName `
    --database-name "star-db" `
    --name "users" `
    --partition-key-path "/username"

az cosmosdb sql container create `
    --account-name $cosmosAccountName `
    --resource-group $resourceGroupName `
    --database-name "star-db" `
    --name "posts" `
    --partition-key-path "/id"

az cosmosdb sql container create `
    --account-name $cosmosAccountName `
    --resource-group $resourceGroupName `
    --database-name "star-db" `
    --name "chats" `
    --partition-key-path "/id"

# Create Azure Cache for Redis
Write-Host "Creating Azure Cache for Redis: $redisName"
az redis create `
    --name $redisName `
    --resource-group $resourceGroupName `
    --location $location `
    --sku "Basic" `
    --vm-size "C0"

# Create Azure Storage Account
Write-Host "Creating Azure Storage Account: $storageAccountName"
az storage account create `
    --name $storageAccountName `
    --resource-group $resourceGroupName `
    --location $location `
    --sku "Standard_LRS" `
    --kind "StorageV2" `
    --access-tier "Hot"

# Create Storage Containers
Write-Host "Creating Storage Containers"
az storage container create `
    --name "avatars" `
    --account-name $storageAccountName

az storage container create `
    --name "media" `
    --account-name $storageAccountName

# Create Azure Web PubSub (skip if not available)
Write-Host "Skipping Azure Web PubSub creation (service not registered)"
# az webpubsub create `
#     --name $webPubSubName `
#     --resource-group $resourceGroupName `
#     --location $location `
#     --sku "Free_F1"

# Create Application Insights
Write-Host "Creating Application Insights: $appInsightsName"
az monitor app-insights component create `
    --app $appInsightsName `
    --location $location `
    --resource-group $resourceGroupName `
    --application-type "web"

# Create App Service Plan
Write-Host "Creating App Service Plan: $appServicePlanName"
az appservice plan create `
    --name $appServicePlanName `
    --resource-group $resourceGroupName `
    --location $location `
    --sku "F1" `
    --is-linux false

# Create App Service (Backend)
Write-Host "Creating App Service: $appServiceName"
az webapp create `
    --name $appServiceName `
    --resource-group $resourceGroupName `
    --plan $appServicePlanName `
    --runtime "PYTHON:3.11"

# Create Static Web App (Frontend) - Skip for now to avoid GitHub auth
Write-Host "Skipping Static Web App creation (requires GitHub authentication)"
# az staticwebapp create `
#     --name $staticWebAppName `
#     --resource-group $resourceGroupName `
#     --location $location `
#     --source "https://github.com/your-username/star" `
#     --branch "main" `
#     --app-location "star-frontend" `
#     --api-location "star-backend" `
#     --output-location "build" `
#     --login-with-github

# Get connection strings and keys
Write-Host "Getting Connection Strings and Keys"

$cosmosConnectionString = az cosmosdb keys list `
    --name $cosmosAccountName `
    --resource-group $resourceGroupName `
    --type connection-strings `
    --query "connectionStrings[0].connectionString" `
    --output tsv

$redisKey = az redis list-keys `
    --name $redisName `
    --resource-group $resourceGroupName `
    --query "primaryKey" `
    --output tsv

$storageKey = az storage account keys list `
    --account-name $storageAccountName `
    --resource-group $resourceGroupName `
    --query "[0].value" `
    --output tsv

$webPubSubConnectionString = "Not created - service not registered"
# $webPubSubConnectionString = az webpubsub key list `
#     --name $webPubSubName `
#     --resource-group $resourceGroupName `
#     --query "primaryConnectionString" `
#     --output tsv

$appInsightsConnectionString = az monitor app-insights component show `
    --app $appInsightsName `
    --resource-group $resourceGroupName `
    --query "connectionString" `
    --output tsv

# Output the connection strings (you'll need to update your .env files)
Write-Host "Azure Resources Created Successfully!"
Write-Host "Please update your .env files with the following values:"
Write-Host "COSMOS_DB_CONNECTION_STRING=$cosmosConnectionString"
Write-Host "REDIS_CONNECTION_STRING=rediss://$redisName.redis.cache.windows.net:6380,password=$redisKey,ssl=True,abortConnect=False"
Write-Host "AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=$storageAccountName;AccountKey=$storageKey;EndpointSuffix=core.windows.net"
Write-Host "WEB_PUBSUB_CONNECTION_STRING=$webPubSubConnectionString"
Write-Host "APPLICATION_INSIGHTS_CONNECTION_STRING=$appInsightsConnectionString"