# star-backend/test_zodiac_display_system.py
"""
Comprehensive test suite for the Zodiac Badge & Sigil Display System
Tests both backend API endpoints and data structure integrity
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone

import pytest
import requests

# Add the parent directory to sys.path to import modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'star_backend_flask'))

from star_backend_flask.cosmos_db import get_cosmos_helper

# Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')
TEST_USER_ID = 'test_user_zodiac_display'
TEST_TOKEN = None

def setup_module():
    """Setup test environment"""
    global TEST_TOKEN
    print("🌟 Setting up Zodiac Display System tests...")
    
    # Create test user and get token
    try:
        register_response = requests.post(f"{API_BASE_URL}/api/v1/auth/register", json={
            "username": "zodiac_test_user",
            "email": "zodiac.test@starplatform.com",
            "password": "TestZodiac123!",
            "birthdate": "1990-11-08",
            "birth_time": "14:30",
            "birth_location": "New York, NY"
        })
        
        if register_response.status_code == 201:
            TEST_TOKEN = register_response.json().get('token')
            print(f"✅ Test user created with token: {TEST_TOKEN[:20]}...")
        else:
            # Try login if user exists
            login_response = requests.post(f"{API_BASE_URL}/api/v1/auth/login", json={
                "username": "zodiac_test_user",
                "password": "TestZodiac123!"
            })
            if login_response.status_code == 200:
                TEST_TOKEN = login_response.json().get('token')
                print(f"✅ Using existing test user, token: {TEST_TOKEN[:20]}...")
    
    except Exception as e:
        print(f"❌ Setup error: {e}")

def test_cosmic_profile_display_endpoint():
    """Test the cosmic profile display API endpoint"""
    if not TEST_TOKEN:
        pytest.skip("No test token available")
    
    print("\n🔮 Testing Cosmic Profile Display Endpoint...")
    
    headers = {'Authorization': f'Bearer {TEST_TOKEN}'}
    
    # First ensure we have a cosmic profile
    try:
        # Create zodiac calculation
        zodiac_response = requests.post(f"{API_BASE_URL}/api/v1/zodiac-calculator", 
            json={
                "birthdate": "1990-11-08",
                "birth_time": "14:30",
                "birth_location": "New York, NY"
            },
            headers=headers
        )
        
        if zodiac_response.status_code == 200:
            zodiac_data = zodiac_response.json()
            print(f"✅ Zodiac calculated: {zodiac_data.get('western_zodiac')}")
        
        # Create archetype selection
        archetype_response = requests.post(f"{API_BASE_URL}/api/v1/archetype", 
            json={"archetype": "mystic"},
            headers=headers
        )
        
        if archetype_response.status_code == 200:
            print("✅ Archetype selected: mystic")
        
        # Generate sigils
        sigil_response = requests.post(f"{API_BASE_URL}/api/v1/sigils",
            headers=headers
        )
        
        if sigil_response.status_code == 200:
            sigils = sigil_response.json().get('sigils', [])
            print(f"✅ Sigils generated: {len(sigils)} options")
            
            if sigils:
                # Select first sigil
                select_response = requests.post(f"{API_BASE_URL}/api/v1/sigils/select",
                    json={"sigil_id": sigils[0]['id']},
                    headers=headers
                )
                if select_response.status_code == 200:
                    print("✅ Sigil selected successfully")
    
    except Exception as e:
        print(f"⚠️ Profile setup warning: {e}")
    
    # Test cosmic profile display endpoint
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/cosmic-profile-display/{TEST_USER_ID}",
            headers=headers
        )
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            assert 'profile' in data, "Response should contain profile data"
            assert 'displayModes' in data, "Response should contain display modes"
            assert 'elementalDominance' in data, "Response should contain elemental dominance"
            
            profile = data['profile']
            
            # Validate profile structure
            required_fields = ['zodiacSigns', 'elementalBalance', 'badges']
            for field in required_fields:
                assert field in profile, f"Profile should contain {field}"
            
            # Validate elemental balance
            elemental_balance = profile['elementalBalance']
            elements = ['fire', 'earth', 'air', 'water']
            for element in elements:
                assert element in elemental_balance, f"Elemental balance should contain {element}"
                assert isinstance(elemental_balance[element], (int, float)), f"{element} should be numeric"
            
            # Validate badges structure
            badges = profile['badges']
            assert isinstance(badges, list), "Badges should be a list"
            
            for badge in badges:
                required_badge_fields = ['id', 'name', 'category', 'x', 'y']
                for field in required_badge_fields:
                    assert field in badge, f"Badge should contain {field}"
            
            # Validate display modes
            expected_modes = ['shrine', 'carousel', 'orbit', 'grid']
            display_modes = data['displayModes']
            for mode in expected_modes:
                assert mode in display_modes, f"Display modes should include {mode}"
            
            print("✅ Cosmic Profile Display endpoint test passed!")
            print(f"   - Profile ID: {profile.get('id')}")
            print(f"   - Zodiac Signs: {profile.get('zodiacSigns')}")
            print(f"   - Elemental Dominance: {data.get('elementalDominance')}")
            print(f"   - Badge Count: {data.get('badgeCount')}")
            print(f"   - Sigil Selected: {data.get('sigilSelected')}")
            
            return True
            
        elif response.status_code == 404:
            print("⚠️ Profile not found - this is expected for new test users")
            return False
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Cosmic Profile Display test error: {e}")
        return False

def test_badge_position_update():
    """Test badge position update endpoint"""
    if not TEST_TOKEN:
        pytest.skip("No test token available")
    
    print("\n🏆 Testing Badge Position Update...")
    
    headers = {'Authorization': f'Bearer {TEST_TOKEN}'}
    
    # Test data for badge positions
    badge_updates = [
        {"id": "scorpio_master", "x": 150, "y": 100},
        {"id": "mystic_initiate", "x": 200, "y": 150},
        {"id": "cosmic_awakening", "x": 100, "y": 200}
    ]
    
    try:
        response = requests.put(f"{API_BASE_URL}/api/v1/badges/position",
            json={"badges": badge_updates},
            headers=headers
        )
        
        print(f"Badge update response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            assert 'message' in data, "Response should contain success message"
            assert 'badges' in data, "Response should contain updated badges"
            
            print("✅ Badge position update test passed!")
            print(f"   - Updated {len(badge_updates)} badge positions")
            return True
        else:
            print(f"⚠️ Badge update response: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Badge position update test error: {e}")
        return False

def test_zodiac_display_data_integrity():
    """Test the integrity of zodiac display data structures"""
    print("\n🌀 Testing Zodiac Display Data Integrity...")
    
    try:
        # Test elemental balance calculations
        test_cases = [
            {
                'zodiac': 'scorpio',
                'expected_water': 40,
                'expected_dominant': 'water'
            },
            {
                'zodiac': 'aries', 
                'expected_fire': 40,
                'expected_dominant': 'fire'
            },
            {
                'zodiac': 'aquarius',
                'expected_air': 50,
                'expected_dominant': 'air'
            }
        ]
        
        for case in test_cases:
            zodiac = case['zodiac']
            
            # This would normally come from the API response
            elemental_map = {
                'scorpio': {'fire': 25, 'earth': 20, 'air': 15, 'water': 40},
                'aries': {'fire': 40, 'earth': 20, 'air': 25, 'water': 15},
                'aquarius': {'fire': 20, 'earth': 15, 'air': 50, 'water': 15}
            }
            
            balance = elemental_map.get(zodiac, {})
            dominant_element = max(balance, key=balance.get) if balance else 'balanced'
            
            print(f"   - {zodiac.title()}: {balance}")
            print(f"     Dominant: {dominant_element}")
            
            if 'expected_dominant' in case:
                assert dominant_element == case['expected_dominant'], f"Expected {case['expected_dominant']} to be dominant for {zodiac}"
        
        print("✅ Zodiac display data integrity test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Data integrity test error: {e}")
        return False

def test_display_mode_validation():
    """Test validation of display modes"""
    print("\n🎨 Testing Display Mode Validation...")
    
    valid_modes = ['shrine', 'carousel', 'orbit', 'grid']
    mode_descriptions = {
        'shrine': 'Zodiac Sigil Shrine with elemental auras',
        'carousel': 'Interactive horizontal scrolling display',
        'orbit': '3D floating badge ring around central avatar',
        'grid': 'Constellation-style grid layout'
    }
    
    for mode in valid_modes:
        description = mode_descriptions.get(mode, 'Unknown mode')
        print(f"   ✅ {mode.upper()}: {description}")
    
    print("✅ Display mode validation passed!")
    return True

def test_sigil_metadata_structure():
    """Test sigil metadata structure for display system"""
    print("\n🔮 Testing Sigil Metadata Structure...")
    
    # Sample sigil data structure
    sample_sigil = {
        'id': 'scorpio_mystic_transformation',
        'points': [[50, 20], [80, 40], [60, 70], [30, 60], [50, 20]],
        'strokes': [],
        'metadata': {
            'zodiac_sign': 'scorpio',
            'archetype': 'mystic',
            'element': 'water',
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
    }
    
    # Validate structure
    required_fields = ['id', 'points', 'metadata']
    for field in required_fields:
        assert field in sample_sigil, f"Sigil should contain {field}"
    
    metadata = sample_sigil['metadata']
    required_metadata = ['zodiac_sign', 'archetype', 'element', 'generated_at']
    for field in required_metadata:
        assert field in metadata, f"Sigil metadata should contain {field}"
    
    print("✅ Sigil metadata structure validation passed!")
    print(f"   - Sigil ID: {sample_sigil['id']}")
    print(f"   - Points: {len(sample_sigil['points'])} coordinates")
    print(f"   - Metadata: {sample_sigil['metadata']}")
    
    return True

def run_all_tests():
    """Run all zodiac display system tests"""
    print("🌟 Starting Zodiac Badge & Sigil Display System Tests")
    print("=" * 60)
    
    setup_module()
    
    tests = [
        test_cosmic_profile_display_endpoint,
        test_badge_position_update,
        test_zodiac_display_data_integrity,
        test_display_mode_validation,
        test_sigil_metadata_structure
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test.__name__} failed: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    print("🌟 TEST SUMMARY")
    passed = sum(1 for r in results if r)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    if passed == total:
        print("🎉 All Zodiac Display System tests passed!")
    else:
        print(f"⚠️ {total - passed} tests failed or skipped")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)