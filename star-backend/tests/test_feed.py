from unittest.mock import patch

import pytest
from star_backend_flask.app import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('star_backend_flask.app.supabase')
def test_get_posts(mock_supabase, client):
    mock_supabase.table.return_value.select.return_value.order.return_value.execute.return_value.data = [
        {
            'id': 1,
            'user_id': 'user1',
            'content': 'Test post',
            'media_url': None,
            'zodiac_sign': 'Aries',
            'created_at': '2025-10-04T12:00:00Z',
            'profiles': {'display_name': 'Test User'},
        }
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    response = client.get('/api/v1/posts', headers={'Authorization': 'Bearer user1'})
    assert response.status_code == 200
    assert len(response.json['posts']) == 1
    assert response.json['posts'][0]['content'] == 'Test post'
    assert response.json['posts'][0]['like_count'] == 0
    assert response.json['posts'][0]['liked_by_user'] is False

@patch('star_backend_flask.app.supabase')
def test_create_post(mock_supabase, client):
    mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {'zodiac_sign': 'Aries'}
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [{'id': 1, 'content': 'New post'}]

    response = client.post(
        '/api/v1/posts',
        json={'content': 'New post', 'media_url': 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'},
        headers={'Authorization': 'Bearer user1'}
    )
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['post']['content'] == 'New post'