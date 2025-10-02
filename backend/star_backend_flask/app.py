# -*- coding: utf-8 -*-
# Project: Star App - The Cosmic Social Network
# Complete version with all installed packages and zodiac number generator
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit, join_room
from flask_restful import Api, Resource
from flask_caching import Cache
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
import bcrypt
import jwt
import os
import logging
import requests
from datetime import datetime, timedelta, timezone
from functools import wraps
from dotenv import load_dotenv
from marshmallow import Schema, fields, validates, ValidationError, validate
import time
import random
import json
from urllib.parse import quote
from supabase import create_client

# Configure logging
logging.basicConfig(level=logging.INFO, filename='app.log', format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# Log Python version
import sys
logger.info(f"Starting application with Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

# Load environment variables
try:
    load_dotenv()
    logger.info("Loaded .env file for local development")
except Exception as e:
    logger.warning(f"Failed to load .env file: {e}. Using environment variables directly.")

# Initialize Flask app
app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("SECRET_KEY environment variable is required")
# Limit uploads to 50MB for safety
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
CORS(app, origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','))
api = Api(app)
cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_THRESHOLD': 1000})
cache.init_app(app)
limiter = Limiter(app=app, key_func=get_remote_address)
limiter.init_app(app)
socketio = SocketIO(app, cors_allowed_origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','), async_mode='eventlet')

# Supabase client (for Storage uploads)
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
supabase = None
try:
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        logger.info("Supabase client initialized")
    else:
        logger.warning("SUPABASE_URL or SUPABASE_ANON_KEY not set; upload endpoint will be disabled.")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    supabase = None

# Database configuration
database_url = os.environ.get('DATABASE_URL')
if database_url:
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
else:
    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'star.db')
    database_url = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
logger.info(f"Using database URI: {database_url}")

# JWT Configuration
jwt_secret = os.environ.get('JWT_SECRET')
if not jwt_secret:
    raise ValueError("JWT_SECRET environment variable must be set")
app.config['JWT_SECRET_KEY'] = jwt_secret
app.config['JWT_ALGORITHM'] = 'HS256'

