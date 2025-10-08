#!/bin/bash
# Script to configure autoscaling for Azure App Service for STAR backend

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up autoscaling for STAR backend on Azure App Service...${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Azure CLI is not installed. Please install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli${NC}"
    exit 1
fi

# Check if logged in to Azure
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}Not logged in to Azure. Please run 'az login' first.${NC}"
    exit 1
fi

# Parameters (can be customized)
RESOURCE_GROUP=${1:-"star-backend-rg"}
APP_NAME=${2:-"star-backend"}
MIN_INSTANCES=${3:-1}
MAX_INSTANCES=${4:-5}
DEFAULT_INSTANCES=${5:-2}

echo -e "${BLUE}Using the following configuration:${NC}"
echo "- Resource Group: $RESOURCE_GROUP"
echo "- App Name: $APP_NAME"
echo "- Min Instances: $MIN_INSTANCES"
echo "- Max Instances: $MAX_INSTANCES"
echo "- Default Instances: $DEFAULT_INSTANCES"

# Confirm before proceeding
read -p "Do you want to continue with these settings? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Operation cancelled.${NC}"
    exit 1
fi

# Check if App Service exists
echo -e "${BLUE}Checking if App Service exists...${NC}"
az webapp show --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}App Service $APP_NAME does not exist in resource group $RESOURCE_GROUP.${NC}"
    exit 1
fi

# Create autoscale settings
echo -e "${BLUE}Creating autoscale settings...${NC}"

# Get the App Service Plan ID
APP_SERVICE_PLAN_ID=$(az webapp show --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --query "appServicePlanId" -o tsv)

# Configure autoscaling
az monitor autoscale create \
    --resource-group "$RESOURCE_GROUP" \
    --resource "$APP_SERVICE_PLAN_ID" \
    --resource-type "Microsoft.Web/serverFarms" \
    --name "STAR-Backend-AutoscaleConfig" \
    --min-count "$MIN_INSTANCES" \
    --max-count "$MAX_INSTANCES" \
    --count "$DEFAULT_INSTANCES"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create basic autoscale settings.${NC}"
    exit 1
fi

# Add CPU rule (scale out)
echo -e "${BLUE}Adding CPU scale-out rule...${NC}"
az monitor autoscale rule create \
    --resource-group "$RESOURCE_GROUP" \
    --autoscale-name "STAR-Backend-AutoscaleConfig" \
    --condition "Percentage CPU > 75 avg 5m" \
    --scale out 1

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create CPU scale-out rule.${NC}"
fi

# Add CPU rule (scale in)
echo -e "${BLUE}Adding CPU scale-in rule...${NC}"
az monitor autoscale rule create \
    --resource-group "$RESOURCE_GROUP" \
    --autoscale-name "STAR-Backend-AutoscaleConfig" \
    --condition "Percentage CPU < 25 avg 5m" \
    --scale in 1

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create CPU scale-in rule.${NC}"
fi

# Add memory rule (scale out)
echo -e "${BLUE}Adding memory scale-out rule...${NC}"
az monitor autoscale rule create \
    --resource-group "$RESOURCE_GROUP" \
    --autoscale-name "STAR-Backend-AutoscaleConfig" \
    --condition "MemoryPercentage > 75 avg 5m" \
    --scale out 1

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create memory scale-out rule.${NC}"
fi

# Add HTTP queue rule (scale out)
echo -e "${BLUE}Adding HTTP queue scale-out rule...${NC}"
az monitor autoscale rule create \
    --resource-group "$RESOURCE_GROUP" \
    --autoscale-name "STAR-Backend-AutoscaleConfig" \
    --condition "HttpQueueLength > 100 avg 5m" \
    --scale out 1

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create HTTP queue scale-out rule.${NC}"
fi

# Schedule scale out for peak hours (example: weekdays 8 AM to 6 PM)
echo -e "${BLUE}Adding schedule-based scaling rules...${NC}"
az monitor autoscale profile create \
    --resource-group "$RESOURCE_GROUP" \
    --autoscale-name "STAR-Backend-AutoscaleConfig" \
    --name "WeekdayPeakHours" \
    --start "2023-01-01T08:00" \
    --end "2023-12-31T18:00" \
    --timezone "Eastern Standard Time" \
    --recurrence "1 2 3 4 5" \
    --min-count 2 \
    --max-count "$MAX_INSTANCES" \
    --count 3

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create schedule-based scaling rule.${NC}"
fi

echo -e "${GREEN}Autoscaling configured successfully for $APP_NAME!${NC}"
echo -e "${BLUE}The application will automatically scale between $MIN_INSTANCES and $MAX_INSTANCES instances based on:${NC}"
echo "- CPU usage (scale out when > 75%, scale in when < 25%)"
echo "- Memory usage (scale out when > 75%)"
echo "- HTTP request queue length (scale out when > 100)"
echo "- Schedule: More instances during weekday business hours"

echo -e "\n${BLUE}You can monitor the autoscaling activity in the Azure portal:${NC}"
echo "https://portal.azure.com/#resource/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Web/serverFarms/$(basename $APP_SERVICE_PLAN_ID)/scaleOut"