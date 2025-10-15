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
    def calculate_personal_year(birth_date: datetime, year: int = None) -> Dict:
        """
        Calculate Personal Year Number - indicates themes for the year
        """
        try:
            if year is None:
                year = datetime.now().year
            
            day = birth_date.day
            month = birth_date.month
            
            # Add birth day + birth month + current year
            personal_year_sum = day + month + year
            personal_year_number = NumerologyCalculator.reduce_number(personal_year_sum)
            
            year_themes = {
                1: {
                    'theme': 'New Beginnings',
                    'focus': 'Independence, leadership, fresh starts',
                    'opportunities': 'Career advancement, personal projects, innovation',
                    'challenges': 'Impatience, isolation, being too aggressive',
                    'advice': 'Take initiative and start new ventures'
                },
                2: {
                    'theme': 'Cooperation & Relationships',
                    'focus': 'Partnership, diplomacy, patience',
                    'opportunities': 'Relationships, teamwork, collaboration',
                    'challenges': 'Indecision, over-sensitivity, dependency',
                    'advice': 'Focus on partnerships and building connections'
                },
                3: {
                    'theme': 'Creative Expression',
                    'focus': 'Communication, creativity, social expansion',
                    'opportunities': 'Creative projects, social networking, self-expression',
                    'challenges': 'Scattered energy, superficiality, gossip',
                    'advice': 'Express yourself creatively and expand social circle'
                },
                4: {
                    'theme': 'Hard Work & Foundation',
                    'focus': 'Organization, discipline, building stability',
                    'opportunities': 'Career building, financial security, organizing life',
                    'challenges': 'Rigidity, overwork, resistance to change',
                    'advice': 'Build solid foundations through consistent effort'
                },
                5: {
                    'theme': 'Freedom & Adventure',
                    'focus': 'Change, travel, exploration, freedom',
                    'opportunities': 'Travel, new experiences, career changes',
                    'challenges': 'Restlessness, impulsiveness, lack of focus',
                    'advice': 'Embrace change and seek new experiences'
                },
                6: {
                    'theme': 'Love & Responsibility',
                    'focus': 'Family, home, service, nurturing',
                    'opportunities': 'Marriage, family growth, home improvement',
                    'challenges': 'Worry, meddling, taking on too much responsibility',
                    'advice': 'Focus on family and home relationships'
                },
                7: {
                    'theme': 'Inner Wisdom',
                    'focus': 'Spirituality, analysis, introspection, learning',
                    'opportunities': 'Spiritual growth, education, research, self-discovery',
                    'challenges': 'Isolation, skepticism, being too analytical',
                    'advice': 'Seek inner wisdom and spiritual development'
                },
                8: {
                    'theme': 'Material Success',
                    'focus': 'Business, finances, achievement, recognition',
                    'opportunities': 'Financial gain, business success, recognition',
                    'challenges': 'Materialism, workaholism, power struggles',
                    'advice': 'Focus on business and financial goals'
                },
                9: {
                    'theme': 'Completion & Service',
                    'focus': 'Humanitarian service, completion, wisdom',
                    'opportunities': 'Humanitarian work, completion of projects, teaching',
                    'challenges': 'Emotional ups and downs, disappointment',
                    'advice': 'Complete old projects and serve others'
                },
                11: {
                    'theme': 'Spiritual Illumination',
                    'focus': 'Inspiration, intuition, enlightenment',
                    'opportunities': 'Spiritual leadership, inspiration, psychic development',
                    'challenges': 'Nervous tension, impracticality, extremes',
                    'advice': 'Trust your intuition and inspire others'
                },
                22: {
                    'theme': 'Master Building',
                    'focus': 'Large-scale projects, practical idealism',
                    'opportunities': 'Major achievements, building something lasting',
                    'challenges': 'Overwhelming pressure, perfectionism',
                    'advice': 'Think big and build something significant'
                }
            }
            
            return {
                'number': personal_year_number,
                'year': year,
                'calculation': f"{day} + {month} + {year} = {personal_year_sum} → {personal_year_number}",
                'theme_data': year_themes.get(personal_year_number, {}),
                'cosmic_influences': NumerologyCalculator.get_cosmic_influences(personal_year_number, year)
            }
            
        except Exception as e:
            logger.error(f"Error calculating personal year: {e}")
            return {'error': 'Invalid date or year'}

    @staticmethod
    def calculate_personal_month(birth_date: datetime, year: int = None, month: int = None) -> Dict:
        """
        Calculate Personal Month Number - monthly themes and influences
        """
        try:
            if year is None:
                year = datetime.now().year
            if month is None:
                month = datetime.now().month
                
            personal_year = NumerologyCalculator.calculate_personal_year(birth_date, year)['number']
            personal_month_number = NumerologyCalculator.reduce_number(personal_year + month)
            
            return {
                'number': personal_month_number,
                'year': year,
                'month': month,
                'calculation': f"Personal Year {personal_year} + Month {month} = {personal_month_number}",
                'monthly_focus': NumerologyCalculator.get_monthly_focus(personal_month_number),
                'cosmic_timing': NumerologyCalculator.get_cosmic_timing(personal_month_number, month)
            }
            
        except Exception as e:
            logger.error(f"Error calculating personal month: {e}")
            return {'error': 'Invalid date parameters'}

    @staticmethod
    def get_cosmic_influences(number: int, year: int) -> Dict:
        """
        Get cosmic influences for a numerology number in specific year
        """
        cosmic_cycles = {
            1: f"Solar influence strong in {year} - time for new cosmic beginnings",
            2: f"Lunar influence dominant in {year} - intuitive and receptive energy",
            3: f"Jupiter expansion in {year} - creative and optimistic cosmic flow",
            4: f"Earth energy grounded in {year} - practical manifestation period",
            5: f"Mercury influence active in {year} - communication and change",
            6: f"Venus energy harmonious in {year} - love and beauty emphasized",
            7: f"Neptune mystical in {year} - spiritual insights and deep wisdom",
            8: f"Saturn discipline in {year} - material achievement and structure",
            9: f"Mars completion in {year} - humanitarian service and endings",
            11: f"Uranus awakening in {year} - spiritual revolution and innovation",
            22: f"Pluto transformation in {year} - deep rebuilding and power"
        }
        
        return {
            'primary_influence': cosmic_cycles.get(number, f"Universal energy flowing in {year}"),
            'elemental_connection': NumerologyCalculator.get_elemental_connection(number),
            'chakra_activation': NumerologyCalculator.get_chakra_activation(number),
            'crystal_recommendations': NumerologyCalculator.get_crystal_recommendations(number)
        }

    @staticmethod
    def get_monthly_focus(number: int) -> Dict:
        """
        Get specific focus areas for personal month number
        """
        monthly_focuses = {
            1: "Initiate new projects, be independent, take leadership",
            2: "Collaborate, be patient, focus on relationships",
            3: "Express creativity, socialize, communicate ideas",
            4: "Organize, work hard, build foundations",
            5: "Seek freedom, travel, embrace change",
            6: "Nurture family, take responsibility, create harmony",
            7: "Study, meditate, seek inner wisdom",
            8: "Focus on business, finances, recognition",
            9: "Complete projects, serve others, let go of the past",
            11: "Trust intuition, inspire others, spiritual growth",
            22: "Think big, build something lasting, practical idealism"
        }
        
        return {
            'focus': monthly_focuses.get(number, "Follow your inner guidance"),
            'energy_level': NumerologyCalculator.get_energy_level(number),
            'recommended_actions': NumerologyCalculator.get_recommended_actions(number)
        }

    @staticmethod
    def get_elemental_connection(number: int) -> str:
        """
        Get elemental connection for numerology number
        """
        elemental_map = {
            1: "Fire - Dynamic, initiating, leadership energy",
            2: "Water - Flowing, emotional, intuitive energy", 
            3: "Air - Creative, communicative, social energy",
            4: "Earth - Grounded, practical, stable energy",
            5: "Air - Changing, versatile, freedom-seeking energy",
            6: "Earth - Nurturing, responsible, harmonious energy",
            7: "Water - Deep, mystical, analytical energy",
            8: "Fire - Powerful, ambitious, material energy",
            9: "Fire - Completing, humanitarian, wise energy",
            11: "Air - Inspirational, intuitive, visionary energy",
            22: "Earth - Master building, practical visionary energy",
            33: "Water - Master healing, compassionate service energy"
        }
        return elemental_map.get(number, "Universal energy")

    @staticmethod
    def get_chakra_activation(number: int) -> str:
        """
        Get primary chakra activation for numerology number
        """
        chakra_map = {
            1: "Root Chakra - Survival, grounding, foundation",
            2: "Sacral Chakra - Creativity, sexuality, emotions",
            3: "Solar Plexus - Personal power, confidence, will",
            4: "Heart Chakra - Love, compassion, connection",
            5: "Throat Chakra - Communication, truth, expression",
            6: "Heart Chakra - Unconditional love, service",
            7: "Crown Chakra - Spirituality, wisdom, connection to divine",
            8: "Solar Plexus - Material power, achievement, control",
            9: "Crown Chakra - Universal love, completion, wisdom",
            11: "Third Eye - Intuition, psychic abilities, vision",
            22: "All Chakras - Master integration of all energy centers",
            33: "Heart & Crown - Master healing and teaching energy"
        }
        return chakra_map.get(number, "Balanced energy flow")

    @staticmethod
    def get_crystal_recommendations(number: int) -> List[str]:
        """
        Get crystal recommendations for numerology number
        """
        crystal_map = {
            1: ["Garnet", "Red Jasper", "Hematite", "Ruby"],
            2: ["Moonstone", "Rose Quartz", "Pearl", "Selenite"],
            3: ["Citrine", "Amber", "Tiger's Eye", "Carnelian"],
            4: ["Green Aventurine", "Moss Agate", "Emerald", "Malachite"],
            5: ["Amazonite", "Turquoise", "Aquamarine", "Blue Lace Agate"],
            6: ["Rose Quartz", "Emerald", "Rhodonite", "Green Tourmaline"],
            7: ["Amethyst", "Clear Quartz", "Labradorite", "Fluorite"],
            8: ["Pyrite", "Tiger's Eye", "Citrine", "Black Tourmaline"],
            9: ["Sapphire", "Lapis Lazuli", "Sodalite", "Clear Quartz"],
            11: ["Moldavite", "Celestite", "Angelite", "Clear Quartz"],
            22: ["Master Quartz", "Herkimer Diamond", "Moldavite", "All crystals"],
            33: ["Sugilite", "Charoite", "Moldavite", "Rose Quartz"]
        }
        return crystal_map.get(number, ["Clear Quartz", "Amethyst"])

    @staticmethod
    def get_energy_level(number: int) -> str:
        """
        Get energy level description for number
        """
        energy_levels = {
            1: "High - Dynamic action energy", 2: "Medium - Gentle flowing energy",
            3: "High - Creative social energy", 4: "Medium - Steady building energy", 
            5: "Very High - Restless change energy", 6: "Medium - Nurturing stable energy",
            7: "Low - Introspective deep energy", 8: "High - Ambitious driving energy",
            9: "Medium - Wise completion energy", 11: "Very High - Spiritual electric energy",
            22: "Intense - Master building energy", 33: "Intense - Master healing energy"
        }
        return energy_levels.get(number, "Balanced universal energy")

    @staticmethod
    def get_recommended_actions(number: int) -> List[str]:
        """
        Get specific action recommendations for number
        """
        action_map = {
            1: ["Start new projects", "Take leadership roles", "Be independent"],
            2: ["Collaborate with others", "Practice patience", "Mediate conflicts"],
            3: ["Express creativity", "Socialize and network", "Share ideas openly"],
            4: ["Organize your life", "Work steadily", "Build foundations"],
            5: ["Seek new experiences", "Travel if possible", "Embrace changes"],
            6: ["Care for family", "Create harmony", "Take on responsibilities"],
            7: ["Study and research", "Meditate daily", "Seek solitude for wisdom"],
            8: ["Focus on business goals", "Manage finances", "Seek recognition"],
            9: ["Complete old projects", "Help others", "Release what's outdated"],
            11: ["Trust your intuition", "Inspire others", "Develop psychic abilities"],
            22: ["Think big", "Plan major projects", "Build lasting structures"],
            33: ["Teach and heal others", "Serve humanity", "Share wisdom"]
        }
        return action_map.get(number, ["Follow your inner guidance"])

    @staticmethod
    def get_numerology_compatibility(number1: int, number2: int) -> Dict:
        """
        Enhanced compatibility calculation between two numerology numbers
        """
        # Enhanced compatibility matrix with detailed scoring
        compatibility_scores = {
            (1, 1): 0.8, (1, 2): 0.6, (1, 3): 0.9, (1, 4): 0.5, (1, 5): 0.8,
            (1, 6): 0.6, (1, 7): 0.4, (1, 8): 0.7, (1, 9): 0.5, (1, 11): 0.7,
            (2, 2): 0.9, (2, 3): 0.7, (2, 4): 0.8, (2, 5): 0.5, (2, 6): 0.9,
            (2, 7): 0.6, (2, 8): 0.4, (2, 9): 0.7, (2, 11): 0.8, (3, 3): 0.8,
            (3, 4): 0.5, (3, 5): 0.9, (3, 6): 0.8, (3, 7): 0.6, (3, 8): 0.6,
            (3, 9): 0.8, (3, 11): 0.7, (4, 4): 0.7, (4, 5): 0.4, (4, 6): 0.8,
            (4, 7): 0.7, (4, 8): 0.9, (4, 9): 0.5, (4, 22): 0.9, (5, 5): 0.7,
            (5, 6): 0.5, (5, 7): 0.8, (5, 8): 0.6, (5, 9): 0.7, (6, 6): 0.8,
            (6, 7): 0.5, (6, 8): 0.6, (6, 9): 0.9, (7, 7): 0.8, (7, 8): 0.5,
            (7, 9): 0.9, (7, 11): 0.8, (8, 8): 0.7, (8, 9): 0.5, (9, 9): 0.8,
            (11, 11): 0.9, (22, 22): 0.8, (33, 33): 0.9
        }

        # Normalize to ensure both orderings work
        combination = tuple(sorted([number1, number2]))
        score = compatibility_scores.get(combination, 0.5)
        
        compatibility_levels = {
            0.9: "Excellent", 0.8: "Very Good", 0.7: "Good", 
            0.6: "Fair", 0.5: "Challenging", 0.4: "Difficult"
        }
        
        level = next((level for threshold, level in sorted(compatibility_levels.items(), reverse=True) 
                     if score >= threshold), "Challenging")

        return {
            'numbers': [number1, number2],
            'compatibility_score': score,
            'compatibility_level': level,
            'elemental_harmony': NumerologyCalculator.calculate_elemental_harmony(number1, number2),
            'relationship_advice': NumerologyCalculator.get_relationship_advice(number1, number2, score)
        }

    @staticmethod
    def calculate_elemental_harmony(number1: int, number2: int) -> Dict:
        """
        Calculate elemental harmony between two numbers
        """
        element1 = NumerologyCalculator.get_elemental_connection(number1).split(" - ")[0]
        element2 = NumerologyCalculator.get_elemental_connection(number2).split(" - ")[0]
        
        # Elemental relationships
        harmonious_pairs = [("Fire", "Air"), ("Earth", "Water")]
        same_element = element1 == element2
        complementary = any((element1, element2) in [(a, b), (b, a)] for a, b in harmonious_pairs)
        
        if same_element:
            return {"harmony": "Same Element", "description": "Natural understanding and shared approach"}
        elif complementary:
            return {"harmony": "Complementary", "description": "Balancing and supportive energies"}
        else:
            return {"harmony": "Challenging", "description": "Different approaches requiring understanding"}

    @staticmethod
    def get_relationship_advice(number1: int, number2: int, score: float) -> str:
        """
        Get specific relationship advice based on number combination
        """
        if score >= 0.8:
            return f"Numbers {number1} and {number2} create natural harmony. Focus on shared goals and mutual support."
        elif score >= 0.6:
            return f"Numbers {number1} and {number2} can work well together with understanding and compromise."
        else:
            return f"Numbers {number1} and {number2} may face challenges but can grow through patience and communication."

    @staticmethod
    def get_cosmic_number_significance(numbers: List[int], context: str = "general") -> Dict:
        """
        Get cosmic significance of number patterns and combinations
        """
        total = sum(numbers)
        reduced_total = NumerologyCalculator.reduce_number(total)
        
        # Identify special patterns
        patterns = NumerologyCalculator.identify_number_patterns(numbers)
        
        # Calculate cosmic resonance
        cosmic_resonance = NumerologyCalculator.calculate_cosmic_resonance(numbers)
        
        return {
            'numbers': numbers,
            'total': total,
            'reduced_total': reduced_total,
            'patterns': patterns,
            'cosmic_resonance': cosmic_resonance,
            'significance': NumerologyCalculator.get_pattern_significance(patterns, context),
            'recommendations': NumerologyCalculator.get_cosmic_recommendations(reduced_total, patterns)
        }

    @staticmethod
    def identify_number_patterns(numbers: List[int]) -> Dict:
        """
        Identify special patterns in number sequences
        """
        patterns = {}
        
        # Check for master numbers
        master_count = sum(1 for n in numbers if n in NumerologyCalculator.MASTER_NUMBERS)
        if master_count > 0:
            patterns['master_numbers'] = master_count
            
        # Check for repeated numbers
        from collections import Counter
        number_counts = Counter(numbers)
        repeated = {num: count for num, count in number_counts.items() if count > 1}
        if repeated:
            patterns['repeated_numbers'] = repeated
            
        # Check for sequential patterns
        sorted_nums = sorted(set(numbers))
        if len(sorted_nums) > 2:
            sequences = []
            for i in range(len(sorted_nums) - 2):
                if sorted_nums[i+1] == sorted_nums[i] + 1 and sorted_nums[i+2] == sorted_nums[i] + 2:
                    sequences.append(sorted_nums[i:i+3])
            if sequences:
                patterns['sequences'] = sequences
                
        return patterns

    @staticmethod
    def calculate_cosmic_resonance(numbers: List[int]) -> float:
        """
        Calculate cosmic resonance score for number combination
        """
        # Base resonance from number variety and balance
        unique_count = len(set(numbers))
        total_numbers = len(numbers)
        variety_score = unique_count / total_numbers if total_numbers > 0 else 0
        
        # Master number bonus
        master_bonus = sum(0.1 for n in numbers if n in NumerologyCalculator.MASTER_NUMBERS)
        
        # Balance score (how evenly distributed across 1-9 spectrum)
        if numbers:
            avg = sum(numbers) / len(numbers)
            ideal_avg = 5.0  # Center of 1-9 spectrum
            balance_score = 1.0 - (abs(avg - ideal_avg) / 4.0)  # Normalize to 0-1
        else:
            balance_score = 0
            
        cosmic_resonance = (variety_score * 0.4 + balance_score * 0.4 + master_bonus * 0.2)
        return min(1.0, cosmic_resonance)  # Cap at 1.0

    @staticmethod
    def get_pattern_significance(patterns: Dict, context: str) -> str:
        """
        Interpret the significance of identified patterns
        """
        if not patterns:
            return f"Balanced numeric energy for {context} - no dominant patterns detected"
            
        significance_parts = []
        
        if 'master_numbers' in patterns:
            count = patterns['master_numbers']
            significance_parts.append(f"Strong spiritual influence with {count} master number(s)")
            
        if 'repeated_numbers' in patterns:
            for num, count in patterns['repeated_numbers'].items():
                significance_parts.append(f"Emphasis on {num} energy (appears {count} times)")
                
        if 'sequences' in patterns:
            significance_parts.append("Sequential progression indicating natural flow and development")
            
        return f"Significant patterns for {context}: " + "; ".join(significance_parts)

    @staticmethod
    def get_cosmic_recommendations(reduced_total: int, patterns: Dict) -> List[str]:
        """
        Get cosmic recommendations based on number analysis
        """
        base_recommendations = NumerologyCalculator.get_recommended_actions(reduced_total)
        
        pattern_recommendations = []
        
        if 'master_numbers' in patterns:
            pattern_recommendations.append("Pay attention to spiritual insights and higher guidance")
            
        if 'repeated_numbers' in patterns:
            for num in patterns['repeated_numbers']:
                pattern_recommendations.append(f"Focus extra attention on {num} energy and themes")
                
        if 'sequences' in patterns:
            pattern_recommendations.append("Trust the natural progression of events in your life")
            
        return base_recommendations + pattern_recommendations

    @staticmethod
    def calculate_comprehensive_cosmic_profile(full_name: str, birth_date: datetime) -> Dict:
        """
        Calculate comprehensive numerological and cosmic profile
        """
        try:
            # Get all core numbers
            core_readings = NumerologyCalculator.calculate_comprehensive_readings(full_name, birth_date)
            
            # Calculate current cycles
            current_year = datetime.now().year
            current_month = datetime.now().month
            
            personal_year = NumerologyCalculator.calculate_personal_year(birth_date, current_year)
            personal_month = NumerologyCalculator.calculate_personal_month(birth_date, current_year, current_month)
            
            # Collect all numbers for cosmic analysis
            all_numbers = []
            for category in ['life_path', 'destiny', 'soul_urge', 'personality', 'birth_day']:
                if category in core_readings and 'number' in core_readings[category]:
                    all_numbers.append(core_readings[category]['number'])
            
            all_numbers.extend([personal_year['number'], personal_month['number']])
            
            # Cosmic significance analysis
            cosmic_significance = NumerologyCalculator.get_cosmic_number_significance(
                all_numbers, f"{full_name}'s cosmic profile"
            )
            
            return {
                'core_numbers': core_readings,
                'current_cycles': {
                    'personal_year': personal_year,
                    'personal_month': personal_month
                },
                'cosmic_analysis': cosmic_significance,
                'elemental_profile': NumerologyCalculator.get_comprehensive_elemental_profile(all_numbers),
                'chakra_profile': NumerologyCalculator.get_comprehensive_chakra_profile(all_numbers),
                'crystal_profile': NumerologyCalculator.get_comprehensive_crystal_profile(all_numbers),
                'yearly_forecast': NumerologyCalculator.get_yearly_forecast(birth_date, current_year),
                'calculated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating comprehensive cosmic profile: {e}")
            return {'error': 'Failed to calculate cosmic profile'}

    @staticmethod
    def get_comprehensive_elemental_profile(numbers: List[int]) -> Dict:
        """
        Analyze elemental composition of all numbers
        """
        element_counts = {'Fire': 0, 'Water': 0, 'Air': 0, 'Earth': 0}
        
        for number in numbers:
            element = NumerologyCalculator.get_elemental_connection(number).split(" - ")[0]
            if element in element_counts:
                element_counts[element] += 1
                
        total = sum(element_counts.values())
        element_percentages = {elem: (count/total)*100 if total > 0 else 0 
                             for elem, count in element_counts.items()}
        
        dominant_element = max(element_percentages.items(), key=lambda x: x[1])
        
        return {
            'element_distribution': element_percentages,
            'dominant_element': dominant_element[0],
            'dominant_percentage': dominant_element[1],
            'balance_analysis': NumerologyCalculator.analyze_elemental_balance(element_percentages)
        }

    @staticmethod
    def analyze_elemental_balance(percentages: Dict[str, float]) -> str:
        """
        Analyze elemental balance in personality
        """
        max_pct = max(percentages.values())
        min_pct = min(percentages.values())
        
        if max_pct > 60:
            dominant = max(percentages.items(), key=lambda x: x[1])[0]
            return f"Strongly {dominant}-dominant personality - may need to develop other elemental qualities"
        elif max_pct - min_pct < 15:
            return "Well-balanced elemental distribution - harmonious personality development"
        else:
            return "Moderate elemental balance - some areas stronger than others"

    @staticmethod
    def get_comprehensive_chakra_profile(numbers: List[int]) -> Dict:
        """
        Analyze chakra activation patterns
        """
        chakra_counts = {}
        
        for number in numbers:
            chakra = NumerologyCalculator.get_chakra_activation(number).split(" - ")[0]
            chakra_counts[chakra] = chakra_counts.get(chakra, 0) + 1
            
        return {
            'chakra_emphasis': chakra_counts,
            'primary_chakras': sorted(chakra_counts.items(), key=lambda x: x[1], reverse=True)[:3],
            'energy_flow_analysis': NumerologyCalculator.analyze_chakra_flow(chakra_counts)
        }

    @staticmethod
    def analyze_chakra_flow(chakra_counts: Dict[str, int]) -> str:
        """
        Analyze chakra energy flow patterns
        """
        if 'Root Chakra' in chakra_counts and chakra_counts['Root Chakra'] > 1:
            return "Strong grounding energy - well-connected to physical reality"
        elif 'Crown Chakra' in chakra_counts and chakra_counts['Crown Chakra'] > 1:
            return "Strong spiritual energy - highly connected to divine consciousness"
        elif 'Heart Chakra' in chakra_counts and chakra_counts['Heart Chakra'] > 1:
            return "Strong heart energy - love and compassion central to your being"
        else:
            return "Balanced chakra activation across energy centers"

    @staticmethod
    def get_comprehensive_crystal_profile(numbers: List[int]) -> Dict:
        """
        Get comprehensive crystal recommendations
        """
        all_crystals = []
        crystal_counts = {}
        
        for number in numbers:
            crystals = NumerologyCalculator.get_crystal_recommendations(number)
            all_crystals.extend(crystals)
            for crystal in crystals:
                crystal_counts[crystal] = crystal_counts.get(crystal, 0) + 1
                
        # Get most recommended crystals
        top_crystals = sorted(crystal_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'primary_crystals': [crystal for crystal, count in top_crystals],
            'crystal_frequency': crystal_counts,
            'daily_carry_recommendation': top_crystals[0][0] if top_crystals else "Clear Quartz",
            'meditation_crystals': [crystal for crystal, count in top_crystals[:3]]
        }

    @staticmethod
    def get_yearly_forecast(birth_date: datetime, year: int) -> Dict:
        """
        Get comprehensive yearly numerological forecast
        """
        personal_year = NumerologyCalculator.calculate_personal_year(birth_date, year)
        
        # Calculate each month's personal month number
        monthly_forecast = []
        for month in range(1, 13):
            month_data = NumerologyCalculator.calculate_personal_month(birth_date, year, month)
            monthly_forecast.append({
                'month': month,
                'month_name': datetime(year, month, 1).strftime('%B'),
                'personal_month_number': month_data['number'],
                'focus': month_data['monthly_focus']['focus'],
                'energy_level': month_data['monthly_focus']['energy_level']
            })
        
        return {
            'year': year,
            'personal_year': personal_year,
            'yearly_theme': personal_year['theme_data']['theme'],
            'yearly_focus': personal_year['theme_data']['focus'],
            'monthly_breakdown': monthly_forecast,
            'key_months': NumerologyCalculator.identify_key_months(monthly_forecast),
            'year_end_reflection': NumerologyCalculator.get_year_end_reflection(personal_year['number'])
        }

    @staticmethod
    def identify_key_months(monthly_forecast: List[Dict]) -> Dict:
        """
        Identify key months based on numerological patterns
        """
        key_months = {}
        
        for month_data in monthly_forecast:
            number = month_data['personal_month_number']
            month_name = month_data['month_name']
            
            if number == 1:
                key_months['new_beginnings'] = month_name
            elif number == 9:
                key_months['completion'] = month_name
            elif number in [11, 22, 33]:
                key_months['spiritual_intensity'] = month_name
            elif number == 5:
                key_months['major_changes'] = month_name
                
        return key_months

    @staticmethod
    def get_year_end_reflection(personal_year_number: int) -> str:
        """
        Get year-end reflection themes based on personal year
        """
        reflections = {
            1: "Reflect on new beginnings initiated and leadership roles embraced",
            2: "Consider relationships developed and collaborative achievements",
            3: "Celebrate creative expressions and social connections made",
            4: "Review foundations built and organizational accomplishments",
            5: "Acknowledge adventures taken and changes successfully navigated",
            6: "Appreciate family bonds strengthened and responsibilities fulfilled",
            7: "Honor wisdom gained and spiritual insights received",
            8: "Evaluate material achievements and business successes",
            9: "Recognize completions achieved and service rendered to others",
            11: "Contemplate spiritual growth and inspirational moments",
            22: "Assess major projects built and lasting impacts created"
        }
        
        return reflections.get(personal_year_number, "Reflect on the year's journey and lessons learned")

# Alias for backward compatibility
NumerologyEngine = NumerologyCalculator