# Initialize database
try:
    db = SQLAlchemy(app)
    migrate = Migrate(app, db)
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")
    raise RuntimeError("Database initialization failed. Check SQLALCHEMY_DATABASE_URI.")

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
        
        # Map numbers to zodiac signs (0-9 cycle through 12 signs)
        western_sign = self.western_zodiacs[western_number % len(self.western_zodiacs)]
        chinese_sign = self.chinese_zodiacs[chinese_number % len(self.chinese_zodiacs)]
        vedic_sign = self.vedic_zodiacs[vedic_number % len(self.vedic_zodiacs)]
        
        return {
            'western': {
                'number': western_number,
                'sign': western_sign,
                'info': ZODIAC_INFO[western_sign]
            },
            'chinese': {
                'number': chinese_number,
                'sign': chinese_sign,
                'info': CHINESE_ZODIAC[chinese_sign]
            },
            'vedic': {
                'number': vedic_number,
                'sign': vedic_sign,
                'info': VEDIC_ZODIAC[vedic_sign]
            },
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

# ==================== DATABASE MODELS ====================

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    zodiac_sign = db.Column(db.String(20), nullable=False)
    birth_date = db.Column(db.Date, nullable=True)
    birth_time = db.Column(db.Time, nullable=True)
    birth_city = db.Column(db.String(100), nullable=True)
    chinese_zodiac = db.Column(db.String(20), nullable=True)
    chinese_element = db.Column(db.String(20), nullable=True)
    vedic_zodiac = db.Column(db.String(20), nullable=True)
    vedic_nakshatra = db.Column(db.String(30), nullable=True)
    bio = db.Column(db.String(200), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_online = db.Column(db.Boolean, default=False)

    # New Numerology fields
    full_name = db.Column(db.String(100), nullable=True)  # For accurate numerology calculations
    life_path_number = db.Column(db.Integer, nullable=True)
    destiny_number = db.Column(db.Integer, nullable=True)
    soul_urge_number = db.Column(db.Integer, nullable=True)
    personality_number = db.Column(db.Integer, nullable=True)
    birth_day_number = db.Column(db.Integer, nullable=True)

    # Add tradition field
    tradition = db.Column(db.String(50), nullable=True)  # e.g., 'Hermetic', 'Kabbalistic', 'Theosophical'

class Post(db.Model):
    __tablename__ = 'post'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    zodiac_sign = db.Column(db.String(20), nullable=False)
    is_trend_hijack = db.Column(db.Boolean, default=False)
    trend_category = db.Column(db.String(50))
    image_url = db.Column(db.String(255), nullable=True)
    spark_count = db.Column(db.Integer, default=0)
    echo_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    author = db.relationship('User', backref='posts')

class Trend(db.Model):
    __tablename__ = 'trend'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    hashtag = db.Column(db.String(50), nullable=False)
    trend_type = db.Column(db.String(20), nullable=False)
    participant_count = db.Column(db.Integer, default=0)
    zodiac_sign = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class Follow(db.Model):
    __tablename__ = 'follow'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    __table_args__ = (db.UniqueConstraint('follower_id', 'followed_id', name='uq_follow_pair'),)

# ==================== UTILITY FUNCTIONS ====================

def get_chinese_zodiac(birth_year):
    """Calculate Chinese zodiac sign based on birth year"""
    if not birth_year:
        return None
    start_year = 1900
    zodiac_animals = list(CHINESE_ZODIAC.keys())
    index = (birth_year - start_year) % 12
    return zodiac_animals[index]

def get_chinese_zodiac_element(birth_year):
    """Calculate Chinese zodiac element based on birth year"""
    if not birth_year:
        return None
    elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
    start_year = 1900
    element_index = ((birth_year - start_year) % 10) // 2
    return elements[element_index]

def get_vedic_zodiac(birth_date):
    """Simple approximation of Vedic zodiac"""
    western_to_vedic = {
        'Aries': 'Mesha', 'Taurus': 'Vrishabha', 'Gemini': 'Mithuna',
        'Cancer': 'Karka', 'Leo': 'Simha', 'Virgo': 'Kanya',
        'Libra': 'Tula', 'Scorpio': 'Vrischika', 'Sagittarius': 'Dhanu',
        'Capricorn': 'Makara', 'Aquarius': 'Kumbha', 'Pisces': 'Meena'
    }
    return western_to_vedic.get(birth_date.strftime('%B').capitalize(), 'Unknown')

# ==================== JWT AUTHENTICATION ====================

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'Authorization' not in request.headers or not request.headers['Authorization'].startswith('Bearer '):
            return {'error': 'Invalid or missing Authorization header'}, 401
        try:
            token = request.headers['Authorization'].split(' ')[1]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=[app.config['JWT_ALGORITHM']])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return {'error': 'User not found'}, 401
            current_user.last_seen = datetime.now(timezone.utc)
            db.session.commit()
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return {'error': 'Internal server error'}, 500

        if args and hasattr(args[0], '__class__'):
            return f(args[0], current_user, *args[1:], **kwargs)
        return f(current_user, *args, **kwargs)
    return decorated

# ==================== VALIDATION SCHEMAS ====================

class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    zodiac_sign = fields.Str(required=True, validate=validate.OneOf(list(ZODIAC_ACTIONS.keys())))
    birth_date = fields.Date(required=True)
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))  # New field

class PostSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    zodiac_sign = fields.Str(required=True, validate=validate.OneOf(list(ZODIAC_ACTIONS.keys())))
    image_url = fields.Str(allow_none=True)

class UserSettingsSchema(Schema):
    tradition = fields.Str(required=True, validate=lambda x: x in ['Hermetic', 'Kabbalistic', 'Theosophical', None])

