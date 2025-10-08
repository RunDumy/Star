from unittest.mock import patch, MagicMock
from star_backend_flask.app import app


def test_horoscope_endpoint_structure():
    # Import app factory and create test client
    app.config['TESTING'] = True
    # Patch requests.get to avoid real network calls; return minimal HTML
    with patch('requests.get') as mock_get:
        mock_get.return_value = MagicMock(content=b'<html></html>')
        with app.test_client() as c:
            res = c.get('/api/v1/horoscopes')
            assert res.status_code == 200
            data = res.get_json()
            assert 'horoscopes' in data
            assert 'generated_at' in data
            # Check one sign exists and contains expected keys
            sample = next(iter(data['horoscopes'].values()))
            assert 'sign' in sample and 'horoscope' in sample and 'date' in sample
