"""
Script to prepare and deploy Star Backend Flask app to Railway
"""

import os
import sys
import subprocess
import time
import json
from typing import Dict, List, Tuple, Optional

# Railway project details
RAILWAY_TOKEN = "6e806e61-f2c8-4b41-8172-680cc3389387"
RAILWAY_PROJECT_ID = "c3cce031-0e64-4b40-996f-e55c4ae1265a"

# Required environment variables
ENV_VARS = {
    "REDIS_URL": "redis://default:dpQqYc6wimd8CoOazLDvrE6TlNt4un6b@redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com:11341",
    "REDIS_HOST": "redis-11341.c246.us-east-1-4.ec2.redns.redis-cloud.com",
    "REDIS_PORT": "11341",
    "REDIS_USERNAME": "default",
    "REDIS_PASSWORD": "dpQqYc6wimd8CoOazLDvrE6TlNt4un6b",
    "SUPABASE_URL": "https://hiwmpmvqcxzshdmhhlsb.supabase.co",
    "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhpd21wbXZxY3h6c2hkbWhobHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NDAzMjcsImV4cCI6MjA3NDUxNjMyN30.RXa8Bx3Pwy9Du2j-XD8WaGDjuCVe9H-PLTgMLJa11ZE",
    "SECRET_KEY": "8d6448401426f23350520f5b4d4dadb088a9e6be0fb2ecc86a206b7cb358b722",
    "JWT_SECRET_KEY": "55bd7933fcfd0f10912b92788a36e0124a2e7c2330b586bfae32d2d28e9da16e",
    "JWT_ALGORITHM": "HS256",
    "AGORA_APP_ID": "d146ac692e604e7b9a99c9568ccbcd23",
    "AGORA_APP_CERTIFICATE": "f5e4c9a8466141d588644f9043ce4a84",
    "SPOTIPY_CLIENT_ID": "dcc37439570a47b1a79db76e3bd35a22",
    "SPOTIPY_CLIENT_SECRET": "c2e06d864bca407bab4a6dfbf80993d5",
    "ALLOWED_ORIGINS": "https://star-frontend.vercel.app",
    "PORT": "5000",
    "PYTHON_VERSION": "3.13.4"
}

def run_cmd(cmd: List[str], env: Optional[Dict[str, str]] = None) -> Tuple[int, str, str]:
    """Run a command and return exit code, stdout, stderr"""
    if env is None:
        env = os.environ.copy()
    
    # Add Railway token to environment if not already present
    if "RAILWAY_TOKEN" not in env:
        env["RAILWAY_TOKEN"] = RAILWAY_TOKEN
    
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    stdout, stderr = process.communicate()
    return process.returncode, stdout, stderr

def check_railway_cli() -> bool:
    """Verify Railway CLI is installed"""
    print("Checking Railway CLI...")
    exit_code, stdout, stderr = run_cmd(["railway", "--version"])
    
    if exit_code != 0:
        print("❌ Railway CLI not found. Please install it with:")
        print("   npm install -g @railway/cli")
        return False
    
    print(f"✅ Railway CLI installed: {stdout.strip()}")
    return True

def authenticate_railway() -> bool:
    """Authenticate with Railway using token"""
    print("\nAuthenticating with Railway...")
    exit_code, stdout, stderr = run_cmd(["railway", "whoami"])
    
    if exit_code != 0:
        print(f"❌ Authentication failed: {stderr}")
        return False
    
    print(f"✅ Authenticated as: {stdout.strip()}")
    return True

def link_project() -> bool:
    """Link to Railway project"""
    print(f"\nLinking to project {RAILWAY_PROJECT_ID}...")
    exit_code, stdout, stderr = run_cmd(["railway", "link", "-p", RAILWAY_PROJECT_ID])
    
    if exit_code != 0:
        print(f"❌ Failed to link project: {stderr}")
        return False
    
    print("✅ Project linked successfully")
    return True

