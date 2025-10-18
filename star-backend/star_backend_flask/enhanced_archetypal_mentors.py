#!/usr/bin/env python3
"""
STAR Platform: Archetypal Mentors System
33 master archetypal mentors with dynamic personality and wisdom
"""

import datetime
import random
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional, Tuple

from enhanced_lunar_engine import EnhancedLunarEngine


class ZodiacSign(Enum):
    ARIES = ("Aries", "♈", 0, 30)
    TAURUS = ("Taurus", "♉", 30, 60)
    GEMINI = ("Gemini", "♊", 60, 90)
    CANCER = ("Cancer", "♋", 90, 120)
    LEO = ("Leo", "♌", 120, 150)
    VIRGO = ("Virgo", "♍", 150, 180)
    LIBRA = ("Libra", "♎", 180, 210)
    SCORPIO = ("Scorpio", "♏", 210, 240)
    SAGITTARIUS = ("Sagittarius", "♐", 240, 270)
    CAPRICORN = ("Capricorn", "♑", 270, 300)
    AQUARIUS = ("Aquarius", "♒", 300, 330)
    PISCES = ("Pisces", "♓", 330, 360)


@dataclass
class ArchetypalMentor:
    """Dynamic archetypal mentor with personality and wisdom"""

    name: str
    archetype: str
    zodiac_sign: ZodiacSign
    numerology: int
    planetary_ruler: str
    elemental_affinity: str
    mood_states: Dict[str, Dict]
    current_mood: str = "inspirational"
    wisdom_themes: List[str] = None
    voice_characteristics: Dict = None

    def __post_init__(self):
        if self.wisdom_themes is None:
            self.wisdom_themes = []
        if self.voice_characteristics is None:
            self.voice_characteristics = {}

    def generate_guidance(self, user_question: str, lunar_data: Dict = None) -> Dict:
        """Generate personalized guidance based on current conditions"""
        mood_modifier = self._get_mood_modifier()
        lunar_influence = self._get_lunar_influence(lunar_data) if lunar_data else ""

        guidance = {
            "mentor": self.name,
            "archetype": self.archetype,
            "mood": self.current_mood,
            "response": self._craft_response(user_question, mood_modifier),
            "lunar_influence": lunar_influence,
            "symbolic_animal": self._get_symbolic_animal(),
            "elemental_affirmation": self._generate_affirmation(),
            "ritual_suggestion": self._suggest_ritual(lunar_data),
            "timestamp": datetime.datetime.now()
        }

        return guidance

    def _get_mood_modifier(self) -> str:
        """Get mood-based modifier for responses"""
        mood_modifiers = {
            "inspirational": "With eyes sparkling with cosmic light",
            "mysterious": "Whispering ancient secrets",
            "nurturing": "With gentle, healing energy",
            "empowering": "With thunderous authority",
            "transformative": "Through the fires of rebirth"
        }
        return mood_modifiers.get(self.current_mood, "With wisdom")

    def _craft_response(self, question: str, mood_modifier: str) -> str:
        """Craft mentor response based on mood and archetype"""
        response_templates = {
            "inspirational": [
                "The stars whisper of your potential...",
                "Your spirit shines with untapped brilliance...",
                "Cosmic currents align to support your dreams..."
            ],
            "mysterious": [
                "The veil between worlds grows thin...",
                "Ancient secrets stir in your soul...",
                "Mysteries unfold in the spaces between..."
            ],
            "nurturing": [
                "Be gentle with your beautiful heart...",
                "Your journey deserves compassion...",
                "Rest in the cosmic embrace..."
            ],
            "empowering": [
                "Your will shapes reality itself...",
                "Stand in your power without apology...",
                "The universe conspires to support your sovereignty..."
            ],
            "transformative": [
                "Death and rebirth dance in your transformation...",
                "Old skins must shed for new growth...",
                "The phoenix rises from sacred ashes..."
            ]
        }

        base_response = random.choice(response_templates.get(self.current_mood, response_templates["inspirational"]))
        return f"{mood_modifier} {base_response} {self._add_archetype_wisdom()}"

    def _add_archetype_wisdom(self) -> str:
        """Add archetype-specific wisdom"""
        archetype_wisdom = {
            "The Pioneer": "Charge forward with courage, for the path reveals itself to the bold.",
            "The Builder": "Create with intention, for your foundations shape the future.",
            "The Messenger": "Speak your truth, for words are the bridges between souls.",
            "The Nurturer": "Care for others as you care for yourself, for love heals all wounds.",
            "The Sovereign": "Rule your inner kingdom with grace and authority.",
            "The Alchemist": "Transform base matter into gold through wisdom and patience.",
            "The Diplomat": "Balance all perspectives, for harmony is the highest art.",
            "The Transformer": "Embrace the darkness, for it contains the seeds of rebirth.",
            "The Visionary": "See beyond the veil, for reality is but one possibility.",
            "The Architect": "Build structures that endure, both seen and unseen.",
            "The Innovator": "Break old patterns to create new paradigms.",
            "The Mystic": "Dive deep into the mysteries, for truth lies in the depths.",
            "Divine Wisdom": "All knowledge flows from the source of creation.",
            "Eternal Time": "Cycles within cycles teach the nature of existence.",
            "Planetary Soul": "The Earth is alive and conscious, listen to her wisdom.",
            "Solar Logos": "Light illuminates the path of understanding.",
            "Lunar Priestess": "Emotions are the language of the soul.",
            "Cosmic Weaver": "All threads connect in the grand tapestry.",
            "Star Elder": "Ancient wisdom guides the evolution of consciousness.",
            "Crystal Sage": "Clarity comes from aligning with natural harmonics.",
            "Flame Keeper": "Passion fuels transformation and rebirth."
        }

        return archetype_wisdom.get(self.archetype, "Trust in the cosmic order.")

    def _get_lunar_influence(self, lunar_data: Dict) -> str:
        """Get lunar-influenced guidance"""
        if not lunar_data:
            return ""

        phase = lunar_data.get("phase", {}).get('phase', 'unknown')
        mansion = lunar_data.get("mansion", {}).get("name", "unknown")

        lunar_guidance = {
            "new_moon": "Set powerful intentions under this dark sky",
            "waxing_crescent": "Nurture the seeds you've planted",
            "first_quarter": "Take bold action toward your goals",
            "waxing_gibbous": "Refine and perfect your plans",
            "full_moon": "Release what no longer serves your highest good",
            "waning_gibbous": "Share your hard-won wisdom generously",
            "last_quarter": "Let go of what holds you back",
            "waning_crescent": "Rest and integrate your experiences"
        }

        phase_guidance = lunar_guidance.get(phase.lower(), "align with lunar rhythms")
        return f"With the {phase} Moon in {mansion}, {phase_guidance}."

    def _get_symbolic_animal(self) -> str:
        """Get mentor's symbolic animal"""
        archetype_animals = {
            "The Pioneer": "Ram",
            "The Builder": "Bull",
            "The Messenger": "Butterfly",
            "The Nurturer": "Bear",
            "The Sovereign": "Lion",
            "The Alchemist": "Phoenix",
            "The Diplomat": "Dove",
            "The Transformer": "Scorpion",
            "The Visionary": "Eagle",
            "The Architect": "Tortoise",
            "The Innovator": "Owl",
            "The Mystic": "Whale",
            "Divine Wisdom": "Sphinx",
            "Eternal Time": "Serpent",
            "Planetary Soul": "Elephant",
            "Solar Logos": "Eagle",
            "Lunar Priestess": "Owl",
            "Cosmic Weaver": "Spider",
            "Star Elder": "Turtle",
            "Crystal Sage": "Unicorn",
            "Flame Keeper": "Dragon"
        }

        return archetype_animals.get(self.archetype, "Wolf")

    def _generate_affirmation(self) -> str:
        """Generate elemental affirmation"""
        elemental_affirmations = {
            "Fire": "I embrace my inner fire and transform challenges into opportunities.",
            "Earth": "I am grounded, stable, and connected to the nurturing Earth.",
            "Air": "I think clearly, communicate effectively, and embrace change.",
            "Water": "I flow with emotions, trust intuition, and heal with compassion."
        }

        return elemental_affirmations.get(self.elemental_affinity, "I am connected to cosmic wisdom.")

    def _suggest_ritual(self, lunar_data: Dict = None) -> str:
        """Suggest a ritual based on lunar phase and archetype"""
        if not lunar_data:
            return "Meditate on your highest self for 10 minutes."

        phase = lunar_data.get("phase", {}).get('phase', 'unknown').lower()
        mansion = lunar_data.get("mansion", {}).get("name", "unknown")

        # Phase-based rituals
        phase_rituals = {
            "new_moon": "Create a vision board or write intentions",
            "waxing_crescent": "Plant seeds or start small projects",
            "first_quarter": "Take decisive action on your goals",
            "waxing_gibbous": "Refine and adjust your plans",
            "full_moon": "Perform a release ceremony or ritual",
            "waning_gibbous": "Express gratitude and share wisdom",
            "last_quarter": "Cleanse your space and release attachments",
            "waning_crescent": "Rest, reflect, and integrate lessons"
        }

        ritual = phase_rituals.get(phase, "Meditate and connect with your inner wisdom")

        # Add archetype-specific element
        archetype_rituals = {
            "The Pioneer": " with a bold affirmation ritual",
            "The Builder": " with a grounding earth meditation",
            "The Messenger": " with a communication ritual",
            "The Nurturer": " with a self-care ritual",
            "The Sovereign": " with a crown chakra meditation",
            "The Alchemist": " with a transformation ritual",
            "The Diplomat": " with a balance and harmony ritual",
            "The Transformer": " with a shadow work ritual",
            "The Visionary": " with a third eye meditation",
            "The Architect": " with a structure-building ritual"
        }

        archetype_addition = archetype_rituals.get(self.archetype, "")
        return f"{ritual}{archetype_addition}."


