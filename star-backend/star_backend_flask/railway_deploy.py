"""
Railway deployment script for Star Backend Flask application.

This script provides functions to:
1. Verify Railway CLI installation
2. Authenticate with Railway
3. Link to the pretty-gentleness project
4. Verify environment variables
5. Deploy the application
6. Test connectivity to the deployed application
"""

import os
import sys
import subprocess
import requests
import json
import time
from typing import Dict, List, Optional, Tuple, Union

# Railway project details
RAILWAY_PROJECT_ID = "c3cce031-0e64-4b40-996f-e55c4ae1265a"
RAILWAY_PROJECT_NAME = "pretty-gentleness"
RAILWAY_TOKEN = "6e806e61-f2c8-4b41-8172-680cc3389387"

# Environment variables that should be set
REQUIRED_ENV_VARS = [
    "REDIS_URL",
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SECRET_KEY",
    "JWT_SECRET_KEY",
    "JWT_ALGORITHM",
    "AGORA_APP_ID",
    "AGORA_APP_CERTIFICATE",
    "SPOTIPY_CLIENT_ID",
    "SPOTIPY_CLIENT_SECRET",
    "ALLOWED_ORIGINS",
    "PORT",
    "PYTHON_VERSION"
]

def run_command(command: List[str]) -> Tuple[str, str, int]:
    """Run a command and return stdout, stderr, and return code."""
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = process.communicate()
    return stdout, stderr, process.returncode

def check_railway_cli() -> bool:
    """Check if Railway CLI is installed."""
    print("Checking Railway CLI installation...")
    stdout, stderr, return_code = run_command(["railway", "version"])
    
    if return_code != 0:
        print("Railway CLI is not installed or not in PATH.")
        print("Please install it with: npm install -g @railway/cli")
        return False
    
    print(f"Railway CLI is installed: {stdout.strip()}")
    return True

