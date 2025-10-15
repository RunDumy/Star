"""
Integration tests for database setup and zodiac data seeding
Tests multi_zodiac_setup.py functionality with mock Cosmos DB
"""

import json
import os
import sys
from unittest.mock import MagicMock, Mock, patch

import pytest

# Add paths for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from multi_zodiac_setup import MultiZodiacDatabaseSetup


class TestMultiZodiacDatabaseSetup:
    """Test suite for database setup and seeding functionality"""
    
    @pytest.fixture
    def mock_cosmos_helper(self):
        """Mock CosmosDBHelper for testing without real database"""
        with patch('multi_zodiac_setup.CosmosDBHelper') as mock_helper_class:
            mock_helper = Mock()
            mock_helper_class.return_value = mock_helper
            
            # Mock successful container creation
            mock_helper.create_container_if_not_exists.return_value = {'id': 'test_container'}
            mock_helper.upsert_item.return_value = {'id': 'test_item'}
            mock_helper.query_items.return_value = []
            
            yield mock_helper
    
    @pytest.fixture
    def db_setup(self, mock_cosmos_helper):
        """Create MultiZodiacDatabaseSetup instance with mocked dependencies"""
        return MultiZodiacDatabaseSetup()
    
    def test_database_setup_initialization(self, db_setup, mock_cosmos_helper):
        """Test that database setup initializes correctly"""
        assert db_setup is not None
        assert hasattr(db_setup, 'cosmos_helper')
        assert hasattr(db_setup, 'create_zodiac_containers')
        assert hasattr(db_setup, 'seed_zodiac_data')
    
    def test_create_zodiac_containers(self, db_setup, mock_cosmos_helper):
        """Test creation of all zodiac-related containers"""
        result = db_setup.create_zodiac_containers()
        
        assert result is True
        
        # Verify all expected containers were created
        expected_containers = [
            'zodiac_systems',
            'zodiac_signs', 
            'galactic_tones',
            'zodiac_animations',
            'cosmic_signatures',
            'zodiac_readings',
            'zodiac_compatibility'
        ]
        
        # Check that create_container_if_not_exists was called for each container
        assert mock_cosmos_helper.create_container_if_not_exists.call_count == len(expected_containers)
    
    def test_seed_zodiac_systems_data(self, db_setup, mock_cosmos_helper):
        """Test seeding of zodiac systems data"""
        result = db_setup._seed_zodiac_systems()
        
        assert result is True
        
        # Should have called upsert_item for each of the 5 systems
        assert mock_cosmos_helper.upsert_item.call_count == 5
        
        # Verify systems data structure
        calls = mock_cosmos_helper.upsert_item.call_args_list
        system_names = []
        
        for call in calls:
            args, kwargs = call
            container_name, item_data = args
            assert container_name == 'zodiac_systems'
            system_names.append(item_data['name'])
        
        # All 5 systems should be present
        expected_systems = ['Western', 'Chinese', 'Vedic', 'Mayan', 'Aztec']
        for system in expected_systems:
            assert system in system_names
    
    def test_seed_zodiac_signs_data(self, db_setup, mock_cosmos_helper):
        """Test seeding of zodiac signs data"""
        result = db_setup._seed_zodiac_signs()
        
        assert result is True
        
        # Should have called upsert_item for 76+ signs
        assert mock_cosmos_helper.upsert_item.call_count >= 76
        
        # Verify signs data includes all systems
        calls = mock_cosmos_helper.upsert_item.call_args_list
        systems_with_signs = set()
        
        for call in calls:
            args, kwargs = call
            container_name, item_data = args
            assert container_name == 'zodiac_signs'
            systems_with_signs.add(item_data['system_type'])
        
        # All 5 systems should have signs
        expected_systems = {'western', 'chinese', 'vedic', 'mayan', 'aztec'}
        assert expected_systems.issubset(systems_with_signs)
    
    def test_seed_galactic_tones_data(self, db_setup, mock_cosmos_helper):
        """Test seeding of galactic tones data"""
        result = db_setup._seed_galactic_tones()
        
        assert result is True
        
        # Should have called upsert_item for 13 tones
        assert mock_cosmos_helper.upsert_item.call_count == 13
        
        # Verify tones data structure
        calls = mock_cosmos_helper.upsert_item.call_args_list
        tone_numbers = []
        
        for call in calls:
            args, kwargs = call
            container_name, item_data = args
            assert container_name == 'galactic_tones'
            tone_numbers.append(item_data['tone_number'])
        
        # All 13 tones should be present (1-13)
        expected_tones = list(range(1, 14))
        assert sorted(tone_numbers) == expected_tones
    
    def test_seed_animation_data(self, db_setup, mock_cosmos_helper):
        """Test seeding of animation data"""
        result = db_setup._seed_zodiac_animations()
        
        assert result is True
        
        # Should have called upsert_item for 400+ animations
        assert mock_cosmos_helper.upsert_item.call_count >= 400
        
        # Verify animation data includes all systems and action types
        calls = mock_cosmos_helper.upsert_item.call_args_list
        systems_with_animations = set()
        action_types = set()
        
        for call in calls:
            args, kwargs = call
            container_name, item_data = args
            assert container_name == 'zodiac_animations'
            systems_with_animations.add(item_data['system_type'])
            action_types.add(item_data['action_type'])
        
        # All systems and action types should be represented
        expected_systems = {'western', 'chinese', 'vedic', 'mayan', 'aztec'}
        expected_actions = {'like', 'comment', 'follow', 'share'}
        assert expected_systems.issubset(systems_with_animations)
        assert expected_actions.issubset(action_types)
    
    def test_complete_database_setup(self, db_setup, mock_cosmos_helper):
        """Test complete database setup process"""
        result = db_setup.setup_complete_zodiac_database()
        
        assert result is True
        
        # Should have created containers and seeded data
        # Container creation calls + data seeding calls
        total_calls = mock_cosmos_helper.create_container_if_not_exists.call_count
        assert total_calls >= 7  # 7 containers
        
        total_upserts = mock_cosmos_helper.upsert_item.call_count
        assert total_upserts >= 500  # 5 systems + 76+ signs + 13 tones + 400+ animations
    
    def test_data_validation_zodiac_signs(self, db_setup):
        """Test validation of zodiac signs data"""
        # Test Western signs
        western_signs = db_setup._generate_western_signs_data()
        assert len(western_signs) == 12
        
        expected_western = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                           'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        sign_names = [sign['name'] for sign in western_signs]
        for expected_sign in expected_western:
            assert expected_sign in sign_names
    
    def test_data_validation_chinese_animals(self, db_setup):
        """Test validation of Chinese zodiac animals data"""
        chinese_animals = db_setup._generate_chinese_signs_data()
        assert len(chinese_animals) == 12
        
        expected_animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
                           'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
        animal_names = [animal['name'] for animal in chinese_animals]
        for expected_animal in expected_animals:
            assert expected_animal in animal_names
    
    def test_data_validation_vedic_nakshatras(self, db_setup):
        """Test validation of Vedic nakshatras data"""
        vedic_nakshatras = db_setup._generate_vedic_signs_data()
        assert len(vedic_nakshatras) >= 27  # 27 nakshatras + 12 rashis
        
        # Test that major nakshatras are included
        nakshatra_names = [n['name'] for n in vedic_nakshatras if n.get('type') == 'nakshatra']
        assert 'Ashwini' in nakshatra_names
        assert 'Bharani' in nakshatra_names
        assert 'Krittika' in nakshatra_names
    
    def test_data_validation_mayan_day_signs(self, db_setup):
        """Test validation of Mayan day signs data"""
        mayan_signs = db_setup._generate_mayan_signs_data()
        assert len(mayan_signs) == 20
        
        expected_mayan = ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 
                         'Lamat', 'Muluc', 'Oc', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 
                         'Cib', 'Caban', 'Etznab', 'Cauac', 'Ahau']
        sign_names = [sign['name'] for sign in mayan_signs]
        for expected_sign in expected_mayan:
            assert expected_sign in sign_names
    
    def test_data_validation_aztec_day_signs(self, db_setup):
        """Test validation of Aztec day signs data"""
        aztec_signs = db_setup._generate_aztec_signs_data()
        assert len(aztec_signs) == 20
        
        expected_aztec = ['Cipactli', 'Ehecatl', 'Calli', 'Cuetzpalin', 'Coatl', 
                         'Miquiztli', 'Mazatl', 'Tochtli', 'Atl', 'Itzcuintli',
                         'Ozomatli', 'Malinalli', 'Acatl', 'Ocelotl', 'Cuauhtli',
                         'Cozcacuauhtli', 'Ollin', 'Tecpatl', 'Quiahuitl', 'Xochitl']
        sign_names = [sign['name'] for sign in aztec_signs]
        # Test at least some key Aztec signs
        assert 'Cipactli' in sign_names
        assert 'Xochitl' in sign_names
    
    def test_error_handling_cosmos_db_failure(self, db_setup):
        """Test error handling when Cosmos DB operations fail"""
        with patch.object(db_setup.cosmos_helper, 'create_container_if_not_exists') as mock_create:
            mock_create.side_effect = Exception("Database connection failed")
            
            result = db_setup.create_zodiac_containers()
            assert result is False
    
    def test_data_consistency_validation(self, db_setup):
        """Test that generated data maintains consistency"""
        # Test galactic tones consistency
        tones = db_setup._generate_galactic_tones_data()
        
        # Should have exactly 13 tones
        assert len(tones) == 13
        
        # Tone numbers should be sequential 1-13
        tone_numbers = [tone['tone_number'] for tone in tones]
        assert sorted(tone_numbers) == list(range(1, 14))
        
        # Each tone should have required fields
        for tone in tones:
            assert 'tone_number' in tone
            assert 'name' in tone
            assert 'meaning' in tone
            assert 'keywords' in tone