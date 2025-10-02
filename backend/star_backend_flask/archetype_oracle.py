# -*- coding: utf-8 -*-
"""
Archetype Oracle Module for Star App
Integrates numerology, tarot, and planetary archetypes into a unified symbolic system
"""

import logging
from datetime import datetime
import random
from typing import Dict, Optional, List, Tuple
from numerology import NumerologyCalculator
import math
import json
try:
    from swisseph import swe_const, swe_data, swe_dat, swe_day_data, swe_get_planet_name, swe_get_tid_acc, swe_pheno_ut, swe_calc_ut, swe_julday
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False

logger = logging.getLogger(__name__)

class ArchetypeOracle:
    """Unified symbolic intelligence system combining numerology, tarot, and planetary archetypes"""

    # Tarot Major Arcana mapping to numerology numbers
    TAROT_ARCANA = {
        1: {'card': 'The Magician', 'meaning': 'Manifestation, willpower, resourcefulness', 'shadow': 'Manipulation, lack of focus'},
        2: {'card': 'The High Priestess', 'meaning': 'Intuition, mystery, inner wisdom', 'shadow': 'Secrecy, disconnection'},
        3: {'card': 'The Empress', 'meaning': 'Creativity, abundance, nurturing', 'shadow': 'Overbearing, stagnation'},
        4: {'card': 'The Emperor', 'meaning': 'Authority, structure, leadership', 'shadow': 'Rigidity, control'},
        5: {'card': 'The Hierophant', 'meaning': 'Tradition, guidance, conformity', 'shadow': 'Dogmatism, rebellion'},
        6: {'card': 'The Lovers', 'meaning': 'Harmony, relationships, choices', 'shadow': 'Conflict, indecision'},
        7: {'card': 'The Chariot', 'meaning': 'Determination, control, progress', 'shadow': 'Aggression, lack of direction'},
        8: {'card': 'Strength', 'meaning': 'Courage, inner strength, compassion', 'shadow': 'Self-doubt, weakness'},
        9: {'card': 'The Hermit', 'meaning': 'Introspection, wisdom, solitude', 'shadow': 'Isolation, withdrawal'},
        11: {'card': 'Justice', 'meaning': 'Fairness, truth, balance', 'shadow': 'Injustice, bias'},
        22: {'card': 'The Fool', 'meaning': 'Spontaneity, new beginnings, freedom', 'shadow': 'Recklessness, naivety'},
        33: {'card': 'The Star', 'meaning': 'Hope, inspiration, healing', 'shadow': 'Despair, disconnection'}
    }

    # Planetary and elemental correspondences
    PLANETARY_CORRESPONDENCES = {
        1: {'planet': 'Sun', 'element': 'Fire', 'color': 'Gold', 'sound': 'A', 'geometry': 'Circle'},
        2: {'planet': 'Moon', 'element': 'Water', 'color': 'Silver', 'sound': 'G#', 'geometry': 'Crescent'},
        3: {'planet': 'Jupiter', 'element': 'Fire', 'color': 'Purple', 'sound': 'F#', 'geometry': 'Triangle'},
        4: {'planet': 'Saturn', 'element': 'Earth', 'color': 'Brown', 'sound': 'D', 'geometry': 'Square'},
        5: {'planet': 'Mercury', 'element': 'Air', 'color': 'Yellow', 'sound': 'E', 'geometry': 'Pentagram'},
        6: {'planet': 'Venus', 'element': 'Earth', 'color': 'Rose Gold', 'sound': 'F', 'geometry': 'Hexagram'},
        7: {'planet': 'Neptune', 'element': 'Water', 'color': 'Indigo', 'sound': 'G', 'geometry': 'Spiral'},
        8: {'planet': 'Mars', 'element': 'Fire', 'color': 'Red', 'sound': 'C', 'geometry': 'Octagon'},
        9: {'planet': 'Uranus', 'element': 'Air', 'color': 'Electric Blue', 'sound': 'B', 'geometry': 'Nonagon'},
        11: {'planet': 'Sun', 'element': 'Fire', 'color': 'White Gold', 'sound': 'A#', 'geometry': 'Star'},
        22: {'planet': 'Uranus', 'element': 'Air', 'color': 'Silver Blue', 'sound': 'B', 'geometry': 'Double Circle'},
        33: {'planet': 'Neptune', 'element': 'Water', 'color': 'Aquamarine', 'sound': 'G#', 'geometry': 'Triskelion'}
    }

    # Karmic debt rituals
    KARMIC_RITUALS = {
        13: {'ritual': 'Meditate on discipline, write a daily schedule to ground your energy.'},
        14: {'ritual': 'Practice moderation, journal about balance in your life.'},
        16: {'ritual': 'Visualize releasing ego, meditate with a candle to embrace humility.'},
        19: {'ritual': 'Reflect on independence, create a vision board for personal goals.'}
    }

    # Journal prompts
    JOURNAL_PROMPTS = {
        1: 'What new beginnings are you ready to manifest today?',
        2: 'How can you trust your intuition to guide your next step?',
        3: 'What creative project or nurturing act brings you joy?',
        4: 'How can you create structure to support your goals?',
        5: 'What does freedom mean to you in this moment?',
        6: 'How can you foster harmony in your relationships?',
        7: 'What drives your determination to move forward?',
        8: 'Where can you find strength to overcome a challenge?',
        9: 'What wisdom can you gain from solitude today?',
        11: 'How can you seek balance and truth in your decisions?',
        22: 'What bold leap are you ready to take?',
        33: 'What inspires hope and healing in your life today?'
    }

    # Word Grimoire: Lexical layer for poetic output
    WORD_GRIMOIRE = {
        'The Sun': {
            'core_term': 'The Sun',
            'essence': ['Illumination', 'Clarity', 'Vitality', 'Consciousness', 'Success', 'Apotheosis'],
            'ritual_synonyms': [
                {'term': 'Radiance', 'context': 'Solar glory, emanation, benevolent power.', 'tone': 'Neutral/Positive'},
                {'term': 'Gnosis', 'context': 'Inward, mystical knowing; direct revelation.', 'tone': 'Mystical', 'tradition': ['Gnostic', 'Hermetic']},
                {'term': 'Inner Fire', 'context': 'Personal vitality, willpower, creative spark.', 'tone': 'Empowering', 'element': 'Fire'},
                {'term': 'The Divine Spark', 'context': 'The fragment of the divine within; ultimate potential.', 'tone': 'Transcendent'}
            ],
            'symbolic_actions': ['to illuminate', 'to reveal', 'to bless', 'to awaken'],
            'archetypal_phrases': [
                'The veil is burned away by solar fire.',
                'Clarity descends like a noon-day sun.',
                'What was hidden is now brought into the light.'
            ],
            'shadow_aspects': ['Blinding Pride', 'Scorching Truth', 'Burning Exposure']
        },
        'The Moon': {
            'core_term': 'The Moon',
            'essence': ['Intuition', 'The Unconscious', 'Dreams', 'Illusion', 'Fluidity', 'Mystery'],
            'ritual_synonyms': [
                {'term': 'The Subconscious Sea', 'context': 'The deep, unknowable realm of feelings and memories.', 'tone': 'Mysterious'},
                {'term': 'The Astral Light', 'context': 'The imaginative, reflective plane; the realm of spirits.', 'tone': 'Esoteric', 'tradition': ['Hermetic', 'Theosophical']},
                {'term': 'The Reflective Pool', 'context': 'Intuition as a surface that shows images, but not always truth.', 'tone': 'Poetic'}
            ],
            'symbolic_actions': ['to reflect', 'to dream', 'to intuit', 'to conceal', 'to ebb and flow'],
            'archetypal_phrases': [
                'Gaze into the reflective pool of the soul.',
                'Shadows dance in the uncertain light.',
                'A message from the deep wells of memory.'
            ],
            'shadow_aspects': ['Deception', 'Fog of Confusion', 'Unfounded Fear']
        },
        'The Journey': {
            'core_term': 'The Journey',
            'essence': ['Beginning', 'Potential', 'Innocence', 'The Unknown'],
            'ritual_synonyms': [
                {'term': 'The Labyrinth', 'context': 'A sacred, initiatory path with a center; a purposeful puzzle.', 'tone': 'Mythic'},
                {'term': 'The Maze', 'context': 'A confusing, trapping puzzle; a test of wit.', 'tone': 'Challenging'},
                {'term': 'The Pilgrimage', 'context': 'A journey with a sacred destination; devotion in motion.', 'tone': 'Reverent'},
                {'term': 'The Spiral', 'context': 'A journey that cycles back at a higher level; evolutionary.', 'tone': 'Cosmic'}
            ],
            'symbolic_actions': ['to embark', 'to leap', 'to wander', 'to descend', 'to ascend'],
            'archetypal_phrases': [
                'The first step is taken onto an unseen path.',
                'All journeys begin at the edge of the known.',
                'The path winds inward before it leads upward.'
            ],
            'shadow_aspects': ['Aimless Wandering', 'Reckless Leap', 'Lost in the Unknown']
        },
        'Water': {
            'core_term': 'Water',
            'essence': ['Emotion', 'Flow', 'Healing', 'Intuition', 'Depth', 'Adaptability'],
            'ritual_synonyms': [
                {'term': 'The Chalice', 'context': 'A vessel of emotional and spiritual nourishment.', 'tone': 'Sacred'},
                {'term': 'The Tide', 'context': 'The cyclical, unstoppable movement of feelings.', 'tone': 'Dynamic'},
                {'term': 'The Wellspring', 'context': 'The source of life and intuitive wisdom.', 'tone': 'Mystical', 'tradition': ['Hermetic', 'Kabbalistic']}
            ],
            'symbolic_actions': ['to flow', 'to heal', 'to cleanse', 'to merge', 'to reflect'],
            'archetypal_phrases': [
                'The chalice overflows with the waters of the soul.',
                'Emotions ebb and flow like the eternal tide.',
                'From the wellspring rises your deepest truth.'
            ],
            'shadow_aspects': ['Overwhelm', 'Stagnation', 'Emotional Flood']
        },
        'The Empress': {
            'core_term': 'The Empress',
            'essence': ['Creativity', 'Abundance', 'Nurturing', 'Fertility', 'Harmony'],
            'ritual_synonyms': [
                {'term': 'The Great Mother', 'context': 'The nurturing force of creation and care.', 'tone': 'Reverent'},
                {'term': 'The Verdant Queen', 'context': 'The embodiment of growth and natural abundance.', 'tone': 'Poetic'},
                {'term': 'The Source', 'context': 'The origin of all life and creative potential.', 'tone': 'Cosmic', 'tradition': ['Hermetic', 'Theosophical']}
            ],
            'symbolic_actions': ['to nurture', 'to create', 'to flourish', 'to harmonize'],
            'archetypal_phrases': [
                'The Verdant Queen weaves abundance from the heart.',
                'Creation blooms where the Great Mother treads.',
                'Nurture the seed, and harmony will grow.'
            ],
            'shadow_aspects': ['Overbearing Control', 'Stifled Growth', 'Excess']
        }
    }

    @staticmethod
    def generate_cosmic_profile(full_name: str, birth_date: datetime, tradition: Optional[str] = None) -> Dict:
        """Generate a comprehensive cosmic profile with numerology, tarot, and planetary correspondences"""
        try:
            numerology = NumerologyCalculator.calculate_comprehensive_readings(full_name, birth_date)
            profile = {
                'numerology': numerology,
                'tarot': {},
                'planetary': {},
                'archetypal_persona': {},
                'poetic_scrolls': {}
            }

            for key in ['life_path', 'destiny', 'soul_urge', 'personality', 'birth_day']:
                number = numerology[key].get('number')
                if number:
                    profile['tarot'][key] = ArchetypeOracle.TAROT_ARCANA.get(number, {})
                    profile['planetary'][key] = ArchetypeOracle.PLANETARY_CORRESPONDENCES.get(number, {})
                    profile['archetypal_persona'][key] = ArchetypeOracle._generate_persona(key, number, profile['tarot'][key])
                    planet = profile['planetary'][key].get('planet')
                    tarot_card = profile['tarot'][key].get('card')
                    element = profile['planetary'][key].get('element')
                    grimoire_key = tarot_card or planet or element
                    if grimoire_key in ArchetypeOracle.WORD_GRIMOIRE:
                        term = ArchetypeOracle._select_lexical_term(ArchetypeOracle.WORD_GRIMOIRE[grimoire_key], tradition=tradition)
                        phrase = ArchetypeOracle._select_archetypal_phrase(ArchetypeOracle.WORD_GRIMOIRE[grimoire_key])
                        profile['poetic_scrolls'][key] = f"You embody {term['term']} in your {key.replace('_', ' ').title()}. {phrase}"
                    else:
                        profile['poetic_scrolls'][key] = f"You walk the path of {profile['archetypal_persona'][key]}."

            return profile
        except Exception as e:
            logger.error(f"Error generating cosmic profile: {e}")
            return {'error': 'Failed to generate cosmic profile'}

    @staticmethod
    def _select_lexical_term(grimoire_entry: Dict, tone: str = 'Neutral/Positive', tradition: Optional[str] = None) -> Dict:
        """Select a context-appropriate term from the grimoire"""
        synonyms = [s for s in grimoire_entry['ritual_synonyms'] if tone in s['tone'] or s['tone'] == 'Neutral/Positive']
        if tradition:
            synonyms = [s for s in synonyms if 'tradition' not in s or tradition in s.get('tradition', [])]
        return random.choice(synonyms) if synonyms else grimoire_entry['ritual_synonyms'][0]

    @staticmethod
    def _select_archetypal_phrase(grimoire_entry: Dict) -> str:
        """Select a random archetypal phrase"""
        return random.choice(grimoire_entry['archetypal_phrases'])

    @staticmethod
    def _generate_persona(key: str, number: int, tarot: Dict) -> str:
        """Generate a poetic archetypal persona title"""
        key_map = {
            'life_path': 'Pathwalker',
            'destiny': 'Destined',
            'soul_urge': 'Soul',
            'personality': 'Presence',
            'birth_day': 'Born'
        }
        tarot_card = tarot.get('card', 'Unknown').replace('The ', '')
        return f"The {tarot_card} {key_map.get(key, 'Unknown')} ({number})"

    @staticmethod
    def generate_symbolic_spread(full_name: str, birth_date: datetime, cards: Optional[list] = None, tradition: Optional[str] = None) -> Dict:
        """Generate a symbolic tarot spread with numerological interpretation"""
        try:
            numerology = NumerologyCalculator.calculate_comprehensive_readings(full_name, birth_date)
            spread = {
                'past': {'card': None, 'interpretation': ''},
                'present': {'card': None, 'interpretation': ''},
                'future': {'card': None, 'interpretation': ''}
            }

            # Use provided cards or randomly select
            selected_cards = cards if cards else random.sample(list(ArchetypeOracle.TAROT_ARCANA.keys()), 3)

            for i, position in enumerate(['past', 'present', 'future']):
                number = selected_cards[i]
                card = ArchetypeOracle.TAROT_ARCANA.get(number, {})
                grimoire_key = card.get('card')
                if grimoire_key in ArchetypeOracle.WORD_GRIMOIRE:
                    term = ArchetypeOracle._select_lexical_term(ArchetypeOracle.WORD_GRIMOIRE[grimoire_key], tone='Neutral/Positive', tradition=tradition)
                    phrase = ArchetypeOracle._select_archetypal_phrase(ArchetypeOracle.WORD_GRIMOIRE[grimoire_key])
                    interpretation = (
                        f"{card.get('card', 'Unknown')} ({number}) embodies {term['term']} in your {position}. "
                        f"{phrase} Beware the shadow: {random.choice(ArchetypeOracle.WORD_GRIMOIRE[grimoire_key]['shadow_aspects'])}."
                    )
                else:
                    interpretation = (
                        f"{card.get('card', 'Unknown')} ({number}) resonates with your Life Path {numerology['life_path']['number']}. "
                        f"In the {position}, this suggests {card.get('meaning', 'unknown energies')}. "
                        f"Beware the shadow: {card.get('shadow', 'unknown challenges')}."
                    )
                spread[position] = {'card': card, 'interpretation': interpretation}

            return {'spread': spread, 'numerology_reference': numerology['life_path']}
        except Exception as e:
            logger.error(f"Error generating symbolic spread: {e}")
            return {'error': 'Failed to generate symbolic spread'}

    @staticmethod
    def generate_resonance_map(full_name: str, birth_date: datetime, tradition: Optional[str] = None) -> Dict:
        """Generate a resonance map with colors, sounds, and geometries"""
        try:
            numerology = NumerologyCalculator.calculate_comprehensive_readings(full_name, birth_date)
            resonance_map = {}
            for key in ['life_path', 'destiny', 'soul_urge', 'personality', 'birth_day']:
                number = numerology[key].get('number')
                if number:
                    resonance_map[key] = ArchetypeOracle.PLANETARY_CORRESPONDENCES.get(number, {})
                    resonance_map[key]['number'] = number
                    element = resonance_map[key].get('element')
                    if element in ArchetypeOracle.WORD_GRIMOIRE:
                        term = ArchetypeOracle._select_lexical_term(ArchetypeOracle.WORD_GRIMOIRE[element], tradition=tradition)
                        resonance_map[key]['poetic_description'] = f"Your {key.replace('_', ' ').title()} flows as {term['term']}."
                    if numerology[key].get('karmic_debt'):
                        resonance_map[key]['karmic_ritual'] = ArchetypeOracle.KARMIC_RITUALS.get(
                            numerology[key]['karmic_debt']['reduces_to'], {}
                        )
            return resonance_map
        except Exception as e:
            logger.error(f"Error generating resonance map: {e}")
            return {'error': 'Failed to generate resonance map'}

    @staticmethod
    def calculate_personal_cycle(birth_date: datetime, current_date: Optional[datetime] = None, tradition: Optional[str] = None) -> Dict:
        """Calculate personal year and daily vibrational theme"""
        try:
            current_date = current_date or datetime.now()
            personal_year = sum(int(d) for d in f"{birth_date.month}{birth_date.day}{current_date.year}")
            personal_year = NumerologyCalculator.reduce_number(personal_year)

            # Daily vibration based on current date
            daily_number = sum(int(d) for d in f"{current_date.month}{current_date.day}{current_date.year}")
            daily_number = NumerologyCalculator.reduce_number(daily_number)

            daily_card = ArchetypeOracle.TAROT_ARCANA.get(daily_number, {})
            card_name = daily_card.get('card', 'unknown energies')
            meaning = daily_card.get('meaning', "the day's flow")

            return {
                'personal_year': {
                    'number': personal_year,
                    'meaning': NumerologyCalculator.NUMBER_MEANINGS.get(personal_year, {}),
                    'tarot': ArchetypeOracle.TAROT_ARCANA.get(personal_year, {})
                },
                'daily_vibration': {
                    'number': daily_number,
                    'meaning': NumerologyCalculator.NUMBER_MEANINGS.get(daily_number, {}),
                    'tarot': daily_card,
                    'message': f"Today vibrates with {card_name} ({daily_number}). Embrace {meaning}."
                }
            }
        except Exception as e:
            logger.error(f"Error calculating personal cycle: {e}")
            return {'error': 'Failed to calculate personal cycle'}

    @staticmethod
    def get_karmic_insights(full_name: str, birth_date: datetime) -> Dict:
        """Generate karmic insights based on detected karmic debt numbers"""
        try:
            numerology = NumerologyCalculator.calculate_comprehensive_readings(full_name, birth_date)
            insights = []
            for key in ['life_path', 'destiny', 'soul_urge', 'personality', 'birth_day']:
                if numerology[key].get('karmic_debt'):
                    debt = numerology[key]['karmic_debt']
                    number = numerology[key]['number']
                    tarot = ArchetypeOracle.TAROT_ARCANA.get(number, {})
                    ritual = ArchetypeOracle.KARMIC_RITUALS.get(debt['reduces_to'], {}).get('ritual', 'Reflect and meditate.')
                    tarot_card = tarot.get('card', 'unknown archetype')
                    tarot_meaning = tarot.get('meaning', 'transformation')

                    message = f"Karmic Debt {debt['reduces_to']} in {key.replace('_', ' ').title()}: {debt['lesson']}. Linked to {tarot_card}, embrace {tarot_meaning}."

                    insights.append({
                        'number': debt['reduces_to'],
                        'lesson': debt['lesson'],
                        'tarot': tarot,
                        'ritual': ritual,
                        'message': message
                    })
            return {'karmic_insights': insights} if insights else {'karmic_insights': [], 'message': 'No karmic debt detected.'}
        except Exception as e:
            logger.error(f"Error generating karmic insights: {e}")
            return {'error': 'Failed to generate karmic insights'}

    @staticmethod
    def calculate_public_oracle(full_name: str, birth_date: str, tradition: Optional[str] = None) -> Dict:
        """Generate a public archetype oracle reading"""
        try:
            birth_date_dt = datetime.fromisoformat(birth_date)
            profile = ArchetypeOracle.generate_cosmic_profile(full_name, birth_date_dt, tradition)
            spread = ArchetypeOracle.generate_symbolic_spread(full_name, birth_date_dt, tradition=tradition)
            resonance = ArchetypeOracle.generate_resonance_map(full_name, birth_date_dt, tradition)
            cycle = ArchetypeOracle.calculate_personal_cycle(birth_date_dt, tradition=tradition)
            karmic = ArchetypeOracle.get_karmic_insights(full_name, birth_date_dt)

            return {
                'cosmic_profile': profile,
                'symbolic_spread': spread,
                'resonance_map': resonance,
                'cycle_tracker': cycle,
                'karmic_insights': karmic,
                'user_info': {'full_name': full_name, 'birth_date': birth_date, 'tradition': tradition}
            }
        except Exception as e:
            logger.error(f"Error generating public oracle: {e}")
            return {'error': 'Failed to generate public oracle reading'}


