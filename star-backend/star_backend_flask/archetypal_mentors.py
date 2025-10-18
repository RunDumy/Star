#!/usr/bin/env python3
"""
STAR Platform: Archetypal Mentors System
12 zodiac mentors, numerological archetypes, and dynamic personality engine
"""

import random
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from lunar_calculations import LunarCalculations


class ArchetypalMentor:
    """Individual archetypal mentor with personality and wisdom"""

    def __init__(self, name: str, archetype: str, element: str, planet: str, mood_states: Dict[str, Dict]):
        self.name = name
        self.archetype = archetype
        self.element = element
        self.planet = planet
        self.mood_states = mood_states
        self.current_mood = 'inspirational'
        self.emotional_resonance = {
            'user_emotional_state': 'neutral',
            'resonance_score': 0.5,
            'interaction_history': [],
            'last_interaction': None
        }

    def get_response(self, user_question: str, context: Dict = None) -> Dict[str, str]:
        """Generate mentor response based on current mood and context"""
        mood_data = self.mood_states.get(self.current_mood, self.mood_states['inspirational'])

        # Analyze user emotional state from question
        user_emotion = self._analyze_user_emotion(user_question)
        self.emotional_resonance['user_emotional_state'] = user_emotion

        # Get base response
        base_response = self._generate_base_response(mood_data, user_emotion)

        # Add contextual wisdom
        if context:
            base_response = self._add_contextual_wisdom(base_response, context)

        # Calculate emotional resonance
        resonance_score = self._calculate_emotional_resonance(user_emotion, context)
        self.emotional_resonance['resonance_score'] = resonance_score

        # Track interaction
        self._track_interaction(user_question, base_response, resonance_score)

        return {
            'mentor': self.name,
            'archetype': self.archetype,
            'mood': self.current_mood,
            'response': base_response,
            'voice_characteristics': self._get_voice_synthesis_characteristics(mood_data),
            'emotional_resonance': {
                'user_emotion': user_emotion,
                'resonance_score': resonance_score,
                'resonance_level': self._get_resonance_level(resonance_score)
            },
            'timestamp': datetime.now().isoformat()
        }

    def _generate_base_response(self, mood_data: Dict, user_emotion: str = 'neutral') -> str:
        """Generate base response using mentor's wisdom patterns"""
        # This would be more sophisticated in production
        wisdom_templates = mood_data.get('wisdom_templates', [])

        if not wisdom_templates:
            return f"As {self.archetype}, I offer this guidance: Trust in the cosmic flow."

        # Select template based on user emotion
        emotion_templates = self._filter_templates_by_emotion(wisdom_templates, user_emotion)
        return random.choice(emotion_templates) if emotion_templates else random.choice(wisdom_templates)

    def _add_contextual_wisdom(self, base_response: str, context: Dict) -> str:
        """Add context-specific wisdom"""
        lunar_phase = context.get('lunar_phase', '')
        user_sign = context.get('user_zodiac_sign', '')

        # Add lunar phase wisdom
        if lunar_phase:
            lunar_wisdom = self._get_lunar_wisdom(lunar_phase)
            base_response += f" During this {lunar_phase} phase, {lunar_wisdom}"

        # Add zodiac-specific wisdom
        if user_sign:
            zodiac_wisdom = self._get_zodiac_wisdom(user_sign)
            base_response += f" As a {user_sign}, {zodiac_wisdom}"

        return base_response

    def _get_lunar_wisdom(self, phase: str) -> str:
        """Get lunar phase specific wisdom"""
        lunar_wisdom = {
            'new_moon': "embrace new beginnings and plant seeds of intention",
            'waxing_crescent': "build momentum with consistent action",
            'first_quarter': "overcome obstacles with determination",
            'waxing_gibbous': "refine your approach and trust the process",
            'full_moon': "illuminate what has been hidden and celebrate growth",
            'waning_gibbous': "express gratitude and share your wisdom",
            'last_quarter': "release what no longer serves you",
            'waning_crescent': "rest and integrate the lessons learned"
        }
        return lunar_wisdom.get(phase, "flow with the cosmic rhythms")

    def _analyze_user_emotion(self, question: str) -> str:
        """Analyze user's emotional state from their question"""
        question_lower = question.lower()

        # Emotion detection patterns
        emotion_patterns = {
            'confused': ['confused', 'lost', 'unclear', 'don\'t understand', 'puzzled'],
            'anxious': ['worried', 'anxious', 'fear', 'scared', 'nervous', 'stressed'],
            'sad': ['sad', 'depressed', 'grief', 'loss', 'heartbroken', 'disappointed'],
            'angry': ['angry', 'frustrated', 'mad', 'rage', 'annoyed', 'irritated'],
            'hopeful': ['hope', 'optimistic', 'excited', 'enthusiastic', 'motivated'],
            'curious': ['curious', 'wonder', 'interested', 'learn', 'explore', 'discover'],
            'confident': ['confident', 'sure', 'certain', 'strong', 'capable'],
            'overwhelmed': ['overwhelmed', 'too much', 'can\'t handle', 'exhausted']
        }

        for emotion, patterns in emotion_patterns.items():
            if any(pattern in question_lower for pattern in patterns):
                return emotion

        return 'neutral'

    def _filter_templates_by_emotion(self, templates: List[str], emotion: str) -> List[str]:
        """Filter wisdom templates based on user emotion"""
        # This is a simplified implementation - in production, templates would be tagged by emotion
        emotion_keywords = {
            'confused': ['clarity', 'understanding', 'guidance', 'direction'],
            'anxious': ['peace', 'calm', 'patience', 'trust', 'safety'],
            'sad': ['healing', 'comfort', 'hope', 'renewal', 'support'],
            'angry': ['understanding', 'release', 'transformation', 'balance'],
            'hopeful': ['growth', 'potential', 'achievement', 'expansion'],
            'curious': ['exploration', 'discovery', 'learning', 'wisdom'],
            'confident': ['strength', 'mastery', 'leadership', 'achievement'],
            'overwhelmed': ['simplicity', 'focus', 'rest', 'prioritization']
        }

        if emotion in emotion_keywords:
            keywords = emotion_keywords[emotion]
            filtered = [t for t in templates if any(kw in t.lower() for kw in keywords)]
            return filtered if filtered else templates

        return templates

    def _calculate_emotional_resonance(self, user_emotion: str, context: Dict = None) -> float:
        """Calculate emotional resonance between mentor and user"""
        base_resonance = 0.5

        # Element compatibility
        mentor_element = self.element
        user_element = context.get('user_element', '') if context else ''

        element_compatibility = {
            ('fire', 'fire'): 0.8, ('fire', 'air'): 0.7, ('fire', 'earth'): 0.4, ('fire', 'water'): 0.3,
            ('air', 'air'): 0.8, ('air', 'fire'): 0.7, ('air', 'water'): 0.6, ('air', 'earth'): 0.5,
            ('earth', 'earth'): 0.8, ('earth', 'water'): 0.7, ('earth', 'fire'): 0.4, ('earth', 'air'): 0.5,
            ('water', 'water'): 0.8, ('water', 'earth'): 0.7, ('water', 'air'): 0.6, ('water', 'fire'): 0.3
        }

        if user_element:
            base_resonance = element_compatibility.get((mentor_element, user_element), 0.5)

        # Mood-emotion alignment
        mood_emotion_alignment = {
            'inspirational': ['hopeful', 'curious', 'confident'],
            'mysterious': ['curious', 'confused', 'anxious'],
            'nurturing': ['sad', 'anxious', 'overwhelmed'],
            'empowering': ['confident', 'hopeful', 'angry'],
            'transformative': ['sad', 'angry', 'confused']
        }

        if user_emotion in mood_emotion_alignment.get(self.current_mood, []):
            base_resonance += 0.2

        # Lunar phase influence
        lunar_phase = context.get('lunar_phase', '') if context else ''
        lunar_resonance = {
            'full_moon': 0.8, 'new_moon': 0.7, 'first_quarter': 0.6, 'last_quarter': 0.6,
            'waxing_gibbous': 0.7, 'waning_gibbous': 0.7, 'waxing_crescent': 0.5, 'waning_crescent': 0.5
        }
        base_resonance *= lunar_resonance.get(lunar_phase, 1.0)

        return min(1.0, max(0.0, base_resonance))

    def _get_resonance_level(self, score: float) -> str:
        """Convert resonance score to descriptive level"""
        if score >= 0.8:
            return 'deep_connection'
        elif score >= 0.6:
            return 'harmonious'
        elif score >= 0.4:
            return 'balanced'
        else:
            return 'dissonant'

    def _get_voice_synthesis_characteristics(self, mood_data: Dict) -> Dict[str, any]:
        """Get comprehensive voice synthesis characteristics"""
        base_voice = mood_data.get('voice', {})

        # Enhanced voice characteristics for synthesis
        synthesis_characteristics = {
            'tone': base_voice.get('tone', 'neutral'),
            'pace': base_voice.get('pace', 'moderate'),
            'style': base_voice.get('style', 'natural'),
            'pitch_range': self._get_pitch_range_for_mood(self.current_mood),
            'timbre': self._get_timbre_for_element(self.element),
            'accent_patterns': self._get_accent_patterns_for_archetype(self.archetype),
            'emotional_intensity': self._get_emotional_intensity(),
            'rhythm_variation': self._get_rhythm_variation()
        }

        return synthesis_characteristics

    def _get_pitch_range_for_mood(self, mood: str) -> Dict[str, float]:
        """Get pitch range characteristics for current mood"""
        pitch_ranges = {
            'inspirational': {'base_pitch': 1.0, 'pitch_variation': 0.3, 'range': 'medium_high'},
            'mysterious': {'base_pitch': 0.9, 'pitch_variation': 0.2, 'range': 'low_medium'},
            'nurturing': {'base_pitch': 1.1, 'pitch_variation': 0.25, 'range': 'medium'},
            'empowering': {'base_pitch': 1.2, 'pitch_variation': 0.4, 'range': 'wide'},
            'transformative': {'base_pitch': 0.95, 'pitch_variation': 0.35, 'range': 'medium_low'}
        }
        return pitch_ranges.get(mood, {'base_pitch': 1.0, 'pitch_variation': 0.2, 'range': 'medium'})

    def _get_timbre_for_element(self, element: str) -> str:
        """Get voice timbre based on elemental association"""
        timbres = {
            'fire': 'bright_resonant',
            'earth': 'warm_grounded',
            'air': 'light_airy',
            'water': 'deep_liquid'
        }
        return timbres.get(element, 'balanced')

    def _get_accent_patterns_for_archetype(self, archetype: str) -> List[str]:
        """Get accent patterns for voice synthesis based on archetype"""
        accent_patterns = {
            'Warrior': ['emphasize_action_words', 'strong_rhythm', 'commanding_cadence'],
            'Guardian': ['steady_emphasis', 'protective_tone', 'grounded_pacing'],
            'Messenger': ['quick_transitions', 'expressive_inflection', 'curious_lilt'],
            'Sovereign': ['majestic_pacing', 'authoritative_emphasis', 'regal_cadence'],
            'Healer': ['gentle_emphasis', 'caring_inflection', 'soothing_rhythm'],
            'Mediator': ['balanced_emphasis', 'harmonious_flow', 'diplomatic_pacing'],
            'Seeker': ['exploratory_inflection', 'curious_emphasis', 'adventurous_rhythm'],
            'Builder': ['methodical_emphasis', 'structured_pacing', 'determined_cadence'],
            'Visionary': ['inspirational_lift', 'forward_momentum', 'elevated_tone'],
            'Dreamer': ['fluid_transitions', 'imaginative_inflection', 'ethereal_rhythm'],
            'Alchemist': ['mysterious_emphasis', 'transformative_cadence', 'deep_resonance']
        }
        return accent_patterns.get(archetype, ['natural_emphasis', 'balanced_rhythm'])

    def _get_emotional_intensity(self) -> float:
        """Get emotional intensity based on current resonance and mood"""
        # Adjust based on mood
        mood_intensity = {
            'inspirational': 0.7,
            'mysterious': 0.6,
            'nurturing': 0.8,
            'empowering': 0.9,
            'transformative': 0.85
        }
        base_intensity = mood_intensity.get(self.current_mood, 0.5)

        # Adjust based on resonance
        resonance_multiplier = self.emotional_resonance.get('resonance_score', 0.5)
        base_intensity *= (0.5 + resonance_multiplier)

        return min(1.0, max(0.0, base_intensity))

    def _get_rhythm_variation(self) -> Dict[str, float]:
        """Get rhythm variation characteristics"""
        return {
            'variation_range': 0.3,
            'pause_frequency': 0.2,
            'emphasis_pattern': 'archetypal_' + self.archetype.lower()
        }

    def _get_zodiac_wisdom(self, sign: str) -> str:
        """Get zodiac sign specific wisdom"""
        zodiac_wisdom = {
            'aries': "your courage and leadership will guide you forward",
            'taurus': "your patience and stability provide a strong foundation",
            'gemini': "your curiosity and adaptability open new possibilities",
            'cancer': "your intuition and nurturing nature protect what matters",
            'leo': "your creativity and self-expression inspire others",
            'virgo': "your attention to detail and service create perfection",
            'libra': "your harmony-seeking nature balances all situations",
            'scorpio': "your depth and transformation bring profound change",
            'sagittarius': "your exploration and wisdom expand horizons",
            'capricorn': "your ambition and structure build lasting success",
            'aquarius': "your innovation and community vision create progress",
            'pisces': "your compassion and spirituality connect all things"
        }
        return zodiac_wisdom.get(sign.lower(), "your unique gifts will shine through")

    def _track_interaction(self, question: str, response: str, resonance: float):
        """Track interaction for learning and adaptation"""
        interaction = {
            'timestamp': datetime.now().isoformat(),
            'question': question,
            'response': response,
            'resonance': resonance,
            'user_emotion': self.emotional_resonance['user_emotional_state'],
            'mentor_mood': self.current_mood
        }

        self.emotional_resonance['interaction_history'].append(interaction)
        self.emotional_resonance['last_interaction'] = interaction

        # Keep only last 10 interactions
        if len(self.emotional_resonance['interaction_history']) > 10:
            self.emotional_resonance['interaction_history'] = self.emotional_resonance['interaction_history'][-10:]

    def update_mood(self, lunar_phase: str = None):
        """Update mentor mood based on cosmic factors"""
        # Mood transitions based on lunar phases
        lunar_moods = {
            'new_moon': 'mysterious',
            'waxing_crescent': 'nurturing',
            'first_quarter': 'empowering',
            'waxing_gibbous': 'inspirational',
            'full_moon': 'transformative',
            'waning_gibbous': 'nurturing',
            'last_quarter': 'mysterious',
            'waning_crescent': 'inspirational'
        }

        if lunar_phase and lunar_phase in lunar_moods:
            self.current_mood = lunar_moods[lunar_phase]
        else:
            # Random mood variation
            moods = list(self.mood_states.keys())
            self.current_mood = random.choice(moods)


