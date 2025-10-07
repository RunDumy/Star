# Star Backend Deployment Guide

## Redis Configuration

### Redis Cloud Service
The Star backend uses a Redis Cloud instance for caching, real-time features, and Socket.IO messaging. The connection details are:

- **Redis URL**: `redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341`
- **Host**: `redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com`
- **Port**: `11341`
- **Username**: `default`
- **Password**: `dpQqYc6wimd8CoOazLDvrE6TlNt4un6b`

### Testing Redis Connection
Use the included `test_redis.py` script to verify Redis connectivity:

```bash
python test_redis.py
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
   railway login
   ```
   
3. Link to your project:
   ```bash
   railway link -p 49122ea8-6d65-4a1b-81e9-914fe15804bd
   ```

### Configuration Files
The following files are used for Railway deployment:

1. **railway.toml**: Defines the service configuration, environment variables, and start command
2. **Dockerfile**: Sets up the Python environment and installs dependencies
3. **railway.py**: Simplified Flask app for Railway deployment
4. **requirements.txt**: Python package dependencies including gunicorn and redis

### Troubleshooting Common Issues

#### Redis Configuration Errors
If you encounter Redis configuration errors:
- Ensure `redis.conf` is not present or conflicting with your Redis Cloud configuration
- Verify the REDIS_URL environment variable is set correctly
- Check that Redis initialization in the app correctly uses the URL

#### Gunicorn Not Found
If gunicorn is not found:
- Ensure gunicorn is included in `requirements.txt`
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

## Local Development
To run the application locally:

1. Set up a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # macOS/Linux
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set environment variables:
   ```bash
   set REDIS_URL=redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341
   ```

4. Run the Flask app:
   ```bash
   flask run
   ```

## Environment Variables
Ensure these environment variables are set in Railway:
- `REDIS_URL`: Complete Redis URL with credentials
- `SECRET_KEY`: For Flask session security
- `JWT_SECRET`: For JWT token generation
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: For Supabase connectivity
- `PORT`: Set to 5000 for the web server
- Additional service-specific variables as needed