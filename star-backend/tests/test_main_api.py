import json
import os
import sys
from pathlib import Path

import pytest

os.environ['JWT_SECRET_KEY'] = 'test_secret'
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Mock modules before importing app
import sys
from types import ModuleType
from unittest.mock import MagicMock

m_analytics = ModuleType('analytics')
m_analytics.analytics_bp = MagicMock()
sys.modules['analytics'] = m_analytics

m_birth = ModuleType('birth_chart')
m_birth.calculate_birth_chart = lambda *a, **k: {}
m_birth.geocode_location = lambda *a, **k: {'lat': 0, 'lng': 0}
sys.modules['birth_chart'] = m_birth

m_sigil = ModuleType('sigil_generator')
m_sigil.sigil_bp = MagicMock()
sys.modules['sigil_generator'] = m_sigil

m_tarot = ModuleType('tarot_interactions')
m_tarot.tarot_bp = MagicMock()
sys.modules['tarot_interactions'] = m_tarot

m_feed = ModuleType('feed')
m_feed.feed = MagicMock()
sys.modules['feed'] = m_feed

m_group_chat = ModuleType('group_chat')
m_group_chat.group_chat_bp = MagicMock()
sys.modules['group_chat'] = m_group_chat

m_star_points = ModuleType('star_points')
m_star_points.star_points = MagicMock()
sys.modules['star_points'] = m_star_points

m_star_auth = ModuleType('star_auth')
m_star_auth.token_required = lambda f: f
sys.modules['star_auth'] = m_star_auth

m_notifications = ModuleType('notifications')
m_notifications.notifications = MagicMock()
sys.modules['notifications'] = m_notifications

m_numerology = ModuleType('numerology')
m_numerology.NumerologyCalculator = ModuleType('NumerologyCalculator')
sys.modules['numerology'] = m_numerology

m_archetype_oracle = ModuleType('archetype_oracle')
m_archetype_oracle.ArchetypeOracle = ModuleType('ArchetypeOracle')
m_archetype_oracle.CosmicArchetypeOracle = ModuleType('CosmicArchetypeOracle')
sys.modules['archetype_oracle'] = m_archetype_oracle

m_mentor_personality = ModuleType('mentor_personality')
m_mentor_personality.MentorPersonalityEngine = ModuleType('MentorPersonalityEngine')
sys.modules['mentor_personality'] = m_mentor_personality

m_resonance_tracker = ModuleType('resonance_tracker')
m_resonance_tracker.ResonanceTracker = ModuleType('ResonanceTracker')
sys.modules['resonance_tracker'] = m_resonance_tracker

m_emotional_os = ModuleType('emotional_os')
m_emotional_os.EmotionalOS = ModuleType('EmotionalOS')
sys.modules['emotional_os'] = m_emotional_os

m_occult_oracle_ai = ModuleType('occult_oracle_ai')
m_occult_oracle_ai.OccultOracleAI = ModuleType('OccultOracleAI')
sys.modules['occult_oracle_ai'] = m_occult_oracle_ai

m_archetype_synthesizer = ModuleType('archetype_synthesizer')
m_archetype_synthesizer.ArchetypeSynthesizer = ModuleType('ArchetypeSynthesizer')
sys.modules['archetype_synthesizer'] = m_archetype_synthesizer

# Mock internal functions used in register
from unittest.mock import Mock

m_archetype_oracle.ArchetypeOracle.generate_cosmic_profile = Mock(return_value={})
m_archetype_oracle.ArchetypeOracle.generate_symbolic_spread = Mock(return_value={})
m_archetype_oracle.ArchetypeOracle.generate_resonance_map = Mock(return_value={})
m_archetype_oracle.ArchetypeOracle.calculate_personal_cycle = Mock(return_value={})
m_archetype_oracle.ArchetypeOracle.get_karmic_insights = Mock(return_value={})

m_numerology.NumerologyCalculator.calculate_comprehensive_readings = Mock(return_value={
    'life_path': {'number': 5},
    'destiny': {'number': 3},
    'soul_urge': {'number': 7},
    'personality': {'number': 2},
    'birth_day': {'number': 1}
})

from star_backend_flask.main import create_app

app = create_app()
app.config['TESTING'] = True


class DummyCosmosContainer:
    def __init__(self):
        self.storage = {}

    def query_items(self, query=None, parameters=None, enable_cross_partition_query=None):
        # Return all items for simple queries
        return list(self.storage.values())

    def create_item(self, item):
        # Simulate creating an item with an ID
        if 'id' not in item:
            item['id'] = str(len(self.storage) + 1)
        self.storage[item.get('username', item['id'])] = item
        return item

    def upsert_item(self, item):
        # Update or insert item
        key = item.get('username', item.get('id', 'default'))
        self.storage[key] = item
        return item


class DummyCosmosDB:
    def __init__(self):
        self.containers = {}

    def get_database_client(self, db_name):
        return self

    def get_container_client(self, container_name):
        if container_name not in self.containers:
            self.containers[container_name] = DummyCosmosContainer()
        return self.containers[container_name]


@pytest.fixture(autouse=True)
def patch_cosmos_db(monkeypatch):
    # Create a fresh instance for each test
    dummy_cosmos = DummyCosmosDB()
    import star_backend_flask.main as app_module
    
    # Mock the containers
    monkeypatch.setattr(app_module, 'users_container', dummy_cosmos.get_container_client('users'))
    monkeypatch.setattr(app_module, 'posts_container', dummy_cosmos.get_container_client('posts'))
    monkeypatch.setattr(app_module, 'follows_container', dummy_cosmos.get_container_client('follows'))
    
    # Clear any previous test data
    for container in dummy_cosmos.containers.values():
        container.storage.clear()
    
    return dummy_cosmos


@pytest.fixture
def client():
    return app.test_client()


def test_register_and_login():
    with app.test_client() as client:
        # Register
        import time
        unique_suffix = str(int(time.time() * 1000) % 1000)
        payload = {
            'username': f'testuser{unique_suffix}',
            'password': 'secret123',
            'zodiac_sign': 'Leo',
            'birth_date': '1990-08-01',
            'full_name': 'Test User'
        }
        rv = client.post('/api/v1/register', data=json.dumps(payload), content_type='application/json')
        if rv.status_code != 201:
            print(f"Response status: {rv.status_code}, data: {rv.get_json()}")
        assert rv.status_code == 201
        data = rv.get_json()
        assert 'message' in data and 'Registered' in data['message']

        # Emulate stored user for login: set password_hash to bcrypt hash
        import bcrypt
        import star_backend_flask.main as app_module
        users = list(app_module.users_container.storage.values())
        assert users
        users[0]['password_hash'] = bcrypt.hashpw(payload['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Login
        rv2 = client.post('/api/v1/login', data=json.dumps({'username': payload['username'], 'password': 'secret123'}), content_type='application/json')
        assert rv2.status_code == 200
        data2 = rv2.get_json()
        assert 'token' in data2
