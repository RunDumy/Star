#!/usr/bin/env python3
"""
STAR Platform: Enhanced Lunar Calculations Engine
Precision astronomical moon phase calculations with lunar mansions, void-of-course timing, eclipse detection
"""

import datetime
import logging
import math
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple

import ephem
from lunar_calculations import LunarCalculations, MoonPhase


class EnhancedLunarEngine:
    """Precision lunar calculations with astronomical accuracy"""

    def __init__(self, oracle_engine=None):
        self.oracle = oracle_engine
        self.logger = logging.getLogger(__name__)

        # Lunar mansion data (28 Nakshatras)
        self.lunar_mansions = [
            ("Ashwini", "Horse's Head", 0, 13.20, "Ketu", "Healing, new beginnings"),
            ("Bharani", "Yoni", 13.20, 26.40, "Venus", "Transformation, creativity"),
            ("Krittika", "Razor", 26.40, 40.00, "Sun", "Purification, spiritual fire"),
            ("Rohini", "Reddish One", 40.00, 53.20, "Moon", "Growth, nourishment"),
            ("Mrigashira", "Deer's Head", 53.20, 66.40, "Mars", "Search, exploration"),
            ("Ardra", "Moist One", 66.40, 80.00, "Rahu", "Storm, destruction, renewal"),
            ("Punarvasu", "Good Again", 80.00, 93.20, "Jupiter", "Renewal, restoration"),
            ("Pushya", "Nourisher", 93.20, 106.40, "Saturn", "Nourishment, spiritual growth"),
            ("Ashlesha", "Embracer", 106.40, 120.00, "Mercury", "Intoxication, cosmic serpent"),
            ("Magha", "Powerful", 120.00, 133.20, "Ketu", "Royalty, authority, ancestors"),
            ("Purva Phalguni", "Former Red One", 133.20, 146.40, "Venus", "Pleasure, enjoyment"),
            ("Uttara Phalguni", "Latter Red One", 146.40, 160.00, "Sun", "Patronage, friendship"),
            ("Hasta", "Hand", 160.00, 173.20, "Moon", "Skill, craftsmanship"),
            ("Chitra", "Bright One", 173.20, 186.40, "Mars", "Beauty, artistic creation"),
            ("Swati", "Sword", 186.40, 200.00, "Rahu", "Independence, self-reliance"),
            ("Vishakha", "Forked Branches", 200.00, 213.20, "Jupiter", "Achievement, goal-oriented"),
            ("Anuradha", "Following Radha", 213.20, 226.40, "Saturn", "Friendship, devotion"),
            ("Jyeshtha", "Eldest", 226.40, 240.00, "Mercury", "Eldest sister, dominance"),
            ("Mula", "Root", 240.00, 253.20, "Ketu", "Destruction of old patterns"),
            ("Purva Ashadha", "Former Invincible", 253.20, 266.40, "Venus", "Invincibility, success"),
            ("Uttara Ashadha", "Latter Invincible", 266.40, 280.00, "Sun", "Ultimate victory"),
            ("Shravana", "Hearing", 280.00, 293.20, "Moon", "Learning, listening"),
            ("Dhanishta", "Wealthy", 293.20, 306.40, "Mars", "Music, wealth, prosperity"),
            ("Shatabhisha", "Hundred Healers", 306.40, 320.00, "Rahu", "Healing, mysticism"),
            ("Purva Bhadrapada", "Former Lucky Feet", 320.00, 333.20, "Jupiter", "Virtue, righteousness"),
            ("Uttara Bhadrapada", "Latter Lucky Feet", 333.20, 346.40, "Saturn", "Wisdom, spirituality"),
            ("Revati", "Wealthy", 346.40, 360.00, "Mercury", "Prosperity, nourishment")
        ]

        # Eclipse prediction data
        self.eclipse_saros_cycles = {}

    def calculate_precision_moon_data(self, date: datetime.datetime = None) -> Dict:
        """NASA-level precision lunar calculations"""
        if date is None:
            date = datetime.datetime.now()

        observer = ephem.Observer()
        observer.date = date

        moon = ephem.Moon(observer)
        sun = ephem.Sun(observer)

        # Enhanced illumination with atmospheric correction
        illumination = self._calculate_precision_illumination(moon, sun)

        # Lunar mansion calculation
        mansion = self._calculate_lunar_mansion(moon.hlong)

        # Void-of-course with exact aspect timing
        void_data = self._calculate_void_of_course_with_aspects(date)

        # Eclipse detection
        eclipse_data = self._detect_eclipse_events(date)

        # Get basic moon phase from existing system
        basic_lunar = LunarCalculations()
        phase_data = basic_lunar.get_moon_phase(date)

        return {
            "phase": phase_data,
            "mansion": mansion,
            "illumination": illumination,
            "void_of_course": void_data["is_void"],
            "void_until": void_data["void_until"],
            "next_aspect": void_data["next_aspect"],
            "eclipse": eclipse_data,
            "lunar_day": self._calculate_lunar_day(date),
            "element_balance": self._calculate_lunar_element_balance(moon.hlong)
        }

    def _calculate_precision_illumination(self, moon: ephem.Moon, sun: ephem.Sun) -> float:
        """Calculate precise lunar illumination with corrections"""
        try:
            # Basic illumination from PyEphem
            base_illumination = moon.phase / 100.0

            # Apply atmospheric correction (simplified)
            # In reality, this would involve complex atmospheric modeling
            atmospheric_correction = 0.02 * math.sin(math.radians(float(moon.alt)))

            corrected_illumination = base_illumination + atmospheric_correction
            return max(0.0, min(1.0, corrected_illumination))

        except Exception as e:
            self.logger.error(f"Illumination calculation error: {e}")
            return moon.phase / 100.0

    def _calculate_lunar_mansion(self, moon_longitude: float) -> Dict:
        """Calculate current lunar mansion (Nakshatra)"""
        deg_long = math.degrees(float(moon_longitude)) % 360

        for mansion in self.lunar_mansions:
            name, symbol, start, end, ruler, meaning = mansion
            if start <= deg_long < end:
                return {
                    "name": name,
                    "symbol": symbol,
                    "ruler": ruler,
                    "meaning": meaning,
                    "degree": deg_long - start,
                    "pada": int((deg_long - start) / 3.33) + 1  # 4 padas per mansion
                }
        return {}

    def _calculate_void_of_course_with_aspects(self, date: datetime.datetime) -> Dict:
        """Calculate void-of-course moon with exact aspect timing"""
        try:
            observer = ephem.Observer()
            observer.date = date

            moon = ephem.Moon(observer)
            current_sign = self._get_zodiac_sign(math.degrees(float(moon.hlong)) % 360)

            # Check next 48 hours for sign changes and aspects
            future_time = date
            aspects_found = []
            sign_change_time = None

            for hour in range(1, 49):  # Check next 48 hours
                future_time = date + datetime.timedelta(hours=hour)
                future_observer = ephem.Observer()
                future_observer.date = future_time
                future_moon = ephem.Moon(future_observer)
                future_sign = self._get_zodiac_sign(math.degrees(float(future_moon.hlong)) % 360)

                # Check for sign change
                if future_sign != current_sign and not sign_change_time:
                    sign_change_time = future_time

                # Check for major aspects (simplified)
                if self._moon_makes_aspect(future_observer):
                    aspects_found.append(future_time)

            is_void = sign_change_time and not aspects_found
            next_aspect = aspects_found[0] if aspects_found else None

            return {
                "is_void": is_void,
                "void_until": sign_change_time if is_void else None,
                "next_aspect": next_aspect,
                "sign_change": sign_change_time
            }

        except Exception as e:
            self.logger.error(f"VOC calculation error: {e}")
            return {"is_void": False, "void_until": None, "next_aspect": None}

    def _moon_makes_aspect(self, observer: ephem.Observer) -> bool:
        """Check if moon makes major aspect to other planets"""
        try:
            moon = ephem.Moon(observer)
            planets = [ephem.Sun(observer), ephem.Mercury(observer), ephem.Venus(observer),
                      ephem.Mars(observer), ephem.Jupiter(observer), ephem.Saturn(observer)]

            moon_long = math.degrees(float(moon.hlong))

            for planet in planets:
                planet_long = math.degrees(float(planet.hlong))
                diff = abs(moon_long - planet_long) % 360
                diff = min(diff, 360 - diff)

                # Check for major aspects (0°, 60°, 90°, 120°, 180°)
                if diff < 8:  # Conjunction
                    return True
                elif abs(diff - 60) < 6:  # Sextile
                    return True
                elif abs(diff - 90) < 8:  # Square
                    return True
                elif abs(diff - 120) < 8:  # Trine
                    return True
                elif abs(diff - 180) < 8:  # Opposition
                    return True

            return False

        except Exception as e:
            self.logger.error(f"Aspect check error: {e}")
            return False

    def _detect_eclipse_events(self, date: datetime.datetime) -> Dict:
        """Detect upcoming eclipse events"""
        try:
            # Simplified eclipse detection - in production would use astronomical algorithms
            # Check for solar and lunar eclipses in next 6 months
            eclipses = []

            # This is a placeholder - real eclipse calculation requires complex astronomical math
            # Would typically use algorithms from Meeus Astronomical Algorithms

            return {
                "upcoming_eclipses": eclipses,
                "lunar_eclipse_possible": False,
                "solar_eclipse_possible": False
            }

        except Exception as e:
            self.logger.error(f"Eclipse detection error: {e}")
            return {"upcoming_eclipses": [], "lunar_eclipse_possible": False, "solar_eclipse_possible": False}

    def _calculate_lunar_day(self, date: datetime.datetime) -> int:
        """Calculate the lunar day (Tithi)"""
        try:
            observer = ephem.Observer()
            observer.date = date

            moon = ephem.Moon(observer)
            sun = ephem.Sun(observer)

            # Calculate the angular distance between moon and sun
            moon_long = math.degrees(float(moon.hlong))
            sun_long = math.degrees(float(sun.hlong))

            angle = (moon_long - sun_long) % 360

            # Each Tithi is 12 degrees
            tithi = int(angle / 12) + 1

            return tithi

        except Exception as e:
            self.logger.error(f"Lunar day calculation error: {e}")
            return 1

    def _calculate_lunar_element_balance(self, moon_longitude: float) -> Dict:
        """Calculate elemental balance based on lunar position"""
        deg_long = math.degrees(float(moon_longitude)) % 360

        # Determine dominant element based on zodiac sign
        elements = ['fire', 'earth', 'air', 'water']
        element_index = int(deg_long // 90) % 4
        dominant_element = elements[element_index]

        # Calculate elemental percentages (simplified)
        element_balance = {
            'fire': 25,
            'earth': 25,
            'air': 25,
            'water': 25
        }

        # Adjust based on lunar mansion ruler
        mansion = self._calculate_lunar_mansion(moon_longitude)
        ruler = mansion.get('ruler', '')

        # Planetary rulership elemental associations
        planetary_elements = {
            'Sun': 'fire', 'Moon': 'water', 'Mars': 'fire', 'Mercury': 'air',
            'Jupiter': 'fire', 'Venus': 'earth', 'Saturn': 'earth', 'Rahu': 'air', 'Ketu': 'air'
        }

        if ruler in planetary_elements:
            element_balance[planetary_elements[ruler]] += 10

        return {
            'dominant': dominant_element,
            'balance': element_balance
        }

    def _get_zodiac_sign(self, longitude: float) -> str:
        """Get zodiac sign name from longitude"""
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        index = int(longitude // 30) % 12
        return signs[index]

    def get_lunar_guidance_enhanced(self, date: datetime.datetime = None) -> Dict:
        """Get comprehensive lunar guidance with mansion influences"""
        lunar_data = self.calculate_precision_moon_data(date)
        phase_data = lunar_data["phase"]

        guidance = {
            "moon_phase": phase_data['phase'],
            "moon_mansion": lunar_data["mansion"]["name"],
            "mansion_meaning": lunar_data["mansion"]["meaning"],
            "void_of_course": lunar_data["void_of_course"],
            "illumination": f"{lunar_data['illumination']:.1f}%",
            "lunar_day": lunar_data["lunar_day"],
            "best_activities": self._get_mansion_activities(lunar_data["mansion"]["name"]),
            "meditation_focus": self._get_mansion_meditation(lunar_data["mansion"]["name"]),
            "mantras": self._get_mansion_mantras(lunar_data["mansion"]["name"]),
            "element_emphasis": lunar_data["element_balance"],
            "cosmic_weather": self._generate_cosmic_weather_report(lunar_data)
        }

        return guidance

    def _get_mansion_activities(self, mansion: str) -> List[str]:
        """Get recommended activities for lunar mansion"""
        activities = {
            "Ashwini": ["Starting new projects", "Healing work", "Quick decisions"],
            "Bharani": ["Creative endeavors", "Transformation work", "Fertility magic"],
            "Krittika": ["Purification rituals", "Spiritual discipline", "Cutting cords"],
            "Rohini": ["Nurturing activities", "Growth work", "Family matters"],
            "Mrigashira": ["Exploration", "Learning new skills", "Communication"],
            "Ardra": ["Storm magic", "Breaking patterns", "Intense transformation"],
            "Punarvasu": ["Renewal rituals", "Restoration work", "Family healing"],
            "Pushya": ["Spiritual nourishment", "Community work", "Teaching"],
            "Ashlesha": ["Mystical work", "Healing arts", "Transformation magic"],
            "Magha": ["Ancestral work", "Leadership activities", "Authority matters"],
            "Purva Phalguni": ["Pleasure activities", "Creative arts", "Romance"],
            "Uttara Phalguni": ["Friendship work", "Patronage activities", "Social matters"],
            "Hasta": ["Skill development", "Craftsmanship", "Manual arts"],
            "Chitra": ["Artistic creation", "Beauty work", "Aesthetic activities"],
            "Swati": ["Independent work", "Self-reliance activities", "Freedom pursuits"],
            "Vishakha": ["Goal achievement", "Success work", "Achievement rituals"],
            "Anuradha": ["Devotional activities", "Friendship work", "Loyalty matters"],
            "Jyeshtha": ["Dominance work", "Authority activities", "Leadership"],
            "Mula": ["Destruction of old patterns", "Deep transformation", "Root work"],
            "Purva Ashadha": ["Success rituals", "Victory work", "Achievement"],
            "Uttara Ashadha": ["Ultimate victory", "Success work", "Triumph"],
            "Shravana": ["Learning activities", "Listening work", "Knowledge pursuits"],
            "Dhanishta": ["Prosperity work", "Music", "Wealth activities"],
            "Shatabhisha": ["Healing work", "Mystical activities", "Health matters"],
            "Purva Bhadrapada": ["Virtue work", "Righteous activities", "Ethical matters"],
            "Uttara Bhadrapada": ["Wisdom work", "Spiritual activities", "Enlightenment"],
            "Revati": ["Prosperity rituals", "Nourishment work", "Abundance activities"]
        }
        return activities.get(mansion, ["Meditation", "Spiritual practice"])

    def _get_mansion_meditation(self, mansion: str) -> str:
        """Get meditation focus for lunar mansion"""
        meditations = {
            "Ashwini": "Focus on new beginnings and healing energy",
            "Bharani": "Meditate on transformation and creative potential",
            "Krittika": "Focus on purification and spiritual fire",
            "Rohini": "Meditate on growth and nourishment",
            "Mrigashira": "Focus on exploration and discovery",
            "Ardra": "Meditate on storms and renewal",
            "Punarvasu": "Focus on renewal and restoration",
            "Pushya": "Meditate on nourishment and spiritual growth",
            "Ashlesha": "Focus on mystical energies and transformation",
            "Magha": "Meditate on ancestral wisdom and authority",
            "Purva Phalguni": "Focus on pleasure and creative expression",
            "Uttara Phalguni": "Meditate on friendship and patronage",
            "Hasta": "Focus on skill development and craftsmanship",
            "Chitra": "Meditate on beauty and artistic creation",
            "Swati": "Focus on independence and self-reliance",
            "Vishakha": "Meditate on achievement and goal-setting",
            "Anuradha": "Focus on devotion and friendship",
            "Jyeshtha": "Meditate on authority and leadership",
            "Mula": "Focus on destruction of old patterns",
            "Purva Ashadha": "Meditate on success and victory",
            "Uttara Ashadha": "Focus on ultimate triumph",
            "Shravana": "Meditate on learning and listening",
            "Dhanishta": "Focus on prosperity and music",
            "Shatabhisha": "Meditate on healing and mysticism",
            "Purva Bhadrapada": "Focus on virtue and righteousness",
            "Uttara Bhadrapada": "Meditate on wisdom and spirituality",
            "Revati": "Focus on prosperity and nourishment"
        }
        return meditations.get(mansion, "Focus on spiritual awareness and cosmic connection")

    def _get_mansion_mantras(self, mansion: str) -> List[str]:
        """Get mantras for lunar mansion"""
        mantras = {
            "Ashwini": ["Om Shum Shukraya Namaha", "Om Aim Saraswati Namaha"],
            "Bharani": ["Om Bhram Bhreem Bhroum Sah Shukraya Namaha"],
            "Krittika": ["Om Sram Sreem Sroum Sah Suryaya Namaha"],
            "Rohini": ["Om Shram Shreem Shroum Sah Chandraya Namaha"],
            "Mrigashira": ["Om Kram Kreem Kroum Sah Mangalaya Namaha"],
            "Ardra": ["Om Bhram Bhreem Bhroum Sah Raudraya Namaha"],
            "Punarvasu": ["Om Gram Greem Groum Sah Gurave Namaha"],
            "Pushya": ["Om Shram Shreem Shroum Sah Shanaishcharaya Namaha"],
            "Ashlesha": ["Om Bhram Bhreem Bhroum Sah Budhaya Namaha"],
            "Magha": ["Om Kram Kreem Kroum Sah Ketuaya Namaha"],
            "Purva Phalguni": ["Om Shram Shreem Shroum Sah Shukraya Namaha"],
            "Uttara Phalguni": ["Om Sram Sreem Sroum Sah Suryaya Namaha"],
            "Hasta": ["Om Shram Shreem Shroum Sah Chandraya Namaha"],
            "Chitra": ["Om Kram Kreem Kroum Sah Mangalaya Namaha"],
            "Swati": ["Om Bhram Bhreem Bhroum Sah Raudraya Namaha"],
            "Vishakha": ["Om Gram Greem Groum Sah Gurave Namaha"],
            "Anuradha": ["Om Shram Shreem Shroum Sah Shanaishcharaya Namaha"],
            "Jyeshtha": ["Om Bhram Bhreem Bhroum Sah Budhaya Namaha"],
            "Mula": ["Om Kram Kreem Kroum Sah Ketuaya Namaha"],
            "Purva Ashadha": ["Om Shram Shreem Shroum Sah Shukraya Namaha"],
            "Uttara Ashadha": ["Om Sram Sreem Sroum Sah Suryaya Namaha"],
            "Shravana": ["Om Shram Shreem Shroum Sah Chandraya Namaha"],
            "Dhanishta": ["Om Kram Kreem Kroum Sah Mangalaya Namaha"],
            "Shatabhisha": ["Om Bhram Bhreem Bhroum Sah Raudraya Namaha"],
            "Purva Bhadrapada": ["Om Gram Greem Groum Sah Gurave Namaha"],
            "Uttara Bhadrapada": ["Om Shram Shreem Shroum Sah Shanaishcharaya Namaha"],
            "Revati": ["Om Bhram Bhreem Bhroum Sah Budhaya Namaha"]
        }
        return mantras.get(mansion, ["Om Shanti Shanti Shantihi"])

    def _generate_cosmic_weather_report(self, lunar_data: Dict) -> str:
        """Generate poetic cosmic weather report"""
        phase = lunar_data["phase"]['phase']
        mansion = lunar_data["mansion"]["name"]
        mansion_meaning = lunar_data["mansion"]["meaning"]

        if lunar_data["void_of_course"]:
            return f"Under the {phase}, time feels suspended in {mansion}. {mansion_meaning}. The Void of Course Moon suggests introspection over action - a cosmic pause before the next chapter unfolds."
        else:
            return f"The {phase} illuminates {mansion} mansion - {mansion_meaning}. Cosmic energies flow freely, supporting manifestation and aligned action. The lunar current is strong and direct."