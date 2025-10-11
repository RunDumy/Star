# Analytics functionality for Star platform
import os
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request
from star_auth import token_required

# TODO: Replace with Azure Cosmos DB imports
# from supabase import create_client

analytics_bp = Blueprint('analytics', __name__)

# Initialize Supabase client
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')
# TODO: Replace with Azure Cosmos DB client initialization
# try:
#     supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
# except Exception as e:
#     print(f"Failed to initialize Supabase client: {e}")
#     supabase = None
supabase = None  # Temporarily disabled during Azure migration

@analytics_bp.route('/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    """Get analytics data for the platform - TEMPORARILY DISABLED during Azure migration"""
    return jsonify({
        'error': 'Analytics feature temporarily disabled during Azure migration',
        'message': 'This feature will be re-enabled with Cosmos DB integration'
    }), 503


@analytics_bp.route('/zodiac/compatibility', methods=['POST'])
@token_required
def calculate_zodiac_compatibility(current_user):
    """Calculate compatibility between two zodiac signs"""
    try:
        data = request.get_json()
        sign1 = data.get('sign1')
        sign2 = data.get('sign2')

        if not sign1 or not sign2:
            return jsonify({'error': 'Both signs are required'}), 400

        # Zodiac data
        zodiac_data = {
            'aries': {'name': 'Aries', 'element': 'Fire', 'traits': ['Bold', 'Energetic', 'Independent']},
            'taurus': {'name': 'Taurus', 'element': 'Earth', 'traits': ['Reliable', 'Patient', 'Practical']},
            'gemini': {'name': 'Gemini', 'element': 'Air', 'traits': ['Adaptable', 'Communicative', 'Witty']},
            'cancer': {'name': 'Cancer', 'element': 'Water', 'traits': ['Emotional', 'Intuitive', 'Protective']},
            'leo': {'name': 'Leo', 'element': 'Fire', 'traits': ['Creative', 'Passionate', 'Generous']},
            'virgo': {'name': 'Virgo', 'element': 'Earth', 'traits': ['Analytical', 'Practical', 'Hardworking']},
            'libra': {'name': 'Libra', 'element': 'Air', 'traits': ['Diplomatic', 'Fair-minded', 'Social']},
            'scorpio': {'name': 'Scorpio', 'element': 'Water', 'traits': ['Resourceful', 'Brave', 'Passionate']},
            'sagittarius': {'name': 'Sagittarius', 'element': 'Fire', 'traits': ['Optimistic', 'Freedom-loving', 'Jovial']},
            'capricorn': {'name': 'Capricorn', 'element': 'Earth', 'traits': ['Responsible', 'Disciplined', 'Ambitious']},
            'aquarius': {'name': 'Aquarius', 'element': 'Air', 'traits': ['Progressive', 'Original', 'Independent']},
            'pisces': {'name': 'Pisces', 'element': 'Water', 'traits': ['Compassionate', 'Artistic', 'Intuitive']}
        }

        if sign1 not in zodiac_data or sign2 not in zodiac_data:
            return jsonify({'error': 'Invalid zodiac signs'}), 400

        sign1_data = zodiac_data[sign1]
        sign2_data = zodiac_data[sign2]

        # Calculate compatibility score based on elements
        element_compatibility = {
            ('Fire', 'Fire'): 85, ('Fire', 'Air'): 90, ('Fire', 'Earth'): 70, ('Fire', 'Water'): 60,
            ('Air', 'Fire'): 90, ('Air', 'Air'): 80, ('Air', 'Earth'): 75, ('Air', 'Water'): 85,
            ('Earth', 'Fire'): 70, ('Earth', 'Air'): 75, ('Earth', 'Earth'): 88, ('Earth', 'Water'): 95,
            ('Water', 'Fire'): 60, ('Water', 'Air'): 85, ('Water', 'Earth'): 95, ('Water', 'Water'): 82
        }

        base_score = element_compatibility.get((sign1_data['element'], sign2_data['element']), 75)
        # Add some randomness for more realistic results
        import random
        score = min(100, max(50, base_score + random.randint(-10, 10)))

        # Determine rating
        if score >= 90:
            rating = 'excellent'
        elif score >= 80:
            rating = 'good'
        elif score >= 65:
            rating = 'moderate'
        else:
            rating = 'challenging'

        # Generate insights
        strengths = []
        challenges = []

        if sign1_data['element'] == sign2_data['element']:
            strengths.append(f"Shared {sign1_data['element'].lower()} energy creates natural harmony")
        elif (sign1_data['element'], sign2_data['element']) in [('Fire', 'Air'), ('Air', 'Fire'), ('Earth', 'Water'), ('Water', 'Earth')]:
            strengths.append("Complementary elements bring balance and growth")

        strengths.extend([
            f"Combined traits: {sign1_data['traits'][0]} + {sign2_data['traits'][0]}",
            "Mutual respect for individual strengths"
        ])

        challenges.extend([
            "Learning to balance different communication styles",
            "Navigating occasional misunderstandings"
        ])

        result = {
            'score': score,
            'description': f"{sign1_data['name']} and {sign2_data['name']} have a {rating} cosmic connection!",
            'strengths': strengths,
            'challenges': challenges,
            'elementHarmony': f"{sign1_data['element']} + {sign2_data['element']}",
            'overallRating': rating
        }

        return jsonify(result), 200

    except Exception as e:
        print(f"Zodiac compatibility error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@analytics_bp.route('/horoscopes/daily', methods=['GET'])
@token_required
def get_daily_horoscope(current_user):
    """Get daily horoscope for a zodiac sign"""
    try:
        sign = request.args.get('sign', '').lower()

        if not sign:
            return jsonify({'error': 'Zodiac sign is required'}), 400

        # Zodiac sign data
        zodiac_data = {
            'aries': {'name': 'Aries', 'element': 'Fire', 'traits': ['Bold', 'Energetic', 'Independent']},
            'taurus': {'name': 'Taurus', 'element': 'Earth', 'traits': ['Reliable', 'Patient', 'Practical']},
            'gemini': {'name': 'Gemini', 'element': 'Air', 'traits': ['Adaptable', 'Communicative', 'Witty']},
            'cancer': {'name': 'Cancer', 'element': 'Water', 'traits': ['Emotional', 'Intuitive', 'Protective']},
            'leo': {'name': 'Leo', 'element': 'Fire', 'traits': ['Creative', 'Passionate', 'Generous']},
            'virgo': {'name': 'Virgo', 'element': 'Earth', 'traits': ['Analytical', 'Hardworking', 'Kind']},
            'libra': {'name': 'Libra', 'element': 'Air', 'traits': ['Diplomatic', 'Fair-minded', 'Social']},
            'scorpio': {'name': 'Scorpio', 'element': 'Water', 'traits': ['Resourceful', 'Brave', 'Passionate']},
            'sagittarius': {'name': 'Sagittarius', 'element': 'Fire', 'traits': ['Optimistic', 'Freedom-loving', 'Honest']},
            'capricorn': {'name': 'Capricorn', 'element': 'Earth', 'traits': ['Responsible', 'Disciplined', 'Self-controlled']},
            'aquarius': {'name': 'Aquarius', 'element': 'Air', 'traits': ['Progressive', 'Original', 'Independent']},
            'pisces': {'name': 'Pisces', 'element': 'Water', 'traits': ['Compassionate', 'Artistic', 'Intuitive']}
        }

        if sign not in zodiac_data:
            return jsonify({'error': 'Invalid zodiac sign'}), 400

        sign_data = zodiac_data[sign]
        today = datetime.now(timezone.utc).date().isoformat()

        # Generate horoscope based on sign characteristics
        import random

        # Base predictions based on element
        element_predictions = {
            'Fire': [
                "Your fiery energy attracts exciting opportunities today.",
                "Creativity flows freely - express yourself boldly.",
                "Take initiative in projects that ignite your passion.",
                "Your natural leadership shines through in group settings."
            ],
            'Earth': [
                "Ground yourself in practical matters and steady progress.",
                "Focus on building solid foundations for future success.",
                "Patience and persistence lead to tangible results.",
                "Connect with nature for renewed strength and clarity."
            ],
            'Air': [
                "Communication flows smoothly - share your ideas freely.",
                "Intellectual pursuits bring satisfaction and growth.",
                "Social connections open new doors of opportunity.",
                "Adaptability helps you navigate changing circumstances."
            ],
            'Water': [
                "Trust your intuition as it guides important decisions.",
                "Emotional connections deepen and bring fulfillment.",
                "Creativity flows from your deepest emotions.",
                "Compassion for others creates meaningful bonds."
            ]
        }

        # Love readings
        love_readings = [
            "Romance blossoms through genuine connection and shared interests.",
            "Existing relationships deepen through honest communication.",
            "Single? Focus on self-love before seeking partnership.",
            "Family bonds strengthen through quality time together.",
            "Express appreciation to loved ones - it means more than you know."
        ]

        # Career readings
        career_readings = [
            "Professional opportunities present themselves - stay alert.",
            "Collaboration leads to innovative solutions at work.",
            "Take initiative on projects that excite your passion.",
            "Networking opens doors to exciting possibilities.",
            "Balance work demands with personal well-being."
        ]

        # Health readings
        health_readings = [
            "Prioritize rest and recovery for optimal energy levels.",
            "Gentle exercise supports both body and mind today.",
            "Mindful eating nourishes your body's true needs.",
            "Emotional wellness contributes to physical health.",
            "Listen to your body's signals for proper self-care."
        ]

        # Mood variations
        moods = ['optimistic', 'passionate', 'calm', 'energetic', 'thoughtful', 'adventurous']
        lucky_colors = ['Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Pink', 'Orange', 'Turquoise']

        # Generate horoscope
        horoscope = {
            'sign': sign,
            'date': today,
            'prediction': random.choice(element_predictions[sign_data['element']]),
            'love': random.choice(love_readings),
            'career': random.choice(career_readings),
            'health': random.choice(health_readings),
            'lucky_number': random.randint(1, 99),
            'lucky_color': random.choice(lucky_colors),
            'mood': random.choice(moods)
        }

        return jsonify(horoscope), 200

    except Exception as e:
        print(f"Daily horoscope error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


# Zodiac Personality Profiles Data
ZODIAC_PERSONALITIES = {
    'aries': {
        'name': 'Aries',
        'element': 'Fire',
        'symbol': '♈',
        'dates': 'March 21 - April 19',
        'personality': 'Bold, courageous, energetic, competitive, dynamic, quick-tempered, impatient, confident, independent, pioneering',
        'strengths': ['Leadership', 'Courage', 'Enthusiasm', 'Competitiveness', 'Dynamic energy', 'Independence'],
        'weaknesses': ['Impatience', 'Quick temper', 'Impulsiveness', 'Competitiveness taken too far', 'Restlessness'],
        'likes': ['Challenges', 'Physical activities', 'Leadership roles', 'Individual sports', 'New experiences'],
        'dislikes': ['Waiting', 'Inactivity', 'Being told what to do', 'Small talk', 'Routine work'],
        'ruling_planet': 'Mars',
        'compatibility': ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
        'lucky_numbers': [1, 8, 17],
        'lucky_colors': ['Red', 'White', 'Pink'],
        'lucky_gems': ['Diamond', 'Ruby', 'Garnet'],
        'career_paths': ['Entrepreneur', 'Athlete', 'Military', 'Sales', 'Emergency services', 'Management']
    },
    'taurus': {
        'name': 'Taurus',
        'element': 'Earth',
        'symbol': '♉',
        'dates': 'April 20 - May 20',
        'personality': 'Reliable, patient, practical, devoted, responsible, stable, determined, strong-willed, sensual, materialistic',
        'strengths': ['Reliability', 'Patience', 'Practicality', 'Devotion', 'Responsibility', 'Stability'],
        'weaknesses': ['Stubbornness', 'Possessiveness', 'Materialism', 'Resistance to change', 'Laziness'],
        'likes': ['Gardening', 'Cooking', 'Music', 'Romance', 'High quality items', 'Working with hands'],
        'dislikes': ['Sudden changes', 'Being rushed', 'Synthetic fabrics', 'Loud noises', 'Being pushed'],
        'ruling_planet': 'Venus',
        'compatibility': ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
        'lucky_numbers': [2, 6, 9, 12, 24],
        'lucky_colors': ['Green', 'Pink', 'Purple'],
        'lucky_gems': ['Emerald', 'Rose Quartz', 'Sapphire'],
        'career_paths': ['Banking', 'Agriculture', 'Real estate', 'Architecture', 'Music', 'Culinary arts']
    },
    'gemini': {
        'name': 'Gemini',
        'element': 'Air',
        'symbol': '♊',
        'dates': 'May 21 - June 20',
        'personality': 'Adaptable, communicative, witty, intellectual, eloquent, youthful, lively, nervous, tense, superficial',
        'strengths': ['Adaptability', 'Communication', 'Wit', 'Intellect', 'Eloquence', 'Versatility'],
        'weaknesses': ['Superficiality', 'Nervousness', 'Indecisiveness', 'Inconsistency', 'Restlessness'],
        'likes': ['Music', 'Books', 'Magazines', 'Chats with friends', 'Short trips', 'Variety'],
        'dislikes': ['Being alone', 'Routine', 'Being criticized', 'Repetition', 'Boredom'],
        'ruling_planet': 'Mercury',
        'compatibility': ['Libra', 'Aquarius', 'Aries', 'Leo'],
        'lucky_numbers': [5, 7, 14, 23],
        'lucky_colors': ['Yellow', 'Green', 'Blue'],
        'lucky_gems': ['Tiger Eye', 'Agate', 'Citrine'],
        'career_paths': ['Journalism', 'Teaching', 'Writing', 'Public relations', 'Sales', 'Tourism']
    },
    'cancer': {
        'name': 'Cancer',
        'element': 'Water',
        'symbol': '♋',
        'dates': 'June 21 - July 22',
        'personality': 'Emotional, intuitive, imaginative, shrewd, cautious, protective, sympathetic, changeable, moody, overemotional',
        'strengths': ['Intuition', 'Imagination', 'Loyalty', 'Protectiveness', 'Sympathy', 'Adaptability'],
        'weaknesses': ['Moodiness', 'Over-sensitivity', 'Clinginess', 'Pessimism', 'Suspicion'],
        'likes': ['Art', 'Home-based hobbies', 'Deep conversations', 'Being with family', 'Helping others'],
        'dislikes': ['Strangers', 'Being criticized', 'Sudden changes', 'Rejection', 'Public exposure'],
        'ruling_planet': 'Moon',
        'compatibility': ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
        'lucky_numbers': [2, 7, 11, 16, 20],
        'lucky_colors': ['White', 'Silver', 'Sea green'],
        'lucky_gems': ['Pearl', 'Moonstone', 'Ruby'],
        'career_paths': ['Nursing', 'Teaching', 'Psychology', 'Real estate', 'Catering', 'Politics']
    },
    'leo': {
        'name': 'Leo',
        'element': 'Fire',
        'symbol': '♌',
        'dates': 'July 23 - August 22',
        'personality': 'Creative, passionate, generous, warm-hearted, cheerful, humorous, arrogant, stubborn, lazy, inflexible',
        'strengths': ['Creativity', 'Passion', 'Generosity', 'Warmth', 'Cheerfulness', 'Leadership'],
        'weaknesses': ['Arrogance', 'Stubbornness', 'Laziness', 'Inflexibility', 'Jealousy'],
        'likes': ['Theater', 'Being admired', 'Expensive things', 'Bright colors', 'Fun with friends'],
        'dislikes': ['Being ignored', 'Being criticized', 'Being bossed around', 'Small-minded people'],
        'ruling_planet': 'Sun',
        'compatibility': ['Sagittarius', 'Aries', 'Gemini', 'Libra'],
        'lucky_numbers': [1, 3, 10, 19],
        'lucky_colors': ['Gold', 'Orange', 'White'],
        'lucky_gems': ['Ruby', 'Diamond', 'Sardonyx'],
        'career_paths': ['Acting', 'Entertainment', 'Management', 'Politics', 'Education', 'Sports']
    },
    'virgo': {
        'name': 'Virgo',
        'element': 'Earth',
        'symbol': '♍',
        'dates': 'August 23 - September 22',
        'personality': 'Analytical, observant, helpful, reliable, precise, shy, practical, intelligent, fussy, perfectionist',
        'strengths': ['Analytical', 'Observant', 'Helpful', 'Reliable', 'Precise', 'Intelligent'],
        'weaknesses': ['Perfectionism', 'Criticism', 'Shyness', 'Worry', 'Over-thinking'],
        'likes': ['Animals', 'Healthy food', 'Books', 'Nature', 'Cleanliness', 'Helping others'],
        'dislikes': ['Rudeness', 'Being asked for help', 'Taking center stage', 'Unhygienic environments'],
        'ruling_planet': 'Mercury',
        'compatibility': ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
        'lucky_numbers': [3, 15, 16, 23, 27],
        'lucky_colors': ['Green', 'White', 'Grey'],
        'lucky_gems': ['Sapphire', 'Jade', 'Emerald'],
        'career_paths': ['Healthcare', 'Research', 'Accounting', 'Teaching', 'Writing', 'Service industries']
    },
    'libra': {
        'name': 'Libra',
        'element': 'Air',
        'symbol': '♎',
        'dates': 'September 23 - October 22',
        'personality': 'Diplomatic, fair-minded, social, idealistic, partnership-oriented, gracious, tactful, indecisive, avoid confrontations',
        'strengths': ['Diplomacy', 'Fairness', 'Social skills', 'Idealism', 'Graciousness', 'Tact'],
        'weaknesses': ['Indecisiveness', 'Avoids confrontations', 'Self-pity', 'Easily influenced'],
        'likes': ['Harmony', 'Gentleness', 'Sharing with others', 'The outdoors', 'Beauty in all forms'],
        'dislikes': ['Violence', 'Injustice', 'Brutality', 'Being alone', 'Confrontation'],
        'ruling_planet': 'Venus',
        'compatibility': ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
        'lucky_numbers': [4, 6, 13, 15, 24],
        'lucky_colors': ['Blue', 'Green', 'Pink'],
        'lucky_gems': ['Opal', 'Lapis Lazuli', 'Sapphire'],
        'career_paths': ['Law', 'Diplomacy', 'Arts', 'Fashion', 'Social work', 'Counseling']
    },
    'scorpio': {
        'name': 'Scorpio',
        'element': 'Water',
        'symbol': '♏',
        'dates': 'October 23 - November 21',
        'personality': 'Resourceful, brave, passionate, stubborn, resourceful, loyal, suspicious, jealous, secretive, resentful',
        'strengths': ['Resourcefulness', 'Bravery', 'Passion', 'Determination', 'Loyalty', 'Intuition'],
        'weaknesses': ['Jealousy', 'Secretiveness', 'Resentfulness', 'Suspicion', 'Stubbornness'],
        'likes': ['Truth', 'Facts', 'Being right', 'Long-term friendships', 'Journalism', 'Detective work'],
        'dislikes': ['Dishonesty', 'Revealing secrets', 'Passive people', 'Superficiality', 'Small talk'],
        'ruling_planet': 'Pluto (Mars)',
        'compatibility': ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
        'lucky_numbers': [8, 11, 18, 22],
        'lucky_colors': ['Black', 'Red', 'Maroon'],
        'lucky_gems': ['Topaz', 'Opal', 'Ruby'],
        'career_paths': ['Research', 'Psychology', 'Investigation', 'Medicine', 'Law enforcement', 'Finance']
    },
    'sagittarius': {
        'name': 'Sagittarius',
        'element': 'Fire',
        'symbol': '♐',
        'dates': 'November 22 - December 21',
        'personality': 'Optimistic, freedom-loving, jovial, good-humored, honest, straightforward, intellectual, philosophical, careless, irresponsible',
        'strengths': ['Optimism', 'Freedom-loving', 'Joviality', 'Honesty', 'Straightforwardness', 'Intellect'],
        'weaknesses': ['Carelessness', 'Irresponsibility', 'Tactlessness', 'Restlessness', 'Over-confidence'],
        'likes': ['Travel', 'Getting to the heart of the matter', 'Freedom', 'Philosophy', 'Being outdoors'],
        'dislikes': ['Clingy people', 'Being constrained', 'Off-the-wall theories', 'Details', 'Being rushed'],
        'ruling_planet': 'Jupiter',
        'compatibility': ['Aries', 'Leo', 'Libra', 'Aquarius'],
        'lucky_numbers': [3, 9, 12, 21, 30],
        'lucky_colors': ['Blue', 'Purple', 'White'],
        'lucky_gems': ['Turquoise', 'Amethyst', 'Topaz'],
        'career_paths': ['Travel industry', 'Education', 'Publishing', 'Law', 'Philosophy', 'Religion']
    },
    'capricorn': {
        'name': 'Capricorn',
        'element': 'Earth',
        'symbol': '♑',
        'dates': 'December 22 - January 19',
        'personality': 'Responsible, disciplined, self-controlled, good managers, ambitious, independent, realistic, pessimistic, suspicious, stubborn',
        'strengths': ['Responsibility', 'Discipline', 'Self-control', 'Ambition', 'Independence', 'Realism'],
        'weaknesses': ['Pessimism', 'Suspicion', 'Stubbornness', 'Rigidity', 'Coldness'],
        'likes': ['Family', 'Tradition', 'Music', 'Quality craftsmanship', 'Underdog stories', 'Humility'],
        'dislikes': ['Almost everything at some point', 'Idleness', 'Time wasters', 'Flakiness', 'Disrespect'],
        'ruling_planet': 'Saturn',
        'compatibility': ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
        'lucky_numbers': [4, 8, 13, 22],
        'lucky_colors': ['Brown', 'Black', 'Grey'],
        'lucky_gems': ['Garnet', 'Onyx', 'Amethyst'],
        'career_paths': ['Business', 'Management', 'Politics', 'Engineering', 'Architecture', 'Law']
    },
    'aquarius': {
        'name': 'Aquarius',
        'element': 'Air',
        'symbol': '♒',
        'dates': 'January 20 - February 18',
        'personality': 'Friendly, humanitarian, honest, loyal, original, inventive, independent, intellectual, detached, unemotional',
        'strengths': ['Friendliness', 'Humanitarianism', 'Honesty', 'Loyalty', 'Originality', 'Inventiveness'],
        'weaknesses': ['Detachment', 'Unemotional', 'Impatience', 'Aloofness', 'Rebellion'],
        'likes': ['Fun with friends', 'Helping others', 'Fighting for causes', 'Intellectual conversation', 'Unusual people'],
        'dislikes': ['Limitations', 'Broken promises', 'Being lonely', 'Dull or boring situations', 'Being offended'],
        'ruling_planet': 'Uranus (Saturn)',
        'compatibility': ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
        'lucky_numbers': [4, 7, 11, 22, 29],
        'lucky_colors': ['Blue', 'Green', 'Grey'],
        'lucky_gems': ['Amethyst', 'Garnet', 'Turquoise'],
        'career_paths': ['Science', 'Technology', 'Humanitarian work', 'Invention', 'Social reform', 'Writing']
    },
    'pisces': {
        'name': 'Pisces',
        'element': 'Water',
        'symbol': '♓',
        'dates': 'February 19 - March 20',
        'personality': 'Imaginative, sensitive, compassionate, kind, selfless, intuitive, sympathetic, escapist, idealistic, secretive',
        'strengths': ['Imagination', 'Sensitivity', 'Compassion', 'Kindness', 'Selflessness', 'Intuition'],
        'weaknesses': ['Escapism', 'Idealism', 'Secretiveness', 'Indecisiveness', 'Weak-willed'],
        'likes': ['Being alone', 'Sleeping', 'Music', 'Romance', 'Visual media', 'Swimming'],
        'dislikes': ['Know-it-alls', 'Being criticized', 'The past coming back to haunt', 'Cruelty', 'Being bossed around'],
        'ruling_planet': 'Neptune (Jupiter)',
        'compatibility': ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
        'lucky_numbers': [3, 9, 12, 15, 18, 24],
        'lucky_colors': ['Mauve', 'Lilac', 'Sea green'],
        'lucky_gems': ['Bloodstone', 'Aquamarine', 'Amethyst'],
        'career_paths': ['Arts', 'Music', 'Film', 'Healthcare', 'Social work', 'Spirituality']
    }
}


@analytics_bp.route('/zodiac/personality/<sign>', methods=['GET'])
@token_required
def get_zodiac_personality(current_user, sign):
    """Get detailed personality profile for a zodiac sign"""
    try:
        sign_lower = sign.lower()

        if sign_lower not in ZODIAC_PERSONALITIES:
            return jsonify({'error': 'Invalid zodiac sign'}), 400

        personality_data = ZODIAC_PERSONALITIES[sign_lower].copy()

        # Add cosmic insights based on user's sign if available
        user_sign = getattr(current_user, 'zodiac_sign', '').lower()
        if user_sign and user_sign in ZODIAC_PERSONALITIES:
            user_element = ZODIAC_PERSONALITIES[user_sign]['element']
            target_element = personality_data['element']

            # Element compatibility insights
            element_compat = {
                ('Fire', 'Fire'): 'Dynamic and passionate connection',
                ('Fire', 'Earth'): 'Grounding influence with creative spark',
                ('Fire', 'Air'): 'Intellectual stimulation and adventure',
                ('Fire', 'Water'): 'Emotional depth with passionate energy',
                ('Earth', 'Earth'): 'Stable and practical partnership',
                ('Earth', 'Air'): 'Balanced thinking and grounded action',
                ('Earth', 'Water'): 'Nurturing and emotional security',
                ('Air', 'Air'): 'Mental stimulation and freedom',
                ('Air', 'Water'): 'Emotional intelligence and communication',
                ('Water', 'Water'): 'Deep emotional understanding'
            }

            personality_data['cosmic_insight'] = element_compat.get((user_element, target_element),
                f"Discover the unique cosmic connection between {user_element} and {target_element} energies")

        return jsonify(personality_data), 200

    except Exception as e:
        print(f"Zodiac personality error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@analytics_bp.route('/zodiac/personality', methods=['GET'])
@token_required
def get_all_zodiac_personalities(current_user):
    """Get overview of all zodiac personality profiles"""
    try:
        # Return basic info for all signs
        overview = {}
        for sign, data in ZODIAC_PERSONALITIES.items():
            overview[sign] = {
                'name': data['name'],
                'symbol': data['symbol'],
                'element': data['element'],
                'dates': data['dates'],
                'personality': data['personality'][:100] + '...' if len(data['personality']) > 100 else data['personality']
            }

        return jsonify(overview), 200

    except Exception as e:
        print(f"Zodiac personalities overview error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500