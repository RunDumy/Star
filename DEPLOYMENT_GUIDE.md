# 🚀 Cosmic Tarot Reader - Production Deployment Guide

## 🎯 Overview

Your revolutionary **Interactive Tarot Drag-and-Drop Reader** with Spotify playlists and IPGeolocation insights is now ready for production deployment! This guide covers deploying to **Vercel** (frontend) and **Azure App Service** (backend) for scalable, production-ready hosting.

## 🏗️ Project Architecture

```
📁 Star Repository (https://github.com/RunDumy/Star.git)
├── 📁 star-frontend/          # Next.js + React + TypeScript
│   ├── 📁 src/
│   │   ├── 📁 components/     # UI Components (SharingModal, LoadingSpinner, etc.)
│   │   ├── 📁 pages/          # Tarot pages and pages
│   │   └── 📁 lib/            # API client, utilities
│   └── 📁 __tests__/          # Jest test suites
├── 📁 star-backend/           # Flask + Python
│   ├── 📁 star_backend_flask/ # Flask app with API endpoints
│   └── 📁 tests/              # Pytest test suites
└── 📄 Configuration Files     # vercel.json, Procfile.azure
```

## ⚡ Vercel Frontend Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy Frontend

```bash
# From project root
cd star-frontend

# Login to Vercel
vercel login

# Deploy (first time)
vercel --yes

# Follow prompts to set up your project
# Choose: star-frontend as project name
# Link to GitHub: Yes
# Override settings: No (uses vercel.json)

# Production deploy
vercel --prod
```

### 3. Environment Variables

Ensure these environment variables are set in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://hiwmpmvqcxzshdmhhlsb.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpd21wbXZxY3h6c2hkbWhobHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NDAzMjcsImV4cCI6MjA3NDUxNjMyN30.RXa8Bx3Pwy9Du2j-XD8WaGDjuCVe9H-PLTgMLJa11ZE`
- `NEXT_PUBLIC_AGORA_APP_ID` = `d146ac692e604e7b9a99c9568ccbcd23`

### 4. Vercel Configuration Details

**vercel.json** handles:

- **Frontend Builds**: Automatic Next.js detection with custom build settings
- **API Routing**: Proxies `/api/*` requests to your Azure App Service backend
- **Environment Variables**: Sets `NEXT_PUBLIC_API_URL` pointing to backend
- **Global CDN**: Automatic content distribution for fast loading

```json
{
  "version": 2,
  "builds": [{ "src": "star-frontend/package.json", "use": "@vercel/next" }],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://star-backend.azurewebsites.net/api/$1"
    },
    { "src": "/(.*)", "dest": "/star-frontend/$1" }
  ],
  "env": { "NEXT_PUBLIC_API_URL": "https://star-backend.azurewebsites.net" }
}
```

## 🔧 Azure App Service Backend Deployment

### 1. Deploy Via GitHub Actions

1. **Connect Repository**: In Azure Portal → App Services → Create → Web App → Connect to GitHub → Select `RunDumy/Star`

2. **Configure Service**:

   - **Branch**: `main` (for production)
   - **Runtime**: Python 3.11
   - **Build Command**: `pip install -r star-backend/star_backend_flask/requirements.txt`
   - **Start Command**: `gunicorn --bind=0.0.0.0:$PORT app:application` (from Procfile.azure)

3. **Set Environment Variables**:

   ```
   COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
   COSMOS_KEY=your-cosmos-primary-key
   REDIS_URL=your-redis-connection-string
   JWT_SECRET_KEY=your-production-jwt-secret
   SPOTIFY_CLIENT_ID=dcc37439570a47b1a79db76e3bd35a22
   SPOTIFY_CLIENT_SECRET=c2e06d864bca407bab4a6dfbf80993d5
   IPGEOLOCATION_API_KEY=ac0f06798ef248d4b2290e1e20e0a2cc
   SECRET_KEY=your-production-jwt-secret
   ```

4. **Add Azure Cosmos DB**:
   - New → Azure Cosmos DB for NoSQL
   - Plan: Free tier
   - Update backend COSMOS_ENDPOINT and COSMOS_KEY with Azure's provided values

### 2. Azure Infrastructure-as-Code

The **Procfile.azure** provides:

- **Auto-scaling**: Configurable scaling with Azure plans
- **Database Integration**: Cosmos DB with automatic connection
- **Environment Management**: Secure Key Vault integration
- **Blue-Green Deploys**: Slot-based deployments for zero-downtime

