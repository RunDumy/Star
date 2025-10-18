#!/usr/bin/env python3
"""Simple API test script for STAR backend"""

import json
import sys

import requests


def test_api_endpoint(url, method='GET', data=None):
    """Test a single API endpoint"""
    try:
        print(f"\n🌟 Testing {method} {url}")
        
        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=10)
        else:
            print(f"  ❌ Unsupported method: {method}")
            return False
            
        print(f"  Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"  ✅ Response: {json.dumps(result, indent=2)}")
                return True
            except json.JSONDecodeError:
                print(f"  ✅ Response: {response.text}")
                return True
        else:
            print(f"  ❌ Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Connection failed - server not running on {url}")
        return False
    except requests.exceptions.Timeout:
        print(f"  ❌ Request timeout")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Test the STAR backend API endpoints"""
    print("🌟 STAR Backend API Test Suite")
    print("=" * 50)
    
    base_url = "http://127.0.0.1:5000"
    
    # Test basic endpoints
    endpoints = [
        ("/api/health", "GET"),
        ("/api/v1/zodiac-arena/leaderboard", "GET"),
        ("/", "GET"),  # Test root endpoint
    ]
    
    success_count = 0
    total_tests = len(endpoints)
    
    for endpoint, method in endpoints:
        url = base_url + endpoint
        if test_api_endpoint(url, method):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"🎯 Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 All API tests passed! STAR backend is running correctly.")
        return 0
    else:
        print("⚠️  Some API tests failed. Check server logs.")
        return 1

if __name__ == "__main__":
    sys.exit(main())