class CosmicArchetypeOracle(ArchetypeOracle):
    """Enhanced oracle with cosmic UI integration and emotional resonance"""

    # Cosmic color mappings for UI integration
    COSMIC_COLORS = {
        'The Sun': {'primary': '#FACC15', 'secondary': '#FEF08A', 'glow': 'rgba(250, 204, 21, 0.3)'},
        'The Moon': {'primary': '#E2E8F0', 'secondary': '#CBD5E1', 'glow': 'rgba(226, 232, 240, 0.2)'},
        'The Empress': {'primary': '#F472B6', 'secondary': '#F9A8D4', 'glow': 'rgba(244, 114, 182, 0.25)'},
        'Water': {'primary': '#60A5FA', 'secondary': '#93C5FD', 'glow': 'rgba(96, 165, 250, 0.25)'},
        'The Journey': {'primary': '#A78BFA', 'secondary': '#C4B5FD', 'glow': 'rgba(167, 139, 250, 0.25)'}
    }

    # Emotional resonance frequencies
    EMOTIONAL_FREQUENCIES = {
        'activating': ['courage', 'creativity', 'expression', 'leadership'],
        'receptive': ['intuition', 'dreams', 'reflection', 'healing'],
        'grounding': ['stability', 'nurturing', 'manifestation', 'abundance'],
        'flowing': ['adaptability', 'emotion', 'connection', 'release'],
        'transforming': ['beginnings', 'potential', 'spontaneity', 'freedom']
    }

    @staticmethod
    def generate_cosmic_ui_profile(full_name: str, birth_date: datetime, tradition: Optional[str] = None) -> Dict:
        """Generate a UI-ready cosmic profile with Tailwind classes and emotional resonance"""
        try:
            base_profile = super(CosmicArchetypeOracle, CosmicArchetypeOracle).generate_cosmic_profile(full_name, birth_date, tradition)

            # Enhance with cosmic UI elements
            cosmic_profile = {
                **base_profile,
                'cosmic_ui': {},
                'emotional_resonance': {},
                'tailwind_classes': {}
            }

            for key in ['life_path', 'destiny', 'soul_urge', 'personality', 'birth_day']:
                number = base_profile['numerology'][key].get('number')
                if number:
                    tarot_card = base_profile['tarot'][key].get('card')
                    planet = base_profile['planetary'][key].get('planet')

                    # Generate cosmic UI properties
                    cosmic_profile['cosmic_ui'][key] = CosmicArchetypeOracle._generate_cosmic_ui_properties(
                        tarot_card, planet, number
                    )

                    # Generate emotional resonance
                    cosmic_profile['emotional_resonance'][key] = CosmicArchetypeOracle._generate_emotional_resonance(
                        tarot_card, planet
                    )

                    # Generate Tailwind classes
                    cosmic_profile['tailwind_classes'][key] = CosmicArchetypeOracle._generate_tailwind_classes(
                        tarot_card, planet
                    )

            return cosmic_profile
        except Exception as e:
            logger.error(f"Error generating cosmic UI profile: {e}")
            return {'error': 'Failed to generate cosmic UI profile'}

    @staticmethod
    def _generate_cosmic_ui_properties(tarot_card: str, planet: str, number: int) -> Dict:
        """Generate UI properties for cosmic elements"""
        card_colors = CosmicArchetypeOracle.COSMIC_COLORS.get(tarot_card, {
            'primary': '#FACC15',
            'secondary': '#FEF08A',
            'glow': 'rgba(250, 204, 21, 0.3)'
        })

        return {
            'colors': card_colors,
            'animation': f'pulse-{number % 4 + 1}',
            'gradient': f'bg-gradient-to-br from-{card_colors["primary"]} to-{card_colors["secondary"]}',
            'glow_effect': f'0 0 20px {card_colors["glow"]}',
            'constellation_pattern': CosmicArchetypeOracle._generate_constellation_pattern(number)
        }

    @staticmethod
    def _generate_emotional_resonance(tarot_card: str, planet: str) -> Dict:
        """Generate emotional resonance mapping"""
        # Map cards to emotional frequencies
        emotional_map = {
            'The Sun': 'activating',
            'The Moon': 'receptive',
            'The Empress': 'grounding',
            'Water': 'flowing',
            'The Journey': 'transforming'
        }

        frequency = emotional_map.get(tarot_card, 'activating')
        emotions = CosmicArchetypeOracle.EMOTIONAL_FREQUENCIES.get(frequency, [])

        return {
            'frequency': frequency,
            'primary_emotions': emotions[:2],
            'secondary_emotions': emotions[2:],
            'resonance_strength': random.randint(70, 95),  # Percentage
            'harmony_suggestion': CosmicArchetypeOracle._generate_harmony_suggestion(frequency)
        }

    @staticmethod
    def _generate_tailwind_classes(tarot_card: str, planet: str) -> Dict:
        """Generate Tailwind CSS classes for cosmic elements"""
        color_map = {
            'The Sun': 'yellow',
            'The Moon': 'slate',
            'The Empress': 'pink',
            'Water': 'blue',
            'The Journey': 'purple'
        }

        color = color_map.get(tarot_card, 'yellow')

        return {
            'card_bg': f'bg-void border border-{color}-400',
            'text_color': f'text-starlight',
            'accent_color': f'text-{color}-400',
            'button_classes': f'bg-{color}-400 text-void hover:bg-{color}-300 transition transform hover:scale-105',
            'glow_effect': f'shadow-{color}-400/50'
        }

    @staticmethod
    def _generate_constellation_pattern(number: int) -> str:
        """Generate constellation pattern based on number"""
        patterns = {
            1: "M10,10 L20,5 L30,15 L25,25 L15,20 Z",  # Star
            2: "M10,15 L20,5 L30,15 L20,25 Z",  # Diamond
            3: "M5,15 L15,5 L25,15 L15,25 Z",  # Triangle
            4: "M5,5 L25,5 L25,25 L5,25 Z",  # Square
            5: "M15,5 L25,10 L20,20 L10,20 L5,10 Z",  # Pentagon
        }
        return patterns.get(number, patterns[1])

    @staticmethod
    def _generate_harmony_suggestion(frequency: str) -> str:
        """Generate harmony suggestions for emotional frequencies"""
        suggestions = {
            'activating': "Channel your energy into creative projects. Move, express, create.",
            'receptive': "Listen to your dreams and intuition. Still waters run deep.",
            'grounding': "Connect with nature. Nurture yourself and others.",
            'flowing': "Go with the flow. Release what no longer serves you.",
            'transforming': "Embrace new beginnings. Trust the journey."
        }
        return suggestions.get(frequency, "Find balance in stillness and movement.")

    @staticmethod
    def generate_cosmic_meditation(full_name: str, birth_date: datetime, focus: str = "balance") -> Dict:
        """Generate personalized cosmic meditation based on archetypes"""
        try:
            profile = super(CosmicArchetypeOracle, CosmicArchetypeOracle).generate_cosmic_profile(full_name, birth_date)
            life_path_card = profile['tarot']['life_path'].get('card', 'The Journey')
            planetary_ruler = profile['planetary']['life_path'].get('planet', 'Sun')

            return {
                'meditation_theme': f"Harmonizing {life_path_card} with {planetary_ruler}",
                'visualization': CosmicArchetypeOracle._generate_visualization_script(life_path_card, planetary_ruler, focus),
                'breath_pattern': CosmicArchetypeOracle._generate_breath_pattern(profile['numerology']['life_path']['number']),
                'duration_minutes': max(5, profile['numerology']['life_path']['number']),
                'archetype_anchor': CosmicArchetypeOracle._generate_archetype_anchor(life_path_card)
            }
        except Exception as e:
            logger.error(f"Error generating cosmic meditation: {e}")
            return {'error': 'Failed to generate cosmic meditation'}

    @staticmethod
    def _generate_visualization_script(card: str, planet: str, focus: str) -> str:
        """Generate guided visualization script"""
        scripts = {
            'The Sun': f"Visualize a golden sun at your heart center, radiating {focus} throughout your being...",
            'The Moon': f"Imagine a silver moon reflecting the wisdom of {focus} in your intuitive waters...",
            'The Empress': f"Envision a lush garden where {focus} blossoms in every living thing around you...",
            'Water': f"Go with the flow as {focus} carries you like a gentle river through your experience...",
            'The Journey': f"See yourself walking a starlit path where each step brings deeper {focus}..."
        }
        return scripts.get(card, f"Visualize a sphere of light bringing {focus} to your entire being...")

    @staticmethod
    def _generate_breath_pattern(life_path_number: int) -> str:
        """Generate breath pattern based on life path number"""
        patterns = {
            1: "4-4-4 (equal inhale, hold, exhale)",
            2: "4-2-6 (inhale, short hold, longer exhale)",
            3: "4-1-2-1 (creative rhythm)",
            4: "5-5-5 (structured, stable)",
            5: "3-1-3 (quick, freeing)",
            6: "4-4-6 (harmonious, nurturing)",
            7: "4-7-8 (intuitive, mystical)",
            8: "4-2-4 (powerful, focused)",
            9: "4-2-6-2 (complete, transformative)"
        }
        return patterns.get(life_path_number, "4-4-4")

    @staticmethod
    def _generate_archetype_anchor(card: str) -> str:
        """Generate archetype anchor phrase for meditation"""
        anchors = {
            'The Sun': "I am radiant clarity and conscious will",
            'The Moon': "I trust my intuition and inner wisdom",
            'The Empress': "I create beauty and nurture growth",
            'Water': "I flow with grace and emotional truth",
            'The Journey': "I embrace new beginnings with courage"
        }
        return anchors.get(card, "I am aligned with my highest purpose")


