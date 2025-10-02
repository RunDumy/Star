from flask import Blueprint, request, jsonify
import math
import random
from typing import List, Dict, Any
import logging
from cachetools import TTLCache
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import requests
import os
from datetime import datetime

tarot_bp = Blueprint('tarot_interactions', __name__)

# Initialize cache and logger
cache = TTLCache(maxsize=1000, ttl=3600)  # 1 hour cache
logger = logging.getLogger(__name__)

def calculate_energy_flow(cards_data, spread_data):
    """
    Calculate energy flows between tarot cards based on their positions and elemental affinities
    """
    cache_key = f"energy_flow_{str(cards_data)}_{str(spread_data)}"
    if cache_key in cache:
        return cache[cache_key]

    flows = []

    # Card element mapping (simplified)
    card_elements = {
        'The Fool': 'Air', 'The Magician': 'Air', 'The High Priestess': 'Water',
        'The Empress': 'Earth', 'The Emperor': 'Earth', 'The Hierophant': 'Earth',
        'The Lovers': 'Air', 'The Chariot': 'Water', 'Strength': 'Fire',
        'The Hermit': 'Earth', 'Wheel of Fortune': 'Fire', 'Justice': 'Air',
        'The Hanged Man': 'Water', 'Death': 'Water', 'Temperance': 'Water',
        'The Devil': 'Earth', 'The Tower': 'Fire', 'The Star': 'Water',
        'The Moon': 'Water', 'The Sun': 'Fire', 'Judgement': 'Fire',
        'The World': 'Earth'
    }

    # Determine element for each card (default to Air if unknown)
    for card in cards_data:
        card['element'] = card_elements.get(card.get('cardName', '').split(' - ')[0], 'Air')

    # Calculate flows between nearby cards
    for i, card1 in enumerate(cards_data):
        for j, card2 in enumerate(cards_data):
            if i >= j:  # Avoid duplicate flows
                continue

            # Calculate distance between cards
            dx = card1['position']['x'] - card2['position']['x']
            dy = card1['position']['y'] - card2['position']['y']
            distance = math.sqrt(dx**2 + dy**2)

            # Only create flows for cards within reasonable distance (scaled canvas coords)
            if distance < 200:  # Adjust threshold as needed
                # Element compatibility calculation
                element1 = card1['element']
                element2 = card2['element']

                compatibility_matrix = {
                    'Fire': {'Fire': 0.8, 'Air': 0.9, 'Water': 0.3, 'Earth': 0.6},
                    'Air': {'Fire': 0.9, 'Air': 0.7, 'Water': 0.5, 'Earth': 0.4},
                    'Water': {'Fire': 0.3, 'Air': 0.5, 'Water': 0.8, 'Earth': 0.9},
                    'Earth': {'Fire': 0.6, 'Air': 0.4, 'Water': 0.9, 'Earth': 0.8}
                }

                compatibility = compatibility_matrix.get(element1, {}).get(element2, 0.5)

                # Distance influence (closer = stronger flow)
                distance_factor = max(0.1, 1 - (distance / 200))

                # Random variation for mystical feel
                variation = random.uniform(0.8, 1.2)

                strength = int(compatibility * distance_factor * variation * 5) + 1
                strength = min(strength, 5)  # Cap at 5

                # Determine flow style based on element combination
                if element1 == element2:
                    style = 'arc'
                elif abs(['Fire', 'Air', 'Water', 'Earth'].index(element1) -
                        ['Fire', 'Air', 'Water', 'Earth'].index(element2)) == 2:
                    style = 'wave'  # Opposite elements
                else:
                    style = 'line'

                # Element-based color mapping
                color_map = {
                    'Fire': '#ff6b35', 'Air': '#f7dc6f', 'Water': '#3498db', 'Earth': '#27ae60'
                }

                # Determine frequency based on dominant energy
                if compatibility > 0.8:
                    frequency = 'activating'
                elif compatibility > 0.6:
                    frequency = 'transforming'
                elif compatibility > 0.4:
                    frequency = 'flowing'
                else:
                    frequency = 'grounding'

                flow = {
                    'id': f"flow_{i}_{j}",
                    'fromCardId': card1['id'],
                    'toCardId': card2['id'],
                    'strength': strength,
                    'element': f"{element1}-{element2}",
                    'color': color_map.get(element1, '#9b59b6'),
                    'style': style,
                    'frequency': frequency
                }

                flows.append(flow)

    # Sort by strength (strongest first) and limit to most significant flows
    flows.sort(key=lambda x: x['strength'], reverse=True)
    result = flows[:min(len(flows), 10)]  # Max 10 flows for performance
    cache[cache_key] = result
    return result