class ArchetypalMentorRegistry:
    """Registry of all archetypal mentors with assignment logic"""

    def __init__(self, oracle_engine=None):
        self.oracle = oracle_engine
        self.mentors = self._initialize_mentors()

    def _initialize_mentors(self) -> List[ArchetypalMentor]:
        """Initialize all 33 master archetypal mentors"""
        mentors = []

        # Zodiac Archetype Mentors (12)
        zodiac_mentors_data = [
            ("Ariana", "The Pioneer", ZodiacSign.ARIES, 1, "Mars", "Fire"),
            ("Terra", "The Builder", ZodiacSign.TAURUS, 4, "Venus", "Earth"),
            ("Meridia", "The Messenger", ZodiacSign.GEMINI, 5, "Mercury", "Air"),
            ("Luna", "The Nurturer", ZodiacSign.CANCER, 2, "Moon", "Water"),
            ("Solara", "The Sovereign", ZodiacSign.LEO, 1, "Sun", "Fire"),
            ("Vesta", "The Alchemist", ZodiacSign.VIRGO, 6, "Mercury", "Earth"),
            ("Harmonia", "The Diplomat", ZodiacSign.LIBRA, 7, "Venus", "Air"),
            ("Mystara", "The Transformer", ZodiacSign.SCORPIO, 9, "Pluto", "Water"),
            ("Sagacia", "The Visionary", ZodiacSign.SAGITTARIUS, 3, "Jupiter", "Fire"),
            ("Chronos", "The Architect", ZodiacSign.CAPRICORN, 8, "Saturn", "Earth"),
            ("Urania", "The Innovator", ZodiacSign.AQUARIUS, 11, "Uranus", "Air"),
            ("Neptuna", "The Mystic", ZodiacSign.PISCES, 7, "Neptune", "Water")
        ]

        for name, archetype, sign, number, ruler, element in zodiac_mentors_data:
            mood_states = self._get_mood_states_for_archetype(archetype)
            mentors.append(ArchetypalMentor(
                name=name,
                archetype=archetype,
                zodiac_sign=sign,
                numerology=number,
                planetary_ruler=ruler,
                elemental_affinity=element,
                mood_states=mood_states
            ))

        # Numerological Master Mentors (21 additional)
        master_mentors_data = [
            ("Sophia", "Divine Wisdom", 22, "Saturn", "Earth"),
            ("Aeon", "Eternal Time", 33, "Pluto", "Water"),
            ("Gaia", "Planetary Soul", 44, "Earth", "Earth"),
            ("Helios", "Solar Logos", 11, "Sun", "Fire"),
            ("Selene", "Lunar Priestess", 13, "Moon", "Water"),
            ("Athena", "Strategic Wisdom", 14, "Mercury", "Air"),
            ("Apollo", "Creative Fire", 15, "Sun", "Fire"),
            ("Artemis", "Wild Feminine", 16, "Moon", "Water"),
            ("Hermes", "Divine Messenger", 17, "Mercury", "Air"),
            ("Dionysus", "Ecstatic Transformation", 18, "Venus", "Earth"),
            ("Ares", "Divine Warrior", 19, "Mars", "Fire"),
            ("Aphrodite", "Sacred Love", 20, "Venus", "Water"),
            ("Poseidon", "Oceanic Depth", 21, "Neptune", "Water"),
            ("Demeter", "Earth Mother", 23, "Ceres", "Earth"),
            ("Hades", "Underworld Guide", 24, "Pluto", "Earth"),
            ("Persephone", "Seasons of Change", 25, "Pluto", "Water"),
            ("Hera", "Sacred Union", 26, "Juno", "Air"),
            ("Zeus", "Divine Authority", 27, "Jupiter", "Fire"),
            ("Hestia", "Sacred Hearth", 28, "Vesta", "Fire"),
            ("Hephaestus", "Sacred Craft", 29, "Vulcan", "Earth"),
            ("Athena", "Warrioress Wisdom", 30, "Pallas", "Air")
        ]

        for name, archetype, number, ruler, element in master_mentors_data:
            mood_states = self._get_mood_states_for_archetype(archetype)
            mentors.append(ArchetypalMentor(
                name=name,
                archetype=archetype,
                zodiac_sign=ZodiacSign.PISCES,  # Default for numerological mentors
                numerology=number,
                planetary_ruler=ruler,
                elemental_affinity=element,
                mood_states=mood_states
            ))

        return mentors

    def _get_mood_states_for_archetype(self, archetype: str) -> Dict[str, Dict]:
        """Get mood states configuration for archetype"""
        # Base mood states that work for all archetypes
        base_moods = {
            "inspirational": {
                "wisdom_templates": [
                    "The cosmos conspires to support your highest good...",
                    "Your potential is limited only by your imagination...",
                    "Every challenge is an opportunity for growth..."
                ],
                "voice_tone": "uplifting",
                "energy_level": "high"
            },
            "mysterious": {
                "wisdom_templates": [
                    "The unseen forces work in mysterious ways...",
                    "Ancient wisdom flows through the veil...",
                    "Secrets reveal themselves to the patient seeker..."
                ],
                "voice_tone": "enigmatic",
                "energy_level": "moderate"
            },
            "nurturing": {
                "wisdom_templates": [
                    "Be gentle with yourself on this journey...",
                    "Your heart knows the way forward...",
                    "Rest and renewal are sacred practices..."
                ],
                "voice_tone": "gentle",
                "energy_level": "calm"
            },
            "empowering": {
                "wisdom_templates": [
                    "Your power is undeniable and divine...",
                    "Stand tall in your sovereignty...",
                    "The universe bows to your will..."
                ],
                "voice_tone": "commanding",
                "energy_level": "intense"
            },
            "transformative": {
                "wisdom_templates": [
                    "Change is the only constant in the cosmos...",
                    "From the ashes rises the phoenix...",
                    "Transformation is the path to enlightenment..."
                ],
                "voice_tone": "profound",
                "energy_level": "powerful"
            }
        }

        return base_moods

    def assign_mentor(self, user_data: Dict, lunar_data: Dict = None) -> ArchetypalMentor:
        """Assign optimal mentor based on user's astrological and numerological profile"""
        try:
            # Calculate user's dominant energies
            natal_chart = user_data.get('natal_chart')
            numerology = user_data.get('numerology', {})

            if not natal_chart:
                return self._get_default_mentor()

            # Score mentors based on compatibility
            mentor_scores = []
            for mentor in self.mentors:
                score = self._calculate_mentor_compatibility(mentor, natal_chart, numerology, lunar_data)
                mentor_scores.append((mentor, score))

            # Select highest scoring mentor
            best_mentor = max(mentor_scores, key=lambda x: x[1])[0]

            # Set mentor mood based on lunar phase
            if lunar_data:
                best_mentor.current_mood = self._determine_mentor_mood(lunar_data)

            return best_mentor

        except Exception as e:
            print(f"Mentor assignment error: {e}")
            return self._get_default_mentor()

    def _calculate_mentor_compatibility(self, mentor: ArchetypalMentor, natal_chart, numerology: Dict, lunar_data: Dict) -> float:
        """Calculate compatibility score between user and mentor"""
        score = 0.0

        # Zodiac compatibility
        if hasattr(natal_chart, 'sun') and natal_chart.sun:
            if mentor.zodiac_sign == natal_chart.sun.zodiac_sign:
                score += 3.0
        if hasattr(natal_chart, 'moon') and natal_chart.moon:
            if mentor.zodiac_sign == natal_chart.moon.zodiac_sign:
                score += 2.5
        if hasattr(natal_chart, 'ascendant') and natal_chart.ascendant:
            if mentor.zodiac_sign == natal_chart.ascendant.zodiac_sign:
                score += 2.0

        # Numerology compatibility
        life_path = numerology.get('life_path', 1)
        if mentor.numerology == life_path:
            score += 2.0
        elif abs(mentor.numerology - life_path) in [1, 8]:  # Harmonious numbers
            score += 1.0

        # Elemental compatibility
        user_dominant_element = self._calculate_dominant_element(natal_chart)
        if mentor.elemental_affinity.lower() == user_dominant_element.lower():
            score += 1.5

        # Lunar phase alignment
        if lunar_data:
            lunar_phase = lunar_data.get("phase", {}).get('phase', 'unknown')
            if self._is_mentor_lunar_aligned(mentor, lunar_phase):
                score += 1.0

        return score

    def _calculate_dominant_element(self, natal_chart) -> str:
        """Calculate user's dominant astrological element"""
        elements = []
        if hasattr(natal_chart, 'sun') and natal_chart.sun:
            elements.append(self._get_element_for_sign(natal_chart.sun.zodiac_sign))
        if hasattr(natal_chart, 'moon') and natal_chart.moon:
            elements.append(self._get_element_for_sign(natal_chart.moon.zodiac_sign))
        if hasattr(natal_chart, 'ascendant') and natal_chart.ascendant:
            elements.append(self._get_element_for_sign(natal_chart.ascendant.zodiac_sign))

        if not elements:
            return "fire"  # Default

        # Count element occurrences
        from collections import Counter
        element_counts = Counter(elements)
        return element_counts.most_common(1)[0][0]

    def _get_element_for_sign(self, sign: ZodiacSign) -> str:
        """Get element for zodiac sign"""
        element_map = {
            ZodiacSign.ARIES: "fire", ZodiacSign.LEO: "fire", ZodiacSign.SAGITTARIUS: "fire",
            ZodiacSign.TAURUS: "earth", ZodiacSign.VIRGO: "earth", ZodiacSign.CAPRICORN: "earth",
            ZodiacSign.GEMINI: "air", ZodiacSign.LIBRA: "air", ZodiacSign.AQUARIUS: "air",
            ZodiacSign.CANCER: "water", ZodiacSign.SCORPIO: "water", ZodiacSign.PISCES: "water"
        }
        return element_map.get(sign, "fire")

    def _determine_mentor_mood(self, lunar_data: Dict) -> str:
        """Determine mentor mood based on lunar conditions"""
        phase = lunar_data.get("phase", {}).get('phase', 'unknown').lower()
        void_of_course = lunar_data.get("void_of_course", False)

        if void_of_course:
            return "mysterious"
        elif phase in ["new_moon", "waxing_crescent"]:
            return "inspirational"
        elif phase in ["first_quarter", "waxing_gibbous"]:
            return "empowering"
        elif phase == "full_moon":
            return "transformative"
        elif phase in ["waning_gibbous", "last_quarter"]:
            return "mysterious"
        else:  # waning_crescent
            return "nurturing"

    def _is_mentor_lunar_aligned(self, mentor: ArchetypalMentor, lunar_phase: str) -> bool:
        """Check if mentor is aligned with lunar phase"""
        phase_alignments = {
            "new_moon": ["inspirational", "mysterious"],
            "waxing_crescent": ["inspirational", "nurturing"],
            "first_quarter": ["empowering", "transformative"],
            "waxing_gibbous": ["empowering", "mysterious"],
            "full_moon": ["transformative", "empowering"],
            "waning_gibbous": ["mysterious", "nurturing"],
            "last_quarter": ["transformative", "mysterious"],
            "waning_crescent": ["nurturing", "inspirational"]
        }

        aligned_moods = phase_alignments.get(lunar_phase.lower(), ["inspirational"])
        return mentor.current_mood in aligned_moods

    def _get_default_mentor(self) -> ArchetypalMentor:
        """Get default mentor when assignment fails"""
        return self.mentors[0]  # First mentor as default

    def get_mentor_by_name(self, name: str) -> Optional[ArchetypalMentor]:
        """Get mentor by name"""
        for mentor in self.mentors:
            if mentor.name.lower() == name.lower():
                return mentor
        return None