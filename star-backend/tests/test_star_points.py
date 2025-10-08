import json
import sys
from types import ModuleType

# Mock agora_token_builder
m_agora = ModuleType('agora_token_builder')
m_agora.Role_Attendee = None
m_agora.Role_Publisher = None
m_agora.RtcTokenBuilder = None
sys.modules['agora_token_builder'] = m_agora

import pytest
from star_backend_flask.star_auth import create_token
from star_backend_flask.main import create_app


@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers(client):
    with client.application.app_context():
        # Mock user ID for testing
        user_id = 1
        token = create_token(user_id)
        return {'Authorization': f'Bearer {token}'}


def test_get_star_points(client, auth_headers):
    """Test getting user's star points"""
    response = client.get('/api/v1/star-points', headers=auth_headers)
    assert response.status_code in [200, 404]  # 404 if no points yet

def test_get_challenges(client, auth_headers):
    """Test getting available challenges"""
    response = client.get('/api/v1/challenges', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'challenges' in data

def test_get_user_challenges(client, auth_headers):
    """Test getting user's challenges"""
    response = client.get('/api/v1/user-challenges', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'user_challenges' in data

def test_get_star_point_transactions(client, auth_headers):
    """Test getting user's star point transactions"""
    response = client.get('/api/v1/star-points/transactions', headers=auth_headers)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'transactions' in data