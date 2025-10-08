import pytest
from unittest.mock import patch, MagicMock
from star_backend_flask.main import create_app
import sys
import os
from types import ModuleType


# Mock agora_token_builder
m_agora = ModuleType('agora_token_builder')
m_agora.Role_Attendee = None
m_agora.Role_Publisher = None
m_agora.RtcTokenBuilder = None
sys.modules['agora_token_builder'] = m_agora


@pytest.fixture
def client():
    # Mock local modules to prevent import errors
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

    # Ensure backend/star_backend_flask is in sys.path
    backend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'star_backend_flask'))
    if backend_folder not in sys.path:
        sys.path.insert(0, backend_folder)

    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as c:
        with app.app_context():  # Provide application context for tests
            yield c


def test_get_posts_returns_transformed_posts(client):
    rows = [
        {
            'id': 1,
            'content': 'hello world',
            'user_id': 10,
            'user': {'username': 'alice'},
            'zodiac_sign': 'aries',
            'image_url': None,
            'spark_count': 2,
            'echo_count': 1,
            'created_at': '2025-01-01T00:00:00Z'
        }
    ]

    mock_res = MagicMock()
    mock_res.data = rows

    mock_table = MagicMock()
    mock_table.select.return_value.order.return_value.limit.return_value.execute.return_value = mock_res

    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    with patch('main.supabase', mock_supabase):
        resp = client.get('/api/v1/posts')
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'posts' in data
        assert data['posts'][0]['username'] == 'alice'
        assert data['posts'][0]['content'] == 'hello world'


def test_create_post_inserts_and_returns_id(client):
    insert_resp = MagicMock()
    insert_resp.data = [{'id': 999}]

    # Create separate mocks for user and post tables
    user_table_mock = MagicMock()
    post_table_mock = MagicMock()

    # Configure user table mock for token validation - need to handle both select and update calls
    user_select_mock = MagicMock()
    user_select_mock.eq.return_value.execute.return_value.data = [
        {'id': 1, 'username': 'testuser', 'zodiac_sign': 'Taurus'}
    ]
    user_table_mock.select.return_value = user_select_mock

    user_update_mock = MagicMock()
    user_update_mock.eq.return_value.execute.return_value = None
    user_table_mock.update.return_value = user_update_mock

    # Configure post table mock for insertion
    post_table_mock.insert.return_value.execute.return_value = insert_resp

    def table_side_effect(table_name):
        if table_name == 'user':
            return user_table_mock
        elif table_name == 'post':
            return post_table_mock
        else:
            return MagicMock()

    mock_supabase = MagicMock()
    mock_supabase.table.side_effect = table_side_effect

    with patch('main.supabase', mock_supabase), patch('main.jwt.decode', return_value={'user_id': 1}):
        resp = client.post('/api/v1/posts', json={'content': 'a new post', 'zodiac_sign': 'Taurus'}, headers={'Authorization': 'Bearer mock_token'})
        assert resp.status_code == 201
        body = resp.get_json()
        assert body.get('message') == 'Post created'
        assert body.get('post_id') == 999
