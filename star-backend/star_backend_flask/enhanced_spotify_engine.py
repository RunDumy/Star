#!/usr/bin/env python3
"""
Enhanced Spotify Integration for STAR Platform
Cosmic soundtrack curation based on numerology, zodiac, and tarot influences
"""

import json
import logging
import os
import random
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth

logger = logging.getLogger(__name__)

class CosmicMood(Enum):
    """Cosmic moods for playlist curation"""
    FIRE_PASSION = "fire_passion"
    WATER_FLOW = "water_flow"
    AIR_CLARITY = "air_clarity"
    EARTH_GROUNDING = "earth_grounding"
    SPIRIT_TRANSCENDENCE = "spirit_transcendence"
    SHADOW_INTEGRATION = "shadow_integration"
    LIGHT_AWAKENING = "light_awakening"
    COSMIC_ALIGNMENT = "cosmic_alignment"

class ElementalEnergy(Enum):
    """Elemental energies for music selection"""
    FIRE = "fire"
    WATER = "water"
    AIR = "air"
    EARTH = "earth"
    SPIRIT = "spirit"

@dataclass
class CosmicTrack:
    """Represents a track with cosmic associations"""
    id: str
    name: str
    artist: str
    album: str
    duration_ms: int
    energy_level: float
    valence: float
    danceability: float
    cosmic_mood: CosmicMood
    elemental_energy: ElementalEnergy
    zodiac_resonance: List[str]
    numerology_alignment: List[int]
    chakra_associations: List[str]
    preview_url: Optional[str] = None
    external_url: Optional[str] = None

@dataclass
class CosmicPlaylist:
    """Represents a curated cosmic playlist"""
    id: str
    name: str
    description: str
    tracks: List[CosmicTrack]
    cosmic_theme: str
    elemental_balance: Dict[str, float]
    energy_flow: List[float]
    duration_minutes: int
    created_for: Dict[str, Any]  # User profile that inspired this playlist

