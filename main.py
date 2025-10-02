# -*- coding: utf-8 -*-
# Project: Star App - The Cosmic Social Network
from flask import Flask, request
from flask_restful import Api, Resource
from flask_caching import Cache
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO, emit, join_room
import bcrypt
import jwt
import os
import logging
import time
import random
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
from marshmallow import Schema, fields, ValidationError, validate
from supabase import create_client, Client
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, filename='app.log', format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)
logger.info(f"Starting application with Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

# Load environment variables
try:
    load_dotenv()
    logger.info("Loaded .env file for local development")
except Exception as e:
    logger.warning(f"Failed to load .env file: {e}. Using environment variables directly.")

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY environment variable is required")

# JWT Configuration
jwt_secret = os.environ.get('JWT_SECRET')
if not jwt_secret:
    raise ValueError("JWT_SECRET environment variable must be set")
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config['JWT_ALGORITHM'] = 'HS256'

# Initialize extensions
CORS(app, origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','))
api = Api(app)
cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_THRESHOLD': 1000})
cache.init_app(app)
limiter = Limiter(app=app, key_func=get_remote_address)
limiter.init_app(app)
socketio = SocketIO(app, cors_allowed_origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','), async_mode='eventlet')

# Supabase setup
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
logger.info("Initialized Supabase client")

# ==================== ZODIAC DATA ====================

ZODIAC_INFO = {
    'Aries': {'element': 'Fire', 'modality': 'Cardinal', 'planet': 'Mars', 'traits': 'Courageous, energetic, confident'},
    'Taurus': {'element': 'Earth', 'modality': 'Fixed', 'planet': 'Venus', 'traits': 'Reliable, patient, practical'},
    'Gemini': {'element': 'Air', 'modality': 'Mutable', 'planet': 'Mercury', 'traits': 'Curious, communicative, adaptable'},
    'Cancer': {'element': 'Water', 'modality': 'Cardinal', 'planet': 'Moon', 'traits': 'Emotional, nurturing, intuitive'},
    'Leo': {'element': 'Fire', 'modality': 'Fixed', 'planet': 'Sun', 'traits': 'Confident, creative, generous'},
    'Virgo': {'element': 'Earth', 'modality': 'Mutable', 'planet': 'Mercury', 'traits': 'Analytical, practical, helpful'},
    'Libra': {'element': 'Air', 'modality': 'Cardinal', 'planet': 'Venus', 'traits': 'Diplomatic, graceful, social'},
    'Scorpio': {'element': 'Water', 'modality': 'Fixed', 'planet': 'Pluto', 'traits': 'Intense, passionate, strategic'},
    'Sagittarius': {'element': 'Fire', 'modality': 'Mutable', 'planet': 'Jupiter', 'traits': 'Optimistic, adventurous, philosophical'},
    'Capricorn': {'element': 'Earth', 'modality': 'Cardinal', 'planet': 'Saturn', 'traits': 'Disciplined, ambitious, practical'},
    'Aquarius': {'element': 'Air', 'modality': 'Fixed', 'planet': 'Uranus', 'traits': 'Innovative, idealistic, independent'},
    'Pisces': {'element': 'Water', 'modality': 'Mutable', 'planet': 'Neptune', 'traits': 'Compassionate, artistic, intuitive'}
}

ZODIAC_ACTIONS = {
    'Aries': {'comment': 'Blare', 'like': 'Ram', 'follow': 'Dash', 'share': 'Charge'},
    'Taurus': {'comment': 'Moo', 'like': 'Stamp', 'follow': 'Bond', 'share': 'Ground'},
    'Gemini': {'comment': 'Chirp', 'like': 'Clap', 'follow': 'Sync', 'share': 'Twin'},
    'Cancer': {'comment': 'Whisper', 'like': 'Pinch', 'follow': 'Embrace', 'share': 'Shelter'},
    'Leo': {'comment': 'Roar', 'like': 'Paw', 'follow': 'Stride', 'share': 'Radiate'},
    'Virgo': {'comment': 'Hum', 'like': 'Point', 'follow': 'Guide', 'share': 'Organize'},
    'Libra': {'comment': 'Chime', 'like': 'Sway', 'follow': 'Blend', 'share': 'Balance'},
    'Scorpio': {'comment': 'Hiss', 'like': 'Flick', 'follow': 'Dive', 'share': 'Intensify'},
    'Sagittarius': {'comment': 'Yelp', 'like': 'Kick', 'follow': 'Wander', 'share': 'Explore'},
    'Capricorn': {'comment': 'Bleat', 'like': 'Nudge', 'follow': 'Climb', 'share': 'Build'},
    'Aquarius': {'comment': 'Buzz', 'like': 'Tap', 'follow': 'Flow', 'share': 'Innovate'},
    'Pisces': {'comment': 'Splash', 'like': 'Flutter', 'follow': 'Drift', 'share': 'Dream'}
}

CHINESE_ZODIAC = {
    'Rat': {'years': [2020, 2008, 1996, 1984, 1972, 1960], 'element': 'Water', 'traits': 'Quick-witted, resourceful, versatile'},
    'Ox': {'years': [2021, 2009, 1997, 1985, 1973, 1961], 'element': 'Earth', 'traits': 'Diligent, dependable, strong'},
    'Tiger': {'years': [2022, 2010, 1998, 1986, 1974, 1962], 'element': 'Wood', 'traits': 'Brave, confident, competitive'},
    'Rabbit': {'years': [2023, 2011, 1999, 1987, 1975, 1963], 'element': 'Wood', 'traits': 'Quiet, elegant, kind'},
    'Dragon': {'years': [2024, 2012, 2000, 1988, 1976, 1964], 'element': 'Earth', 'traits': 'Confident, intelligent, enthusiastic'},
    'Snake': {'years': [2025, 2013, 2001, 1989, 1977, 1965], 'element': 'Fire', 'traits': 'Enigmatic, intuitive, wise'},
    'Horse': {'years': [2026, 2014, 2002, 1990, 1978, 1966], 'element': 'Fire', 'traits': 'Energetic, cheerful, animated'},
    'Goat': {'years': [2027, 2015, 2003, 1991, 1979, 1967], 'element': 'Earth', 'traits': 'Calm, gentle, creative'},
    'Monkey': {'years': [2028, 2016, 2004, 1992, 1980, 1968], 'element': 'Metal', 'traits': 'Smart, curious, mischievous'},
    'Rooster': {'years': [2029, 2017, 2005, 1993, 1981, 1969], 'element': 'Metal', 'traits': 'Hardworking, courageous, talented'},
    'Dog': {'years': [2030, 2018, 2006, 1994, 1982, 1970], 'element': 'Earth', 'traits': 'Loyal, honest, prudent'},
    'Pig': {'years': [2031, 2019, 2007, 1995, 1983, 1971], 'element': 'Water', 'traits': 'Compassionate, generous, diligent'}
}

