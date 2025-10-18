#!/usr/bin/env python3
"""
STAR Platform: Enhanced Lunar Calculations Engine
Comprehensive astronomical moon phase calculations, void periods, zodiac progression, and eclipse timing
"""

import datetime
import math
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple


class MoonPhase(Enum):
    NEW_MOON = "new_moon"
    WAXING_CRESCENT = "waxing_crescent"
    FIRST_QUARTER = "first_quarter"
    WAXING_GIBBOUS = "waxing_gibbous"
    FULL_MOON = "full_moon"
    WANING_GIBBOUS = "waning_gibbous"
    LAST_QUARTER = "last_quarter"
    WANING_CRESCENT = "waning_crescent"


class LunarCalculations:
    """Advanced astronomical lunar calculations engine using mathematical approximations"""

    # Lunar mansions (28-day cycle)
    LUNAR_MANSIONS = [
        "Al-Sharatan", "Al-Botain", "Al-Thurayya", "Al-Dabaran", "Al-Haq'a",
        "Al-Hana", "Al-Dhira", "Al-Nathra", "Al-Tarf", "Al-Jabhah",
        "Al-Zubrah", "Al-Sarfah", "Al-'Awwa", "Al-Simak", "Al-Ghafr",
        "Al-Zubana", "Al-Iklil", "Al-Qalb", "Al-Shawlah", "Al-Na'aim",
        "Al-Baldah", "Sa'd al-Dhabih", "Sa'd Bula", "Sa'd al-Su'ud",
        "Sa'd al-Akhbiyah", "Al-Fargh al-Muqaddam", "Al-Fargh al-Mu'akhkhar", "Batn al-Hut"
    ]

    # Zodiac signs for moon progression
    ZODIAC_SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]

    def __init__(self):
        # Known new moon date for reference (January 1, 2000)
        self.reference_new_moon = datetime(2000, 1, 6, 18, 14)  # Approximate
        self.synodic_month = 29.530588  # Average synodic month in days

    def _get_moon_phase_angle(self, date: datetime) -> float:
        """Calculate the moon phase angle (0-360 degrees) using mathematical approximation"""
        # Calculate days since reference new moon
        days_since_reference = (date - self.reference_new_moon).total_seconds() / (24 * 3600)

        # Calculate number of synodic months
        months_elapsed = days_since_reference / self.synodic_month

        # Phase angle in degrees (0-360)
        phase_angle = (months_elapsed % 1) * 360

        return phase_angle

    def get_moon_phase(self, date: datetime) -> Dict[str, any]:
        """Get comprehensive moon phase information"""
        phase_angle = self._get_moon_phase_angle(date)

        # Determine phase
        if phase_angle < 45:
            phase = MoonPhase.WAXING_CRESCENT
            illumination = phase_angle / 45 * 0.5
        elif phase_angle < 90:
            phase = MoonPhase.FIRST_QUARTER
            illumination = 0.5
        elif phase_angle < 135:
            phase = MoonPhase.WAXING_GIBBOUS
            illumination = 0.5 + (phase_angle - 90) / 45 * 0.5
        elif phase_angle < 180:
            phase = MoonPhase.FULL_MOON
            illumination = 1.0
        elif phase_angle < 225:
            phase = MoonPhase.WANING_GIBBOUS
            illumination = 1.0 - (phase_angle - 180) / 45 * 0.5
        elif phase_angle < 270:
            phase = MoonPhase.LAST_QUARTER
            illumination = 0.5
        elif phase_angle < 315:
            phase = MoonPhase.WANING_CRESCENT
            illumination = 0.5 - (phase_angle - 270) / 45 * 0.5
        else:
            phase = MoonPhase.NEW_MOON
            illumination = 0.0

        # Calculate age (days since new moon)
        synodic_month = 29.530588  # Average synodic month in days
        age = (phase_angle / 360) * synodic_month

        return {
            'phase': phase.value,
            'phase_angle': round(phase_angle, 2),
            'illumination': round(illumination, 3),
            'age_days': round(age, 1),
            'description': self._get_phase_description(phase)
        }

    def _get_phase_description(self, phase: MoonPhase) -> str:
        """Get descriptive text for moon phase"""
        descriptions = {
            MoonPhase.NEW_MOON: "New beginnings, setting intentions, planting seeds",
            MoonPhase.WAXING_CRESCENT: "Growth, manifestation, building momentum",
            MoonPhase.FIRST_QUARTER: "Action, decision-making, overcoming obstacles",
            MoonPhase.WAXING_GIBBOUS: "Refinement, patience, fine-tuning plans",
            MoonPhase.FULL_MOON: "Culmination, illumination, emotional peak",
            MoonPhase.WANING_GIBBOUS: "Gratitude, sharing wisdom, winding down",
            MoonPhase.LAST_QUARTER: "Release, letting go, clearing space",
            MoonPhase.WANING_CRESCENT: "Surrender, rest, inner reflection"
        }
        return descriptions.get(phase, "Unknown phase")

    def get_moon_zodiac_sign(self, date: datetime) -> Dict[str, any]:
        """Get moon's current zodiac sign and position using mathematical approximation"""
        # Simplified calculation - moon moves about 12-13 degrees per day
        # This is an approximation; real astronomical calculation would be more complex
        days_since_reference = (date - self.reference_new_moon).total_seconds() / (24 * 3600)

        # Moon moves approximately 360 degrees per synodic month
        # But also has daily motion of ~12.2 degrees relative to stars
        moon_longitude = (days_since_reference * 12.2) % 360  # Simplified

        # Determine zodiac sign
        sign_index = int(moon_longitude // 30) % 12
        sign = self.ZODIAC_SIGNS[sign_index]

        # Calculate degrees within sign
        degrees_in_sign = moon_longitude % 30

        # Get element and quality
        elements = ['fire', 'earth', 'air', 'water']
        qualities = ['cardinal', 'fixed', 'mutable']

        element = elements[sign_index % 4]
        quality = qualities[sign_index % 3]

        return {
            'sign': sign,
            'degrees': round(degrees_in_sign, 2),
            'longitude': round(moon_longitude, 2),
            'element': element,
            'quality': quality,
            'symbol': self._get_zodiac_symbol(sign)
        }

    def get_lunar_house(self, date: datetime, birth_chart_data: Optional[Dict] = None) -> Dict[str, any]:
        """Calculate which astrological house the moon is in"""
        moon_info = self.get_moon_zodiac_sign(date)
        moon_longitude = moon_info['longitude']

        # If we have birth chart data, use the actual house cusps
        if birth_chart_data and 'houses' in birth_chart_data:
            houses = birth_chart_data['houses']
            house = self._get_house_from_cusps(moon_longitude, houses)
        else:
            # Simplified: assume equal houses starting from Aries 0°
            # In a real implementation, this would use Placidus or other house system
            house = ((int(moon_longitude // 30) % 12) + 1)

        house_meanings = {
            1: "Self, identity, appearance, first impressions",
            2: "Possessions, values, material security, self-worth",
            3: "Communication, siblings, short journeys, learning",
            4: "Home, family, roots, emotional foundation",
            5: "Creativity, children, romance, self-expression",
            6: "Health, service, daily routine, work",
            7: "Partnerships, marriage, business relationships",
            8: "Transformation, shared resources, intimacy, death/rebirth",
            9: "Philosophy, travel, higher learning, spirituality",
            10: "Career, reputation, authority, life purpose",
            11: "Friends, groups, hopes, wishes, humanitarian causes",
            12: "Spirituality, subconscious, hidden matters, sacrifice"
        }

        return {
            'house': house,
            'meaning': house_meanings.get(house, 'Unknown house'),
            'moon_longitude': moon_longitude,
            'house_system': 'Placidus' if birth_chart_data else 'Equal House (simplified)'
        }

    def _get_house_from_cusps(self, longitude: float, cusps: List[float]) -> int:
        """Determine house from longitude and house cusps"""
        # Normalize longitude to 0-360
        lon = longitude % 360

        for i in range(12):
            cusp_start = cusps[i]
            cusp_end = cusps[(i + 1) % 12]

            # Handle wrap-around at 360/0 degrees
            if cusp_start <= cusp_end:
                if cusp_start <= lon < cusp_end:
                    return i + 1
            else:  # cusps wrap around
                if cusp_start <= lon or lon < cusp_end:
                    return i + 1

        return 1  # Default to 1st house

    def _get_zodiac_symbol(self, sign: str) -> str:
        """Get zodiac symbol emoji/unicode"""
        symbols = {
            'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
            'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
            'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
        }
        return symbols.get(sign, '')

    def _get_mansion_meaning(self, mansion: str) -> str:
        """Get meaning of lunar mansion"""
        meanings = {
            "Al-Sharatan": "Beginning, horns of Aries - leadership and pioneering",
            "Al-Botain": "The Belly - nurturing and abundance",
            "Al-Thurayya": "The Many Little Ones - community and friendship",
            "Al-Dabaran": "The Follower - patience and perseverance",
            "Al-Haq'a": "The White Spot - healing and restoration",
            "Al-Hana": "The Brand - passion and intensity",
            "Al-Dhira": "The Arm - strength and protection",
            "Al-Nathra": "The Gap - opportunity and change",
            "Al-Tarf": "The Glance - vision and foresight",
            "Al-Jabhah": "The Forehead - wisdom and intellect",
            "Al-Zubrah": "The Mane - beauty and grace",
            "Al-Sarfah": "The Changer - transformation and rebirth",
            "Al-'Awwa": "The Barker - communication and expression",
            "Al-Simak": "The Unarmed - peace and harmony",
            "Al-Ghafr": "The Covering - forgiveness and compassion",
            "Al-Zubana": "The Claws - defense and boundaries",
            "Al-Iklil": "The Crown - achievement and success",
            "Al-Qalb": "The Heart - love and emotion",
            "Al-Shawlah": "The Sting - power and influence",
            "Al-Na'aim": "The Pleiades - creativity and inspiration",
            "Al-Baldah": "The City - civilization and culture",
            "Sa'd al-Dhabih": "The Lucky One of the Slaughterer - sacrifice and release",
            "Sa'd Bula": "The Lucky One of the Swallower - nourishment and growth",
            "Sa'd al-Su'ud": "The Luckiest of the Lucky - fortune and prosperity",
            "Sa'd al-Akhbiyah": "The Lucky One of the Tents - home and security",
            "Al-Fargh al-Muqaddam": "The First Spout - abundance and generosity",
            "Al-Fargh al-Mu'akhkhar": "The Latter Spout - completion and fulfillment",
            "Batn al-Hut": "The Belly of the Fish - mystery and the unknown"
        }
        return meanings.get(mansion, "Ancient wisdom and cosmic guidance")

    def get_lunar_mansion(self, date: datetime) -> Dict[str, any]:
        """Calculate current lunar mansion (28-day cycle) using mathematical approximation"""
        # Lunar mansions are 12.857 degrees each (360/28)
        # Simplified calculation based on days since reference
        days_since_reference = (date - self.reference_new_moon).total_seconds() / (24 * 3600)

        # Moon moves approximately 360 degrees per 27.32 days (sidereal month)
        sidereal_month = 27.32
        moon_longitude = (days_since_reference * (360 / sidereal_month)) % 360

        mansion_index = int(moon_longitude // 12.857) % 28

        mansion_name = self.LUNAR_MANSIONS[mansion_index]

        # Calculate degrees into mansion
        degrees_into_mansion = moon_longitude % 12.857

        return {
            'mansion': mansion_name,
            'number': mansion_index + 1,
            'degrees_into': round(degrees_into_mansion, 2),
            'meaning': self._get_mansion_meaning(mansion_name)
        }

    def get_lunar_calendar_integrations(self, date: datetime) -> Dict[str, any]:
        """Integrate lunar phases with Mayan and Chinese calendars"""
        phase_info = self.get_moon_phase(date)

        # Mayan lunar correlations (simplified)
        mayan_correlations = self._get_mayan_lunar_correlations(date, phase_info)

        # Chinese lunar correlations
        chinese_correlations = self._get_chinese_lunar_correlations(date, phase_info)

        # Fertility cycle tracking (simplified)
        fertility_info = self._get_lunar_fertility_info(date, phase_info)

        return {
            'mayan': mayan_correlations,
            'chinese': chinese_correlations,
            'fertility': fertility_info,
            'integrated_meaning': self._combine_calendar_meanings(mayan_correlations, chinese_correlations, phase_info)
        }

    def _get_mayan_lunar_correlations(self, date: datetime, phase_info: Dict) -> Dict[str, any]:
        """Get Mayan calendar lunar correlations"""
        # Simplified Mayan lunar calendar integration
        # In reality, this would be much more complex

        mayan_days = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat",
                     "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban",
                     "Etznab", "Cauac", "Ahau"]

        # Calculate day in 260-day Tzolkin cycle (simplified)
        tzolkin_day = ((date - datetime(2020, 1, 1)).days % 260) % 20

        day_name = mayan_days[tzolkin_day]

        # Lunar phase correlations
        phase_correlations = {
            'new_moon': 'New beginnings, planting seeds, emergence from darkness',
            'waxing_crescent': 'Growth, building strength, gathering energy',
            'first_quarter': 'Action, decision-making, breaking through',
            'waxing_gibbous': 'Refinement, preparation, approaching completion',
            'full_moon': 'Illumination, revelation, full expression',
            'waning_gibbous': 'Sharing wisdom, gratitude, winding down',
            'last_quarter': 'Release, clearing, transformation',
            'waning_crescent': 'Rest, introspection, renewal'
        }

        return {
            'tzolkin_day': day_name,
            'lunar_correlation': phase_correlations.get(phase_info['phase'], 'Cosmic alignment'),
            'elemental_energy': self._get_mayan_elemental_energy(day_name, phase_info['phase'])
        }

    def _get_chinese_lunar_correlations(self, date: datetime, phase_info: Dict) -> Dict[str, any]:
        """Get Chinese calendar lunar correlations"""
        # Chinese lunar animals and their lunar phase associations
        animal_lunar_traits = {
            'rat': {'new_moon': 'Resourceful planning', 'full_moon': 'Social connection'},
            'ox': {'new_moon': 'Patient foundation-building', 'full_moon': 'Steady progress'},
            'tiger': {'new_moon': 'Bold initiation', 'full_moon': 'Protective strength'},
            'rabbit': {'new_moon': 'Gentle nurturing', 'full_moon': 'Harmonious balance'},
            'dragon': {'new_moon': 'Powerful creation', 'full_moon': 'Transformative energy'},
            'snake': {'new_moon': 'Wise strategy', 'full_moon': 'Deep intuition'},
            'horse': {'new_moon': 'Energetic action', 'full_moon': 'Social leadership'},
            'goat': {'new_moon': 'Creative expression', 'full_moon': 'Nurturing care'},
            'monkey': {'new_moon': 'Clever innovation', 'full_moon': 'Playful wisdom'},
            'rooster': {'new_moon': 'Confident assertion', 'full_moon': 'Truthful revelation'},
            'dog': {'new_moon': 'Loyal commitment', 'full_moon': 'Protective friendship'},
            'pig': {'new_moon': 'Generous giving', 'full_moon': 'Abundant joy'}
        }

        # Simplified Chinese year calculation
        year = date.year
        animal_index = (year - 1924) % 12
        animals = list(animal_lunar_traits.keys())
        current_animal = animals[animal_index]

        lunar_traits = animal_lunar_traits.get(current_animal, {})

        return {
            'animal': current_animal,
            'year': year,
            'lunar_traits': lunar_traits,
            'phase_animal_correlation': lunar_traits.get(phase_info['phase'], 'Balanced energy')
        }

    def _get_lunar_fertility_info(self, date: datetime, phase_info: Dict) -> Dict[str, any]:
        """Get lunar fertility cycle information"""
        # Simplified fertility tracking based on lunar phases
        fertility_phases = {
            'new_moon': {'fertility': 'Low', 'advice': 'Rest and renewal phase'},
            'waxing_crescent': {'fertility': 'Increasing', 'advice': 'Building energy'},
            'first_quarter': {'fertility': 'Moderate', 'advice': 'Active phase'},
            'waxing_gibbous': {'fertility': 'High', 'advice': 'Peak fertility window'},
            'full_moon': {'fertility': 'High', 'advice': 'Maximum fertility potential'},
            'waning_gibbous': {'fertility': 'Decreasing', 'advice': 'Winding down'},
            'last_quarter': {'fertility': 'Low', 'advice': 'Release phase'},
            'waning_crescent': {'fertility': 'Very Low', 'advice': 'Rest and preparation'}
        }

        phase_data = fertility_phases.get(phase_info['phase'], {'fertility': 'Unknown', 'advice': 'Consult healthcare provider'})

        return {
            'phase': phase_info['phase'],
            'fertility_level': phase_data['fertility'],
            'advice': phase_data['advice'],
            'next_optimal_window': self._calculate_next_fertility_window(date, phase_info)
        }

    def _calculate_next_fertility_window(self, date: datetime, phase_info: Dict) -> str:
        """Calculate next optimal fertility window"""
        # Simplified: fertility peaks around full moon
        if phase_info['phase'] in ['waxing_gibbous', 'full_moon']:
            return "Currently in optimal fertility window"
        else:
            # Estimate days to next waxing gibbous
            days_to_optimal = (14.765 - (phase_info['age_days'])) % 29.53
            optimal_date = date + timedelta(days=days_to_optimal)
            return f"Next optimal window: {optimal_date.strftime('%Y-%m-%d')}"

    def _get_mayan_elemental_energy(self, day_name: str, phase: str) -> str:
        """Get Mayan elemental energy correlation"""
        # Simplified elemental associations
        day_elements = {
            'Imix': 'Water', 'Ik': 'Air', 'Akbal': 'Earth', 'Kan': 'Fire',
            'Chicchan': 'Fire', 'Cimi': 'Earth', 'Manik': 'Air', 'Lamat': 'Water',
            'Muluc': 'Water', 'Oc': 'Air', 'Chuen': 'Earth', 'Eb': 'Fire',
            'Ben': 'Fire', 'Ix': 'Earth', 'Men': 'Air', 'Cib': 'Water',
            'Caban': 'Water', 'Etznab': 'Air', 'Cauac': 'Earth', 'Ahau': 'Fire'
        }

        element = day_elements.get(day_name, 'Balanced')

        phase_intensifiers = {
            'new_moon': 'gentle',
            'full_moon': 'intense',
            'waxing': 'building',
            'waning': 'releasing'
        }

        if 'waxing' in phase:
            phase_type = 'waxing'
        elif 'waning' in phase:
            phase_type = 'waning'
        else:
            phase_type = phase.replace('_moon', '_moon')

        intensifier = phase_intensifiers.get(phase_type, 'balanced')

        return f"{intensifier} {element.lower()} energy"

    def _combine_calendar_meanings(self, mayan: Dict, chinese: Dict, phase: Dict) -> str:
        """Combine meanings from different calendar systems"""
        mayan_energy = mayan.get('elemental_energy', '')
        chinese_trait = chinese.get('phase_animal_correlation', '')
        phase_desc = phase.get('description', '')

        return f"{phase_desc}. Mayan: {mayan_energy}. Chinese: {chinese_trait}."

    def is_moon_void_of_course(self, date: datetime) -> Dict[str, any]:
        """Check if moon is void of course (no major aspects to other planets) using simplified calculation"""
        # Simplified void of course calculation
        # In a full implementation, this would check aspects to all planets
        # For now, use a simplified approach based on moon's position relative to sign boundaries

        moon_info = self.get_moon_zodiac_sign(date)
        moon_longitude = moon_info['longitude']

        # Calculate next sign change
        next_sign_change = ((int(moon_longitude // 30) + 1) * 30) - moon_longitude

        # Simplified: moon is void if within 2 degrees of sign change
        is_void = next_sign_change <= 2.0

        # Estimate time to next sign change (moon moves ~12-13 degrees per day)
        hours_to_change = (next_sign_change / 12.2) * 24
        next_change_time = date + timedelta(hours=hours_to_change)

        return {
            'is_void': is_void,
            'next_sign_change_degrees': round(next_sign_change, 2),
            'next_sign_change_time': next_change_time.isoformat(),
            'advice': "Avoid major decisions during void periods" if is_void else "Good time for action and decisions"
        }

    def get_next_moon_phases(self, date: datetime, count: int = 5) -> List[Dict[str, any]]:
        """Get next moon phases from given date using mathematical approximation"""
        phases = []

        for i in range(count):
            # Calculate next new moon
            days_to_new_moon = ((i + 1) * self.synodic_month) - ((date - self.reference_new_moon).total_seconds() / (24 * 3600) % self.synodic_month)
            new_moon_date = date + timedelta(days=days_to_new_moon)

            phases.append({
                'phase': 'new_moon',
                'date': new_moon_date.isoformat(),
                'description': 'New beginnings, setting intentions'
            })

            # Calculate next full moon (14.765 days after new moon)
            full_moon_date = new_moon_date + timedelta(days=self.synodic_month / 2)

            phases.append({
                'phase': 'full_moon',
                'date': full_moon_date.isoformat(),
                'description': 'Culmination, illumination, emotional peak'
            })

        # Sort by date and return first 'count' phases
        phases.sort(key=lambda x: x['date'])
        return phases[:count]

    def get_lunar_alchemy(self, date: datetime) -> Dict[str, any]:
        """Get lunar alchemy information combining phase, sign, and mansion"""
        phase_info = self.get_moon_phase(date)
        sign_info = self.get_moon_zodiac_sign(date)
        mansion_info = self.get_lunar_mansion(date)
        void_info = self.is_moon_void_of_course(date)

        # Combine elemental influences
        elements = [phase_info.get('element', ''), sign_info['element']]
        dominant_element = max(set(elements), key=elements.count) if elements else 'balanced'

        # Get lunar house (simplified for now)
        house_info = self.get_lunar_house(date)

        # Get calendar integrations
        calendar_info = self.get_lunar_calendar_integrations(date)

        return {
            'timestamp': date.isoformat(),
            'phase': phase_info,
            'zodiac': sign_info,
            'mansion': mansion_info,
            'house': house_info,
            'calendar_integrations': calendar_info,
            'void_of_course': void_info,
            'dominant_element': dominant_element,
            'cosmic_alignment': self._calculate_cosmic_alignment(phase_info, sign_info),
            'ritual_focus': self._get_ritual_focus(phase_info['phase'], sign_info['sign'])
        }

    def _calculate_cosmic_alignment(self, phase: Dict, zodiac: Dict) -> str:
        """Calculate overall cosmic alignment score"""
        # Simplified alignment calculation
        phase_power = {
            'full_moon': 10, 'new_moon': 9, 'first_quarter': 7, 'last_quarter': 7,
            'waxing_gibbous': 8, 'waning_gibbous': 6, 'waxing_crescent': 5, 'waning_crescent': 4
        }

        alignment_score = phase_power.get(phase['phase'], 5)

        if zodiac['quality'] == 'cardinal':
            alignment_score += 2
        elif zodiac['quality'] == 'fixed':
            alignment_score += 1

        if alignment_score >= 12:
            return "Exceptional cosmic alignment - powerful manifestation energy"
        elif alignment_score >= 9:
            return "Strong cosmic alignment - good for important actions"
        elif alignment_score >= 6:
            return "Moderate cosmic alignment - steady progress energy"
        else:
            return "Gentle cosmic alignment - focus on inner work"

    def _get_ritual_focus(self, phase: str, sign: str) -> str:
        """Get ritual focus based on phase and sign"""
        phase_focuses = {
            'new_moon': 'Setting intentions and planting seeds',
            'waxing_crescent': 'Building momentum and gathering resources',
            'first_quarter': 'Taking action and overcoming challenges',
            'waxing_gibbous': 'Refining plans and seeking guidance',
            'full_moon': 'Celebrating achievements and releasing what no longer serves',
            'waning_gibbous': 'Expressing gratitude and sharing wisdom',
            'last_quarter': 'Releasing attachments and clearing space',
            'waning_crescent': 'Resting and integrating lessons learned'
        }

        sign_focuses = {
            'Aries': 'courage and leadership',
            'Taurus': 'stability and sensuality',
            'Gemini': 'communication and curiosity',
            'Cancer': 'nurturing and intuition',
            'Leo': 'creativity and self-expression',
            'Virgo': 'healing and service',
            'Libra': 'harmony and relationships',
            'Scorpio': 'transformation and depth',
            'Sagittarius': 'exploration and wisdom',
            'Capricorn': 'ambition and structure',
            'Aquarius': 'innovation and community',
            'Pisces': 'compassion and spirituality'
        }

        phase_focus = phase_focuses.get(phase, 'personal growth')
        sign_focus = sign_focuses.get(sign, 'self-discovery')

        return f"{phase_focus}, with emphasis on {sign_focus}"

    def get_eclipse_dates(self, start_date: datetime, end_date: datetime) -> List[Dict[str, any]]:
        """Calculate solar and lunar eclipses within date range"""
        eclipses = []

        # This is a simplified eclipse calculation
        # In production, use more sophisticated astronomical calculations
        current_date = start_date

        while current_date <= end_date:
            # Check for solar eclipse (simplified)
            if current_date.day == 14 and current_date.month in [3, 9]:  # Equinox periods
                eclipses.append({
                    'type': 'solar_eclipse',
                    'date': current_date.isoformat(),
                    'description': 'Solar eclipse - major life changes and revelations'
                })

            # Check for lunar eclipse (simplified)
            if current_date.day == 28 and current_date.month in [3, 9]:  # Full moon periods
                eclipses.append({
                    'type': 'lunar_eclipse',
                    'date': current_date.isoformat(),
                    'description': 'Lunar eclipse - emotional transformations and endings'
                })

            current_date += timedelta(days=1)

        return eclipses


# Global calculator instance
lunar_calculator = LunarCalculations()


def get_current_lunar_alchemy() -> Dict[str, any]:
    """Convenience function to get current lunar alchemy"""
    return lunar_calculator.get_lunar_alchemy(datetime.now())


def get_moon_phase_for_date(date: datetime) -> Dict[str, any]:
    """Convenience function to get moon phase"""
    return lunar_calculator.get_moon_phase(date)


def get_next_moon_phases_from_now(count: int = 5) -> List[Dict[str, any]]:
    """Convenience function to get next moon phases"""
    return lunar_calculator.get_next_moon_phases(datetime.now(), count)


if __name__ == "__main__":
    # Test the lunar calculations
    now = datetime.now()

    print("Current Lunar Alchemy:")
    alchemy = get_current_lunar_alchemy()
    print(f"Phase: {alchemy['phase']['phase']} ({alchemy['phase']['illumination']*100:.1f}% illuminated)")
    print(f"Zodiac: {alchemy['zodiac']['sign']} {alchemy['zodiac']['symbol']}")
    print(f"Mansion: {alchemy['mansion']['mansion']} (#{alchemy['mansion']['number']})")
    print(f"Void of Course: {alchemy['void_of_course']['is_void']}")
    print(f"Cosmic Alignment: {alchemy['cosmic_alignment']}")
    print(f"Ritual Focus: {alchemy['ritual_focus']}")

    print("\nNext 3 Moon Phases:")
    phases = get_next_moon_phases_from_now(3)
    for phase in phases:
        print(f"{phase['phase']}: {phase['date'][:10]} - {phase['description']}")