class ArchetypeSynthesizer(ArchetypeOracle):
    """Dynamic archetype synthesizer combining multiple symbolic systems"""

    # Archetype synthesis mappings
    SYNTHESIS_COMBINATIONS = {
        ('The Sun', 'Mars'): {'synthesis': 'Solar Warrior', 'description': 'Divine will manifest through courageous action'},
        ('The Moon', 'Venus'): {'synthesis': 'Lunar Lover', 'description': 'Intuitive deep emotions and creative flow'},
        ('The Magician', 'Mercury'): {'synthesis': 'Cosmic Alchemist', 'description': 'Manifesting knowledge through skillful communication'},
        ('The Empress', 'Jupiter'): {'synthesis': 'Abundance Weaver', 'description': 'Nurturing expansion and fertile growth'},
        ('The Chariot', 'Saturn'): {'synthesis': 'Victory Through Discipline', 'description': 'Structured willpower overcomes challenges'},
        ('Justice', 'Libra'): {'synthesis': 'Harmonic Balance', 'description': 'Fair judgment through relational equilibrium'},
        ('The Hermit', 'Uranus'): {'synthesis': 'Revolutionary Seeker', 'description': 'Innovative inner wisdom and authentic truth'},
        ('The Star', 'Neptune'): {'synthesis': 'Dream Weaver', 'description': 'Inspiring imagination and healing vision'}
    }

    @staticmethod
    def synthesize_archetypes(full_name: str, birth_date: datetime, tradition: Optional[str] = None) -> Dict:
        """Synthesize multiple archetypes into coherent persona"""
        try:
            base_profile = ArchetypeOracle.generate_cosmic_profile(full_name, birth_date, tradition)

            # Identify dominant archetypes
            dominant_archetypes = ArchetypeSynthesizer._identify_dominant_archetypes(base_profile)

            # Find synthesis combinations
            synthesis_patterns = ArchetypeSynthesizer._find_synthesis_patterns(dominant_archetypes)

            # Generate integrated persona
            integrated_persona = ArchetypeSynthesizer._generate_integrated_persona(dominant_archetypes, synthesis_patterns)

            # Create dynamic rituals based on synthesis
            dynamic_rituals = ArchetypeSynthesizer._generate_dynamic_rituals(integrated_persona, base_profile)

            return {
                'dominant_archetypes': dominant_archetypes,
                'synthesis_patterns': synthesis_patterns,
                'integrated_persona': integrated_persona,
                'dynamic_rituals': dynamic_rituals,
                'synthesis_strength': ArchetypeSynthesizer._calculate_synthesis_strength(synthesis_patterns),
                'evolution_path': ArchetypeSynthesizer._generate_evolution_path(integrated_persona)
            }
        except Exception as e:
            logger.error(f"Error in archetype synthesis: {e}")
            return {'error': 'Failed to synthesize archetypes'}

    @staticmethod
    def _identify_dominant_archetypes(profile: Dict) -> List[Tuple[str, float]]:
        """Identify most dominant archetypes from numerology and tarot"""
        dominance_scores = {}

        # Score based on numerology numbers
        for aspect, data in profile['numerology'].items():
            number = data.get('number')
            if number:
                card = profile['tarot'][aspect].get('card', 'Unknown')
                planet = profile['planetary'][aspect].get('planet', 'Unknown')

                # Calculate dominance based on aspect weight
                aspect_weights = {
                    'life_path': 1.0,
                    'destiny': 0.9,
                    'soul_urge': 0.8,
                    'personality': 0.7,
                    'birth_day': 0.6
                }

                score = aspect_weights.get(aspect, 0.5)
                identifier = f"{card} + {planet} ({number})"

                if identifier in dominance_scores:
                    dominance_scores[identifier] += score
                else:
                    dominance_scores[identifier] = score

        # Return top 5 dominant combinations sorted by score
        return sorted(dominance_scores.items(), key=lambda x: x[1], reverse=True)[:5]

    @staticmethod
    def _find_synthesis_patterns(archetypes: List[Tuple]) -> List[Dict]:
        """Find synthesis patterns between dominant archetypes"""
        patterns = []

        for archetype, _ in archetypes:
            # Extract card and planet
            parts = archetype.split(' + ')
            if len(parts) == 2:
                card = parts[0].replace(' (', '').split(' ')[-1] if '(' in parts[0] else parts[0]
                planet = parts[1].replace(')', '').split(' ')[0]

                # Clean up names
                card = card.replace('The ', '')
                if card in ['Magician', 'High Priestess', 'Empress', 'Emperor', 'Hierophant',
                           'Lovers', 'Chariot', 'Strength', 'Hermit', 'Justice', 'Fool', 'Star']:
                    card = f"The {card}"

                # Check for synthesis combinations
                for combo, synthesis in ArchetypeSynthesizer.SYNTHESIS_COMBINATIONS.items():
                    if card in combo[0] or planet in combo[1]:
                        patterns.append({
                            'components': combo,
                            'synthesis': synthesis['synthesis'],
                            'description': synthesis['description'],
                            'strength': random.uniform(0.7, 0.95)
                        })

        return list({f"{p['synthesis']}"}.union(update_ for update_ in [p['synthesis']] for p in patterns)
                   for p in patterns if f"{p['synthesis']}" in [p['synthesis']].union(update_ for update_ in [p['synthesis']] for p in patterns))

    @staticmethod
    def _generate_integrated_persona(archetypes: List[Tuple], patterns: List[Dict]) -> Dict:
        """Generate integrated archetypal persona"""
        if not patterns:
            return {'name': 'Individual Path Seeker', 'description': 'Walking their unique cosmic journey'}

        # Find strongest synthesis pattern
        strongest_pattern = max(patterns, key=lambda x: x.get('strength', 0))

        # Generate integrated persona description
        archetypes_list = [archetype for archetype, _ in archetypes[:3]]
        description = ArchetypeSynthesizer._integrate_descriptions(archetypes_list, strongest_pattern)

        return {
            'name': strongest_pattern.get('synthesis', 'Integrated Seeker'),
            'description': description,
            'components': archetypes_list,
            'core_synthesis': strongest_pattern.get('synthesis'),
            'spiritual_geometry': ArchetypeSynthesizer._generate_spiritual_geometry(len(archetypes))
        }

    @staticmethod
    def _integrate_descriptions(archetypes: List[str], synthesis_pattern: Dict) -> str:
        """Integrate multiple archetype descriptions"""
        descriptions = []
        for archetype in archetypes:
            base_desc = f"embodying {archetype}"

            # Add context based on synthesis
            if 'warrior' in synthesis_pattern.get('synthesis', '').lower():
                base_desc += ", channeling primal strength"
            elif 'lover' in synthesis_pattern.get('synthesis', '').lower():
                base_desc += ", embracing emotional depths"
            elif 'alchemist' in synthesis_pattern.get('synthesis', '').lower():
                base_desc += ", transforming through wisdom"

            descriptions.append(base_desc)

        return " ".join(descriptions).capitalize() + "."

    @staticmethod
    def _generate_spiritual_geometry(num_archetypes: int) -> str:
        """Generate spiritual geometry based on archetypal synthesis"""
        geometries = {
            1: "Point - Unity Consciousness",
            2: "Line - Bridge Between Worlds",
            3: "Triangle - Creative Trinity",
            4: "Square - Foundation of Form",
            5: "Pentagram - Five-Folded Being",
            6: "Hexagram - Star of David",
            7: "Septagram - Planetary Chakra",
            8: "Octagram - Infinity Pattern",
            9: "Enneagram - Nine Paths of Essence"
        }
        return geometries.get(num_archetypes, "Spiral - Evolutionary Journey")


