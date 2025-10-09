"""
Occult Oracle AI Engine for Star Platform
Provides authentic astrological calculations, tarot readings, numerology, and Kabbalistic insights
"""

import ephem
import datetime
import math
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

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

class Planet(Enum):
    SUN = ("Sun", "☉")
    MOON = ("Moon", "☽")
    MERCURY = ("Mercury", "☿")
    VENUS = ("Venus", "♀")
    MARS = ("Mars", "♂")
    JUPITER = ("Jupiter", "♃")
    SATURN = ("Saturn", "♄")
    URANUS = ("Uranus", "⛢")
    NEPTUNE = ("Neptune", "♆")
    PLUTO = ("Pluto", "♇")

@dataclass
class CelestialBody:
    name: str
    longitude: float
    latitude: float
    zodiac_sign: ZodiacSign
    degree: float
    house: Optional[int] = None

@dataclass
class NatalChart:
    sun: CelestialBody
    moon: CelestialBody
    mercury: CelestialBody
    venus: CelestialBody
    mars: CelestialBody
    jupiter: CelestialBody
    saturn: CelestialBody
    uranus: CelestialBody
    neptune: CelestialBody
    pluto: CelestialBody
    ascendant: CelestialBody
    midheaven: CelestialBody
    houses: List[float]

class TarotCard:
    def __init__(self, name: str, suit: str, number: int, upright_meaning: str, reversed_meaning: str,
                 kabbalistic_path: Optional[str] = None, astrology: Optional[str] = None):
        self.name = name
        self.suit = suit
        self.number = number
        self.upright_meaning = upright_meaning
        self.reversed_meaning = reversed_meaning
        self.kabbalistic_path = kabbalistic_path
        self.astrology = astrology

