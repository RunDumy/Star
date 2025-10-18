# Railway to Azure Migration Guide for STAR Backend

This guide provides step-by-step instructions for migrating the STAR backend from Railway to Azure App Service.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Migration Steps](#migration-steps)
  - [1. Prepare Azure Environment](#1-prepare-azure-environment)
  - [2. Set Up Database Connection](#2-set-up-database-connection)
  - [3. Implement Azure-Specific Enhancements](#3-implement-azure-specific-enhancements)
  - [4. Configure CI/CD Pipeline](#4-configure-cicd-pipeline)
  - [5. Migrate Secrets and Environment Variables](#5-migrate-secrets-and-environment-variables)
  - [6. Test Staging Environment](#6-test-staging-environment)
  - [7. Switch Production Traffic](#7-switch-production-traffic)
  - [8. Post-Migration Tasks](#8-post-migration-tasks)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Rollback Plan](#rollback-plan)
- [References](#references)

## Prerequisites

Before beginning the migration, ensure you have:

- Azure CLI installed and configured
- Azure subscription with appropriate permissions
- GitHub repository access with admin privileges
- Local development environment with Docker installed
- Supabase database credentials
- Railway environment variables exported

## Migration Steps

### 1. Prepare Azure Environment

#### Create Resource Group

```bash
az group create --name star-production --location eastus
```

#### Set Up App Service Plan

```bash
az appservice plan create \
    --name star-app-service-plan \
    --resource-group star-production \
    --sku P1V2 \
    --is-linux
```

#### Create App Service for Staging

```bash
az webapp create \
    --resource-group star-production \
    --plan star-app-service-plan \
    --name star-backend-staging \
    --runtime "PYTHON|3.10" \
    --deployment-container-image-name mcr.microsoft.com/azure-app-service/python:3.10
```

#### Create App Service for Production

```bash
az webapp create \
    --resource-group star-production \
    --plan star-app-service-plan \
    --name star-backend \
    --runtime "PYTHON|3.10" \
    --deployment-container-image-name mcr.microsoft.com/azure-app-service/python:3.10
```

### 2. Set Up Database Connection

The STAR backend uses Supabase as its database. We'll continue to use the same Supabase instance.

#### Configure Supabase Connection

1. Ensure the existing Supabase instance is accessible from Azure App Service
2. Update firewall rules if necessary to allow Azure App Service IP ranges:

```bash
# Get outbound IPs for the App Service
OUTBOUND_IPS=$(az webapp show --name star-backend --resource-group star-production --query "outboundIpAddresses" -o tsv)

# For each IP, add it to Supabase allowlist (do this in Supabase dashboard)
echo "Add these IPs to Supabase dashboard:"
echo $OUTBOUND_IPS
```

#### Test Supabase Connection

Create a test endpoint to verify the Supabase connection is working correctly:

```python
@app.route('/api/test-db-connection')
def test_db_connection():
    try:
        # Test a simple query
        data = supabase.table('users').select('id').limit(1).execute()
        return jsonify({"status": "success", "data": data.data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
```

### 3. Implement Azure-Specific Enhancements

For optimal performance and reliability on Azure, implement the following enhancements:

#### Set Up Application Insights

```bash
cd star-backend/tools
./setup_app_insights.sh star-production star-backend eastus
```

#### Configure Azure Redis Cache

```bash
cd star-backend/tools
./setup_azure_redis.sh star-production eastus star-redis-cache Standard C1
```

Update your code to use the Azure Redis client:

```python
from star_backend_flask.azure_redis import init_azure_redis, get_azure_redis

# In your app initialization
init_azure_redis(os.environ.get('AZURE_REDIS_URL'))

# When you need to use Redis
redis = get_azure_redis()
```

#### Set Up Autoscaling

```bash
cd star-backend/tools
./setup_autoscaling.sh star-production star-app-service-plan 2 10 3
```

### 4. Configure CI/CD Pipeline

#### Set Up GitHub Secrets

Add the following secrets to your GitHub repository:

1. `AZURE_CREDENTIALS`: Service principal credentials (JSON)
2. `REGISTRY_LOGIN_SERVER`: Container registry server
3. `REGISTRY_USERNAME`: ACR username
4. `REGISTRY_PASSWORD`: ACR password
5. `SUPABASE_URL`: Supabase URL
6. `SUPABASE_KEY`: Supabase key
7. `SLACK_WEBHOOK_URL`: Slack webhook for notifications

To create service principal and get credentials:

```bash
az ad sp create-for-rbac --name "star-backend-github" --role contributor \
    --scopes /subscriptions/{subscription-id}/resourceGroups/star-production \
    --sdk-auth
```

#### Configure GitHub Actions Workflow

The workflow file is already in place at `.github/workflows/azure-deploy.yml`.

This workflow will:

- Build and test the application
- Deploy to staging on pushes to main branch
- Deploy to production when manually triggered

### 5. Migrate Secrets and Environment Variables

Export your environment variables from Railway:

```bash
railway variables export --environment production > railway_vars.env
```

Set these environment variables in Azure App Service:

```bash
# Parse the Railway environment file and set variables in Azure
while IFS='=' read -r key value
do
  # Skip empty lines and comments
  if [[ -z "$key" || "$key" =~ ^# ]]; then
    continue
  fi

  echo "Setting $key"
  az webapp config appsettings set \
    --resource-group star-production \
    --name star-backend \
    --settings "$key=$value"
done < railway_vars.env

# Do the same for staging
while IFS='=' read -r key value
do
  # Skip empty lines and comments
  if [[ -z "$key" || "$key" =~ ^# ]]; then
    continue
  fi

  echo "Setting $key for staging"
  az webapp config appsettings set \
    --resource-group star-production \
    --name star-backend-staging \
    --settings "$key=$value"
done < railway_vars.env
```

Add Azure-specific environment variables:

```bash
# For both production and staging
for app in star-backend star-backend-staging
do
  az webapp config appsettings set \
    --resource-group star-production \
    --name $app \
    --settings \
      "APPLICATIONINSIGHTS_CONNECTION_STRING=<app-insights-connection-string>" \
      "AZURE_REDIS_URL=<redis-connection-string>" \
      "SCM_DO_BUILD_DURING_DEPLOYMENT=true" \
      "WEBSITE_HTTPLOGGING_RETENTION_DAYS=7"
done
```

### 6. Test Staging Environment

Deploy to staging using the GitHub Actions workflow:

1. Go to the Actions tab in your GitHub repository
2. Select "STAR Backend CI/CD for Azure" workflow
3. Click "Run workflow"
4. Select "staging" as the target environment
5. Click "Run workflow"

Once deployed, perform the following tests:

1. **Health Check**: Verify the `/api/health` endpoint returns success
2. **Functional Tests**: Run the test suite against the staging environment
3. **Performance Tests**: Run load tests using the Azure Load Testing service

```bash
cd star-backend/tools
./run_load_test.sh star-production star-backend-staging
```

### 7. Switch Production Traffic

After verifying the staging environment works correctly:

1. Deploy to production using the GitHub Actions workflow
2. Update DNS settings to point to the Azure App Service

```bash
# Get the default hostname for the production App Service
AZURE_HOSTNAME=$(az webapp show --name star-backend --resource-group star-production --query "defaultHostName" -o tsv)

echo "Update your DNS to point to: $AZURE_HOSTNAME"
```

3. Set up a custom domain in Azure App Service

```bash
az webapp config hostname add --webapp-name star-backend \
    --resource-group star-production \
    --hostname api.yourdomain.com
```

4. Add SSL certificate

```bash
# Generate a free certificate
az webapp config ssl create --resource-group star-production \
    --name star-backend --hostname api.yourdomain.com
```

### 8. Post-Migration Tasks

#### Set Up Cost Monitoring

```bash
cd star-backend/tools
./setup_cost_monitoring.sh star-production 500 alerts@yourdomain.com "STAR Backend Team"
```

#### Set Up Backup

```bash
# Create a storage account for backups
az storage account create \
    --name starbackendbackups \
    --resource-group star-production \
    --location eastus \
    --sku Standard_LRS

# Configure backup for the App Service
az webapp config backup create \
    --resource-group star-production \
    --webapp-name star-backend \
    --container-url "<SAS-URL-for-backup-container>" \
    --frequency 1d
```

## Monitoring and Maintenance

### Azure Monitor and Application Insights

1. **Application Dashboard**: Access the Application Insights dashboard to monitor:

   - Request rates and response times
   - Dependency calls and failure rates
   - Exception rates and types
   - Custom events and metrics

2. **Set Up Alerts**: Configure alerts for:
   - High error rates (>1%)
   - Slow response times (>1s)
   - High CPU/memory usage (>80%)
   - Failed dependency calls

### Ongoing Maintenance

1. **Regular Updates**:

   - Deploy updates using the CI/CD pipeline
   - Test changes in staging before production

2. **Scaling**:

   - Monitor usage patterns and adjust autoscaling rules as needed

3. **Cost Optimization**:
   - Review the cost report monthly
   - Identify and address any unexpected cost increases

## Rollback Plan

If issues are encountered during or after migration:

1. **Issues in Production**:

   - Roll back to the previous successful deployment using GitHub Actions
   - If still problematic, redirect traffic back to Railway

2. **Complete Rollback Procedure**:
   - Update DNS to point back to Railway
   - Re-enable the Railway service
   - Ensure all recent data is synchronized

## References

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [GitHub Actions for Azure](https://docs.microsoft.com/en-us/azure/developer/github/github-actions)
- [Azure Redis Cache Documentation](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [STAR Backend Azure Enhancements](./AZURE_ENHANCEMENTS.md)
