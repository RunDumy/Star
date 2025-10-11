# STAR Backend Azure Enhancements Guide

This guide provides detailed information about the Azure-specific enhancements implemented for the STAR backend application during the migration from Railway to Azure.

## Table of Contents

- [Azure Redis Cache Integration](#azure-redis-cache-integration)
- [Monitoring with Application Insights](#monitoring-with-application-insights)
- [Autoscaling Configuration](#autoscaling-configuration)
- [Cost Monitoring](#cost-monitoring)
- [CI/CD with GitHub Actions](#cicd-with-github-actions)

## Azure Redis Cache Integration

The enhanced Redis integration (`azure_redis.py`) provides improved reliability and performance when working with Azure Cache for Redis.

### Features

- **SSL Encryption**: Secure connections to Azure Redis Cache (default port 6380)
- **Connection Pooling**: Optimized connection management with configurable pool size
- **Automatic Reconnection**: Smart reconnection logic with backoff
- **Retry Logic**: Automatic retries for transient failures
- **Performance Metrics**: Integration with Application Insights for performance tracking
- **Health Checking**: Built-in health check functionality

### Usage

```python
from star_backend_flask.azure_redis import init_azure_redis, get_azure_redis

# Initialize Azure Redis with connection string
init_azure_redis(os.environ.get('AZURE_REDIS_URL'))

# Get Redis manager instance
redis = get_azure_redis()

# Basic operations
redis.set('key', 'value', ex=300)  # With expiration (5 minutes)
value = redis.get('key')

# JSON operations
user_data = {'name': 'John', 'score': 95}
redis.set_json('user:123', user_data)
retrieved_data = redis.get_json('user:123')

# Health check
health_status = redis.health_check()
```

### Setup

Use the provided scripts to set up Azure Cache for Redis:

```bash
# For Linux/macOS
cd star-backend/tools
./setup_azure_redis.sh [resource-group] [location] [redis-name] [sku] [vm-size]

# For Windows
cd star-backend\tools
setup_azure_redis.cmd [resource-group] [location] [redis-name] [sku] [vm-size]
```

These scripts will:

1. Create or validate the resource group
2. Create an Azure Cache for Redis instance
3. Configure SSL and firewall rules
4. Generate connection strings
5. Add firewall rules for App Service outbound IPs

## Monitoring with Application Insights

The monitoring module (`monitoring.py`) integrates Azure Application Insights for comprehensive application monitoring.

### Features

- **Request Tracking**: Track HTTP requests and response times
- **Dependency Tracking**: Monitor Redis operations and other dependencies
- **Custom Metrics**: Record metrics for feed requests, recommendation requests, etc.
- **Exception Tracking**: Automatic capture of unhandled exceptions
- **Log Integration**: Seamless integration with Python's logging module

### Usage

```python
from star_backend_flask.monitoring import setup_monitoring, Metrics

# In your Flask app initialization
app = Flask(__name__)
setup_monitoring(app)

# Record custom metrics
@app.route('/api/recommendations')
@Metrics.timed_operation(metric_type='http')
def get_recommendations():
    Metrics.record_recommendation_request()
    # Implementation...
    return jsonify(recommendations)

# Track Redis operations
@Metrics.timed_operation(metric_type='redis')
def cache_operation():
    # Redis operations...
    pass
```

### Setup

Use the provided scripts to set up Application Insights:

```bash
# For Linux/macOS
cd star-backend/tools
./setup_app_insights.sh [resource-group] [app-name] [location]

# For Windows
cd star-backend\tools
setup_app_insights.cmd [resource-group] [app-name] [location]
```

These scripts will:

1. Create an Application Insights resource
2. Configure the instrumentation key
3. Set up the connection string
4. Create a monitoring dashboard

## Autoscaling Configuration

Autoscaling allows the STAR backend to automatically adjust resources based on demand.

### Features

- **CPU-Based Scaling**: Scale out when CPU > 75%, scale in when CPU < 25%
- **Memory-Based Scaling**: Scale out when memory usage > 75%
- **HTTP Queue Scaling**: Scale out when request queue length > 100
- **Schedule-Based Scaling**: Increased capacity during business hours
- **Minimum Instance Guarantee**: Ensures at least one instance is always running

### Setup

Use the provided scripts to set up autoscaling:

```bash
# For Linux/macOS
cd star-backend/tools
./setup_autoscaling.sh [resource-group] [app-name] [min-instances] [max-instances] [default-instances]

# For Windows
cd star-backend\tools
setup_autoscaling.cmd [resource-group] [app-name] [min-instances] [max-instances] [default-instances]
```

These scripts will:

1. Configure the App Service Plan for autoscaling
2. Set up CPU and memory-based scaling rules
3. Configure HTTP queue length scaling rules
4. Set up schedule-based scaling for business hours

## Cost Monitoring

Cost monitoring tools help keep Azure expenses under control.

### Features

- **Budget Alerts**: Email notifications at 50%, 80%, and 100% of budget
- **Cost Export**: Daily export of cost data to Azure Storage
- **Advisor Recommendations**: Azure Advisor cost optimization suggestions
- **Resource Tracking**: Monitor costs by resource group

### Setup

Use the provided scripts to set up cost monitoring:

```bash
# For Linux/macOS
cd star-backend/tools
./setup_cost_monitoring.sh [resource-group] [monthly-budget] [alert-email] [contact-name]

# For Windows
cd star-backend\tools
setup_cost_monitoring.cmd [resource-group] [monthly-budget] [alert-email] [contact-name]
```

These scripts will:

1. Create budget alerts for the resource group
2. Set up a storage account for cost data export
3. Configure daily cost export
4. Generate cost optimization recommendations

## CI/CD with GitHub Actions

The GitHub Actions workflow (`azure-deploy.yml`) provides continuous integration and deployment for the STAR backend.

### Features

- **Automated Testing**: Runs tests with pytest and uploads coverage reports
- **Code Quality**: Linting with flake8, black, and isort
- **Docker Builds**: Builds and pushes Docker images
- **Staged Deployments**: Separate staging and production environments
- **Health Checks**: Post-deployment verification
- **Notifications**: Slack notifications on success/failure

### Setup

1. Add the following secrets to your GitHub repository:

   - `AZURE_CREDENTIALS`: Service principal credentials for Azure
   - `REGISTRY_LOGIN_SERVER`: Azure Container Registry server
   - `REGISTRY_USERNAME`: ACR username
   - `REGISTRY_PASSWORD`: ACR password
   - `SUPABASE_URL`: Supabase URL
   - `SUPABASE_KEY`: Supabase key
   - `SLACK_WEBHOOK_URL`: Slack webhook URL for notifications

2. Create the necessary Azure resources:

   - App Service instances (staging and production)
   - Container Registry
   - Resource Group

3. The workflow will be triggered automatically on pushes to the main branch or manually via workflow dispatch.

### Manual Deployment

To manually trigger a deployment:

1. Go to the Actions tab in your GitHub repository
2. Select the "STAR Backend CI/CD for Azure" workflow
3. Click "Run workflow"
4. Select the target environment (staging or production)
5. Click "Run workflow"

## Best Practices

- **Secrets Management**: Store all sensitive information in Azure Key Vault
- **Monitoring**: Regularly check Application Insights for performance issues
- **Costs**: Review cost analytics monthly and adjust resources as needed
- **Backups**: Set up regular database backups
- **Security**: Enable Azure Security Center for threat detection
