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

    mock_container = MagicMock()
    mock_container.query_items.return_value = rows

    with patch('star_backend_flask.main.posts_container', mock_container):
        resp = client.get('/api/v1/posts')
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'posts' in data
        assert data['posts'][0]['username'] == 'alice'
        assert data['posts'][0]['content'] == 'hello world'


def test_create_post_inserts_and_returns_id(client):
    insert_resp = MagicMock()
    insert_resp.data = [{'id': 999}]

    # Mock Cosmos DB containers
    mock_users_container = MagicMock()
    mock_posts_container = MagicMock()
    
    # Configure users container for user lookup
    mock_users_container.query_items.return_value = [
        {'id': '1', 'username': 'testuser', 'zodiac_sign': 'Taurus'}
    ]
    
    # Configure posts container for post creation
    mock_posts_container.create_item.return_value = None

    with patch('star_backend_flask.main.users_container', mock_users_container), \
         patch('star_backend_flask.main.posts_container', mock_posts_container), \
         patch('star_backend_flask.main.jwt.decode', return_value={'user_id': '1'}):
        resp = client.post('/api/v1/posts', json={'content': 'a new post', 'zodiac_sign': 'Taurus'}, headers={'Authorization': 'Bearer mock_token'})
        assert resp.status_code == 201
        body = resp.get_json()
        assert body.get('message') == 'Post created'
        assert 'post_id' in body
