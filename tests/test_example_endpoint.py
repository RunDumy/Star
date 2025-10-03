import os
import sys
import pytest

# Ensure the backend package path is importable during tests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'star-backend', 'star_backend_flask')))

from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_example_get(client):
    res = client.get('/api/example')
    assert res.status_code == 200
    data = res.get_json()
    assert data.get('ok') is True
    assert 'message' in data
