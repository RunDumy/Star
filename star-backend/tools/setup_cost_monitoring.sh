#!/bin/bash
# Script to set up cost monitoring and budget alerts for Azure resources

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up cost monitoring and budget alerts for STAR backend on Azure...${NC}"

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
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
RESOURCE_GROUP=${1:-"star-backend-rg"}
MONTHLY_BUDGET_AMOUNT=${2:-100}
ALERT_EMAIL=${3:-"admin@example.com"}
CONTACT_NAME=${4:-"STAR Admin"}

echo -e "${BLUE}Using the following configuration:${NC}"
echo "- Subscription ID: $SUBSCRIPTION_ID"
echo "- Resource Group: $RESOURCE_GROUP"
echo "- Monthly Budget Amount: \$$MONTHLY_BUDGET_AMOUNT"
echo "- Alert Email: $ALERT_EMAIL"
echo "- Contact Name: $CONTACT_NAME"

# Confirm before proceeding
read -p "Do you want to continue with these settings? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Operation cancelled.${NC}"
    exit 1
fi

# Check if resource group exists
echo -e "${BLUE}Checking if resource group exists...${NC}"
az group show --name "$RESOURCE_GROUP" &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}Resource group $RESOURCE_GROUP does not exist.${NC}"
    exit 1
fi

# Create budget alert
echo -e "${BLUE}Creating budget alert for the resource group...${NC}"

# First, get the scope
SCOPE="/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP"

# Create action group for alerts
echo -e "${BLUE}Creating action group for budget alerts...${NC}"
az monitor action-group create \
    --name "STAR-Budget-Alerts" \
    --resource-group "$RESOURCE_GROUP" \
    --short-name "BudgetAlert" \
    --action email "$CONTACT_NAME" "$ALERT_EMAIL"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create action group for alerts.${NC}"
    exit 1
fi

# Get action group ID
ACTION_GROUP_ID=$(az monitor action-group show \
    --name "STAR-Budget-Alerts" \
    --resource-group "$RESOURCE_GROUP" \
    --query id -o tsv)

# Create budget with alerts
echo -e "${BLUE}Creating budget with alerts...${NC}"
az consumption budget create \
    --budget-name "STAR-Monthly-Budget" \
    --amount "$MONTHLY_BUDGET_AMOUNT" \
    --time-grain "Monthly" \
    --time-period "$(date +'%Y-%m-01')" \
    --scope "$SCOPE" \
    --category "Cost" \
    --notifications "actual_50=ActualCost>=50;Percentage;STAR-Budget-Alerts;${ALERT_EMAIL}" \
    --notifications "actual_80=ActualCost>=80;Percentage;STAR-Budget-Alerts;${ALERT_EMAIL}" \
    --notifications "actual_100=ActualCost>=100;Percentage;STAR-Budget-Alerts;${ALERT_EMAIL}" \
    --notifications "forecasted_100=ForecastedCost>=100;Percentage;STAR-Budget-Alerts;${ALERT_EMAIL}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create budget. This could be due to insufficient permissions or because the consumption feature is not registered.${NC}"
    echo -e "${BLUE}Attempting to register Microsoft.Consumption provider...${NC}"
    
    az provider register --namespace "Microsoft.Consumption"
    echo -e "${BLUE}Please wait a few minutes for the registration to complete, then run this script again.${NC}"
    exit 1
fi

# Create cost analysis export
echo -e "${BLUE}Setting up daily cost export to storage...${NC}"

# Create storage account for cost data
STORAGE_ACCOUNT_NAME="starcostexport$(date +'%s')"
echo -e "${BLUE}Creating storage account $STORAGE_ACCOUNT_NAME...${NC}"

az storage account create \
    --name "$STORAGE_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$(az group show --name "$RESOURCE_GROUP" --query location -o tsv)" \
    --sku "Standard_LRS" \
    --kind "StorageV2"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create storage account for cost export.${NC}"
    exit 1
fi

# Create container
echo -e "${BLUE}Creating storage container for cost data...${NC}"
STORAGE_KEY=$(az storage account keys list \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --query "[0].value" -o tsv)

az storage container create \
    --name "costdata" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --account-key "$STORAGE_KEY"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create storage container for cost data.${NC}"
    exit 1
fi

# Set up cost export
echo -e "${BLUE}Setting up scheduled cost export...${NC}"

STORAGE_ACCOUNT_ID=$(az storage account show \
    --name "$STORAGE_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query id -o tsv)

az costmanagement export create \
    --name "DailyCostExport" \
    --type "ActualCost" \
    --scope "subscriptions/$SUBSCRIPTION_ID" \
    --storage-account-id "$STORAGE_ACCOUNT_ID" \
    --storage-container "costdata" \
    --timeframe "MonthToDate" \
    --recurrence "Daily" \
    --recurrence-period "from=$(date +'%Y-%m-%d')T00:00:00Z to=$(date -d '10 years' +'%Y-%m-%d')T00:00:00Z" \
    --schedule "StartDate=$(date +'%Y-%m-%d')T00:00:00Z EndDate=$(date -d '10 years' +'%Y-%m-%d')T00:00:00Z Recurrence=Daily" \
    --dataset-configuration "granularity=Daily columns=Date,ResourceId,ResourceType,ResourceLocation,ResourceGroupName,ServiceName,ServiceTier,Meter,MeterCategory,MeterSubCategory,Product"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set up cost export. This might require additional permissions.${NC}"
else
    echo -e "${GREEN}Cost export set up successfully.${NC}"
fi

# Generate cost optimization recommendations
echo -e "${BLUE}Generating cost optimization recommendations...${NC}"
az advisor recommendation list \
    --filter "Category eq 'Cost'" \
    --query "[?contains(resourceMetadata.resourceId, '$RESOURCE_GROUP')].{Impact:impact, Recommendation:shortDescription.solution, Resource:resourceMetadata.resourceName, ResourceType:resourceMetadata.resourceType, AnnualSavings:extendedProperties.annualSavingsAmount}" \
    -o table

echo -e "${GREEN}Cost monitoring setup completed for STAR backend on Azure!${NC}"
echo -e "${BLUE}Budget alerts will be sent to $ALERT_EMAIL when costs reach 50%, 80%, and 100% of \$$MONTHLY_BUDGET_AMOUNT.${NC}"
echo -e "${BLUE}Daily cost data will be exported to the storage account $STORAGE_ACCOUNT_NAME.${NC}"
echo -e "\n${BLUE}Additional cost management recommendations:${NC}"
echo "1. Use Azure Advisor regularly to check for cost optimization opportunities"
echo "2. Set up scheduled VM shutdowns for development/test environments"
echo "3. Use Azure Reserved Instances for predictable workloads"
echo "4. Consider Azure Spot Instances for batch processing jobs"
echo "5. Implement auto-scaling to match resource allocation with demand"

echo -e "\n${BLUE}You can access cost management in the Azure portal:${NC}"
echo "https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/costanalysis/scope/%2Fsubscriptions%2F$SUBSCRIPTION_ID%2FresourceGroups%2F$RESOURCE_GROUP"