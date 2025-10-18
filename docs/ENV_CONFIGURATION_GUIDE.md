# 🌟 STAR Platform Environment Configuration Guide

## Overview
This guide helps you configure all environment variables needed to unlock the full functionality of your cosmic social platform.

## 🏗️ Required Services

### **Core Services (Required)**
1. **Azure Cosmos DB** - Main database
2. **Agora** - Live streaming & real-time communication
3. **JWT Secrets** - Authentication & security

### **Advanced Features (Optional)**
1. **Spotify API** - Cosmic playlist integration
2. **IPGeolocation** - Location-aware astrological insights
3. **Azure Storage** - Media file uploads
4. **Redis** - Caching and real-time features

---

## 🔧 Backend Environment Setup

### 1. **Create Backend .env File**

```bash
# Navigate to backend directory
cd star-backend
cp .env.example .env
```

### 2. **Configure Required Variables**

```env
# === CORE DATABASE ===
COSMOS_DB_CONNECTION_STRING=AccountEndpoint=https://YOUR-COSMOS-ACCOUNT.documents.azure.com:443/;AccountKey=YOUR-ACCOUNT-KEY;
COSMOS_DB_DATABASE_NAME=star-db

# === SECURITY (REQUIRED) ===
SECRET_KEY=YOUR-VERY-SECURE-SECRET-KEY-CHANGE-IN-PRODUCTION
JWT_SECRET_KEY=YOUR-JWT-SECRET-KEY-FOR-TOKENS
JWT_ALGORITHM=HS256

# === AGORA LIVE STREAMING (REQUIRED) ===
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

# === SERVER CONFIG ===
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 3. **Configure Optional Advanced Features**

```env
# === SPOTIFY INTEGRATION (Optional) ===
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify

# === LOCATION SERVICES (Optional) ===
IPGEOLOCATION_API_KEY=your-ipgeolocation-api-key

# === AZURE STORAGE (Optional) ===
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=yourstorageaccount;AccountKey=your-account-key;EndpointSuffix=core.windows.net

# === REDIS CACHING (Optional) ===
REDIS_URL=redis://your-redis-url:6380
AZURE_REDIS_HOST=your-redis-host.redis.cache.windows.net
AZURE_REDIS_PORT=6380
AZURE_REDIS_PASSWORD=your-redis-password
AZURE_REDIS_SSL=True
```

---

## 🎨 Frontend Environment Setup

### 1. **Create Frontend .env File**

```bash
# Navigate to frontend directory
cd star-frontend
cp .env.local.example .env.local
```

### 2. **Configure Frontend Variables**

```env
# === API CONNECTION (REQUIRED) ===
NEXT_PUBLIC_API_URL=http://localhost:5000

# === AGORA INTEGRATION (REQUIRED) ===
NEXT_PUBLIC_AGORA_APP_ID=your-agora-app-id

# === SPOTIFY INTEGRATION (Optional) ===
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify
NEXT_PUBLIC_SPOTIFY_AUTH_PATH=/api/auth/spotify

# === PERFORMANCE ===
NEXT_TELEMETRY_DISABLED=1
```

---

## 🚀 Service Setup Instructions

### **1. Supabase Setup**

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Go to Settings > API to get your project URL and keys
# 3. Run the SQL schema from supabase_schema.sql in the SQL Editor
# 4. Configure authentication providers if needed
# 5. Set up storage buckets for media files
az cosmosdb keys list --name star-cosmos-db --resource-group star-platform-rg --type connection-strings
```

### **2. Agora Setup**
1. Sign up at [Agora.io](https://www.agora.io/)
2. Create new project in console
3. Get App ID and App Certificate
4. Add to environment variables

### **3. Spotify API Setup**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/)
2. Create new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Get Client ID and Client Secret

### **4. IPGeolocation Setup**
1. Sign up at [IPGeolocation.io](https://ipgeolocation.io/)
2. Get free API key (1000 requests/day)
3. Add to environment variables

---

## 🔐 Security Best Practices

### **Generate Secure Keys**

```python
# Generate SECRET_KEY
import secrets
print("SECRET_KEY=" + secrets.token_hex(32))

# Generate JWT_SECRET_KEY
print("JWT_SECRET_KEY=" + secrets.token_hex(32))
```

### **Environment Security**
- ✅ Never commit `.env` files to version control
- ✅ Use different keys for development vs production
- ✅ Rotate keys regularly in production
- ✅ Use Azure Key Vault for production secrets

---

## 🧪 Testing Your Configuration

### **Backend Test**
```bash
cd star-backend/star_backend_flask
python app.py
# Should start without errors and show "Environment configured successfully"
```

### **Frontend Test**
```bash
cd star-frontend
npm run dev
# Should start on http://localhost:3000
```

### **Integration Test**
```bash
# Test API connection
curl http://localhost:5000/api/v1/health

# Test Agora integration
# Visit http://localhost:3000/agora-test
```

---

## 🎯 Feature Unlocked Checklist

| Feature | Environment Variable | Status |
|---------|---------------------|--------|
| **Core Database** | `COSMOS_DB_CONNECTION_STRING` | ⬜ |
| **Authentication** | `SECRET_KEY`, `JWT_SECRET_KEY` | ⬜ |
| **Live Streaming** | `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE` | ⬜ |
| **Cosmic Playlists** | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | ⬜ |
| **Location Insights** | `IPGEOLOCATION_API_KEY` | ⬜ |
| **Media Uploads** | `AZURE_STORAGE_CONNECTION_STRING` | ⬜ |
| **Real-time Chat** | `REDIS_URL` | ⬜ |

---

## 🚨 Troubleshooting

### **Common Issues:**

**"Connection string not found"**
- Check `.env` file exists in correct directory
- Verify no extra spaces in environment variables

**"Agora token generation failed"**
- Ensure both `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` are set
- Check for typos in App Certificate

**"CORS errors"**
- Update `ALLOWED_ORIGINS` to include your frontend URL
- For local development: `http://localhost:3000`

**"Spotify auth not working"**
- Verify redirect URI matches exactly in Spotify dashboard
- Check `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` is set correctly

---

## 🌟 Production Deployment

### **Azure Production Environment**
```env
# Use Azure Key Vault references
SECRET_KEY=@Microsoft.KeyVault(SecretUri=https://your-keyvault.vault.azure.net/secrets/secret-key/)
JWT_SECRET_KEY=@Microsoft.KeyVault(SecretUri=https://your-keyvault.vault.azure.net/secrets/jwt-secret/)
```

### **Environment-specific configs**
- `.env.development` - Development overrides
- `.env.production` - Production settings
- `.env.azure` - Azure-specific configurations

---

**🎊 Once configured, your STAR platform will have access to:**
- ✨ Advanced zodiac calculations with location data
- 🎵 AI-curated cosmic playlists via Spotify
- 📡 Real-time collaboration and live streaming
- 📊 Analytics and user insights
- 🔒 Secure authentication and data storage