import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import after adding to path
from star_backend_flask.app import app

client = TestClient(app)

@pytest.fixture
def mock_spread():
    return {
        "cards": [
            {"id": "card-0", "cardName": "The Fool", "position": {"x": 10, "y": 10}},
            {"id": "card-1", "cardName": "The Magician", "position": {"x": 20, "y": 20}}
        ],
        "spread": {"positions": []}
    }

@pytest.fixture
def mock_energy_flows():
    return [
        {
            "id": "flow_0_1",
            "fromCardId": "card-0",
            "toCardId": "card-1",
            "strength": 5,
            "element": "Air-Air",
            "color": "#F7DC6F",
            "style": "line",
            "frequency": "activating"
        }
    ]

def test_calculate_energy_flow(mock_spread):
    response = client.post(
        "/api/v1/tarot/calculate-energy-flow",
        json={
            "cards": mock_spread["cards"],
            "spread": mock_spread["spread"]
        }
    )
    assert response.status_code == 200
    assert "energy_flows" in response.json()
    assert "total_connections" in response.json()
    assert "dominant_element" in response.json()

def test_enhanced_interpretation(mock_spread):
    response = client.post(
        "/api/v1/tarot/enhanced-interpretation",
        json={
            "cards": mock_spread["cards"],
            "spread": mock_spread["spread"],
            "full_name": "Test User",
            "birth_date": "1990-01-01T00:00:00",
            "spread_type": "three-card",
            "mode": "deep_reads"
        }
    )
    assert response.status_code == 200
    assert "interpretations" in response.json()
    assert "energy_flows" in response.json()
    assert "cosmic_alignment" in response.json()

@patch('star_backend_flask.tarot_interactions.spotipy.Spotify')
def test_generate_spotify_playlist_with_configured_client(mock_spotify_class, mock_energy_flows):
    # Mock the Spotify client
    mock_spotify_instance = MagicMock()
    mock_spotify_class.return_value = mock_spotify_instance
    mock_spotify_instance.search.return_value = {
        "tracks": {
            "items": [{"uri": "spotify:track:1"}, {"uri": "spotify:track:2"}]
        }
    }

    response = client.post(
        "/api/v1/tarot/spotify-playlist",
        json={
            "energy_flows": mock_energy_flows,
            "spread_type": "three-card"
        }
    )

    assert response.status_code == 200
    assert "playlist" in response.json()
    assert "name" in response.json()["playlist"]
    assert "tracks" in response.json()["playlist"]
    assert "uri" in response.json()["playlist"]

def test_generate_spotify_playlist_without_client(mock_energy_flows):
    # Test with no configured Spotify client
    with patch.dict(os.environ, {"SPOTIFY_CLIENT_ID": "", "SPOTIFY_CLIENT_SECRET": ""}):
        response = client.post(
            "/api/v1/tarot/spotify-playlist",
            json={
                "energy_flows": mock_energy_flows,
                "spread_type": "three-card"
            }
        )

        assert response.status_code == 200
        assert "playlist" in response.json()
        assert "Spotify not configured" in response.json()["playlist"]["name"]

@patch('star_backend_flask.tarot_interactions.requests.get')
def test_get_location_insights_with_valid_api(mock_get):
    # Mock successful geocoding API response
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {
        "location": {
            "city": "New York",
            "country": "United States"
        },
        "sun_sign": "Leo",
        "moon_phase": "Full Moon"
    }

    response = client.post(
        "/api/v1/tarot/location-insights",
        json={"ip_address": "8.8.8.8"}
    )

    assert response.status_code == 200
    assert "astrological_note" in response.json()
    assert "location" in response.json()
    assert "New York" in response.json()["astrological_note"]
    assert "Full Moon" in response.json()["astrological_note"]

def test_get_location_insights_without_api_key():
    # Test with no API key configured
    with patch.dict(os.environ, {"IPGEOLOCATION_API_KEY": ""}):
        response = client.post(
            "/api/v1/tarot/location-insights",
            json={"ip_address": "8.8.8.8"}
        )

        assert response.status_code == 200
        assert "API key not configured" in response.json()["astrological_note"]

def test_get_location_insights_with_auto_ip():
    response = client.post(
        "/api/v1/tarot/location-insights",
        json={"ip_address": "auto"}
    )
    assert response.status_code == 200
    # Should handle empty query (auto-detect)

@patch('star_backend_flask.tarot_interactions.requests.get')
def test_get_location_insights_with_api_error(mock_get):
    # Mock API error
    mock_get.side_effect = Exception("API Connection Failed")

    response = client.post(
        "/api/v1/tarot/location-insights",
        json={"ip_address": "8.8.8.8"}
    )

    assert response.status_code == 200
    assert "Unable to fetch location-based astrological insights" in response.json()["astrological_note"]

def test_share_spread(mock_spread):
    response = client.post(
        "/api/v1/tarot/share-spread",
        json={
            "spread": mock_spread,
            "spread_type": "three-card",
            "user_id": "test_user"
        }
    )

    assert response.status_code == 200
    assert "share_url" in response.json()
    assert response.json()["share_url"].startswith("https://cosmic-tarot.com/spread/")

# Test error handling
def test_calculate_energy_flow_with_invalid_data():
    response = client.post(
        "/api/v1/tarot/calculate-energy-flow",
        json={"invalid": "data"}
    )

    assert response.status_code == 400
    assert "error" in response.json()

def test_enhanced_interpretation_with_missing_data():
    response = client.post(
        "/api/v1/tarot/enhanced-interpretation",
        json={"cards": []}
    )

    assert response.status_code == 400
    assert "error" in response.json()

# Test caching functionality
@patch('star_backend_flask.tarot_interactions.cache')
def test_caching_behavior(mock_cache):
    # Mock cache miss then hit
    mock_cache.__getitem__.side_effect = [KeyError, {"cached": "data"}]

    response1 = client.post(
        "/api/v1/tarot/calculate-energy-flow",
        json={
            "cards": [{"id": "test", "cardName": "Test", "position": {"x": 0, "y": 0}}],
            "spread": {"positions": []}
        }
    )

    response2 = client.post(
        "/api/v1/tarot/calculate-energy-flow",
        json={
            "cards": [{"id": "test", "cardName": "Test", "position": {"x": 0, "y": 0}}],
            "spread": {"positions": []}
        }
    )

    assert response1.status_code == 200
    assert response2.status_code == 200
    mock_cache.__setitem__.assert_called()

# Test frequency mapping in Spotify playlist generation
def test_spotify_playlist_frequency_mapping():
    test_flows = [
        {"frequency": "activating", "strength": 5},
        {"frequency": "flowing", "strength": 3},
        {"frequency": "transforming", "strength": 4},
        {"frequency": "grounding", "strength": 2}
    ]

    with patch('star_backend_flask.tarot_interactions.spotipy.Spotify') as mock_spotify_class:
        mock_spotify_instance = MagicMock()
        mock_spotify_class.return_value = mock_spotify_instance
        mock_spotify_instance.search.return_value = {"tracks": {"items": []}}

        response = client.post(
            "/api/v1/tarot/spotify-playlist",
            json={
                "energy_flows": test_flows,
                "spread_type": "three-card"
            }
        )

        assert response.status_code == 200
        # Verify Spotify search was called with genre queries
        call_args = mock_spotify_instance.search.call_args_list
        genres_called = [call[1]['q'] for call in call_args if 'q=' in str(call)]
        assert len(genres_called) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
