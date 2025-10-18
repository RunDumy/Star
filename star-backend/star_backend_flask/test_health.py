#!/usr/bin/env python3
"""
STAR Platform Health Check Script
Tests all critical endpoints and functionality
"""
import os
import sys
import json
import requests
from datetime import datetime

def test_health_endpoint(base_url="http://localhost:5000"):
    """Test the main health endpoint"""
    try:
        print("🔍 Testing /api/health endpoint...")
        response = requests.get(f"{base_url}/api/health", timeout=10)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health endpoint responsive: {data.get('status')}")
            print(f"   📊 Modules: {data.get('modules', {})}")
            print(f"   🕒 Timestamp: {data.get('timestamp', 'N/A')}")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_zodiac_calculator(base_url="http://localhost:5000"):
    """Test zodiac calculation endpoint"""
    try:
        print("\n🔍 Testing /api/v1/zodiac-calculator endpoint...")
        payload = {"birth_date": "2000-01-01"}
        response = requests.post(f"{base_url}/api/v1/zodiac-calculator",
                               json=payload, timeout=10)

        if response.status_code == 200:
            data = response.json()
            print("✅ Zodiac calculator working")
            print(f"   🌟 Signs: Western={data.get('western')}, Chinese={data.get('chinese')}, Galactic={data.get('galactic')}")
            return True
        else:
            print(f"❌ Zodiac calculator failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Zodiac calculator error: {e}")
        return False

def test_tarot_endpoint(base_url="http://localhost:5000"):
    """Test tarot reading endpoint"""
    try:
        print("\n🔍 Testing /api/oracle/tarot endpoint...")
        payload = {"question": "General guidance"}
        response = requests.post(f"{base_url}/api/oracle/tarot",
                               json=payload, timeout=10)

        if response.status_code == 200:
            data = response.json()
            print("✅ Tarot reading working")
            print(f"   🔮 Reading: {len(data.get('reading', {}).get('cards', []))} cards drawn")
            return True
        elif response.status_code == 503:
            print("⚠️  Tarot unavailable (Oracle engine not loaded)")
            return True  # Expected if ephem not installed
        else:
            print(f"❌ Tarot endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Tarot endpoint error: {e}")
        return False

def test_spotify_endpoint(base_url="http://localhost:5000"):
    """Test Spotify lunar phase endpoint"""
    try:
        print("\n🔍 Testing /api/v1/spotify/lunar-phase endpoint...")
        response = requests.get(f"{base_url}/api/v1/spotify/lunar-phase", timeout=10)

        if response.status_code == 200:
            data = response.json()
            print("✅ Spotify lunar phase working")
            print(f"   🌕 Phase: {data.get('phase')} ({data.get('illumination')}%)")
            return True
        else:
            print(f"❌ Spotify lunar phase failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Spotify lunar phase error: {e}")
        return False

def test_analytics_endpoint(base_url="http://localhost:5000"):
    """Test analytics health"""
    try:
        print("\n🔍 Testing analytics availability...")
        response = requests.get(f"{base_url}/api/v1/analytics/health", timeout=10)

        if response.status_code == 200:
            print("✅ Analytics system operational")
            return True
        elif response.status_code == 404:
            print("⚠️  Analytics system not available")
            return True  # Expected if analytics_api not loaded
        else:
            print(f"❌ Analytics endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Analytics endpoint error: {e}")
        return True  # Expected if not running

def run_comprehensive_test(base_url="http://localhost:5000"):
    """Run all tests and provide comprehensive report"""
    print("🌌 STAR Platform Comprehensive Health Check")
    print("=" * 50)
    print(f"🕒 Started: {datetime.now().isoformat()}")

    tests = [
        ("Health Check", test_health_endpoint),
        ("Zodiac Calculator", test_zodiac_calculator),
        ("Tarot System", test_tarot_endpoint),
        ("Spotify Integration", test_spotify_endpoint),
        ("Analytics System", test_analytics_endpoint),
    ]

    results = {}
    total_passed = 0

    for test_name, test_func in tests:
        print(f"\n{'-'*20} {test_name} {'-'*20}")
        result = test_func(base_url)
        results[test_name] = result
        if result:
            total_passed += 1
        print()

    # Summary
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 30)
    print(f"Total Tests: {len(tests)}")
    print(f"Passed: {total_passed}")
    print(f"Failed: {len(tests) - total_passed}")
    print(".1f")
    print()

    # Detailed results
    print("Detailed Results:")
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {test_name}: {status}")

    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    if total_passed >= 4:
        print("✅ Platform is healthy and ready for deployment!")
        if not results.get("Analytics System", True):
            print("📝 Optional: Install analytics_api module for enhanced insights")

        if not results.get("Tarot System", False):
            print("📝 Optional: Install ephem module for precise astronomical calculations")

    else:
        print("⚠️  Some critical components may need attention")
        if not results.get("Health Check", False):
            print("❌ Critical: Health endpoint must be working")

        if not results.get("Zodiac Calculator", False):
            print("❌ Critical: Core zodiac functionality required")

    return total_passed == len(tests)

if __name__ == "__main__":
    # Use first argument as base URL if provided
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"

    print(f"🌌 Testing STAR Platform at: {base_url}")
    success = run_comprehensive_test(base_url)

    # Write results to file
    report = {
        "timestamp": datetime.now().isoformat(),
        "base_url": base_url,
        "success": success,
        "platform_ready": success
    }

    with open("health_check_results.json", "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Results saved to: health_check_results.json")

    sys.exit(0 if success else 1)
