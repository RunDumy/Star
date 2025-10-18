"""
Tonalpohualli Calculator for Aztec Day Signs and Galactic Tones
Based on the traditional 260-day Aztec sacred calendar
"""

import math
from datetime import date, datetime

# Aztec Day Signs in correct order (20 signs)
AZTEC_ZODIAC = {
    0: 'Crocodile', 1: 'Wind', 2: 'House', 3: 'Lizard', 4: 'Serpent', 
    5: 'Death', 6: 'Deer', 7: 'Rabbit', 8: 'Water', 9: 'Dog', 
    10: 'Monkey', 11: 'Grass', 12: 'Reed', 13: 'Jaguar', 14: 'Eagle',
    15: 'Vulture', 16: 'Movement', 17: 'Flint', 18: 'Storm', 19: 'Sun'
}

# Aztec Day Sign Actions/Traits
AZTEC_ZODIAC_ACTIONS = {
    'Crocodile': 'Primal, nurturing; creative chaos',
    'Wind': 'Communicative, visionary; restless intellect',
    'House': 'Protective, communal; family-oriented',
    'Lizard': 'Agile, resilient; adaptable survivor',
    'Serpent': 'Transformative, wise; passionate healer',
    'Death': 'Rebirth, transitional; philosophical',
    'Deer': 'Graceful, resilient; humanitarian',
    'Rabbit': 'Harmonious, creative; intuitive artist',
    'Water': 'Emotional, purifying; empathic flow',
    'Dog': 'Loyal, guiding; protective leader',
    'Monkey': 'Playful, inventive; trickster artist',
    'Grass': 'Flexible, grounded; resilient grower',
    'Reed': 'Resilient, visionary; skywalker',
    'Jaguar': 'Powerful, intuitive; warrior shaman',
    'Eagle': 'Visionary, free; soaring achiever',
    'Vulture': 'Wise, liberating; forgiving sage',
    'Movement': 'Dynamic, transformative; change-maker',
    'Flint': 'Obsidian-sharp, decisive; cutter of truth',
    'Storm': 'Revealing, purifying; thunderous renewal',
    'Sun': 'Enlightening, radiant; solar creator'
}

# Galactic Tones (Sacred Numbers 1-13)
GALACTIC_TONES = {
    1: {
        'name': 'Magnetic',
        'energy': 'Unity',
        'meaning': 'Attracts, unifies, attracts cooperation',
        'qualities': ['Leadership', 'Purpose', 'Unity'],
        'challenges': ['Over-attachment', 'Rigidity'],
        'color': 'Red',
        'symbol': '•'
    },
    2: {
        'name': 'Lunar',
        'energy': 'Polarity',
        'meaning': 'Challenges, stabilizes, cooperation',
        'qualities': ['Balance', 'Cooperation', 'Stability'],
        'challenges': ['Indecision', 'Over-analysis'],
        'color': 'White',
        'symbol': '••'
    },
    3: {
        'name': 'Electric',
        'energy': 'Service',
        'meaning': 'Bonds, activates, service',
        'qualities': ['Service', 'Activation', 'Bonding'],
        'challenges': ['Impatience', 'Scattered energy'],
        'color': 'Blue',
        'symbol': '•••'
    },
    4: {
        'name': 'Self-Existing',
        'energy': 'Form',
        'meaning': 'Defines, measures, forms',
        'qualities': ['Form', 'Definition', 'Measurement'],
        'challenges': ['Limitation', 'Stubbornness'],
        'color': 'Yellow',
        'symbol': '••••'
    },
    5: {
        'name': 'Overtone',
        'energy': 'Radiance',
        'meaning': 'Commands, empowers, radiance',
        'qualities': ['Command', 'Empowerment', 'Radiance'],
        'challenges': ['Domination', 'Ego'],
        'color': 'Red',
        'symbol': '•••••'
    },
    6: {
        'name': 'Rhythmic',
        'energy': 'Equality',
        'meaning': 'Organizes, balances, equality',  
        'qualities': ['Organization', 'Balance', 'Equality'],
        'challenges': ['Perfectionism', 'Rigidity'],
        'color': 'White',
        'symbol': '••••••'
    },
    7: {
        'name': 'Resonant',
        'energy': 'Attunement',
        'meaning': 'Channels, inspires, attunement',
        'qualities': ['Channeling', 'Inspiration', 'Attunement'],
        'challenges': ['Isolation', 'Over-spirituality'],
        'color': 'Blue',
        'symbol': '•••••••'
    },
    8: {
        'name': 'Galactic',
        'energy': 'Integrity',
        'meaning': 'Harmonizes, models, integrity',
        'qualities': ['Harmony', 'Modeling', 'Integrity'],
        'challenges': ['Perfectionism', 'Judgment'],
        'color': 'Yellow',
        'symbol': '••••••••'
    },
    9: {
        'name': 'Solar',
        'energy': 'Intention',
        'meaning': 'Completes, perfects, intention',
        'qualities': ['Completion', 'Perfection', 'Intention'],
        'challenges': ['Impatience', 'Rushing'],
        'color': 'Red',
        'symbol': '•••••••••'
    },
    10: {
        'name': 'Planetary',
        'energy': 'Manifestation',
        'meaning': 'Produces, manifests, perfects',
        'qualities': ['Production', 'Manifestation', 'Perfection'],
        'challenges': ['Materialism', 'Stubbornness'],
        'color': 'White',
        'symbol': '••••••••••'
    },
    11: {
        'name': 'Spectral',
        'energy': 'Liberation',
        'meaning': 'Dissolves, releases, liberation',
        'qualities': ['Dissolution', 'Release', 'Liberation'],
        'challenges': ['Chaos', 'Destruction'],
        'color': 'Blue',
        'symbol': '•••••••••••'
    },
    12: {
        'name': 'Crystal',
        'energy': 'Cooperation',
        'meaning': 'Dedicates, universalizes, cooperation',
        'qualities': ['Dedication', 'Universalization', 'Cooperation'],
        'challenges': ['Over-giving', 'Martyrdom'],
        'color': 'Yellow',
        'symbol': '••••••••••••'
    },
    13: {
        'name': 'Cosmic',
        'energy': 'Presence',
        'meaning': 'Transcends, endures, presence',
        'qualities': ['Transcendence', 'Endurance', 'Presence'],
        'challenges': ['Aloofness', 'Detachment'],
        'color': 'Red',
        'symbol': '•••••••••••••'
    }
}