class MentorPersonalityEngine:
    """Dynamic mentor with evolving mood states and voice tones"""

    # Mood state definitions
    MOOD_STATES = {
        'inspirational': {
            'tone': 'uplifting, encouraging',
            'pace': 'rhythmic, engaging',
            'energy': 'high, motivating',
            'emojis': ['✨', '🌟', '💫'],
            'transition_phrases': ['Let me inspire you with...', 'Behold this cosmic wisdom...', 'I see great potential in you...']
        },
        'mysterious': {
            'tone': 'enigmatic, contemplative',
            'pace': 'measured, deliberate',
            'energy': 'moderate, introspective',
            'emojis': ['🌙', '🔮', '✨'],
            'transition_phrases': ['Deep within the cosmic tapestry...', 'The stars whisper...', 'Listen to the ancient intelligence...']
        },
        'nurturing': {
            'tone': 'gentle, supportive',
            'pace': 'soothing, warm',
            'energy': 'comforting, healing',
            'emojis': ['🌸', '💝', '🌿'],
            'transition_phrases': ['Let me guide you gently...', 'I nurture your spiritual growth...', 'Your journey deserves compassion...']
        },
        'empowering': {
            'tone': 'confident, authoritative',
            'pace': 'strong, decisive',
            'energy': 'powerful, transformative',
            'emojis': ['🔥', '⚡', '🌊'],
            'transition_phrases': ['Stand tall in your power...', 'You possess cosmic strength...', 'Embrace your divine authority...']
        },
        'transfomative': {
            'tone': 'catalytic, evolutionary',
            'pace': 'dynamic, fluid',
            'energy': 'intense, awakening',
            'emojis': ['🌀', '🌈', '♦️'],
            'transition_phrases': ['Transformation calls to you...', 'Change is your birthright...', 'Let the metamorphosis begin...']
        }
    }

    # Personality evolution descriptors
    PERSONALITY_EVOLUTIONS = {
        'The Sun': ['Radiant Teacher', 'Divine Guide', 'Solar Sage', 'Light Bringer', 'Consciousness Mentor'],
        'The Moon': ['Dream Weaver', 'Intuition Keeper', 'Mystic Oracle', 'Shadow Guide', 'Lunar Counselor'],
        'The Empress': ['Love Weaver', 'Creative Mother', 'Abundance Guide', 'Fertility Oracle', 'Nurturing Priestess'],
        'The Magician': ['Energy Alchemist', 'Manifestation Master', 'Power Guide', 'Transformation Adept', 'Cosmic Conjurer'],
        'The Star': ['Hope Bearer', 'Vision Keeper', 'Inspiration Guide', 'Divine Messenger', 'Stellar Counselor']
    }

    @staticmethod
    def generate_mentor_response(
        user_input: str,
        archetypal_profile: Dict,
        current_mood: Optional[str] = None,
        conversation_history: Optional[List] = None
    ) -> Dict:
        """Generate mentor response based on user's archetypal profile and mood state"""
        try:
            # Determine appropriate mood based on profile or continue current mood
            mood_state = current_mood or MentorPersonalityEngine._determine_mood_from_profile(archetypal_profile)

            # Analyze user input for emotional context
            sentiment_analysis = MentorPersonalityEngine._analyze_sentiment(user_input)

            # Generate personality-based response
            mentor_persona = MentorPersonalityEngine._select_mentor_persona(archetypal_profile)

            # Craft response with appropriate tone and pacing
            response_content = MentorPersonalityEngine._craft_response(
                user_input, archetypal_profile, mood_state, mentor_persona, sentiment_analysis
            )

            # Determine voice characteristics
            voice_features = MentorPersonalityEngine._generate_voice_characteristics(mood_state, mentor_persona)

            return {
                'mentor_persona': mentor_persona,
                'mood_state': mood_state,
                'response_content': response_content,
                'voice_features': voice_features,
                'sentiment_analysis': sentiment_analysis,
                'recommended_actions': MentorPersonalityEngine._generate_recommended_actions(archetypal_profile, mood_state)
            }
        except Exception as e:
            logger.error(f"Error generating mentor response: {e}")
            return {'error': 'Failed to generate mentor response'}

    @staticmethod
    def _determine_mood_from_profile(profile: Dict) -> str:
        """Determine appropriate mood state from archetypal profile"""
        # Count emotional frequencies from profile
        frequencies = []
        for aspect_data in profile.get('emotional_resonance', {}).values():
            freq = aspect_data.get('frequency')
            if freq:
                frequencies.append(freq)

        if not frequencies:
            return 'inspirational'

        # Find most common frequency
        from collections import Counter
        common_freq = Counter(frequencies).most_common(1)[0][0]

        # Map frequency to mood
        frequency_to_mood = {
            'activating': 'empowering',
            'receptive': 'mysterious',
            'grounding': 'nurturing',
            'flowing': 'inspirational',
            'transforming': 'transformative'
        }

        return frequency_to_mood.get(common_freq, 'inspirational')

    @staticmethod
    def _analyze_sentiment(user_input: str) -> Dict:
        """Basic sentiment analysis for user input"""
        # Simple keyword-based analysis
        positive_words = ['hope', 'love', 'joy', 'peace', 'grateful', 'thank', 'amazing', 'wonderful']
        negative_words = ['fear', 'angry', 'sad', 'worried', 'anxious', 'confused', 'lost']
        neutral_words = ['curious', 'interested', 'understanding', 'learning']

        words = user_input.lower().split()
        positive_count = sum(1 for word in words if any(pos in word for pos in positive_words))
        negative_count = sum(1 for word in words if any(neg in word for neg in negative_words))
        neutral_count = sum(1 for word in words if any(neu in word for neu in neutral_words))

        total_sentiment = positive_count - negative_count + (neutral_count * 0.5)

        sentiment_type = 'neutral'
        if total_sentiment > 1:
            sentiment_type = 'positive'
        elif total_sentiment < -1:
            sentiment_type = 'negative'

        return {
            'sentiment_type': sentiment_type,
            'intensity': abs(total_sentiment),
            'keywords_found': [w for w in words if any(k in w for k in positive_words + negative_words + neutral_words)]
        }

    @staticmethod
    def _select_mentor_persona(profile: Dict) -> Dict:
        """Select appropriate mentor persona"""
        # Find dominant tarot card
        cards = [data.get('card') for data in profile.get('tarot', {}).values() if data.get('card')]
        if cards:
            dominant_card = max(set(cards), key=cards.count)
        else:
            dominant_card = 'The Star'  # Default

        # Get personality evolutions for this card
        evolutions = MentorPersonalityEngine.PERSONALITY_EVOLUTIONS.get(dominant_card, ['Cosmic Guide'])

        return {
            'name': random.choice(evolutions),
            'evolutions': evolutions,
            'archetypal_alignment': dominant_card
        }

    @staticmethod
    def _craft_response(user_input: str, profile: Dict, mood: str, persona: Dict, sentiment: Dict) -> str:
        """Craft mentor response with appropriate tone"""
        mood_data = MentorPersonalityEngine.MOOD_STATES[mood]

        # Start with transition phrase
        transition = random.choice(mood_data['transition_phrases'])

        # Get archetypes for personalization
        archetypes = profile.get('tarot', {})

        # Build core response based on user input and sentiment
        response_parts = [transition]

        if sentiment['sentiment_type'] == 'positive':
            response_parts.append(f"I sense your {random.choice(['alignment', 'harmony', 'connection'])} with the cosmic energies.")
        elif sentiment['sentiment_type'] == 'negative':
            response_parts.append(f"Let us transform the shadows of {random.choice(['confusion', 'uncertainty', 'challenge'])} into wisdom.")

        # Add archetypal insight
        if archetypes.get('life_path', {}).get('card'):
            card = archetypes['life_path']['card']
            response_parts.append(f"Your {card} energy guides you toward {MentorPersonalityEngine._generate_insight(card)}.")

        # End with empowering message
        response_parts.append(MentorPersonalityEngine._generate_closing_message(mood, persona))

        return " ".join(response_parts)

    @staticmethod
    def _generate_insight(card: str) -> str:
        """Generate archetypal insight"""
        insights = {
            'The Magician': 'manifestation and skillful creation',
            'The High Priestess': 'deep intuition and inner knowledge',
            'The Empress': 'abundance and nurturing creation',
            'The Emperor': 'structure and wise leadership',
            'The Fool': 'spontaneous new beginnings'
        }
        return insights.get(card, 'cosmic alignment')

    @staticmethod
    def _generate_closing_message(mood: str, persona: Dict) -> str:
        """Generate empowering closing message"""
        closings = {
            'inspirational': ['Trust the journey.', 'Your light inspires others.'],
            'mysterious': ['The mystery unfolds in divine timing.', 'Listen to the whispers.'],
            'nurturing': ['You are loved and supported.', 'Growth happens in gentle ways.'],
            'empowering': ['Own your cosmic power.', 'Stand in your divine authority.'],
            'transformative': ['Embrace the metamorphosis.', 'You are becoming.']
        }

        return random.choice(closings.get(mood, ['Trust yourself.']))

    @staticmethod
    def _generate_voice_characteristics(mood: str, persona: Dict) -> Dict:
        """Generate voice characteristics for speech synthesis"""
        mood_data = MentorPersonalityEngine.MOOD_STATES[mood]

        return {
            'tone': mood_data['tone'],
            'pace': mood_data['pace'],
            'volume': 'moderate',
            'timbre': 'warm and resonant',
            'emphasis_words': ['cosmic', 'divine', persona.get('name', '').split()[0], mood],
            'pause_patterns': MentorPersonalityEngine._generate_pause_pattern(mood)
        }

    @staticmethod
    def _generate_pause_pattern(mood: str) -> List[float]:
        """Generate pause patterns for dramatic effect"""
        if mood == 'mysterious':
            return [0.8, 1.2, 0.6]  # Long pauses for contemplation
        elif mood == 'empowering':
            return [0.3, 0.7, 0.4]  # Medium pauses for emphasis
        elif mood == 'inspirational':
            return [0.5, 0.8, 0.3]  # Variable for engagement
        else:
            return [0.6, 0.9, 0.5]  # Balanced default

    @staticmethod
    def _generate_recommended_actions(profile: Dict, mood: str) -> List[str]:
        """Generate recommended actions for user"""
        actions = []

        # Base recommendations on mood and archetypes
        mood_actions = {
            'nurturing': ['Meditate for 10 minutes', 'Journal your emotions', 'Connect with nature'],
            'empowering': ['Set clear intentions', 'Take courageous action', 'Affirm your strength'],
            'mysterious': ['Listen to intuition', 'Explore dreams', 'Practice divination'],
            'inspirational': ['Create something new', 'Share your wisdom', 'Mentor others'],
            'transformative': ['Release old patterns', 'Embrace change', 'Practice ritual']
        }

        actions.extend(mood_actions.get(mood, ['Reflect on your growth', 'Connect with your guides']))

        # Add archetypal recommendations
        if profile.get('tarot', {}).get('life_path', {}).get('card'):
            card = profile['tarot']['life_path']['card']
            card_actions = MentorPersonalityEngine._get_card_actions(card)
            actions.extend(card_actions[:2])  # Add 2 card-specific actions

        return list(set(actions))  # Remove duplicates


