#!/usr/bin/env python3
"""
Advanced Cosmic Spotify Integration for STAR Platform
Enhanced playlist curation with real-time cosmic synchronization, 
tarot influences, and advanced mood-based generation
"""

import json
import logging
import os
import random
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import spotipy
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from enhanced_spotify_engine import (CosmicMood, CosmicPlaylist, CosmicTrack,
                                     ElementalEnergy, EnhancedSpotifyEngine)
from spotipy.oauth2 import SpotifyClientCredentials, SpotifyOAuth

logger = logging.getLogger(__name__)

class TarotCardMusicMood(Enum):
    """Tarot-influenced music moods"""
    FOOL_ADVENTURE = "fool_adventure"
    MAGICIAN_POWER = "magician_power"
    HIGH_PRIESTESS_MYSTERY = "high_priestess_mystery"
    EMPRESS_ABUNDANCE = "empress_abundance"
    EMPEROR_STRENGTH = "emperor_strength"
    HIEROPHANT_TRADITION = "hierophant_tradition"
    LOVERS_HARMONY = "lovers_harmony"
    CHARIOT_DETERMINATION = "chariot_determination"
    STRENGTH_COURAGE = "strength_courage"
    HERMIT_SOLITUDE = "hermit_solitude"
    WHEEL_FORTUNE = "wheel_fortune"
    JUSTICE_BALANCE = "justice_balance"
    HANGED_MAN_REFLECTION = "hanged_man_reflection"
    DEATH_TRANSFORMATION = "death_transformation"
    TEMPERANCE_MODERATION = "temperance_moderation"
    DEVIL_TEMPTATION = "devil_temptation"
    TOWER_UPHEAVAL = "tower_upheaval"
    STAR_HOPE = "star_hope"
    MOON_ILLUSION = "moon_illusion"
    SUN_JOY = "sun_joy"
    JUDGEMENT_REBIRTH = "judgement_rebirth"
    WORLD_COMPLETION = "world_completion"

class LunarPhase(Enum):
    """Lunar phases for cosmic timing"""
    NEW_MOON = "new_moon"
    WAXING_CRESCENT = "waxing_crescent"
    FIRST_QUARTER = "first_quarter"
    WAXING_GIBBOUS = "waxing_gibbous"
    FULL_MOON = "full_moon"
    WANING_GIBBOUS = "waning_gibbous"
    LAST_QUARTER = "last_quarter"
    WANING_CRESCENT = "waning_crescent"

@dataclass
class CosmicContext:
    """Real-time cosmic context for playlist generation"""
    lunar_phase: LunarPhase
    current_tarot_influences: List[TarotCardMusicMood]
    personal_year_energy: int
    daily_numerology: int
    seasonal_element: ElementalEnergy
    time_of_day_energy: float  # 0-1 scale
    user_mood_history: List[str]
    recent_activity_patterns: Dict[str, Any]

@dataclass
class AdvancedCosmicPlaylist(CosmicPlaylist):
    """Enhanced playlist with real-time cosmic synchronization"""
    tarot_influences: List[TarotCardMusicMood]
    lunar_resonance: LunarPhase
    synchronicity_score: float  # 0-1 how well aligned with cosmic timing
    mood_evolution_curve: List[float]  # How mood changes through playlist
    chakra_balancing_sequence: List[str]
    binaural_frequencies: List[float]  # Optional healing frequencies
    adaptive_length: bool  # Can adjust based on user's energy
    cosmic_timing_optimal: bool  # Whether this is optimal cosmic timing

