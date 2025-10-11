# -*- coding: utf-8 -*-
"""
Numerology Module for Star App
Calculates Life Path, Destiny, and other core numerology numbers
Based on Pythagorean Numerology system
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class NumerologyCalculator:
    """Main numerology calculator class"""

    # Pythagorean numerology chart (A=1, B=2, ..., I=9, J=1, etc.)
    NUMEROLOGY_CHART = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
    }

    # Master Numbers that shouldn't be reduced
    MASTER_NUMBERS = {11, 22, 33}

    # Number meanings and interpretations
    NUMBER_MEANINGS = {
        1: {
            'name': 'The Leader',
            'traits': 'Independent, ambitious, innovative, pioneering',
            'strengths': 'Leadership, courage, originality',
            'challenges': 'Impatience, arrogance, isolation',
            'vibration': 'Action, new beginnings, individuality'
        },
        2: {
            'name': 'The Diplomat',
            'traits': 'Cooperative, intuitive, peaceful, supportive',
            'strengths': 'Diplomacy, patience, partnership',
            'challenges': 'Oversensitivity, indecision, dependency',
            'vibration': 'Balance, harmony, cooperation'
        },
        3: {
            'name': 'The Communicator',
            'traits': 'Creative, expressive, social, optimistic',
            'strengths': 'Communication, creativity, joy',
            'challenges': 'Scattered energy, exaggeration, superficiality',
            'vibration': 'Expression, creativity, social interaction'
        },
        4: {
            'name': 'The Builder',
            'traits': 'Practical, organized, disciplined, reliable',
            'strengths': 'Stability, hard work, organization',
            'challenges': 'Rigidity, stubbornness, lack of flexibility',
            'vibration': 'Foundation, structure, practicality'
        },
        5: {
            'name': 'The Freedom Seeker',
            'traits': 'Adventurous, versatile, progressive, curious',
            'strengths': 'Adaptability, freedom, resourcefulness',
            'challenges': 'Restlessness, impulsiveness, inconsistency',
            'vibration': 'Change, freedom, experience'
        },
        6: {
            'name': 'The Nurturer',
            'traits': 'Responsible, caring, protective, harmonious',
            'strengths': 'Nurturing, responsibility, service',
            'challenges': 'Worry, meddling, perfectionism',
            'vibration': 'Love, family, responsibility'
        },
        7: {
            'name': 'The Seeker',
            'traits': 'Analytical, intuitive, spiritual, wise',
            'strengths': 'Wisdom, intuition, analysis',
            'challenges': 'Skepticism, isolation, perfectionism',
            'vibration': 'Wisdom, spirituality, analysis'
        },
        8: {
            'name': 'The Powerhouse',
            'traits': 'Ambitious, authoritative, efficient, organized',
            'strengths': 'Power, success, organization',
            'challenges': 'Materialism, workaholism, control issues',
            'vibration': 'Power, success, abundance'
        },
        9: {
            'name': 'The Humanitarian',
            'traits': 'Compassionate, generous, idealistic, wise',
            'strengths': 'Compassion, idealism, completion',
            'challenges': 'Emotionality, disappointment, martyrdom',
            'vibration': 'Completion, humanitarianism, wisdom'
        },
        11: {
            'name': 'The Intuitive Master',
            'traits': 'Inspirational, intuitive, idealistic, visionary',
            'strengths': 'Intuition, inspiration, enlightenment',
            'challenges': 'Nervous energy, sensitivity, impracticality',
            'vibration': 'Spiritual illumination, intuition'
        },
        22: {
            'name': 'The Master Builder',
            'traits': 'Practical visionary, powerful, disciplined',
            'strengths': 'Master building, large-scale projects, practicality',
            'challenges': 'Pressure, overwhelming responsibility',
            'vibration': 'Master builder, practical dreams'
        },
        33: {
            'name': 'The Master Teacher',
            'traits': 'Compassionate, healing, inspirational, serving',
            'strengths': 'Master teaching, healing, inspiration',
            'challenges': 'Martyrdom, overwhelming responsibility',
            'vibration': 'Master teacher, spiritual service'
        }
    }

    @staticmethod
    def reduce_number(number: int) -> int:
        """
        Reduce a number to a single digit, unless it's a master number
        """
        while number > 9 and number not in NumerologyCalculator.MASTER_NUMBERS:
            number = sum(int(digit) for digit in str(number))
        return number

    @staticmethod
    def calculate_life_path(birth_date: datetime) -> Dict:
        """
        Calculate Life Path Number from birth date
        This is the most important number in numerology
        """
        try:
            day = birth_date.day
            month = birth_date.month
            year = birth_date.year

            # Reduce day, month, year separately
            day_reduced = NumerologyCalculator.reduce_number(day)
            month_reduced = NumerologyCalculator.reduce_number(month)
            year_reduced = NumerologyCalculator.reduce_number(year)

            # Sum and reduce to final life path number
            life_path_sum = day_reduced + month_reduced + year_reduced
            life_path_number = NumerologyCalculator.reduce_number(life_path_sum)

            return {
                'number': life_path_number,
                'calculation': f"{day_reduced} + {month_reduced} + {year_reduced} = {life_path_sum} → {life_path_number}",
                'meaning': NumerologyCalculator.NUMBER_MEANINGS.get(life_path_number, {})
            }
        except Exception as e:
            logger.error(f"Error calculating life path: {e}")
            return {'error': 'Invalid birth date'}

    @staticmethod
    def calculate_destiny(full_name: str) -> Dict:
        """
        Calculate Destiny Number (Expression Number) from full name
        Represents natural talents and abilities
        """
        try:
            if not full_name or not full_name.strip():
                return {'error': 'Full name required'}

            total = 0
            calculation_steps = []

            for char in full_name.upper():
                if char in NumerologyCalculator.NUMEROLOGY_CHART:
                    value = NumerologyCalculator.NUMEROLOGY_CHART[char]
                    total += value
                    calculation_steps.append(f"{char}={value}")

            destiny_number = NumerologyCalculator.reduce_number(total)

            return {
                'number': destiny_number,
                'calculation': f"{' + '.join(calculation_steps)} = {total} → {destiny_number}",
                'meaning': NumerologyCalculator.NUMBER_MEANINGS.get(destiny_number, {})
            }
        except Exception as e:
            logger.error(f"Error calculating destiny number: {e}")
            return {'error': 'Invalid name format'}

    @staticmethod
    def calculate_soul_urge(full_name: str) -> Dict:
        """
        Calculate Soul Urge Number (Heart's Desire) from vowels in name
        Represents inner desires and motivations
        """
        try:
            if not full_name:
                return {'error': 'Full name required'}

            vowels = 'AEIOU'
            total = 0
            calculation_steps = []

            for char in full_name.upper():
                if char in vowels and char in NumerologyCalculator.NUMEROLOGY_CHART:
                    value = NumerologyCalculator.NUMEROLOGY_CHART[char]
                    total += value
                    calculation_steps.append(f"{char}={value}")

            soul_number = NumerologyCalculator.reduce_number(total)

            return {
                'number': soul_number,
                'calculation': f"{' + '.join(calculation_steps)} = {total} → {soul_number}",
                'meaning': NumerologyCalculator.NUMBER_MEANINGS.get(soul_number, {})
            }
        except Exception as e:
            logger.error(f"Error calculating soul urge number: {e}")
            return {'error': 'Invalid name format'}

    @staticmethod
    def calculate_personality(full_name: str) -> Dict:
        """
        Calculate Personality Number from consonants in name
        Represents how others perceive you
        """
        try:
            if not full_name:
                return {'error': 'Full name required'}

            vowels = 'AEIOU'
            total = 0
            calculation_steps = []

            for char in full_name.upper():
                if char not in vowels and char in NumerologyCalculator.NUMEROLOGY_CHART:
                    value = NumerologyCalculator.NUMEROLOGY_CHART[char]
                    total += value
                    calculation_steps.append(f"{char}={value}")

            personality_number = NumerologyCalculator.reduce_number(total)

            return {
                'number': personality_number,
                'calculation': f"{' + '.join(calculation_steps)} = {total} → {personality_number}",
                'meaning': NumerologyCalculator.NUMBER_MEANINGS.get(personality_number, {})
            }
        except Exception as e:
            logger.error(f"Error calculating personality number: {e}")
            return {'error': 'Invalid name format'}

    @staticmethod
    def calculate_birth_day(birth_date: datetime) -> Dict:
        """
        Calculate Birth Day Number
        Represents specific talents and abilities
        """
        try:
            day_number = NumerologyCalculator.reduce_number(birth_date.day)

            return {
                'number': day_number,
                'calculation': f"Day {birth_date.day} → {day_number}",
                'meaning': NumerologyCalculator.NUMBER_MEANINGS.get(day_number, {})
            }
        except Exception as e:
            logger.error(f"Error calculating birth day number: {e}")
            return {'error': 'Invalid birth date'}

    @staticmethod
    def calculate_comprehensive_readings(full_name: str, birth_date: datetime) -> Dict:
        """
        Calculate all core numerology numbers for a comprehensive reading
        """
        return {
            'life_path': NumerologyCalculator.calculate_life_path(birth_date),
            'destiny': NumerologyCalculator.calculate_destiny(full_name),
            'soul_urge': NumerologyCalculator.calculate_soul_urge(full_name),
            'personality': NumerologyCalculator.calculate_personality(full_name),
            'birth_day': NumerologyCalculator.calculate_birth_day(birth_date),
            'calculated_at': datetime.now().isoformat()
        }

    @staticmethod
    def get_numerology_compatibility(number1: int, number2: int) -> Dict:
        """
        Calculate compatibility between two numerology numbers
        """
        # Simple compatibility based on number vibrations
        compatible_combinations = [
            (1, 3), (1, 5), (2, 4), (2, 6), (3, 5), (3, 6),
            (4, 8), (5, 7), (6, 9), (7, 9), (8, 4), (9, 6)
        ]

        combination = tuple(sorted([number1, number2]))
        is_compatible = combination in compatible_combinations

        compatibility_levels = {
            True: "High Compatibility",
            False: "Needs Understanding"
        }

        return {
            'numbers': [number1, number2],
            'compatibility': is_compatible,
            'level': compatibility_levels[is_compatible],
            'message': f"Numbers {number1} and {number2} have {compatibility_levels[is_compatible].lower()}"
        }
