# 🚀 STAR Platform - Azure App Service Deployment Guide

## Overview
This deployment method serves both the React frontend and Flask API from a single Azure App Service. The Flask backend serves the built React app as static files while providing API endpoints.

## ✅ What's Already Done

1. **✅ Frontend Built**: Static files generated in `star-frontend/out/`
2. **✅ Frontend Copied**: Files copied to `star-backend/star_backend_flask/static/`
3. **✅ Flask Configuration**: App already configured to serve React frontend
4. **✅ Azure Startup**: `startup.txt` configured for App Service
5. **✅ Deployment Script**: `deploy-azure.bat` ready to use

## 🚀 Deployment Steps

### Option 1: Azure CLI Deployment (Recommended)

1. **Install Azure CLI** (if not installed):
   ```bash
   # Download from: https://aka.ms/installazurecliwindows
   ```

2. **Login to Azure**:
   ```bash
   az login
   ```

3. **Deploy the app**:
   ```bash
   cd star-backend
   az webapp up --name your-star-app --resource-group your-rg --location eastus --runtime "python:3.11"
   ```

### Option 2: Git Deployment

1. **Setup Git remote** (if not done):
   ```bash
   cd star-backend
   git remote add azure https://your-star-app.scm.azurewebsites.net:443/your-star-app.git
   ```

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy STAR platform with React frontend"
   git push azure main
   ```

### Option 3: ZIP Deployment

1. **Create ZIP file**:
   - Zip the entire `star-backend/` folder
   - Ensure `star_backend_flask/static/` contains React build files

2. **Upload via Azure Portal**:
   - Go to App Service → Deployment Center
   - Choose "ZIP Deploy"
   - Upload the ZIP file

### Option 4: Automated Script

**Run the deployment script**:
```cmd
deploy-azure.bat
```

This script will:
- Build the frontend
- Copy files to backend
- Provide deployment options
- Optionally test locally first

## 🔧 Azure App Service Configuration

### Application Settings (Environment Variables)

Configure these in Azure Portal → App Service → Configuration:

```
# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
JWT_ALGORITHM=HS256

# Azure Cosmos DB
COSMOS_DB_CONNECTION_STRING=your-cosmos-connection-string

# Redis (Optional)
REDIS_URL=your-redis-connection-string

# AgoraRTC (Live Streaming)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# Spotify Integration (Optional)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Other APIs
IPGEOLOCATION_API_KEY=your-ip-geo-key

# Production Settings
FLASK_ENV=production
PORT=80
```

### Startup Command
Already configured in `startup.txt`:
```
gunicorn --bind=0.0.0.0:$PORT --workers=1 --timeout=300 --chdir star_backend_flask app:app
```

## 🧪 Testing

### Local Testing
```bash
cd star-backend/star_backend_flask
python app.py
```
- Frontend: http://localhost:5000/
- API: http://localhost:5000/api/health

### Production Testing
After deployment:
- Frontend: https://your-app.azurewebsites.net/
- API Health: https://your-app.azurewebsites.net/api/health
- Tarot: https://your-app.azurewebsites.net/tarot-reading
- 3D Cosmos: https://your-app.azurewebsites.net/collaborative-cosmos

## 📁 File Structure After Deployment

```
star-backend/
├── star_backend_flask/
│   ├── app.py                  # Main Flask application
│   ├── static/                 # React frontend files (copied from build)
│   │   ├── index.html
│   │   ├── _next/              # Next.js assets
│   │   └── ...                 # All React build files
│   ├── api.py                  # API endpoints
│   ├── cosmos_db.py           # Database operations
│   └── requirements.txt        # Python dependencies
├── startup.txt                 # Azure startup command
└── requirements.txt           # Main requirements
```

## 🌐 How It Works

1. **Flask App Serves Everything**: Single Azure App Service instance
2. **Frontend Routes**: `/`, `/tarot-reading`, etc. serve React app
3. **API Routes**: `/api/*` serve JSON responses
4. **Static Assets**: `/_next/*` serve Next.js bundles and assets
5. **SPA Routing**: All non-API routes fallback to `index.html`

## ✅ Benefits of This Approach

- **Single Deployment**: One Azure resource instead of separate frontend/backend
- **No CORS Issues**: Frontend and API on same domain
- **Cost Effective**: Single App Service plan
- **Simplified**: No need for separate static hosting
- **Fast**: No cross-domain API calls

## 🔍 Troubleshooting

### Frontend Not Loading
1. Check if `star_backend_flask/static/index.html` exists
2. Verify `app.py` has frontend serving routes
3. Check Azure logs: App Service → Log stream

### API Not Working
1. Test health endpoint: `/api/health`
2. Check environment variables in Azure
3. Review Application Logs

### Build Issues
1. Ensure `npm run build` completes successfully
2. Check `star-frontend/out/` has files
3. Verify file copy to `static/` folder

## 🚀 Ready to Deploy!

Your STAR platform is ready for Azure App Service deployment. The Flask backend will serve both the React frontend and API endpoints from a single domain.

Choose your deployment method and deploy! 🌟