```text
web: gunicorn --bind=0.0.0.0:$PORT app:application
```

## 🔄 CI/CD Pipeline

### Vercel (Automatic)

- **Push to main**: Automatic preview deployment
- **Pull Request**: Instant preview URLs
- **Production**: Manual promotion from dashboard

### Azure (GitHub-Connected)

- **Push to main**: Automatic backend redeployment via GitHub Actions
- **Build Notifications**: Real-time alerts in GitHub
- **Rollback**: Slot swap or redeploy previous commit

## 🧪 Production Testing

### 1. Health Check Endpoints

```
Frontend: https://your-vercel-domain.vercel.app/
Backend API: https://star-backend.azurewebsites.net/api/v1/tarot/calculate-energy-flow
Health Check: https://star-backend.azurewebsites.net/api/v1/health
```

### 2. Full Application Test

```bash
# Test complete user flow:
curl "https://your-vercel-domain.vercel.app/tarot-reading"
curl -X POST "https://star-backend.azurewebsites.net/api/v1/tarot/share-spread" \
  -H "Content-Type: application/json" \
  -d '{"spread": {}, "spread_type": "three-card", "user_id": "test"}'
```

## ⚙️ Environment Variables

### Production Secrets

```bash
# Generate new secrets for production
JWT_SECRET_KEY=$(openssl rand -hex 32)
SECRET_KEY=$(openssl rand -hex 32)
```

### API Key Rotation

1. Update in Azure App Service configuration
2. Redeploy automatically
3. Update .env.example for documentation

## 📊 Monitoring & Analytics

### Vercel Analytics

- Real-time performance metrics
- User journey tracking
- Error rate monitoring

### Azure App Service Monitoring

- Response time graphs
- CPU/memory usage
- Logs and error tracking

## 🎯 Production Optimization

### Frontend Optimizations

- **Automatic**: Vercel handles code splitting, image optimization
- **Configure**: Update `next.config.js` for CDN settings
- **Bundle Analysis**: `npm run build --analyze`

### Backend Optimizations

- **Caching**: Already implemented with TTLCache (1-hour)
- **Database**: Azure Cosmos DB with global distribution
- **API Limits**: Spotify & IPGeolocation rate limiting handled

## 🔧 Troubleshooting

### Common Issues

**Vercel Build Fails**

```bash
# Check build logs in Vercel dashboard
# Common fix: Update Node.js version in package.json
```

### Azure App Service Deploy Fails

```bash
# Check deployment logs in Azure portal
# Ensure requirements.txt paths are correct
# Verify environment variables are set in App Service configuration
```

**API Connection Issues**

```bash
# Update vercel.json NEXT_PUBLIC_API_URL
# Check Azure App Service status
# Verify API endpoints match
```

**Database Connection**

```bash
# Use Azure Cosmos DB connection string
# Check connection string format: AccountEndpoint=...
# Verify Azure credentials and database permissions
```

## 🚀 Post-Deployment

### 1. Configure Custom Domain

- Vercel: Custom domains + SSL certificates
- Azure App Service: Custom domains with App Service domains

### 2. Analytics & Monitoring

- Set up Vercel Analytics
- Configure error tracking
- Monitor API usage rates

### 3. Security Headers

Add to vercel.json:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

## 🎊 Success! Production Ready! 🚀🌌✨

Your cosmic tarot platform is now deployed with:

✅ **Scalable Infrastructure**: Vercel + Azure App Service auto-scaling
✅ **Zero-Downtime Deploys**: Blue-green deployment strategy
✅ **Global CDN**: Fast loading worldwide
✅ **Production Monitoring**: Real-time metrics and alerts
✅ **Security**: HTTPS + environment variable protection
✅ **Backup**: Automatic database backups on Azure Cosmos DB

### Next Steps:

1. **Domain Setup**: Add your custom domain
2. **Marketing Launch**: Share your cosmic creation! 🌌✨🃏
3. **Feature Expansion**: Add sound effects, haptic feedback, community features

**May your cosmic platform empower millions to discover their stardust destinies! 🌟🎉**

---

**Deployment URLs:**

- Frontend: `https://your-vercel-domain.vercel.app`
- Backend: `https://star-backend.azurewebsites.net`
- Tarot App: `https://your-vercel-domain.vercel.app/tarot-reading`