CHINESE_ZODIAC_ACTIONS = {
    'Rat': {'comment': 'Squeak', 'like': 'Nibble', 'follow': 'Scamper', 'share': 'Gather'},
    'Ox': {'comment': 'Moo', 'like': 'Plow', 'follow': 'Tread', 'share': 'Carry'},
    'Tiger': {'comment': 'Roar', 'like': 'Pounce', 'follow': 'Stalk', 'share': 'Claim'},
    'Rabbit': {'comment': 'Hop', 'like': 'Nibble', 'follow': 'Bound', 'share': 'Burrow'},
    'Dragon': {'comment': 'Bellow', 'like': 'Soar', 'follow': 'Circle', 'share': 'Guard'},
    'Snake': {'comment': 'Hiss', 'like': 'Coil', 'follow': 'Slither', 'share': 'Shed'},
    'Horse': {'comment': 'Neigh', 'like': 'Gallop', 'follow': 'Trot', 'share': 'Carry'},
    'Goat': {'comment': 'Bleat', 'like': 'Graze', 'follow': 'Climb', 'share': 'Provide'},
    'Monkey': {'comment': 'Chatter', 'like': 'Swing', 'follow': 'Play', 'share': 'Discover'},
    'Rooster': {'comment': 'Crow', 'like': 'Peck', 'follow': 'Strut', 'share': 'Announce'},
    'Dog': {'comment': 'Bark', 'like': 'Fetch', 'follow': 'Guard', 'share': 'Protect'},
    'Pig': {'comment': 'Oink', 'like': 'Root', 'follow': 'Trot', 'share': 'Feast'}
}

VEDIC_ZODIAC = {
    'Mesha': {'western_equiv': 'Aries', 'element': 'Fire', 'traits': 'Courageous, pioneering, energetic'},
    'Vrishabha': {'western_equiv': 'Taurus', 'element': 'Earth', 'traits': 'Stable, sensual, loyal'},
    'Mithuna': {'western_equiv': 'Gemini', 'element': 'Air', 'traits': 'Curious, communicative, adaptable'},
    'Karka': {'western_equiv': 'Cancer', 'element': 'Water', 'traits': 'Emotional, nurturing, intuitive'},
    'Simha': {'western_equiv': 'Leo', 'element': 'Fire', 'traits': 'Confident, charismatic, generous'},
    'Kanya': {'western_equiv': 'Virgo', 'element': 'Earth', 'traits': 'Analytical, meticulous, helpful'},
    'Tula': {'western_equiv': 'Libra', 'element': 'Air', 'traits': 'Diplomatic, graceful, fair-minded'},
    'Vrischika': {'western_equiv': 'Scorpio', 'element': 'Water', 'traits': 'Intense, mysterious, passionate'},
    'Dhanu': {'western_equiv': 'Sagittarius', 'element': 'Fire', 'traits': 'Optimistic, adventurous, philosophical'},
    'Makara': {'western_equiv': 'Capricorn', 'element': 'Earth', 'traits': 'Disciplined, ambitious, practical'},
    'Kumbha': {'western_equiv': 'Aquarius', 'element': 'Air', 'traits': 'Innovative, idealistic, eccentric'},
    'Meena': {'western_equiv': 'Pisces', 'element': 'Water', 'traits': 'Compassionate, dreamy, artistic'}
}

VEDIC_ZODIAC_ACTIONS = {
    'Mesha': {'comment': 'Ignite', 'like': 'Charge', 'follow': 'Lead', 'share': 'Spark'},
    'Vrishabha': {'comment': 'Root', 'like': 'Hold', 'follow': 'Steady', 'share': 'Sustain'},
    'Mithuna': {'comment': 'Whisper', 'like': 'Ping', 'follow': 'Flit', 'share': 'Scatter'},
    'Karka': {'comment': 'Flow', 'like': 'Cradle', 'follow': 'Nest', 'share': 'Embrace'},
    'Simha': {'comment': 'Roar', 'like': 'Shine', 'follow': 'Command', 'share': 'Radiate'},
    'Kanya': {'comment': 'Note', 'like': 'Refine', 'follow': 'Sort', 'share': 'Clarify'},
    'Tula': {'comment': 'Balance', 'like': 'Weigh', 'follow': 'Align', 'share': 'Offer'},
    'Vrischika': {'comment': 'Pierce', 'like': 'Probe', 'follow': 'Lurk', 'share': 'Reveal'},
    'Dhanu': {'comment': 'Aim', 'like': 'Leap', 'follow': 'Explore', 'share': 'Expand'},
    'Makara': {'comment': 'Climb', 'like': 'Build', 'follow': 'Endure', 'share': 'Structure'},
    'Kumbha': {'comment': 'Pulse', 'like': 'Invent', 'follow': 'Orbit', 'share': 'Broadcast'},
    'Meena': {'comment': 'Drift', 'like': 'Dream', 'follow': 'Merge', 'share': 'Bless'}
}

# ==================== ZODIAC NUMBER GENERATOR ====================

