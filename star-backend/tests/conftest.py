import sys
import os
from pathlib import Path
import pytest
from types import ModuleType
import unittest.mock as mock

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

m_bs4 = ModuleType('bs4')
m_bs4.__file__ = None
sys.modules['bs4'] = m_bs4


@pytest.fixture
def client():
    from star_backend_flask.main import create_app
    from star_backend_flask.database import db
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()
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
def mock_supabase():
    mock_supabase = mock.MagicMock()
    # Mock select for user
    mock_execute_select = mock.MagicMock()
    mock_execute_select.data = [{'id': 1, 'username': 'testuser', 'zodiac_sign': 'Aries'}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute = mock_execute_select
    # Mock update
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute = mock.MagicMock()
    # Mock insert
    mock_supabase.table.return_value.insert.return_value.execute = mock.MagicMock()
    with mock.patch('star_backend_flask.main.supabase', mock_supabase):
        yield