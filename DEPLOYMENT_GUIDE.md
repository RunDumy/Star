# 🌌 STAR Platform - Vercel + Render + Supabase Deployment Guide

## Architecture Overview

- **Frontend**: Next.js app deployed to Vercel
- **Backend**: Flask API deployed to Render
- **Database**: Supabase (PostgreSQL with real-time features)
- **Storage**: Supabase Storage for assets
- **Auth**: Supabase Auth for user management

## Prerequisites

- GitHub account with repository access
- Vercel account
- Render account
- Supabase account

## Quick Start Deployment

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Note your project URL and API keys from the project settings
3. Run the database schema setup (optional for local development):
   ```bash
   # Initialize Supabase locally
   supabase init
   supabase start

   # Apply migrations
   supabase db push
   ```

### 2. Backend Deployment (Render)

1. Go to https://render.com and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Choose the `star-backend/star_backend_flask/` directory
5. Configure the service:
   - **Environment**: Docker
   - **Build Command**: `docker build -t star-backend .`
   - **Start Command**: `docker run -p $PORT:5000 star-backend`
6. Add environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SECRET_KEY=your-very-secure-random-secret-key
   AGORA_APP_ID=your-agora-app-id
   AGORA_APP_CERTIFICATE=your-agora-certificate
   ```
7. Click "Create Web Service" and note the URL (e.g., `https://your-app.onrender.com`)

### 3. Frontend Deployment (Vercel)

1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Root Directory**: `star-frontend`
   - Vercel will auto-detect Next.js
5. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
   NEXT_PUBLIC_AGORA_APP_ID=your-agora-app-id
   ```
6. Click "Deploy"

## Environment Variables Reference

### Backend (.env in star-backend/)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Flask Security
SECRET_KEY=your-very-secure-random-secret-key-here
FLASK_ENV=production

# AgoraRTC for Live Streaming
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

# Optional Services
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
IPGEOLOCATION_API_KEY=your-ipgeolocation-api-key
```

### Frontend (.env.local in star-frontend/)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com

# AgoraRTC for Live Streaming
NEXT_PUBLIC_AGORA_APP_ID=your-agora-app-id
```

## Post-Deployment Verification

1. **Test Supabase Connection**
   - Check Supabase dashboard for database tables
   - Verify auth settings are configured

2. **Test Backend API**
   - Visit `https://your-render-backend.onrender.com/api/health`
   - Should return a success response

3. **Test Frontend**
   - Visit your Vercel deployment URL
   - Try user registration and login
   - Test basic functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Render backend URL is added to allowed origins in CORS settings
   - Check the `allowed_origins` list in your Flask app

2. **Supabase Connection Issues**
   - Verify API keys are correct
   - Check project URL format
   - Ensure RLS policies are configured

3. **Build Failures**
   - Check environment variables are set correctly
   - Review build logs for specific errors
   - Ensure all dependencies are listed in requirements.txt/package.json

### Getting Help

- **Vercel**: Check deployment logs in Vercel dashboard
- **Render**: Check service logs in Render dashboard
- **Supabase**: Review dashboard for database and auth issues
- **General**: Test API endpoints with Postman or curl

## Security Features

- JWT token authentication via Supabase Auth
- Row Level Security (RLS) in Supabase
- HTTPS enforced on all platforms
- Environment variable protection
- CORS protection

## Cost Optimization

- **Vercel**: Free tier for personal projects
- **Render**: Free tier with usage limits
- **Supabase**: Generous free tier for small projects

## Local Development

For local development with the same stack:

```bash
# Backend
cd star-backend/star_backend_flask
pip install -r ../../requirements.txt
python app.py

# Frontend
cd star-frontend
npm install
npm run dev
```

Make sure to set up local Supabase instance or use cloud Supabase for development.
   - Backend API will be available at `/api/v1/*` endpoints

## Environment Variables