class PublicOracleSchema(Schema):
    full_name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    birth_date = fields.Str(required=True)
    tradition = fields.Str(required=False, validate=lambda x: x in ['Hermetic', 'Kabbalistic', 'Theosophical', None])

# ==================== API RESOURCES ====================

class Register(Resource):
    @limiter.limit("100/hour")
    def post(self):
        schema = RegisterSchema()
        try:
            data = schema.load(request.get_json())
        except ValidationError as err:
            return {'error': f'Invalid input: {err.messages}'}, 400

        username = data['username']
        password = data['password']
        zodiac_sign = data['zodiac_sign'].capitalize()
        birth_date = data['birth_date']
        full_name = data['full_name']  # New field
        birth_year = birth_date.year

        if User.query.filter_by(username=username).first():
            return {'error': 'Username already exists'}, 400

        chinese_zodiac = get_chinese_zodiac(birth_year)
        chinese_element = get_chinese_zodiac_element(birth_year)
        vedic_zodiac = get_vedic_zodiac(birth_date)

        # Calculate numerology numbers
        from numerology import NumerologyCalculator
        from archetype_oracle import ArchetypeOracle
        numerology_readings = NumerologyCalculator.calculate_comprehensive_readings(
            full_name, birth_date
        )

        # Extract the numbers from readings
        life_path = numerology_readings['life_path']['number'] if 'number' in numerology_readings['life_path'] else None
        destiny = numerology_readings['destiny']['number'] if 'number' in numerology_readings['destiny'] else None
        soul_urge = numerology_readings['soul_urge']['number'] if 'number' in numerology_readings['soul_urge'] else None
        personality = numerology_readings['personality']['number'] if 'number' in numerology_readings['personality'] else None
        birth_day = numerology_readings['birth_day']['number'] if 'number' in numerology_readings['birth_day'] else None

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = User(
            username=username,
            password_hash=hashed_password,
            zodiac_sign=zodiac_sign,
            birth_date=birth_date,
            full_name=full_name,  # Store full name
            chinese_zodiac=chinese_zodiac,
            chinese_element=chinese_element,
            vedic_zodiac=vedic_zodiac,
            life_path_number=life_path,
            destiny_number=destiny,
            soul_urge_number=soul_urge,
            personality_number=personality,
            birth_day_number=birth_day
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            return {
                'message': 'Registered successfully',
                'numerology_preview': {
                    'life_path': life_path,
                    'destiny': destiny
                }
            }, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Registration error: {str(e)}")
            return {'error': 'Registration failed'}, 500

class Login(Resource):
    @limiter.limit("100/hour")
    def post(self):
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {'error': 'Missing username or password'}, 400

        user = User.query.filter_by(username=username).first()
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return {'error': 'Invalid credentials'}, 401

        try:
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.now(timezone.utc) + timedelta(hours=24)
            }, app.config['JWT_SECRET_KEY'], algorithm=app.config['JWT_ALGORITHM'])

            user.is_online = True
            user.last_seen = datetime.now(timezone.utc)
            db.session.commit()

            return {
                'token': token,
                'username': user.username,
                'userId': user.id,
                'zodiacSign': user.zodiac_sign,
                'chineseZodiac': user.chinese_zodiac,
                'vedicZodiac': user.vedic_zodiac,
                'actions': ZODIAC_ACTIONS.get(user.zodiac_sign, {}),
                'numerology': {  # Add numerology data
                    'lifePath': user.life_path_number,
                    'destiny': user.destiny_number,
                    'hasNumerology': bool(user.full_name and user.birth_date)
                },
                'message': f'Welcome back, {user.zodiac_sign} star!'
            }, 200
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {'error': 'Login failed'}, 500

