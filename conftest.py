import sys
import os
import pytest
from types import ModuleType
from star_backend_flask.database import db
import unittest.mock as mock

# Mock local modules to prevent import errors when main imports them
m_birth = ModuleType('birth_chart')
m_birth.calculate_birth_chart = lambda *a, **k: {}
m_birth.geocode_location = lambda *a, **k: {'lat': 0, 'lng': 0}
sys.modules['birth_chart'] = m_birth

m_sigil = ModuleType('sigil_generator')
m_sigil.sigil_bp = None
sys.modules['sigil_generator'] = m_sigil

m_tarot = ModuleType('tarot_interactions')
m_tarot.tarot_bp = None
sys.modules['tarot_interactions'] = m_tarot

m_feed = ModuleType('feed')
m_feed.feed = None
sys.modules['feed'] = m_feed

m_agora = ModuleType('agora_token_builder')
m_agora.Role_Attendee = None
m_agora.Role_Publisher = None
m_agora.RtcTokenBuilder = None
sys.modules['agora_token_builder'] = m_agora

from star_backend_flask.main import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()
    return app.test_client()


@pytest.fixture
def app_client():
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
    with mock.patch('star_backend_flask.main.supabase', mock_supabase), \
         mock.patch('star_backend_flask.star_auth.supabase', mock_supabase):
        yield
