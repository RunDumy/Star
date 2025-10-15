"""
Unit tests for MultiZodiacCalculator class
Tests all 5 zodiac system calculations and cosmic signature generation
"""

from datetime import datetime

import pytest
from oracle_engine import MultiZodiacCalculator


class TestMultiZodiacCalculator:
    """Test suite for MultiZodiacCalculator functionality"""
    
    def test_calculator_initialization(self, zodiac_calculator):
        """Test that calculator initializes correctly"""
        assert zodiac_calculator is not None
        assert hasattr(zodiac_calculator, 'calculate_all_zodiac_systems')
        assert hasattr(zodiac_calculator, 'generate_cosmic_signature')
    
    def test_western_zodiac_calculation(self, zodiac_calculator, sample_birth_data):
        """Test Western zodiac system calculations"""
        result = zodiac_calculator._calculate_western_enhanced(sample_birth_data)
        
        assert 'sun_sign' in result
        assert 'moon_sign' in result
        assert 'rising_sign' in result
        assert 'element' in result
        assert 'quality' in result
        
        # Test valid zodiac signs
        valid_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        assert result['sun_sign'] in valid_signs
    
    def test_chinese_zodiac_calculation(self, zodiac_calculator, sample_birth_data):
        """Test Chinese zodiac system calculations"""
        result = zodiac_calculator._calculate_chinese_enhanced(sample_birth_data)
        
        assert 'year_animal' in result
        assert 'month_animal' in result
        assert 'day_animal' in result
        assert 'element' in result
        
        # Test valid animals
        valid_animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
                        'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
        assert result['year_animal'] in valid_animals
        
        # Test valid elements
        valid_elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
        assert result['element'] in valid_elements
    
    def test_vedic_zodiac_calculation(self, zodiac_calculator, sample_birth_data):
        """Test Vedic (Hindu) zodiac system calculations"""
        result = zodiac_calculator._calculate_vedic_enhanced(sample_birth_data)
        
        assert 'rashi' in result
        assert 'nakshatra' in result
        assert 'nakshatra_pada' in result
        
        # Test valid rashis (12 Vedic signs)
        valid_rashis = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
                       'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']
        assert result['rashi'] in valid_rashis
        
        # Test nakshatra pada range
        assert 1 <= result['nakshatra_pada'] <= 4
    
    def test_mayan_zodiac_calculation(self, zodiac_calculator, sample_birth_data):
        """Test Mayan zodiac system calculations"""
        result = zodiac_calculator._calculate_mayan_enhanced(sample_birth_data)
        
        assert 'day_sign' in result
        assert 'galactic_tone' in result
        assert 'trecena' in result
        assert 'solar_seal' in result
        
        # Test galactic tone range
        assert 1 <= result['galactic_tone'] <= 13
        
        # Test valid day signs (20 Mayan day signs)
        valid_day_signs = ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 
                          'Lamat', 'Muluc', 'Oc', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 
                          'Cib', 'Caban', 'Etznab', 'Cauac', 'Ahau']
        assert result['day_sign'] in valid_day_signs
    
    def test_aztec_zodiac_calculation(self, zodiac_calculator, sample_birth_data):
        """Test Aztec zodiac system calculations"""
        result = zodiac_calculator._calculate_aztec_enhanced(sample_birth_data)
        
        assert 'day_sign' in result
        assert 'trecena_lord' in result
        assert 'tonalpohualli_position' in result
        
        # Test tonalpohualli position range (260-day cycle)
        assert 1 <= result['tonalpohualli_position'] <= 260
        
        # Test valid day signs (20 Aztec day signs)
        valid_day_signs = ['Cipactli', 'Ehecatl', 'Calli', 'Cuetzpalin', 'Coatl', 
                          'Miquiztli', 'Mazatl', 'Tochtli', 'Atl', 'Itzcuintli',
                          'Ozomatli', 'Malinalli', 'Acatl', 'Ocelotl', 'Cuauhtli',
                          'Cozcacuauhtli', 'Ollin', 'Tecpatl', 'Quiahuitl', 'Xochitl']
        assert result['day_sign'] in valid_day_signs
    
    def test_complete_zodiac_calculation(self, zodiac_calculator, sample_birth_data):
        """Test complete multi-zodiac system calculation"""
        result = zodiac_calculator.calculate_all_zodiac_systems(sample_birth_data)
        
        # Test structure
        assert 'birth_data' in result
        assert 'zodiac_systems' in result
        assert 'cosmic_signature' in result
        
        # Test all 5 systems present
        systems = result['zodiac_systems']
        assert 'western' in systems
        assert 'chinese' in systems
        assert 'vedic' in systems
        assert 'mayan' in systems
        assert 'aztec' in systems
    
    def test_cosmic_signature_generation(self, zodiac_calculator, sample_birth_data):
        """Test cosmic signature synthesis"""
        zodiac_data = zodiac_calculator.calculate_all_zodiac_systems(sample_birth_data)
        signature = zodiac_data['cosmic_signature']
        
        assert 'primary_element' in signature
        assert 'secondary_element' in signature
        assert 'galactic_tone' in signature
        assert 'synthesis' in signature
        
        # Test galactic tone range
        assert 1 <= signature['galactic_tone'] <= 13
        
        # Test synthesis is meaningful text
        assert len(signature['synthesis']) > 10
        assert isinstance(signature['synthesis'], str)
    
    def test_edge_cases_birth_dates(self, zodiac_calculator):
        """Test edge cases for birth dates"""
        # Test leap year
        leap_year_data = {
            'birth_date': '2000-02-29',
            'birth_time': '00:00',
            'birth_location': {'latitude': 0, 'longitude': 0, 'name': 'Equator'}
        }
        
        result = zodiac_calculator.calculate_all_zodiac_systems(leap_year_data)
        assert result is not None
        
        # Test year boundaries
        year_boundary_data = {
            'birth_date': '1999-12-31',
            'birth_time': '23:59',
            'birth_location': {'latitude': 0, 'longitude': 0, 'name': 'Equator'}
        }
        
        result = zodiac_calculator.calculate_all_zodiac_systems(year_boundary_data)
        assert result is not None
    
    def test_invalid_input_handling(self, zodiac_calculator):
        """Test handling of invalid input data"""
        # Test missing data
        invalid_data = {'birth_date': '1990-03-21'}  # Missing time and location
        
        # Should handle gracefully without crashing
        try:
            result = zodiac_calculator.calculate_all_zodiac_systems(invalid_data)
            # If it succeeds, result should still have basic structure
            assert 'zodiac_systems' in result or result is None
        except (ValueError, KeyError, TypeError):
            # Expected for invalid data
            pass
    
    @pytest.mark.parametrize("system", ['western', 'chinese', 'vedic', 'mayan', 'aztec'])
    def test_individual_zodiac_systems(self, zodiac_calculator, sample_birth_data, system):
        """Test each zodiac system individually"""
        full_result = zodiac_calculator.calculate_all_zodiac_systems(sample_birth_data)
        system_result = full_result['zodiac_systems'][system]
        
        # Each system should have at least one meaningful field
        assert len(system_result) > 0
        assert any(value for value in system_result.values() if value is not None)
    
    def test_calculation_consistency(self, zodiac_calculator, sample_birth_data):
        """Test that calculations are consistent across multiple calls"""
        result1 = zodiac_calculator.calculate_all_zodiac_systems(sample_birth_data)
        result2 = zodiac_calculator.calculate_all_zodiac_systems(sample_birth_data)
        
        # Results should be identical for same input
        assert result1['zodiac_systems']['western']['sun_sign'] == result2['zodiac_systems']['western']['sun_sign']
        assert result1['zodiac_systems']['chinese']['year_animal'] == result2['zodiac_systems']['chinese']['year_animal']
        assert result1['cosmic_signature']['primary_element'] == result2['cosmic_signature']['primary_element']