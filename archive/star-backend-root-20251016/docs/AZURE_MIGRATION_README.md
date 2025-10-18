# STAR Backend Azure Migration Overview

This document provides an overview of the STAR backend migration from Railway to Azure, explaining key changes, benefits, and new development workflows.

## Migration Summary

The STAR backend has been migrated from Railway to Azure App Service to gain benefits in scalability, monitoring, and integration with other Azure services. The migration involved:

1. Creating Azure infrastructure resources (App Service, Redis Cache, Application Insights)
2. Enhancing the codebase with Azure-specific optimizations
3. Setting up CI/CD pipelines with GitHub Actions
4. Configuring monitoring, scaling, and cost management

## Key Benefits

- **Improved Scaling**: Automatic scaling based on CPU, memory, and request queue length
- **Enhanced Monitoring**: Application Insights integration for detailed metrics and tracing
- **Higher Reliability**: Azure Redis Cache with improved connection handling and retry logic
- **Cost Management**: Budget alerts and optimization recommendations
- **CI/CD Integration**: Streamlined deployment with GitHub Actions
- **Environment Separation**: Dedicated staging and production environments

## Architecture Changes

The core architecture remains the same, with a Flask backend connecting to Supabase. Key changes include:

- **Hosting**: Moved from Railway to Azure App Service
- **Caching**: Enhanced Redis implementation for Azure Cache for Redis
- **Monitoring**: Added Application Insights integration
- **Deployment**: GitHub Actions instead of Railway's built-in deployment

## File Structure Updates

New files added during the migration:

```
star-backend/
├── docs/
│   ├── AZURE_MIGRATION_GUIDE.md       # Step-by-step migration instructions
│   ├── AZURE_MIGRATION_CHECKLIST.md   # Migration task tracking
│   ├── AZURE_DEPLOYMENT_REFERENCE.md  # Detailed Azure configuration reference
│   └── AZURE_ENHANCEMENTS.md          # Documentation for Azure-specific enhancements
│
├── tools/
│   ├── setup_app_insights.sh          # Script to set up Application Insights
│   ├── setup_app_insights.cmd         # Windows version
│   ├── setup_azure_redis.sh           # Script to set up Azure Redis Cache
│   ├── setup_azure_redis.cmd          # Windows version
│   ├── setup_autoscaling.sh           # Script to configure autoscaling
│   ├── setup_autoscaling.cmd          # Windows version
│   ├── setup_cost_monitoring.sh       # Script to set up cost monitoring
│   └── setup_cost_monitoring.cmd      # Windows version
│
├── star_backend_flask/
│   └── azure_redis.py                 # Enhanced Redis client for Azure
│
└── .github/
    └── workflows/
        └── azure-deploy.yml           # GitHub Actions workflow for CI/CD
```

## Development Workflow Changes

### Local Development

The local development workflow remains largely unchanged:

```bash
# Navigate to the backend directory
cd star-backend

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
cd star_backend_flask
flask run
```

### Deployment Process

Deployment now happens through GitHub Actions:

1. **Push to main branch**: Automatically deploys to staging
2. **Manual trigger**: Required for production deployment

### Monitoring

Application performance can now be monitored through the Azure portal:

1. Go to the Azure portal
2. Navigate to the Application Insights resource
3. View performance metrics, failures, and dependencies

## Required Configuration Changes

### Environment Variables

New environment variables have been added:

```
APPLICATIONINSIGHTS_CONNECTION_STRING=<app-insights-connection-string>
AZURE_REDIS_URL=<redis-connection-string>
```

### Code Changes for Redis

When using Redis, import the new Azure Redis client:

```python
# Old method
import redis
r = redis.Redis.from_url(os.environ.get('REDIS_URL'))

# New method
from star_backend_flask.azure_redis import init_azure_redis, get_azure_redis
init_azure_redis(os.environ.get('AZURE_REDIS_URL'))
r = get_azure_redis()
```

## Testing with Azure Services

### Redis Testing

Test Azure Redis integration:

```python
from star_backend_flask.azure_redis import init_azure_redis, get_azure_redis

# Initialize with test connection string
init_azure_redis(os.environ.get('AZURE_REDIS_URL'))
redis = get_azure_redis()

# Test operations
redis.set('test_key', 'test_value')
value = redis.get('test_key')
assert value == 'test_value'

# Test health check
health = redis.health_check()
assert health['status'] == 'healthy'
```

### Application Insights Testing

Test Application Insights integration:

```python
import time
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.samplers import ProbabilitySampler
from opencensus.trace.tracer import Tracer

# Create a tracer with Azure exporter
tracer = Tracer(
    exporter=AzureExporter(
        connection_string=os.environ.get('APPLICATIONINSIGHTS_CONNECTION_STRING')
    ),
    sampler=ProbabilitySampler(1.0)
)

# Track an event
with tracer.span(name="test_span"):
    time.sleep(0.1)  # Simulate work
    print("Test span completed")
```

## Troubleshooting Common Issues

### Connection Issues with Azure Redis

If you encounter Redis connection issues:

1. Check if the connection string is correct
2. Verify firewall rules allow your IP
3. Check if SSL is properly configured
4. Use the health check method to diagnose:
   ```python
   redis = get_azure_redis()
   health = redis.health_check()
   print(health)
   ```

### Application Insights Not Reporting

If Application Insights isn't reporting metrics:

1. Verify the connection string is correctly set
2. Check if the instrumentation key is valid
3. Ensure the monitoring module is properly imported
4. Look for errors in the application logs:
   ```bash
   az webapp log tail --name star-backend --resource-group star-production
   ```

## Documentation Resources

For more detailed information, refer to the following documents:

- [Azure Migration Guide](./AZURE_MIGRATION_GUIDE.md) - Detailed migration steps
- [Azure Enhancements](./AZURE_ENHANCEMENTS.md) - Azure-specific code enhancements
- [Azure Deployment Reference](./AZURE_DEPLOYMENT_REFERENCE.md) - Configuration reference
- [Azure Migration Checklist](./AZURE_MIGRATION_CHECKLIST.md) - Task tracking for migration

## Contact and Support

For issues related to the Azure deployment, contact:

- **Azure Support**: [Azure Support Portal](https://azure.microsoft.com/en-us/support/options/)
- **Internal Support**: file an issue in the GitHub repository with tag `azure-migration`
