# -*- coding: utf-8 -*-
# Project: Star App - The Cosmic Social Network
import logging
import os
import random
import sys
import time
from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from flask import Flask, request
from flask_caching import Cache
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_restful import Api, Resource
from flask_socketio import SocketIO, emit, join_room
from marshmallow import Schema, ValidationError, fields, validate

# TODO: Replace with Azure Cosmos DB imports
from cosmos_db import get_cosmos_helper
from . import api

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
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret-key-change-in-production'
app.config['JWT_ALGORITHM'] = 'HS256'

# Initialize extensions
CORS(app, origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','))
rest_api = Api(app)

cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_THRESHOLD': 1000})
cache.init_app(app)

limiter = Limiter(key_func=get_remote_address)
limiter.init_app(app)

socketio = SocketIO(app, cors_allowed_origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','), async_mode='threading' if os.environ.get('TESTING') == 'true' else 'eventlet')

# -------------------- Azure Cosmos DB --------------------
cosmos_helper = get_cosmos_helper()
if cosmos_helper:
    logger.info("Azure Cosmos DB helper initialized")
else:
    logger.warning("COSMOS_DB_CONNECTION_STRING not set; Cosmos DB operations will be disabled.")

# -------------------- Cosmos DB Helper Functions --------------------
def get_user_by_id(user_id):
    """Get user by ID from Cosmos DB"""
    if not users_container:
        return None
    try:
        query = "SELECT * FROM c WHERE c.id = @user_id"
        parameters = [{"name": "@user_id", "value": str(user_id)}]
        items = list(users_container.query_items(query=query, parameters=parameters, enable_cross_partition_query=True))
        return items[0] if items else None
    except Exception as e:
        logger.error(f"Error getting user by ID: {e}")
        return None

def check_username_exists(username):
    """Check if username already exists"""
    if not cosmos_helper:
        return False
    return cosmos_helper.check_username_exists(username)

def create_user(user_data):
    """Create a new user in Cosmos DB"""
    if not cosmos_helper:
        raise ValueError("Cosmos DB not available")
    result = cosmos_helper.create_user(user_data)
    if result['error']:
        raise Exception(f"Failed to create user: {result['error']}")
    return result['data']

def get_user_by_username(username):
    """Get user by username"""
    if not cosmos_helper:
        return None
    result = cosmos_helper.get_user_by_username(username)
    return result['data']

def update_user_online_status(username, is_online=True):
    """Update user's online status and last seen"""
    if not cosmos_helper:
        return
    result = cosmos_helper.update_user_online_status(username, is_online)
    if result['error']:
        logger.error(f"Error updating user online status: {result['error']}")

def get_posts(limit=20):
    """Get recent posts"""
    if not cosmos_helper:
        return []
    result = cosmos_helper.get_all_posts(limit)
    return result['data'] if result['data'] else []

def create_post(post_data):
    """Create a new post"""
    if not cosmos_helper:
        raise ValueError("Cosmos DB not available")
    result = cosmos_helper.create_post(post_data)
    if result['error']:
        raise Exception(f"Failed to create post: {result['error']}")
    return result['data']

def get_user_profile(username):
    """Get user profile data"""
    if not cosmos_helper:
        return None
    result = cosmos_helper.get_user_by_username(username)
    user = result['data']
    if user:
        return {
            'username': user['username'],
            'zodiac_sign': user.get('zodiac_sign'),
            'chinese_zodiac': user.get('chinese_zodiac'),
            'vedic_zodiac': user.get('vedic_zodiac'),
            'bio': user.get('bio', ''),
            'created_at': user.get('created_at')
        }
    return None

def get_user_posts(username, limit=10):
    """Get posts by user"""
    if not cosmos_helper:
        return []
    result = cosmos_helper.get_posts_by_user(username, limit)
    return result['data'] if result['data'] else []

def check_follow_exists(follower_username, followed_username):
    """Check if follow relationship exists"""
    if not cosmos_helper:
        return False
    return cosmos_helper.check_follow_exists(follower_username, followed_username)

