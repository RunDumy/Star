#!/usr/bin/env python3

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend/star_backend_flask'))

from archetype_oracle import ArchetypeOracle
from datetime import datetime

def test_archetype_oracle():
    print("Testing Archetype Oracle...")

    # Test with a sample birth date
    full_name = "John Doe"
    birth_date = datetime(1990, 5, 15)

    # Test profile generation
    print("\n1. Testing Cosmic Profile:")
    profile = ArchetypeOracle.generate_cosmic_profile(full_name, birth_date, tradition='Hermetic')
    if profile:
        print(f"Profile keys: {list(profile.keys())}")
        if 'poetic_scrolls' in profile:
            print("Poetic scrolls present:", list(profile['poetic_scrolls'].keys())[:2])
    else:
        print("ERROR: Failed to generate profile")

    # Test spread
    print("\n2. Testing Symbolic Spread:")
    spread = ArchetypeOracle.generate_symbolic_spread(full_name, birth_date, tradition='Hermetic')
    if spread:
        print(f"Spread keys: {list(spread.keys())}")
        if 'spread' in spread and 'past' in spread['spread']:
            print(f"Past interpretation: {spread['spread']['past']['interpretation'][:50]}...")
    else:
        print("ERROR: Failed to generate spread")

    # Test resonance map
    print("\n3. Testing Resonance Map:")
    resonance = ArchetypeOracle.generate_resonance_map(full_name, birth_date, tradition='Hermetic')
    if resonance:
        print(f"Resonance keys: {list(resonance.keys())[:3]}")
        if 'life_path' in resonance:
            print(f"Life Path poetic desc: {resonance['life_path'].get('poetic_description', 'None')}")
    else:
        print("ERROR: Failed to generate resonance map")

    # Test public oracle
    print("\n4. Testing Public Oracle:")
    public = ArchetypeOracle.calculate_public_oracle(full_name, birth_date.strftime('%Y-%m-%d'), tradition='Hermetic')
    if public:
        print(f"Public oracle user_info: {public.get('user_info', {})}")
    else:
        print("ERROR: Failed to generate public oracle")

    print("\nTest completed!")

if __name__ == '__main__':
    test_archetype_oracle()