class ZodiacNumberGenerator:
    def __init__(self):
        self.western_zodiacs = list(ZODIAC_INFO.keys())
        self.chinese_zodiacs = list(CHINESE_ZODIAC.keys())
        self.vedic_zodiacs = list(VEDIC_ZODIAC.keys())

    def generate_numbers(self):
        """Generate three single-digit numbers for Western, Chinese, and Vedic zodiacs"""
        western_number = random.randint(0, 9)
        chinese_number = random.randint(0, 9)
        vedic_number = random.randint(0, 9)
        western_sign = self.western_zodiacs[western_number % len(self.western_zodiacs)]
        chinese_sign = self.chinese_zodiacs[chinese_number % len(self.chinese_zodiacs)]
        vedic_sign = self.vedic_zodiacs[vedic_number % len(self.vedic_zodiacs)]
        return {
            'western': {'number': western_number, 'sign': western_sign, 'info': ZODIAC_INFO[western_sign]},
            'chinese': {'number': chinese_number, 'sign': chinese_sign, 'info': CHINESE_ZODIAC[chinese_sign]},
            'vedic': {'number': vedic_number, 'sign': vedic_sign, 'info': VEDIC_ZODIAC[vedic_sign]},
            'generated_at': datetime.now(timezone.utc).isoformat()
        }

# ==================== TREND ENGINE ====================

class TrendEngine:
    def __init__(self):
        self.trending_hashtags = []
        self.viral_sounds = []
        self.trending_challenges = []
        self.last_updated = datetime.now(timezone.utc)

    def generate_trends(self):
        """Generate trending content internally"""
        zodiac_trends = {
            'Aries': ['#FireSignEnergy', '#RamChallenge', '#AriesAction'],
            'Taurus': ['#EarthGrounded', '#BullMarket', '#TaurusTaughtMe'],
            'Gemini': ['#TwinEnergy', '#SocialButterfly', '#GeminiVibes'],
            'Cancer': ['#MoonChild', '#HomeVibes', '#CancerComfort'],
            'Leo': ['#LeoSeason', '#RoyalEnergy', '#LeoLeadership'],
            'Virgo': ['#EarthMagic', '#OrganizedChaos', '#VirgoVision'],
            'Libra': ['#BalanceGoals', '#HarmonySeeker', '#LibraLife'],
            'Scorpio': ['#DeepWater', '#MysticEnergy', '#ScorpioDepth'],
            'Sagittarius': ['#AdventureTime', '#PhilosophyFlow', '#SagittariusQuest'],
            'Capricorn': ['#MountainEnergy', '#GoalGetter', '#CapricornClimb'],
            'Aquarius': ['#FutureVision', '#InnovationNation', '#AquariusAge'],
            'Pisces': ['#DreamWeaver', '#OceanEnergy', '#PiscesMagic']
        }

        self.trending_hashtags = []
        for sign in random.sample(list(zodiac_trends.keys()), 5):
            self.trending_hashtags.extend(random.sample(zodiac_trends[sign], 2))

        self.trending_hashtags.extend(['#CosmicVibes', '#StarApp', '#ZodiacCommunity'])

        self.viral_sounds = [
            {'id': 'cosmic_beat_1', 'name': 'Celestial Waves', 'use_count': random.randint(1000, 50000)},
            {'id': 'zodiac_flow_2', 'name': 'Air Sign Melody', 'use_count': random.randint(1000, 50000)},
            {'id': 'earth_rhythm_3', 'name': 'Grounding Frequency', 'use_count': random.randint(1000, 50000)}
        ]

        self.trending_challenges = self._generate_challenges()
        self.last_updated = datetime.now(timezone.utc)

    def _generate_challenges(self):
        """Create zodiac-themed challenges"""
        challenges = []
        zodiac_actions = {
            'Aries': ['warrior pose', 'fire dance', 'bold action'],
            'Taurus': ['slow motion', 'earth connection', 'grounding practice'],
            'Gemini': ['quick change', 'communication trick', 'social connection'],
            'Cancer': ['moon ritual', 'home comfort', 'emotional expression'],
            'Leo': ['royal pose', 'creative expression', 'performance piece'],
            'Virgo': ['organization hack', 'health routine', 'service act'],
            'Libra': ['balance challenge', 'harmony creation', 'partnership dance'],
            'Scorpio': ['mystery reveal', 'transformation act', 'deep dive'],
            'Sagittarius': ['adventure story', 'philosophy share', 'travel moment'],
            'Capricorn': ['goal achievement', 'structure creation', 'discipline act'],
            'Aquarius': ['innovation share', 'community act', 'future visioning'],
            'Pisces': ['dream share', 'creative flow', 'compassion practice']
        }

        for sign in random.sample(list(zodiac_actions.keys()), 4):
            action = random.choice(zodiac_actions[sign])
            challenges.append({
                'id': f"{sign.lower()}_{action.replace(' ', '_')}",
                'name': f"{sign} {action.capitalize()} Challenge",
                'hashtag': f"#{sign}{action.replace(' ', '')}Challenge",
                'participants': random.randint(500, 20000),
                'description': f"Show your {sign} energy through {action}!"
            })

        return challenges

# ==================== UTILITY FUNCTIONS ====================

def get_chinese_zodiac(birth_year):
    """Calculate Chinese zodiac sign based on birth year"""
    if not birth_year:
        return None
    start_year = 1900
    zodiac_animals = list(CHINESE_ZODIAC.keys())
    index = (birth_year - start_year) % 12
    return zodiac_animals[index]
# -*- coding: utf-8 -*-
# Project: Star App - The Cosmic Social Network (Streamlined for production)
from flask import Flask, request
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import bcrypt
import jwt
import os
import logging
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
from marshmallow import Schema, fields, validate, ValidationError
from supabase import create_client
import random
import sys

# -------------------- Logging --------------------
logging.basicConfig(level=logging.INFO, filename='app.log', format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)
logger.info(f"Starting application with Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

# -------------------- App & Config --------------------
load_dotenv()
app = Flask(__name__)
secret = os.environ.get('SECRET_KEY')
jwt_secret = os.environ.get('JWT_SECRET')
if not secret:
    raise ValueError("SECRET_KEY environment variable is required")
if not jwt_secret:
    raise ValueError("JWT_SECRET environment variable is required")
app.config['SECRET_KEY'] = secret
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config['JWT_ALGORITHM'] = 'HS256'

CORS(app, origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','))
api = Api(app)

