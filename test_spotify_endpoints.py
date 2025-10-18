#!/usr/bin/env python3
"""
Test script for the new Spotify API endpoints
"""
import json
import sys

import requests

BASE_URL = "http://localhost:5000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test a single endpoint and return the result"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"\n{method} {endpoint}")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2)}")
                return True
            except:
                print(f"Response: {response.text}")
                return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Could not connect to {url}")
        print("Make sure the Flask server is running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Error testing {endpoint}: {e}")
        return False

def main():
    """Test all Spotify endpoints"""
    print("🎵 Testing Enhanced Spotify API Endpoints")
    print("=" * 60)
    
    tests = [
        # Test health endpoint first
        ("/api/health", "GET"),
        
        # Test our enhanced Spotify endpoints
        ("/api/v1/spotify/session/test_enhanced_123", "GET"),
        ("/api/v1/spotify/lunar-phase", "GET"),
        ("/api/v1/spotify/cosmic-playlist", "POST", {"mood": "cosmic", "zodiac_sign": "Scorpio", "life_path_number": 8}),
        
        # Test new enhanced endpoints
        ("/api/v1/spotify/auth-status", "GET"),
        ("/api/v1/spotify/track/search", "POST", {"query": "cosmic ambient", "zodiac_sign": "scorpio", "limit": 5}),
    ]
    
    results = []
    for test in tests:
        endpoint = test[0]
        method = test[1]
        data = test[2] if len(test) > 2 else None
        
        success = test_endpoint(endpoint, method, data)
        results.append((endpoint, success))
    
    print("\n" + "=" * 60)
    print("📊 Enhanced Test Results Summary:")
    
    passed = 0
    for endpoint, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {endpoint}")
        if success:
            passed += 1
    
    print(f"\nPassed: {passed}/{len(results)} tests")
    
    if passed == len(results):
        print("🎉 All enhanced endpoints working correctly!")
        print("🔮 Ready for real Spotify integration!")
    else:
        print("🔧 Some endpoints need attention.")
        
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)