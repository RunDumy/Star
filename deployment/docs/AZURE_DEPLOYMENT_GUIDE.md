# STAR App - Azure Deployment Guide

This guide provides detailed instructions for deploying the STAR application on Microsoft Azure. It replaces the previous Railway deployment guide.

## Prerequisites

1. Azure account with active subscription
2. Azure CLI installed and authenticated
3. Git installed (for local Git deployment)
4. Node.js and npm (for frontend deployment)

## Architecture Overview

The STAR application uses a modern cloud-native architecture:

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Flask API deployed on Azure App Service
- **Database**: Azure Cosmos DB (NoSQL) for global distribution
- **Storage**: Azure Blob Storage for media files
- **Cache**: Azure Cache for Redis (optional)
- **Real-time**: Azure Web PubSub for live features

## Backend Deployment Process

### 1. Set Up Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name star-app-rg --location eastus

# Create App Service plan (Linux)
az appservice plan create --name star-app-plan --resource-group star-app-rg --sku B1 --is-linux

# Create Web App with Python runtime
az webapp create --name star-app-backend --resource-group star-app-rg --plan star-app-plan --runtime "PYTHON|3.10"

# Configure startup command and Python version
az webapp config set --name star-app-backend --resource-group star-app-rg --linux-fx-version "PYTHON|3.10" --startup-file "gunicorn --chdir star_backend_flask app:app"

# Enable WebSockets for real-time features
az webapp config set --name star-app-backend --resource-group star-app-rg --web-sockets-enabled true
```

### 2. Set Environment Variables

```bash
# Set environment variables for the backend
az webapp config appsettings set --name star-app-backend --resource-group star-app-rg --settings \
SECRET_KEY="your-secret-key" \
JWT_SECRET_KEY="your-jwt-secret-key" \
JWT_ALGORITHM="HS256" \
COSMOS_DB_CONNECTION_STRING="your-cosmos-connection-string" \
COSMOS_DB_DATABASE_NAME="star-db" \
AZURE_STORAGE_CONNECTION_STRING="your-storage-connection-string" \
SPOTIFY_CLIENT_ID="your-spotify-client-id" \
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret" \
IPGEOLOCATION_API_KEY="your-ipgeo-api-key" \
ALLOWED_ORIGINS="https://your-frontend-url.com,http://localhost:3000" \
REDIS_URL="redis://your-azure-redis-connection-string" \
SCM_DO_BUILD_DURING_DEPLOYMENT=true \
PYTHONPATH="/home/site/wwwroot"
```

### 3. Deploy Backend Code

#### Option 1: Local Git Deployment

```bash
# Configure local Git deployment
az webapp deployment source config-local-git --name star-app-backend --resource-group star-app-rg

# Get Git deployment URL
DEPLOY_URL=$(az webapp deployment list-publishing-credentials --name star-app-backend --resource-group star-app-rg --query scmUri -o tsv)

# Push code to Azure
cd star-backend
git init
git add .
git commit -m "Initial Azure deployment"
git remote add azure $DEPLOY_URL
git push azure master
```

#### Option 2: ZIP Deployment

```bash
# Create a ZIP file of your backend code
cd /path/to/star
powershell Compress-Archive -Path .\star-backend\* -DestinationPath .\star-backend-deploy.zip -Force

# Deploy the ZIP file
az webapp deployment source config-zip --resource-group star-app-rg --name star-app-backend --src star-backend-deploy.zip
```

#### Option 3: GitHub Actions

1. Add Azure credentials to your GitHub repository secrets
2. Create a GitHub workflow file (`.github/workflows/azure-deploy.yml`)

### 4. Set Up Azure Redis Cache (Optional)

```bash
# Create a Redis instance
az redis create --name star-app-redis --resource-group star-app-rg --location eastus --sku Basic --vm-size C0

# Get Redis access keys
REDIS_KEY=$(az redis list-keys --name star-app-redis --resource-group star-app-rg --query primaryKey -o tsv)

# Set the REDIS_URL environment variable
az webapp config appsettings set --name star-app-backend --resource-group star-app-rg --settings REDIS_URL="redis://default:${REDIS_KEY}@star-app-redis.redis.cache.windows.net:6380?ssl=true"
```

## Frontend Configuration

### 1. Update Frontend Environment Variables

Create or update `.env.local` in the `star-frontend` directory:

```
NEXT_PUBLIC_API_URL=https://star-app-backend.azurewebsites.net
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Deploy Frontend to Vercel

```bash
cd star-frontend
vercel --prod
```

Also update environment variables in Vercel dashboard to point to the Azure backend.

## Verifying Deployment

1. Check backend health:

   ```bash
   curl https://star-app-backend.azurewebsites.net/api/health
   ```

2. Check frontend connectivity:
   - Open the deployed frontend URL
   - Verify API calls to backend are successful
   - Test key features (authentication, feed, real-time updates)

## Monitoring and Logs

### Azure App Service Logs

```bash
# Stream logs in real-time
az webapp log tail --name star-app-backend --resource-group star-app-rg

# Download logs
az webapp log download --name star-app-backend --resource-group star-app-rg --log-file app_logs.zip
```

### Application Insights (Optional)

For advanced monitoring, consider setting up Application Insights:

```bash
# Create Application Insights
az monitor app-insights component create --app star-app-insights --resource-group star-app-rg --location eastus

# Get the instrumentation key
APPINSIGHTS_KEY=$(az monitor app-insights component show --app star-app-insights --resource-group star-app-rg --query instrumentationKey -o tsv)

# Add to App Service settings
az webapp config appsettings set --name star-app-backend --resource-group star-app-rg --settings APPINSIGHTS_INSTRUMENTATIONKEY=$APPINSIGHTS_KEY
```

## Common Issues and Troubleshooting

### CORS Errors

If you encounter CORS errors, verify the ALLOWED_ORIGINS environment variable includes your frontend domain.

### Connection Issues

If the frontend cannot connect to the backend:

- Verify the NEXT_PUBLIC_API_URL in frontend configuration
- Check network settings in Azure App Service
- Ensure WebSockets are enabled if using Socket.IO

### Redis Connection Failures

If Redis connection fails:

- Verify the REDIS_URL format is correct
- Check Azure Redis firewall settings
- Ensure Redis SSL certificate is trusted

## Scaling Considerations

To handle increased traffic:

- Scale up App Service plan (vertical scaling)
- Enable autoscaling (horizontal scaling)
- Upgrade Redis Cache tier for improved performance

## Cost Optimization

- Use Azure Cost Management to monitor expenses
- Consider scaling down during low traffic periods
- Implement proper caching strategies to reduce database load