def authenticate_with_railway() -> bool:
    """Authenticate with Railway using the token."""
    print("Authenticating with Railway...")
    
    # Set the RAILWAY_TOKEN environment variable for the process
    env = os.environ.copy()
    env["RAILWAY_TOKEN"] = RAILWAY_TOKEN
    
    process = subprocess.Popen(
        ["railway", "whoami"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print("Authentication failed:")
        print(stderr)
        return False
    
    print(f"Authenticated as: {stdout.strip()}")
    return True

def link_to_project() -> bool:
    """Link to the Railway project."""
    print(f"Linking to Railway project {RAILWAY_PROJECT_NAME}...")
    
    env = os.environ.copy()
    env["RAILWAY_TOKEN"] = RAILWAY_TOKEN
    
    process = subprocess.Popen(
        ["railway", "link", "-p", RAILWAY_PROJECT_ID],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print("Failed to link to project:")
        print(stderr)
        return False
    
    print("Successfully linked to project.")
    return True

def verify_environment_variables() -> bool:
    """Verify that all required environment variables are set in Railway."""
    print("Verifying Railway environment variables...")
    
    env = os.environ.copy()
    env["RAILWAY_TOKEN"] = RAILWAY_TOKEN
    
    process = subprocess.Popen(
        ["railway", "variables", "list"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print("Failed to retrieve environment variables:")
        print(stderr)
        return False
    
    # Parse the output to check for required variables
    # Note: The actual parsing depends on the output format of the Railway CLI
    missing_vars = []
    for var in REQUIRED_ENV_VARS:
        if var not in stdout:
            missing_vars.append(var)
    
    if missing_vars:
        print("Missing environment variables:")
        for var in missing_vars:
            print(f"  - {var}")
        return False
    
    print("All required environment variables are set.")
    return True

def deploy_application() -> bool:
    """Deploy the application to Railway."""
    print("Deploying application to Railway...")
    
    env = os.environ.copy()
    env["RAILWAY_TOKEN"] = RAILWAY_TOKEN
    
    process = subprocess.Popen(
        ["railway", "up"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print("Deployment failed:")
        print(stderr)
        return False
    
    print("Deployment completed successfully.")
    print(stdout)
    return True

def get_deployment_url() -> Optional[str]:
    """Get the URL of the deployed application."""
    print("Retrieving deployment URL...")
    
    env = os.environ.copy()
    env["RAILWAY_TOKEN"] = RAILWAY_TOKEN
    
    process = subprocess.Popen(
        ["railway", "service", "url"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print("Failed to retrieve deployment URL:")
        print(stderr)
        return None
    
    url = stdout.strip()
    if not url:
        print("No deployment URL found.")
        return None
    
    print(f"Deployment URL: {url}")
    return url

def test_deployment(url: str) -> bool:
    """Test the deployed application."""
    print(f"Testing deployment at {url}...")
    
    # Add health endpoint check
    health_url = f"{url}/api/health"
    try:
        response = requests.get(health_url, timeout=10)
        if response.status_code == 200:
            print("Health check passed!")
            print(f"Response: {response.text}")
            return True
        else:
            print(f"Health check failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.RequestException as e:
        print(f"Failed to connect to {health_url}: {e}")
        return False

def test_redis_connection():
    """Test Redis connectivity using the Redis URL."""
    try:
        import redis
        from urllib.parse import urlparse
        
        # Get Redis URL from environment or railway.toml
        redis_url = os.environ.get("REDIS_URL")
        if not redis_url:
            print("REDIS_URL environment variable not set.")
            # Try to parse from railway.toml
            try:
                with open("railway.toml", "r") as f:
                    for line in f:
                        if "REDIS_URL" in line:
                            redis_url = line.split("=")[1].strip().strip('"')
                            break
            except Exception as e:
                print(f"Failed to read railway.toml: {e}")
                return False
        
        if not redis_url:
            print("Could not find Redis URL.")
            return False
        
        print(f"Testing Redis connection to {redis_url}...")
        
        # Parse Redis URL
        parsed_url = urlparse(redis_url)
        host = parsed_url.hostname
        port = parsed_url.port
        username = parsed_url.username
        password = parsed_url.password
        
        # Connect to Redis
        r = redis.Redis(
            host=host,
            port=port,
            username=username,
            password=password,
            decode_responses=True,
            ssl=True
        )
        
        # Test connection
        response = r.ping()
        print(f"Redis ping response: {response}")
        
        # Test set/get
        test_key = "railway_deployment_test"
        test_value = f"test_value_{time.time()}"
        r.set(test_key, test_value)
        retrieved_value = r.get(test_key)
        r.delete(test_key)
        
        if retrieved_value == test_value:
            print("Redis set/get test passed!")
            return True
        else:
            print(f"Redis set/get test failed. Expected '{test_value}', got '{retrieved_value}'")
            return False
            
    except ImportError:
        print("Redis package not installed. Please install with: pip install redis")
        return False
    except Exception as e:
        print(f"Redis connection test failed: {e}")
        return False

def main():
    """Main function to deploy the application to Railway."""
    print("=" * 50)
    print("STAR Backend Railway Deployment")
    print("=" * 50)
    
    # Check Railway CLI
    if not check_railway_cli():
        return False
    
    # Authenticate with Railway
    if not authenticate_with_railway():
        return False
    
    # Link to project
    if not link_to_project():
        return False
    
    # Verify environment variables
    if not verify_environment_variables():
        print("Warning: Some environment variables might be missing.")
        proceed = input("Do you want to proceed anyway? (y/n): ")
        if proceed.lower() != "y":
            return False
    
    # Test Redis connection
    if not test_redis_connection():
        print("Warning: Redis connection test failed.")
        proceed = input("Do you want to proceed with deployment anyway? (y/n): ")
        if proceed.lower() != "y":
            return False
    
    # Deploy application
    if not deploy_application():
        return False
    
    # Get deployment URL
    url = get_deployment_url()
    if not url:
        print("Warning: Could not retrieve deployment URL.")
        return False
    
    # Wait a moment for the deployment to stabilize
    print("Waiting for deployment to stabilize (15 seconds)...")
    time.sleep(15)
    
    # Test deployment
    if not test_deployment(url):
        print("Warning: Deployment test failed.")
        print("The application might still be starting up or there might be issues with the deployment.")
        print("Check the logs with: railway logs")
    else:
        print("Deployment successful and tested!")
    
    print("=" * 50)
    print(f"Deployment URL: {url}")
    print("=" * 50)
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)