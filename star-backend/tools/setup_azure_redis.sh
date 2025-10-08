#!/bin/bash
# Script to set up Azure Cache for Redis for STAR backend

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Azure Cache for Redis for STAR backend...${NC}"

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
LOCATION=${2:-"eastus"}
REDIS_NAME=${3:-"star-redis"}
SKU=${4:-"Standard"}
VM_SIZE=${5:-"C1"}

echo -e "${BLUE}Using the following configuration:${NC}"
echo "- Resource Group: $RESOURCE_GROUP"
echo "- Location: $LOCATION"
echo "- Redis Name: $REDIS_NAME"
echo "- SKU: $SKU"
echo "- VM Size: $VM_SIZE"

# Confirm before proceeding
read -p "Do you want to continue with these settings? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Operation cancelled.${NC}"
    exit 1
fi

# Create resource group if it doesn't exist
echo -e "${BLUE}Checking if resource group exists...${NC}"
az group show --name "$RESOURCE_GROUP" &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${BLUE}Creating resource group $RESOURCE_GROUP...${NC}"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create resource group.${NC}"
        exit 1
    fi
fi

# Create Azure Cache for Redis
echo -e "${BLUE}Creating Azure Cache for Redis instance...${NC}"
az redis create \
    --name "$REDIS_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku "$SKU" \
    --vm-size "$VM_SIZE" \
    --enable-non-ssl-port false

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create Azure Cache for Redis instance.${NC}"
    exit 1
fi

# Get Redis connection information
echo -e "${BLUE}Retrieving Redis connection information...${NC}"
REDIS_HOST=$(az redis show --name "$REDIS_NAME" --resource-group "$RESOURCE_GROUP" --query "hostName" -o tsv)
REDIS_PORT=$(az redis show --name "$REDIS_NAME" --resource-group "$RESOURCE_GROUP" --query "sslPort" -o tsv)
REDIS_KEY=$(az redis list-keys --name "$REDIS_NAME" --resource-group "$RESOURCE_GROUP" --query "primaryKey" -o tsv)

if [ -z "$REDIS_HOST" ] || [ -z "$REDIS_PORT" ] || [ -z "$REDIS_KEY" ]; then
    echo -e "${RED}Failed to retrieve Redis connection information.${NC}"
    exit 1
fi

# Generate connection string
REDIS_URL="redis://:$REDIS_KEY@$REDIS_HOST:$REDIS_PORT?ssl=true"

# Print connection information
echo -e "${GREEN}Azure Cache for Redis has been created successfully!${NC}"
echo -e "${BLUE}Connection Information:${NC}"
echo "- Host: $REDIS_HOST"
echo "- Port: $REDIS_PORT"
echo "- Connection String: $REDIS_URL"

# Instructions for environment variables
echo -e "\n${BLUE}Add the following to your environment variables:${NC}"
echo "AZURE_REDIS_URL=$REDIS_URL"

# Add firewall rule for Azure App Service if needed
echo -e "\n${BLUE}Do you want to add a firewall rule for Azure App Service outbound IPs? (y/n)${NC}"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Adding firewall rules for Azure App Service outbound IPs...${NC}"
    
    # Get the App Service name
    read -p "Enter the name of your Azure App Service: " APP_SERVICE_NAME
    APP_SERVICE_RG=${RESOURCE_GROUP}
    
    # Get outbound IPs for the App Service
    echo -e "${BLUE}Retrieving outbound IPs for App Service $APP_SERVICE_NAME...${NC}"
    OUTBOUND_IPS=$(az webapp show --name "$APP_SERVICE_NAME" --resource-group "$APP_SERVICE_RG" --query "outboundIpAddresses" -o tsv)
    
    if [ -z "$OUTBOUND_IPS" ]; then
        echo -e "${RED}Failed to retrieve outbound IPs for App Service.${NC}"
    else
        # Add firewall rules for each IP
        IFS=',' read -ra IP_ARRAY <<< "$OUTBOUND_IPS"
        for IP in "${IP_ARRAY[@]}"; do
            echo -e "${BLUE}Adding firewall rule for IP: $IP${NC}"
            az redis firewall-rules create \
                --name "AppService-${IP//./-}" \
                --resource-group "$RESOURCE_GROUP" \
                --redis-name "$REDIS_NAME" \
                --start-ip "$IP" \
                --end-ip "$IP"
        done
        echo -e "${GREEN}Firewall rules added successfully!${NC}"
    fi
fi

echo -e "\n${GREEN}Setup complete! You can now use Azure Cache for Redis with your STAR backend.${NC}"