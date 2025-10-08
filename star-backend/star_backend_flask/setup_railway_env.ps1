# PowerShell script to set Railway environment variables for pretty-gentleness project

# Set Railway token
$env:RAILWAY_TOKEN = "6e806e61-f2c8-4b41-8172-680cc3389387"

# Link to the Railway project
Write-Host "Linking to Railway project pretty-gentleness..."
npx railway link -p c3cce031-0e64-4b40-996f-e55c4ae1265a

# Set environment variables
Write-Host "Setting up environment variables for pretty-gentleness project..."

# Redis configuration
npx railway variables set REDIS_URL="redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341"
npx railway variables set REDIS_HOST="redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com"
npx railway variables set REDIS_PORT="11341"
npx railway variables set REDIS_USERNAME="default"
npx railway variables set REDIS_PASSWORD="dpQqYc6wimd8CoOazLDvrE6TlNt4un6b"

# Supabase configuration
npx railway variables set SUPABASE_URL="https://hiwmpmvqcxzshdmhhlsb.supabase.co"
npx railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpd21wbXZxY3h6c2hkbWhobHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NDAzMjcsImV4cCI6MjA3NDUxNjMyN30.RXa8Bx3Pwy9Du2j-XD8WaGDjuCVe9H-PLTgMLJa11ZE"

# Security configuration
npx railway variables set SECRET_KEY="8d6448401426f23350520f5b4d4dadb088a9e6be0fb2ecc86a206b7cb358b722"
npx railway variables set JWT_SECRET="55bd7933fcfd0f10912b92788a36e0124a2e7c2330b586bfae32d2d28e9da16e"
npx railway variables set JWT_ALGORITHM="HS256"

# Agora configuration
npx railway variables set AGORA_APP_ID="d146ac692e604e7b9a99c9568ccbcd23"
npx railway variables set AGORA_APP_CERTIFICATE="f5e4c9a8466141d588644f9043ce4a84"

# Spotify configuration
npx railway variables set SPOTIPY_CLIENT_ID="dcc37439570a47b1a79db76e3bd35a22"
npx railway variables set SPOTIPY_CLIENT_SECRET="c2e06d864bca407bab4a6dfbf80993d5"

# CORS configuration
npx railway variables set ALLOWED_ORIGINS="https://star-frontend.vercel.app"

# Server configuration
npx railway variables set PORT="5000"
npx railway variables set PYTHON_VERSION="3.13.4"

Write-Host "Environment variables set successfully!"