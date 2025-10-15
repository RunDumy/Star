"""
Test configuration and fixtures for zodiac system tests
"""

import os
import sys
from datetime import datetime

import pytest

# Add paths for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'star_backend_flask'))

# Try to import zodiac components, skip if dependencies not available
try:
    from animation_manager import ZodiacAnimationManager
except ImportError:
    ZodiacAnimationManager = None

try:
    from oracle_engine import MultiZodiacCalculator
except ImportError:
    MultiZodiacCalculator = None


@pytest.fixture
def sample_birth_data():
    """Sample birth data for testing zodiac calculations"""
    return {
        'birth_date': '1990-03-21',
        'birth_time': '12:00',
        'birth_location': {
            'latitude': 40.7128,
            'longitude': -74.0060,
            'name': 'New York, NY'
        }
    }


@pytest.fixture
def zodiac_calculator():
    """Instance of MultiZodiacCalculator for testing"""
    if MultiZodiacCalculator is None:
        pytest.skip("MultiZodiacCalculator not available - missing dependencies")
    return MultiZodiacCalculator()


@pytest.fixture
def animation_manager():
    """Instance of ZodiacAnimationManager for testing"""
    if ZodiacAnimationManager is None:
        pytest.skip("ZodiacAnimationManager not available - missing dependencies")
    return ZodiacAnimationManager()


@pytest.fixture
def all_zodiac_systems():
    """List of all supported zodiac systems"""
    return ['western', 'chinese', 'vedic', 'mayan', 'aztec']


@pytest.fixture
def sample_calculation_result():
    """Sample multi-zodiac calculation result for API testing"""
    return {
        'birth_data': {
            'birth_date': '1990-03-21',
            'birth_time': '12:00',
            'birth_location': {'latitude': 40.7128, 'longitude': -74.0060}
        },
        'zodiac_systems': {
            'western': {
                'sun_sign': 'Aries',
                'moon_sign': 'Leo',
                'rising_sign': 'Sagittarius',
                'element': 'Fire',
                'quality': 'Cardinal'
            },
            'chinese': {
                'year_animal': 'Horse',
                'month_animal': 'Rabbit',
                'day_animal': 'Dragon',
                'element': 'Metal'
            },
            'vedic': {
                'rashi': 'Mesha',
                'nakshatra': 'Ashwini',
                'nakshatra_pada': 1,
                'moon_sign': 'Simha'
            },
            'mayan': {
                'day_sign': 'Imix',
                'galactic_tone': 1,
                'trecena': 'Imix',
                'solar_seal': 'Red Dragon'
            },
            'aztec': {
                'day_sign': 'Cipactli',
                'trecena_lord': 'Xiuhtecuhtli',
                'tonalpohualli_position': 1
            }
        },
        'cosmic_signature': {
            'primary_element': 'Fire',
            'secondary_element': 'Metal',
            'galactic_tone': 1,
            'synthesis': 'Dynamic Fire-Metal harmony with initiating tone'
        }
    }