class EnhancedSpotifyEngine:
    """Enhanced Spotify integration with cosmic intelligence"""
    
    def __init__(self):
        """Initialize Spotify engine with cosmic algorithms"""
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        self.redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/spotify-callback')
        
        # Initialize Spotify client
        self.sp = None
        self.sp_oauth = None
        self._initialize_spotify()
        
        # Cosmic music mappings
        self.elemental_genres = {
            ElementalEnergy.FIRE: [
                'rock', 'metal', 'punk', 'electronic', 'drum-and-bass',
                'reggaeton', 'dancehall', 'afrobeat', 'latin', 'flamenco'
            ],
            ElementalEnergy.WATER: [
                'ambient', 'new-age', 'jazz', 'blues', 'soul',
                'r-n-b', 'neo-soul', 'downtempo', 'trip-hop', 'world-music'
            ],
            ElementalEnergy.AIR: [
                'classical', 'acoustic', 'folk', 'indie', 'singer-songwriter',
                'chamber-pop', 'art-rock', 'progressive', 'experimental', 'minimal'
            ],
            ElementalEnergy.EARTH: [
                'country', 'bluegrass', 'folk', 'roots', 'reggae',
                'world-music', 'traditional', 'celtic', 'americana', 'gospel'
            ],
            ElementalEnergy.SPIRIT: [
                'meditation', 'spiritual', 'devotional', 'mantra', 'sacred',
                'tibetan', 'indian-classical', 'sufi', 'gospel', 'choral'
            ]
        }
        
        # Zodiac sign musical preferences
        self.zodiac_music_profiles = {
            'aries': {'energy': 0.8, 'tempo': 'high', 'genres': ['rock', 'electronic', 'punk']},
            'taurus': {'energy': 0.5, 'tempo': 'medium', 'genres': ['soul', 'r-n-b', 'country']},
            'gemini': {'energy': 0.7, 'tempo': 'varied', 'genres': ['pop', 'indie', 'alternative']},
            'cancer': {'energy': 0.4, 'tempo': 'low', 'genres': ['folk', 'acoustic', 'singer-songwriter']},
            'leo': {'energy': 0.9, 'tempo': 'high', 'genres': ['pop', 'dance', 'disco']},
            'virgo': {'energy': 0.6, 'tempo': 'medium', 'genres': ['classical', 'jazz', 'indie']},
            'libra': {'energy': 0.5, 'tempo': 'medium', 'genres': ['jazz', 'bossa-nova', 'chamber-pop']},
            'scorpio': {'energy': 0.7, 'tempo': 'medium', 'genres': ['dark', 'gothic', 'trip-hop']},
            'sagittarius': {'energy': 0.8, 'tempo': 'high', 'genres': ['world-music', 'reggae', 'latin']},
            'capricorn': {'energy': 0.5, 'tempo': 'medium', 'genres': ['classical', 'ambient', 'minimal']},
            'aquarius': {'energy': 0.6, 'tempo': 'varied', 'genres': ['electronic', 'experimental', 'new-wave']},
            'pisces': {'energy': 0.4, 'tempo': 'low', 'genres': ['ambient', 'dream-pop', 'shoegaze']}
        }
        
        # Numerology-based music preferences
        self.numerology_music_mapping = {
            1: {'keywords': ['leadership', 'independence', 'pioneering'], 'energy': 0.8},
            2: {'keywords': ['harmony', 'cooperation', 'balance'], 'energy': 0.4},
            3: {'keywords': ['creativity', 'expression', 'joy'], 'energy': 0.7},
            4: {'keywords': ['stability', 'order', 'foundation'], 'energy': 0.5},
            5: {'keywords': ['freedom', 'adventure', 'change'], 'energy': 0.8},
            6: {'keywords': ['nurturing', 'harmony', 'family'], 'energy': 0.5},
            7: {'keywords': ['spirituality', 'introspection', 'mystery'], 'energy': 0.3},
            8: {'keywords': ['power', 'achievement', 'success'], 'energy': 0.7},
            9: {'keywords': ['completion', 'wisdom', 'service'], 'energy': 0.6},
            11: {'keywords': ['intuition', 'inspiration', 'enlightenment'], 'energy': 0.5},
            22: {'keywords': ['mastery', 'building', 'manifestation'], 'energy': 0.6}
        }

    def _initialize_spotify(self):
        """Initialize Spotify client and OAuth"""
        try:
            if not self.client_id or not self.client_secret:
                logger.warning("Spotify credentials not found - music features disabled")
                return
            
            # Client credentials for public playlists
            client_credentials_manager = SpotifyClientCredentials(
                client_id=self.client_id,
                client_secret=self.client_secret
            )
            self.sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
            
            # OAuth for user-specific features
            scope = "playlist-modify-public playlist-modify-private user-library-read user-top-read"
            self.sp_oauth = SpotifyOAuth(
                client_id=self.client_id,
                client_secret=self.client_secret,
                redirect_uri=self.redirect_uri,
                scope=scope
            )
            
            logger.info("Spotify integration initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Spotify: {e}")
            self.sp = None
            self.sp_oauth = None

    def get_auth_url(self) -> Optional[str]:
        """Get Spotify authorization URL for user authentication"""
        if not self.sp_oauth:
            return None
        
        return self.sp_oauth.get_authorize_url()

    def get_access_token(self, code: str) -> Optional[Dict[str, Any]]:
        """Exchange authorization code for access token"""
        if not self.sp_oauth:
            return None
        
        try:
            token_info = self.sp_oauth.get_access_token(code)
            return token_info
        except Exception as e:
            logger.error(f"Failed to get access token: {e}")
            return None

    def create_cosmic_playlist(self, user_profile: Dict[str, Any], 
                             cosmic_intention: str = "daily_harmony") -> Optional[CosmicPlaylist]:
        """Create a personalized cosmic playlist"""
        if not self.sp:
            logger.warning("Spotify not available - cannot create playlist")
            return None
        
        try:
            # Analyze user profile for cosmic preferences
            cosmic_profile = self._analyze_cosmic_music_profile(user_profile)
            
            # Generate playlist concept
            playlist_concept = self._generate_playlist_concept(cosmic_profile, cosmic_intention)
            
            # Search for tracks
            tracks = self._search_cosmic_tracks(playlist_concept)
            
            # Create playlist object
            playlist = self._create_playlist_from_tracks(
                tracks, playlist_concept, user_profile
            )
            
            return playlist
            
        except Exception as e:
            logger.error(f"Failed to create cosmic playlist: {e}")
            return None

    def _analyze_cosmic_music_profile(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user's cosmic profile for music preferences"""
        profile = {
            'dominant_elements': [],
            'energy_preferences': [],
            'mood_tendencies': [],
            'temporal_influences': {}
        }
        
        # Zodiac influences
        zodiac_sign = user_profile.get('zodiac_sign', '').lower()
        if zodiac_sign in self.zodiac_music_profiles:
            zodiac_prefs = self.zodiac_music_profiles[zodiac_sign]
            profile['energy_preferences'].append(zodiac_prefs['energy'])
            profile['preferred_genres'] = zodiac_prefs['genres']
        
        # Numerology influences
        life_path = user_profile.get('life_path_number')
        if life_path in self.numerology_music_mapping:
            num_prefs = self.numerology_music_mapping[life_path]
            profile['energy_preferences'].append(num_prefs['energy'])
            profile['cosmic_keywords'] = num_prefs['keywords']
        
        # Personal Year/Month influences
        personal_year = user_profile.get('personal_year_number')
        if personal_year:
            profile['temporal_influences']['year'] = personal_year
        
        # Calculate dominant elemental energy
        profile['dominant_element'] = self._calculate_dominant_element(user_profile)
        
        return profile

    def _calculate_dominant_element(self, user_profile: Dict[str, Any]) -> ElementalEnergy:
        """Calculate user's dominant elemental energy for music selection"""
        element_scores = {element: 0 for element in ElementalEnergy}
        
        # Zodiac elemental influences
        zodiac_elements = {
            'aries': ElementalEnergy.FIRE, 'leo': ElementalEnergy.FIRE, 'sagittarius': ElementalEnergy.FIRE,
            'taurus': ElementalEnergy.EARTH, 'virgo': ElementalEnergy.EARTH, 'capricorn': ElementalEnergy.EARTH,
            'gemini': ElementalEnergy.AIR, 'libra': ElementalEnergy.AIR, 'aquarius': ElementalEnergy.AIR,
            'cancer': ElementalEnergy.WATER, 'scorpio': ElementalEnergy.WATER, 'pisces': ElementalEnergy.WATER
        }
        
        zodiac_sign = user_profile.get('zodiac_sign', '').lower()
        if zodiac_sign in zodiac_elements:
            element_scores[zodiac_elements[zodiac_sign]] += 2
        
        # Life Path influences
        life_path_elements = {
            1: ElementalEnergy.FIRE, 3: ElementalEnergy.FIRE, 5: ElementalEnergy.FIRE,
            2: ElementalEnergy.WATER, 6: ElementalEnergy.WATER, 9: ElementalEnergy.WATER,
            4: ElementalEnergy.EARTH, 8: ElementalEnergy.EARTH,
            7: ElementalEnergy.AIR, 11: ElementalEnergy.AIR,
            22: ElementalEnergy.SPIRIT
        }
        
        life_path = user_profile.get('life_path_number')
        if life_path in life_path_elements:
            element_scores[life_path_elements[life_path]] += 1
        
        # Return dominant element
        return max(element_scores.items(), key=lambda x: x[1])[0]

    def _generate_playlist_concept(self, cosmic_profile: Dict[str, Any], 
                                 cosmic_intention: str) -> Dict[str, Any]:
        """Generate playlist concept based on cosmic profile"""
        concept = {
            'name': self._generate_playlist_name(cosmic_profile, cosmic_intention),
            'description': self._generate_playlist_description(cosmic_profile, cosmic_intention),
            'target_duration': 45,  # minutes
            'energy_flow': self._design_energy_flow(cosmic_profile),
            'search_parameters': self._create_search_parameters(cosmic_profile),
            'cosmic_theme': cosmic_intention
        }
        
        return concept

    def _generate_playlist_name(self, cosmic_profile: Dict[str, Any], intention: str) -> str:
        """Generate mystical playlist name"""
        element = cosmic_profile.get('dominant_element', ElementalEnergy.SPIRIT).value
        
        name_templates = {
            'daily_harmony': [
                f"Cosmic {element.title()} Flow",
                f"Daily {element.title()} Meditation",
                f"{element.title()} Energy Alignment"
            ],
            'energy_boost': [
                f"Ignite Your {element.title()}",
                f"{element.title()} Power Surge",
                f"Awakened {element.title()}"
            ],
            'relaxation': [
                f"Gentle {element.title()} Waves",
                f"{element.title()} Sanctuary",
                f"Peaceful {element.title()} Garden"
            ],
            'creative_flow': [
                f"{element.title()} Creative Spark",
                f"Inspired {element.title()}",
                f"Divine {element.title()} Expression"
            ]
        }
        
        templates = name_templates.get(intention, name_templates['daily_harmony'])
        return random.choice(templates)

    def _generate_playlist_description(self, cosmic_profile: Dict[str, Any], intention: str) -> str:
        """Generate mystical playlist description"""
        element = cosmic_profile.get('dominant_element', ElementalEnergy.SPIRIT).value
        keywords = cosmic_profile.get('cosmic_keywords', ['harmony', 'balance'])
        
        descriptions = {
            'daily_harmony': f"A cosmic journey through {element} energy, designed to bring {', '.join(keywords)} into your daily rhythm. Let these frequencies align with your soul's natural vibration.",
            'energy_boost': f"Ignite your inner {element} and awaken your cosmic potential. These powerful frequencies resonate with {', '.join(keywords)} to fuel your spiritual evolution.",
            'relaxation': f"Sink into the gentle embrace of {element} energy. Allow these healing sounds to wash over you, bringing deep {', '.join(keywords)} to your being.",
            'creative_flow': f"Channel the creative force of {element} through divine musical expression. These inspired tracks unlock {', '.join(keywords)} within your creative consciousness."
        }
        
        return descriptions.get(intention, descriptions['daily_harmony'])

    def _design_energy_flow(self, cosmic_profile: Dict[str, Any]) -> List[float]:
        """Design energy flow curve for playlist"""
        # Energy preferences from profile
        target_energy = sum(cosmic_profile.get('energy_preferences', [0.5])) / len(cosmic_profile.get('energy_preferences', [1]))
        
        # Create energy curve - start gentle, build, then resolve
        flow = [
            target_energy * 0.3,  # Gentle opening
            target_energy * 0.5,  # Building
            target_energy * 0.7,  # Rising
            target_energy * 1.0,  # Peak
            target_energy * 0.8,  # Sustain
            target_energy * 0.6,  # Gentle descent
            target_energy * 0.4   # Peaceful resolution
        ]
        
        return flow

    def _create_search_parameters(self, cosmic_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Create Spotify search parameters based on cosmic profile"""
        params = {
            'genres': cosmic_profile.get('preferred_genres', ['ambient', 'new-age']),
            'target_energy': sum(cosmic_profile.get('energy_preferences', [0.5])) / len(cosmic_profile.get('energy_preferences', [1])),
            'target_valence': 0.6,  # Generally positive
            'limit': 50
        }
        
        # Add elemental genre preferences
        element = cosmic_profile.get('dominant_element', ElementalEnergy.SPIRIT)
        if element in self.elemental_genres:
            params['genres'].extend(self.elemental_genres[element][:3])
        
        return params

    def _search_cosmic_tracks(self, playlist_concept: Dict[str, Any]) -> List[CosmicTrack]:
        """Search for tracks matching cosmic criteria"""
        tracks = []
        search_params = playlist_concept['search_parameters']
        
        try:
            # Search by genres
            for genre in search_params['genres'][:5]:  # Limit genres to avoid too many requests
                results = self.sp.search(
                    q=f'genre:"{genre}"',
                    type='track',
                    limit=10
                )
                
                for track in results['tracks']['items']:
                    if len(tracks) >= 25:  # Limit total tracks
                        break
                    
                    cosmic_track = self._convert_to_cosmic_track(track, playlist_concept)
                    if cosmic_track:
                        tracks.append(cosmic_track)
            
            # Get audio features for all tracks
            track_ids = [track.id for track in tracks]
            if track_ids:
                audio_features = self.sp.audio_features(track_ids)
                self._enhance_tracks_with_audio_features(tracks, audio_features)
            
            # Sort by cosmic alignment
            tracks = self._sort_by_cosmic_alignment(tracks, playlist_concept)
            
            return tracks[:20]  # Return top 20 tracks
            
        except Exception as e:
            logger.error(f"Failed to search cosmic tracks: {e}")
            return []

    def _convert_to_cosmic_track(self, spotify_track: Dict, concept: Dict) -> Optional[CosmicTrack]:
        """Convert Spotify track to CosmicTrack with cosmic associations"""
        try:
            track = CosmicTrack(
                id=spotify_track['id'],
                name=spotify_track['name'],
                artist=spotify_track['artists'][0]['name'],
                album=spotify_track['album']['name'],
                duration_ms=spotify_track['duration_ms'],
                energy_level=0.5,  # Will be updated with audio features
                valence=0.5,  # Will be updated with audio features
                danceability=0.5,  # Will be updated with audio features
                cosmic_mood=self._determine_cosmic_mood(spotify_track),
                elemental_energy=self._determine_elemental_energy(spotify_track),
                zodiac_resonance=self._calculate_zodiac_resonance(spotify_track),
                numerology_alignment=self._calculate_numerology_alignment(spotify_track),
                chakra_associations=self._determine_chakra_associations(spotify_track),
                preview_url=spotify_track.get('preview_url'),
                external_url=spotify_track['external_urls'].get('spotify')
            )
            
            return track
            
        except Exception as e:
            logger.error(f"Failed to convert track: {e}")
            return None

    def _determine_cosmic_mood(self, track: Dict) -> CosmicMood:
        """Determine cosmic mood based on track characteristics"""
        # Simple mood determination based on track name and artist
        track_text = f"{track['name']} {track['artists'][0]['name']}".lower()
        
        mood_keywords = {
            CosmicMood.FIRE_PASSION: ['fire', 'passion', 'energy', 'power', 'intense'],
            CosmicMood.WATER_FLOW: ['water', 'flow', 'ocean', 'rain', 'tears', 'river'],
            CosmicMood.AIR_CLARITY: ['wind', 'air', 'clear', 'light', 'bright', 'sky'],
            CosmicMood.EARTH_GROUNDING: ['earth', 'ground', 'mountain', 'forest', 'nature'],
            CosmicMood.SPIRIT_TRANSCENDENCE: ['spirit', 'divine', 'sacred', 'transcend', 'cosmic'],
            CosmicMood.SHADOW_INTEGRATION: ['shadow', 'dark', 'deep', 'mystery', 'hidden'],
            CosmicMood.LIGHT_AWAKENING: ['light', 'awaken', 'dawn', 'rising', 'illumination'],
            CosmicMood.COSMIC_ALIGNMENT: ['cosmic', 'align', 'harmony', 'balance', 'unity']
        }
        
        for mood, keywords in mood_keywords.items():
            if any(keyword in track_text for keyword in keywords):
                return mood
        
        return CosmicMood.COSMIC_ALIGNMENT  # Default

    def _determine_elemental_energy(self, track: Dict) -> ElementalEnergy:
        """Determine elemental energy based on track characteristics"""
        # Similar to cosmic mood but for elements
        track_text = f"{track['name']} {track['artists'][0]['name']}".lower()
        
        element_keywords = {
            ElementalEnergy.FIRE: ['fire', 'burn', 'flame', 'heat', 'passion', 'energy'],
            ElementalEnergy.WATER: ['water', 'ocean', 'river', 'flow', 'wave', 'deep'],
            ElementalEnergy.AIR: ['air', 'wind', 'sky', 'breath', 'light', 'clear'],
            ElementalEnergy.EARTH: ['earth', 'mountain', 'forest', 'ground', 'solid', 'stable'],
            ElementalEnergy.SPIRIT: ['spirit', 'soul', 'divine', 'sacred', 'cosmic', 'transcend']
        }
        
        for element, keywords in element_keywords.items():
            if any(keyword in track_text for keyword in keywords):
                return element
        
        return ElementalEnergy.SPIRIT  # Default

    def _calculate_zodiac_resonance(self, track: Dict) -> List[str]:
        """Calculate which zodiac signs resonate with this track"""
        # Simple calculation based on track energy and mood
        # In practice, this could be much more sophisticated
        return ['scorpio', 'pisces', 'cancer']  # Default water signs

    def _calculate_numerology_alignment(self, track: Dict) -> List[int]:
        """Calculate numerology numbers that align with this track"""
        # Calculate based on track name numerology
        track_name = track['name']
        name_number = sum(ord(c.lower()) - ord('a') + 1 for c in track_name if c.isalpha()) % 9
        if name_number == 0:
            name_number = 9
        
        return [name_number, (name_number + 1) % 9 + 1]  # Primary and secondary numbers

    def _determine_chakra_associations(self, track: Dict) -> List[str]:
        """Determine chakra associations for the track"""
        chakras = ['root', 'sacral', 'solar_plexus', 'heart', 'throat', 'third_eye', 'crown']
        # Simple random assignment for now - could be made more sophisticated
        return random.sample(chakras, k=random.randint(1, 3))

    def _enhance_tracks_with_audio_features(self, tracks: List[CosmicTrack], 
                                          audio_features: List[Dict]):
        """Enhance tracks with Spotify audio features"""
        for i, features in enumerate(audio_features):
            if features and i < len(tracks):
                tracks[i].energy_level = features.get('energy', 0.5)
                tracks[i].valence = features.get('valence', 0.5)
                tracks[i].danceability = features.get('danceability', 0.5)

    def _sort_by_cosmic_alignment(self, tracks: List[CosmicTrack], 
                                concept: Dict[str, Any]) -> List[CosmicTrack]:
        """Sort tracks by cosmic alignment score"""
        target_energy = concept['search_parameters']['target_energy']
        
        def alignment_score(track):
            energy_match = 1 - abs(track.energy_level - target_energy)
            valence_match = track.valence
            return energy_match * 0.6 + valence_match * 0.4
        
        return sorted(tracks, key=alignment_score, reverse=True)

    def _create_playlist_from_tracks(self, tracks: List[CosmicTrack], 
                                   concept: Dict[str, Any], 
                                   user_profile: Dict[str, Any]) -> CosmicPlaylist:
        """Create final cosmic playlist object"""
        # Calculate elemental balance
        elemental_balance = {}
        for element in ElementalEnergy:
            count = sum(1 for track in tracks if track.elemental_energy == element)
            elemental_balance[element.value] = count / len(tracks) if tracks else 0
        
        # Calculate energy flow
        energy_flow = [track.energy_level for track in tracks]
        
        # Calculate total duration
        total_duration = sum(track.duration_ms for track in tracks) / (1000 * 60)  # Convert to minutes
        
        playlist = CosmicPlaylist(
            id=f"cosmic_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            name=concept['name'],
            description=concept['description'],
            tracks=tracks,
            cosmic_theme=concept['cosmic_theme'],
            elemental_balance=elemental_balance,
            energy_flow=energy_flow,
            duration_minutes=int(total_duration),
            created_for=user_profile
        )
        
        return playlist

    # API Integration Methods
    def get_user_cosmic_playlists(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's cosmic playlists"""
        # This would integrate with the database to fetch user's saved playlists
        return []

    def save_cosmic_playlist(self, playlist: CosmicPlaylist, user_id: str) -> bool:
        """Save cosmic playlist to database"""
        # This would save to Cosmos DB
        try:
            playlist_data = {
                'id': playlist.id,
                'user_id': user_id,
                'playlist_data': asdict(playlist),
                'created_at': datetime.utcnow().isoformat(),
                'type': 'cosmic_playlist'
            }
            
            logger.info(f"Cosmic playlist saved: {playlist.name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save playlist: {e}")
            return False

    def get_daily_cosmic_soundtrack(self, user_profile: Dict[str, Any]) -> Optional[CosmicPlaylist]:
        """Generate daily cosmic soundtrack based on current cosmic timing"""
        # Enhanced daily playlist with current astrological influences
        cosmic_intention = self._determine_daily_intention(user_profile)
        return self.create_cosmic_playlist(user_profile, cosmic_intention)

    def _determine_daily_intention(self, user_profile: Dict[str, Any]) -> str:
        """Determine daily cosmic intention based on various factors"""
        # Current day of week influence
        weekday = datetime.now().weekday()
        weekly_intentions = {
            0: 'energy_boost',      # Monday - New beginnings
            1: 'creative_flow',     # Tuesday - Mars energy
            2: 'daily_harmony',     # Wednesday - Mercury communication
            3: 'creative_flow',     # Thursday - Jupiter expansion
            4: 'daily_harmony',     # Friday - Venus love
            5: 'relaxation',        # Saturday - Saturn rest
            6: 'relaxation'         # Sunday - Sun reflection
        }
        
        return weekly_intentions.get(weekday, 'daily_harmony')

    def get_playlist_for_tarot_reading(self, tarot_cards: List[Dict], 
                                     user_profile: Dict[str, Any]) -> Optional[CosmicPlaylist]:
        """Create playlist based on tarot reading energy"""
        # Analyze tarot cards for musical themes
        card_energies = []
        dominant_suits = {}
        
        for card_data in tarot_cards:
            card = card_data.get('card', {})
            suit = card.get('suit', 'major_arcana').lower()
            
            # Count suits
            dominant_suits[suit] = dominant_suits.get(suit, 0) + 1
            
            # Analyze energy
            if card.get('is_reversed'):
                card_energies.append(0.3)  # Lower energy for reversed
            else:
                card_energies.append(0.7)  # Higher energy for upright
        
        # Determine playlist intention based on dominant suit
        suit_intentions = {
            'wands': 'energy_boost',
            'cups': 'relaxation',
            'swords': 'daily_harmony',
            'pentacles': 'daily_harmony',
            'major_arcana': 'creative_flow'
        }
        
        dominant_suit = max(dominant_suits.items(), key=lambda x: x[1])[0]
        intention = suit_intentions.get(dominant_suit, 'daily_harmony')
        
        return self.create_cosmic_playlist(user_profile, intention)

# Initialize global Spotify engine
spotify_engine = None

def get_spotify_engine() -> Optional[EnhancedSpotifyEngine]:
    """Get global Spotify engine instance"""
    global spotify_engine
    if spotify_engine is None:
        try:
            spotify_engine = EnhancedSpotifyEngine()
        except Exception as e:
            logger.error(f"Failed to initialize Spotify engine: {e}")
            return None
    return spotify_engine