"""
Unit tests for ZodiacAnimationManager class
Tests animation system for all 5 zodiac traditions
"""

import pytest
from animation_manager import ZodiacAnimationManager


class TestZodiacAnimationManager:
    """Test suite for ZodiacAnimationManager functionality"""
    
    def test_animation_manager_initialization(self, animation_manager):
        """Test that animation manager initializes correctly"""
        assert animation_manager is not None
        assert hasattr(animation_manager, 'zodiac_animations')
        assert hasattr(animation_manager, 'trigger_animation')
        assert hasattr(animation_manager, 'get_animation_statistics')
    
    def test_animation_statistics(self, animation_manager):
        """Test animation statistics reporting"""
        stats = animation_manager.get_animation_statistics()
        
        assert 'total_animations' in stats
        assert 'completion_percentage' in stats
        assert 'by_system' in stats
        assert 'by_type' in stats
        
        # Test expected totals (412 animations across 5 systems)
        assert stats['total_animations'] >= 400  # Should be around 412
        assert stats['completion_percentage'] > 100  # Should exceed 304 target
    
    def test_all_zodiac_systems_have_animations(self, animation_manager):
        """Test that all 5 zodiac systems have animations"""
        stats = animation_manager.get_animation_statistics()
        systems = stats['by_system']
        
        # All 5 systems should be present
        assert 'western' in systems
        assert 'chinese' in systems
        assert 'vedic' in systems
        assert 'mayan' in systems
        assert 'aztec' in systems
        
        # Each system should have animations
        for system, count in systems.items():
            assert count > 0, f"System {system} has no animations"
    
    def test_animation_types_coverage(self, animation_manager):
        """Test that all social action types are covered"""
        stats = animation_manager.get_animation_statistics()
        types = stats['by_type']
        
        # All 4 social action types should be present
        expected_types = ['like', 'comment', 'follow', 'share']
        for action_type in expected_types:
            assert action_type in types, f"Missing animation type: {action_type}"
            assert types[action_type] > 0, f"No animations for type: {action_type}"
    
    @pytest.mark.parametrize("zodiac_sign", [
        # Western signs
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
        # Chinese animals
        'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
        'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
    ])
    def test_trigger_animation_common_signs(self, animation_manager, zodiac_sign):
        """Test triggering animations for common zodiac signs"""
        result = animation_manager.trigger_animation(zodiac_sign, 'like')
        
        assert 'message' in result
        assert 'animation_data' in result
        assert 'zodiac_sign' in result
        assert result['zodiac_sign'] == zodiac_sign
        
        # Message should be meaningful
        assert len(result['message']) > 0
        assert zodiac_sign.lower() in result['message'].lower()
    
    @pytest.mark.parametrize("action_type", ['like', 'comment', 'follow', 'share'])
    def test_trigger_animation_all_actions(self, animation_manager, action_type):
        """Test triggering all types of social actions"""
        # Use Aries as test sign
        result = animation_manager.trigger_animation('Aries', action_type)
        
        assert 'message' in result
        assert 'animation_data' in result
        assert result['animation_data']['action'] == action_type
        
        # Different actions should produce different messages
        assert len(result['message']) > 0
    
    def test_vedic_nakshatra_animations(self, animation_manager):
        """Test Vedic system nakshatra animations"""
        vedic_signs = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha']
        
        for nakshatra in vedic_signs:
            result = animation_manager.trigger_animation(nakshatra, 'like')
            assert result is not None
            assert nakshatra.lower() in result['message'].lower()
    
    def test_mayan_day_sign_animations(self, animation_manager):
        """Test Mayan system day sign animations"""
        mayan_signs = ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan']
        
        for day_sign in mayan_signs:
            result = animation_manager.trigger_animation(day_sign, 'share')
            assert result is not None
            assert day_sign.lower() in result['message'].lower()
    
    def test_aztec_day_sign_animations(self, animation_manager):
        """Test Aztec system day sign animations"""
        aztec_signs = ['Cipactli', 'Ehecatl', 'Calli', 'Cuetzpalin', 'Coatl']
        
        for day_sign in aztec_signs:
            result = animation_manager.trigger_animation(day_sign, 'follow')
            assert result is not None
            assert day_sign.lower() in result['message'].lower()
    
    def test_animation_data_structure(self, animation_manager):
        """Test that animation data has correct structure"""
        result = animation_manager.trigger_animation('Leo', 'like')
        
        animation_data = result['animation_data']
        assert 'action' in animation_data
        assert 'intensity' in animation_data
        assert 'duration' in animation_data
        assert 'color_scheme' in animation_data
        
        # Test value ranges
        assert 0.5 <= animation_data['intensity'] <= 1.0
        assert 1000 <= animation_data['duration'] <= 3000
    
    def test_unknown_zodiac_sign_handling(self, animation_manager):
        """Test handling of unknown zodiac signs"""
        result = animation_manager.trigger_animation('UnknownSign', 'like')
        
        # Should handle gracefully with fallback
        assert result is not None
        assert 'message' in result
        assert 'animation_data' in result
    
    def test_invalid_action_type_handling(self, animation_manager):
        """Test handling of invalid action types"""
        result = animation_manager.trigger_animation('Aries', 'invalid_action')
        
        # Should handle gracefully with fallback
        assert result is not None
        assert 'message' in result
    
    def test_animation_uniqueness(self, animation_manager):
        """Test that different signs produce different animations"""
        aries_result = animation_manager.trigger_animation('Aries', 'like')
        scorpio_result = animation_manager.trigger_animation('Scorpio', 'like')
        
        # Messages should be different for different signs
        assert aries_result['message'] != scorpio_result['message']
        
        # Animation data should reflect sign characteristics
        assert aries_result['animation_data']['color_scheme'] != scorpio_result['animation_data']['color_scheme']
    
    def test_cultural_authenticity(self, animation_manager):
        """Test that animations maintain cultural authenticity"""
        # Test Chinese element associations
        dragon_result = animation_manager.trigger_animation('Dragon', 'like')
        assert any(word in dragon_result['message'].lower() 
                  for word in ['power', 'strength', 'wisdom', 'fortune'])
        
        # Test Vedic spiritual elements
        ashwini_result = animation_manager.trigger_animation('Ashwini', 'share')
        assert any(word in ashwini_result['message'].lower() 
                  for word in ['healing', 'swift', 'divine', 'cosmic'])
    
    def test_performance_bulk_animations(self, animation_manager):
        """Test performance with bulk animation requests"""
        signs = ['Aries', 'Dragon', 'Ashwini', 'Imix', 'Cipactli']
        actions = ['like', 'comment', 'follow', 'share']
        
        # Should handle multiple rapid requests without issues
        for sign in signs:
            for action in actions:
                result = animation_manager.trigger_animation(sign, action)
                assert result is not None
                assert len(result['message']) > 0