def create_follow(follow_data):
    """Create a follow relationship"""
    if not cosmos_helper:
        raise ValueError("Cosmos DB not available")
    result = cosmos_helper.create_follow(follow_data)
    if result['error']:
        raise Exception(f"Failed to create follow: {result['error']}")
    return result['data']

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
    def __init__(self):
        self.trending_hashtags = []
        self.viral_sounds = []
        self.trending_challenges = []
        self.last_updated = datetime.now(timezone.utc)

    def generate_trends(self):
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

# -------------------- Utility --------------------
def get_chinese_zodiac(birth_year):
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

# -------------------- JWT AUTHENTICATION --------------------

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'Authorization' not in request.headers or not request.headers['Authorization'].startswith('Bearer '):
            return {'error': 'Invalid or missing Authorization header'}, 401
        try:
            token = request.headers['Authorization'].split(' ')[1]
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=[app.config['JWT_ALGORITHM']])
            user_data = get_user_by_id(data['user_id'])
            if not user_data:
                return {'error': 'User not found'}, 401
            current_user = type('User', (), {'id': user_data['id'], 'username': user_data['username'], 'zodiac_sign': user_data['zodiac_sign']})
            update_user_online_status(current_user.username, True)
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'error': 'Token is invalid'}, 401
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return {'error': 'Internal server error'}, 500
        # Prepare new args so the wrapped function receives (self, current_user, ...) for methods
        if args:
            new_args = (args[0], current_user) + args[1:]
        else:
            new_args = (current_user,)
        return f(*new_args, **kwargs)
    return decorated

# -------------------- VALIDATION SCHEMAS --------------------
class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))
    zodiac_sign = fields.Str(required=True, validate=validate.OneOf(list(ZODIAC_ACTIONS.keys())))
    birth_date = fields.Date(required=True)
    full_name = fields.Str(allow_none=True)

class PostSchema(Schema):
    content = fields.Str(required=True, validate=validate.Length(min=1, max=500))
    zodiac_sign = fields.Str(required=True, validate=validate.OneOf(list(ZODIAC_ACTIONS.keys())))
    image_url = fields.Str(allow_none=True)

