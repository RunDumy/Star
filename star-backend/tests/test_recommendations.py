"""
Unit tests for the recommendations module and API endpoints
"""

import json
import pytest
from unittest.mock import patch, MagicMock

from star_backend_flask.recommendations import (
    get_compatibility_score, 
    get_mood_match_score,
    get_content_recommendations,
    COMPATIBILITY_MAP,
    MOOD_CONTENT_MAP
)

# Test compatibility score function
def test_get_compatibility_score():
    # Same sign - perfect match
    assert get_compatibility_score("Aries", "Aries") == 1.0
    
    # Fire and Fire - high compatibility
    assert get_compatibility_score("Aries", "Leo") == 0.9
    assert get_compatibility_score("Leo", "Sagittarius") == 0.9
    
    # Fire and Air - medium compatibility
    assert get_compatibility_score("Aries", "Gemini") == 0.6
    assert get_compatibility_score("Leo", "Libra") == 0.6
    
    # Fire and Earth - low compatibility
    assert get_compatibility_score("Aries", "Taurus") == 0.3
    assert get_compatibility_score("Leo", "Virgo") == 0.3
    
    # Null values - default score
    assert get_compatibility_score(None, "Aries") == 0.5
    assert get_compatibility_score("Aries", None) == 0.5
    assert get_compatibility_score(None, None) == 0.5

# Test mood match function
def test_get_mood_match_score():
    # Perfect match
    assert get_mood_match_score("Passionate", ["motivation", "energy", "adventure"]) > 0.8
    
    # Partial match
    assert 0.4 < get_mood_match_score("Curious", ["creativity", "books"]) < 0.8
    
    # No match
    assert get_mood_match_score("Reflective", ["party", "celebration"]) <= 0.5
    
    # Null values - default score
    assert get_mood_match_score(None, ["test"]) == 0.5
    assert get_mood_match_score("Passionate", None) == 0.5
    assert get_mood_match_score(None, None) == 0.5

# Test recommendation API endpoint
@pytest.mark.parametrize("content_type,limit", [
    ("posts", 10),
    ("streams", 5),
    ("posts", 20),
])
def test_recommendations_api(app_client, mock_token, content_type, limit):
    # Mock the get_content_recommendations function
    with patch('star_backend_flask.api.get_content_recommendations') as mock_recommend:
        # Create mock recommendation data
        mock_recommendations = [
            {
                'item': {'id': 1, 'content': 'Test content'},
                'score': 0.85,
                'factors': {'compatibility': 0.9, 'mood_match': 0.7, 'engagement': 0.1}
            },
            {
                'item': {'id': 2, 'content': 'Another post'},
                'score': 0.75,
                'factors': {'compatibility': 0.8, 'mood_match': 0.6, 'engagement': 0.1}
            }
        ]
        mock_recommend.return_value = mock_recommendations
        
        # Make request to recommendations API
        response = app_client.get(
            f'/api/v1/recommendations?content_type={content_type}&limit={limit}',
            headers={'Authorization': f'Bearer {mock_token}'}
        )
        
        # Verify response
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['content_type'] == content_type
        assert len(data['recommendations']) == 2  # Length of our mock data
        
        # Verify recommendation format - should have item and score but not factors
        assert 'item' in data['recommendations'][0]
        assert 'score' in data['recommendations'][0]
        assert 'factors' not in data['recommendations'][0]
        
        # Verify the function was called with correct parameters
        mock_recommend.assert_called_once()
        call_args = mock_recommend.call_args[1]
        assert call_args['content_type'] == content_type
        assert call_args['limit'] == limit

# Test user insights API endpoint
def test_user_insights_api(app_client, mock_token, mock_supabase):
    # Mock the supabase responses
    mock_dna_response = MagicMock()
    mock_dna_response.data = [
        {'trait_name': 'Courage', 'strength': 0.8},
        {'trait_name': 'Creativity', 'strength': 0.6},
        {'trait_name': 'Precision', 'strength': 0.4},
        {'trait_name': 'Harmony', 'strength': 0.3}
    ]
    
    mock_interactions_response = MagicMock()
    mock_interactions_response.data = [
        {'interaction_type': 'mood_view', 'details': {'mood': 'Passionate', 'intensity': 0.7}, 'zodiac_sign': 'Aries'},
        {'interaction_type': 'tarot_pull', 'zodiac_sign': 'Aries'},
        {'interaction_type': 'transit_view', 'zodiac_sign': 'Leo'},
        {'interaction_type': 'post_view', 'zodiac_sign': 'Aries'}
    ]
    
    # Setup mock return values
    mock_supabase.table().select().eq().execute.side_effect = [
        mock_dna_response, 
        mock_interactions_response
    ]
    
    # Make request to insights API
    response = app_client.get(
        '/api/v1/user-insights',
        headers={'Authorization': f'Bearer {mock_token}'}
    )
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    
    # Check structure of insights
    insights = data['insights']
    assert 'profile' in insights
    assert 'activity' in insights
    assert 'recommendations' in insights
    
    # Check profile data
    assert insights['profile']['dominant_trait'] == 'Courage'
    assert insights['profile']['weakest_trait'] == 'Harmony'
    assert insights['profile']['current_mood'] == 'Passionate'
    
    # Check activity data
    assert 'interaction_breakdown' in insights['activity']
    assert insights['activity']['most_interacted_sign'] == 'Aries'
    
    # Check recommendations
    assert 'suggested_activities' in insights['recommendations']
    assert 'compatibility' in insights['recommendations']