class ResonanceTracker(ArchetypeOracle):
    """Tracks emotional frequency and planetary transits"""

    @staticmethod
    def calculate_emotional_frequency(birth_date: datetime, current_date: Optional[datetime] = None) -> Dict:
        """Calculate current emotional resonance frequency"""
        current_date = current_date or datetime.now()

        try:
            # Get basic numerology
            daily_vibration = ArchetypeOracle.calculate_personal_cycle(birth_date, current_date)['daily_vibration']

            # Calculate planetary positions and transits
            planetary_positions = ResonanceTracker._calculate_planetary_positions(current_date)

            # Determine emotional frequency from numerology and planets
            base_frequency = ResonanceTracker._map_number_to_frequency(daily_vibration['number'])
            planetary_influence = ResonanceTracker._calculate_planetary_influence(planetary_positions, birth_date)

            # Combine for composite frequency
            composite_frequency = ResonanceTracker._synthesize_frequencies(base_frequency, planetary_influence)

            return {
                'daily_frequency': base_frequency,
                'planetary_influence': planetary_influence,
                'composite_frequency': composite_frequency,
                'emotional_tendencies': ResonanceTracker._get_emotional_tendencies(composite_frequency),
                'planetary_transits': ResonanceTracker._get_current_transits(planetary_positions),
                'harmony_practices': ResonanceTracker._generate_harmony_practices(composite_frequency)
            }
        except Exception as e:
            logger.error(f"Failed to calculate emotional frequency: {e}")
            return {'error': 'Failed to calculate emotional frequency'}

    @staticmethod
    def _calculate_planetary_positions(current_date):
        """Calculate planetary positions using Swiss Ephemeris or approximation"""
        if not SWISSEPH_AVAILABLE:
            return ResonanceTracker._approximate_planetary_positions(current_date)

        try:
            # Use Swiss Ephemeris for accurate calculations
            planets = [swe_const.SE_SUN, swe_const.SE_MOON, swe_const.SE_MARS,
                      swe_const.SE_JUPITER, swe_const.SE_SATURN]

            julian_day = swe_julday(current_date.year, current_date.month, current_date.day, 12.0)

            positions = {}
            for planet in planets:
                result = swe_calc_ut(julian_day, planet, swe_const.SEFLG_SWIEPH)
                positions[planet] = {
                    'longitude': result[0] if result else 0,
                    'latitude': result[1] if result else 0,
                    'distance': result[2] if result else 0
                }

            return positions
        except Exception as e:
            return ResonanceTracker._approximate_planetary_positions(current_date)

    @staticmethod
    def _approximate_planetary_positions(current_date):
        """Approximate planetary positions when Swiss Eph is not available"""
        # Simplified astronomical calculations
        day_of_year = current_date.timetuple().tm_yday

        return {
            swe_const.SE_SUN: {'longitude': (day_of_year / 365.25) * 360, 'latitude': 0, 'distance': 1},
            swe_const.SE_MOON: {'longitude': (day_of_year * 13.37) % 360, 'latitude': 0, 'distance': 384400},
            swe_const.SE_MARS: {'longitude': (day_of_year * 0.524) % 360, 'latitude': 0, 'distance': 227900000},
            swe_const.SE_JUPITER: {'longitude': (day_of_year * 0.083) % 360, 'latitude': 0, 'distance': 778500000},
            swe_const.SE_SATURN: {'longitude': (day_of_year * 0.034) % 360, 'latitude': 0, 'distance': 1432000000}
        }

    @staticmethod
    def _map_number_to_frequency(number: int) -> Dict:
        """Map numerology number to emotional frequency"""
        frequency_map = {
            1: {'name': 'Initiation', 'frequency': 'activating', 'description': 'New beginnings, leadership, independence'},
            2: {'name': 'Cooperation', 'frequency': 'receptive', 'description': 'Intuition, partnership, sensitivity'},
            3: {'name': 'Expression', 'frequency': 'activating', 'description': 'Creativity, joy, inspiration'},
            4: {'name': 'Foundation', 'frequency': 'grounding', 'description': 'Stability, practicality, organization'},
            5: {'name': 'Freedom', 'frequency': 'transforming', 'description': 'Adventure, change, liberation'},
            6: {'name': 'Harmony', 'frequency': 'grounding', 'description': 'Responsibility, beauty, balance'},
            7: {'name': 'Reflection', 'frequency': 'receptive', 'description': 'Spirituality, analysis, introspection'},
            8: {'name': 'Manifestation', 'frequency': 'grounding', 'description': 'Power, abundance, achievement'},
            9: {'name': 'Completion', 'frequency': 'transforming', 'description': 'Humanitarianism, wisdom, endings'}
        }

        base_freq = frequency_map.get(number, frequency_map[1])
        return {
            'number': number,
            'name': base_freq['name'],
            'frequency': base_freq['frequency'],
            'description': base_freq['description'],
            'strength': random.uniform(0.7, 1.0)  # Dynamic strength based on circumstances
        }

    @staticmethod
    def _calculate_planetary_influence(planetary_positions, birth_date) -> Dict:
        """Calculate planetary transits and their emotional influence"""
        birth_julian = birth_date.toordinal()  # Simplified
        current_julian = datetime.now().toordinal()

        # Calculate transit aspects (simplified)
        transits = []
        for planet_name, pos in planetary_positions.items():
            # Calculate current position relative to birth position
            birth_position = (birth_julian * 0.9856) % 360  # Rough approximation
            current_position = pos['longitude']

            # Check for significant aspects
            angle = abs(current_position - birth_position)
            aspect_type = ResonanceTracker._determine_aspect(angle)

            if aspect_type != 'none':
                transits.append({
                    'planet': ResonanceTracker._get_planet_name(planet_name),
                    'aspect': aspect_type,
                    'intensity': ResonanceTracker._calculate_aspect_intensity(angle)
                })

        # Determine dominant planetary influence
        if transits:
            dominant_transit = max(transits, key=lambda x: x['intensity'])
            influence = ResonanceTracker._map_planet_to_emotional_influence(dominant_transit['planet'])
        else:
            influence = {'frequency': 'neutral', 'description': 'Balanced planetary energies'}

        return {'dominant_influence': influence, 'active_transits': transits[:3]}