def calculate_aztec_day_sign_and_tone(birth_date):
    """
    Calculate Aztec Day Sign and Sacred Number based on birthdate using the Tonalpohualli calendar.
    
    Args:
        birth_date (datetime.date or datetime.datetime): The birth date
        
    Returns:
        dict: Aztec sign information including day sign and sacred number
    """
    if isinstance(birth_date, datetime):
        birth_date = birth_date.date()
    
    # Base correlation date (GMT correlation constant)
    base_date = date(1970, 1, 1)  # Unix epoch as reference
    base_tonalpohualli = 0  # Adjust based on correlation
    
    # Calculate days since base date
    days_since_base = (birth_date - base_date).days
    
    # Calculate position in 260-day Tonalpohualli cycle
    tonalpohualli_position = (days_since_base + base_tonalpohualli) % 260
    
    # Calculate day sign (0-19) and sacred number (1-13)
    day_sign_index = tonalpohualli_position % 20
    sacred_number = (tonalpohualli_position % 13) + 1
    
    day_sign = AZTEC_ZODIAC[day_sign_index]
    
    return {
        'day_sign': day_sign,
        'sacred_number': sacred_number,
        'tonalpohualli_position': tonalpohualli_position,
        'description': f"{sacred_number} {day_sign}",
        'traits': AZTEC_ZODIAC_ACTIONS.get(day_sign, 'Mysterious, ancient, powerful'),
        'galactic_tone': GALACTIC_TONES.get(sacred_number, {})
    }

def get_daily_tonalpohualli():
    """Get today's Tonalpohualli energy"""
    today = date.today()
    return calculate_aztec_day_sign_and_tone(today)

def get_aztec_element(day_sign):
    """Get the element associated with an Aztec day sign."""
    elements = {
        'Crocodile': 'Earth', 'Wind': 'Air', 'House': 'Earth', 'Lizard': 'Water',
        'Serpent': 'Fire', 'Death': 'Fire', 'Deer': 'Earth', 'Rabbit': 'Air',
        'Water': 'Water', 'Dog': 'Earth', 'Monkey': 'Air', 'Grass': 'Earth',
        'Reed': 'Water', 'Jaguar': 'Fire', 'Eagle': 'Fire', 'Vulture': 'Air',
        'Movement': 'Water', 'Flint': 'Water', 'Storm': 'Air', 'Sun': 'Fire'
    }
    return elements.get(day_sign, 'Earth')

def get_aztec_quality(day_sign):
    """Get the quality category for an Aztec day sign."""
    qualities = {
        'Primal': ['Crocodile', 'Wind', 'House', 'Lizard', 'Serpent'],
        'Transformative': ['Death', 'Deer', 'Rabbit', 'Water', 'Dog'],
        'Creative': ['Monkey', 'Grass', 'Reed', 'Jaguar', 'Eagle'],
        'Transcendent': ['Vulture', 'Movement', 'Flint', 'Storm', 'Sun']
    }
    
    for quality, signs in qualities.items():
        if day_sign in signs:
            return quality
    return 'Primal'