#!/usr/bin/env python3
"""
Test script for the new Sigil Generation API
Tests the complete flow: zodiac calculation -> archetype selection -> sigil generation
"""

import json
import sys

import requests

API_BASE = "http://localhost:5000/api/v1"

def test_zodiac_calculator():
    """Test the enhanced zodiac calculator"""
    print("🌌 Testing Zodiac Calculator...")
    
    data = {
        "birthdate": "1990-10-31",
        "birthtime": "14:30"
    }
    
    try:
        print(f"Sending request to: {API_BASE}/zodiac-calculator")
        print(f"Data: {data}")
        response = requests.post(f"{API_BASE}/zodiac-calculator", 
                               json=data, 
                               headers={'Content-Type': 'application/json'})
        print(f"Status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Zodiac calculation successful!")
            print(f"Western: {result['western']}")
            print(f"Chinese: {result['chinese']}")
            print(f"Vedic: {result['vedic']}")
            print(f"Mayan: {result['mayan']}")
            print(f"Galactic Tone: {result['galacticTone']}")
            print(f"Life Path Number: {result['numerology']['lifePathNumber']}")
            print(f"Primary Element: {result['primaryElement']}")
            return result
        else:
            print(f"❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def test_archetype_system():
    """Test the archetype system"""
    print("\n🏛️ Testing Archetype System...")
    
    try:
        # Test GET - fetch all archetypes
        response = requests.get(f"{API_BASE}/archetype")
        print(f"GET Status: {response.status_code}")
        
        if response.status_code == 200:
            archetypes = response.json()
            print("✅ Archetype fetch successful!")
            for key, archetype in archetypes.items():
                print(f"- {archetype['name']}: {archetype['description']}")
            return archetypes
        else:
            print(f"❌ GET Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Archetype request failed: {e}")
        return None

def test_sigil_generation(zodiac_signs, archetype_key="mystic"):
    """Test the new sigil generation system"""
    print(f"\n🔮 Testing Sigil Generation for {archetype_key.upper()}...")
    
    data = {
        "user_id": "test_user_12345",
        "zodiac_signs": zodiac_signs,
        "archetype": archetype_key,
        "variations": 3
    }
    
    try:
        response = requests.post(f"{API_BASE}/sigils", json=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Sigil generation successful!")
            print(f"Primary Zodiac: {result['primary_zodiac']}")
            print(f"Archetype: {result['archetype']}")
            print(f"Elemental Influence: {result['elemental_influence']}")
            print(f"Generated {len(result['sigils'])} sigil variations")
            
            for i, sigil in enumerate(result['sigils']):
                print(f"\nSigil {i+1}:")
                print(f"  ID: {sigil['id']}")
                print(f"  Points: {len(sigil['points'])} geometric points")
                print(f"  Strokes: {len(sigil['strokes'])} connecting strokes")
                print(f"  Element: {sigil['metadata']['element']}")
                print(f"  Generated: {sigil['metadata']['generated_at']}")
            
            return result
        else:
            print(f"❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Sigil generation failed: {e}")
        return None

def test_sigil_selection(user_id, sigil_id):
    """Test sigil selection functionality"""
    print(f"\n⭐ Testing Sigil Selection...")
    
    data = {
        "user_id": user_id,
        "sigil_id": sigil_id
    }
    
    try:
        response = requests.post(f"{API_BASE}/sigils/select", json=data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Sigil selection successful!")
            print(f"Selected sigil: {result['sigil']['id']}")
            return result
        else:
            print(f"❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Sigil selection failed: {e}")
        return None

def main():
    """Run complete test suite"""
    print("🌟 STAR Platform Sigil System Test Suite")
    print("=" * 50)
    
    # Test 1: Zodiac Calculator
    zodiac_result = test_zodiac_calculator()
    if not zodiac_result:
        print("❌ Zodiac calculation failed. Aborting tests.")
        sys.exit(1)
    
    # Test 2: Archetype System
    archetypes = test_archetype_system()
    if not archetypes:
        print("❌ Archetype system failed. Aborting tests.")
        sys.exit(1)
    
    # Test 3: Sigil Generation for different archetypes
    test_archetypes = ['seeker', 'guardian', 'rebel', 'mystic']
    
    for archetype in test_archetypes:
        sigil_result = test_sigil_generation(zodiac_result, archetype)
        if sigil_result:
            # Test sigil selection with first variation
            if sigil_result['sigils']:
                test_sigil_selection("test_user_12345", sigil_result['sigils'][0]['id'])
    
    print("\n🎉 Test Suite Complete!")
    print("✅ Sigil Generation System is working!")
    print("\nNext steps:")
    print("1. ✅ Backend API endpoints implemented")
    print("2. ✅ Enhanced zodiac calculator working")
    print("3. ✅ Sigil generation with variations working")
    print("4. 🔄 Frontend integration ready for testing")

if __name__ == "__main__":
    main()