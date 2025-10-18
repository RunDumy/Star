#!/usr/bin/env python3
"""
Advanced Spotify API Endpoints for STAR Platform
Real-time cosmic playlist curation with enhanced analytics integration
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from flask import Blueprint, current_app, g, jsonify, request
from marshmallow import Schema, ValidationError, fields
from star_auth import token_required

# Constants
SPOTIFY_NOT_AVAILABLE = 'Advanced Spotify integration not available'
INTERNAL_SERVER_ERROR = 'Internal server error'
USER_ID_PARAM = "@user_id"
from advanced_cosmic_spotify import (CosmicContext, ElementalEnergy,
                                     LunarPhase, TarotCardMusicMood,
                                     get_advanced_spotify_engine)
from analytics_engine import AnalyticsEngine, EngagementType
from cosmos_db import get_cosmos_helper

logger = logging.getLogger(__name__)

# Create advanced Spotify blueprint
advanced_spotify_bp = Blueprint('advanced_spotify', __name__, url_prefix='/api/v1/spotify/advanced')

class CosmicPlaylistRequestSchema(Schema):
    """Schema for cosmic playlist creation requests"""
    cosmic_intention = fields.Str(required=False, missing='daily_harmony')
    lunar_phase = fields.Str(required=False, missing='new_moon')
    current_mood = fields.Str(required=False, missing='balanced')
    tarot_influences = fields.List(fields.Str(), required=False, missing=[])
    duration_preference = fields.Int(required=False, missing=45)
    energy_level_request = fields.Float(required=False, missing=0.5)
    include_binaural = fields.Bool(required=False, missing=False)
    adaptive_length = fields.Bool(required=False, missing=True)

class RealTimeUpdateSchema(Schema):
    """Schema for real-time playlist updates"""
    session_id = fields.Str(required=True)
    current_track_position = fields.Int(required=False)
    user_mood_feedback = fields.Str(required=False)
    energy_adjustment = fields.Float(required=False)
    skip_track = fields.Bool(required=False, missing=False)

@advanced_spotify_bp.route('/cosmic-playlist', methods=['POST'])
@token_required
def create_advanced_cosmic_playlist():
    """Create an advanced cosmic playlist with real-time synchronization"""
    try:
        # Validate request
        schema = CosmicPlaylistRequestSchema()
        try:
            data = schema.load(request.get_json() or {})
        except ValidationError as e:
            return jsonify({'error': 'Invalid request', 'details': e.messages}), 400
        
        # Get advanced Spotify engine
        spotify_engine = get_advanced_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': SPOTIFY_NOT_AVAILABLE}), 503
        
        # Get user profile
        user_id = g.current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Get user's cosmic profile
        user_profile = cosmos_helper.query_items(
            container_name='profiles',
            query="SELECT * FROM c WHERE c.userId = @user_id",
            parameters=[{"name": USER_ID_PARAM, "value": user_id}]
        )
        
        if not user_profile:
            return jsonify({'error': 'User cosmic profile not found'}), 404
        
        user_profile = user_profile[0]
        
        # Build cosmic context
        cosmic_context = _build_cosmic_context(data, user_profile)
        
        # Generate session ID
        session_id = f"cosmic_session_{user_id}_{datetime.now().timestamp()}"
        
        # Create advanced cosmic playlist
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            playlist = loop.run_until_complete(
                spotify_engine.create_real_time_cosmic_playlist(
                    user_profile, cosmic_context, session_id
                )
            )
        finally:
            loop.close()
        
        if not playlist:
            return jsonify({'error': 'Failed to create cosmic playlist'}), 500
        
        # Track analytics
        analytics = AnalyticsEngine()
        analytics.track_engagement(
            user_id=user_id,
            event_type=EngagementType.SPOTIFY_PLAY,
            metadata={
                'playlist_type': 'advanced_cosmic',
                'cosmic_intention': data['cosmic_intention'],
                'lunar_phase': cosmic_context.lunar_phase.value,
                'synchronicity_score': playlist.synchronicity_score,
                'session_id': session_id
            }
        )
        
        # Store playlist session
        playlist_session = {
            'id': session_id,
            'userId': user_id,
            'playlistData': _serialize_playlist(playlist),
            'cosmicContext': _serialize_cosmic_context(cosmic_context),
            'createdAt': datetime.now().isoformat(),
            'isActive': True,
            'trackingEnabled': True
        }
        
        cosmos_helper.upsert_item('spotify_sessions', playlist_session)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'playlist': _serialize_playlist(playlist),
            'cosmic_insights': {
                'synchronicity_score': playlist.synchronicity_score,
                'lunar_influence': cosmic_context.lunar_phase.value,
                'optimal_timing': playlist.cosmic_timing_optimal,
                'tarot_influences': [mood.value for mood in cosmic_context.current_tarot_influences]
            },
            'real_time_features': {
                'adaptive_length': playlist.adaptive_length,
                'mood_responsive': True,
                'cosmic_timing_aware': True
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to create advanced cosmic playlist: {e}")
        return jsonify({'error': INTERNAL_SERVER_ERROR}), 500

@advanced_spotify_bp.route('/real-time-update', methods=['POST'])
@token_required
def real_time_playlist_update():
    """Handle real-time playlist updates and recommendations"""
    try:
        # Validate request
        schema = RealTimeUpdateSchema()
        try:
            data = schema.load(request.get_json() or {})
        except ValidationError as e:
            return jsonify({'error': 'Invalid request', 'details': e.messages}), 400
        
        session_id = data['session_id']
        user_id = g.current_user['id']
        
        # Get Spotify engine
        spotify_engine = get_advanced_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Advanced Spotify integration not available'}), 503
        
        # Verify session ownership
        cosmos_helper = get_cosmos_helper()
        session = cosmos_helper.query_items(
            container_name='spotify_sessions',
            query="SELECT * FROM c WHERE c.id = @session_id AND c.userId = @user_id",
            parameters=[
                {"name": "@session_id", "value": session_id},
                {"name": "@user_id", "value": user_id}
            ]
        )
        
        if not session:
            return jsonify({'error': 'Session not found or access denied'}), 404
        
        session = session[0]
        
        # Get real-time recommendations
        recommendations = spotify_engine.get_real_time_recommendations(session_id)
        
        if not recommendations:
            return jsonify({'error': 'No recommendations available'}), 404
        
        # Track user interaction
        if data.get('user_mood_feedback'):
            analytics = AnalyticsEngine()
            analytics.track_engagement(
                user_id=user_id,
                event_type=EngagementType.SPOTIFY_PLAY,
                metadata={
                    'action': 'mood_feedback',
                    'mood': data['user_mood_feedback'],
                    'session_id': session_id,
                    'track_position': data.get('current_track_position', 0)
                }
            )
        
        # Update session with latest interaction
        session['lastInteraction'] = datetime.now().isoformat()
        if data.get('user_mood_feedback'):
            session['moodHistory'] = session.get('moodHistory', [])
            session['moodHistory'].append({
                'mood': data['user_mood_feedback'],
                'timestamp': datetime.now().isoformat(),
                'track_position': data.get('current_track_position', 0)
            })
        
        cosmos_helper.upsert_item('spotify_sessions', session)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'session_status': {
                'active': session.get('isActive', True),
                'duration_elapsed': _calculate_session_duration(session),
                'mood_evolution': session.get('moodHistory', [])
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to process real-time update: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@advanced_spotify_bp.route('/cosmic-insights', methods=['GET'])
@token_required
def get_cosmic_music_insights():
    """Get personalized cosmic music insights and patterns"""
    try:
        user_id = g.current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Get user's listening history
        listening_sessions = cosmos_helper.query_items(
            container_name='spotify_sessions',
            query="SELECT * FROM c WHERE c.userId = @user_id ORDER BY c.createdAt DESC",
            parameters=[{"name": "@user_id", "value": user_id}]
        )
        
        if not listening_sessions:
            return jsonify({
                'insights': {
                    'message': 'Create your first cosmic playlist to unlock personalized insights!'
                }
            }), 200
        
        # Analyze patterns
        insights = _analyze_cosmic_music_patterns(listening_sessions)
        
        # Get current cosmic conditions
        current_cosmic_state = _get_current_cosmic_conditions()
        
        return jsonify({
            'success': True,
            'insights': insights,
            'current_cosmic_conditions': current_cosmic_state,
            'recommendations': _generate_cosmic_recommendations(insights, current_cosmic_state)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get cosmic insights: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@advanced_spotify_bp.route('/mood-based-curation', methods=['POST'])
@token_required
def create_mood_based_playlist():
    """Create playlist based on current mood and cosmic conditions"""
    try:
        data = request.get_json() or {}
        current_mood = data.get('mood', 'balanced')
        intensity = data.get('intensity', 0.5)  # 0-1 scale
        
        user_id = g.current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Get user profile
        user_profile = cosmos_helper.query_items(
            container_name='profiles',
            query="SELECT * FROM c WHERE c.userId = @user_id",
            parameters=[{"name": "@user_id", "value": user_id}]
        )
        
        if not user_profile:
            return jsonify({'error': 'User profile not found'}), 404
        
        user_profile = user_profile[0]
        
        # Get Spotify engine
        spotify_engine = get_advanced_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Advanced Spotify integration not available'}), 503
        
        # Create mood-specific cosmic context
        cosmic_context = _create_mood_cosmic_context(current_mood, intensity, user_profile)
        
        # Generate mood-based playlist
        session_id = f"mood_session_{user_id}_{datetime.now().timestamp()}"
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            playlist = loop.run_until_complete(
                spotify_engine.create_real_time_cosmic_playlist(
                    user_profile, cosmic_context, session_id
                )
            )
        finally:
            loop.close()
        
        if not playlist:
            return jsonify({'error': 'Failed to create mood-based playlist'}), 500
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'playlist': _serialize_playlist(playlist),
            'mood_analysis': {
                'detected_mood': current_mood,
                'intensity': intensity,
                'cosmic_alignment': playlist.synchronicity_score,
                'recommended_duration': len(playlist.tracks) * 3.5  # Estimated minutes
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to create mood-based playlist: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@advanced_spotify_bp.route('/session/<session_id>/analytics', methods=['GET'])
@token_required
def get_session_analytics(session_id: str):
    """Get detailed analytics for a specific listening session"""
    try:
        user_id = g.current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Get session
        session = cosmos_helper.query_items(
            container_name='spotify_sessions',
            query="SELECT * FROM c WHERE c.id = @session_id AND c.userId = @user_id",
            parameters=[
                {"name": "@session_id", "value": session_id},
                {"name": "@user_id", "value": user_id}
            ]
        )
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        session = session[0]
        
        # Get analytics engine
        analytics = AnalyticsEngine()
        
        # Generate session analytics
        session_analytics = {
            'session_overview': {
                'duration': _calculate_session_duration(session),
                'tracks_played': len(session.get('playlistData', {}).get('tracks', [])),
                'mood_changes': len(session.get('moodHistory', [])),
                'cosmic_alignment': session.get('playlistData', {}).get('synchronicity_score', 0)
            },
            'mood_evolution': session.get('moodHistory', []),
            'cosmic_influences': {
                'lunar_phase': session.get('cosmicContext', {}).get('lunar_phase'),
                'tarot_influences': session.get('cosmicContext', {}).get('current_tarot_influences', []),
                'elemental_energy': session.get('cosmicContext', {}).get('seasonal_element')
            },
            'engagement_patterns': _analyze_session_engagement(session),
            'recommendations': _generate_session_recommendations(session)
        }
        
        return jsonify({
            'success': True,
            'analytics': session_analytics
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get session analytics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Helper functions
def _build_cosmic_context(data: Dict[str, Any], user_profile: Dict[str, Any]) -> CosmicContext:
    """Build cosmic context from request data and user profile"""
    # Parse lunar phase
    try:
        lunar_phase = LunarPhase(data.get('lunar_phase', 'new_moon'))
    except ValueError:
        lunar_phase = LunarPhase.NEW_MOON
    
    # Parse tarot influences
    tarot_influences = []
    for influence_str in data.get('tarot_influences', []):
        try:
            tarot_influences.append(TarotCardMusicMood(influence_str))
        except ValueError:
            continue
    
    # Calculate time of day energy (0 = midnight, 1 = noon)
    current_hour = datetime.now().hour
    time_of_day_energy = abs(current_hour - 12) / 12  # Distance from noon
    time_of_day_energy = 1 - time_of_day_energy  # Invert so noon = 1
    
    # Get seasonal element (simplified)
    month = datetime.now().month
    seasonal_elements = {
        (12, 1, 2): ElementalEnergy.EARTH,  # Winter
        (3, 4, 5): ElementalEnergy.AIR,     # Spring
        (6, 7, 8): ElementalEnergy.FIRE,    # Summer
        (9, 10, 11): ElementalEnergy.WATER  # Fall
    }
    
    seasonal_element = ElementalEnergy.SPIRIT
    for months, element in seasonal_elements.items():
        if month in months:
            seasonal_element = element
            break
    
    return CosmicContext(
        lunar_phase=lunar_phase,
        current_tarot_influences=tarot_influences,
        personal_year_energy=user_profile.get('numerology', {}).get('personalYear', 1),
        daily_numerology=_calculate_daily_numerology(),
        seasonal_element=seasonal_element,
        time_of_day_energy=time_of_day_energy,
        user_mood_history=data.get('recent_moods', []),
        recent_activity_patterns={}
    )

def _calculate_daily_numerology() -> int:
    """Calculate today's numerology number"""
    today = datetime.now()
    date_sum = today.day + today.month + today.year
    
    while date_sum > 9 and date_sum not in [11, 22]:
        date_sum = sum(int(digit) for digit in str(date_sum))
    
    return date_sum

