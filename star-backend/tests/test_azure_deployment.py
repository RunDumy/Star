"""
Azure-specific tests for STAR backend
This test suite specifically validates functionality on Azure App Service
"""

import os
import pytest
import requests
import time

# Set the Azure backend URL for testing
AZURE_BACKEND_URL = os.environ.get(
    "AZURE_BACKEND_URL", 
    "https://star-app-backend.azurewebsites.net"
)

def test_azure_health_endpoint():
    """Test the Azure health endpoint"""
    response = requests.get(f"{AZURE_BACKEND_URL}/api/health", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"

def test_azure_root_endpoint():
    """Test the Azure root endpoint"""
    response = requests.get(AZURE_BACKEND_URL, timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "version" in data
    
def test_azure_environment_config():
    """Test that Azure-specific environment variables are correctly set"""
    # Skip if not running in Azure environment
    if os.environ.get('WEBSITE_SITE_NAME') is None:
        pytest.skip("Not running in Azure environment")
    
    # Verify essential environment variables
    assert os.environ.get('DATABASE_URL') is not None, "DATABASE_URL not set in Azure"
    assert os.environ.get('SECRET_KEY') is not None, "SECRET_KEY not set in Azure"
    assert os.environ.get('JWT_SECRET_KEY') is not None, "JWT_SECRET_KEY not set in Azure"
    
    # Verify optional environment variables with defaults
    assert os.environ.get('REDIS_URL', 'default-value') != '', "REDIS_URL is empty in Azure"

def test_azure_authentication():
    """Test authentication endpoints on Azure"""
    # Test with invalid credentials
    login_response = requests.post(
        f"{AZURE_BACKEND_URL}/api/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
        timeout=10
    )
    assert login_response.status_code in (401, 403), "Invalid login should be rejected"
    
    # Note: Add test with valid credentials if you have a test account
    # This is intentionally omitted for security reasons

@pytest.mark.parametrize("endpoint", [
    "/api/feed",
    "/api/profile",
    "/api/recommendations"
])
def test_azure_protected_endpoints(endpoint):
    """Test protected endpoints require authentication on Azure"""
    response = requests.get(f"{AZURE_BACKEND_URL}{endpoint}", timeout=10)
    assert response.status_code in (401, 403), f"Endpoint {endpoint} should require authentication"

@pytest.mark.skipif(os.environ.get('REDIS_URL') is None, 
                    reason="Redis not configured")
def test_azure_redis_connection():
    """Test Redis connection in Azure"""
    # This requires access to the backend code
    # If running remotely, we can only test indirectly
    cache_endpoint = f"{AZURE_BACKEND_URL}/api/cache-test"
    
    # First request should cache the result
    start_time = time.time()
    first_response = requests.get(cache_endpoint, timeout=10)
    _ = time.time() - start_time  # first_time not used
    
    # Second request should be faster if cache is working
    start_time = time.time()
    second_response = requests.get(cache_endpoint, timeout=10)
    _ = time.time() - start_time  # second_time not used
    
    # Both responses should be successful
    assert first_response.status_code == 200
    assert second_response.status_code == 200
    
    # Check if cache header is present (implementation dependent)
    assert "X-Cache" in second_response.headers, "Cache header missing"
    
    # Alternatively, verify cached response is faster
    # Note: This is not always reliable due to network variance
    # assert second_time < first_time, "Cached response should be faster"

def test_azure_websocket_connection():
    """Test WebSocket connection to Azure backend"""
    # This requires a WebSocket client implementation
    # For simplicity, we'll just check if the WebSocket endpoint is accessible
    # A full test would establish a WebSocket connection and verify messaging
    
    # Check WebSocket upgrade endpoint
    response = requests.get(f"{AZURE_BACKEND_URL}/api/socket.io/", timeout=10)
    assert response.status_code in (200, 101, 400), "WebSocket endpoint should be accessible"
    
    # The response code may vary depending on how your WebSocket is implemented:
    # - 101: WebSocket Upgrade Accepted
    # - 200: HTTP endpoint handling WebSockets
    # - 400: Bad request (expected without proper WebSocket handshake)

def test_azure_latency():
    """Test latency to Azure backend"""
    start_time = time.time()
    requests.get(f"{AZURE_BACKEND_URL}/api/health", timeout=10)
    latency = (time.time() - start_time) * 1000  # ms
    
    # Log the latency for monitoring
    print(f"Azure backend latency: {latency:.2f} ms")
    
    # Latency should be reasonable (adjust threshold as needed)
    assert latency < 2000, f"High latency detected: {latency:.2f} ms"