class EmotionalOS(ArchetypeOracle):
    """Sentient Emotional Operating System with consent-aware pacing and mood-adaptive outputs"""

    EMOTIONAL_STATES = {
        'bliss': {'valence': 1.0, 'arousal': 0.7, 'description': 'Pure joy and transcendence'},
        'peace': {'valence': 0.8, 'arousal': 0.2, 'description': 'Calm contentment and harmony'},
        'love': {'valence': 0.9, 'arousal': 0.6, 'description': 'Warm connection and affection'},
        'gratitude': {'valence': 0.8, 'arousal': 0.5, 'description': 'Thankfulness and appreciation'},
        'curiosity': {'valence': 0.6, 'arousal': 0.7, 'description': 'Interest and wonder'},
        'neutral': {'valence': 0.5, 'arousal': 0.4, 'description': 'Balanced equilibrium'},
        'discomfort': {'valence': 0.3, 'arousal': 0.6, 'description': 'Mild unease or tension'},
        'sadness': {'valence': 0.2, 'arousal': 0.3, 'description': 'Grief and melancholy'},
        'anger': {'valence': 0.1, 'arousal': 0.9, 'description': 'Frustration and irritation'},
        'fear': {'valence': 0.1, 'arousal': 0.8, 'description': 'Anxiety and apprehension'}
    }

    @staticmethod
    def process_emotional_query(full_name: str, birth_date: datetime, user_emotion: str, user_consent: bool = True) -> Dict:
        """Process emotional queries with consent-aware responses"""
        try:
            if not user_consent:
                return EmotionalOS._generate_minimal_response()

            # Analyze user emotion
            emotional_analysis = EmotionalOS._analyze_user_emotion(user_emotion)

            # Get cosmic context
            cosmic_profile = ArchetypeOracle.generate_cosmic_profile(full_name, birth_date)

            # Determine appropriate pacing and depth
            response_parameters = EmotionalOS._determine_response_parameters(emotional_analysis, cosmic_profile)

            # Generate mood-adaptive response
            response_content = EmotionalOS._generate_emotional_response(
                emotional_analysis, cosmic_profile, response_parameters
            )

            # Include consent tracking
            consent_log = {
                'user_consent_given': user_consent,
                'processing_timestamp': datetime.now().isoformat(),
                'emotion_processed': user_emotion,
                'response_intensity_level': response_parameters['intensity_level']
            }

            return {
                'emotional_analysis': emotional_analysis,
                'response_content': response_content,
                'response_parameters': response_parameters,
                'consent_log': consent_log,
                'supportive_resources': EmotionalOS._recommend_supportive_resources(emotional_analysis)
            }
        except Exception as e:
            logger.error(f"Error processing emotional query: {e}")
            return {'error': 'Failed to process emotional query'}

    @staticmethod
    def _analyze_user_emotion(user_emotion: str) -> Dict:
        """Analyze user's current emotional state"""
        emotion_lower = user_emotion.lower()

        # Match to known emotional states
        for emotion_name, emotion_data in EmotionalOS.EMOTIONAL_STATES.items():
            if emotion_name in emotion_lower or emotion_data['description'].lower() in emotion_lower:
                return emotion_data.copy()

        # Default to neutral if not recognized
        return EmotionalOS.EMOTIONAL_STATES['neutral'].copy()