def _serialize_playlist(playlist) -> Dict[str, Any]:
    """Serialize playlist object for JSON response"""
    if hasattr(playlist, '__dict__'):
        return {
            'id': playlist.id,
            'name': playlist.name,
            'description': playlist.description,
            'tracks': [_serialize_track(track) for track in playlist.tracks],
            'cosmic_theme': playlist.cosmic_theme,
            'duration_minutes': playlist.duration_minutes,
            'synchronicity_score': getattr(playlist, 'synchronicity_score', 0),
            'adaptive_length': getattr(playlist, 'adaptive_length', False)
        }
    return {}

def _serialize_track(track) -> Dict[str, Any]:
    """Serialize track object for JSON response"""
    if hasattr(track, '__dict__'):
        return {
            'id': track.id,
            'name': track.name,
            'artist': track.artist,
            'album': track.album,
            'duration_ms': track.duration_ms,
            'preview_url': track.preview_url,
            'external_url': track.external_url,
            'cosmic_mood': track.cosmic_mood.value if hasattr(track.cosmic_mood, 'value') else str(track.cosmic_mood),
            'energy_level': track.energy_level,
            'zodiac_resonance': track.zodiac_resonance
        }
    return {}

def _serialize_cosmic_context(cosmic_context: CosmicContext) -> Dict[str, Any]:
    """Serialize cosmic context for storage"""
    return {
        'lunar_phase': cosmic_context.lunar_phase.value,
        'current_tarot_influences': [mood.value for mood in cosmic_context.current_tarot_influences],
        'personal_year_energy': cosmic_context.personal_year_energy,
        'daily_numerology': cosmic_context.daily_numerology,
        'seasonal_element': cosmic_context.seasonal_element.value,
        'time_of_day_energy': cosmic_context.time_of_day_energy,
        'user_mood_history': cosmic_context.user_mood_history
    }