class PostResource(Resource):
    @limiter.limit("50/hour")
    @cache.cached(timeout=60)
    def get(self):
        """Get all posts with caching"""
        try:
            posts = Post.query.order_by(Post.created_at.desc()).limit(20).all()
            return {
                'posts': [{
                    'id': post.id,
                    'content': post.content,
                    'username': post.author.username,
                    'zodiac_sign': post.zodiac_sign,
                    'image_url': post.image_url,
                    'spark_count': post.spark_count,
                    'echo_count': post.echo_count,
                    'created_at': post.created_at.isoformat()
                } for post in posts]
            }, 200
        except Exception as e:
            logger.error(f"Failed to fetch posts: {str(e)}")
            return {'error': 'Failed to fetch posts'}, 500

    @limiter.limit("20/hour")
    @token_required
    def post(self, current_user):
        """Create a new post"""
        schema = PostSchema()
        try:
            data = schema.load(request.get_json())
        except ValidationError as err:
            return {'error': f'Invalid input: {err.messages}'}, 400

        try:
            new_post = Post(
                content=data['content'],
                user_id=current_user.id,
                zodiac_sign=current_user.zodiac_sign,
                image_url=data.get('image_url')
            )
            db.session.add(new_post)
            db.session.commit()
            
            # Invalidate cached GET /api/v1/posts results
            cache.delete_memoized(PostResource.get)
            
            return {'message': 'Post created', 'post_id': new_post.id}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Post creation error: {str(e)}")
            return {'error': 'Failed to create post'}, 500

class UploadResource(Resource):
    @limiter.limit("5/hour")
    @token_required
    def post(self, current_user):
        """Upload a video to Supabase Storage and create a post with its URL"""
        try:
            if supabase is None:
                return {'error': 'Uploads are not configured'}, 503
            if 'file' not in request.files:
                return {'error': 'No file provided'}, 400
            file = request.files['file']
            if not file or file.mimetype != 'video/mp4':
                return {'error': 'Only MP4 videos allowed'}, 400
            content = request.form.get('content', '')
            filename = f"{current_user.id}_{int(time.time())}.mp4"
            supabase.storage.from_('media').upload(filename, file.read(), {'content-type': 'video/mp4'})
            url = supabase.storage.from_('media').get_public_url(filename)
            new_post = Post(
                content=content,
                user_id=current_user.id,
                zodiac_sign=current_user.zodiac_sign,
                image_url=url
            )
            db.session.add(new_post)
            db.session.commit()
            cache.delete_memoized(PostResource.get)
            return {'message': 'Video posted', 'post_id': new_post.id, 'url': url}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Upload error: {str(e)}")
            return {'error': 'Failed to upload video'}, 500

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

class ProfileResource(Resource):
    @limiter.limit("60/hour")
    def get(self, user_id):
        """Get user profile with numerology"""
        try:
            user = User.query.get_or_404(user_id)
            posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).limit(10).all()

            profile_data = {
                'profile': {
                    'username': user.username,
                    'zodiac_sign': user.zodiac_sign,
                    'chinese_zodiac': user.chinese_zodiac,
                    'vedic_zodiac': user.vedic_zodiac,
                    'bio': user.bio,
                    'join_date': user.created_at.isoformat()
                },
                'posts': [{
                    'id': post.id,
                    'content': post.content,
                    'created_at': post.created_at.isoformat(),
                    'engagement': {'sparks': post.spark_count, 'echoes': post.echo_count}
                } for post in posts]
            }

            # Add numerology data if available
            if user.life_path_number:
                profile_data['numerology'] = {
                    'life_path_number': user.life_path_number,
                    'destiny_number': user.destiny_number,
                    'soul_urge_number': user.soul_urge_number
                }

            return profile_data, 200
        except Exception as e:
            logger.error(f"Failed to fetch profile: {str(e)}")
            return {'error': 'Failed to fetch profile'}, 500

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

class FollowResource(Resource):
    @limiter.limit("50/hour")
    @token_required
    def post(self, current_user, user_id):
        """Follow another user"""
        try:
            if current_user.id == user_id:
                return {'error': 'Cannot follow yourself'}, 400
            existing = Follow.query.filter_by(follower_id=current_user.id, followed_id=user_id).first()
            if existing:
                return {'error': 'Already following'}, 400
            follow = Follow(follower_id=current_user.id, followed_id=user_id)
            db.session.add(follow)
            db.session.commit()
            return {'message': 'Followed'}, 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Follow error: {str(e)}")
            return {'error': 'Failed to follow'}, 500

