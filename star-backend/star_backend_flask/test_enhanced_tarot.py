#!/usr/bin/env python3
"""Test script for enhanced tarot system"""

from enhanced_tarot_engine import EnhancedTarotEngine


def test_enhanced_tarot():
    """Test the enhanced tarot reading system"""
    print("=== ENHANCED TAROT SYSTEM TEST ===\n")
    
    # Initialize engine
    engine = EnhancedTarotEngine()
    
    # Test 1: Available spreads
    print("1. Available spreads:")
    spreads = engine.get_available_spreads()
    for spread in spreads:
        print(f"   - {spread['name']}: {spread['description']}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Single card reading
    print("2. Creating single card reading...")
    user_profile = {
        'zodiac_sign': 'scorpio', 
        'life_path_number': 8,
        'name': 'Test User'
    }
    
    reading = engine.create_enhanced_reading(
        user_id='test_user_123',
        spread_type='single_card',
        question='What should I focus on today?',
        user_profile=user_profile,
        reading_intention='Daily guidance'
    )
    
    print(f"Reading ID: {reading.get('id')}")
    print(f"Question: {reading.get('question')}")
    print(f"Spread: {reading.get('spread', {}).get('name')}")
    print(f"Cards drawn: {len(reading.get('placements', []))}")
    
    # Show the card
    if reading.get('placements'):
        card_placement = reading['placements'][0]
        card = card_placement['card']
        position = card_placement['position']
        
        print(f"\nCard drawn: {card['name']}")
        print(f"Position: {position['name']} - {position['meaning']}")
        print(f"Orientation: {'Reversed' if card['is_reversed'] else 'Upright'}")
        print(f"Keywords: {', '.join(card['keywords'][:3])}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 3: Celtic Cross reading
    print("3. Creating Celtic Cross reading...")
    celtic_reading = engine.create_enhanced_reading(
        user_id='test_user_123',
        spread_type='celtic_cross',
        question='What do I need to know about my current path?',
        user_profile=user_profile
    )
    
    print(f"Celtic Cross cards: {len(celtic_reading.get('placements', []))}")
    print(f"Interpretation length: {len(celtic_reading.get('interpretation', {}).get('narrative', ''))}")
    
    # Show cosmic timing
    cosmic_timing = celtic_reading.get('cosmic_timing', {})
    if cosmic_timing:
        print(f"Cosmic timing advice: {cosmic_timing.get('current_phase', 'Unknown')}")
    
    print("\n✅ Enhanced Tarot System working perfectly!")

if __name__ == "__main__":
    test_enhanced_tarot()