class AdvancedCosmicSpotifyEngine(EnhancedSpotifyEngine):
    """Advanced Spotify engine with real-time cosmic intelligence"""
    
    def __init__(self):
        """Initialize with enhanced cosmic algorithms"""
        super().__init__()
        
        # Initialize Azure Key Vault for secure credential management
        self._init_key_vault()
        
        # Enhanced tarot-music mappings
        self.tarot_music_profiles = self._initialize_tarot_music_mappings()
        
        # Lunar phase influence on music
        self.lunar_music_influences = self._initialize_lunar_influences()
        
        # Advanced mood detection keywords
        self.mood_keyword_analysis = self._initialize_mood_analysis()
        
        # Real-time synchronization tracking
        self.active_sessions = {}
        
        logger.info("Advanced Cosmic Spotify Engine initialized")

    def _init_key_vault(self):
        """Initialize Azure Key Vault for secure credential management"""
        try:
            credential = DefaultAzureCredential()
            vault_url = os.getenv('AZURE_KEY_VAULT_URL', 'https://star-platform-vault.vault.azure.net/')
            self.secret_client = SecretClient(vault_url=vault_url, credential=credential)
            
            # Get Spotify credentials from Key Vault
            if not self.client_id:
                spotify_client_id = self.secret_client.get_secret("spotify-client-id")
                self.client_id = spotify_client_id.value
            
            if not self.client_secret:
                spotify_client_secret = self.secret_client.get_secret("spotify-client-secret")
                self.client_secret = spotify_client_secret.value
                
            logger.info("Azure Key Vault integration successful")
            
        except Exception as e:
            logger.warning(f"Key Vault not available, using environment variables: {e}")
            self.secret_client = None

    def _initialize_tarot_music_mappings(self) -> Dict[TarotCardMusicMood, Dict[str, Any]]:
        """Initialize comprehensive tarot card music influences"""
        return {
            TarotCardMusicMood.FOOL_ADVENTURE: {
                'energy': 0.8, 'valence': 0.7, 'tempo': 'upbeat',
                'genres': ['indie', 'folk', 'adventure-soundtrack'],
                'keywords': ['journey', 'freedom', 'exploration', 'new beginnings']
            },
            TarotCardMusicMood.MAGICIAN_POWER: {
                'energy': 0.9, 'valence': 0.8, 'tempo': 'powerful',
                'genres': ['electronic', 'epic-orchestral', 'rock'],
                'keywords': ['manifestation', 'power', 'creation', 'will']
            },
            TarotCardMusicMood.HIGH_PRIESTESS_MYSTERY: {
                'energy': 0.3, 'valence': 0.5, 'tempo': 'mysterious',
                'genres': ['ambient', 'dark-ambient', 'mystical'],
                'keywords': ['intuition', 'mystery', 'subconscious', 'secrets']
            },
            TarotCardMusicMood.EMPRESS_ABUNDANCE: {
                'energy': 0.6, 'valence': 0.8, 'tempo': 'flowing',
                'genres': ['world-music', 'nature-sounds', 'classical'],
                'keywords': ['fertility', 'abundance', 'creativity', 'nature']
            },
            TarotCardMusicMood.EMPEROR_STRENGTH: {
                'energy': 0.7, 'valence': 0.6, 'tempo': 'steady',
                'genres': ['orchestral', 'rock', 'march'],
                'keywords': ['authority', 'structure', 'discipline', 'control']
            },
            TarotCardMusicMood.LOVERS_HARMONY: {
                'energy': 0.5, 'valence': 0.9, 'tempo': 'romantic',
                'genres': ['soul', 'r-n-b', 'love-ballads'],
                'keywords': ['love', 'harmony', 'union', 'relationships']
            },
            TarotCardMusicMood.DEATH_TRANSFORMATION: {
                'energy': 0.4, 'valence': 0.3, 'tempo': 'transformative',
                'genres': ['post-rock', 'ambient', 'cinematic'],
                'keywords': ['transformation', 'ending', 'rebirth', 'change']
            },
            TarotCardMusicMood.STAR_HOPE: {
                'energy': 0.6, 'valence': 0.9, 'tempo': 'uplifting',
                'genres': ['ambient', 'new-age', 'inspirational'],
                'keywords': ['hope', 'guidance', 'inspiration', 'healing']
            },
            TarotCardMusicMood.SUN_JOY: {
                'energy': 0.9, 'valence': 0.95, 'tempo': 'joyful',
                'genres': ['pop', 'reggae', 'upbeat-folk'],
                'keywords': ['joy', 'success', 'vitality', 'celebration']
            }
        }

    def _initialize_lunar_influences(self) -> Dict[LunarPhase, Dict[str, Any]]:
        """Initialize lunar phase music influences"""
        return {
            LunarPhase.NEW_MOON: {
                'energy': 0.2, 'mood': 'introspective', 'intention': 'new_beginnings',
                'genres': ['ambient', 'meditation', 'minimal']
            },
            LunarPhase.WAXING_CRESCENT: {
                'energy': 0.4, 'mood': 'hopeful', 'intention': 'growth',
                'genres': ['indie-folk', 'acoustic', 'gentle-electronic']
            },
            LunarPhase.FIRST_QUARTER: {
                'energy': 0.6, 'mood': 'motivated', 'intention': 'action',
                'genres': ['indie-rock', 'alternative', 'upbeat-folk']
            },
            LunarPhase.WAXING_GIBBOUS: {
                'energy': 0.7, 'mood': 'building', 'intention': 'refinement',
                'genres': ['progressive', 'art-rock', 'complex-electronic']
            },
            LunarPhase.FULL_MOON: {
                'energy': 0.9, 'mood': 'intense', 'intention': 'culmination',
                'genres': ['epic-orchestral', 'powerful-rock', 'intense-electronic']
            },
            LunarPhase.WANING_GIBBOUS: {
                'energy': 0.6, 'mood': 'reflective', 'intention': 'gratitude',
                'genres': ['soul', 'blues', 'contemplative-jazz']
            },
            LunarPhase.LAST_QUARTER: {
                'energy': 0.4, 'mood': 'releasing', 'intention': 'letting_go',
                'genres': ['ambient', 'post-rock', 'healing-music']
            },
            LunarPhase.WANING_CRESCENT: {
                'energy': 0.3, 'mood': 'peaceful', 'intention': 'rest',
                'genres': ['lullabies', 'nature-sounds', 'deep-ambient']
            }
        }

    def _initialize_mood_analysis(self) -> Dict[str, Dict[str, Any]]:
        """Initialize advanced mood detection from user activity"""
        return {
            'energetic': {
                'energy_boost': 0.3, 'valence_boost': 0.2,
                'preferred_genres': ['electronic', 'dance', 'rock']
            },
            'contemplative': {
                'energy_boost': -0.4, 'valence_boost': 0.0,
                'preferred_genres': ['ambient', 'classical', 'post-rock']
            },
            'creative': {
                'energy_boost': 0.1, 'valence_boost': 0.3,
                'preferred_genres': ['indie', 'alternative', 'experimental']
            },
            'stressed': {
                'energy_boost': -0.3, 'valence_boost': -0.1,
                'preferred_genres': ['ambient', 'nature-sounds', 'meditation']
            },
            'social': {
                'energy_boost': 0.2, 'valence_boost': 0.4,
                'preferred_genres': ['pop', 'funk', 'world-music']
            },
            'romantic': {
                'energy_boost': -0.1, 'valence_boost': 0.3,
                'preferred_genres': ['soul', 'r-n-b', 'acoustic']
            }
        }

    async def create_real_time_cosmic_playlist(self, 
                                             user_profile: Dict[str, Any],
                                             cosmic_context: CosmicContext,
                                             session_id: str) -> Optional[AdvancedCosmicPlaylist]:
        """Create a real-time synchronized cosmic playlist"""
        if not self.sp:
            logger.warning("Spotify not available")
            return None

        try:
            # Analyze current cosmic conditions
            cosmic_score = self._calculate_cosmic_synchronicity(cosmic_context)
            
            # Generate enhanced playlist concept
            playlist_concept = await self._generate_advanced_playlist_concept(
                user_profile, cosmic_context, cosmic_score
            )
            
            # Search for cosmically aligned tracks
            tracks = await self._search_cosmically_aligned_tracks(playlist_concept, cosmic_context)
            
            # Create adaptive playlist with real-time features
            playlist = self._create_advanced_cosmic_playlist(
                tracks, playlist_concept, user_profile, cosmic_context
            )
            
            # Register for real-time updates
            self.active_sessions[session_id] = {
                'playlist': playlist,
                'created_at': datetime.now(),
                'user_profile': user_profile,
                'cosmic_context': cosmic_context
            }
            
            logger.info(f"Created advanced cosmic playlist with synchronicity score: {cosmic_score}")
            return playlist
            
        except Exception as e:
            logger.error(f"Failed to create real-time cosmic playlist: {e}")
            return None

    def _calculate_cosmic_synchronicity(self, cosmic_context: CosmicContext) -> float:
        """Calculate how aligned current moment is with cosmic forces"""
        synchronicity_factors = []
        
        # Lunar phase alignment (0.3 weight)
        lunar_energy = self.lunar_music_influences[cosmic_context.lunar_phase]['energy']
        synchronicity_factors.append(lunar_energy * 0.3)
        
        # Time of day energy alignment (0.2 weight)
        time_alignment = abs(cosmic_context.time_of_day_energy - 0.5) * 2  # Convert to 0-1
        synchronicity_factors.append(time_alignment * 0.2)
        
        # Tarot influence strength (0.3 weight)
        if cosmic_context.current_tarot_influences:
            tarot_strength = len(cosmic_context.current_tarot_influences) / 3.0  # Normalize
            synchronicity_factors.append(min(tarot_strength, 1.0) * 0.3)
        
        # Personal numerology alignment (0.2 weight)
        numerology_alignment = self._calculate_numerology_alignment(cosmic_context)
        synchronicity_factors.append(numerology_alignment * 0.2)
        
        return sum(synchronicity_factors)

    def _calculate_numerology_alignment(self, cosmic_context: CosmicContext) -> float:
        """Calculate how aligned personal numbers are with cosmic timing"""
        # This is a simplified calculation - could be much more complex
        daily_num = cosmic_context.daily_numerology
        personal_year = cosmic_context.personal_year_energy
        
        # Check for harmonious number relationships
        if daily_num == personal_year:
            return 1.0
        elif abs(daily_num - personal_year) <= 2:
            return 0.7
        elif daily_num + personal_year == 11 or daily_num + personal_year == 22:
            return 0.9  # Master number combinations
        else:
            return 0.4

    async def _generate_advanced_playlist_concept(self, 
                                                user_profile: Dict[str, Any],
                                                cosmic_context: CosmicContext,
                                                cosmic_score: float) -> Dict[str, Any]:
        """Generate advanced playlist concept with real-time cosmic intelligence"""
        # Base concept from parent class
        base_cosmic_profile = self._analyze_cosmic_music_profile(user_profile)
        
        # Add advanced cosmic intelligence
        enhanced_concept = {
            'name': self._generate_cosmic_synchronized_name(cosmic_context, cosmic_score),
            'description': self._generate_cosmic_synchronized_description(cosmic_context, cosmic_score),
            'target_duration': self._calculate_optimal_duration(cosmic_context),
            'energy_flow': self._design_cosmic_energy_flow(base_cosmic_profile, cosmic_context),
            'search_parameters': self._create_advanced_search_parameters(
                base_cosmic_profile, cosmic_context
            ),
            'cosmic_theme': f"real_time_synchronicity_{cosmic_score:.2f}",
            'tarot_influences': cosmic_context.current_tarot_influences,
            'lunar_phase': cosmic_context.lunar_phase,
            'adaptive_features': {
                'mood_responsive': True,
                'cosmic_timing_aware': True,
                'energy_adaptive': True
            }
        }
        
        return enhanced_concept

    def _generate_cosmic_synchronized_name(self, cosmic_context: CosmicContext, 
                                         cosmic_score: float) -> str:
        """Generate name reflecting current cosmic synchronicity"""
        lunar_names = {
            LunarPhase.NEW_MOON: "New Moon Intentions",
            LunarPhase.WAXING_CRESCENT: "Crescent Dreams",
            LunarPhase.FIRST_QUARTER: "Quarter Moon Power",
            LunarPhase.WAXING_GIBBOUS: "Gibbous Growth",
            LunarPhase.FULL_MOON: "Full Moon Manifestation",
            LunarPhase.WANING_GIBBOUS: "Gratitude Under Gibbous",
            LunarPhase.LAST_QUARTER: "Last Quarter Release",
            LunarPhase.WANING_CRESCENT: "Crescent Surrender"
        }
        
        base_name = lunar_names.get(cosmic_context.lunar_phase, "Cosmic Harmony")
        
        if cosmic_score > 0.8:
            return f"✨ {base_name} - Peak Synchronicity"
        elif cosmic_score > 0.6:
            return f"🌟 {base_name} - High Alignment"
        else:
            return f"🌙 {base_name} - Gentle Flow"

    def _calculate_optimal_duration(self, cosmic_context: CosmicContext) -> int:
        """Calculate optimal playlist duration based on cosmic timing"""
        base_duration = 45  # minutes
        
        # Adjust based on lunar phase
        lunar_adjustments = {
            LunarPhase.NEW_MOON: -10,  # Shorter for introspection
            LunarPhase.FULL_MOON: +15,  # Longer for peak energy
            LunarPhase.WANING_CRESCENT: -15  # Shorter for rest
        }
        
        adjustment = lunar_adjustments.get(cosmic_context.lunar_phase, 0)
        
        # Adjust based on time of day
        if cosmic_context.time_of_day_energy < 0.3:  # Early morning/late night
            adjustment -= 10
        elif cosmic_context.time_of_day_energy > 0.7:  # Peak day hours
            adjustment += 5
        
        return max(20, min(90, base_duration + adjustment))

    def get_real_time_recommendations(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get real-time playlist recommendations for active session"""
        if session_id not in self.active_sessions:
            return None
        
        session = self.active_sessions[session_id]
        time_elapsed = (datetime.now() - session['created_at']).total_seconds() / 60  # minutes
        
        recommendations = {
            'next_tracks': self._predict_next_tracks(session, time_elapsed),
            'mood_adjustments': self._suggest_mood_adjustments(session),
            'cosmic_insights': self._generate_cosmic_insights(session),
            'optimal_timing': self._check_optimal_cosmic_timing(session)
        }
        
        return recommendations

    def _predict_next_tracks(self, session: Dict[str, Any], time_elapsed: float) -> List[Dict[str, Any]]:
        """Predict next tracks based on current playlist progression"""
        playlist = session['playlist']
        expected_track_position = int(time_elapsed / 3.5)  # Assuming ~3.5 min per track
        
        if expected_track_position < len(playlist.tracks):
            return [asdict(track) for track in playlist.tracks[expected_track_position:expected_track_position+3]]
        
        # Generate new tracks if playlist is ending
        return self._generate_continuation_tracks(session)

    def _generate_continuation_tracks(self, session: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate tracks to continue the cosmic journey"""
        # This would implement AI-powered track continuation
        # For now, return placeholder
        return [
            {
                'name': 'Cosmic Continuation Flow',
                'artist': 'Generated',
                'cosmic_reason': 'Maintaining energy alignment based on your current state'
            }
        ]

# Global instance
_advanced_engine = None

def get_advanced_spotify_engine() -> Optional[AdvancedCosmicSpotifyEngine]:
    """Get or create the global advanced Spotify engine instance"""
    global _advanced_engine
    if _advanced_engine is None:
        try:
            _advanced_engine = AdvancedCosmicSpotifyEngine()
        except Exception as e:
            logger.error(f"Failed to initialize advanced Spotify engine: {e}")
            return None
    return _advanced_engine