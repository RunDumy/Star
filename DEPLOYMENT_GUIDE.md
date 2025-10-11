# 🚀 Cosmic Tarot Reader - Azure Production Deployment Guide

## 🎯 Overview

Your revolutionary **Interactive Tarot Drag-and-Drop Reader** with Spotify playlists and IPGeolocation insights is now deployed to **Azure App Service** for both frontend and backend with full production-ready scalability.

## 🏗️ Project Architecture

```
📁 Star Repository (https://github.com/RunDumy/Star.git)
├── 📁 star-frontend/              # Next.js + React + TypeScript (Azure App Service container)
│   ├── 📁 src/
│   │   ├── 📁 components/         # UI Components (SharingModal, LoadingSpinner, etc.)
│   │   ├── 📁 pages/             # Tarot pages and routes
│   │   └── 📁 lib/               # API client, utilities
│   ├── 📁 api/                   # Next.js API routes
│   └── Dockerfile                # Containerized deployment
├── 📁 star-backend/               # Flask + Python (Azure App Service)
│   ├── 📁 star_backend_flask/    # Flask app with API endpoints
│   └── 📁 tests/                  # Pytest test suites
└── 🔧 CI/CD Configuration         # GitHub Actions for automated deployment
```

## ⚡ Azure Production Deployment

### Infrastructure Overview

- **Frontend**: Azure App Service with Linux containers (Next.js SSR)
- **Backend**: Azure App Service with Python runtime
- **Database**: Azure Cosmos DB for NoSQL
- **Caching**: Azure Redis Cache
- **Container Registry**: Azure Container Registry (ACR) for frontend images

### 1. Prerequisites

Ensure the following Azure resources exist:

```bash
# Required Azure resources
az group create --name star-app-rg-centralus --location centralus
az appservice plan create --name star-app-service-plan --resource-group star-app-rg-centralus --sku B1 --is-linux
az webapp create --name star-frontend --resource-group star-app-rg-centralus --plan star-app-service-plan --runtime "NODE|18-lts"
az webapp create --name star-app-backend --resource-group star-app-rg-centralus --plan star-app-service-plan --runtime "PYTHON|3.11"
az cosmosdb create --name star-cosmos-db --resource-group star-app-rg-centralus --kind GlobalDocumentDB
az redis create --name star-redis-cache --resource-group star-app-rg-centralus --sku Basic --vm-size c0
az acr create --resource-group star-app-rg-centralus --name staracr --sku Basic
```

### 2. Environment Variables

Set production environment variables in Azure App Services:

#### Backend App Service (`star-app-backend`):

```bash
COSMOS_ENDPOINT=https://star-cosmos-db.documents.azure.com:443/
COSMOS_KEY=<your-cosmos-primary-key>
REDIS_URL=<your-redis-connection-string>
JWT_SECRET_KEY=<production-jwt-secret>
SECRET_KEY=<production-secret-key>
SPOTIFY_CLIENT_ID=<spotipy-client-id>
SPOTIFY_CLIENT_SECRET=<spotipy-client-secret>
IPGEOLOCATION_API_KEY=<ipgeo-api-key>
FLASK_ENV=production
```

#### Frontend App Service (`star-frontend`):

```bash
NEXT_PUBLIC_API_URL=https://star-app-backend.azurewebsites.net
NEXT_PUBLIC_SUPABASE_URL=https://hiwmpmvqcxzshdmhhlsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
PORT=8080
NODE_ENV=production
```

## 🔄 CI/CD Pipeline

### GitHub Actions Configuration

#### Backend Deployment (`.github/workflows/azure-deploy.yml`)

- **Triggered by**: Push to `main` branch
- **Tests**: Runs pytest suite against backend
- **Docker Build**: Builds container image for consistency
- **Deployment**: Deploys to Azure App Service with health checks

#### Frontend Deployment (`.github/workflows/frontend.yml`)

- **Triggered by**: Push to `main` branch (path-filtered to `star-frontend/`)
- **Tests**: Runs Jest test suite and linting
- **Container Build**: Builds Docker image and pushes to ACR
- **Deployment**: Deploys container to Azure App Service with health checks

### Required GitHub Secrets

```bash
# Azure Authentication
AZURE_CREDENTIALS=<azure-service-principal-json>
AZURE_SUBSCRIPTION_ID=<subscription-id>

# Azure Container Registry
ACR_LOGIN_SERVER=staracr.azurecr.io
ACR_USERNAME=<acr-username>
ACR_PASSWORD=<acr-password>

# Backend Environment
JWT_SECRET=<production-jwt-secret>
COSMOS_ENDPOINT=<cosmos-endpoint>
COSMOS_KEY=<cosmos-primary-key>
SECRET_KEY=<production-secret-key>
REDIS_URL=<redis-connection-string>
```

