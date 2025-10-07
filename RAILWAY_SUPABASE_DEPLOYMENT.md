# Railway and Supabase Deployment Guide

This supplementary guide covers deploying the Star app backend to Railway and configuring Supabase Realtime features.

## 🛤️ Railway Backend Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Deploy Backend

```bash
# From project root
cd star-backend

# Login to Railway
railway login

# Link to existing project
railway link

# Deploy to Railway
railway up
```

### 3. Railway Configuration File

Create a `railway.toml` file in the root of your backend directory:

```toml
[build]
  builder = "NIXPACKS"

[[services]]
  internalPort = 5000
  autoStart = true

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.http_checks]]
    interval = 10000
    grace_period = "5s"
    method = "get"
    path = "/api/health"
    protocol = "http"
    timeout = 2000
```

### 4. Redis Configuration

The Star app uses Redis for caching, session management, and Socket.IO message queue. Here's how to set it up:

#### Redis Environment Variables

Add these to your Railway project environment variables:

```env
REDIS_URL=redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341
REDIS_HOST=redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com
REDIS_PORT=11341
REDIS_USERNAME=default
REDIS_PASSWORD=dpQqYc6wimd8CoOazLDvrE6TlNt4un6b
```

#### Testing Redis Connection

1. **Local Testing**: Run the test script to verify Redis connectivity:

   ```bash
   # From project root with activated virtual environment
   python test_redis.py
   ```

2. **API Endpoint Testing**: Once deployed, test the Redis connection using the API endpoint:

   ```bash
   curl https://star-backend-production.up.railway.app/api/redis-test
   ```

   Expected successful response:
   
   ```json
   {
     "status": "ok",
     "message": "Redis connection successful",
     "value": "Redis test at 2025-10-07T12:30:45.123456"
   }
   ```

### 5. Troubleshooting Railway Deployment

If the health endpoint returns 404, try these approaches:

1. Simplify the Flask app to a minimal version
2. Update the Dockerfile to use the correct entry point
3. Ensure the railway.toml file has the correct configuration

## 🔄 Supabase Realtime Configuration

### 1. Enable Realtime for Tables

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`hiwmpmvqcxzshdmhhlsb`)
3. Navigate to **Database** > **Realtime**
4. Enable Realtime for the `post` table

### 2. Set up RLS Policies

```sql
-- Allow all authenticated users to read posts
CREATE POLICY "Allow authenticated users to read posts"
ON public.post
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update their own posts"
ON public.post
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own posts
CREATE POLICY "Allow users to insert posts"
ON public.post
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts"
ON public.post
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 3. Test Realtime Functionality

After enabling Realtime and setting up RLS policies, test collaborative features in the `/collaborative-cosmos` page:

1. Open the app in two browser tabs
2. Create a post in one tab
3. Verify the post appears in real-time in the other tab

## 📝 Direct Supabase Integration

For immediate deployment, you can bypass the backend and use Supabase directly:

1. Update the frontend environment variables to connect to Supabase:

   ```
   # .env.local
   # Use Supabase directly for initial deployment
   # NEXT_PUBLIC_API_URL=http://localhost:5000
   # NEXT_PUBLIC_API_URL=https://star-backend-production.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL=https://hiwmpmvqcxzshdmhhlsb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Use the Supabase client in your frontend code:
   ```javascript
   // Example of real-time subscription
   const channel = supabase
     .channel("post-changes")
     .on(
       "postgres_changes",
       { event: "INSERT", schema: "public", table: "post" },
       (payload) => {
         setPosts((prev) => [payload.new, ...prev]);
       }
     )
     .subscribe();
   ```
