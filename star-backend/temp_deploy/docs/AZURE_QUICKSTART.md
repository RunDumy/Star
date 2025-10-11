# Azure Quick Start Guide for STAR Backend Developers

This quick start guide is designed to help new team members get familiar with the STAR backend deployment on Azure.

## Prerequisites

1. **Access to Azure Portal**

   - Request access to the Azure subscription from your team lead
   - You should have at least "Contributor" access to the `star-production` resource group

2. **Required Tools**

   - [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (v2.30.0+)
   - [Python 3.10+](https://www.python.org/downloads/)
   - [Git](https://git-scm.com/downloads)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. **Repository Access**
   - Ensure you have access to the STAR GitHub repository
   - Clone the repository: `git clone <repository-url>`

## Basic Azure Resource Overview

The STAR backend uses the following key Azure resources:

1. **App Service**: Hosts the Flask application

   - Production: `star-backend`
   - Staging: `star-backend-staging`

2. **Azure Cache for Redis**: Provides caching functionality

   - Resource Name: `star-redis-cache`

3. **Application Insights**: Monitoring and telemetry
   - Resource Name: `star-backend-insights`

## Getting Started

### Step 1: Install the Azure CLI and Sign In

```bash
# Install Azure CLI (on Windows using PowerShell)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'

# Sign in to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your Subscription Name"
```

### Step 2: Local Development Setup

```bash
# Navigate to the project directory
cd star-backend

# Create a virtual environment
python -m venv venv
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Create a .env file with required variables
copy .env.example .env

# Update .env with your values
# Open .env and add Azure connection strings
```

### Step 3: Connect to Azure Redis Cache Locally

```bash
# Get Redis connection info
az redis show --name star-redis-cache --resource-group star-production

# Get Redis access keys
az redis list-keys --name star-redis-cache --resource-group star-production

# Add to your .env file:
# AZURE_REDIS_URL=host=<hostname>;port=6380;password=<primaryKey>;ssl=True
```

### Step 4: Enable Application Insights Locally

```bash
# Get Application Insights connection string
az monitor app-insights component show --app star-backend-insights --resource-group star-production --query "connectionString" -o tsv

# Add to your .env file:
# APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string>
```

### Step 5: Run the Application Locally

```bash
# Navigate to the Flask app directory
cd star_backend_flask

# Run the Flask app
flask run --debug
```

## Common Development Tasks

### View Application Logs

```bash
# View production logs
az webapp log tail --name star-backend --resource-group star-production

# View staging logs
az webapp log tail --name star-backend-staging --resource-group star-production
```

### Deploy to Staging

The GitHub Actions workflow automatically deploys to staging when changes are pushed to the main branch. To manually trigger a deployment:

1. Go to the GitHub repository
2. Click on "Actions"
3. Select the "STAR Backend CI/CD for Azure" workflow
4. Click "Run workflow"
5. Select "staging" as the environment
6. Click "Run workflow"

### Run Redis Commands on Azure Redis Cache

```bash
# Start Redis CLI with SSL (requires redis-cli)
redis-cli -h <hostname> -p 6380 -a <primaryKey> --tls

# Or use the Azure CLI extension
az redis command execute --command "GET mykey" --name star-redis-cache --resource-group star-production
```

### View Performance Metrics

1. Open the [Azure Portal](https://portal.azure.com)
2. Navigate to "Application Insights" > `star-backend-insights`
3. Click on "Performance" in the left menu
4. Explore the various metrics and drill down into specific requests

## Helpful Scripts

The STAR backend includes several helpful scripts in the `tools/` directory:

### Azure Redis Cache Setup

```bash
# For Windows
cd star-backend\tools
setup_azure_redis.cmd [resource-group] [location] [redis-name] [sku] [vm-size]

# For Linux/macOS
cd star-backend/tools
./setup_azure_redis.sh [resource-group] [location] [redis-name] [sku] [vm-size]
```

### Application Insights Setup

```bash
# For Windows
cd star-backend\tools
setup_app_insights.cmd [resource-group] [app-name] [location]

# For Linux/macOS
cd star-backend/tools
./setup_app_insights.sh [resource-group] [app-name] [location]
```

### Autoscaling Setup

```bash
# For Windows
cd star-backend\tools
setup_autoscaling.cmd [resource-group] [app-name] [min-instances] [max-instances] [default-instances]

# For Linux/macOS
cd star-backend/tools
./setup_autoscaling.sh [resource-group] [app-name] [min-instances] [max-instances] [default-instances]
```

## Key Code Examples

### Using Azure Redis Cache

```python
from star_backend_flask.azure_redis import init_azure_redis, get_azure_redis
import os

# Initialize Redis (do this once during app startup)
init_azure_redis(os.environ.get('AZURE_REDIS_URL'))

# Get Redis client for use
redis = get_azure_redis()

# Basic operations
redis.set('user:123:name', 'John Doe', ex=3600)  # Expires in 1 hour
name = redis.get('user:123:name')

# JSON operations
user_data = {
    'id': 123,
    'name': 'John Doe',
    'email': 'john@example.com',
    'preferences': ['astronomy', 'tarot']
}
redis.set_json('user:123', user_data, ex=3600)
retrieved_data = redis.get_json('user:123')

# Health check
health_status = redis.health_check()
print(f"Redis status: {health_status['status']}")
```

### Using Application Insights

```python
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.trace.samplers import ProbabilitySampler
from opencensus.trace.tracer import Tracer
from opencensus.trace.span import SpanKind
import os

# Create a tracer
tracer = Tracer(
    exporter=AzureExporter(
        connection_string=os.environ.get('APPLICATIONINSIGHTS_CONNECTION_STRING')
    ),
    sampler=ProbabilitySampler(1.0)
)

# Track a function
def get_user_profile(user_id):
    with tracer.span(name="get_user_profile") as span:
        span.add_attribute("user_id", user_id)

        # Your function logic here
        profile = {"name": "John", "id": user_id}

        span.add_attribute("result", "success")
        return profile

# Track an HTTP dependency
with tracer.span(name="http_call", kind=SpanKind.CLIENT) as span:
    span.add_attribute("http.url", "https://api.example.com/data")
    span.add_attribute("http.method", "GET")

    # Make HTTP request
    # response = requests.get("https://api.example.com/data")

    span.add_attribute("http.status_code", 200)
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failures**

   - Check firewall rules to ensure your IP is allowed
   - Verify SSL is enabled in your connection
   - Ensure the connection string format is correct

2. **Application Insights Not Reporting**

   - Verify the connection string is valid
   - Check that the instrumentation key is correct
   - Look for any errors in the application logs

3. **Deployment Failures**
   - Check GitHub Actions logs for detailed error information
   - Ensure all environment variables are correctly set
   - Verify Docker build process completes successfully

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Redis Cache Documentation](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/)
- [Application Insights Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

## Detailed Documentation

For more detailed information, refer to:

- [Azure Migration Guide](./AZURE_MIGRATION_GUIDE.md)
- [Azure Enhancements Documentation](./AZURE_ENHANCEMENTS.md)
- [Azure Deployment Reference](./AZURE_DEPLOYMENT_REFERENCE.md)
- [Azure Migration Checklist](./AZURE_MIGRATION_CHECKLIST.md)