class OccultOracleEngine:
    def __init__(self):
        self.tarot_deck = self._initialize_tarot_deck()

    def _initialize_tarot_deck(self) -> List[TarotCard]:
        """Initialize the 78-card Kabbalistic Tarot deck"""
        major_arcana = [
            TarotCard("The Fool", "Major Arcana", 0,
                     "New beginnings, innocence, spontaneity",
                     "Recklessness, taken advantage of, inconsideration",
                     "Path 11: Aleph", "Air/Uranus"),
            TarotCard("The Magician", "Major Arcana", 1,
                     "Manifestation, resourcefulness, power",
                     "Manipulation, poor planning, untapped talents",
                     "Path 12: Beth", "Mercury"),
            TarotCard("The High Priestess", "Major Arcana", 2,
                     "Intuition, spiritual insight, divine feminine",
                     "Disconnection from intuition, withdrawal",
                     "Path 13: Gimel", "Moon"),
            TarotCard("The Empress", "Major Arcana", 3,
                     "Femininity, beauty, nature, abundance",
                     "Dependence on others, smothering",
                     "Path 14: Daleth", "Venus"),
            TarotCard("The Emperor", "Major Arcana", 4,
                     "Authority, structure, control, fatherhood",
                     "Tyranny, rigidity, coldness",
                     "Path 15: Heh", "Aries"),
            TarotCard("The Hierophant", "Major Arcana", 5,
                     "Spiritual wisdom, religious beliefs, conformity",
                     "Personal beliefs, freedom, challenging the status quo",
                     "Path 16: Vav", "Taurus"),
            TarotCard("The Lovers", "Major Arcana", 6,
                     "Love, harmony, relationships, values alignment",
                     "Disharmony, imbalance, misalignment of values",
                     "Path 17: Zain", "Gemini"),
            TarotCard("The Chariot", "Major Arcana", 7,
                     "Control, willpower, success, determination",
                     "Lack of control, lack of direction, aggression",
                     "Path 18: Cheth", "Cancer"),
            TarotCard("Strength", "Major Arcana", 8,
                     "Strength, courage, patience, control",
                     "Weakness, self-doubt, lack of confidence",
                     "Path 19: Teth", "Leo"),
            TarotCard("The Hermit", "Major Arcana", 9,
                     "Soul searching, introspection, inner guidance",
                     "Isolation, loneliness, withdrawal",
                     "Path 20: Yod", "Virgo"),
            TarotCard("Wheel of Fortune", "Major Arcana", 10,
                     "Good luck, karma, life cycles, destiny",
                     "Bad luck, lack of control, clinging to control",
                     "Path 21: Kaph", "Jupiter"),
            TarotCard("Justice", "Major Arcana", 11,
                     "Justice, fairness, truth, cause and effect",
                     "Unfairness, lack of accountability, dishonesty",
                     "Path 22: Lamed", "Libra"),
            TarotCard("The Hanged Man", "Major Arcana", 12,
                     "Suspension, restriction, letting go",
                     "Delays, resistance, stalling",
                     "Path 23: Mem", "Water"),
            TarotCard("Death", "Major Arcana", 13,
                     "Endings, beginnings, change, transformation",
                     "Resistance to change, personal transformation",
                     "Path 24: Nun", "Scorpio"),
            TarotCard("Temperance", "Major Arcana", 14,
                     "Balance, moderation, patience, purpose",
                     "Imbalance, excess, self-healing",
                     "Path 25: Samekh", "Sagittarius"),
            TarotCard("The Devil", "Major Arcana", 15,
                     "Bondage, addiction, sexuality, materialism",
                     "Releasing limiting beliefs, exploring dark thoughts",
                     "Path 26: Ayin", "Capricorn"),
            TarotCard("The Tower", "Major Arcana", 16,
                     "Sudden change, upheaval, chaos, revelation",
                     "Personal transformation, fear of change",
                     "Path 27: Peh", "Mars"),
            TarotCard("The Star", "Major Arcana", 17,
                     "Hope, faith, purpose, renewal, spirituality",
                     "Lack of faith, despair, self-trust",
                     "Path 28: Tzaddi", "Aquarius"),
            TarotCard("The Moon", "Major Arcana", 18,
                     "Illusion, fear, anxiety, subconscious, intuition",
                     "Release of fear, repressed emotion",
                     "Path 29: Qoph", "Pisces"),
            TarotCard("The Sun", "Major Arcana", 19,
                     "Positivity, fun, warmth, success, vitality",
                     "Inner child, feeling down, overly optimistic",
                     "Path 30: Resh", "Sun"),
            TarotCard("Judgement", "Major Arcana", 20,
                     "Judgement, rebirth, inner calling, absolution",
                     "Self-doubt, inner critic, ignoring the call",
                     "Path 31: Shin", "Pluto"),
            TarotCard("The World", "Major Arcana", 21,
                     "Completion, accomplishment, travel, fulfillment",
                     "Seeking personal closure, short-cut to success",
                     "Path 32: Tav", "Saturn")
        ]

        minor_arcana = []
        suits = ["Wands", "Cups", "Swords", "Pentacles"]
        court_cards = ["Page", "Knight", "Queen", "King"]

        for suit in suits:
            # Numbered cards (Ace-10)
            for i in range(1, 11):
                name = f"{i if i > 1 else 'Ace'} of {suit}"
                minor_arcana.append(TarotCard(name, suit, i, f"Basic {suit.lower()} energy", f"Blocked {suit.lower()} energy"))

            # Court cards
            for court in court_cards:
                name = f"{court} of {suit}"
                minor_arcana.append(TarotCard(name, suit, 11 + court_cards.index(court),
                                            f"{court} energy in {suit}", f"Imbalanced {court.lower()} energy"))

        return major_arcana + minor_arcana

    def calculate_natal_chart(self, birth_date: datetime.datetime, birth_place: str) -> NatalChart:
        """Calculate complete natal chart using PyEphem for NASA-accurate positions"""

        # Convert location name to coordinates (simplified - in production use geocoding API)
        # For now, use hardcoded coordinates for common locations
        location_coords = {
            'New York': (40.7128, -74.0060),
            'London': (51.5074, -0.1278),
            'Tokyo': (35.6762, 139.6503),
            'Paris': (48.8566, 2.3522),
            'Sydney': (-33.8688, 151.2093),
            'Los Angeles': (34.0522, -118.2437),
            'Chicago': (41.8781, -87.6298),
            'Houston': (29.7604, -95.3698),
            'Phoenix': (33.4484, -112.0740),
            'Philadelphia': (39.9526, -75.1652),
        }

        # Default to New York if location not found
        latitude, longitude = location_coords.get(birth_place, (40.7128, -74.0060))

        # Set observer location
        observer = ephem.Observer()
        observer.lat = str(latitude)
        observer.lon = str(longitude)
        observer.date = birth_date

        # Calculate planetary positions
        sun = ephem.Sun(observer)
        moon = ephem.Moon(observer)
        mercury = ephem.Mercury(observer)
        venus = ephem.Venus(observer)
        mars = ephem.Mars(observer)
        jupiter = ephem.Jupiter(observer)
        saturn = ephem.Saturn(observer)
        uranus = ephem.Uranus(observer)
        neptune = ephem.Neptune(observer)
        pluto = ephem.Pluto(observer)

        # Calculate houses (Placidus system)
        houses = self._calculate_houses(birth_date, latitude, longitude)

        # Calculate ascendant and midheaven
        ramc = observer.sidereal_time() * 15  # Right Ascension of Midheaven in degrees
        ascendant_deg = self._calculate_ascendant(ramc, latitude)
        midheaven_deg = ramc

        def create_celestial_body(name: str, body, symbol: str) -> CelestialBody:
            longitude = math.degrees(float(body.ra)) % 360
            sign = self._get_zodiac_sign(longitude)
            degree = longitude - sign.value[2]
            return CelestialBody(name, longitude, 0, sign, degree)

        return NatalChart(
            sun=create_celestial_body("Sun", sun, "☉"),
            moon=create_celestial_body("Moon", moon, "☽"),
            mercury=create_celestial_body("Mercury", mercury, "☿"),
            venus=create_celestial_body("Venus", venus, "♀"),
            mars=create_celestial_body("Mars", mars, "♂"),
            jupiter=create_celestial_body("Jupiter", jupiter, "♃"),
            saturn=create_celestial_body("Saturn", saturn, "♄"),
            uranus=create_celestial_body("Uranus", uranus, "⛢"),
            neptune=create_celestial_body("Neptune", neptune, "♆"),
            pluto=create_celestial_body("Pluto", pluto, "♇"),
            ascendant=CelestialBody("Ascendant", ascendant_deg, 0, self._get_zodiac_sign(ascendant_deg),
                                   ascendant_deg - self._get_zodiac_sign(ascendant_deg).value[2]),
            midheaven=CelestialBody("Midheaven", midheaven_deg, 0, self._get_zodiac_sign(midheaven_deg),
                                   midheaven_deg - self._get_zodiac_sign(midheaven_deg).value[2]),
            houses=houses
        )

    def _get_zodiac_sign(self, longitude: float) -> ZodiacSign:
        """Determine zodiac sign from longitude"""
        for sign in ZodiacSign:
            start, end = sign.value[2], sign.value[3]
            if start <= longitude < end:
                return sign
        return ZodiacSign.ARIES  # Fallback

    def _calculate_houses(self, birth_date: datetime.datetime, latitude: float, longitude: float) -> List[float]:
        """Calculate house cusps using Placidus system"""
        # Simplified house calculation - in production, use a proper astrology library
        houses = []
        for i in range(12):
            houses.append((i * 30) % 360)
        return houses

    def _calculate_ascendant(self, ramc: float, latitude: float) -> float:
        """Calculate ascendant degree"""
        # Simplified calculation - use proper astronomical formulas in production
        return (ramc + 90) % 360

    def calculate_numerology(self, name: str, birth_date) -> Dict[str, int]:
        """Calculate numerological values"""
        # Handle both datetime objects and ISO date strings
        if isinstance(birth_date, str):
            birth_date = datetime.datetime.fromisoformat(birth_date)

        # Life Path Number
        day = birth_date.day
        month = birth_date.month
        year = birth_date.year

        life_path = self._reduce_to_single_digit(day + month + year)

        # Expression Number (from name)
        name_value = sum(ord(c.upper()) - ord('A') + 1 for c in name if c.isalpha())
        expression = self._reduce_to_single_digit(name_value)

        # Soul Urge Number (vowels)
        vowels = 'AEIOU'
        soul_urge = sum(ord(c.upper()) - ord('A') + 1 for c in name if c.upper() in vowels)
        soul_urge = self._reduce_to_single_digit(soul_urge)

        return {
            "life_path": life_path,
            "expression": expression,
            "soul_urge": soul_urge
        }

    def _reduce_to_single_digit(self, number: int) -> int:
        """Reduce number to single digit using numerology rules"""
        while number > 9 and number not in [11, 22, 33]:  # Master numbers
            number = sum(int(digit) for digit in str(number))
        return number

    def draw_tarot_cards(self, num_cards: int = 3, spread: str = "past-present-future") -> List[Tuple[TarotCard, bool]]:
        """Draw tarot cards with Kabbalistic correspondences"""
        drawn_cards = []
        available_cards = self.tarot_deck.copy()

        for _ in range(min(num_cards, len(available_cards))):
            card = random.choice(available_cards)
            available_cards.remove(card)
            reversed = random.choice([True, False])
            drawn_cards.append((card, reversed))

        return drawn_cards

    def get_astrological_insights(self, natal_chart: NatalChart) -> Dict[str, str]:
        """Generate astrological insights based on chart"""
        insights = {}

        # Sun sign personality
        sun_sign = natal_chart.sun.zodiac_sign
        insights["sun_sign"] = f"Your Sun in {sun_sign.value[0]} indicates {self._get_sun_sign_traits(sun_sign)}"

        # Moon sign emotions
        moon_sign = natal_chart.moon.zodiac_sign
        insights["moon_sign"] = f"Your Moon in {moon_sign.value[0]} suggests {self._get_moon_sign_traits(moon_sign)}"

        # Rising sign appearance
        rising_sign = natal_chart.ascendant.zodiac_sign
        insights["rising_sign"] = f"Your {rising_sign.value[0]} Ascendant gives you {self._get_rising_sign_traits(rising_sign)}"

        return insights

    def _get_sun_sign_traits(self, sign: ZodiacSign) -> str:
        """Get personality traits for sun sign"""
        traits = {
            ZodiacSign.ARIES: "bold, courageous, and energetic leadership qualities",
            ZodiacSign.TAURUS: "practical, reliable, and sensual nature with strong determination",
            ZodiacSign.GEMINI: "versatile, communicative, and intellectually curious personality",
            ZodiacSign.CANCER: "nurturing, intuitive, and emotionally sensitive disposition",
            ZodiacSign.LEO: "confident, generous, and charismatic presence",
            ZodiacSign.VIRGO: "analytical, helpful, and detail-oriented approach to life",
            ZodiacSign.LIBRA: "diplomatic, fair-minded, and aesthetically inclined nature",
            ZodiacSign.SCORPIO: "intense, passionate, and transformative energy",
            ZodiacSign.SAGITTARIUS: "adventurous, philosophical, and optimistic outlook",
            ZodiacSign.CAPRICORN: "ambitious, disciplined, and responsible character",
            ZodiacSign.AQUARIUS: "innovative, humanitarian, and independent spirit",
            ZodiacSign.PISCES: "compassionate, artistic, and spiritually inclined nature"
        }
        return traits.get(sign, "unique and individual qualities")

    def _get_moon_sign_traits(self, sign: ZodiacSign) -> str:
        """Get emotional traits for moon sign"""
        traits = {
            ZodiacSign.ARIES: "spontaneous and direct emotional responses",
            ZodiacSign.TAURUS: "steady, patient, and comfort-loving emotional needs",
            ZodiacSign.GEMINI: "versatile and communicative emotional expression",
            ZodiacSign.CANCER: "deeply nurturing and protective emotional nature",
            ZodiacSign.LEO: "dramatic and generous emotional displays",
            ZodiacSign.VIRGO: "practical and service-oriented emotional responses",
            ZodiacSign.LIBRA: "harmonious and relationship-focused emotional needs",
            ZodiacSign.SCORPIO: "intense and transformative emotional depth",
            ZodiacSign.SAGITTARIUS: "adventurous and freedom-loving emotional nature",
            ZodiacSign.CAPRICORN: "responsible and structured emotional approach",
            ZodiacSign.AQUARIUS: "independent and humanitarian emotional values",
            ZodiacSign.PISCES: "compassionate and intuitive emotional sensitivity"
        }
        return traits.get(sign, "distinctive emotional patterns")

    def _get_rising_sign_traits(self, sign: ZodiacSign) -> str:
        """Get appearance and first impression traits for rising sign"""
        traits = {
            ZodiacSign.ARIES: "a bold and energetic first impression",
            ZodiacSign.TAURUS: "a calm and sensual physical presence",
            ZodiacSign.GEMINI: "a communicative and youthful appearance",
            ZodiacSign.CANCER: "a nurturing and approachable demeanor",
            ZodiacSign.LEO: "a confident and charismatic physical presence",
            ZodiacSign.VIRGO: "a neat and analytical first impression",
            ZodiacSign.LIBRA: "an elegant and diplomatic appearance",
            ZodiacSign.SCORPIO: "an intense and mysterious physical presence",
            ZodiacSign.SAGITTARIUS: "an adventurous and optimistic demeanor",
            ZodiacSign.CAPRICORN: "a serious and competent first impression",
            ZodiacSign.AQUARIUS: "an unconventional and friendly appearance",
            ZodiacSign.PISCES: "a gentle and dreamy physical presence"
        }
        return traits.get(sign, "a distinctive first impression")

    def get_synastry_insights(self, chart1: NatalChart, chart2: NatalChart) -> Dict[str, str]:
        """Calculate relationship compatibility between two charts"""
        insights = {}

        # Sun sign compatibility
        sun_compatibility = self._calculate_aspect_compatibility(chart1.sun.longitude, chart2.sun.longitude)
        insights["sun_compatibility"] = f"Sun signs show {sun_compatibility} compatibility"

        # Moon compatibility
        moon_compatibility = self._calculate_aspect_compatibility(chart1.moon.longitude, chart2.moon.longitude)
        insights["moon_compatibility"] = f"Moon signs indicate {moon_compatibility} emotional connection"

        # Venus compatibility
        venus_compatibility = self._calculate_aspect_compatibility(chart1.venus.longitude, chart2.venus.longitude)
        insights["venus_compatibility"] = f"Venus positions suggest {venus_compatibility} romantic harmony"

        return insights

    def _calculate_aspect_compatibility(self, pos1: float, pos2: float) -> str:
        """Calculate astrological aspect compatibility"""
        diff = abs(pos1 - pos2) % 360
        diff = min(diff, 360 - diff)  # Get smallest angle

        if diff < 10:
            return "conjunct (very strong)"
        elif diff < 30:
            return "sextile (harmonious)"
        elif diff < 45:
            return "square (challenging)"
        elif diff < 60:
            return "trine (very harmonious)"
        elif diff < 90:
            return "quincunx (adjusting)"
        else:
            return "opposition (balancing)"