limiter = Limiter(key_func=get_remote_address)
limiter.init_app(app)

# -------------------- Supabase --------------------
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
logger.info("Initialized Supabase client")

# -------------------- Zodiac Data --------------------
ZODIAC_INFO = {
    'Aries': {'element': 'Fire', 'modality': 'Cardinal', 'planet': 'Mars', 'traits': 'Courageous, energetic, confident'},
    'Taurus': {'element': 'Earth', 'modality': 'Fixed', 'planet': 'Venus', 'traits': 'Reliable, patient, practical'},
    'Gemini': {'element': 'Air', 'modality': 'Mutable', 'planet': 'Mercury', 'traits': 'Curious, communicative, adaptable'},
    'Cancer': {'element': 'Water', 'modality': 'Cardinal', 'planet': 'Moon', 'traits': 'Emotional, nurturing, intuitive'},
    'Leo': {'element': 'Fire', 'modality': 'Fixed', 'planet': 'Sun', 'traits': 'Confident, creative, generous'},
    'Virgo': {'element': 'Earth', 'modality': 'Mutable', 'planet': 'Mercury', 'traits': 'Analytical, practical, helpful'},
    'Libra': {'element': 'Air', 'modality': 'Cardinal', 'planet': 'Venus', 'traits': 'Diplomatic, graceful, social'},
    'Scorpio': {'element': 'Water', 'modality': 'Fixed', 'planet': 'Pluto', 'traits': 'Intense, passionate, strategic'},
    'Sagittarius': {'element': 'Fire', 'modality': 'Mutable', 'planet': 'Jupiter', 'traits': 'Optimistic, adventurous, philosophical'},
    'Capricorn': {'element': 'Earth', 'modality': 'Cardinal', 'planet': 'Saturn', 'traits': 'Disciplined, ambitious, practical'},
    'Aquarius': {'element': 'Air', 'modality': 'Fixed', 'planet': 'Uranus', 'traits': 'Innovative, idealistic, independent'},
    'Pisces': {'element': 'Water', 'modality': 'Mutable', 'planet': 'Neptune', 'traits': 'Compassionate, artistic, intuitive'}
}
CHINESE_ZODIAC = {
    'Rat': {'element': 'Water', 'traits': 'Quick-witted, resourceful, versatile'},
    'Ox': {'element': 'Earth', 'traits': 'Diligent, dependable, strong'},
    'Tiger': {'element': 'Wood', 'traits': 'Brave, confident, competitive'},
    'Rabbit': {'element': 'Wood', 'traits': 'Quiet, elegant, kind'},
    'Dragon': {'element': 'Earth', 'traits': 'Confident, intelligent, enthusiastic'},
    'Snake': {'element': 'Fire', 'traits': 'Enigmatic, intuitive, wise'},
    'Horse': {'element': 'Fire', 'traits': 'Energetic, cheerful, animated'},
    'Goat': {'element': 'Earth', 'traits': 'Calm, gentle, creative'},
    'Monkey': {'element': 'Metal', 'traits': 'Smart, curious, mischievous'},
    'Rooster': {'element': 'Metal', 'traits': 'Hardworking, courageous, talented'},
    'Dog': {'element': 'Earth', 'traits': 'Loyal, honest, prudent'},
    'Pig': {'element': 'Water', 'traits': 'Compassionate, generous, diligent'}
}
VEDIC_ZODIAC = {
    'Mesha': {'western_equiv': 'Aries', 'element': 'Fire', 'traits': 'Courageous, pioneering, energetic'},
    'Vrishabha': {'western_equiv': 'Taurus', 'element': 'Earth', 'traits': 'Stable, sensual, loyal'},
    'Mithuna': {'western_equiv': 'Gemini', 'element': 'Air', 'traits': 'Curious, communicative, adaptable'},
    'Karka': {'western_equiv': 'Cancer', 'element': 'Water', 'traits': 'Emotional, nurturing, intuitive'},
    'Simha': {'western_equiv': 'Leo', 'element': 'Fire', 'traits': 'Confident, charismatic, generous'},
    'Kanya': {'western_equiv': 'Virgo', 'element': 'Earth', 'traits': 'Analytical, meticulous, helpful'},
    'Tula': {'western_equiv': 'Libra', 'element': 'Air', 'traits': 'Diplomatic, graceful, fair-minded'},
    'Vrischika': {'western_equiv': 'Scorpio', 'element': 'Water', 'traits': 'Intense, mysterious, passionate'},
    'Dhanu': {'western_equiv': 'Sagittarius', 'element': 'Fire', 'traits': 'Optimistic, adventurous, philosophical'},
    'Makara': {'western_equiv': 'Capricorn', 'element': 'Earth', 'traits': 'Disciplined, ambitious, practical'},
    'Kumbha': {'western_equiv': 'Aquarius', 'element': 'Air', 'traits': 'Innovative, idealistic, eccentric'},
    'Meena': {'western_equiv': 'Pisces', 'element': 'Water', 'traits': 'Compassionate, dreamy, artistic'}
}

# -------------------- Generators --------------------
class ZodiacNumberGenerator:
    def __init__(self):
        self.western_zodiacs = list(ZODIAC_INFO.keys())
        self.chinese_zodiacs = list(CHINESE_ZODIAC.keys())
        self.vedic_zodiacs = list(VEDIC_ZODIAC.keys())

    def generate_numbers(self):
        western_number = random.randint(0, 9)
        chinese_number = random.randint(0, 9)
        vedic_number = random.randint(0, 9)
        western_sign = self.western_zodiacs[western_number % len(self.western_zodiacs)]
        chinese_sign = self.chinese_zodiacs[chinese_number % len(self.chinese_zodiacs)]
        vedic_sign = self.vedic_zodiacs[vedic_number % len(self.vedic_zodiacs)]
        return {
            'western': {'number': western_number, 'sign': western_sign, 'info': ZODIAC_INFO[western_sign]},
            'chinese': {'number': chinese_number, 'sign': chinese_sign, 'info': CHINESE_ZODIAC[chinese_sign]},
            'vedic': {'number': vedic_number, 'sign': vedic_sign, 'info': VEDIC_ZODIAC[vedic_sign]},
            'generated_at': datetime.now(timezone.utc).isoformat()
        }

