#!/bin/bash

# Script to set up and run Azure Load Tests for STAR backend
# This script requires the Azure CLI and jq

# Parameters
RESOURCE_GROUP="star-app-rg"
LOCATION="eastus"
LOAD_TEST_NAME="star-load-test"
TEST_RUN_NAME="star-loadtest-run-$(date +%Y%m%d%H%M)"
TEST_PLAN_FILE="./star-load-test-plan.jmx"

# Check dependencies
echo "Checking dependencies..."
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Please install it first."
    exit 1
fi

# Create Azure Load Testing resource if it doesn't exist
echo "Checking if Azure Load Testing resource exists..."
if ! az load test show --name $LOAD_TEST_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo "Creating Azure Load Testing resource..."
    az load test create --name $LOAD_TEST_NAME --resource-group $RESOURCE_GROUP --location $LOCATION
else
    echo "Azure Load Testing resource already exists."
fi

# Upload test plan
echo "Uploading JMX test plan..."
TEST_ID=$(az load test-file upload --load-test-resource $LOAD_TEST_NAME --resource-group $RESOURCE_GROUP --file-path $TEST_PLAN_FILE --output json | jq -r '.testId')
echo "Test ID: $TEST_ID"

# Create test
echo "Creating test run..."
az load test create --load-test-resource $LOAD_TEST_NAME --resource-group $RESOURCE_GROUP \
  --test-id $TEST_ID \
  --display-name $TEST_RUN_NAME \
  --description "Load test for STAR backend on Azure" \
  --engine-instances 1 \
  --error-percentage 5 \
  --avg-response-time 100

# Start test
echo "Starting load test run..."
RUN_ID=$(az load test-run start --load-test-resource $LOAD_TEST_NAME --resource-group $RESOURCE_GROUP --test-id $TEST_ID --output json | jq -r '.testRunId')

echo "Test run started with ID: $RUN_ID"
echo "You can monitor the test in the Azure portal."

# Check test status every 30 seconds
echo "Monitoring test run status..."
while true; do
    STATUS=$(az load test-run show --load-test-resource $LOAD_TEST_NAME --resource-group $RESOURCE_GROUP --test-run-id $RUN_ID --output json | jq -r '.status')
    echo "Current status: $STATUS"
    
    if [ "$STATUS" == "DONE" ] || [ "$STATUS" == "FAILED" ] || [ "$STATUS" == "CANCELLED" ]; then
        break
    fi
    
    sleep 30
done

# Get test results
echo "Test completed with status: $STATUS"
echo "Downloading test results..."
RESULTS_FILE="${TEST_RUN_NAME}_results.zip"
az load test-run download-files --load-test-resource $LOAD_TEST_NAME --resource-group $RESOURCE_GROUP --test-run-id $RUN_ID --path ./ --name $RESULTS_FILE

echo "Test results downloaded to $RESULTS_FILE"

# If the test failed, exit with error
if [ "$STATUS" == "FAILED" ]; then
    echo "Load test failed!"
    exit 1
fi

echo "Load test completed successfully!"