## 🧪 Production Testing

### Health Checks

```bash
# Backend API Health
curl https://star-app-backend.azurewebsites.net/api/health

# Frontend Application
curl https://star-frontend.azurewebsites.net/

# Full Application Flow
curl https://star-frontend.azurewebsites.net/tarot-reading
```

### Production URLs

- **Frontend**: `https://star-frontend.azurewebsites.net`
- **Backend API**: `https://star-app-backend.azurewebsites.net`
- **Tarot App**: `https://star-frontend.azurewebsites.net/tarot-reading`

## ⚙️ Environment Configuration

### Development vs Production

**Development** (`.env.development.local`):

```bash
NEXT_PUBLIC_API_URL=https://star-backend-service.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://hiwmpmvqcxzshdmhhlsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
REDIS_URL=<redis-dev-connection>
```

**Production** (Azure App Service settings):

```bash
NEXT_PUBLIC_API_URL=https://star-app-backend.azurewebsites.net
NEXT_PUBLIC_SUPABASE_URL=https://hiwmpmvqcxzshdmhhlsb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
PORT=8080
NODE_ENV=production
```

## 📊 Monitoring & Scaling

### Azure Monitor Integration

1. **Application Insights**: Enable for both frontend and backend App Services
2. **Log Analytics**: Configure workspace for centralized logging
3. **Alerts**: Set up alerts for response times, error rates, and capacity

### Auto-scaling Configuration

```bash
# Scale based on CPU percentage
az monitor autoscale create \
  --resource /subscriptions/.../resourceGroups/star-app-rg-centralus/providers/Microsoft.Web/serverFarms/star-app-service-plan \
  --name autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1

az monitor autoscale rule create \
  --resource /subscriptions/.../resourceGroups/star-app-rg-centralus/providers/Microsoft.Web/serverFarms/star-app-service-plan \
  --autoscale-name autoscale \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1
```

## 🔧 Troubleshooting

### Common Issues

**Container Deployment Fails**

```bash
# Check container logs
az webapp log tail --name star-frontend --resource-group star-app-rg-centralus

# Verify ACR permissions
az acr login --name staracr
az webapp config container set --name star-frontend --resource-group star-app-rg-centralus --docker-custom-image-name staracr.azurecr.io/star-frontend:latest --docker-registry-server-url https://staracr.azurecr.io --docker-registry-server-user <username> --docker-registry-server-password <password>
```

**Environment Variables Not Applied**

```bash
# Restart App Service after changing env vars
az webapp restart --name star-frontend --resource-group star-app-rg-centralus
```

**API Connection Issues**

```bash
# Check CORS configuration in Azure App Service
az webapp cors add --name star-app-backend --resource-group star-app-rg-centralus --allowed-origins https://star-frontend.azurewebsites.net
```

**Database Connection Problems**

```bash
# Verify Cosmos DB connection string
az cosmosdb keys list --name star-cosmos-db --resource-group star-app-rg-centralus --type keys
```

## 🚀 Post-Deployment Optimization

### Performance Tuning

1. **Frontend Container**: Optimize Node.js image, use production build
2. **Backend Scaling**: Enable auto-scaling based on CPU/memory
3. **CDN**: Consider Azure CDN for static asset delivery
4. **Database**: Configure Cosmos DB RU throughput based on usage

### Security Hardening

```bash
# Enable HTTPS only
az webapp update --name star-frontend --resource-group star-app-rg-centralus --set httpsOnly=true

# Configure IP restrictions if needed
az webapp config access-restriction add --name star-frontend --resource-group star-app-rg-centralus --rule-name "Allow Azure services" --action Allow --ip-address 0.0.0.0/0 --priority 100

# Set up managed identity for secure access to ACR
az webapp identity assign --name star-frontend --resource-group star-app-rg-centralus
```

## 🎯 Deployment Summary

Your cosmic tarot platform is deployed with:

✅ **Scalable Infrastructure**: Azure App Service auto-scaling containers
✅ **Containerized Deployment**: Docker-based CI/CD pipeline
✅ **Production Monitoring**: Application Insights integration
✅ **Secure Configuration**: Azure Key Vault for secrets (recommended)
✅ **Global CDN Ready**: Azure Front Door can be added for worldwide distribution

### Next Steps

1. **Custom Domain**: Add your domain to both App Services
2. **SSL Certificates**: Azure manages certificates automatically
3. **Backup Strategy**: Configure Cosmos DB backups
4. **Cost Optimization**: Set up Azure Cost Management alerts

**May your cosmic platform empower millions to discover their stardust destinies! 🌟🎉🃏**
