#!/usr/bin/env python3
"""
Enhanced Spotify API Endpoints for STAR Platform
Cosmic music curation and playlist management
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from enhanced_spotify_engine import CosmicPlaylist, get_spotify_engine
from flask import Blueprint, g, jsonify, request
from star_auth import token_required

logger = logging.getLogger(__name__)

# Create Spotify blueprint
spotify_bp = Blueprint('spotify', __name__, url_prefix='/api/v1/spotify')

@spotify_bp.route('/auth-url', methods=['GET'])
@token_required
def get_spotify_auth_url():
    """Get Spotify authorization URL for user authentication"""
    try:
        spotify_engine = get_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Spotify integration not available'}), 503
        
        auth_url = spotify_engine.get_auth_url()
        if not auth_url:
            return jsonify({'error': 'Failed to generate authorization URL'}), 500
        
        return jsonify({
            'auth_url': auth_url,
            'message': 'Visit this URL to authorize STAR to access your Spotify account'
        })
        
    except Exception as e:
        logger.error(f"Failed to get Spotify auth URL: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@spotify_bp.route('/callback', methods=['POST'])
@token_required
def spotify_callback():
    """Handle Spotify authorization callback"""
    try:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'error': 'Authorization code required'}), 400
        
        spotify_engine = get_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Spotify integration not available'}), 503
        
        # Exchange code for access token
        token_info = spotify_engine.get_access_token(data['code'])
        if not token_info:
            return jsonify({'error': 'Failed to get access token'}), 400
        
        # TODO: Store token info in user profile
        # This would be saved to Cosmos DB with user's profile
        
        return jsonify({
            'success': True,
            'message': 'Spotify account connected successfully',
            'expires_in': token_info.get('expires_in', 3600)
        })
        
    except Exception as e:
        logger.error(f"Spotify callback error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@spotify_bp.route('/cosmic-playlist', methods=['POST'])
@token_required
def create_cosmic_playlist():
    """Create a personalized cosmic playlist"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        spotify_engine = get_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Spotify integration not available'}), 503
        
        # Get user profile (from token or request)
        user_profile = data.get('user_profile', {})
        if not user_profile:
            # Try to get from authenticated user context
            user_profile = {
                'user_id': g.current_user.get('user_id', 'anonymous'),
                'zodiac_sign': data.get('zodiac_sign', 'scorpio'),
                'life_path_number': data.get('life_path_number', 8),
                'personal_year_number': data.get('personal_year_number', 1)
            }
        
        cosmic_intention = data.get('cosmic_intention', 'daily_harmony')
        
        # Create cosmic playlist
        playlist = spotify_engine.create_cosmic_playlist(user_profile, cosmic_intention)
        if not playlist:
            return jsonify({'error': 'Failed to create cosmic playlist'}), 500
        
        # Save playlist to database
        saved = spotify_engine.save_cosmic_playlist(playlist, user_profile['user_id'])
        
        # Convert playlist to JSON-serializable format
        playlist_data = {
            'id': playlist.id,
            'name': playlist.name,
            'description': playlist.description,
            'cosmic_theme': playlist.cosmic_theme,
            'duration_minutes': playlist.duration_minutes,
            'track_count': len(playlist.tracks),
            'elemental_balance': playlist.elemental_balance,
            'energy_flow': playlist.energy_flow,
            'tracks': [
                {
                    'id': track.id,
                    'name': track.name,
                    'artist': track.artist,
                    'album': track.album,
                    'duration_ms': track.duration_ms,
                    'energy_level': track.energy_level,
                    'cosmic_mood': track.cosmic_mood.value,
                    'elemental_energy': track.elemental_energy.value,
                    'preview_url': track.preview_url,
                    'external_url': track.external_url
                }
                for track in playlist.tracks
            ],
            'saved': saved
        }
        
        return jsonify({
            'success': True,
            'playlist': playlist_data,
            'message': f'Cosmic playlist "{playlist.name}" created with {len(playlist.tracks)} tracks'
        })
        
    except Exception as e:
        logger.error(f"Failed to create cosmic playlist: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@spotify_bp.route('/daily-soundtrack', methods=['GET'])
@token_required
def get_daily_cosmic_soundtrack():
    """Get personalized daily cosmic soundtrack"""
    try:
        spotify_engine = get_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Spotify integration not available'}), 503
        
        # Get user profile from query params or authenticated user
        user_profile = {
            'user_id': g.current_user.get('user_id', 'anonymous'),
            'zodiac_sign': request.args.get('zodiac_sign', 'scorpio'),
            'life_path_number': int(request.args.get('life_path_number', 8)),
            'personal_year_number': int(request.args.get('personal_year_number', 1))
        }
        
        # Generate daily soundtrack
        playlist = spotify_engine.get_daily_cosmic_soundtrack(user_profile)
        if not playlist:
            return jsonify({'error': 'Failed to generate daily soundtrack'}), 500
        
        # Convert to response format
        soundtrack_data = {
            'id': playlist.id,
            'name': playlist.name,
            'description': playlist.description,
            'cosmic_theme': playlist.cosmic_theme,
            'duration_minutes': playlist.duration_minutes,
            'track_count': len(playlist.tracks),
            'elemental_balance': playlist.elemental_balance,
            'daily_energy_guidance': _generate_daily_energy_guidance(playlist),
            'tracks': [
                {
                    'name': track.name,
                    'artist': track.artist,
                    'energy_level': track.energy_level,
                    'cosmic_mood': track.cosmic_mood.value,
                    'elemental_energy': track.elemental_energy.value,
                    'preview_url': track.preview_url,
                    'external_url': track.external_url
                }
                for track in playlist.tracks[:10]  # First 10 tracks for preview
            ]
        }
        
        return jsonify({
            'success': True,
            'daily_soundtrack': soundtrack_data,
            'cosmic_timing_advice': _get_cosmic_timing_advice(),
            'message': f'Your daily cosmic soundtrack is ready with {len(playlist.tracks)} tracks'
        })
        
    except Exception as e:
        logger.error(f"Failed to get daily soundtrack: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@spotify_bp.route('/tarot-playlist', methods=['POST'])
@token_required
def create_tarot_playlist():
    """Create playlist based on tarot reading energy"""
    try:
        data = request.get_json()
        if not data or 'tarot_cards' not in data:
            return jsonify({'error': 'Tarot cards data required'}), 400
        
        spotify_engine = get_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Spotify integration not available'}), 503
        
        tarot_cards = data['tarot_cards']
        user_profile = data.get('user_profile', {
            'user_id': g.current_user.get('user_id', 'anonymous'),
            'zodiac_sign': 'scorpio',
            'life_path_number': 8
        })
        
        # Create tarot-inspired playlist
        playlist = spotify_engine.get_playlist_for_tarot_reading(tarot_cards, user_profile)
        if not playlist:
            return jsonify({'error': 'Failed to create tarot playlist'}), 500
        
        # Analyze tarot energy for playlist context
        tarot_analysis = _analyze_tarot_energy_for_music(tarot_cards)
        
        playlist_data = {
            'id': playlist.id,
            'name': playlist.name,
            'description': playlist.description,
            'cosmic_theme': playlist.cosmic_theme,
            'duration_minutes': playlist.duration_minutes,
            'track_count': len(playlist.tracks),
            'tarot_inspiration': tarot_analysis,
            'energy_flow': playlist.energy_flow,
            'tracks': [
                {
                    'name': track.name,
                    'artist': track.artist,
                    'energy_level': track.energy_level,
                    'cosmic_mood': track.cosmic_mood.value,
                    'preview_url': track.preview_url,
                    'external_url': track.external_url
                }
                for track in playlist.tracks
            ]
        }
        
        return jsonify({
            'success': True,
            'tarot_playlist': playlist_data,
            'message': f'Tarot-inspired playlist created based on your reading'
        })
        
    except Exception as e:
        logger.error(f"Failed to create tarot playlist: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@spotify_bp.route('/playlists', methods=['GET'])
@token_required
def get_user_playlists():
    """Get user's saved cosmic playlists"""
    try:
        spotify_engine = get_spotify_engine()
        if not spotify_engine:
            return jsonify({'error': 'Spotify integration not available'}), 503
        
        user_id = g.current_user.get('user_id', 'anonymous')
        
        # Get user's cosmic playlists
        playlists = spotify_engine.get_user_cosmic_playlists(user_id)
        
        return jsonify({
            'success': True,
            'playlists': playlists,
            'count': len(playlists)
        })
        
    except Exception as e:
        logger.error(f"Failed to get user playlists: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@spotify_bp.route('/cosmic-moods', methods=['GET'])
def get_cosmic_moods():
    """Get available cosmic moods for playlist creation"""
    try:
        moods = [
            {
                'id': 'fire_passion',
                'name': 'Fire Passion',
                'description': 'Ignite your inner fire with passionate, energetic tracks',
                'element': 'fire',
                'energy_level': 0.8
            },
            {
                'id': 'water_flow',
                'name': 'Water Flow',
                'description': 'Flow with gentle, emotional, and intuitive melodies',
                'element': 'water',
                'energy_level': 0.4
            },
            {
                'id': 'air_clarity',
                'name': 'Air Clarity',
                'description': 'Clear your mind with light, uplifting, and inspiring music',
                'element': 'air',
                'energy_level': 0.6
            },
            {
                'id': 'earth_grounding',
                'name': 'Earth Grounding',
                'description': 'Ground yourself with stable, nurturing, and rooted sounds',
                'element': 'earth',
                'energy_level': 0.5
            },
            {
                'id': 'spirit_transcendence',
                'name': 'Spirit Transcendence',
                'description': 'Transcend the ordinary with divine, mystical frequencies',
                'element': 'spirit',
                'energy_level': 0.3
            },
            {
                'id': 'cosmic_alignment',
                'name': 'Cosmic Alignment',
                'description': 'Align with universal harmony and cosmic consciousness',
                'element': 'spirit',
                'energy_level': 0.5
            }
        ]
        
        return jsonify({
            'success': True,
            'cosmic_moods': moods,
            'message': 'Choose a cosmic mood to create your personalized playlist'
        })
        
    except Exception as e:
        logger.error(f"Failed to get cosmic moods: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@spotify_bp.route('/elemental-genres', methods=['GET'])
def get_elemental_genres():
    """Get music genres associated with each element"""
    try:
        elemental_genres = {
            'fire': [
                'rock', 'metal', 'electronic', 'drum-and-bass', 'punk',
                'reggaeton', 'dancehall', 'afrobeat', 'latin', 'flamenco'
            ],
            'water': [
                'ambient', 'new-age', 'jazz', 'blues', 'soul',
                'r-n-b', 'neo-soul', 'downtempo', 'trip-hop', 'world-music'
            ],
            'air': [
                'classical', 'acoustic', 'folk', 'indie', 'singer-songwriter',
                'chamber-pop', 'art-rock', 'progressive', 'experimental', 'minimal'
            ],
            'earth': [
                'country', 'bluegrass', 'folk', 'roots', 'reggae',
                'world-music', 'traditional', 'celtic', 'americana', 'gospel'
            ],
            'spirit': [
                'meditation', 'spiritual', 'devotional', 'mantra', 'sacred',
                'tibetan', 'indian-classical', 'sufi', 'gospel', 'choral'
            ]
        }
        
        return jsonify({
            'success': True,
            'elemental_genres': elemental_genres,
            'message': 'Music genres organized by elemental energy'
        })
        
    except Exception as e:
        logger.error(f"Failed to get elemental genres: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# Helper functions
def _generate_daily_energy_guidance(playlist: CosmicPlaylist) -> Dict[str, str]:
    """Generate daily energy guidance based on playlist"""
    dominant_element = max(playlist.elemental_balance.items(), key=lambda x: x[1])[0]
    avg_energy = sum(playlist.energy_flow) / len(playlist.energy_flow)
    
    guidance = {
        'dominant_element': dominant_element,
        'energy_level': 'high' if avg_energy > 0.6 else 'medium' if avg_energy > 0.3 else 'low',
        'cosmic_advice': f"Today's cosmic energy flows through {dominant_element} frequencies. "
                        f"Let this playlist guide your spiritual rhythm and align with universal harmonies."
    }
    
    return guidance

def _get_cosmic_timing_advice() -> Dict[str, str]:
    """Get current cosmic timing advice"""
    current_hour = datetime.now().hour
    
    timing_advice = {
        'current_phase': 'morning_awakening' if current_hour < 12 else 'evening_reflection',
        'optimal_listening': 'meditation' if current_hour < 10 or current_hour > 18 else 'active_focus',
        'cosmic_message': 'The universe is singing your song - tune in to its divine frequency.'
    }
    
    return timing_advice

def _analyze_tarot_energy_for_music(tarot_cards: List[Dict]) -> Dict[str, Any]:
    """Analyze tarot reading energy for musical inspiration"""
    total_energy = 0
    suit_counts = {}
    reversed_count = 0
    
    for card_data in tarot_cards:
        card = card_data.get('card', {})
        suit = card.get('suit', 'major_arcana')
        
        # Count suits
        suit_counts[suit] = suit_counts.get(suit, 0) + 1
        
        # Count reversed cards
        if card.get('is_reversed'):
            reversed_count += 1
            total_energy += 0.3
        else:
            total_energy += 0.7
    
    avg_energy = total_energy / len(tarot_cards) if tarot_cards else 0.5
    dominant_suit = max(suit_counts.items(), key=lambda x: x[1])[0] if suit_counts else 'major_arcana'
    
    analysis = {
        'dominant_suit': dominant_suit,
        'energy_level': avg_energy,
        'reversed_percentage': (reversed_count / len(tarot_cards)) * 100 if tarot_cards else 0,
        'musical_theme': _get_musical_theme_for_suit(dominant_suit),
        'recommended_mood': _get_mood_for_energy(avg_energy)
    }
    
    return analysis

def _get_musical_theme_for_suit(suit: str) -> str:
    """Get musical theme recommendation for tarot suit"""
    suit_themes = {
        'wands': 'dynamic and energetic rhythms for creative action',
        'cups': 'flowing and emotional melodies for heart healing',
        'swords': 'sharp and intellectual compositions for mental clarity',
        'pentacles': 'grounded and stable harmonies for material manifestation',
        'major_arcana': 'cosmic and transformational frequencies for spiritual growth'
    }
    
    return suit_themes.get(suit.lower(), 'balanced cosmic harmonies')

def _get_mood_for_energy(energy_level: float) -> str:
    """Get recommended cosmic mood based on energy level"""
    if energy_level > 0.7:
        return 'fire_passion'
    elif energy_level > 0.5:
        return 'cosmic_alignment'
    elif energy_level > 0.3:
        return 'water_flow'
    else:
        return 'spirit_transcendence'