def enhanced_interpretation(card_data, position_data, nearby_cards=None):
    """
    Generate enhanced tarot interpretations considering energy flows
    """
    interpretations = {}

    # Base interpretation logic (to be expanded)
    for position in position_data:
        position_id = position['id']
        interpretations[position_id] = f"Cosmic energy flows reveal insights for {position['label']}"

    # Enhance with nearby card influences if available
    if nearby_cards:
        for position in position_data:
            nearby_influences = []
            for card in nearby_cards:
                # Calculate influence based on proximity and elemental harmony
                interpretations[position['id']] += f" with {card['cardName']} energy nearby"

    return interpretations

def generate_spotify_playlist(energy_flows):
    """
    Generate a Spotify playlist based on energy flow frequencies
    """
    try:
        client_id = os.getenv('SPOTIFY_CLIENT_ID')
        client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')

        if not client_id or not client_secret:
            return {'playlist': {'name': 'Cosmic Playlist (Spotify not configured)', 'tracks': [], 'uri': 'spotify:playlist:mock_cosmic'}}

        sp = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id, client_secret))

        cache_key = f"spotify_{str(energy_flows)}"
        if cache_key in cache:
            return cache[cache_key]

        # Mood mapping based on energy frequencies
        mood_mapping = {
            'activating': ['electronic', 'dance', 'pop', 'rock'],
            'transforming': ['indie', 'alternative', 'rock', 'jazz'],
            'flowing': ['chill', 'lo-fi', 'acoustic', 'ambient'],
            'grounding': ['folk', 'classical', 'world', 'ambient']
        }

        # Count frequencies
        frequencies = {}
        for flow in energy_flows:
            freq = flow.get('frequency', 'flowing')
            frequencies[freq] = frequencies.get(freq, 0) + flow.get('strength', 1)

        # Get dominant moods
        dominant_freqs = sorted(frequencies.items(), key=lambda x: x[1], reverse=True)[:3]
        genres = []
        for freq, strength in dominant_freqs:
            genres.extend(random.sample(mood_mapping.get(freq, ['chill']), min(strength // 2 + 1, 2)))

        genres = list(set(genres))[:5]  # Limit to 5 unique genres

        tracks = []
        for genre in genres:
            try:
                results = sp.search(q=f'genre:"{genre}"', type='track', limit=3)
                tracks.extend([track['uri'] for track in results['tracks']['items']])
            except Exception as e:
                logger.warning(f"Failed to search Spotify for genre {genre}: {e}")

        # Random sample of tracks
        selected_tracks = random.sample(tracks, min(len(tracks), 10)) if tracks else []

        playlist = {
            'name': f"Cosmic Tarot: {' & '.join([f.title() for f, _ in dominant_freqs[:2]])} Energy",
            'tracks': selected_tracks,
            'uri': f"spotify:playlist:cosmic_{datetime.now().timestamp()}"
        }

        result = {'playlist': playlist}
        cache[cache_key] = result
        return result

    except Exception as e:
        logger.error(f"Spotify playlist generation failed: {e}")
        return {'playlist': {'name': 'Cosmic Playlist (Error)', 'tracks': [], 'uri': 'spotify:playlist:error'}}

def get_location_insights(ip_address):
    """
    Get location-based astrological insights using IPGeolocation API
    """
    try:
        api_key = os.getenv('IPGEOLOCATION_API_KEY')
        if not api_key:
            return {'astrological_note': 'Location insights unavailable - API key not configured'}

        cache_key = f"location_{ip_address}"
        if cache_key in cache:
            return cache[cache_key]

        # Use 'auto' for client IP if provided
        query_ip = ip_address if ip_address != 'auto' else ''

        response = requests.get(
            f"https://api.ipgeolocation.io/astronomy?apiKey={api_key}&ip={query_ip}",
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        # Enhanced astrological insights
        location = data.get('location', {})
        city = location.get('city', 'Unknown')
        sun_sign = data.get('sun_sign', 'Unknown')
        moon_phase = data.get('moon_phase', 'Unknown')

        insights = {
            'location': location,
            'sun_sign': sun_sign,
            'moon_phase': moon_phase,
            'astrological_note': f"Your local celestial alignment in {city} reveals a {moon_phase} moon under {sun_sign} influence. This enhances the elemental energies of your tarot spread with localized cosmic resonance."
        }

        cache[cache_key] = insights
        return insights

    except Exception as e:
        logger.error(f"Location insights failed: {e}")
        return {'astrological_note': 'Unable to fetch location-based astrological insights'}

@tarot_bp.route('/calculate-energy-flow', methods=['POST'])
def api_calculate_energy_flow():
    """
    API endpoint to calculate energy flows between tarot cards
    """
    try:
        data = request.get_json()
        cards = data.get('cards', [])
        spread = data.get('spread', {})

        if not cards or not spread:
            return jsonify({'error': 'Cards and spread data required'}), 400

        energy_flows = calculate_energy_flow(cards, spread)

        return jsonify({
            'energy_flows': energy_flows,
            'total_connections': len(energy_flows),
            'dominant_element': max(set(flow['element'].split('-')[0] for flow in energy_flows),
                                   key=lambda x: sum(1 for f in energy_flows if f['element'].startswith(x))) if energy_flows else 'Universal'
        })

    except Exception as e:
        return jsonify({'error': f'Failed to calculate energy flows: {str(e)}'}), 500

@tarot_bp.route('/enhanced-interpretation', methods=['POST'])
def api_enhanced_interpretation():
    """
    API endpoint for enhanced tarot reading interpretations
    """
    try:
        data = request.get_json()
        cards = data.get('cards', [])
        spread = data.get('spread', {})

        if not cards or not spread:
            return jsonify({'error': 'Cards and spread data required'}), 400

        # Calculate energy flows first
        energy_flows = calculate_energy_flow(cards, spread)

        # Generate interpretations considering energy flows
        interpretations = enhanced_interpretation(cards, spread.get('positions', []), cards)

        return jsonify({
            'interpretations': interpretations,
            'energy_flows': energy_flows,
            'cosmic_alignment': f"Universal energies align with {len(energy_flows)} mystical connections",
            'energy_intensity': sum(flow['strength'] for flow in energy_flows) if energy_flows else 0
        })

    except Exception as e:
        return jsonify({'error': f'Failed to generate enhanced interpretation: {str(e)}'}), 500

@tarot_bp.route('/spotify-playlist', methods=['POST'])
def api_generate_spotify_playlist():
    """
    API endpoint to generate a Spotify playlist based on energy flows
    """
    try:
        data = request.get_json()
        energy_flows = data.get('energy_flows', [])
        spread_type = data.get('spread_type', 'three-card')

        if not energy_flows:
            return jsonify({'error': 'Energy flows data required'}), 400

        playlist_result = generate_spotify_playlist(energy_flows)

        return jsonify(playlist_result)

    except Exception as e:
        logger.error(f"Spotify playlist API error: {e}")
        return jsonify({'error': f'Failed to generate Spotify playlist: {str(e)}'}), 500

@tarot_bp.route('/location-insights', methods=['POST'])
def api_get_location_insights():
    """
    API endpoint to get location-based astrological insights
    """
    try:
        data = request.get_json()
        ip_address = data.get('ip_address', 'auto')

        insights = get_location_insights(ip_address)

        return jsonify(insights)

    except Exception as e:
        logger.error(f"Location insights API error: {e}")
        return jsonify({'error': f'Failed to get location insights: {str(e)}'}), 500