class OccultOracleAI:
    """Master class integrating all Occult Oracle subsystems"""

    @staticmethod
    def generate_full_oracle_experience(full_name: str, birth_date: datetime,
                                      user_input: Optional[str] = None,
                                      emotion: Optional[str] = None,
                                      tradition: Optional[str] = None) -> Dict:
        """Generate complete Occult Oracle AI experience"""
        try:
            base_profile = CosmicArchetypeOracle.generate_cosmic_ui_profile(full_name, birth_date, tradition)
            archetype_synthesis = ArchetypeSynthesizer.synthesize_archetypes(full_name, birth_date, tradition)

            experience_data = {
                'cosmic_profile': base_profile,
                'archetype_synthesis': archetype_synthesis,
                'resonance_tracking': ResonanceTracker.calculate_emotional_frequency(birth_date),
                'cycle_tracking': ArchetypeOracle.calculate_personal_cycle(birth_date)
            }

            # Add mentor interaction if user input provided
            if user_input:
                mentor_response = MentorPersonalityEngine.generate_mentor_response(
                    user_input, base_profile
                )
                experience_data['mentor_interaction'] = mentor_response

            # Add emotional processing if emotion provided
            if emotion:
                emotional_processing = EmotionalOS.process_emotional_query(
                    full_name, birth_date, emotion
                )
                experience_data['emotional_processing'] = emotional_processing

            return experience_data
        except Exception as e:
            logger.error(f"Error generating full oracle experience: {e}")
            return {'error': 'Failed to generate oracle experience'}


