# -*- coding: utf-8 -*-
"""
Archetype Oracle Module for Star App
Integrates numerology, tarot, and planetary archetypes into a unified symbolic system
"""

import logging
from datetime import datetime
import random
from typing import Dict, Optional
from numerology import NumerologyCalculator

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