def set_environment_variables() -> bool:
    """Set environment variables in Railway"""
    print("\nSetting environment variables...")
    
    success_count = 0
    for key, value in ENV_VARS.items():
        print(f"  Setting {key}...")
        exit_code, stdout, stderr = run_cmd(["railway", "variables", "set", f"{key}={value}"])
        
        if exit_code != 0:
            print(f"  ❌ Failed to set {key}: {stderr}")
        else:
            success_count += 1
    
    if success_count == len(ENV_VARS):
        print(f"✅ All {success_count} environment variables set successfully")
        return True
    else:
        print(f"⚠️ {success_count}/{len(ENV_VARS)} environment variables set")
        return success_count > 0

def verify_environment_variables() -> bool:
    """Verify environment variables are set correctly"""
    print("\nVerifying environment variables...")
    exit_code, stdout, stderr = run_cmd(["railway", "variables", "list"])
    
    if exit_code != 0:
        print(f"❌ Failed to get variables: {stderr}")
        return False
    
    # Simple check to see if all keys are present in output
    missing_vars = []
    for key in ENV_VARS.keys():
        if key not in stdout:
            missing_vars.append(key)
    
    if missing_vars:
        print(f"❌ Missing variables: {', '.join(missing_vars)}")
        return False
    
    print("✅ All environment variables are set")
    return True

def test_redis_connection() -> bool:
    """Run Redis test script"""
    print("\nTesting Redis connection...")
    
    try:
        # Import redis module
        import redis
        
        # Create Redis client using URL
        client = redis.Redis.from_url(
            ENV_VARS["REDIS_URL"],
            decode_responses=True
        )
        
        # Test connection
        if client.ping():
            print("✅ Redis ping successful")
        else:
            print("❌ Redis ping failed")
            return False
        
        # Test set/get
        test_key = "railway_deploy_test"
        test_value = f"test_{int(time.time())}"
        
        client.set(test_key, test_value)
        retrieved = client.get(test_key)
        client.delete(test_key)
        
        if retrieved == test_value:
            print("✅ Redis SET/GET test successful")
            return True
        else:
            print("❌ Redis SET/GET test failed")
            return False
            
    except ImportError:
        print("❌ Redis module not installed. Run: pip install redis")
        return False
    except Exception as e:
        print(f"❌ Redis test failed: {str(e)}")
        return False

def deploy_application() -> bool:
    """Deploy application to Railway"""
    print("\nDeploying to Railway...")
    exit_code, stdout, stderr = run_cmd(["railway", "up"])
    
    if exit_code != 0:
        print(f"❌ Deployment failed: {stderr}")
        return False
    
    print("✅ Application deployed successfully!")
    print(stdout)
    return True

def get_application_url() -> Optional[str]:
    """Get the URL of the deployed application"""
    print("\nRetrieving application URL...")
    exit_code, stdout, stderr = run_cmd(["railway", "service", "url"])
    
    if exit_code != 0:
        print(f"❌ Failed to get URL: {stderr}")
        return None
    
    url = stdout.strip()
    if not url:
        print("❌ No URL returned")
        return None
    
    print(f"✅ Application URL: {url}")
    return url

def main():
    print("=" * 50)
    print("STAR BACKEND RAILWAY DEPLOYMENT")
    print("=" * 50)
    
    # Step 1: Check Railway CLI
    if not check_railway_cli():
        return False
    
    # Step 2: Authenticate with Railway
    if not authenticate_railway():
        return False
    
    # Step 3: Link to project
    if not link_project():
        return False
    
    # Step 4: Set environment variables
    if not set_environment_variables():
        response = input("Some environment variables could not be set. Continue? (y/n): ")
        if response.lower() != 'y':
            return False
    
    # Step 5: Verify environment variables
    if not verify_environment_variables():
        response = input("Environment verification failed. Continue? (y/n): ")
        if response.lower() != 'y':
            return False
    
    # Step 6: Test Redis connection
    if not test_redis_connection():
        response = input("Redis connection test failed. Continue? (y/n): ")
        if response.lower() != 'y':
            return False
    
    # Step 7: Deploy application
    if not deploy_application():
        return False
    
    # Step 8: Get URL
    url = get_application_url()
    if not url:
        print("\nWarning: Could not retrieve application URL")
    
    print("\n" + "=" * 50)
    print("DEPLOYMENT COMPLETE!")
    if url:
        print(f"Application URL: {url}")
        print(f"Health check URL: {url}/api/health")
    print(f"Monitor logs with: railway logs")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)