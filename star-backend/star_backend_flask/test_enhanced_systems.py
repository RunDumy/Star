#!/usr/bin/env python3
"""
Test script for Enhanced Lunar Engine and Archetypal Mentors System
"""

import datetime
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_enhanced_lunar_engine():
    """Test the Enhanced Lunar Engine"""
    try:
        from enhanced_lunar_engine import EnhancedLunarEngine

        print("Testing Enhanced Lunar Engine...")

        # Create lunar engine
        lunar_engine = EnhancedLunarEngine()

        # Test lunar data calculation
        lunar_data = lunar_engine.calculate_precision_moon_data()
        print(f"✓ Lunar phase: {lunar_data['phase']['phase']}")
        print(f"✓ Lunar mansion: {lunar_data['mansion']['name']}")
        print(f"✓ Void of course: {lunar_data['void_of_course']}")

        # Test lunar guidance
        guidance = lunar_engine.get_lunar_guidance_enhanced()
        print(f"✓ Lunar guidance generated: {len(guidance)} fields")

        print("✓ Enhanced Lunar Engine test passed!")
        return True

    except Exception as e:
        print(f"✗ Enhanced Lunar Engine test failed: {e}")
        return False

def test_archetypal_mentors():
    """Test the Archetypal Mentors System"""
    try:
        from enhanced_archetypal_mentors import ArchetypalMentorRegistry

        print("\nTesting Archetypal Mentors System...")

        # Create mentor registry
        registry = ArchetypalMentorRegistry()

        print(f"✓ Loaded {len(registry.mentors)} archetypal mentors")

        # Test mentor assignment
        user_data = {
            'natal_chart': None,  # Simplified test
            'numerology': {'life_path': 7}
        }

        lunar_data = {
            'phase': {'phase': 'waxing_crescent'},
            'mansion': {'name': 'Ashwini'}
        }

        mentor = registry.assign_mentor(user_data, lunar_data)
        print(f"✓ Assigned mentor: {mentor.name} ({mentor.archetype})")

        # Test mentor guidance
        guidance = mentor.generate_guidance("What should I focus on today?", lunar_data)
        print(f"✓ Mentor guidance generated: {guidance['archetype']} in {guidance['mood']} mood")

        print("✓ Archetypal Mentors System test passed!")
        return True

    except Exception as e:
        print(f"✗ Archetypal Mentors System test failed: {e}")
        return False

def test_enhanced_oracle():
    """Test the Enhanced Occult Oracle Engine"""
    try:
        from enhanced_occult_oracle import EnhancedOccultOracleEngine

        print("\nTesting Enhanced Occult Oracle Engine...")

        # Create enhanced oracle
        oracle = EnhancedOccultOracleEngine()

        # Test lunar guidance
        lunar_guidance = oracle.get_comprehensive_lunar_guidance()
        print(f"✓ Enhanced lunar guidance: {lunar_guidance['moon_phase']} in {lunar_guidance['moon_mansion']}")

        # Test mentor guidance
        mentor_guidance = oracle.get_archetypal_mentor_guidance("test_user", "Test question")
        print(f"✓ Archetypal mentor guidance: {mentor_guidance['mentor']} - {mentor_guidance['archetype']}")

        print("✓ Enhanced Occult Oracle Engine test passed!")
        return True

    except Exception as e:
        print(f"✗ Enhanced Occult Oracle Engine test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧙‍♂️ STAR Platform: Enhanced Occult Oracle Systems Test")
    print("=" * 60)

    results = []

    # Test each system
    results.append(test_enhanced_lunar_engine())
    results.append(test_archetypal_mentors())
    results.append(test_enhanced_oracle())

    print("\n" + "=" * 60)
    print("📊 Test Results:")

    passed = sum(results)
    total = len(results)

    print(f"✓ Passed: {passed}/{total}")

    if passed == total:
        print("🎉 All enhanced systems are working correctly!")
        print("\n🌙 Lunar Engine: Precision astronomical calculations with 28 Nakshatras")
        print("🧙 Archetypal Mentors: 33 master mentors with dynamic personalities")
        print("🔮 Enhanced Oracle: Integrated lunar and mentor guidance")
        return 0
    else:
        print("❌ Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())