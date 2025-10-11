# Azure Deployment Reference for STAR Backend

This document provides reference information for the Azure deployment of the STAR backend application, including resource specifications, configuration details, and troubleshooting procedures.

## Azure Resources Reference

### Resource Group

- **Name**: star-production
- **Location**: East US (or your preferred region)
- **Purpose**: Contains all Azure resources for the STAR backend application

### App Service Plan

- **Name**: star-app-service-plan
- **SKU**: P1V2 (recommended starting point)
- **Operating System**: Linux
- **Purpose**: Hosts the App Service instances for the application

### App Service

- **Names**:
  - star-backend (production)
  - star-backend-staging (staging)
- **Runtime**: Python 3.10
- **Deployment Method**: Container (via GitHub Actions)
- **Configuration**:
  - Always On: Enabled
  - ARR Affinity: Disabled
  - HTTP 2.0: Enabled
  - HTTPS Only: Enabled

### Container Registry

- **Name**: starbackendacr
- **SKU**: Standard
- **Purpose**: Stores Docker images for the application
- **Admin User**: Disabled (uses service principal authentication)

### Azure Redis Cache

- **Name**: star-redis-cache
- **SKU**: Standard C1 (1GB, recommended starting point)
- **Configuration**:
  - Non-SSL Port: Disabled
  - Minimum TLS Version: 1.2
  - Redis Version: 6.0
  - Persistence: Disabled
  - Clustering: Disabled

### Application Insights

- **Name**: star-backend-insights
- **Pricing Model**: Pay-as-you-go
- **Retention Period**: 90 days
- **Configuration**:
  - Sampling: Enabled (10%)
  - Profiler: Enabled
  - Snapshot Debugger: Disabled

## Environment Variables Reference

### Required Environment Variables

| Variable Name | Purpose                     | Source                     |
| ------------- | --------------------------- | -------------------------- |
| SUPABASE_URL  | Supabase connection URL     | Supabase Dashboard         |
| SUPABASE_KEY  | Supabase API key            | Supabase Dashboard         |
| FLASK_APP     | Path to Flask application   | star_backend_flask/app.py  |
| FLASK_ENV     | Flask environment           | production                 |
| SECRET_KEY    | For Flask sessions & tokens | Generate secure random key |

### Azure-Specific Environment Variables

| Variable Name                         | Purpose                         | Source                 |
| ------------------------------------- | ------------------------------- | ---------------------- |
| APPLICATIONINSIGHTS_CONNECTION_STRING | Application Insights connection | App Insights Resource  |
| AZURE_REDIS_URL                       | Redis connection string         | Redis Cache Resource   |
| WEBSITE_HTTPLOGGING_RETENTION_DAYS    | Retention of HTTP logs          | Set to 7 (recommended) |
| SCM_DO_BUILD_DURING_DEPLOYMENT        | Enable build during deployment  | Set to true            |

## Deployment Process Details

### GitHub Actions Workflow

The workflow file `.github/workflows/azure-deploy.yml` contains the CI/CD pipeline definition:

1. **Build Phase**:

   - Checkout code
   - Set up Python 3.10
   - Install dependencies
   - Run tests
   - Build Docker image
   - Push to Azure Container Registry

2. **Staging Deployment**:

   - Automatic on push to main branch
   - Deploys to star-backend-staging
   - Runs health check after deployment
   - Notifies on Slack

3. **Production Deployment**:
   - Manual trigger (workflow_dispatch)
   - Deploys to star-backend
   - Runs smoke tests
   - Notifies on Slack

### Deployment Commands Reference

To manually deploy via Azure CLI:

```bash
# Deploy to staging
az webapp deploy --resource-group star-production \
  --name star-backend-staging \
  --src-path star-backend.zip \
  --type zip

# Deploy to production
az webapp deploy --resource-group star-production \
  --name star-backend \
  --src-path star-backend.zip \
  --type zip
```

## Monitoring and Logging Reference

### Application Insights Queries

**Error Rate Query**:

```kusto
requests
| where timestamp > ago(24h)
| summarize ErrorCount=sumif(itemCount, success == false),
    RequestCount=sum(itemCount) by bin(timestamp, 1h)
| extend ErrorRate = ErrorCount*100.0/RequestCount
| render timechart
```