def _calculate_session_duration(session: Dict[str, Any]) -> float:
    """Calculate session duration in minutes"""
    created_at = datetime.fromisoformat(session['createdAt'])
    last_interaction = session.get('lastInteraction', session['createdAt'])
    last_interaction = datetime.fromisoformat(last_interaction)
    
    return (last_interaction - created_at).total_seconds() / 60

def _analyze_cosmic_music_patterns(sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze cosmic music listening patterns"""
    if not sessions:
        return {}
    
    # Analyze patterns
    lunar_preferences = {}
    mood_patterns = {}
    time_preferences = {}
    
    for session in sessions:
        cosmic_context = session.get('cosmicContext', {})
        
        # Lunar phase preferences
        lunar_phase = cosmic_context.get('lunar_phase')
        if lunar_phase:
            lunar_preferences[lunar_phase] = lunar_preferences.get(lunar_phase, 0) + 1
        
        # Mood patterns
        mood_history = session.get('moodHistory', [])
        for mood_entry in mood_history:
            mood = mood_entry.get('mood')
            if mood:
                mood_patterns[mood] = mood_patterns.get(mood, 0) + 1
        
        # Time preferences
        created_at = datetime.fromisoformat(session['createdAt'])
        hour = created_at.hour
        time_period = 'morning' if 6 <= hour < 12 else 'afternoon' if 12 <= hour < 18 else 'evening' if 18 <= hour < 22 else 'night'
        time_preferences[time_period] = time_preferences.get(time_period, 0) + 1
    
    return {
        'lunar_preferences': lunar_preferences,
        'mood_patterns': mood_patterns,
        'time_preferences': time_preferences,
        'total_sessions': len(sessions),
        'favorite_lunar_phase': max(lunar_preferences.items(), key=lambda x: x[1])[0] if lunar_preferences else None,
        'dominant_mood': max(mood_patterns.items(), key=lambda x: x[1])[0] if mood_patterns else None
    }

def _get_current_cosmic_conditions() -> Dict[str, Any]:
    """Get current cosmic conditions"""
    now = datetime.now()
    
    return {
        'current_lunar_phase': 'waxing_crescent',  # This would be calculated from astronomical data
        'daily_numerology': _calculate_daily_numerology(),
        'time_of_day_energy': abs(now.hour - 12) / 12,
        'seasonal_element': 'fire' if 6 <= now.month <= 8 else 'earth',
        'cosmic_recommendation': 'This is an excellent time for creative musical exploration'
    }

def _generate_cosmic_recommendations(insights: Dict[str, Any], cosmic_state: Dict[str, Any]) -> List[str]:
    """Generate personalized cosmic music recommendations"""
    recommendations = []
    
    if insights.get('favorite_lunar_phase'):
        recommendations.append(
            f"Your favorite listening time is during {insights['favorite_lunar_phase']} - perfect for deep cosmic connection!"
        )
    
    if insights.get('dominant_mood'):
        recommendations.append(
            f"You tend toward {insights['dominant_mood']} music - consider exploring complementary energies for balance"
        )
    
    recommendations.append(
        f"Current cosmic conditions favor {cosmic_state.get('cosmic_recommendation', 'musical exploration')}"
    )
    
    return recommendations

def _create_mood_cosmic_context(mood: str, intensity: float, user_profile: Dict[str, Any]) -> CosmicContext:
    """Create cosmic context optimized for specific mood"""
    # Map mood to tarot influences
    mood_tarot_map = {
        'energetic': [TarotCardMusicMood.SUN_JOY, TarotCardMusicMood.MAGICIAN_POWER],
        'contemplative': [TarotCardMusicMood.HERMIT_SOLITUDE, TarotCardMusicMood.HIGH_PRIESTESS_MYSTERY],
        'romantic': [TarotCardMusicMood.LOVERS_HARMONY, TarotCardMusicMood.EMPRESS_ABUNDANCE],
        'stressed': [TarotCardMusicMood.TEMPERANCE_MODERATION, TarotCardMusicMood.STAR_HOPE],
        'creative': [TarotCardMusicMood.FOOL_ADVENTURE, TarotCardMusicMood.MAGICIAN_POWER],
        'peaceful': [TarotCardMusicMood.STAR_HOPE, TarotCardMusicMood.TEMPERANCE_MODERATION]
    }
    
    tarot_influences = mood_tarot_map.get(mood, [TarotCardMusicMood.STAR_HOPE])
    
    return CosmicContext(
        lunar_phase=LunarPhase.NEW_MOON,  # Neutral phase
        current_tarot_influences=tarot_influences,
        personal_year_energy=user_profile.get('numerology', {}).get('personalYear', 1),
        daily_numerology=_calculate_daily_numerology(),
        seasonal_element=ElementalEnergy.SPIRIT,
        time_of_day_energy=intensity,
        user_mood_history=[mood],
        recent_activity_patterns={'mood_intensity': intensity}
    )

def _analyze_session_engagement(session: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze engagement patterns for a session"""
    return {
        'mood_stability': len(set(entry.get('mood') for entry in session.get('moodHistory', []))),
        'interaction_frequency': len(session.get('moodHistory', [])) / max(1, _calculate_session_duration(session)),
        'completion_rate': min(1.0, _calculate_session_duration(session) / 45),  # Assuming 45 min target
        'cosmic_alignment_score': session.get('playlistData', {}).get('synchronicity_score', 0)
    }

def _generate_session_recommendations(session: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on session data"""
    recommendations = []
    
    duration = _calculate_session_duration(session)
    if duration < 15:
        recommendations.append("Consider longer listening sessions for deeper cosmic alignment")
    elif duration > 60:
        recommendations.append("Excellent dedication to your cosmic musical journey!")
    
    mood_history = session.get('moodHistory', [])
    if len(mood_history) > 3:
        recommendations.append("Your mood evolved significantly - this shows deep musical engagement")
    
    sync_score = session.get('playlistData', {}).get('synchronicity_score', 0)
    if sync_score > 0.8:
        recommendations.append("Exceptional cosmic synchronicity in this session!")
    
    return recommendations