class NumerologyResource(Resource):
    @limiter.limit("60/hour")
    @token_required
    def get(self, current_user):
        """Get user's complete numerology reading"""
        try:
            from numerology import NumerologyCalculator

            if not current_user.full_name or not current_user.birth_date:
                return {'error': 'Full name and birth date required for numerology'}, 400

            readings = NumerologyCalculator.calculate_comprehensive_readings(
                current_user.full_name,
                current_user.birth_date
            )

            return {
                'numerology': readings,
                'user_info': {
                    'full_name': current_user.full_name,
                    'birth_date': current_user.birth_date.isoformat()
                }
            }, 200
        except Exception as e:
            logger.error(f"Numerology calculation error: {e}")
            return {'error': 'Failed to calculate numerology'}, 500

class NumerologyCompatibilityResource(Resource):
    @limiter.limit("60/hour")
    @token_required
    def post(self, current_user):
        """Check numerology compatibility with another user"""
        try:
            from numerology import NumerologyCalculator

            data = request.get_json()
            other_user_id = data.get('other_user_id')

            if not other_user_id:
                return {'error': 'other_user_id required'}, 400

            other_user = User.query.get(other_user_id)
            if not other_user:
                return {'error': 'User not found'}, 404

            if not current_user.life_path_number or not other_user.life_path_number:
                return {'error': 'Both users need complete numerology profiles'}, 400

            compatibility = NumerologyCalculator.get_numerology_compatibility(
                current_user.life_path_number,
                other_user.life_path_number
            )

            return {
                'compatibility': compatibility,
                'users': {
                    'current_user': {
                        'id': current_user.id,
                        'name': current_user.full_name,
                        'life_path': current_user.life_path_number
                    },
                    'other_user': {
                        'id': other_user.id,
                        'name': other_user.full_name,
                        'life_path': other_user.life_path_number
                    }
                }
            }, 200
        except Exception as e:
            logger.error(f"Numerology compatibility error: {e}")
            return {'error': 'Failed to calculate compatibility'}, 500

class NumerologyCalculatorResource(Resource):
    @limiter.limit("30/hour")
    def post(self):
        """Calculate numerology for any name and birth date (public endpoint)"""
        try:
            from numerology import NumerologyCalculator

            data = request.get_json()
            full_name = data.get('full_name')
            birth_date_str = data.get('birth_date')

            if not full_name or not birth_date_str:
                return {'error': 'full_name and birth_date required'}, 400

            try:
                birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
            except ValueError:
                return {'error': 'Invalid date format. Use YYYY-MM-DD'}, 400

            readings = NumerologyCalculator.calculate_comprehensive_readings(full_name, birth_date)

            return {
                'numerology': readings,
                'input': {
                    'full_name': full_name,
                    'birth_date': birth_date_str
                }
            }, 200
        except Exception as e:
            logger.error(f"Public numerology calculation error: {e}")
            return {'error': 'Failed to calculate numerology'}, 500

class UserSettingsResource(Resource):
    @token_required
    def put(self, current_user):
        """Update user tradition preference"""
        try:
            schema = UserSettingsSchema()
            data = schema.load(request.get_json())
            current_user.tradition = data['tradition']
            db.session.commit()
            return {'message': 'Tradition updated successfully'}, 200
        except ValidationError as ve:
            logger.error(f"Validation error: {ve.messages}")
            return {'error': ve.messages}, 400
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            return {'error': 'Failed to update tradition'}, 500

