# Railway Deployment Guide for Star Backend (pretty-gentleness)

## Project Information

- **Project Name**: pretty-gentleness
- **Project ID**: c3cce031-0e64-4b40-996f-e55c4ae1265a
- **Railway Token**: 6e806e61-f2c8-4b41-8172-680cc3389387

## Redis Configuration

### Redis Cloud Service

The Star backend uses a Redis Cloud instance for caching, real-time features, and Socket.IO messaging. The connection details are:

- **Redis URL**: `redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341`
- **Host**: `redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com`
- **Port**: `11341`
- **Username**: `default`
- **Password**: `dpQqYc6wimd8CoOazLDvrE6TlNt4un6b`

### Testing Redis Connection

Use the included `redis_test.py` script to verify Redis connectivity:

```bash
python redis_test.py
```

This script tests basic Redis operations (ping, set, get) and confirms the connection is working properly.

## Deployment with Railway

### Prerequisites

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
2. Login to Railway:
   ```bash
   $env:RAILWAY_TOKEN = "6e806e61-f2c8-4b41-8172-680cc3389387"
   railway login
   ```
3. Link to your project:
   ```bash
   railway link -p c3cce031-0e64-4b40-996f-e55c4ae1265a
   ```

### Configuration Files

The following files are used for Railway deployment:

1. **railway.toml**: Defines the service configuration, environment variables, and start command
2. **Dockerfile**: Sets up the Python environment and installs dependencies
3. **app.py**: Main Flask application
4. **requirements.txt**: Python package dependencies including gunicorn and redis

### Troubleshooting Common Issues

#### Redis Configuration Errors

If you encounter Redis configuration errors:

- Ensure no custom `redis.conf` file is present in the repository that might conflict with Redis Cloud settings
- Verify the REDIS_URL environment variable is set correctly in Railway
- Check that Redis initialization in the app correctly uses the URL from environment variables

#### Gunicorn Not Found

If gunicorn is not found:

- Confirm gunicorn is included in `requirements.txt` (it should be: `gunicorn==23.0.0`)
- Check that the Dockerfile explicitly installs gunicorn
- Verify the start command in railway.toml is correct

### Deployment Commands

Deploy the application:

```bash
railway up
```

Monitor logs:

```bash
railway logs
```

## Environment Variables

The following environment variables are required in Railway:

- `REDIS_URL`: Complete Redis URL with credentials
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`: Redis connection details
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`: For Supabase connectivity
- `SECRET_KEY`: For Flask session security
- `JWT_SECRET_KEY`, `JWT_ALGORITHM`: For JWT token generation
- `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`: For Agora integration
- `SPOTIPY_CLIENT_ID`, `SPOTIPY_CLIENT_SECRET`: For Spotify API integration
- `ALLOWED_ORIGINS`: CORS configuration (e.g., `https://star-frontend.vercel.app`)
- `PORT`: Set to 5000 for the web server
- `PYTHON_VERSION`: Set to 3.13.4

## Web Dashboard Deployment

If the Railway CLI encounters authentication issues, you can deploy through the web dashboard:

1. Go to [railway.app](https://railway.app) and log in
2. Select your project (`pretty-gentleness`)
3. Click "Deploy" and select the GitHub repository
4. Configure the deployment settings to match your railway.toml
5. Deploy the application
