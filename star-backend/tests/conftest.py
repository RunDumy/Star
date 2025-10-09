import sys
import os
from pathlib import Path
import pytest
from types import ModuleType
import unittest.mock as mock

# Add the parent directory to sys.path so star_backend_flask can be imported
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set TESTING environment variable for all tests
os.environ['TESTING'] = 'true'
os.environ['SUPABASE_URL'] = 'dummy'
os.environ['SUPABASE_ANON_KEY'] = 'dummy'

# Mock local modules to prevent import errors when main imports them
m_birth = ModuleType('birth_chart')
m_birth.__file__ = None
m_birth.calculate_birth_chart = lambda *a, **k: {}
m_birth.geocode_location = lambda *a, **k: {'lat': 0, 'lng': 0}
sys.modules['birth_chart'] = m_birth

m_sigil = ModuleType('sigil_generator')
m_sigil.__file__ = None
m_sigil.sigil_bp = None
sys.modules['sigil_generator'] = m_sigil

m_tarot = ModuleType('tarot_interactions')
m_tarot.__file__ = None
m_tarot.tarot_bp = None
sys.modules['tarot_interactions'] = m_tarot

m_feed = ModuleType('feed')
m_feed.__file__ = None
m_feed.feed = None
sys.modules['feed'] = m_feed

m_agora = ModuleType('agora_token_builder')
m_agora.__file__ = None
m_agora.Role_Attendee = type('Role_Attendee', (), {})
m_agora.Role_Publisher = type('Role_Publisher', (), {})
m_agora.RtcTokenBuilder = type('RtcTokenBuilder', (), {})
sys.modules['agora_token_builder'] = m_agora

m_redis = ModuleType('redis_utils')
m_redis.__file__ = None
m_redis.get_redis = lambda *args: None
m_redis.init_redis = lambda *args: None
sys.modules['redis_utils'] = m_redis

m_num = ModuleType('numerology')
m_num.__file__ = None
m_num.NumerologyCalculator = type('NumerologyCalculator', (), {})
sys.modules['numerology'] = m_num

m_group = ModuleType('group_chat')
m_group.__file__ = None
m_group.group_chat_bp = None
sys.modules['group_chat'] = m_group

m_notif = ModuleType('notifications')
m_notif.__file__ = None
m_notif.notifications = None
sys.modules['notifications'] = m_notif

m_star = ModuleType('star_points')
m_star.__file__ = None
m_star.star_points = None
sys.modules['star_points'] = m_star

m_auth = ModuleType('star_auth')
m_auth.__file__ = None
m_auth.token_required = lambda f: f
sys.modules['star_auth'] = m_auth

# Mock Azure Cosmos DB
m_azure_cosmos = ModuleType('azure.cosmos')
m_azure_cosmos.__file__ = None

# Create a mock database client
MockDatabaseClient = type('MockDatabaseClient', (), {
    'get_container_client': lambda self, name: MockContainerClient()
})

# Create a mock container client
MockContainerClient = type('MockContainerClient', (), {
    'query_items': lambda self, *args, **kwargs: [],
    'upsert_item': lambda self, *args, **kwargs: None
})

m_azure_cosmos.CosmosClient = type('CosmosClient', (), {
    '__init__': lambda self, *args, **kwargs: None,
    'get_database_client': lambda self, name: MockDatabaseClient()
})
sys.modules['azure.cosmos'] = m_azure_cosmos

# Mock azure_config
m_azure_config = ModuleType('azure_config')
m_azure_config.__file__ = None
m_azure_config.get_cosmos_client = lambda: None
sys.modules['azure_config'] = m_azure_config

m_bs4 = ModuleType('bs4')
m_bs4.__file__ = None
m_bs4.BeautifulSoup = type('BeautifulSoup', (), {})
sys.modules['bs4'] = m_bs4


@pytest.fixture
def client():
    from star_backend_flask.main import create_app
    app = create_app()
    app.config['TESTING'] = True
    return app.test_client()


@pytest.fixture
def app_client():
    from star_backend_flask.main import create_app
    app = create_app()
    app.config['TESTING'] = True
    return app.test_client()


@pytest.fixture
def mock_token():
    return 'mock_token'


@pytest.fixture(autouse=True)
def mock_cosmos_db():
    """Mock Cosmos DB containers for testing"""
    mock_container = mock.MagicMock()
    
    # Mock query_items for SELECT operations - return test data
    mock_container.query_items.return_value = [
        {'id': '1', 'username': 'testuser', 'zodiac_sign': 'Aries', 'password_hash': 'hashed_password'}
    ]
    
    # Mock create_item for INSERT operations
    mock_container.create_item.return_value = None
    
    # Mock upsert_item for UPDATE operations
    mock_container.upsert_item.return_value = None
    
    # Mock the containers used in the application
    with mock.patch('star_backend_flask.main.users_container', mock_container), \
         mock.patch('star_backend_flask.main.posts_container', mock_container), \
         mock.patch('star_backend_flask.main.follows_container', mock_container):
        yield