#!/bin/bash
# Script to set up Azure Application Insights for STAR backend

# Parameters
RESOURCE_GROUP="star-app-rg"
LOCATION="eastus"
APP_INSIGHTS_NAME="star-app-insights"
APP_SERVICE_NAME="star-app-backend"

# Check dependencies
echo "Checking dependencies..."
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Create Application Insights resource if it doesn't exist
echo "Checking if Application Insights resource exists..."
if ! az monitor app-insights component show --app $APP_INSIGHTS_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "Creating Application Insights resource..."
    az monitor app-insights component create \
        --app $APP_INSIGHTS_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --kind web \
        --application-type web
else
    echo "Application Insights resource already exists."
fi

# Get the instrumentation key
echo "Retrieving instrumentation key..."
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
    --app $APP_INSIGHTS_NAME \
    --resource-group $RESOURCE_GROUP \
    --query instrumentationKey -o tsv)

echo "Instrumentation Key: $INSTRUMENTATION_KEY"

# Update App Service settings to include the instrumentation key
echo "Updating App Service settings..."
az webapp config appsettings set \
    --name $APP_SERVICE_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY

echo "Creating sample dashboard for Application Insights..."
az portal dashboard create \
    --resource-group $RESOURCE_GROUP \
    --name "star-app-dashboard" \
    --location $LOCATION \
    --input-path dashboard-template.json

echo "Application Insights setup complete."
echo "You can view your application insights in the Azure portal at:"
echo "https://portal.azure.com/#resource/subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Insights/components/$APP_INSIGHTS_NAME/overview"