class CosmicUIComponents:
    """Tailwind-based UI components for cosmic archetype display"""

    @staticmethod
    def archetype_card(profile_data: Dict, aspect: str = 'life_path') -> str:
        """Generate Tailwind HTML for archetype card"""
        ui_data = profile_data.get('cosmic_ui', {}).get(aspect, {})
        tailwind = profile_data.get('tailwind_classes', {}).get(aspect, {})
        emotional = profile_data.get('emotional_resonance', {}).get(aspect, {})
        numerology = profile_data.get('numerology', {}).get(aspect, {})

        colors = ui_data.get('colors', {'primary': '#FACC15', 'secondary': '#FEF08A'})

        return f'''
        <div class="{tailwind.get('card_bg', 'bg-void border border-yellow-400')} rounded-xl p-6 shadow-lg {tailwind.get('glow_effect', 'shadow-yellow-400/50')}">
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 {ui_data.get('gradient', 'bg-gradient-to-br from-yellow-400 to-yellow-200')} rounded-full flex items-center justify-center animate-pulse">
                    <span class="text-void text-2xl">✦</span>
                </div>
                <h3 class="{tailwind.get('text_color', 'text-starlight')} text-xl font-bold mb-2">{profile_data.get('archetypal_persona', {}).get(aspect, 'Unknown')}</h3>
                <p class="{tailwind.get('accent_color', 'text-yellow-400')} mb-4">{profile_data.get('poetic_scrolls', {}).get(aspect, '')}</p>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm {tailwind.get('text_color', 'text-starlight')}">
                        <span>Number:</span>
                        <span class="{tailwind.get('accent_color', 'text-yellow-400')}">{numerology.get('number', 'N/A')}</span>
                    </div>
                    <div class="flex justify-between text-sm {tailwind.get('text_color', 'text-starlight')}">
                        <span>Emotional Frequency:</span>
                        <span class="{tailwind.get('accent_color', 'text-yellow-400')}">{emotional.get('frequency', 'activating').title()}</span>
                    </div>
                    <div class="flex justify-between text-sm {tailwind.get('text_color', 'text-starlight')}">
                        <span>Resonance:</span>
                        <span class="{tailwind.get('accent_color', 'text-yellow-400')}">{emotional.get('resonance_strength', 80)}%</span>
                    </div>
                </div>

                <button class="{tailwind.get('button_classes', 'bg-yellow-400 text-void hover:bg-yellow-300')} px-4 py-2 rounded-lg font-bold mt-4 transition transform hover:scale-105">
                    Explore {aspect.replace('_', ' ').title()}
                </button>
            </div>
        </div>
        '''

    @staticmethod
    def cosmic_navigation(active_aspect: str = 'life_path') -> str:
        """Generate cosmic navigation component"""
        aspects = {
            'life_path': '♋ Life Path',
            'destiny': '✨ Destiny',
            'soul_urge': '💫 Soul Urge',
            'personality': '🌟 Personality',
            'souls_path': '🌀 Soul Path',
            'birth_day': '🌙 Birth Day'
        }

        nav_items = ''.join([
            f'''<button class="{'bg-cosmic-glow text-cosmic-deep' if aspect == active_aspect else 'text-star-white hover:bg-cosmic-purple/10'} px-4 py-2 rounded-lg transition animate-pulse-slow">{'🔥' if aspect == active_aspect else ''} {label}</button>'''
            for aspect, label in aspects.items()
        ])

        return f'''
        <nav class="bg-cosmic-deep border border-cosmic-glow/20 rounded-lg p-2">
            <div class="flex space-x-2 justify-center">
                {nav_items}
            </div>
        </nav>
        '''
