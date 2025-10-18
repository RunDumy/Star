# STAR Platform Deployment Guide
## Vercel + Fly.io + Supabase Setup

This guide walks you through deploying the STAR Platform to the new cloud stack.

## Prerequisites

1. **Accounts Required:**
   - [Supabase](https://supabase.com) (free tier available)
   - [Fly.io](https://fly.io) (free tier available)
   - [Vercel](https://vercel.com) (free tier available)
   - [AgoraRTC](https://console.agora.io) (for live streaming)

2. **Tools Required:**
   - Supabase CLI: `npm install -g supabase`
   - Fly CLI: Download from https://fly.io/docs/hands-on/install-flyctl/
   - Vercel CLI: `npm install -g vercel`

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: `star-platform` (or your choice)
   - Database Password: Choose a strong password
   - Region: Select closest to your users
4. Wait for project creation (5-10 minutes)

### 1.2 Configure Database Schema

1. In your Supabase dashboard, go to "SQL Editor"
2. Copy the contents of `supabase_schema.sql` and run it
3. Verify tables were created in the "Table Editor"

### 1.3 Get API Keys

1. Go to Settings → API
2. Copy the following values:
   - Project URL
   - Project API Key (anon/public)
   - Project API Key (service_role) - keep this secret!

## Step 2: AgoraRTC Setup (Optional but Recommended)

1. Go to https://console.agora.io
2. Create a new project
3. Get your App ID and App Certificate
4. Note: Required for live streaming features

## Step 3: Backend Deployment (Fly.io)

### 3.1 Prepare Backend

```bash
cd star-backend/star_backend_flask

# Create .env file with your values
cp ../../.env.template .env
# Edit .env with your Supabase and AgoraRTC credentials
```

### 3.2 Deploy to Fly.io

```bash
# Login to Fly.io
fly auth login

# Launch the app
fly launch

# When prompted:
# - Choose an app name (e.g., star-backend)
# - Select a region close to your users
# - Choose default settings for other options

# Set environment variables
fly secrets set SUPABASE_URL="https://your-project-ref.supabase.co"
fly secrets set SUPABASE_ANON_KEY="your-anon-key"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
fly secrets set SECRET_KEY="your-random-secret-key"
fly secrets set AGORA_APP_ID="your-agora-app-id"
fly secrets set AGORA_APP_CERTIFICATE="your-agora-certificate"

# Optional: Set other secrets
fly secrets set SPOTIFY_CLIENT_ID="your-spotify-id"
fly secrets set SPOTIFY_CLIENT_SECRET="your-spotify-secret"
fly secrets set IPGEOLOCATION_API_KEY="your-ip-key"

# Deploy
fly deploy
```

### 3.3 Verify Backend

```bash
# Check app status
fly status

# Get the deployed URL
fly info
```

## Step 4: Frontend Deployment (Vercel)

### 4.1 Prepare Frontend

```bash
cd star-frontend

# Create .env.local with your values
cp ../.env.template .env.local
# Edit .env.local with your Supabase and backend URL
```

### 4.2 Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard or via CLI
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_AGORA_APP_ID
```

### 4.3 Update Backend URL

After Vercel deployment, update your backend's `ALLOWED_ORIGINS` if needed:

```bash
fly secrets set ALLOWED_ORIGINS="https://your-vercel-app.vercel.app"
```

## Step 5: Upload Assets to Supabase Storage

### 5.1 Create Storage Bucket

1. In Supabase Dashboard → Storage
2. Create a new bucket called `star-assets`
3. Set to public access

### 5.2 Upload Assets

Upload your zodiac images, badges, and other assets to the storage bucket.

### 5.3 Update Asset URLs

Update `validate_assets.py` with your actual Supabase project reference:

```python
ASSET_URLS = [
    f"https://your-project-ref.supabase.co/storage/v1/object/public/star-assets/zodiac/{sign}.png"
    for sign in ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"]
]
```

## Step 6: Testing

### 6.1 Local Testing

```bash
# Test with Docker
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### 6.2 Production Testing

1. **Health Check:** Visit `https://your-backend.fly.dev/api/v1/health`
2. **Frontend:** Visit your Vercel URL
3. **Database:** Check Supabase dashboard for data
4. **Live Streaming:** Test AgoraRTC integration

## Step 7: Custom Domain (Optional)

### 7.1 Backend (Fly.io)

```bash
fly certs add yourdomain.com
```

### 7.2 Frontend (Vercel)

Add custom domain in Vercel dashboard.

## Troubleshooting

### Common Issues

1. **Backend fails to start:**
   - Check Fly.io logs: `fly logs`
   - Verify environment variables are set correctly
   - Ensure Supabase credentials are valid

2. **Frontend can't connect to backend:**
   - Check CORS settings in Fly.io
   - Verify NEXT_PUBLIC_API_URL is correct
   - Check backend logs for connection errors

3. **Database connection fails:**
   - Verify Supabase URL and keys
   - Check Row Level Security policies
   - Ensure tables were created correctly

4. **Live streaming not working:**
   - Verify AgoraRTC credentials
   - Check browser console for WebRTC errors
   - Ensure HTTPS is enabled

### Useful Commands

```bash
# Fly.io
fly status                    # Check app status
fly logs                      # View logs
fly secrets list              # List secrets
fly deploy                    # Redeploy

# Vercel
vercel --prod                 # Deploy to production
vercel env ls                 # List environment variables

# Supabase
supabase status               # Check local status
supabase db diff              # Check schema differences
```

## Environment Variables Summary

### Backend (.env)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SECRET_KEY=your-secret-key
AGORA_APP_ID=xxx
AGORA_APP_CERTIFICATE=xxx
SPOTIFY_CLIENT_ID=xxx (optional)
SPOTIFY_CLIENT_SECRET=xxx (optional)
IPGEOLOCATION_API_KEY=xxx (optional)
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-app.fly.dev
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_AGORA_APP_ID=xxx
```

## Security Notes

- Never commit `.env` files to version control
- Use different Supabase projects for dev/staging/prod
- Enable Row Level Security (RLS) in Supabase
- Rotate API keys regularly
- Use HTTPS everywhere
- Monitor Supabase and Fly.io dashboards for issues

## Cost Optimization

- **Supabase:** Free tier covers most usage
- **Fly.io:** Pay only for actual usage (free tier available)
- **Vercel:** Generous free tier for static sites
- **AgoraRTC:** Pay per minute of streaming

## Support

- **Supabase:** https://supabase.com/docs
- **Fly.io:** https://fly.io/docs
- **Vercel:** https://vercel.com/docs
- **AgoraRTC:** https://docs.agora.io

For STAR Platform specific issues, check the GitHub repository or open an issue.