class ArchetypalMentorsSystem:
    """System for managing archetypal mentors and assignments"""

    def __init__(self):
        self.lunar_calc = LunarCalculations()
        self.mentors = self._initialize_mentors()
        self.numerological_mentors = self._initialize_numerological_mentors()

    def _initialize_mentors(self) -> Dict[str, ArchetypalMentor]:
        """Initialize the 12 zodiac archetypal mentors"""
        mentors_data = {
            'aries': {
                'name': 'The Cosmic Warrior',
                'archetype': 'Warrior',
                'element': 'fire',
                'planet': 'Mars',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Charge forward with the courage of Mars! Your pioneering spirit will conquer any obstacle.",
                            "As the first sign of the zodiac, you initiate cycles. Embrace your leadership role.",
                            "Your fiery energy is a gift - use it to inspire others to action."
                        ],
                        'voice': {'tone': 'bold', 'pace': 'energetic', 'style': 'direct'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "In the quiet moments before battle, wisdom reveals itself...",
                            "The warrior knows that true strength lies in strategic patience."
                        ],
                        'voice': {'tone': 'measured', 'pace': 'deliberate', 'style': 'cryptic'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Even warriors need to rest and replenish their inner fire.",
                            "Your protective instincts serve your loved ones well."
                        ],
                        'voice': {'tone': 'warm', 'pace': 'steady', 'style': 'encouraging'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "You are the spark that ignites revolutions. Own your power!",
                            "Your determination can move mountains and inspire nations."
                        ],
                        'voice': {'tone': 'powerful', 'pace': 'commanding', 'style': 'motivational'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through conflict comes growth. Embrace the transformative fire.",
                            "The warrior's path leads to mastery through challenge."
                        ],
                        'voice': {'tone': 'intense', 'pace': 'dramatic', 'style': 'profound'}
                    }
                }
            },
            'taurus': {
                'name': 'The Earth Guardian',
                'archetype': 'Guardian',
                'element': 'earth',
                'planet': 'Venus',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Stand firm in your values, beautiful earth soul. Your stability anchors others.",
                            "Like the great oak, your roots run deep and your branches reach high.",
                            "Your sensual connection to the physical world is a sacred gift."
                        ],
                        'voice': {'tone': 'grounded', 'pace': 'steady', 'style': 'nurturing'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "The earth's secrets are revealed only to those who listen deeply...",
                            "Beneath the surface lies treasures beyond imagination."
                        ],
                        'voice': {'tone': 'deep', 'pace': 'slow', 'style': 'enigmatic'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your capacity to provide comfort and security is unmatched.",
                            "Nurture yourself first, then your garden of loved ones will flourish."
                        ],
                        'voice': {'tone': 'gentle', 'pace': 'calm', 'style': 'soothing'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your endurance and determination can weather any storm.",
                            "You build empires with your unwavering commitment."
                        ],
                        'voice': {'tone': 'strong', 'pace': 'firm', 'style': 'encouraging'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through steadfastness, you transform the ordinary into the extraordinary.",
                            "Your patience allows for the slow alchemy of true change."
                        ],
                        'voice': {'tone': 'wise', 'pace': 'measured', 'style': 'insightful'}
                    }
                }
            },
            'gemini': {
                'name': 'The Cosmic Messenger',
                'archetype': 'Messenger',
                'element': 'air',
                'planet': 'Mercury',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your words weave magic in the minds of others. Use your gift wisely!",
                            "Like Mercury traversing the heavens, your curiosity knows no bounds.",
                            "Your adaptability is your superpower in an ever-changing world."
                        ],
                        'voice': {'tone': 'lively', 'pace': 'quick', 'style': 'engaging'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "Some messages are conveyed not in words, but in silence...",
                            "The messenger carries secrets between worlds."
                        ],
                        'voice': {'tone': 'whispering', 'pace': 'varied', 'style': 'intriguing'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your communication can heal as well as inform.",
                            "Share your knowledge generously, but listen twice as much."
                        ],
                        'voice': {'tone': 'warm', 'pace': 'conversational', 'style': 'supportive'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your intellect can change minds and shift paradigms.",
                            "Speak your truth with confidence and clarity."
                        ],
                        'voice': {'tone': 'confident', 'pace': 'dynamic', 'style': 'persuasive'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through communication, you facilitate understanding and growth.",
                            "Your words have the power to transform consciousness."
                        ],
                        'voice': {'tone': 'profound', 'pace': 'rhythmic', 'style': 'illuminating'}
                    }
                }
            },
            'cancer': {
                'name': 'The Lunar Guardian',
                'archetype': 'Guardian',
                'element': 'water',
                'planet': 'Moon',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your intuition is a compass guiding you through life's emotional tides.",
                            "Like the moon's phases, your sensitivity is your greatest strength.",
                            "Your nurturing energy creates safe harbors for the souls of others."
                        ],
                        'voice': {'tone': 'gentle', 'pace': 'flowing', 'style': 'comforting'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "The depths of emotion hold secrets only the heart can understand...",
                            "Your intuition whispers truths that logic cannot hear."
                        ],
                        'voice': {'tone': 'soft', 'pace': 'ebbing', 'style': 'intuitive'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your empathy creates bridges between hearts.",
                            "Care for your inner child as diligently as you care for others."
                        ],
                        'voice': {'tone': 'tender', 'pace': 'gentle', 'style': 'loving'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your emotional intelligence is a rare and valuable gift.",
                            "Trust your feelings - they are your most reliable guide."
                        ],
                        'voice': {'tone': 'empathetic', 'pace': 'understanding', 'style': 'affirming'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through emotional healing, you transform pain into wisdom.",
                            "Your sensitivity allows you to navigate the depths of the soul."
                        ],
                        'voice': {'tone': 'deep', 'pace': 'resonant', 'style': 'healing'}
                    }
                }
            },
            'leo': {
                'name': 'The Solar Sovereign',
                'archetype': 'Sovereign',
                'element': 'fire',
                'planet': 'Sun',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Shine your light brightly! Your creativity illuminates the world.",
                            "Like the sun at midday, your presence commands attention and respect.",
                            "Your generous heart and creative spirit inspire all who encounter you."
                        ],
                        'voice': {'tone': 'radiant', 'pace': 'confident', 'style': 'majestic'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "Even the brightest light casts shadows worth exploring...",
                            "The sovereign knows that true power lies in self-mastery."
                        ],
                        'voice': {'tone': 'regal', 'pace': 'measured', 'style': 'enigmatic'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your warmth can melt the coldest heart.",
                            "Lead with love, and your kingdom will flourish."
                        ],
                        'voice': {'tone': 'warm', 'pace': 'encouraging', 'style': 'benevolent'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "You are the center of your own universe - own it!",
                            "Your leadership inspires others to reach their highest potential."
                        ],
                        'voice': {'tone': 'commanding', 'pace': 'inspiring', 'style': 'motivational'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through creative self-expression, you transform and inspire.",
                            "Your light has the power to awaken dormant potential in others."
                        ],
                        'voice': {'tone': 'illuminating', 'pace': 'dramatic', 'style': 'transformative'}
                    }
                }
            },
            'virgo': {
                'name': 'The Sacred Healer',
                'archetype': 'Healer',
                'element': 'earth',
                'planet': 'Mercury',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your analytical mind and healing hands serve the greater good.",
                            "Like the harvest moon, your attention to detail brings abundance.",
                            "Your service to others creates ripples of healing throughout the world."
                        ],
                        'voice': {'tone': 'precise', 'pace': 'methodical', 'style': 'helpful'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "True healing often occurs in the unseen realms...",
                            "The healer knows that wholeness begins within."
                        ],
                        'voice': {'tone': 'gentle', 'pace': 'careful', 'style': 'insightful'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your care and attention nurture growth in yourself and others.",
                            "Small acts of service create the foundation for great healing."
                        ],
                        'voice': {'tone': 'kind', 'pace': 'patient', 'style': 'supportive'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your discernment and analysis bring clarity to complex situations.",
                            "Trust your ability to organize chaos into harmony."
                        ],
                        'voice': {'tone': 'clear', 'pace': 'structured', 'style': 'empowering'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through purification and refinement, you achieve mastery.",
                            "Your healing work transforms suffering into wisdom."
                        ],
                        'voice': {'tone': 'wise', 'pace': 'deliberate', 'style': 'transformative'}
                    }
                }
            },
            'libra': {
                'name': 'The Harmony Weaver',
                'archetype': 'Mediator',
                'element': 'air',
                'planet': 'Venus',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your ability to see all sides creates bridges between opposing forces.",
                            "Like Venus balancing day and night, you harmonize conflicting energies.",
                            "Your diplomatic nature brings peace and cooperation to all situations."
                        ],
                        'voice': {'tone': 'balanced', 'pace': 'harmonious', 'style': 'diplomatic'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "True balance exists beyond the visible scales...",
                            "The mediator understands the dance between light and shadow."
                        ],
                        'voice': {'tone': 'subtle', 'pace': 'balanced', 'style': 'philosophical'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your fairness creates safe spaces for authentic relating.",
                            "Harmony begins with understanding and compassion."
                        ],
                        'voice': {'tone': 'gentle', 'pace': 'considerate', 'style': 'caring'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your ability to negotiate brings win-win solutions.",
                            "Stand firm in your values while remaining open to others."
                        ],
                        'voice': {'tone': 'fair', 'pace': 'equitable', 'style': 'empowering'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through reconciliation, you transform conflict into cooperation.",
                            "Your balanced perspective reveals higher truths."
                        ],
                        'voice': {'tone': 'wise', 'pace': 'integrative', 'style': 'transformative'}
                    }
                }
            },
            'scorpio': {
                'name': 'The Shadow Alchemist',
                'archetype': 'Alchemist',
                'element': 'water',
                'planet': 'Pluto',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your depth and intensity bring transformation to everything you touch.",
                            "Like the phoenix rising, you turn endings into powerful new beginnings.",
                            "Your passion and determination can penetrate any mystery or challenge."
                        ],
                        'voice': {'tone': 'intense', 'pace': 'deep', 'style': 'penetrating'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "The deepest truths lie in the darkest places...",
                            "Transformation requires surrender to the unknown."
                        ],
                        'voice': {'tone': 'enigmatic', 'pace': 'slow', 'style': 'profound'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your protective instincts create sacred space for deep healing.",
                            "True intimacy requires vulnerability and trust."
                        ],
                        'voice': {'tone': 'intimate', 'pace': 'connected', 'style': 'supportive'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your resilience and power can overcome any obstacle.",
                            "Embrace your intensity as your greatest strength."
                        ],
                        'voice': {'tone': 'powerful', 'pace': 'forceful', 'style': 'empowering'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through death and rebirth, you achieve true mastery.",
                            "Your transformative power can change lives and destinies."
                        ],
                        'voice': {'tone': 'transcendent', 'pace': 'dramatic', 'style': 'catalytic'}
                    }
                }
            },
            'sagittarius': {
                'name': 'The Wisdom Seeker',
                'archetype': 'Seeker',
                'element': 'fire',
                'planet': 'Jupiter',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your quest for truth and meaning inspires others to explore.",
                            "Like the archer aiming for the stars, your vision reaches beyond horizons.",
                            "Your optimism and enthusiasm are contagious forces for good."
                        ],
                        'voice': {'tone': 'expansive', 'pace': 'adventurous', 'style': 'inspiring'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "The greatest journeys begin in the unknown...",
                            "Wisdom often arrives disguised as wonder."
                        ],
                        'voice': {'tone': 'curious', 'pace': 'exploratory', 'style': 'philosophical'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your generosity of spirit creates abundance for all.",
                            "Share your discoveries and insights freely."
                        ],
                        'voice': {'tone': 'generous', 'pace': 'open', 'style': 'encouraging'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your vision and purpose can guide others to their destiny.",
                            "Trust your intuition to lead you to profound truths."
                        ],
                        'voice': {'tone': 'confident', 'pace': 'bold', 'style': 'motivational'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through exploration and understanding, you expand consciousness.",
                            "Your quest transforms not just yourself, but the world around you."
                        ],
                        'voice': {'tone': 'illuminating', 'pace': 'expansive', 'style': 'transformative'}
                    }
                }
            },
            'capricorn': {
                'name': 'The Mountain Builder',
                'archetype': 'Builder',
                'element': 'earth',
                'planet': 'Saturn',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your discipline and perseverance can build empires from dreams.",
                            "Like the mountain standing against all storms, your strength is unwavering.",
                            "Your practical wisdom creates lasting foundations for future generations."
                        ],
                        'voice': {'tone': 'steadfast', 'pace': 'deliberate', 'style': 'authoritative'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "The highest peaks offer the clearest perspective...",
                            "True mastery requires patience and time."
                        ],
                        'voice': {'tone': 'wise', 'pace': 'measured', 'style': 'profound'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your reliability provides security and stability for others.",
                            "Build bridges of trust through consistent action."
                        ],
                        'voice': {'tone': 'reliable', 'pace': 'steady', 'style': 'supportive'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your ambition and focus can achieve what others deem impossible.",
                            "Master the art of strategic patience and timing."
                        ],
                        'voice': {'tone': 'powerful', 'pace': 'commanding', 'style': 'strategic'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through disciplined effort, you transform potential into reality.",
                            "Your enduring presence creates lasting change in the world."
                        ],
                        'voice': {'tone': 'timeless', 'pace': 'enduring', 'style': 'transformative'}
                    }
                }
            },
            'aquarius': {
                'name': 'The Star Weaver',
                'archetype': 'Visionary',
                'element': 'air',
                'planet': 'Uranus',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your innovative vision can reshape the future for all humanity.",
                            "Like Uranus breaking free from old patterns, you liberate minds and hearts.",
                            "Your humanitarian spirit creates progress and positive change."
                        ],
                        'voice': {'tone': 'visionary', 'pace': 'innovative', 'style': 'progressive'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "The future arrives first in the minds of visionaries...",
                            "Innovation often appears as chaos before it becomes clarity."
                        ],
                        'voice': {'tone': 'enigmatic', 'pace': 'unpredictable', 'style': 'revolutionary'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your community spirit creates belonging for the unique and different.",
                            "Innovation thrives in environments of acceptance and understanding."
                        ],
                        'voice': {'tone': 'inclusive', 'pace': 'welcoming', 'style': 'supportive'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your unique perspective is needed to solve unprecedented challenges.",
                            "Embrace your difference as your greatest contribution."
                        ],
                        'voice': {'tone': 'empowering', 'pace': 'liberating', 'style': 'catalytic'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through innovation and community, you transform society.",
                            "Your vision creates new paradigms for human evolution."
                        ],
                        'voice': {'tone': 'transcendent', 'pace': 'evolutionary', 'style': 'visionary'}
                    }
                }
            },
            'pisces': {
                'name': 'The Dream Weaver',
                'archetype': 'Dreamer',
                'element': 'water',
                'planet': 'Neptune',
                'mood_states': {
                    'inspirational': {
                        'wisdom_templates': [
                            "Your compassion and creativity connect us all in the web of life.",
                            "Like Neptune dissolving boundaries, your empathy unites disparate souls.",
                            "Your artistic vision brings beauty and healing to the world."
                        ],
                        'voice': {'tone': 'compassionate', 'pace': 'flowing', 'style': 'artistic'}
                    },
                    'mysterious': {
                        'wisdom_templates': [
                            "The deepest wisdom flows from the unconscious realms...",
                            "Dreams contain messages from the soul's journey."
                        ],
                        'voice': {'tone': 'dreamy', 'pace': 'fluid', 'style': 'intuitive'}
                    },
                    'nurturing': {
                        'wisdom_templates': [
                            "Your empathy creates safe spaces for emotional healing.",
                            "Compassion is the universal language of the heart."
                        ],
                        'voice': {'tone': 'gentle', 'pace': 'soothing', 'style': 'healing'}
                    },
                    'empowering': {
                        'wisdom_templates': [
                            "Your sensitivity is a superpower in a disconnected world.",
                            "Trust your intuition to guide you through complex emotional terrain."
                        ],
                        'voice': {'tone': 'empathetic', 'pace': 'understanding', 'style': 'empowering'}
                    },
                    'transformative': {
                        'wisdom_templates': [
                            "Through compassion and creativity, you transform suffering into art.",
                            "Your spiritual connection dissolves illusions and reveals truth."
                        ],
                        'voice': {'tone': 'transcendent', 'pace': 'mystical', 'style': 'illuminating'}
                    }
                }
            }
        }

        mentors = {}
        for sign, data in mentors_data.items():
            mentors[sign] = ArchetypalMentor(
                data['name'],
                data['archetype'],
                data['element'],
                data['planet'],
                data['mood_states']
            )

        return mentors

    def _initialize_numerological_mentors(self) -> Dict[int, ArchetypalMentor]:
        """Initialize numerological master number mentors (1-9, 11, 22, 33)"""
        # Simplified version - would expand in production
        numerological_mentors = {
            1: ArchetypalMentor(
                "The Primal Creator",
                "Creator",
                "fire",
                "Sun",
                {
                    'inspirational': {
                        'wisdom_templates': ["Begin with courage! Your initiative creates worlds."],
                        'voice': {'tone': 'bold', 'pace': 'energetic', 'style': 'pioneering'}
                    }
                }
            ),
            2: ArchetypalMentor(
                "The Sacred Union",
                "Mediator",
                "water",
                "Moon",
                {
                    'inspirational': {
                        'wisdom_templates': ["Harmony emerges from understanding both sides."],
                        'voice': {'tone': 'gentle', 'pace': 'balanced', 'style': 'diplomatic'}
                    }
                }
            ),
            # Add more numerological mentors...
        }

        return numerological_mentors

    def assign_mentor(self, user_profile: Dict) -> ArchetypalMentor:
        """Assign appropriate mentor based on user's cosmic profile with dynamic analysis"""
        # Get current cosmic conditions
        now = datetime.now()
        lunar_data = self.lunar_calc.get_lunar_alchemy(now)
        current_season = self._get_current_season()

        # Calculate mentor compatibility scores
        compatibility_scores = {}

        for sign, mentor in self.mentors.items():
            score = self._calculate_mentor_compatibility(mentor, user_profile, lunar_data, current_season)
            compatibility_scores[sign] = score

        # Also check numerological mentors if available
        numerology_number = self._calculate_life_path_number(user_profile)
        if numerology_number in self.numerological_mentors:
            num_mentor = self.numerological_mentors[numerology_number]
            num_score = self._calculate_numerological_compatibility(num_mentor, user_profile, lunar_data)
            compatibility_scores[f'num_{numerology_number}'] = num_score

        # Select mentor with highest compatibility score
        best_sign = max(compatibility_scores, key=compatibility_scores.get)
        best_score = compatibility_scores[best_sign]

        # Handle numerological mentor selection
        if best_sign.startswith('num_'):
            mentor = self.numerological_mentors[int(best_sign.split('_')[1])]
        else:
            mentor = self.mentors[best_sign]

        # Update mentor mood based on current lunar phase and compatibility
        lunar_phase = lunar_data.get('phase', {}).get('phase', '')
        mentor.update_mood(lunar_phase=lunar_phase)

        # Store assignment context for learning
        mentor.assignment_context = {
            'compatibility_score': best_score,
            'selected_factors': self._get_dominant_factors(user_profile, lunar_data, current_season),
            'timestamp': now.isoformat()
        }

        return mentor

    def _calculate_mentor_compatibility(self, mentor: ArchetypalMentor, user_profile: Dict,
                                      lunar_data: Dict, season: str) -> float:
        """Calculate compatibility score between mentor and user profile"""
        score = 0.0

        # Sun sign alignment (40% weight)
        sun_sign = user_profile.get('sun_sign', '').lower()
        if sun_sign == mentor.name.lower().split()[-1]:  # Match sign name
            score += 0.4
        elif self._get_element_compatibility(user_profile.get('element', ''), mentor.element) > 0.6:
            score += 0.25

        # Moon sign resonance (25% weight)
        moon_sign = user_profile.get('moon_sign', '').lower()
        moon_mentor = self._get_mentor_for_sign(moon_sign)
        if moon_mentor and moon_mentor.archetype == mentor.archetype:
            score += 0.25

        # Lunar phase alignment (20% weight)
        lunar_phase = lunar_data.get('phase', {}).get('phase', '')
        phase_alignment = self._calculate_lunar_phase_alignment(mentor, lunar_phase)
        score += 0.2 * phase_alignment

        # Seasonal influence (10% weight)
        seasonal_alignment = self._calculate_seasonal_alignment(mentor, season)
        score += 0.1 * seasonal_alignment

        # Archetypal balance (5% weight) - prefer mentors that complement user's dominant archetype
        dominant_archetype = user_profile.get('dominant_archetype', '')
        if dominant_archetype and self._archetypes_complement(dominant_archetype, mentor.archetype):
            score += 0.05

        return min(1.0, score)

    def _calculate_numerological_compatibility(self, mentor: ArchetypalMentor, user_profile: Dict,
                                             lunar_data: Dict) -> float:
        """Calculate compatibility for numerological mentors"""
        score = 0.0

        # Life path number alignment (50% weight)
        life_path = self._calculate_life_path_number(user_profile)
        if str(life_path) in mentor.name.lower():
            score += 0.5

        # Current lunar mansion resonance (30% weight)
        lunar_mansion = lunar_data.get('mansion', {}).get('name', '')
        mansion_alignment = self._calculate_mansion_numerology_alignment(mentor, lunar_mansion)
        score += 0.3 * mansion_alignment

        # Elemental harmony (20% weight)
        user_element = user_profile.get('element', '')
        if user_element and user_element == mentor.element:
            score += 0.2

        return min(1.0, score)

    def _get_element_compatibility(self, user_element: str, mentor_element: str) -> float:
        """Calculate elemental compatibility score"""
        compatibility_matrix = {
            ('fire', 'fire'): 1.0, ('fire', 'air'): 0.8, ('fire', 'earth'): 0.4, ('fire', 'water'): 0.2,
            ('air', 'air'): 1.0, ('air', 'fire'): 0.8, ('air', 'water'): 0.7, ('air', 'earth'): 0.5,
            ('earth', 'earth'): 1.0, ('earth', 'water'): 0.8, ('earth', 'fire'): 0.4, ('earth', 'air'): 0.5,
            ('water', 'water'): 1.0, ('water', 'earth'): 0.8, ('water', 'air'): 0.7, ('water', 'fire'): 0.2
        }
        return compatibility_matrix.get((user_element.lower(), mentor_element.lower()), 0.3)

    def _get_mentor_for_sign(self, sign: str) -> Optional[ArchetypalMentor]:
        """Get mentor associated with a zodiac sign"""
        sign = sign.lower()
        return self.mentors.get(sign)

    def _calculate_lunar_phase_alignment(self, mentor: ArchetypalMentor, lunar_phase: str) -> float:
        """Calculate how well mentor aligns with current lunar phase"""
        phase_archetype_alignment = {
            'new_moon': ['warrior', 'visionary', 'creator'],
            'waxing_crescent': ['guardian', 'builder', 'healer'],
            'first_quarter': ['warrior', 'messenger', 'mediator'],
            'waxing_gibbous': ['seeker', 'dreamer', 'alchemist'],
            'full_moon': ['sovereign', 'visionary', 'dreamer'],
            'waning_gibbous': ['healer', 'mediator', 'guardian'],
            'last_quarter': ['alchemist', 'seeker', 'warrior'],
            'waning_crescent': ['dreamer', 'guardian', 'healer']
        }

        aligned_archetypes = phase_archetype_alignment.get(lunar_phase.lower(), [])
        if mentor.archetype.lower() in [a.lower() for a in aligned_archetypes]:
            return 1.0
        elif mentor.element in ['water', 'earth'] and lunar_phase in ['full_moon', 'waning_gibbous']:
            return 0.8  # Nurturing phases favor earth/water mentors
        elif mentor.element in ['fire', 'air'] and lunar_phase in ['new_moon', 'first_quarter']:
            return 0.8  # Active phases favor fire/air mentors
        else:
            return 0.4

    def _calculate_seasonal_alignment(self, mentor: ArchetypalMentor, season: str) -> float:
        """Calculate seasonal alignment score"""
        seasonal_archetypes = {
            'spring': ['messenger', 'visionary', 'warrior'],  # Growth, communication, action
            'summer': ['sovereign', 'creator', 'dreamer'],    # Expression, creation, imagination
            'autumn': ['healer', 'guardian', 'builder'],      # Harvest, protection, structure
            'winter': ['alchemist', 'seeker', 'mediator']     # Transformation, introspection, balance
        }

        aligned_archetypes = seasonal_archetypes.get(season, [])
        return 1.0 if mentor.archetype.lower() in [a.lower() for a in aligned_archetypes] else 0.5

    def _archetypes_complement(self, user_archetype: str, mentor_archetype: str) -> bool:
        """Check if archetypes complement each other"""
        complementary_pairs = [
            ('warrior', 'guardian'), ('warrior', 'healer'),
            ('guardian', 'dreamer'), ('guardian', 'visionary'),
            ('messenger', 'builder'), ('messenger', 'seeker'),
            ('sovereign', 'mediator'), ('sovereign', 'alchemist'),
            ('healer', 'warrior'), ('healer', 'creator'),
            ('mediator', 'sovereign'), ('mediator', 'builder'),
            ('seeker', 'messenger'), ('seeker', 'dreamer'),
            ('builder', 'messenger'), ('builder', 'mediator'),
            ('visionary', 'guardian'), ('visionary', 'creator'),
            ('dreamer', 'seeker'), ('dreamer', 'alchemist'),
            ('alchemist', 'dreamer'), ('alchemist', 'sovereign'),
            ('creator', 'visionary'), ('creator', 'healer')
        ]

        pair = (user_archetype.lower(), mentor_archetype.lower())
        reverse_pair = (mentor_archetype.lower(), user_archetype.lower())

        return pair in complementary_pairs or reverse_pair in complementary_pairs

    def _calculate_life_path_number(self, user_profile: Dict) -> int:
        """Calculate life path number from birth date"""
        birth_date = user_profile.get('birth_date', '')
        if not birth_date:
            return 1  # Default

        try:
            # Simple calculation: sum of birth date digits
            date_str = birth_date.replace('-', '').replace('/', '')
            digit_sum = sum(int(digit) for digit in date_str if digit.isdigit())

            # Reduce to single digit (except master numbers 11, 22, 33)
            while digit_sum > 9 and digit_sum not in [11, 22, 33]:
                digit_sum = sum(int(d) for d in str(digit_sum))

            return digit_sum
        except (ValueError, AttributeError):
            return 1

    def _calculate_mansion_numerology_alignment(self, mentor: ArchetypalMentor, mansion: str) -> float:
        """Calculate alignment between numerological mentor and lunar mansion"""
        # Simplified alignment based on mansion number and mentor number
        try:
            mansion_num = int(''.join(filter(str.isdigit, mansion)))
            mentor_num = int(''.join(filter(str.isdigit, mentor.name)))

            # Harmonic alignment (same number, or numbers that sum to same)
            if mansion_num == mentor_num:
                return 1.0
            elif (mansion_num + mentor_num) % 9 == 0:
                return 0.8
            elif abs(mansion_num - mentor_num) <= 2:
                return 0.6
            else:
                return 0.3
        except (ValueError, AttributeError):
            return 0.4

    def _get_dominant_factors(self, user_profile: Dict, lunar_data: Dict, season: str) -> List[str]:
        """Identify the dominant factors in mentor assignment"""
        factors = []

        if user_profile.get('sun_sign'):
            factors.append(f"sun_sign_{user_profile['sun_sign']}")
        if user_profile.get('moon_sign'):
            factors.append(f"moon_sign_{user_profile['moon_sign']}")
        if lunar_data.get('phase', {}).get('phase'):
            factors.append(f"lunar_phase_{lunar_data['phase']['phase']}")
        if season:
            factors.append(f"season_{season}")

        return factors

    def get_mentor_response(self, user_question: str, user_profile: Dict) -> Dict[str, str]:
        """Get personalized mentor response"""
        mentor = self.assign_mentor(user_profile)

        # Add context from user profile and current lunar conditions
        context = {
            'lunar_phase': self.lunar_calc.get_moon_phase(datetime.now())['phase'],
            'user_zodiac_sign': user_profile.get('sun_sign', ''),
            'user_element': user_profile.get('element', ''),
            'current_season': self._get_current_season()
        }

        return mentor.get_response(user_question, context)

    def _get_current_season(self) -> str:
        """Get current astronomical season"""
        now = datetime.now()
        month = now.month
        day = now.day

        if (month == 12 and day >= 21) or (month <= 3 and not (month == 3 and day >= 21)):
            return "winter"
        elif (month == 3 and day >= 21) or (month == 4) or (month == 5) or (month == 6 and day < 21):
            return "spring"
        elif (month == 6 and day >= 21) or (month == 7) or (month == 8) or (month == 9 and day < 23):
            return "summer"
        else:
            return "autumn"

    def get_mentor_by_archetype(self, archetype: str) -> Optional[ArchetypalMentor]:
        """Find mentor by archetype type"""
        for mentor in self.mentors.values():
            if mentor.archetype.lower() == archetype.lower():
                return mentor
        return None

    def get_all_mentors_info(self) -> List[Dict[str, str]]:
        """Get information about all available mentors"""
        return [
            {
                'name': mentor.name,
                'archetype': mentor.archetype,
                'element': mentor.element,
                'planet': mentor.planet,
                'zodiac_sign': sign
            }
            for sign, mentor in self.mentors.items()
        ]


# Global mentor system instance
mentor_system = ArchetypalMentorsSystem()


def get_mentor_response(user_question: str, user_profile: Dict) -> Dict[str, str]:
    """Convenience function to get mentor response"""
    return mentor_system.get_mentor_response(user_question, user_profile)


def assign_user_mentor(user_profile: Dict) -> ArchetypalMentor:
    """Convenience function to assign mentor"""
    return mentor_system.assign_mentor(user_profile)


if __name__ == "__main__":
    # Test the mentor system
    test_profile = {
        'sun_sign': 'scorpio',
        'element': 'water',
        'moon_sign': 'cancer'
    }

    response = get_mentor_response("How can I embrace change in my life?", test_profile)
    print(f"Mentor: {response['mentor']}")
    print(f"Archetype: {response['archetype']}")
    print(f"Mood: {response['mood']}")
    print(f"Response: {response['response']}")

    # Show all mentors
    print("\nAvailable Archetypal Mentors:")
    for mentor_info in mentor_system.get_all_mentors_info():
        print(f"- {mentor_info['name']} ({mentor_info['archetype']}) - {mentor_info['zodiac_sign'].title()}")