**Performance Query**:

```kusto
requests
| where timestamp > ago(24h)
| summarize RequestCount=sum(itemCount),
    AverageDuration=avg(duration),
    percentiles(duration, 50, 95, 99) by bin(timestamp, 1h)
| render timechart
```

**Dependency Performance Query**:

```kusto
dependencies
| where timestamp > ago(24h)
| where type == "Redis" or type == "SQL"
| summarize AvgDuration=avg(duration), Count=count() by bin(timestamp, 1h), type
| render timechart
```

### Log Retention Policy

- **App Service Logs**: 7 days
- **Application Insights**: 90 days
- **Activity Logs**: 90 days
- **Diagnostic Logs**: 30 days

## Scaling Reference

### Autoscaling Rules

- **Scale Out**: CPU > 75% for 5 minutes, add 1-2 instances
- **Scale In**: CPU < 25% for 10 minutes, remove 1 instance
- **Scale Limits**: Minimum 2, Maximum 10 instances
- **Scale Schedule**:
  - Business hours (9am-5pm): Minimum 3 instances
  - Off hours: Minimum 2 instances

### Manual Scaling Commands

```bash
# Scale to specific instance count
az appservice plan update --name star-app-service-plan \
  --resource-group star-production \
  --number-of-workers 5
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Application Not Starting

**Symptoms**:

- 503 Service Unavailable errors
- App Service shows "Stopped" or "Starting"

**Troubleshooting Steps**:

1. Check application logs:
   ```bash
   az webapp log tail --name star-backend --resource-group star-production
   ```
2. Verify environment variables are set correctly
3. Check for startup script errors in Kudu console

#### 2. High Redis Latency

**Symptoms**:

- Slow API responses
- Redis dependency calls taking > 100ms

**Troubleshooting Steps**:

1. Check Redis metrics in Azure portal
2. Verify connection pooling is properly configured
3. Check for network issues between App Service and Redis Cache
4. Consider scaling up Redis Cache SKU

#### 3. Memory Pressure

**Symptoms**:

- Application restarts
- Out of memory errors in logs

**Troubleshooting Steps**:

1. Check memory usage in App Service metrics
2. Review Python memory profiling
3. Check for memory leaks
4. Consider scaling up App Service plan

## Backup and Recovery

### Backup Procedure

1. Database backup (Supabase)

   - Automated nightly backups
   - Retention: 7 days

2. App Service backup
   - Configuration: Daily backups to Azure Storage
   - Retention: 30 days

### Recovery Procedure

1. **Database Restore**:

   - Access Supabase dashboard
   - Select backup point
   - Restore to temporary database
   - Verify data
   - Swap with production

2. **App Service Restore**:
   - Access App Service in Azure portal
   - Go to Backups
   - Select backup point
   - Restore to staging slot
   - Verify functionality
   - Swap with production

## Security Configuration

### SSL/TLS Settings

- Minimum TLS Version: 1.2
- HTTPS Only: Enabled
- HTTP/2: Enabled

### Network Security

- Redis Firewall: Only allows App Service outbound IPs
- App Service: Uses VNet integration for enhanced security
- Supabase: IP restrictions for App Service

### Authentication

- App Service Authentication: Disabled (handled by application)
- Backend API Authentication: JWT-based token authentication

## Cost Optimization

### Cost-Saving Recommendations

1. **Right-sizing**:

   - Monitor actual usage vs. provisioned capacity
   - Adjust App Service plan SKU based on usage patterns

2. **Dev/Test Environments**:

   - Use lower-tier App Service plans for non-production
   - Implement auto-shutdown for dev environments

3. **Reserved Instances**:
   - Consider 1-year or 3-year reservations for stable components
   - Applies to App Service plans and Redis Cache

### Budget Controls

- Monthly budget alert at 50%, 80%, 90% thresholds
- Resource tagging for cost allocation
- Regular cost reviews scheduled

## Reference Documentation

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Redis Cache Documentation](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [Azure Security Best Practices](https://docs.microsoft.com/en-us/azure/security/fundamentals/overview)
- [Azure Cost Management Documentation](https://docs.microsoft.com/en-us/azure/cost-management-billing/)
