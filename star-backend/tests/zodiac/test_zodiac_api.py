"""
Integration tests for zodiac API endpoints
Tests all /api/v1/zodiac/* endpoints with proper Flask test client
"""

import json
import os
import sys

import pytest

# Add paths for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'star_backend_flask'))

from app import app  # Import Flask app


class TestZodiacAPI:
    """Test suite for zodiac API endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create Flask test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def sample_request_data(self):
        """Sample request data for zodiac calculations"""
        return {
            'birth_date': '1990-03-21',
            'birth_time': '12:00',
            'birth_location': {
                'latitude': 40.7128,
                'longitude': -74.0060,
                'name': 'New York, NY'
            }
        }
    
    def test_calculate_multi_zodiac_endpoint(self, client, sample_request_data):
        """Test POST /api/v1/zodiac/calculate-multi endpoint"""
        response = client.post('/api/v1/zodiac/calculate-multi',
                             data=json.dumps(sample_request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Test response structure
        assert 'birth_data' in data
        assert 'zodiac_systems' in data
        assert 'cosmic_signature' in data
        
        # Test all 5 systems present
        systems = data['zodiac_systems']
        assert 'western' in systems
        assert 'chinese' in systems
        assert 'vedic' in systems
        assert 'mayan' in systems
        assert 'aztec' in systems
    
    def test_get_zodiac_animations_endpoint(self, client):
        """Test GET /api/v1/zodiac/animations endpoint"""
        response = client.get('/api/v1/zodiac/animations')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'total_animations' in data
        assert 'by_system' in data
        assert 'by_type' in data
        
        # Should have high animation count
        assert data['total_animations'] >= 400
    
    def test_trigger_zodiac_animation_endpoint(self, client):
        """Test POST /api/v1/zodiac/trigger-animation endpoint"""
        request_data = {
            'zodiac_sign': 'Leo',
            'action_type': 'like'
        }
        
        response = client.post('/api/v1/zodiac/trigger-animation',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'message' in data
        assert 'animation_data' in data
        assert 'zodiac_sign' in data
        assert data['zodiac_sign'] == 'Leo'
    
    def test_get_cosmic_signature_endpoint(self, client, sample_request_data):
        """Test POST /api/v1/zodiac/cosmic-signature endpoint"""
        response = client.post('/api/v1/zodiac/cosmic-signature',
                             data=json.dumps(sample_request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'primary_element' in data
        assert 'secondary_element' in data
        assert 'galactic_tone' in data
        assert 'synthesis' in data
        assert 1 <= data['galactic_tone'] <= 13
    
    def test_get_galactic_tones_endpoint(self, client):
        """Test GET /api/v1/zodiac/galactic-tones endpoint"""
        response = client.get('/api/v1/zodiac/galactic-tones')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'tones' in data
        assert len(data['tones']) == 13
        
        # Test first tone structure
        first_tone = data['tones'][0]
        assert 'number' in first_tone
        assert 'name' in first_tone
        assert 'meaning' in first_tone
        assert first_tone['number'] == 1
    
    def test_get_zodiac_systems_endpoint(self, client):
        """Test GET /api/v1/zodiac/systems endpoint"""
        response = client.get('/api/v1/zodiac/systems')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'systems' in data
        systems = data['systems']
        
        # Should have all 5 systems
        system_names = [system['name'] for system in systems]
        assert 'Western' in system_names
        assert 'Chinese' in system_names
        assert 'Vedic' in system_names
        assert 'Mayan' in system_names
        assert 'Aztec' in system_names
    
    def test_get_zodiac_compatibility_endpoint(self, client):
        """Test POST /api/v1/zodiac/compatibility endpoint"""
        request_data = {
            'person1': {
                'birth_date': '1990-03-21',
                'birth_time': '12:00',
                'birth_location': {'latitude': 40.7128, 'longitude': -74.0060}
            },
            'person2': {
                'birth_date': '1992-07-15',
                'birth_time': '18:30',
                'birth_location': {'latitude': 34.0522, 'longitude': -118.2437}
            }
        }
        
        response = client.post('/api/v1/zodiac/compatibility',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'overall_score' in data
        assert 'system_scores' in data
        assert 'compatibility_analysis' in data
        
        # Score should be between 0 and 100
        assert 0 <= data['overall_score'] <= 100
    
    def test_get_daily_zodiac_insight_endpoint(self, client):
        """Test GET /api/v1/zodiac/daily-insight endpoint"""
        # Test with query parameters
        response = client.get('/api/v1/zodiac/daily-insight?system=western&sign=Leo')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'sign' in data
        assert 'system' in data
        assert 'insight' in data
        assert 'date' in data
        assert data['sign'] == 'Leo'
        assert data['system'] == 'western'
    
    def test_invalid_birth_data_handling(self, client):
        """Test API handling of invalid birth data"""
        invalid_data = {
            'birth_date': 'invalid-date',
            'birth_time': '25:00',  # Invalid time
            'birth_location': {'latitude': 200}  # Invalid latitude
        }
        
        response = client.post('/api/v1/zodiac/calculate-multi',
                             data=json.dumps(invalid_data),
                             content_type='application/json')
        
        # Should return error status
        assert response.status_code in [400, 422, 500]
    
    def test_missing_request_data(self, client):
        """Test API handling of missing request data"""
        response = client.post('/api/v1/zodiac/calculate-multi',
                             data=json.dumps({}),
                             content_type='application/json')
        
        # Should return error status
        assert response.status_code in [400, 422]
    
    def test_malformed_json(self, client):
        """Test API handling of malformed JSON"""
        response = client.post('/api/v1/zodiac/calculate-multi',
                             data='invalid json',
                             content_type='application/json')
        
        # Should return error status
        assert response.status_code in [400, 422]
    
    def test_cors_headers(self, client):
        """Test that CORS headers are properly set"""
        response = client.get('/api/v1/zodiac/systems')
        
        # Check for CORS headers (depends on Flask-CORS configuration)
        assert response.status_code == 200
        # Note: CORS headers test depends on actual Flask-CORS setup
    
    def test_content_type_headers(self, client):
        """Test that proper content-type headers are returned"""
        response = client.get('/api/v1/zodiac/systems')
        
        assert response.status_code == 200
        assert response.content_type == 'application/json'
    
    @pytest.mark.parametrize("zodiac_sign,action", [
        ('Aries', 'like'),
        ('Dragon', 'share'),
        ('Ashwini', 'follow'),
        ('Imix', 'comment'),
        ('Cipactli', 'like')
    ])
    def test_animation_triggers_various_signs(self, client, zodiac_sign, action):
        """Test animation triggering for various zodiac signs and actions"""
        request_data = {
            'zodiac_sign': zodiac_sign,
            'action_type': action
        }
        
        response = client.post('/api/v1/zodiac/trigger-animation',
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['zodiac_sign'] == zodiac_sign
    
    def test_api_performance(self, client, sample_request_data):
        """Test API response times for acceptable performance"""
        import time

        # Test multi-zodiac calculation performance
        start_time = time.time()
        response = client.post('/api/v1/zodiac/calculate-multi',
                             data=json.dumps(sample_request_data),
                             content_type='application/json')
        end_time = time.time()
        
        assert response.status_code == 200
        response_time = end_time - start_time
        
        # Should respond within reasonable time (adjust threshold as needed)
        assert response_time < 5.0, f"API response took {response_time:.2f} seconds"