#!/bin/bash
# Azure App Service Configuration Script for STAR Platform
# This script ensures proper environment variable configuration

echo "Configuring STAR Platform environment variables..."

# Essential application settings
az webapp config appsettings set \
  --name star-app-backend \
  --resource-group star-app-rg-centralus \
  --settings \
    SECRET_KEY="u9rBZF6vpyLXz81mSnt3abEgD7wok0POfqejKUG5McYVJN4ChWAxlTHQsd2RIi" \
    JWT_SECRET_KEY="W4CRXn05Y3zhbucfw9xrgotUNZKO8yBH2sQeImGJSiq7lpkLMPjd6EvFTa1VDA" \
    AZURE_COSMOS_URL="https://star-cosmos-free.documents.azure.com:443/" \
    AZURE_COSMOS_KEY="M51eSqBch5JqN5g4GPIEP02eLXQyOTvDhK3OnJ8ANr6NbqhUJxi2lXXbyrpbblmiRXiYkW18cwykACDbWS8ByA==" \
    AZURE_COSMOS_DATABASE="star-db" \
    COSMOS_DB_CONNECTION_STRING="AccountEndpoint=https://star-cosmos-free.documents.azure.com:443/;AccountKey=M51eSqBch5JqN5g4GPIEP02eLXQyOTvDhK3OnJ8ANr6NbqhUJxi2lXXbyrpbblmiRXiYkW18cwykACDbWS8ByA==;" \
    FLASK_ENV="production" \
    PYTHONPATH="/home/site/wwwroot"

echo "Environment variables configured successfully!"

# Restart the app service to apply changes
echo "Restarting Azure App Service..."
az webapp restart --name star-app-backend --resource-group star-app-rg-centralus

echo "Configuration complete! Application should be available at:"
echo "https://star-app-backend.azurewebsites.net"