class ArchetypeOracleResource(Resource):
    @limiter.limit("60/hour")
    @token_required
    def get(self, current_user):
        """Get user's complete archetype oracle reading"""
        try:
            if not current_user.full_name or not current_user.birth_date:
                return {'error': 'Full name and birth date required for archetype oracle'}, 400

            tradition = current_user.tradition
            cosmic_profile = ArchetypeOracle.generate_cosmic_profile(
                current_user.full_name, current_user.birth_date, tradition
            )
            symbolic_spread = ArchetypeOracle.generate_symbolic_spread(
                current_user.full_name, current_user.birth_date, tradition=tradition
            )
            resonance_map = ArchetypeOracle.generate_resonance_map(
                current_user.full_name, current_user.birth_date, tradition
            )
            cycle_tracker = ArchetypeOracle.calculate_personal_cycle(current_user.birth_date, tradition=tradition)
            karmic_insights = ArchetypeOracle.get_karmic_insights(
                current_user.full_name, current_user.birth_date, tradition
            )

            return {
                'cosmic_profile': cosmic_profile,
                'symbolic_spread': symbolic_spread,
                'resonance_map': resonance_map,
                'cycle_tracker': cycle_tracker,
                'karmic_insights': karmic_insights,
                'user_info': {
                    'full_name': current_user.full_name,
                    'birth_date': current_user.birth_date.isoformat(),
                    'tradition': tradition
                }
            }, 200
        except Exception as e:
            logger.error(f"Archetype oracle error: {e}")
            return {'error': 'Failed to generate archetype oracle reading'}, 500

class PublicArchetypeOracleResource(Resource):
    @limiter.limit("30/hour")
    def post(self):
        """Generate public archetype oracle reading"""
        try:
            schema = PublicOracleSchema()
            data = schema.load(request.get_json())
            reading = ArchetypeOracle.calculate_public_oracle(
                data['full_name'], data['birth_date'], data.get('tradition')
            )
            return reading, 200
        except ValidationError as ve:
            logger.error(f"Validation error: {ve.messages}")
            return {'error': ve.messages}, 400
        except Exception as e:
            logger.error(f"Public oracle error: {e}")
            return {'error': 'Failed to generate public oracle reading'}, 500

class Health(Resource):
    def get(self):
        return {'status': 'ok'}, 200

# ==================== API ROUTES ====================

api.add_resource(Health, '/api/v1/health')
api.add_resource(Register, '/api/v1/register')
api.add_resource(Login, '/api/v1/login')
api.add_resource(PostResource, '/api/v1/posts')
api.add_resource(UploadResource, '/api/v1/upload')
api.add_resource(FollowResource, '/api/v1/follow/<int:user_id>')
api.add_resource(TrendDiscoveryResource, '/api/v1/trends')
api.add_resource(ProfileResource, '/api/v1/profile/<int:user_id>')
api.add_resource(ZodiacNumberResource, '/api/v1/zodiac-numbers')
api.add_resource(NumerologyResource, '/api/v1/numerology')
api.add_resource(NumerologyCompatibilityResource, '/api/v1/numerology/compatibility')
api.add_resource(NumerologyCalculatorResource, '/api/v1/numerology/calculate')
api.add_resource(UserSettingsResource, '/api/v1/user/settings')
api.add_resource(ArchetypeOracleResource, '/api/v1/archetype-oracle')
api.add_resource(PublicArchetypeOracleResource, '/api/v1/archetype-oracle/calculate')

# Return JSON on rate limit exceeded
@app.errorhandler(429)
def ratelimit_handler(e):
    return {'error': 'Too many requests'}, 429

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

# ==================== MAIN APPLICATION ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        logger.info("Database tables created successfully")
        
        trend_engine = TrendEngine()
        trend_engine.generate_trends()
        logger.info("Trend engine initialized with cosmic trends")
    
    logger.info("Starting Star App server...")
    logger.info(f"Available at: http://localhost:{os.environ.get('PORT', 5000)}")
    debug_mode = os.environ.get('FLASK_DEBUG', '1') == '1'
    socketio.run(
        app,
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=debug_mode,
        allow_unsafe_werkzeug=debug_mode
    )
