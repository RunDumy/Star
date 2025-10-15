#!/usr/bin/env python3
"""Test script for enhanced tarot API endpoints"""

import json

import requests


def test_enhanced_tarot_api():
    """Test the enhanced tarot API endpoints"""
    base_url = "http://localhost:5000/api/v1"
    
    print("=== ENHANCED TAROT API TEST ===\n")
    
    try:
        # Test 1: Get available spreads
        print("1. Testing /api/v1/tarot/spreads endpoint...")
        response = requests.get(f"{base_url}/tarot/spreads")
        
        if response.status_code == 200:
            spreads = response.json()
            print(f"✅ Success! Retrieved {len(spreads)} spreads:")
            for spread in spreads:
                print(f"   - {spread['name']}: {spread['description']} ({spread['card_count']} cards)")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
        
        print("\n" + "="*60 + "\n")
        
        # Test 2: Get cosmic influences
        print("2. Testing /api/v1/tarot/cosmic-influences endpoint...")
        response = requests.get(f"{base_url}/tarot/cosmic-influences")
        
        if response.status_code == 200:
            influences = response.json()
            print("✅ Success! Cosmic influences:")
            if isinstance(influences, dict):
                for key, value in influences.items():
                    print(f"   {key}: {value}")
            else:
                print(f"   {influences}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
        
        print("\n" + "="*60 + "\n")
        
        # Test 3: Create enhanced reading
        print("3. Testing enhanced tarot reading creation...")
        reading_data = {
            "spread_type": "single_card",
            "question": "What should I focus on today?",
            "user_profile": {
                "zodiac_sign": "scorpio",
                "life_path_number": 8,
                "name": "Test User"
            },
            "reading_intention": "Daily guidance"
        }
        
        response = requests.post(f"{base_url}/tarot/draw", json=reading_data)
        
        if response.status_code == 200:
            reading = response.json()
            print("✅ Success! Enhanced reading created:")
            print(f"   Reading ID: {reading.get('id', 'N/A')}")
            print(f"   Question: {reading.get('question', 'N/A')}")
            print(f"   Spread: {reading.get('spread', {}).get('name', 'N/A')}")
            print(f"   Cards: {len(reading.get('placements', []))}")
            
            if reading.get('placements'):
                card = reading['placements'][0]['card']
                print(f"   Card drawn: {card['name']} ({'Reversed' if card['is_reversed'] else 'Upright'})")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
        
        print("\n" + "="*60 + "\n")
        print("✅ Enhanced Tarot API testing complete!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Flask app is running on localhost:5000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_enhanced_tarot_api()