class TrendEngine:
    def generate_trends(self):
        hashtags = []
        for sign in random.sample(list(ZODIAC_INFO.keys()), 3):
            hashtags.append(f'#{sign}Vibes')
        return {
            'hashtags': hashtags + ['#CosmicVibes', '#StarApp'],
            'sounds': [f'CosmicWave{random.randint(1, 9)}' for _ in range(3)],
            'challenges': [f'{random.choice(list(ZODIAC_INFO.keys()))}Challenge' for _ in range(3)],
            'updated_at': datetime.now(timezone.utc).isoformat()
        }

# -------------------- Auth --------------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return {'error': 'Missing token'}, 401
        try:
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=[app.config['JWT_ALGORITHM']])
            user = supabase.table('user').select('id,username,zodiac_sign').eq('id', data['user_id']).execute().data
            if not user:
                return {'error': 'User not found'}, 401
            current_user = type('User', (), {'id': user[0]['id'], 'username': user[0]['username'], 'zodiac_sign': user[0]['zodiac_sign']})
            supabase.table('user').update({'last_seen': datetime.now(timezone.utc).isoformat()}).eq('id', current_user.id).execute()
            return f(current_user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return {'error': 'Token expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}, 401
        except Exception as e:
            logger.error(f"Token error: {str(e)}")
            return {'error': 'Server error'}, 500
    return decorated

# -------------------- Validation --------------------
class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    zodiac_sign = fields.Str(required=True, validate=validate.OneOf(list(ZODIAC_INFO.keys())))
    birth_date = fields.Date(required=True)

class PostSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    image_url = fields.Str(allow_none=True)

# -------------------- Resources --------------------
class Register(Resource):
    @limiter.limit("20/hour")
    def post(self):
        try:
            data = RegisterSchema().load(request.get_json())
            exists = supabase.table('user').select('id').eq('username', data['username']).execute().data
            if exists:
                return {'error': 'Username exists'}, 400
            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user_data = {
                'username': data['username'],
                'password_hash': hashed_password,
                'zodiac_sign': data['zodiac_sign'],
                'birth_date': data['birth_date'].isoformat(),
                'created_at': datetime.now(timezone.utc).isoformat(),
                'last_seen': datetime.now(timezone.utc).isoformat(),
                'is_online': True
            }
            supabase.table('user').insert(user_data).execute()
            return {'message': 'Registered'}, 201
        except ValidationError as err:
            return {'error': f'Invalid input: {err.messages}'}, 400
        except Exception as e:
            logger.error(f"Register error: {str(e)}")
            return {'error': 'Failed to register'}, 500

class Login(Resource):
    @limiter.limit("20/hour")
    def post(self):
        data = request.get_json(silent=True) or {}
        username, password = data.get('username'), data.get('password')
        if not username or not password:
            return {'error': 'Missing credentials'}, 400
        users = supabase.table('user').select('id,username,zodiac_sign,password_hash').eq('username', username).execute().data
        if not users or not bcrypt.checkpw(password.encode('utf-8'), users[0]['password_hash'].encode('utf-8')):
            return {'error': 'Invalid credentials'}, 401
        try:
            token = jwt.encode({
                'user_id': users[0]['id'],
                'exp': datetime.now(timezone.utc) + timedelta(hours=24)
            }, app.config['JWT_SECRET_KEY'], algorithm=app.config['JWT_ALGORITHM'])
            supabase.table('user').update({'is_online': True, 'last_seen': datetime.now(timezone.utc).isoformat()}).eq('id', users[0]['id']).execute()
            return {
                'token': token,
                'username': users[0]['username'],
                'userId': users[0]['id'],
                'zodiacSign': users[0]['zodiac_sign'],
                'message': 'Logged in'
            }, 200
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {'error': 'Failed to login'}, 500

class PostResource(Resource):
    @limiter.limit("50/hour")
    def get(self):
        try:
            # Expand user_id to fetch username if FK exists: user:user_id(username)
            res = supabase.table('post').select('id,content,user_id,zodiac_sign,image_url,spark_count,echo_count,created_at,user:user_id(username)').order('created_at', desc=True).limit(20).execute()
            rows = res.data or []
            posts = []
            for r in rows:
                username = r.get('user', {}).get('username') if isinstance(r.get('user'), dict) else None
                posts.append({
                    'id': r.get('id'),
                    'content': r.get('content'),
                    'user_id': r.get('user_id'),
                    'username': username,
                    'zodiac_sign': r.get('zodiac_sign'),
                    'image_url': r.get('image_url'),
                    'spark_count': r.get('spark_count', 0),
                    'echo_count': r.get('echo_count', 0),
                    'created_at': r.get('created_at')
                })
            return {'posts': posts}, 200
        except Exception as e:
            logger.error(f"Posts error: {str(e)}")
            return {'error': 'Failed to fetch posts'}, 500

    @limiter.limit("10/hour")
    @token_required
    def post(self, current_user):
        try:
            data = PostSchema().load(request.get_json())
            post_data = {
                'content': data['content'],
                'user_id': current_user.id,
                'zodiac_sign': current_user.zodiac_sign,
                'image_url': data.get('image_url'),
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            new_post = supabase.table('post').insert(post_data).execute()
            return {'message': 'Post created', 'post_id': new_post.data[0]['id']}, 201
        except ValidationError as err:
            return {'error': f'Invalid input: {err.messages}'}, 400
        except Exception as e:
            logger.error(f"Post error: {str(e)}")
            return {'error': 'Failed to create post'}, 500

class UploadResource(Resource):
    @limiter.limit("5/hour")
    @token_required
    def post(self, current_user):
        try:
            if 'file' not in request.files:
                return {'error': 'No file provided'}, 400
            file = request.files['file']
            content = request.form.get('content', '')
            filename = f"{current_user.id}_{int(datetime.now(timezone.utc).timestamp())}.mp4"
            supabase.storage.from_('media').upload(filename, file.read())
            url = supabase.storage.from_('media').get_public_url(filename)
            post_data = {
                'content': content,
                'user_id': current_user.id,
                'zodiac_sign': current_user.zodiac_sign,
                'image_url': url,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            new_post = supabase.table('post').insert(post_data).execute()
            return {'message': 'Video posted', 'post_id': new_post.data[0]['id'], 'url': url}, 201
        except Exception as e:
            logger.error(f"Upload error: {str(e)}")
            return {'error': 'Failed to upload video'}, 500

class FollowResource(Resource):
    @limiter.limit("20/hour")
    @token_required
    def post(self, current_user, user_id):
        try:
            if current_user.id == user_id:
                return {'error': 'Cannot follow yourself'}, 400
            existing = supabase.table('follow').select('id').eq('follower_id', current_user.id).eq('followed_id', user_id).execute().data
            if existing:
                return {'error': 'Already following'}, 400
            supabase.table('follow').insert({
                'follower_id': current_user.id,
                'followed_id': user_id,
                'created_at': datetime.now(timezone.utc).isoformat()
            }).execute()
            return {'message': 'Followed'}, 201
        except Exception as e:
            logger.error(f"Follow error: {str(e)}")
            return {'error': 'Failed to follow'}, 500

class ProfileResource(Resource):
    @limiter.limit("50/hour")
    def get(self, user_id):
        try:
            user = supabase.table('user').select('username,zodiac_sign,bio,created_at').eq('id', user_id).execute().data
            if not user:
                return {'error': 'User not found'}, 404
            posts = supabase.table('post').select('id,content,created_at,spark_count,echo_count').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute().data
            return {
                'profile': {
                    'username': user[0]['username'],
                    'zodiac_sign': user[0]['zodiac_sign'],
                    'bio': user[0].get('bio'),
                    'join_date': user[0]['created_at']
                },
                'posts': [{'id': p['id'], 'content': p['content'], 'created_at': p['created_at'], 'engagement': {'sparks': p.get('spark_count', 0), 'echoes': p.get('echo_count', 0)}} for p in (posts or [])]
            }, 200
        except Exception as e:
            logger.error(f"Profile error: {str(e)}")
            return {'error': 'Failed to fetch profile'}, 500

class TrendDiscoveryResource(Resource):
    @limiter.limit("50/hour")
    def get(self):
        try:
            trends = TrendEngine().generate_trends()
            return {'trends': trends}, 200
        except Exception as e:
            logger.error(f"Trends error: {str(e)}")
            return {'error': 'Failed to fetch trends'}, 500

class ZodiacNumberResource(Resource):
    @limiter.limit("50/hour")
    def get(self):
        try:
            numbers = ZodiacNumberGenerator().generate_numbers()
            return numbers, 200
        except Exception as e:
            logger.error(f"Zodiac error: {str(e)}")
            return {'error': 'Failed to generate zodiac numbers'}, 500

# -------------------- Routes --------------------
api.add_resource(Register, '/api/v1/register')
api.add_resource(Login, '/api/v1/login')
api.add_resource(PostResource, '/api/v1/posts')
api.add_resource(UploadResource, '/api/v1/upload')
api.add_resource(FollowResource, '/api/v1/follow/<int:user_id>')
api.add_resource(ProfileResource, '/api/v1/profile/<int:user_id>')
api.add_resource(TrendDiscoveryResource, '/api/v1/trends')
api.add_resource(ZodiacNumberResource, '/api/v1/zodiac-numbers')

# -------------------- Global Error Handler --------------------
@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    return {'error': 'Server error'}, 500

# -------------------- Main --------------------
if __name__ == '__main__':
    logger.info("Starting Star App server...")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
def get_chinese_zodiac_element(birth_year):
    """Calculate Chinese zodiac element based on birth year"""
    if not birth_year:
        return None
    elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
    start_year = 1900
    element_index = ((birth_year - start_year) % 10) // 2
    return elements[element_index]

def get_vedic_zodiac(birth_date):
    """Simple approximation of Vedic zodiac from Western equivalent by month/day"""
    western_to_vedic = {
        'Aries': 'Mesha', 'Taurus': 'Vrishabha', 'Gemini': 'Mithuna',
        'Cancer': 'Karka', 'Leo': 'Simha', 'Virgo': 'Kanya',
        'Libra': 'Tula', 'Scorpio': 'Vrischika', 'Sagittarius': 'Dhanu',
        'Capricorn': 'Makara', 'Aquarius': 'Kumbha', 'Pisces': 'Meena'
    }
    m, d = birth_date.month, birth_date.day
    if (m == 3 and d >= 21) or (m == 4 and d <= 19): west = 'Aries'
    elif (m == 4 and d >= 20) or (m == 5 and d <= 20): west = 'Taurus'
    elif (m == 5 and d >= 21) or (m == 6 and d <= 20): west = 'Gemini'
    elif (m == 6 and d >= 21) or (m == 7 and d <= 22): west = 'Cancer'
    elif (m == 7 and d >= 23) or (m == 8 and d <= 22): west = 'Leo'
    elif (m == 8 and d >= 23) or (m == 9 and d <= 22): west = 'Virgo'
    elif (m == 9 and d >= 23) or (m == 10 and d <= 22): west = 'Libra'
    elif (m == 10 and d >= 23) or (m == 11 and d <= 21): west = 'Scorpio'
    elif (m == 11 and d >= 22) or (m == 12 and d <= 21): west = 'Sagittarius'
    elif (m == 12 and d >= 22) or (m == 1 and d <= 19): west = 'Capricorn'
    elif (m == 1 and d >= 20) or (m == 2 and d <= 18): west = 'Aquarius'
    else: west = 'Pisces'
    return western_to_vedic.get(west, 'Unknown')

# ==================== JWT AUTHENTICATION ====================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'Authorization' not in request.headers or not request.headers['Authorization'].startswith('Bearer '):
            return {'error': 'Invalid or missing Authorization header'}, 401
        try:
            token = request.headers['Authorization'].split(' ')[1]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=[app.config['JWT_ALGORITHM']])
            user_res = supabase.table('user').select('*').eq('id', data['user_id']).execute()
            user_data = user_res.data or []
            if not user_data:
                return {'error': 'User not found'}, 401
            current_user = type('User', (), {'id': user_data[0]['id'], 'username': user_data[0]['username'], 'zodiac_sign': user_data[0]['zodiac_sign']})
            supabase.table('user').update({'last_seen': datetime.now(timezone.utc).isoformat()}).eq('id', current_user.id).execute()
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return {'error': 'Internal server error'}, 500
        return f(current_user, *args, **kwargs)
    return decorated

# ==================== VALIDATION SCHEMAS ====================

class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    zodiac_sign = fields.Str(required=True, validate=validate.OneOf(list(ZODIAC_ACTIONS.keys())))
    birth_date = fields.Date(required=True)

class PostSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    zodiac_sign = fields.Str(required=True, validate=validate.OneOf(list(ZODIAC_ACTIONS.keys())))
    image_url = fields.Str(allow_none=True)

# ==================== API RESOURCES ====================

class Register(Resource):
    @limiter.limit("50/hour")
    def post(self):
        schema = RegisterSchema()
        try:
            data = schema.load(request.get_json())
            username = data['username']
            exists = supabase.table('user').select('id').eq('username', username).execute().data
            if exists:
                return {'error': 'Username already exists'}, 400

            birth_date = data['birth_date']
            birth_year = birth_date.year
            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            new_user = {
                'username': username,
                'password_hash': hashed_password,
                'zodiac_sign': data['zodiac_sign'].capitalize(),
                'birth_date': birth_date.isoformat(),
                'chinese_zodiac': get_chinese_zodiac(birth_year),
                'chinese_element': get_chinese_zodiac_element(birth_year),
                'vedic_zodiac': get_vedic_zodiac(birth_date),
                'created_at': datetime.now(timezone.utc).isoformat(),
                'last_seen': datetime.now(timezone.utc).isoformat(),
                'is_online': True
            }
            supabase.table('user').insert(new_user).execute()
            return {'message': 'Registered successfully'}, 201
        except ValidationError as err:
            return {'error': f'Invalid input: {err.messages}'}, 400
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return {'error': 'Registration failed'}, 500

class Login(Resource):
    @limiter.limit("50/hour")
    def post(self):
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return {'error': 'Missing username or password'}, 400

        user_res = supabase.table('user').select('*').eq('username', username).execute()
        users = user_res.data or []
        if not users or not bcrypt.checkpw(password.encode('utf-8'), users[0]['password_hash'].encode('utf-8')):
            return {'error': 'Invalid credentials'}, 401

        try:
            token = jwt.encode({
                'user_id': users[0]['id'],
                'exp': datetime.now(timezone.utc) + timedelta(hours=24)
            }, app.config['JWT_SECRET_KEY'], algorithm=app.config['JWT_ALGORITHM'])

            supabase.table('user').update({'is_online': True, 'last_seen': datetime.now(timezone.utc).isoformat()}).eq('id', users[0]['id']).execute()

            return {
                'token': token,
                'username': users[0]['username'],
                'userId': users[0]['id'],
                'zodiacSign': users[0]['zodiac_sign'],
                'chineseZodiac': users[0]['chinese_zodiac'],
                'vedicZodiac': users[0]['vedic_zodiac'],
                'actions': ZODIAC_ACTIONS.get(users[0]['zodiac_sign'], {}),
                'message': f'Welcome back, {users[0]["zodiac_sign"]} star!'
            }, 200
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {'error': 'Login failed'}, 500

class PostResource(Resource):
    @limiter.limit("50/hour")
    @cache.cached(timeout=60)
    def get(self):
        """Get posts; transforms nested user.username to top-level username for convenience"""
        try:
            # If FK exists, PostgREST can expand the user reference:
            res = supabase.table('post').select('id,content,user_id,zodiac_sign,image_url,spark_count,echo_count,created_at,user:user_id(username)').order('created_at', desc=True).limit(20).execute()
            rows = res.data or []
            posts = []
            for r in rows:
                username = None
                if isinstance(r.get('user'), dict):
                    username = r['user'].get('username')
                posts.append({
                    'id': r.get('id'),
                    'content': r.get('content'),
                    'user_id': r.get('user_id'),
                    'username': username,
                    'zodiac_sign': r.get('zodiac_sign'),
                    'image_url': r.get('image_url'),
                    'spark_count': r.get('spark_count', 0),
                    'echo_count': r.get('echo_count', 0),
                    'created_at': r.get('created_at')
                })
            return {'posts': posts}, 200
        except Exception as e:
            logger.error(f"Failed to fetch posts: {str(e)}")
            return {'error': 'Failed to fetch posts'}, 500

    @limiter.limit("20/hour")
    @token_required
    def post(self, current_user):
        """Create a new text post"""
        schema = PostSchema()
        try:
            data = schema.load(request.get_json())
            new_post = {
                'content': data['content'],
                'user_id': current_user.id,
                'zodiac_sign': current_user.zodiac_sign,
                'image_url': data.get('image_url'),
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            ins = supabase.table('post').insert(new_post).execute()
            cache.delete_memoized(PostResource.get)
            return {'message': 'Post created', 'post_id': (ins.data or [{}])[0].get('id')}, 201
        except ValidationError as err:
            return {'error': f'Invalid input: {err.messages}'}, 400
        except Exception as e:
            logger.error(f"Post creation error: {str(e)}")
            return {'error': 'Failed to create post'}, 500

class UploadResource(Resource):
    @limiter.limit("5/hour")
    @token_required
    def post(self, current_user):
        """Upload a video to Supabase Storage and create a post with its URL"""
        try:
            if 'file' not in request.files:
                return {'error': 'No file provided'}, 400
            file = request.files['file']
            content = request.form.get('content', '')
            filename = f"{current_user.id}_{int(time.time())}.mp4"
            # Upload to 'media' bucket; ensure bucket exists and is public or signed URLs are used
            supabase.storage.from_('media').upload(filename, file.read())
            url = supabase.storage.from_('media').get_public_url(filename)

            new_post = {
                'content': content,
                'user_id': current_user.id,
                'zodiac_sign': current_user.zodiac_sign,
                'image_url': url,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            ins = supabase.table('post').insert(new_post).execute()
            cache.delete_memoized(PostResource.get)
            return {'message': 'Video posted', 'post_id': (ins.data or [{}])[0].get('id'), 'url': url}, 201
        except Exception as e:
            logger.error(f"Upload error: {str(e)}")
            return {'error': 'Failed to upload video'}, 500

class FollowResource(Resource):
    @limiter.limit("50/hour")
    @token_required
    def post(self, current_user, user_id):
        """Follow another user"""
        try:
            if current_user.id == user_id:
                return {'error': 'Cannot follow yourself'}, 400
            existing = supabase.table('follow').select('id').eq('follower_id', current_user.id).eq('followed_id', user_id).execute().data
            if existing:
                return {'error': 'Already following'}, 400
            supabase.table('follow').insert({
                'follower_id': current_user.id,
                'followed_id': user_id,
                'created_at': datetime.now(timezone.utc).isoformat()
            }).execute()
            return {'message': 'Followed'}, 201
        except Exception as e:
            logger.error(f"Follow error: {str(e)}")
            return {'error': 'Failed to follow'}, 500

class ProfileResource(Resource):
    @limiter.limit("60/hour")
    @cache.cached(timeout=300)
    def get(self, user_id):
        """Get user profile with recent posts"""
        try:
            user = supabase.table('user').select('username,zodiac_sign,chinese_zodiac,vedic_zodiac,bio,created_at').eq('id', user_id).execute().data
            if not user:
                return {'error': 'User not found'}, 404
            posts = supabase.table('post').select('id,content,created_at,spark_count,echo_count').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute().data
            return {
                'profile': {
                    'username': user[0]['username'],
                    'zodiac_sign': user[0]['zodiac_sign'],
                    'chinese_zodiac': user[0]['chinese_zodiac'],
                    'vedic_zodiac': user[0]['vedic_zodiac'],
                    'bio': user[0]['bio'],
                    'join_date': user[0]['created_at']
                },
                'posts': [{'id': p['id'], 'content': p['content'], 'created_at': p['created_at'], 'engagement': {'sparks': p.get('spark_count', 0), 'echoes': p.get('echo_count', 0)}} for p in (posts or [])]
            }, 200
        except Exception as e:
            logger.error(f"Failed to fetch profile: {str(e)}")
            return {'error': 'Failed to fetch profile'}, 500

class TrendDiscoveryResource(Resource):
    @limiter.limit("60/hour")
    @cache.cached(timeout=300)
    def get(self):
        """Discover trending content with caching"""
        try:
            trend_engine = TrendEngine()
            trend_engine.generate_trends()
            return {
                'trends': {
                    'hashtags': trend_engine.trending_hashtags,
                    'sounds': trend_engine.viral_sounds,
                    'challenges': trend_engine.trending_challenges
                },
                'updated_at': trend_engine.last_updated.isoformat()
            }, 200
        except Exception as e:
            logger.error(f"Failed to fetch trends: {str(e)}")
            return {'error': 'Failed to fetch trends'}, 500

class ZodiacNumberResource(Resource):
    @limiter.limit("100/hour")
    @cache.cached(timeout=60)
    def get(self):
        """Generate three single-digit numbers for zodiac systems"""
        try:
            generator = ZodiacNumberGenerator()
            numbers = generator.generate_numbers()
            return numbers, 200
        except Exception as e:
            logger.error(f"Failed to generate zodiac numbers: {str(e)}")
            return {'error': 'Failed to generate zodiac numbers'}, 500

# ==================== API ROUTES ====================

api.add_resource(Register, '/api/v1/register')
api.add_resource(Login, '/api/v1/login')
api.add_resource(PostResource, '/api/v1/posts')
api.add_resource(UploadResource, '/api/v1/upload')
api.add_resource(FollowResource, '/api/v1/follow/<int:user_id>')
api.add_resource(ProfileResource, '/api/v1/profile/<int:user_id>')
api.add_resource(TrendDiscoveryResource, '/api/v1/trends')
api.add_resource(ZodiacNumberResource, '/api/v1/zodiac-numbers')

# ==================== SOCKET.IO EVENTS ====================

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected to SocketIO')
    emit('connected', {'data': 'Connected to Star', 'timestamp': datetime.now(timezone.utc).isoformat()})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected from SocketIO')

@socketio.on('join_room')
def handle_join_room(data):
    room = data.get('room')
    if not room or not isinstance(room, str):
        emit('error', {'message': 'Invalid room'})
        return
    join_room(room)
    logger.info(f'Client joined room: {room}')
    emit('room_joined', {'room': room})

@socketio.on('send_message')
def handle_send_message(data):
    room = data.get('room')
    message = data.get('message')
    if not room or not message:
        emit('error', {'message': 'Invalid room or message'})
        return
    logger.info(f'Message sent to room: {room}')
    emit('new_message', {'message': message, 'timestamp': datetime.now(timezone.utc).isoformat()}, room=room)

# ==================== GLOBAL ERROR HANDLER ====================

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Unhandled error: {str(error)}")
    return {'error': 'Internal server error'}, 500

# ==================== MAIN APPLICATION ====================

if __name__ == '__main__':
    logger.info("Starting Star App server...")
    logger.info(f"Available at: http://localhost:{os.environ.get('PORT', 5000)}")
    socketio.run(
        app,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=False
    )