# -------------------- API RESOURCES --------------------
class Register(Resource):
    @limiter.limit("50/hour")
    def post(self):
        schema = RegisterSchema()
        try:
            data = schema.load(request.get_json())
            username = data['username']
            exists = check_username_exists(username)
            if exists:
                return {'error': 'Username already exists'}, 400

            birth_date = data['birth_date']
            birth_year = birth_date.year
            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            new_user = {
                'id': str(random.randint(1000000, 9999999)),  # Generate simple ID for Cosmos DB
                'username': username,
                'password_hash': hashed_password,
                'zodiac_sign': data['zodiac_sign'].capitalize(),
                'birth_date': birth_date.isoformat(),
                'full_name': data.get('full_name'),
                'chinese_zodiac': get_chinese_zodiac(birth_year),
                'chinese_element': get_chinese_zodiac_element(birth_year),
                'vedic_zodiac': get_vedic_zodiac(birth_date),
                'created_at': datetime.now(timezone.utc).isoformat(),
                'last_seen': datetime.now(timezone.utc).isoformat(),
                'is_online': True
            }
            create_user(new_user)
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

        user = get_user_by_username(username)
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return {'error': 'Invalid credentials'}, 401

        try:
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.now(timezone.utc) + timedelta(hours=24)
            }, app.config['JWT_SECRET_KEY'], algorithm=app.config['JWT_ALGORITHM'])

            update_user_online_status(user['id'], True)

            return {
                'token': token,
                'username': user['username'],
                'userId': user['id'],
                'zodiacSign': user['zodiac_sign'],
                'chineseZodiac': user['chinese_zodiac'],
                'vedicZodiac': user['vedic_zodiac'],
                'actions': ZODIAC_ACTIONS.get(user['zodiac_sign'], {}),
                'message': f'Welcome back, {user["zodiac_sign"]} star!'
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
            posts = get_posts(limit=20)
            enriched_posts = []
            for post in posts:
                user = get_user_by_id(post.get('user_id'))
                username = user.get('username') if user else None
                enriched_posts.append({
                    'id': post.get('id'),
                    'content': post.get('content'),
                    'user_id': post.get('user_id'),
                    'username': username,
                    'zodiac_sign': post.get('zodiac_sign'),
                    'image_url': post.get('image_url'),
                    'spark_count': post.get('spark_count', 0),
                    'echo_count': post.get('echo_count', 0),
                    'created_at': post.get('created_at')
                })
            return {'posts': enriched_posts}, 200
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
                'id': str(random.randint(1000000, 9999999)),  # Generate ID for Cosmos DB
                'content': data['content'],
                'user_id': current_user.id,
                'zodiac_sign': current_user.zodiac_sign,
                'image_url': data.get('image_url'),
                'spark_count': 0,
                'echo_count': 0,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            created_post = create_post(new_post)
            cache.delete_memoized(PostResource.get)
            return {'message': 'Post created', 'post_id': created_post.get('id')}, 201
        except ValidationError as err:
            return {'error': f'Invalid input: {err.messages}'}, 400
        except Exception as e:
            logger.error(f"Post creation error: {str(e)}")
            return {'error': 'Failed to create post'}, 500

class UploadResource(Resource):
    @limiter.limit("5/hour")
    @token_required
    def post(self, current_user):
        """Upload a video - temporarily disabled during migration to Cosmos DB"""
        return {'error': 'File uploads are temporarily disabled during database migration'}, 503

class FollowResource(Resource):
    @limiter.limit("50/hour")
    @token_required
    def post(self, current_user, user_id):
        """Follow another user"""
        try:
            if current_user.id == user_id:
                return {'error': 'Cannot follow yourself'}, 400
            existing = check_follow_exists(current_user.id, user_id)
            if existing:
                return {'error': 'Already following'}, 400
            create_follow({
                'id': str(random.randint(1000000, 9999999)),  # Generate ID for Cosmos DB
                'follower_id': current_user.id,
                'followed_id': user_id,
                'created_at': datetime.now(timezone.utc).isoformat()
            })
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
            user = get_user_profile(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            posts = get_user_posts(user_id, limit=10)
            return {
                'profile': {
                    'username': user['username'],
                    'zodiac_sign': user['zodiac_sign'],
                    'chinese_zodiac': user['chinese_zodiac'],
                    'vedic_zodiac': user['vedic_zodiac'],
                    'bio': user['bio'],
                    'join_date': user['created_at']
                },
                'posts': [{'id': p['id'], 'content': p['content'], 'created_at': p['created_at'], 'engagement': {'sparks': p.get('spark_count', 0), 'echoes': p.get('echo_count', 0)}} for p in posts]
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

class HoroscopeResource(Resource):
    @limiter.limit("50/hour")
    @cache.cached(timeout=3600)
    def get(self):
        """Get daily horoscopes for all zodiac signs using BeautifulSoup scraping"""
        try:
            from bs4 import BeautifulSoup

            # Example horoscope scraping (you can customize the source)
            url = "https://www.horoscope.com/daily"
            headers = {
                'User-Agent': 'StarApp/1.0 (+https://example.com)'
            }

            # small timeout to avoid blocking the app
            resp = requests.get(f"{url}/today", headers=headers, timeout=5)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.content, 'html.parser')

            horoscopes = {}

            # This is a generic scraper - you may need to adjust selectors based on the actual site structure
            for sign in ZODIAC_INFO.keys():
                try:
                    sign_lower = sign.lower()
                    horoscope_text = f"Cosmic energies align for {sign} today. The stars favor new beginnings and creative pursuits."

                    sign_element = soup.find('div', {'data-sign': sign_lower}) or soup.find('div', class_=f'{sign_lower}')
                    if sign_element:
                        p = sign_element.find('p')
                        if p and p.get_text(strip=True):
                            horoscope_text = p.get_text(strip=True)

                    horoscopes[sign] = {
                        'sign': sign,
                        'date': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                        'horoscope': horoscope_text,
                        'element': ZODIAC_INFO[sign]['element'],
                        'traits': ZODIAC_INFO[sign]['traits']
                    }
                except Exception as e:
                    logger.warning(f"Failed to get horoscope for {sign}: {str(e)}")
                    horoscopes[sign] = {
                        'sign': sign,
                        'date': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                        'horoscope': f"Cosmic energies align for {sign} today. The stars favor new beginnings and creative pursuits.",
                        'element': ZODIAC_INFO[sign]['element'],
                        'traits': ZODIAC_INFO[sign]['traits']
                    }

            return {
                'horoscopes': horoscopes,
                'generated_at': datetime.now(timezone.utc).isoformat(),
                'source': 'BeautifulSoup Web Scraper'
            }, 200

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch horoscopes (upstream): {str(e)}")
            return {'error': 'Failed to fetch horoscopes', 'reason': 'upstream_error'}, 503
        except Exception as e:
            logger.error(f"Failed to fetch horoscopes: {str(e)}")
            return {'error': 'Failed to fetch horoscopes'}, 500

# ==================== API ROUTES ====================

# Register API resources after all classes are defined
rest_api.add_resource(Register, '/api/v1/register')
rest_api.add_resource(Login, '/api/v1/login')
rest_api.add_resource(PostResource, '/api/v1/posts')
rest_api.add_resource(UploadResource, '/api/v1/upload')
rest_api.add_resource(FollowResource, '/api/v1/follow/<int:user_id>')
rest_api.add_resource(ProfileResource, '/api/v1/profile/<int:user_id>')
rest_api.add_resource(TrendDiscoveryResource, '/api/v1/trends')
rest_api.add_resource(ZodiacNumberResource, '/api/v1/zodiac-numbers')
rest_api.add_resource(HoroscopeResource, '/api/v1/horoscopes')
try:
    rest_api.add_resource(TrendDiscoveryResource, '/api/v1/trends/apify')
except Exception:
    pass

def register_resources(api_obj=None):
    """Register API resources on the provided Api instance or the global api.

    This prevents import-time registration side-effects during tests. Call
    register_resources() during normal startup or use create_app() which calls
    this helper.
    """
    target_api = api_obj or globals().get('rest_api')
    if not target_api:
        return

    # Register each resource with its route
    target_api.add_resource(Register, '/api/v1/register')
    target_api.add_resource(Login, '/api/v1/login')
    target_api.add_resource(PostResource, '/api/v1/posts')
    target_api.add_resource(UploadResource, '/api/v1/upload')
    target_api.add_resource(FollowResource, '/api/v1/follow/<int:user_id>')
    target_api.add_resource(ProfileResource, '/api/v1/profile/<int:user_id>')
    target_api.add_resource(TrendDiscoveryResource, '/api/v1/trends')
    target_api.add_resource(ZodiacNumberResource, '/api/v1/zodiac-numbers')
    target_api.add_resource(HoroscopeResource, '/api/v1/horoscopes')
    # Apify-based trend discovery endpoint
    try:
        target_api.add_resource(TrendDiscoveryResource, '/api/v1/trends/apify')
    except Exception:
        # Best-effort: ignore if the resource isn't available in minimal test environments
        pass


def create_app(config: dict | None = None):
    """Return the configured Flask app. Tests should call this instead of
    importing the module to avoid registering resources at import time.
    """
    if config:
        app.config.update(config)

    try:
        register_resources()
    except Exception:
        # In constrained test environments the global api may be a dummy; ignore
        pass

    # Register API blueprint if not already registered
    if 'api' not in app.blueprints:
        app.register_blueprint(api.api_bp)

    return app

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
