# -*- coding: utf-8 -*-
# Project: Star App - The Cosmic Social Network
# Production Ready with React Frontend Serving & PWA Support
import json
import logging
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from dotenv import load_dotenv
from flask import Flask, g, jsonify, request, send_from_directory
from flask_caching import Cache
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Constants
LOCALHOST_URL = 'http://localhost:3000'
DATABASE_UNAVAILABLE_ERROR = "Database not available"
ORACLE_UNAVAILABLE_ERROR = "Oracle engine not available"
IMAGE_PNG_TYPE = "image/png"

# Load environment variables first
try:
    load_dotenv()
    logger = logging.getLogger(__name__)
    logger.info("Environment variables loaded successfully")
except Exception as e:
    print(f"Failed to load .env file: {e}")

# Set up enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate critical environment variables
required_env_vars = ['SECRET_KEY']
for var in required_env_vars:
    if not os.environ.get(var):
        logger.error(f"Missing required environment variable: {var}")

# Initialize Flask app with React frontend support
frontend_build_path = '../../../star-frontend/out'
static_folder = frontend_build_path if os.path.exists(frontend_build_path) else None

app = Flask(__name__, 
    static_folder=static_folder, 
    static_url_path='')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'test-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload

# Enhanced CORS for production
allowed_origins = [
    LOCALHOST_URL,
    'https://star-backend.azurewebsites.net'
]
CORS(app, origins=allowed_origins, supports_credentials=True)

# Initialize caching
redis_url = os.environ.get('REDIS_URL')
if redis_url:
    cache_config = {
        'CACHE_TYPE': 'RedisCache',
        'CACHE_REDIS_URL': redis_url,
        'CACHE_DEFAULT_TIMEOUT': 300
    }
    logger.info("Using Redis cache")
else:
    cache_config = {'CACHE_TYPE': 'SimpleCache'}
    logger.info("Using SimpleCache (development)")

cache = Cache(config=cache_config)
cache.init_app(app)

# Additional imports for existing functionality
try:
    import bcrypt
    import jwt
    from flask_restful import Api, Resource
    from flask_socketio import SocketIO, emit, join_room
    from marshmallow import (Schema, ValidationError, fields, validate,
                             validates)
    advanced_imports_available = True
    logger.info("Advanced Flask extensions loaded")
except ImportError as e:
    logger.warning(f"Advanced extensions not available: {e}")
    Api = None
    Resource = None
    SocketIO = None
    emit = None
    join_room = None
    Schema = None
    ValidationError = None
    fields = None
    validate = None
    validates = None
    bcrypt = None
    jwt = None
    advanced_imports_available = False

# Optional Redis utilities
try:
    from redis_utils import get_redis, init_redis
    redis_available = True
except ImportError:
    logger.warning("Redis utilities not available")
    get_redis = None
    init_redis = None
    redis_available = False

# SocketIO and Collaboration imports
socketio_available = False
collaboration_engine = None

try:
    from collaboration_api import collaboration_bp
    from collaboration_engine import (get_collaboration_engine,
                                      init_collaboration_engine)
    from flask_socketio import SocketIO

    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
    
    # Initialize collaboration engine
    collaboration_engine = init_collaboration_engine(socketio)
    
    # Register collaboration API blueprint
    app.register_blueprint(collaboration_bp)
    
    socketio_available = True
    logger.info("SocketIO and collaboration engine initialized")
    
except ImportError as e:
    logger.warning(f"SocketIO/Collaboration features not available: {e}")
    socketio = None

# Analytics imports and initialization
analytics_available = False

try:
    # Add the parent directory to the path for analytics imports
    import sys
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if parent_dir not in sys.path:
        sys.path.append(parent_dir)
    
    from analytics_api import analytics_bp
    from analytics_engine import get_analytics_engine

    # Register analytics API blueprint with v1 prefix
    app.register_blueprint(analytics_bp, url_prefix='/api/v1/analytics')
    
    analytics_available = True
    logger.info("Analytics engine and API initialized")
    
except ImportError as e:
    logger.warning(f"Analytics features not available: {e}")
    analytics_bp = None

# Rate limiting (enhanced if available)
if advanced_imports_available:
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"]
    )
else:
    limiter = None

# Safe rate limiting decorator that works with or without limiter
def safe_rate_limit(limit):
    """Rate limiting decorator that works whether limiter is available or not"""
    def decorator(func):
        if limiter:
            return limiter.limit(limit)(func)
        return func
    return decorator

# Core module imports with enhanced error handling
oracle_available = False
archetype_available = False
occult_available = False
analytics_available = False
cosmos_helper = None

# Initialize core database connection
try:
    from cosmos_db import get_cosmos_helper
    cosmos_helper = get_cosmos_helper()
    logger.info("Azure Cosmos DB connection established")
except ImportError as e:
    logger.error(f"Failed to import Cosmos DB helper: {e}")
    logger.warning("Some database features will be unavailable")

# Oracle Engine (Core functionality)
try:
    from oracle_engine import OccultOracleEngine
    oracle_available = True
    logger.info("Oracle engine loaded successfully")
except ImportError as e:
    logger.error(f"Failed to import Oracle engine: {e}")
    OccultOracleEngine = None

# Archetype systems (Extended functionality)
try:
    from archetype_oracle import ArchetypeOracle, CosmicArchetypeOracle
    from numerology import NumerologyCalculator
    archetype_available = True
    logger.info("Archetype and numerology systems loaded")
except ImportError as e:
    logger.warning(f"Archetype/numerology modules not available: {e}")
    ArchetypeOracle = None
    CosmicArchetypeOracle = None
    NumerologyCalculator = None

# Advanced occult features (Optional functionality)
try:
    from archetype_oracle import (ArchetypeSynthesizer, EmotionalOS,
                                  MentorPersonalityEngine, ResonanceTracker)
    occult_available = True
    logger.info("Advanced occult oracle modules loaded")
except ImportError as e:
    logger.warning(f"Advanced occult modules not available: {e}")
    ArchetypeSynthesizer = None
    MentorPersonalityEngine = None
    ResonanceTracker = None
    EmotionalOS = None

# Analytics (Optional functionality)
try:
    from analytics import analytics_bp
    analytics_available = True
    logger.info("Analytics blueprint loaded")
except ImportError as e:
    logger.warning(f"Analytics blueprint not available: {e}")
    analytics_bp = None

# Enhanced Tarot System (Optional functionality)
try:
    from enhanced_tarot_api import enhanced_tarot_bp
    enhanced_tarot_available = True
    logger.info("Enhanced tarot blueprint loaded")
except ImportError as e:
    logger.warning(f"Enhanced tarot blueprint not available: {e}")
    enhanced_tarot_bp = None

# Enhanced Spotify Integration (Optional functionality)
try:
    from enhanced_spotify_api import spotify_bp
    spotify_available = True
    logger.info("Enhanced Spotify blueprint loaded")
except ImportError as e:
    logger.warning(f"Enhanced Spotify blueprint not available: {e}")
    spotify_bp = None

# Main API Blueprint with Enhanced Tarot Endpoints
try:
    from api import api_bp
    api_bp_available = True
    logger.info("Main API blueprint loaded")
except ImportError as e:
    logger.warning(f"Main API blueprint not available: {e}")
    api_bp = None

# React Frontend serving routes
@app.route('/')
def serve_react_app():
    """Serve React app's index.html"""
    if app.static_folder:
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({
        "message": "STAR Backend API",
        "version": "1.0.0",
        "endpoints": ["/api/health", "/api/oracle/*", "/api/posts/*"]
    })

@app.route('/<path:path>')
def serve_react_assets(path):
    """Serve React app static assets"""
    if app.static_folder:
        return send_from_directory(app.static_folder, path)
    return jsonify({"error": "Frontend not available"}), 404

# API Health and Status endpoints
@app.route('/api/health')
@cache.cached(timeout=60)
def health():
    """Enhanced health check with module availability"""
    return jsonify({
        "status": "healthy",
        "message": "STAR Backend API - Production Ready",
        "modules": {
            "cosmos_db": cosmos_helper is not None,
            "oracle_engine": oracle_available,
            "archetype_systems": archetype_available,
            "occult_oracle": occult_available,
            "analytics": analytics_available
        },
        "environment": os.environ.get('FLASK_ENV', 'production'),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/status')
@safe_rate_limit("10 per minute")
def api_status():
    """Detailed API status for monitoring"""
    return jsonify({
        "api_endpoints": {
            "oracle": oracle_available,
            "posts": cosmos_helper is not None,
            "health": True,
            "frontend": app.static_folder is not None
        },
        "cache_status": "redis" if redis_url else "memory",
        "rate_limiting": True,
        "cors_enabled": True
    })

# Authentication Endpoints
@app.route('/api/v1/register', methods=['POST'])
@safe_rate_limit("5 per minute")
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400

        username = data['username'].strip()
        password = data['password']

        # Check if user already exists using CosmosDB helper
        if cosmos_helper:
            try:
                existing_user = cosmos_helper.get_user_by_username(username)
                if existing_user:
                    return jsonify({'error': 'Username already exists'}), 409
            except Exception as e:
                logging.error(f"Database check error: {e}")

        # Hash password
        if advanced_imports_available:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        else:
            return jsonify({'error': 'Registration temporarily unavailable'}), 503

        # Create user data
        user_data = {
            'id': str(uuid.uuid4()),
            'username': username,
            'password_hash': hashed_password,
            'zodiac_sign': data.get('zodiac_sign', ''),
            'chinese_zodiac': data.get('chinese_zodiac', ''),
            'vedic_zodiac': data.get('vedic_zodiac', ''),
            'bio': data.get('bio', ''),
            'full_name': data.get('full_name', ''),
            'birth_date': data.get('birth_date', ''),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'last_seen': datetime.now(timezone.utc).isoformat(),
            'is_online': False
        }

        # Create user in Cosmos DB using helper method
        if cosmos_helper:
            try:
                created_user = cosmos_helper.create_user(user_data)
            except Exception as e:
                logging.error(f"User creation error: {e}")
                return jsonify({'error': 'Failed to create user'}), 500
        else:
            return jsonify({'error': 'Database unavailable'}), 503

        # Generate JWT token
        if advanced_imports_available:
            token = jwt.encode({
                'user_id': user_data['id'],
                'username': username,
                'exp': datetime.now(timezone.utc) + timedelta(days=7)
            }, app.config.get('JWT_SECRET_KEY', 'fallback-secret'), algorithm='HS256')
        else:
            token = f"temp-token-{user_data['id']}"

        return jsonify({
            'message': 'User registered successfully',
            'token': token
        }), 201

    except Exception as e:
        logging.error(f"Registration error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/v1/login', methods=['POST'])
@safe_rate_limit("10 per minute")
def login():
    """Login user"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400

        username = data['username'].strip()
        password = data['password']

        # Get user by username using CosmosDB helper
        if not cosmos_helper:
            return jsonify({'error': 'Database unavailable'}), 503
            
        try:
            user = cosmos_helper.get_user_by_username(username)
            if not user:
                return jsonify({'error': 'Invalid username or password'}), 401
        except Exception as e:
            logging.error(f"User lookup error: {e}")
            return jsonify({'error': 'Database error'}), 500

        # Check password
        if advanced_imports_available:
            if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return jsonify({'error': 'Invalid username or password'}), 401
        else:
            return jsonify({'error': 'Authentication temporarily unavailable'}), 503

        # Generate JWT token
        if advanced_imports_available:
            token = jwt.encode({
                'user_id': user['id'],
                'username': username,
                'exp': datetime.now(timezone.utc) + timedelta(days=7)
            }, app.config.get('JWT_SECRET_KEY', 'fallback-secret'), algorithm='HS256')
        else:
            token = f"temp-token-{user['id']}"

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'username': username,
                'zodiac_sign': user.get('zodiac_sign', '')
            }
        }), 200

    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/v1/zodiac-calculator', methods=['POST'])
def zodiac_calculator():
    """Calculate zodiac signs from birth date"""
    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        
        if not birth_date:
            return jsonify({'error': 'Birth date required'}), 400
        
        date = datetime.strptime(birth_date, '%Y-%m-%d')
        day = date.day
        month = date.month
        year = date.year
        
        # Calculate Western Zodiac
        western_signs = {
            (3, 21): 'Aries', (4, 20): 'Taurus', (5, 21): 'Gemini',
            (6, 21): 'Cancer', (7, 23): 'Leo', (8, 23): 'Virgo',
            (9, 23): 'Libra', (10, 23): 'Scorpio', (11, 22): 'Sagittarius',
            (12, 22): 'Capricorn', (1, 20): 'Aquarius', (2, 19): 'Pisces'
        }
        
        western = 'Capricorn'  # Default
        for (start_month, start_day), sign in western_signs.items():
            if (month == start_month and day >= start_day) or \
               (month == start_month + 1 and day < start_day) or \
               (start_month == 12 and month == 1 and day < start_day):
                western = sign
                break
        
        # Calculate Chinese Zodiac
        chinese_animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 
                          'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
        chinese = chinese_animals[(year - 1900) % 12]
        
        # Calculate Galactic Tone (1-13)
        galactic_tone = (day % 13) + 1
        
        return jsonify({
            'western': western,
            'chinese': chinese,
            'vedic': western,  # Simplified mapping
            'mayan': f'Day {day % 20 + 1}',
            'galactic': f'Tone {galactic_tone}',
            'galactic_tone': galactic_tone
        })
        
    except Exception as e:
        logging.error(f"Zodiac calculation error: {e}")
        return jsonify({'error': 'Calculation failed'}), 500

@app.route('/api/v1/agora-token', methods=['POST'])
def generate_agora_token():
    """Generate AgoraRTC token for live streaming"""
    try:
        data = request.get_json()
        channel_name = data.get('channel_name', f'test-channel-{uuid.uuid4()}')
        uid = data.get('uid', 0)
        
        # Get Agora credentials from environment
        agora_app_id = os.environ.get('AGORA_APP_ID')
        agora_app_certificate = os.environ.get('AGORA_APP_CERTIFICATE')
        
        if not agora_app_id or not agora_app_certificate:
            return jsonify({
                'error': 'AgoraRTC credentials not configured',
                'app_id_present': bool(agora_app_id),
                'certificate_present': bool(agora_app_certificate)
            }), 500
        
        # Token valid for 1 hour
        from datetime import timedelta
        expiration_time = int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp())
        
        # Import Agora token builder if available
        try:
            from agora_token_builder import Role_Publisher, RtcTokenBuilder
            
            agora_token = RtcTokenBuilder.buildTokenWithUid(
                agora_app_id,
                agora_app_certificate,
                channel_name,
                uid,
                Role_Publisher,
                expiration_time
            )
            
            return jsonify({
                'success': True,
                'agora_token': agora_token,
                'channel_name': channel_name,
                'app_id': agora_app_id,
                'uid': uid,
                'expires_at': expiration_time
            })
            
        except ImportError:
            return jsonify({
                'error': 'Agora token builder not available',
                'app_id': agora_app_id,
                'channel_name': channel_name
            }), 503
            
    except Exception as e:
        logging.error(f"Agora token generation error: {e}")
        return jsonify({'error': 'Token generation failed'}), 500

@app.route('/api/oracle/natal-chart', methods=['POST'])
def get_natal_chart():
    if not oracle_available:
        return jsonify({"error": ORACLE_UNAVAILABLE_ERROR}), 503

    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        birth_time = data.get('birth_time')
        location = data.get('location')

        if not all([birth_date, birth_time, location]):
            return jsonify({"error": "Missing required fields: birth_date, birth_time, location"}), 400

        oracle = OccultOracleEngine()
        chart = oracle.calculate_natal_chart(birth_date, birth_time, location)

        return jsonify({
            "success": True,
            "chart": chart
        })
    except Exception as e:
        logger.error(f"Error calculating natal chart: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/oracle/tarot', methods=['POST'])
def get_tarot_reading():
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json()
        question = data.get('question', 'General guidance')

        oracle = OccultOracleEngine()
        reading = oracle.draw_tarot_cards(question)

        return jsonify({
            "success": True,
            "reading": reading
        })
    except Exception as e:
        logger.error(f"Error getting tarot reading: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/oracle/numerology', methods=['POST'])
def get_numerology():
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        name = data.get('name')

        if not birth_date:
            return jsonify({"error": "Missing required field: birth_date"}), 400

        oracle = OccultOracleEngine()
        numerology = oracle.calculate_numerology(birth_date, name)

        return jsonify({
            "success": True,
            "numerology": numerology
        })
    except Exception as e:
        logger.error(f"Error calculating numerology: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/oracle/galactic-tone', methods=['POST'])
def get_galactic_tone():
    """Calculate Galactic Tone and Aztec Day Sign from birth date"""
    try:
        data = request.get_json()
        birth_date = data.get('birth_date')

        if not birth_date:
            return jsonify({"error": "Missing required field: birth_date"}), 400

        # Calculate Aztec Day Sign and Galactic Tone
        result = calculate_aztec_day_sign_and_tone(birth_date)

        return jsonify({
            "success": True,
            "aztec_sign": result['day_sign'],
            "galactic_tone": result['galactic_tone'],
            "tone_info": result['tone_info'],
            "cosmic_signature": result['cosmic_signature'],
            "full_description": result['full_description'],
            "aztec_info": AZTEC_ZODIAC.get(result['day_sign'], {}),
            "aztec_actions": AZTEC_ZODIAC_ACTIONS.get(result['day_sign'], {}),
            "tonalpohualli_position": result['tonalpohualli_position']
        })
    except Exception as e:
        logger.error(f"Error calculating galactic tone: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/oracle/daily-tonalpohualli', methods=['GET'])
def get_daily_tonalpohualli():
    """Get today's Tonalpohualli energy"""
    try:
        today = datetime.now(timezone.utc)
        result = calculate_aztec_day_sign_and_tone(today.isoformat())
        
        return jsonify({
            "success": True,
            "date": today.date().isoformat(),
            "daily_sign": result['day_sign'],
            "daily_tone": result['galactic_tone'],
            "cosmic_signature": result['cosmic_signature'],
            "daily_message": f"Today's Energy: {result['full_description']}",
            "guidance": result['tone_info']['energy'],
            "aztec_info": AZTEC_ZODIAC.get(result['day_sign'], {}),
            "tone_info": result['tone_info']
        })
    except Exception as e:
        logger.error(f"Error getting daily Tonalpohualli: {e}")
        return jsonify({"error": str(e)}), 500

# Social Feed API Endpoints (Optimized for Performance)
@app.route('/api/posts', methods=['GET'])
@cache.cached(timeout=30)  # Cache for 30 seconds
@safe_rate_limit("100 per minute")
def get_posts():
    """Get social feed posts with pagination and filtering"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        limit = min(request.args.get('limit', 20, type=int), 50)  # Max 50 posts
        post_type = request.args.get('type')  # oracle, social, cosmic
        user_id = request.args.get('user_id')
        
        if not cosmos_helper:
            return jsonify({"error": DATABASE_UNAVAILABLE_ERROR}), 503
            
        # Build query
        query = "SELECT * FROM c WHERE c.type = 'post'"
        parameters = []
        
        if post_type:
            query += " AND c.post_type = @post_type"
            parameters.append({"name": "@post_type", "value": post_type})
            
        if user_id:
            query += " AND c.user_id = @user_id"
            parameters.append({"name": "@user_id", "value": user_id})
            
        # Add ordering and pagination
        query += " ORDER BY c.created_at DESC"
        offset = (page - 1) * limit
        query += f" OFFSET {offset} LIMIT {limit}"
        
        posts = list(cosmos_helper.query_items(query, parameters))
        
        # Get total count for pagination
        count_query = "SELECT VALUE COUNT(1) FROM c WHERE c.type = 'post'"
        if post_type:
            count_query = count_query.replace("WHERE c.type = 'post'", 
                                            "WHERE c.type = 'post' AND c.post_type = @post_type")
        if user_id:
            count_query += " AND c.user_id = @user_id" if "AND" not in count_query else ""
            
        try:
            total = list(cosmos_helper.query_items(count_query, parameters))[0]
        except (IndexError, TypeError):
            total = len(posts)
        
        return jsonify({
            "success": True,
            "posts": posts,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting posts: {e}")
        return jsonify({"error": "Failed to fetch posts"}), 500

@app.route('/api/posts', methods=['POST'])
@safe_rate_limit("10 per minute")
def create_post():
    """Create a new social post"""
    try:
        if not cosmos_helper:
            return jsonify({"error": "Database not available"}), 503
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['content', 'user_id', 'username']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Create post object
        post = {
            "id": f"post_{datetime.now().timestamp()}",
            "type": "post",
            "post_type": data.get('post_type', 'social'),
            "content": data['content'][:500],  # Limit content length
            "user_id": data['user_id'],
            "username": data['username'],
            "avatar_url": data.get('avatar_url', ''),
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "oracle_data": data.get('oracle_data', {}),
            "cosmic_signature": data.get('cosmic_signature', ''),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Save to database
        cosmos_helper.create_item(post)
        
        # Clear cache
        cache.delete('view//api/posts')
        
        return jsonify({
            "success": True,
            "post": post
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        return jsonify({"error": "Failed to create post"}), 500

@app.route('/api/posts/<post_id>', methods=['GET'])
@cache.cached(timeout=60)
def get_post(post_id):
    """Get a specific post by ID"""
    try:
        if not cosmos_helper:
            return jsonify({"error": "Database not available"}), 503
            
        query = "SELECT * FROM c WHERE c.id = @post_id"
        parameters = [{"name": "@post_id", "value": post_id}]
        
        posts = list(cosmos_helper.query_items(query, parameters))
        
        if not posts:
            return jsonify({"error": "Post not found"}), 404
            
        return jsonify({
            "success": True,
            "post": posts[0]
        })
        
    except Exception as e:
        logger.error(f"Error getting post {post_id}: {e}")
        return jsonify({"error": "Failed to fetch post"}), 500

@app.route('/api/posts/<post_id>/like', methods=['POST'])
@safe_rate_limit("20 per minute")
def like_post(post_id):
    """Like/unlike a post"""
    try:
        if not cosmos_helper:
            return jsonify({"error": "Database not available"}), 503
            
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({"error": "user_id required"}), 400
            
        # Get current post
        query = "SELECT * FROM c WHERE c.id = @post_id"
        parameters = [{"name": "@post_id", "value": post_id}]
        posts = list(cosmos_helper.query_items(query, parameters))
        
        if not posts:
            return jsonify({"error": "Post not found"}), 404
            
        post = posts[0]
        
        # Toggle like
        likes = post.get('likes', 0)
        liked_by = post.get('liked_by', [])
        
        if user_id in liked_by:
            liked_by.remove(user_id)
            likes = max(0, likes - 1)
            action = 'unliked'
        else:
            liked_by.append(user_id)
            likes += 1
            action = 'liked'
            
        # Update post
        post['likes'] = likes
        post['liked_by'] = liked_by
        post['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        cosmos_helper.upsert_item(post)
        
        # Clear cache
        cache.delete(f'view//api/posts/{post_id}')
        cache.delete('view//api/posts')
        
        return jsonify({
            "success": True,
            "action": action,
            "likes": likes
        })
        
    except Exception as e:
        logger.error(f"Error liking post {post_id}: {e}")
        return jsonify({"error": "Failed to like post"}), 500

# PWA Support Endpoints
@app.route('/manifest.json')
def serve_manifest():
    """Serve PWA manifest"""
    manifest = {
        "name": "STAR - Cosmic Social Network",
        "short_name": "STAR",
        "description": "The ultimate cosmic social platform with Oracle readings",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#0f0f23",
        "theme_color": "#8b5cf6",
        "orientation": "portrait",
        "icons": [
            {
                "src": "/icons/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/icons/icon-512.png", 
                "sizes": "512x512",
                "type": "image/png"
            }
        ],
        "categories": ["social", "entertainment", "lifestyle"],
        "screenshots": [
            {
                "src": "/screenshots/desktop.png",
                "sizes": "1280x720",
                "type": "image/png",
                "form_factor": "wide"
            },
            {
                "src": "/screenshots/mobile.png",
                "sizes": "390x844", 
                "type": "image/png",
                "form_factor": "narrow"
            }
        ]
    }
    
    response = jsonify(manifest)
    response.headers['Content-Type'] = 'application/manifest+json'
    return response

@app.route('/sw.js')
def serve_service_worker():
    """Serve service worker for PWA"""
    if app.static_folder:
        return send_from_directory(app.static_folder, 'sw.js')
    
    # Fallback basic service worker
    sw_content = '''
    const CACHE_NAME = 'star-v1';
    const urlsToCache = [
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css'
    ];

    self.addEventListener('install', function(event) {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(function(cache) {
                    return cache.addAll(urlsToCache);
                })
        );
    });

    self.addEventListener('fetch', function(event) {
        event.respondWith(
            caches.match(event.request)
                .then(function(response) {
                    return response || fetch(event.request);
                }
            )
        );
    });
    '''
    
    response = app.response_class(
        response=sw_content,
        status=200,
        mimetype='application/javascript'
    )
    return response

@app.route('/api/notifications/subscribe', methods=['POST'])
@safe_rate_limit("5 per minute")
def subscribe_notifications():
    """Subscribe to push notifications"""
    try:
        data = request.get_json()
        subscription = data.get('subscription')
        user_id = data.get('user_id')
        
        if not subscription or not user_id:
            return jsonify({"error": "Missing subscription or user_id"}), 400
            
        if cosmos_helper:
            # Save subscription to database
            sub_data = {
                "id": f"sub_{user_id}",
                "type": "push_subscription",
                "user_id": user_id,
                "subscription": subscription,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            cosmos_helper.upsert_item(sub_data)
            
        return jsonify({"success": True})
        
    except Exception as e:
        logger.error(f"Error subscribing to notifications: {e}")
        return jsonify({"error": "Failed to subscribe"}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500

# Advanced Features (Load if available)
try:
    from birth_chart import calculate_birth_chart, geocode_location
    BIRTH_CHART_AVAILABLE = True
    logger.info("Birth chart calculation available")
except ImportError:
    calculate_birth_chart = None
    geocode_location = None
    BIRTH_CHART_AVAILABLE = False
    logger.warning("Birth chart calculation not available")

# Optional blueprints registration
try:
    if analytics_available and analytics_bp:
        app.register_blueprint(analytics_bp)
        logger.info("Analytics blueprint registered")
except Exception as e:
    logger.warning(f"Failed to register analytics blueprint: {e}")

# Azure deployment configuration
if __name__ == '__main__':
    # Development server
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info("Starting STAR Backend Server")
    logger.info(f"Port: {port}")
    logger.info(f"Debug: {debug_mode}")
    logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'production')}")
    logger.info(f"Modules: Oracle={oracle_available}, Cosmos={cosmos_helper is not None}")
    
    app.run(
        host='0.0.0.0', 
        port=port, 
        debug=debug_mode,
        threaded=True
    )
else:
    # Production WSGI server (Gunicorn/Azure App Service)
    logger.info("Running in production mode via WSGI")
    logger.info(f"Modules available: Oracle={oracle_available}, Cosmos={cosmos_helper is not None}")
    logger.info(f"ALLOWED_ORIGINS: {os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000')}")

    # Validate required environment variables
    required_env_vars = ['SECRET_KEY', 'JWT_SECRET_KEY', 'AZURE_COSMOS_URL', 'AZURE_COSMOS_KEY']
    for var in required_env_vars:
        if not os.environ.get(var):
            logger.error(f"Missing required environment variable: {var}")
            raise RuntimeError(f"Missing required environment variable: {var}")

    # Initialize Flask app
    app = Flask(__name__, static_folder='static')
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'test-secret-key')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', os.environ.get('JWT_SECRET', 'test-jwt-secret'))
    app.config['TESTING'] = os.environ.get('TESTING', 'false').lower() == 'true'
    # Limit uploads to 50MB for safety
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
    CORS(app, origins=os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','))

    # Initialize Flask-RESTful API
    api = Api(app)
    # Enhanced cache configuration with Redis support
    redis_url = os.environ.get('REDIS_URL')
    if redis_url:
        cache_config = {
            'CACHE_TYPE': 'RedisCache',
            'CACHE_REDIS_URL': redis_url,
            'CACHE_DEFAULT_TIMEOUT': 300,
            'CACHE_THRESHOLD': 10000
        }
        logger.info("Using Redis cache")
    else:
        cache_config = {
            'CACHE_TYPE': 'SimpleCache',
            'CACHE_THRESHOLD': 1000
        }
        logger.info("Using SimpleCache (Redis not available)")

    cache = Cache(config=cache_config)
    cache.init_app(app)

    def get_user_key():
        from flask import g
        if hasattr(g, 'current_user') and g.current_user:
            return f"user:{g.current_user.id}"
        return get_remote_address()

    limiter = Limiter(app=app, key_func=get_user_key)
    limiter.init_app(app)

    # Redis configuration for Socket.IO message queue
    redis_url = os.environ.get('REDIS_URL')
    socketio_config = {
        'cors_allowed_origins': os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
        'async_mode': 'threading',
        'logger': True,
        'engineio_logger': True
    }

    # Configure Redis as message queue for Socket.IO (for multi-server scalability)
    if redis_url:
        socketio_config.update({
            'message_queue': redis_url,
            'channel': 'socketio'
        })
        logger.info("Socket.IO configured with Redis message queue")

    socketio = SocketIO(app, **socketio_config)

    # Initialize Redis manager
    redis_url = os.environ.get('REDIS_URL')
    logger.info(f"REDIS_URL from environment: {redis_url}")
    init_redis(redis_url)

    # Test Redis connection
    try:
        redis_client = get_redis()
        if redis_client:
            redis_client.set('health_check', 'ok', ex=60)  # expires in 60 seconds
            test_value = redis_client.get('health_check')
            if test_value == 'ok':
                logger.info("Redis connection test successful")
            else:
                logger.warning("Redis connection test failed - could not set/get value")
        else:
            logger.warning("Redis client not available for testing")
    except Exception as e:
        logger.error(f"Redis connection test failed: {e}")

    # Azure Cosmos DB helper (for data storage) - Replaces Supabase
    from cosmos_db import get_cosmos_helper
    try:
        cosmos_helper = get_cosmos_helper()
        if cosmos_helper:
            logger.info("Azure Cosmos DB helper initialized")
        else:
            logger.warning("AZURE_COSMOS_URL or AZURE_COSMOS_KEY not set; Cosmos DB operations will be disabled.")
    except ValueError as e:
        cosmos_helper = None
        logger.warning(f"Failed to initialize Cosmos DB: {e}")

    # JWT Configuration
    app.config['JWT_ALGORITHM'] = 'HS256'

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
        'Dhanu': {'comment': 'Quest', 'like': 'Aim', 'follow': 'Explore', 'share': 'Inspire'},
        'Makara': {'comment': 'Plan', 'like': 'Build', 'follow': 'Ascend', 'share': 'Structure'},
        'Kumbha': {'comment': 'Pulse', 'like': 'Invent', 'follow': 'Orbit', 'share': 'Broadcast'},
        'Meena': {'comment': 'Drift', 'like': 'Dream', 'follow': 'Merge', 'share': 'Bless'}
    }

    MAYAN_ZODIAC = {
        'Crocodile': {'element': 'Earth', 'traits': 'Nurturing, protective, creative'},
        'Wind': {'element': 'Air', 'traits': 'Inspiring, communicative, ethereal'},
        'Jaguar': {'element': 'Fire', 'traits': 'Powerful, magical, shamanic'},
        'Road': {'element': 'Earth', 'traits': 'Connecting, linking, weaving'},
        'Serpent': {'element': 'Fire', 'traits': 'Transformative, healing, wise'},
        'Death': {'element': 'Fire', 'traits': 'Liberating, transitional, rebirth'},
        'Deer': {'element': 'Earth', 'traits': 'Graceful, resilient, humanitarian'},
        'Rabbit': {'element': 'Air', 'traits': 'Harmonious, creative, star-seed'},
        'Water': {'element': 'Water', 'traits': 'Purifying, empathic, intuitive'},
        'Dog': {'element': 'Earth', 'traits': 'Loyal, guiding, protective'},
        'Monkey': {'element': 'Air', 'traits': 'Playful, inventive, trickster'},
        'Reed': {'element': 'Earth', 'traits': 'Resilient, visionary, exploratory'},
        'Eagle': {'element': 'Fire', 'traits': 'Soaring, visionary, achieving'},
        'Vulture': {'element': 'Air', 'traits': 'Wise, liberating, forgiving'},
        'Earth': {'element': 'Earth', 'traits': 'Harmonious, stewardship, navigating'},
        'Storm': {'element': 'Air', 'traits': 'Revealing, truth-seeking, mirroring'},
        'Sun': {'element': 'Fire', 'traits': 'Enlightening, solar, radiant'},
        'Night': {'element': 'Water', 'traits': 'Ennobling, wise, ruling'},
        'Seed': {'element': 'Earth', 'traits': 'Awakening, targeting, realizing'}
    }

    MAYAN_ZODIAC_ACTIONS = {
        'Crocodile': {'comment': 'Nurture', 'like': 'Embrace', 'follow': 'Protect', 'share': 'Create'},
        'Wind': {'comment': 'Whisper', 'like': 'Breathe', 'follow': 'Guide', 'share': 'Inspire'},
        'Jaguar': {'comment': 'Prowl', 'like': 'Strike', 'follow': 'Hunt', 'share': 'Guard'},
        'Road': {'comment': 'Journey', 'like': 'Connect', 'follow': 'Link', 'share': 'Weave'},
        'Serpent': {'comment': 'Transform', 'like': 'Heal', 'follow': 'Wisdom', 'share': 'Renew'},
        'Death': {'comment': 'Release', 'like': 'Rebirth', 'follow': 'Transition', 'share': 'Liberate'},
        'Deer': {'comment': 'Grace', 'like': 'Resilient', 'follow': 'Humanitarian', 'share': 'Serve'},
        'Rabbit': {'comment': 'Harmony', 'like': 'Creative', 'follow': 'Star-seed', 'share': 'Harmonize'},
        'Water': {'comment': 'Purify', 'like': 'Empath', 'follow': 'Intuitive', 'share': 'Heal'},
        'Dog': {'comment': 'Loyal', 'like': 'Guide', 'follow': 'Protect', 'share': 'Lead'},
        'Monkey': {'comment': 'Playful', 'like': 'Invent', 'follow': 'Artistic', 'share': 'Trickster'},
        'Reed': {'comment': 'Resilient', 'like': 'Visionary', 'follow': 'Explore', 'share': 'Teach'},
        'Eagle': {'comment': 'Soar', 'like': 'Visionary', 'follow': 'Free', 'share': 'Achieve'},
        'Vulture': {'comment': 'Wise', 'like': 'Warrior', 'follow': 'Liberate', 'share': 'Forgive'},
        'Earth': {'comment': 'Navigate', 'like': 'Harmonious', 'follow': 'Steward', 'share': 'Earth'},
        'Storm': {'comment': 'Reveal', 'like': 'Sword', 'follow': 'Truth', 'share': 'Mirror'},
        'Sun': {'comment': 'Enlighten', 'like': 'Solar', 'follow': 'Radiant', 'share': 'Create'},
        'Night': {'comment': 'Ennoble', 'like': 'Solar Lord', 'follow': 'Wise', 'share': 'Rule'},
        'Seed': {'comment': 'Awaken', 'like': 'Target', 'follow': 'Group', 'share': 'Realize'}
    }

    AZTEC_ZODIAC = {
        'Crocodile': {'element': 'Earth', 'traits': 'Primal, nurturing; creative chaos'},
        'Wind': {'element': 'Air', 'traits': 'Communicative, visionary; restless intellect'},
        'House': {'element': 'Earth', 'traits': 'Protective, communal; family-oriented'},
        'Lizard': {'element': 'Water', 'traits': 'Agile, resilient; adaptable survivor'},
        'Serpent': {'element': 'Fire', 'traits': 'Transformative, wise; passionate healer'},
        'Death': {'element': 'Fire', 'traits': 'Rebirth, transitional; philosophical'},
        'Deer': {'element': 'Earth', 'traits': 'Graceful, resilient; humanitarian'},
        'Rabbit': {'element': 'Air', 'traits': 'Harmonious, creative; intuitive artist'},
        'Water': {'element': 'Water', 'traits': 'Emotional, purifying; empathic flow'},
        'Dog': {'element': 'Earth', 'traits': 'Loyal, guiding; protective leader'},
        'Monkey': {'element': 'Air', 'traits': 'Playful, inventive; trickster artist'},
        'Grass': {'element': 'Earth', 'traits': 'Flexible, grounded; resilient grower'},
        'Reed': {'element': 'Water', 'traits': 'Resilient, visionary; skywalker'},
        'Jaguar': {'element': 'Fire', 'traits': 'Powerful, intuitive; warrior shaman'},
        'Eagle': {'element': 'Fire', 'traits': 'Visionary, free; soaring achiever'},
        'Vulture': {'element': 'Air', 'traits': 'Wise, liberating; forgiving sage'},
        'Movement': {'element': 'Water', 'traits': 'Dynamic, transformative; change-maker'},
        'Flint': {'element': 'Water', 'traits': 'Obsidian-sharp, decisive; cutter of truth'},
        'Storm': {'element': 'Air', 'traits': 'Revealing, purifying; thunderous renewal'},
        'Sun': {'element': 'Fire', 'traits': 'Enlightening, radiant; solar creator'}
    }

    AZTEC_ZODIAC_ACTIONS = {
        'Crocodile': {'comment': 'Nurture', 'like': 'Embrace', 'follow': 'Protect', 'share': 'Create'},
        'Wind': {'comment': 'Whisper', 'like': 'Breathe', 'follow': 'Guide', 'share': 'Inspire'},
        'House': {'comment': 'Shelter', 'like': 'Build', 'follow': 'Gather', 'share': 'Harmonize'},
        'Lizard': {'comment': 'Adapt', 'like': 'Climb', 'follow': 'Survive', 'share': 'Renew'},
        'Serpent': {'comment': 'Transform', 'like': 'Heal', 'follow': 'Wisdom', 'share': 'Renew'},
        'Death': {'comment': 'Release', 'like': 'Rebirth', 'follow': 'Transition', 'share': 'Liberate'},
        'Deer': {'comment': 'Grace', 'like': 'Leap', 'follow': 'Humanitarian', 'share': 'Serve'},
        'Rabbit': {'comment': 'Harmony', 'like': 'Bound', 'follow': 'Multiply', 'share': 'Fertility'},
        'Water': {'comment': 'Flow', 'like': 'Cleanse', 'follow': 'Nourish', 'share': 'Refresh'},
        'Dog': {'comment': 'Loyal', 'like': 'Guard', 'follow': 'Protect', 'share': 'Guide'},
        'Monkey': {'comment': 'Play', 'like': 'Swing', 'follow': 'Entertain', 'share': 'Amuse'},
        'Grass': {'comment': 'Grow', 'like': 'Bend', 'follow': 'Endure', 'share': 'Sustain'},
        'Reed': {'comment': 'Conduct', 'like': 'Channel', 'follow': 'Navigate', 'share': 'Connect'},
        'Jaguar': {'comment': 'Prowl', 'like': 'Strike', 'follow': 'Hunt', 'share': 'Rule'},
        'Eagle': {'comment': 'Soar', 'like': 'Dive', 'follow': 'Scout', 'share': 'Achieve'},
        'Vulture': {'comment': 'Circle', 'like': 'Cleanse', 'follow': 'Purify', 'share': 'Renew'},
        'Movement': {'comment': 'Shift', 'like': 'Dance', 'follow': 'Change', 'share': 'Transform'},
        'Flint': {'comment': 'Cut', 'like': 'Sharp', 'follow': 'Decisive', 'share': 'Truth'},
        'Storm': {'comment': 'Thunder', 'like': 'Lightning', 'follow': 'Cleanse', 'share': 'Renew'},
        'Sun': {'comment': 'Shine', 'like': 'Radiate', 'follow': 'Illuminate', 'share': 'Life'}
    }

    # 13 Galactic Tones for Mayan and Aztec astrology systems
    GALACTIC_TONES = {
        1: {
            'name': 'Magnetic',
            'symbol': '•',
            'meaning': 'Unity, Initiation',
            'energy': 'The spark of creation, setting intentions and attracting purpose. Begins the cycle with raw potential.',
            'qualities': 'Bold, focused, magnetic. Drives individuals to initiate projects or inspire others.',
            'challenges': 'Over-enthusiasm, impulsiveness',
            'color': '#FFFFFF',  # Bright white
            'avatar_effect': {
                'emissiveIntensity': 0.7,
                'duration': 200,
                'scale': [1.5, 1.5, 1.5],
                'animation': 'pulsing_glow'
            },
            'particle_effect': {
                'count': 25,
                'speed': 2,
                'direction': 'out',
                'pattern': 'radial_burst'
            },
            'action_modifier': {
                'scale': 1.5,
                'intensity': 1.2,
                'effect': 'quick_scale_up'
            }
        },
        2: {
            'name': 'Lunar',
            'symbol': '••',
            'meaning': 'Polarity, Duality',
            'energy': 'Balances opposites (light/dark, self/other). Challenges individuals to find harmony within conflict.',
            'qualities': 'Stabilizing, introspective. Encourages adaptability but can lead to indecision.',
            'challenges': 'Indecision, inner conflict',
            'color': '#C0C0C0',  # Silver-gray
            'avatar_effect': {
                'emissiveIntensity': 0.5,
                'duration': 300,
                'position': [0, 0.2, 0],
                'animation': 'gentle_oscillation'
            },
            'particle_effect': {
                'count': 15,
                'speed': 1.5,
                'direction': 'left_right',
                'pattern': 'dual_streams'
            },
            'action_modifier': {
                'scale': 1.1,
                'intensity': 0.9,
                'effect': 'subtle_wobble'
            }
        },
        3: {
            'name': 'Electric',
            'symbol': '•••',
            'meaning': 'Activation, Service',
            'energy': 'Energizes and bonds, activating creative expression. Fuels dynamic action and teamwork.',
            'qualities': 'Vibrant, catalytic. Sparks enthusiasm but may scatter energy.',
            'challenges': 'Energy scattering, over-stimulation',
            'color': '#00B7EB',  # Electric blue
            'avatar_effect': {
                'emissiveIntensity': 0.8,
                'duration': 150,
                'scale': [1.4, 1.4, 1.4],
                'animation': 'electric_burst'
            },
            'particle_effect': {
                'count': 20,
                'speed': 3,
                'direction': 'random',
                'pattern': 'electric_sparks'
            },
            'action_modifier': {
                'scale': 1.3,
                'intensity': 1.4,
                'effect': 'jittery_motion'
            }
        },
        # Adding more tones (4-13)...
        4: {'name': 'Self-Existing', 'color': '#4CAF50'},
        5: {'name': 'Overtone', 'color': '#FFD700'},
        6: {'name': 'Rhythmic', 'color': '#40E0D0'},
        7: {'name': 'Resonant', 'color': '#800080'},
        8: {'name': 'Galactic', 'color': '#4B0082'},
        9: {'name': 'Solar', 'color': '#FFA500'},
        10: {'name': 'Planetary', 'color': '#8B0000'},
        11: {'name': 'Spectral', 'color': '#ADD8E6'},
        12: {'name': 'Crystal', 'color': '#F5F5F5'},
        13: {'name': 'Cosmic', 'color': '#4A2C6B'}
    }

    # ==================== GALACTIC TONE CALCULATOR ====================
    
    def calculate_galactic_tone(birth_date):
        """Calculate Galactic Tone (1-13) from birth date using Tonalpohualli calendar"""
        if isinstance(birth_date, str):
            birth_date = datetime.fromisoformat(birth_date.replace('Z', '+00:00'))
        
        # Calculate Julian Day
        jd = birth_date.timestamp() / 86400 + 2440587.5
        
        # Calculate position in 260-day Tonalpohualli cycle
        tonalpohualli_position = int(jd + 0.5) % 260
        
        # Calculate galactic tone (1-13)
        galactic_tone = (tonalpohualli_position % 13) + 1
        
        return galactic_tone
    
    def get_galactic_tone_info(tone_number):
        """Get complete Galactic Tone information"""
        return GALACTIC_TONES.get(tone_number, GALACTIC_TONES[1])
    
    def calculate_aztec_day_sign_and_tone(birth_date):
        """Calculate both Aztec Day Sign and Galactic Tone from birth date"""
        if isinstance(birth_date, str):
            birth_date = datetime.fromisoformat(birth_date.replace('Z', '+00:00'))
        
        # Aztec Day Signs in correct order (20 signs)
        day_signs = [
            'Crocodile', 'Wind', 'House', 'Lizard', 'Serpent', 'Death', 'Deer',
            'Rabbit', 'Water', 'Dog', 'Monkey', 'Grass', 'Reed', 'Jaguar',
            'Eagle', 'Vulture', 'Movement', 'Flint', 'Storm', 'Sun'
        ]
        
        # Calculate Julian Day
        jd = birth_date.timestamp() / 86400 + 2440587.5
        
        # Calculate position in 260-day Tonalpohualli cycle
        tonalpohualli_position = int(jd + 0.5) % 260
        
        # Calculate day sign (0-19) and galactic tone (1-13)
        day_sign_index = tonalpohualli_position % 20
        galactic_tone = (tonalpohualli_position % 13) + 1
        
        day_sign = day_signs[day_sign_index]
        tone_info = get_galactic_tone_info(galactic_tone)
        
        return {
            'day_sign': day_sign,
            'galactic_tone': galactic_tone,
            'tone_info': tone_info,
            'cosmic_signature': f"{galactic_tone} {day_sign}",
            'full_description': f"{tone_info['symbol']} {tone_info['name']} {day_sign}",
            'tonalpohualli_position': tonalpohualli_position
        }

    # ==================== ZODIAC NUMBER GENERATOR ====================

    class ZodiacNumberGenerator:
        def __init__(self):
            self.western_zodiacs = list(ZODIAC_INFO.keys())
            self.chinese_zodiacs = list(CHINESE_ZODIAC.keys())
            self.vedic_zodiacs = list(VEDIC_ZODIAC.keys())
            self.mayan_zodiacs = list(MAYAN_ZODIAC.keys())
            self.aztec_zodiacs = list(AZTEC_ZODIAC.keys())

        def generate_numbers(self):
            """Generate five single-digit numbers for Western, Chinese, Vedic, Mayan, and Aztec zodiacs"""
            # Use daily seed for consistency
            random.seed(datetime.now(timezone.utc).date().isoformat())
            western_number = random.randint(0, 9)
            chinese_number = random.randint(0, 9)
            vedic_number = random.randint(0, 9)
            mayan_number = random.randint(0, 9)
            aztec_number = random.randint(0, 9)
            
            # Map numbers to zodiac signs (0-9 cycle through signs)
            western_sign = self.western_zodiacs[western_number % len(self.western_zodiacs)]
            chinese_sign = self.chinese_zodiacs[chinese_number % len(self.chinese_zodiacs)]
            vedic_sign = self.vedic_zodiacs[vedic_number % len(self.vedic_zodiacs)]
            mayan_sign = self.mayan_zodiacs[mayan_number % len(self.mayan_zodiacs)]
            aztec_sign = self.aztec_zodiacs[aztec_number % len(self.aztec_zodiacs)]
            
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
                'mayan': {
                    'number': mayan_number,
                    'sign': mayan_sign,
                    'info': MAYAN_ZODIAC[mayan_sign]
                },
                'aztec': {
                    'number': aztec_number,
                    'sign': aztec_sign,
                    'info': AZTEC_ZODIAC[aztec_sign]
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

    from star_auth import token_required

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
        @safe_rate_limit("100/hour")
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

            # Check if username exists using Cosmos DB
            if check_username_exists(username):
                return {'error': 'Username already exists'}, 400

            chinese_zodiac = get_chinese_zodiac(birth_year)
            chinese_element = get_chinese_zodiac_element(birth_year)
            vedic_zodiac = get_vedic_zodiac(birth_date)

            # Calculate numerology numbers
            from archetype_oracle import ArchetypeOracle, CosmicArchetypeOracle
            from numerology import NumerologyCalculator
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

            # Create user data dictionary for Cosmos DB
            new_user_data = {
                'id': str(random.randint(1000000, 9999999)),  # Generate simple ID for Cosmos DB
                'username': username,
                'password_hash': hashed_password,
                'zodiac_sign': zodiac_sign,
                'birth_date': birth_date.isoformat(),
                'full_name': full_name,
                'chinese_zodiac': chinese_zodiac,
                'chinese_element': chinese_element,
                'vedic_zodiac': vedic_zodiac,
                'life_path_number': life_path,
                'destiny_number': destiny,
                'soul_urge_number': soul_urge,
                'personality_number': personality,
                'birth_day_number': birth_day,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'last_seen': datetime.now(timezone.utc).isoformat(),
                'is_online': True
            }

            try:
                create_user(new_user_data)
                return {
                    'message': 'Registered successfully',
                    'numerology_preview': {
                        'life_path': life_path,
                        'destiny': destiny
                    }
                }, 201
            except Exception as e:
                logger.error(f"Registration error: {str(e)}")
                return {'error': 'Registration failed'}, 500

    class Login(Resource):
        @safe_rate_limit("100/hour")
        def post(self):
            data = request.get_json(silent=True) or request.form.to_dict() or {}
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return {'error': 'Missing username or password'}, 400

            # Get user from Cosmos DB
            user = get_user_by_username(username)
            if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return {'error': 'Invalid credentials'}, 401

            try:
                token = jwt.encode({
                    'user_id': user['id'],
                    'exp': datetime.now(timezone.utc) + timedelta(hours=24)
                }, app.config['JWT_SECRET_KEY'], algorithm=app.config['JWT_ALGORITHM'])

                # Update user online status using Cosmos DB
                update_user_online_status(user['id'], True)

                return {
                    'token': token,
                    'username': user['username'],
                    'userId': user['id'],
                    'zodiacSign': user['zodiac_sign'],
                    'chineseZodiac': user.get('chinese_zodiac'),
                    'vedicZodiac': user.get('vedic_zodiac'),
                    'actions': ZODIAC_ACTIONS.get(user['zodiac_sign'], {}),
                    'numerology': {  # Add numerology data
                        'lifePath': user.get('life_path_number'),
                        'destiny': user.get('destiny_number'),
                        'hasNumerology': bool(user.get('full_name') and user.get('birth_date'))
                    },
                    'message': f'Welcome back, {user["zodiac_sign"]} star!'
                }, 200
            except Exception as e:
                logger.error(f"Login error: {str(e)}")
                return {'error': 'Login failed'}, 500

    class PostResource(Resource):
        @safe_rate_limit("50/hour")
        @cache.cached(timeout=60)
        def get(self):
            """Get all posts with caching and optional planet filtering"""
            try:
                planet_filter = request.args.get('filter')
                
                # Get posts from Cosmos DB
                cosmos_helper = get_cosmos_helper()
                all_posts = cosmos_helper.get_posts(limit=50)  # Get more posts for filtering
                
                # Apply planet-based filtering if requested
                if planet_filter:
                    planet_themes = {
                        'venus': ['love', 'harmony', 'connection', 'beauty', 'relationship'],
                        'mars': ['action', 'challenge', 'energy', 'courage', 'passion'],
                        'jupiter': ['growth', 'wisdom', 'expansion', 'luck', 'adventure']
                    }
                    if planet_filter in planet_themes:
                        theme_keywords = planet_themes[planet_filter]
                        # Filter posts containing planet-related keywords
                        filtered_posts = []
                        for post in all_posts:
                            content = post.get('content', '').lower()
                            if any(keyword in content for keyword in theme_keywords):
                                filtered_posts.append(post)
                        posts = filtered_posts[:20]  # Limit to 20
                    else:
                        posts = all_posts[:20]  # No filtering, just limit
                else:
                    posts = all_posts[:20]  # No filtering, just limit
                
                # Add planetary context for filtered results
                planetary_context = {}
                if planet_filter:
                    planet_contexts = {
                        'venus': {
                            'current_hour': 'Venus Hour',
                            'dominant_energy': 'Harmony and connection',
                            'favorable_actions': ['Connect', 'Create', 'Reflect']
                        },
                        'mars': {
                            'current_hour': 'Mars Hour',
                            'dominant_energy': 'Action and energy',
                            'favorable_actions': ['Challenge', 'Act', 'Compete']
                        },
                        'jupiter': {
                            'current_hour': 'Jupiter Hour',
                            'dominant_energy': 'Growth and wisdom',
                            'favorable_actions': ['Learn', 'Expand', 'Explore']
                        }
                    }
                    planetary_context = planet_contexts.get(planet_filter, {})
                
                return {
                    'posts': [{
                        'id': post.get('id'),
                        'content': post.get('content'),
                        'username': post.get('username'),  # Cosmos DB stores username directly
                        'zodiac_sign': post.get('zodiac_sign'),
                        'image_url': post.get('image_url'),
                        'spark_count': post.get('spark_count', 0),
                        'echo_count': post.get('echo_count', 0),
                        'created_at': post.get('created_at')
                    } for post in posts],
                    'planetary_context': planetary_context
                }, 200
            except Exception as e:
                logger.error(f"Failed to fetch posts: {str(e)}")
                return {'error': 'Failed to fetch posts'}, 500

        @safe_rate_limit("20/hour")
        @token_required
        def post(self, current_user):
            """Create a new post"""
            schema = PostSchema()
            try:
                data = schema.load(request.get_json())
            except ValidationError as err:
                return {'error': f'Invalid input: {err.messages}'}, 400

            try:
                # Create post using Cosmos DB
                cosmos_helper = get_cosmos_helper()
                post_data = {
                    'content': data['content'],
                    'username': current_user.username,
                    'zodiac_sign': current_user.zodiac_sign,
                    'image_url': data.get('image_url'),
                    'spark_count': 0,
                    'echo_count': 0,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                result = cosmos_helper.create_post(post_data)
                if result['error']:
                    return {'error': 'Failed to create post'}, 500
                
                # Invalidate cached GET /api/v1/posts results
                cache.delete_memoized(PostResource.get)
                
                return {'message': 'Post created', 'post_id': result['data']['id']}, 201
            except Exception as e:
                logger.error(f"Post creation error: {str(e)}")
                return {'error': 'Failed to create post'}, 500

    # TODO: Replace with Azure Blob Storage upload functionality
    class TrendDiscoveryResource(Resource):
        @safe_rate_limit("60/hour")
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
        @safe_rate_limit("60/hour")
        def get(self, user_id):
            """Get user profile with numerology"""
            try:
                # For Cosmos DB migration, user_id is treated as username
                cosmos_helper = get_cosmos_helper()
                user_result = cosmos_helper.get_user_by_username(user_id)
                if user_result['error'] or not user_result['data']:
                    return {'error': 'User not found'}, 404
                
                user = user_result['data']
                
                # Get posts by this user
                posts_result = cosmos_helper.get_posts_by_user(user_id, limit=10)
                posts = posts_result['data'] if posts_result['data'] else []

                profile_data = {
                    'profile': {
                        'username': user.get('username'),
                        'zodiac_sign': user.get('zodiac_sign'),
                        'chinese_zodiac': user.get('chinese_zodiac'),
                        'vedic_zodiac': user.get('vedic_zodiac'),
                        'bio': user.get('bio'),
                        'join_date': user.get('created_at')
                    },
                    'posts': [{
                        'id': post.get('id'),
                        'content': post.get('content'),
                        'created_at': post.get('created_at'),
                        'engagement': {'sparks': post.get('spark_count', 0), 'echoes': post.get('echo_count', 0)}
                    } for post in posts]
                }

                # Add numerology data if available
                if user.get('life_path_number'):
                    profile_data['numerology'] = {
                        'life_path_number': user.get('life_path_number'),
                        'destiny_number': user.get('destiny_number'),
                        'soul_urge_number': user.get('soul_urge_number')
                    }

                return profile_data, 200
            except Exception as e:
                logger.error(f"Failed to fetch profile: {str(e)}")
                return {'error': 'Failed to fetch profile'}, 500

    class ZodiacNumberResource(Resource):
        @safe_rate_limit("100/hour")
        @cache.cached(timeout=300)
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
        @safe_rate_limit("50/hour")
        @token_required
        def post(self, current_user, user_id):
            """Follow another user"""
            try:
                # For Cosmos DB migration, user_id is treated as username
                cosmos_helper = get_cosmos_helper()
                
                # Check if trying to follow self
                if current_user.username == str(user_id):
                    return {'error': 'Cannot follow yourself'}, 400
                
                # Check if already following
                if cosmos_helper.check_follow_exists(current_user.username, str(user_id)):
                    return {'error': 'Already following'}, 400
                
                # Create follow relationship
                follow_data = {
                    'follower_username': current_user.username,
                    'followed_username': str(user_id),
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                
                result = cosmos_helper.create_follow(follow_data)
                if result['error']:
                    return {'error': 'Failed to follow'}, 500
                
                return {'message': 'Followed'}, 201
            except Exception as e:
                logger.error(f"Follow error: {str(e)}")
                return {'error': 'Failed to follow'}, 500

    class SparkResource(Resource):
        @token_required
        def post(self, current_user, post_id):
            """Spark (like) a post"""
            try:
                cosmos_helper = get_cosmos_helper()
                
                # Get post from Cosmos DB
                post = cosmos_helper.get_post_by_id(post_id)
                
                if not post:
                    return {'error': 'Post not found'}, 404
                
                # Check if already sparked
                if cosmos_helper.check_spark_exists(post_id, current_user['id']):
                    return {'error': 'Post already sparked'}, 400
                
                # Create spark record
                spark_data = {
                    'post_id': post_id,
                    'user_id': current_user['id'],
                    'username': current_user['username'],
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                cosmos_helper.create_spark(spark_data)
                
                # Update post spark count
                post['spark_count'] = cosmos_helper.get_sparks_count(post_id)
                
                # Update post in Cosmos DB
                cosmos_helper.update_post(post_id, {'spark_count': post['spark_count']})
                
                # Create notification if not own post
                if post.get('user_id') != g.current_user['id']:
                    cosmos_helper.create_notification({
                        'id': str(uuid.uuid4()),
                        'user_id': post.get('user_id'),
                        'type': 'spark',
                        'message': f"{g.current_user['username']} sparked your post",
                        'created_at': datetime.now(timezone.utc).isoformat(),
                        'read': False
                    })
                
                # Clear cache
                cache.delete('posts')
                cache.delete_memoized(PostResource.get)
                
                # Emit real-time update
                socketio.emit('post_updated', {
                    'post_id': post_id,
                    'spark_count': post['spark_count'],
                    'type': 'spark'
                }, room=f'post_{post_id}')
                
                return {'message': 'Post sparked!', 'spark_count': post['spark_count']}, 201
                
            except Exception as e:
                logger.error(f"Spark error: {str(e)}")
                return {'error': 'Failed to spark post'}, 500

    class CommentResource(Resource):
        @token_required
        def post(self, current_user, post_id):
            """Add comment to post"""
            data = request.get_json()
            content = data.get('content', '').strip()
            
            if not content:
                return {'error': 'Comment content required'}, 400
            
            try:
                cosmos_helper = get_cosmos_helper()
                
                # Get post from Cosmos DB
                post = cosmos_helper.get_post_by_id(post_id)
                
                if not post:
                    return {'error': 'Post not found'}, 404
                
                # Create comment in Cosmos DB
                comment_data = {
                    'post_id': post_id,
                    'user_id': current_user['id'],
                    'username': current_user['username'],
                    'content': content,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
                created_comment = cosmos_helper.create_comment(comment_data)
                
                # Update post echo_count (comment count) in Cosmos DB
                comment_count = len(cosmos_helper.get_comments_for_post(post_id))
                cosmos_helper.update_post(post_id, {'echo_count': comment_count})
                
                # Create notification if not own post
                if post.get('user_id') != current_user['id']:
                    cosmos_helper.create_notification({
                        'id': str(uuid.uuid4()),
                        'user_id': post.get('user_id'),
                        'type': 'comment',
                        'message': f"{current_user['username']} commented on your post",
                        'created_at': datetime.now(timezone.utc).isoformat(),
                        'read': False
                    })
                
                # Clear cache
                cache.delete('posts')
                
                # Emit real-time update
                socketio.emit('new_comment', {
                    'post_id': post_id,
                    'comment': {
                        'content': content,
                        'username': current_user.username,
                        'zodiac_sign': current_user.zodiac_sign,
                        'created_at': datetime.now(timezone.utc).isoformat()
                    }
                }, room=f'post_{post_id}')
                
                return {
                    'message': 'Comment added!',
                    'comment_id': created_comment.get('id', 'temp_id'),
                    'echo_count': post.get('echo_count', 0) + 1
                }, 201
                
            except Exception as e:
                logger.error(f"Comment error: {str(e)}")
                return {'error': 'Failed to add comment'}, 500

    class FeedResource(Resource):
        @token_required
        @cache.memoize(timeout=60)  # Cache per user
        def get(self, current_user):
            """Get personalized feed for current user"""
            try:
                cosmos_helper = get_cosmos_helper()
                
                # Get all posts
                all_posts = cosmos_helper.get_posts(limit=100)
                
                # Get users that current user follows
                following_list = cosmos_helper.get_following(current_user['id'])
                followed_usernames = [follow.get('followed_username', '') for follow in following_list]
                
                # Separate followed and trending posts
                followed_posts = []
                trending_posts = []
                
                for post in all_posts:
                    username = post.get('username')
                    if username in followed_usernames:
                        followed_posts.append(post)
                    elif username != current_user.username:  # Exclude own posts from trending
                        trending_posts.append(post)
                
                # Sort followed posts by creation date
                followed_posts.sort(key=lambda p: p.get('created_at', ''), reverse=True)
                
                # Sort trending posts by engagement
                trending_posts.sort(
                    key=lambda p: (p.get('spark_count', 0) + p.get('echo_count', 0)),
                    reverse=True
                )
                
                # Combine and deduplicate
                all_feed_posts = followed_posts[:50] + trending_posts[:20]
                post_ids = set()
                unique_posts = []
                
                for post in all_feed_posts:
                    post_id = post.get('id')
                    if post_id not in post_ids:
                        post_ids.add(post_id)
                        unique_posts.append(post)
                
                # Sort by engagement score (simplified)
                unique_posts.sort(
                    key=lambda p: (p.get('spark_count', 0) + p.get('echo_count', 0)),
                    reverse=True
                )
                
                return {
                    'feed': [{
                        'id': post.get('id'),
                        'content': post.get('content'),
                        'username': post.get('username'),
                        'zodiac_sign': post.get('zodiac_sign'),
                        'image_url': post.get('image_url'),
                        'spark_count': post.get('spark_count', 0),
                        'echo_count': post.get('echo_count', 0),
                        'comment_count': len(cosmos_helper.get_comments_for_post(post.get('id', ''))),
                        'created_at': post.get('created_at'),
                        'is_followed': post.get('username') in followed_usernames
                    } for post in unique_posts[:30]]
                }, 200
                
            except Exception as e:
                logger.error(f"Feed error: {str(e)}")
                return {'error': 'Failed to load feed'}, 500

    class CompatibilityResource(Resource):
        @token_required
        def get(self, current_user, target_user_id):
            """Get compatibility with another user - Temporarily disabled during Azure migration"""
            return {'error': 'Compatibility feature temporarily disabled during Azure migration. Please check back later.'}, 503
            
            return {
                'user1': current_user.zodiac_sign,
                'user2': target_user.zodiac_sign,
                'compatibility_score': compatibility_score,
                'analysis': self.get_compatibility_analysis(current_user.zodiac_sign, target_user.zodiac_sign, compatibility_score)
            }, 200
        
        def calculate_compatibility(self, sign1, sign2):
            """Simple compatibility calculation"""
            # Basic compatibility matrix
            compatible_pairs = [
                ('Aries', 'Leo'), ('Aries', 'Sagittarius'), ('Taurus', 'Virgo'), ('Taurus', 'Capricorn'),
                ('Gemini', 'Libra'), ('Gemini', 'Aquarius'), ('Cancer', 'Scorpio'), ('Cancer', 'Pisces'),
                ('Leo', 'Sagittarius'), ('Virgo', 'Capricorn'), ('Libra', 'Aquarius'), ('Scorpio', 'Pisces'),
                ('Sagittarius', 'Aries'), ('Capricorn', 'Taurus'), ('Aquarius', 'Gemini'), ('Pisces', 'Cancer')
            ]
            
            if (sign1, sign2) in compatible_pairs or (sign2, sign1) in compatible_pairs:
                return 85
            elif sign1 == sign2:
                return 75
            else:
                return 60
        
        def get_compatibility_analysis(self, sign1, sign2, score):
            """Get compatibility analysis"""
            if score >= 80:
                return f"🌟 Excellent cosmic connection! {sign1} and {sign2} have great potential!"
            elif score >= 70:
                return f"💫 Good harmony! {sign1} and {sign2} complement each other well."
            else:
                return f"⚡ Interesting dynamic! {sign1} and {sign2} can learn from their differences."

    class HoroscopeResource(Resource):
        @safe_rate_limit("60/hour")
        @cache.memoize(timeout=3600)  # Cache for 1 hour
        def get(self, zodiac_sign=None):
            """Get daily horoscope for zodiac sign"""
            if zodiac_sign and zodiac_sign not in ZODIAC_INFO:
                return {'error': 'Invalid zodiac sign'}, 400
            
            if zodiac_sign:
                horoscope = self.generate_daily_horoscope(zodiac_sign)
                return {'horoscope': horoscope}, 200
            else:
                # Return all horoscopes
                horoscopes = {}
                for sign in ZODIAC_INFO.keys():
                    horoscopes[sign] = self.generate_daily_horoscope(sign)
                return {'horoscopes': horoscopes}, 200
        
        def generate_daily_horoscope(self, zodiac_sign):
            """Generate daily horoscope for a specific sign"""
            import hashlib

            # Use date and sign to create consistent daily horoscope
            today = datetime.now(timezone.utc).date().isoformat()
            seed = hashlib.md5(f"{today}_{zodiac_sign}".encode()).hexdigest()
            random.seed(seed)
            
            love_advice = [
                "Venus aligns in your sector of relationships, bringing harmony.",
                "Unexpected encounters may lead to meaningful connections today.",
                "Focus on self-love and your relationships will flourish naturally."
            ][random.randint(0, 2)]
            
            career_advice = [
                "Mars energizes your professional sector - take bold actions.",
                "Collaboration with earth signs will bring stability to your projects.",
                "Your innovative ideas are recognized by superiors today."
            ][random.randint(0, 2)]
            
            health_advice = [
                "Balance your energy with grounding exercises today.",
                "Listen to your body's signals and rest when needed.",
                "Water activities will help cleanse and rejuvenate your spirit."
            ][random.randint(0, 2)]
            
            return {
                'zodiac_sign': zodiac_sign,
                'date': today,
                'love': love_advice,
                'career': career_advice,
                'health': health_advice,
                'lucky_number': random.randint(1, 9),
                'compatibility_sign': random.choice(list(ZODIAC_INFO.keys()))
            }

    class NotificationResource(Resource):
        @token_required
        def get(self, current_user):
            """Get user notifications - Temporarily disabled during Azure migration"""
            return {'error': 'Notifications feature temporarily disabled during Azure migration. Please check back later.'}, 503

    class NumerologyResource(Resource):
        @safe_rate_limit("60/hour")
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
        @safe_rate_limit("60/hour")
        @token_required
        def post(self, current_user):
            """Check numerology compatibility with another user - Temporarily disabled during Azure migration"""
            return {'error': 'Numerology compatibility feature temporarily disabled during Azure migration. Please check back later.'}, 503

    class NumerologyCalculatorResource(Resource):
        @safe_rate_limit("30/hour")
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
            """Update user tradition preference - Temporarily disabled during Azure migration"""
            return {'error': 'User settings update temporarily disabled during Azure migration. Please check back later.'}, 503

    class ArchetypeOracleResource(Resource):
        @safe_rate_limit("60/hour")
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

    class PublicOracleResource(Resource):
        @safe_rate_limit("30/hour")
        def post(self):
            """Generate public oracle reading"""
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

    class CosmicProfileResource(Resource):
        @safe_rate_limit("30/hour")
        def post(self):
            """Generate cosmic profile with UI augmentation"""
            try:
                schema = PublicOracleSchema()
                data = schema.load(request.get_json())

                # Parse birth date
                try:
                    birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
                except ValueError:
                    return {'error': 'Invalid date format. Use YYYY-MM-DD'}, 400

                cosmic_profile = CosmicArchetypeOracle.generate_cosmic_ui_profile(
                    data['full_name'], birth_date, data.get('tradition')
                )

                return {
                    'cosmic_profile': cosmic_profile,
                    'user_info': {
                        'full_name': data['full_name'],
                        'birth_date': data['birth_date'],
                        'tradition': data.get('tradition')
                    }
                }, 200
            except ValidationError as ve:
                logger.error(f"Validation error: {ve.messages}")
                return {'error': ve.messages}, 400
            except Exception as e:
                logger.error(f"Cosmic profile error: {e}")
                return {'error': 'Failed to generate cosmic profile'}, 500

    class BirthChartResource(Resource):
        @safe_rate_limit("30/hour")
        def post(self):
            """Calculate birth chart for given birth details"""
            try:
                data = request.get_json()
                birth_date_str = data.get('birth_date')  # YYYY-MM-DD
                birth_time = data.get('birth_time')  # HH:MM
                location = data.get('location')

                if not all([birth_date_str, birth_time, location]):
                    return {'error': 'birth_date, birth_time, and location are required'}, 400

                # Parse birth date
                try:
                    birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
                except ValueError:
                    return {'error': 'Invalid birth_date format. Use YYYY-MM-DD'}, 400

                # Calculate birth chart
                if not BIRTH_CHART_AVAILABLE:
                    return {'error': 'Birth chart calculation not available'}, 503
                chart_data = calculate_birth_chart(birth_date, birth_time, location)
                if not chart_data:
                    return {'error': 'Failed to calculate birth chart'}, 500

                return {'birth_chart': chart_data}, 200

            except Exception as e:
                logger.error(f"Birth chart calculation error: {e}")
                return {'error': 'Failed to calculate birth chart'}, 500

    class CollaborationResource(Resource):
        @token_required
        def post(self, current_user):
            """Update user position in 3D space"""
            try:
                data = request.get_json()
                if not data:
                    return {'error': 'No data provided'}, 400

                # Validate required fields
                x = data.get('x', 0)
                y = data.get('y', 0)
                z = data.get('z', 0)
                rotation = data.get('rotation', 0)

                # Update user position in Cosmos DB
                cosmos_helper = get_cosmos_helper()
                if not cosmos_helper:
                    return {'error': 'Database not available'}, 503

                result = cosmos_helper.update_user_position(str(current_user.id), {
                    'x': float(x),
                    'y': float(y),
                    'z': float(z),
                    'rotation': float(rotation)
                })

                if result['error']:
                    logger.error(f"Failed to update user position: {result['error']}")
                    return {'error': 'Failed to update position'}, 500

                # Broadcast position to other users via SocketIO
                socketio.emit('user_position_update', {
                    'user_id': current_user.id,
                    'username': current_user.username,
                    'position': [x, y, z],
                    'rotation': rotation
                }, room='cosmic_collaboration')

                return {'message': 'Position updated successfully'}, 200

            except Exception as e:
                logger.error(f"Collaboration position update error: {e}")
                return {'error': 'Failed to update position'}, 500

    class ConstellationResource(Resource):
        @token_required
        def post(self, current_user):
            """Create or update a constellation"""
            try:
                data = request.get_json()
                if not data:
                    return {'error': 'No data provided'}, 400

                # Validate required fields
                name = data.get('name')
                if not name:
                    return {'error': 'Constellation name is required'}, 400

                # Create constellation in Cosmos DB
                cosmos_helper = get_cosmos_helper()
                if not cosmos_helper:
                    return {'error': 'Database not available'}, 503

                constellation_data = {
                    'name': name,
                    'creator_id': current_user.id,
                    'stars': data.get('stars', []),
                    'connections': data.get('connections', []),
                    'color': data.get('color', '#ffffff'),
                    'is_public': data.get('is_public', True),
                    'creator_username': current_user.username
                }

                result = cosmos_helper.create_constellation(constellation_data)

                if result['error']:
                    logger.error(f"Failed to create constellation: {result['error']}")
                    return {'error': 'Failed to create constellation'}, 500

                constellation = result['data']

                # Broadcast constellation creation to all users
                socketio.emit('constellation_created', {
                    'constellation': {
                        'id': constellation['id'],
                        'name': constellation['name'],
                        'stars': constellation['stars'],
                        'connections': constellation['connections'],
                        'creator': current_user.username,
                        'color': constellation['color']
                    }
                }, room='cosmic_collaboration')

                return {
                    'message': 'Constellation created successfully',
                    'id': constellation['id']
                }, 201

            except Exception as e:
                logger.error(f"Constellation creation error: {e}")
                return {'error': 'Failed to create constellation'}, 500

        def get(self):
            """Get all public constellations"""
            try:
                cosmos_helper = get_cosmos_helper()
                if not cosmos_helper:
                    return {'error': 'Database not available'}, 503

                result = cosmos_helper.get_constellations(public_only=True)

                if result['error']:
                    logger.error(f"Failed to get constellations: {result['error']}")
                    return {'error': 'Failed to get constellations'}, 500

                return {'constellations': result['data']}, 200

            except Exception as e:
                logger.error(f"Get constellations error: {e}")
                return {'error': 'Failed to get constellations'}, 500

    class Health(Resource):
        def get(self):
            logger.info("Health check endpoint called")
            return {'status': 'ok'}, 200

    # Add a simple health check route for Azure App Service (expects /api/health, not /api/v1/health)
    @app.route('/api/health')
    def health_check():
        logger.info("Azure App Service health check endpoint called")
        try:
            # Test Redis connection (only if Redis is configured)
            redis_url = os.environ.get('REDIS_URL')
            if redis_url:
                try:
                    redis_client = get_redis()
                    if redis_client:
                        redis_client.ping()  # Test connection
                        redis_client.set('health_check', 'ok', ex=60)
                        test_value = redis_client.get('health_check')
                        if test_value == b'ok':  # Note: Redis returns bytes
                            logger.info("Redis connection test successful")
                        else:
                            logger.warning("Redis connection test failed - could not set/get value")
                    else:
                        logger.warning("Redis client not available for testing")
                except Exception as e:
                    logger.error(f"Redis connection test failed: {e}")
                    return {"status": "error", "message": f"Redis connection failed: {str(e)}"}, 503
            else:
                logger.warning("REDIS_URL not set - Redis functionality will be disabled")

            # Test Cosmos DB connection
            try:
                cosmos_helper = get_cosmos_helper()
                if cosmos_helper:
                    # Simple test query
                    test_posts = cosmos_helper.get_posts(limit=1)
                    logger.info("Cosmos DB connection test passed")
                else:
                    logger.warning("Cosmos DB not configured")
            except Exception as e:
                logger.error(f"Cosmos DB connection test failed: {e}")
                return {"status": "error", "message": f"Cosmos DB connection failed: {str(e)}"}, 503

            # Test Spotify connection (optional - don't fail health check if Spotify fails)
            try:
                import spotipy
                from spotipy.oauth2 import SpotifyClientCredentials
                if os.environ.get('SPOTIPY_CLIENT_ID') and os.environ.get('SPOTIPY_CLIENT_SECRET'):
                    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
                        client_id=os.environ.get('SPOTIPY_CLIENT_ID'),
                        client_secret=os.environ.get('SPOTIPY_CLIENT_SECRET')
                    ))
                    # Simple test - try to get a playlist (this should work with client credentials)
                    sp.playlist('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M')  # Today's Top Hits
                    logger.info("Spotify connection test passed")
            except Exception as e:
                logger.warning(f"Spotify connection test failed: {e}")

            return {"status": "ok"}, 200
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {"status": "error", "message": str(e)}, 503

    @app.route('/api/redis-test')
    def redis_test():
        """
        Dedicated endpoint to test Redis functionality.
        Returns the test value stored in Redis.
        """
        logger.info("Redis test endpoint called")
        try:
            redis_client = get_redis()
            if redis_client:
                redis_client.ping()  # Test connection
                # Set a test value
                test_key = "api_test_key"
                test_value = f"Redis test at {datetime.now(timezone.utc).isoformat()}"
                
                redis_client.set(test_key, test_value, ex=300)  # Expires in 5 minutes
                
                # Retrieve the value to verify
                retrieved_value = redis_client.get(test_key)
                
                if retrieved_value == test_value:
                    logger.info(f"Redis test successful: {retrieved_value}")
                    return {
                        "status": "ok", 
                        "message": "Redis connection successful",
                        "value": retrieved_value
                    }, 200
                else:
                    logger.error(f"Redis test failed: retrieved value '{retrieved_value}' does not match stored value '{test_value}'")
                    return {
                        "status": "error", 
                        "message": "Redis test failed: retrieved value does not match stored value"
                    }, 500
            else:
                logger.error("Redis test failed: not connected")
                return {
                    "status": "error", 
                    "message": "Redis not connected"
                }, 503
        except Exception as e:
            logger.error(f"Redis test failed with exception: {e}")
            return {
                "status": "error", 
                "message": f"Redis test exception: {str(e)}"
            }, 500

    # ==================== API ROUTES ====================

    api.add_resource(Health, '/api/v1/health')
    api.add_resource(Register, '/api/v1/register')
    api.add_resource(Login, '/api/v1/login')
    api.add_resource(PostResource, '/api/v1/posts')
    # TODO: Re-enable upload endpoint with Azure Blob Storage
    # api.add_resource(UploadResource, '/api/v1/upload')
    api.add_resource(FollowResource, '/api/v1/follow/<int:user_id>')
    api.add_resource(SparkResource, '/api/v1/spark/<int:post_id>')
    api.add_resource(CommentResource, '/api/v1/comment/<int:post_id>')
    api.add_resource(FeedResource, '/api/v1/feed')
    api.add_resource(CompatibilityResource, '/api/v1/compatibility/<int:target_user_id>')
    api.add_resource(HoroscopeResource, '/api/v1/horoscope', '/api/v1/horoscope/<zodiac_sign>')
    api.add_resource(NotificationResource, '/api/v1/notifications')
    api.add_resource(TrendDiscoveryResource, '/api/v1/trends')
    api.add_resource(ProfileResource, '/api/v1/profile/<int:user_id>')
    api.add_resource(ZodiacNumberResource, '/api/v1/zodiac-numbers')
    api.add_resource(NumerologyResource, '/api/v1/numerology')
    api.add_resource(NumerologyCompatibilityResource, '/api/v1/numerology/compatibility')
    api.add_resource(NumerologyCalculatorResource, '/api/v1/numerology/calculate')
    api.add_resource(UserSettingsResource, '/api/v1/user/settings')
    api.add_resource(ArchetypeOracleResource, '/api/v1/archetype-oracle')
    api.add_resource(PublicOracleResource, '/api/v1/archetype-oracle/calculate')
    api.add_resource(CollaborationResource, '/api/v1/collaboration/position')
    api.add_resource(ConstellationResource, '/api/v1/constellations')
    api.add_resource(CosmicProfileResource, '/api/v1/archetype-oracle/cosmic-profile')
    api.add_resource(BirthChartResource, '/api/v1/birth-chart')

    # Occult Oracle AI Endpoints
    class ArchetypeSynthesizerResource(Resource):
        @safe_rate_limit("30/hour")
        @token_required
        def get(self, current_user):
            """Get user's archetype synthesis"""
            try:
                if not current_user.full_name or not current_user.birth_date:
                    return {'error': 'Full name and birth date required for archetype synthesis'}, 400

                synthesis = ArchetypeSynthesizer.synthesize_archetypes(
                    current_user.full_name, current_user.birth_date, current_user.tradition
                )

                return {'archetype_synthesis': synthesis}, 200
            except Exception as e:
                logger.error(f"Archetype synthesis error: {e}")
                return {'error': 'Failed to generate archetype synthesis'}, 500

    class MentorPersonalityResource(Resource):
        @safe_rate_limit("100/hour")
        @token_required
        def post(self, current_user):
            """Generate mentor response based on user input"""
            try:
                data = request.get_json()
                user_input = data.get('user_input')
                mood_override = data.get('mood_override')

                if not user_input:
                    return {'error': 'user_input required'}, 400

                # Get cosmic profile
                cosmic_profile = CosmicArchetypeOracle.generate_cosmic_ui_profile(
                    current_user.full_name, current_user.birth_date, current_user.tradition
                )

                mentor_response = MentorPersonalityEngine.generate_mentor_response(
                    user_input, cosmic_profile, mood_override
                )

                return {'mentor_response': mentor_response}, 200
            except Exception as e:
                logger.error(f"Mentor response error: {e}")
                return {'error': 'Failed to generate mentor response'}, 500

    class ResonanceTrackerResource(Resource):
        @safe_rate_limit("60/hour")
        @token_required
        def get(self, current_user):
            """Get current resonance tracking data"""
            try:
                if not current_user.birth_date:
                    return {'error': 'Birth date required for resonance tracking'}, 400

                resonance_data = ResonanceTracker.calculate_emotional_frequency(current_user.birth_date)

                return {'resonance_tracking': resonance_data}, 200
            except Exception as e:
                logger.error(f"Resonance tracking error: {e}")
                return {'error': 'Failed to generate resonance tracking'}, 500

    class EmotionalOSResource(Resource):
        @safe_rate_limit("50/hour")
        @token_required
        def post(self, current_user):
            """Process emotional query through Emotional OS"""
            try:
                data = request.get_json()
                user_emotion = data.get('emotion')
                user_consent = data.get('consent', True)

                if not user_emotion:
                    return {'error': 'emotion required'}, 400

                if not current_user.full_name or not current_user.birth_date:
                    return {'error': 'Full name and birth date required for Emotional OS processing'}, 400

                emotional_response = EmotionalOS.process_emotional_query(
                    current_user.full_name, current_user.birth_date, user_emotion, user_consent
                )

                return {'emotional_processing': emotional_response}, 200
            except Exception as e:
                logger.error(f"Emotional OS error: {e}")
                return {'error': 'Failed to process emotional query'}, 500

    class OccultOracleAIResource(Resource):
        @safe_rate_limit("20/hour")
        @token_required
        def post(self, current_user):
            """Generate complete Occult Oracle AI experience"""
            try:
                data = request.get_json() or {}
                user_input = data.get('user_input')
                emotion = data.get('emotion')
                tradition_override = data.get('tradition')

                if not current_user.full_name or not current_user.birth_date:
                    return {'error': 'Full name and birth date required for Oracle AI'}, 400

                tradition = tradition_override or current_user.tradition

                if not occult_available:
                    return {'error': 'Occult Oracle AI not available'}, 503
                
                # Use basic oracle if advanced AI not available
                oracle_experience = {
                    "message": "Oracle AI temporarily unavailable",
                    "suggestion": "Please try basic oracle readings instead"
                }

                return {'oracle_experience': oracle_experience}, 200
            except Exception as e:
                logger.error(f"Occult Oracle AI error: {e}")
                return {'error': 'Failed to generate oracle experience'}, 500

    class PublicOccultOracleResource(Resource):
        @limiter.limit("10/hour")
        def post(self):
            """Generate public Occult Oracle AI experience"""
            try:
                schema = PublicOracleSchema()
                data = schema.load(request.get_json())

                # Parse birth date
                try:
                    birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
                except ValueError:
                    return {'error': 'Invalid date format. Use YYYY-MM-DD'}, 400

                if not occult_available:
                    return {'error': 'Occult Oracle AI not available'}, 503
                
                # Generate basic public experience 
                public_experience = {
                    'message': 'Advanced Oracle AI temporarily unavailable',
                    'basic_profile': {
                        'name': data['full_name'],
                        'birth_date': birth_date.isoformat(),
                        'tradition': data.get('tradition', 'universal')
                    }
                }

                return {'oracle_experience': public_experience}, 200
            except ValidationError as ve:
                logger.error(f"Validation error: {ve.messages}")
                return {'error': ve.messages}, 400
            except Exception as e:
                logger.error(f"Public Oracle AI error: {e}")
                return {'error': 'Failed to generate public oracle experience'}, 500

    # Add new resources
    api.add_resource(ArchetypeSynthesizerResource, '/api/v1/occult-oracle/archetype-synthesis')
    api.add_resource(MentorPersonalityResource, '/api/v1/occult-oracle/mentor')
    api.add_resource(ResonanceTrackerResource, '/api/v1/occult-oracle/resonance')
    api.add_resource(EmotionalOSResource, '/api/v1/occult-oracle/emotional-os')
    api.add_resource(OccultOracleAIResource, '/api/v1/occult-oracle/experience')
    api.add_resource(PublicOccultOracleResource, '/api/v1/occult-oracle/public-experience')

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

    @socketio.on('join_cosmic_collaboration')
    def handle_join_cosmic_collaboration(data):
        """Join the cosmic collaboration room for 3D interactions"""
        try:
            user_id = data.get('user_id')
            if not user_id:
                emit('error', {'message': 'User ID required for cosmic collaboration'})
                return

            join_room('cosmic_collaboration')
            logger.info(f'User {user_id} joined cosmic collaboration room')

            # Send current online users and constellations to the new user
            cosmos_helper = get_cosmos_helper()
            if cosmos_helper:
                # Get all user positions
                try:
                    positions_result = cosmos_helper.containers['user_positions'].read_all_items()
                    online_positions = list(positions_result)

                    # Get all constellations
                    constellations_result = cosmos_helper.get_constellations(public_only=True)
                    constellations = constellations_result['data'] if not constellations_result['error'] else []

                    emit('collaboration_state', {
                        'online_users': online_positions,
                        'constellations': constellations
                    })
                except Exception as e:
                    logger.error(f"Error sending collaboration state: {e}")

            emit('cosmic_collaboration_joined', {
                'message': 'Joined cosmic collaboration',
                'user_id': user_id
            })

        except Exception as e:
            logger.error(f"Error joining cosmic collaboration: {e}")
            emit('error', {'message': 'Failed to join cosmic collaboration'})

    # ==================== MAIN APPLICATION ====================

    # Example endpoint registration (small, safe to remove later)
    try:
        from example_endpoint import ExampleResource
        api.add_resource(ExampleResource, '/api/example')
    except Exception:
        logger.warning('Example endpoint registration failed; continuing')


    if __name__ == '__main__':
        with app.app_context():
            logger.info("Initializing application without SQLAlchemy database")
            
            trend_engine = TrendEngine()
            trend_engine.generate_trends()
            logger.info("Trend engine initialized with cosmic trends")
        
        # Register main API blueprint (contains enhanced tarot endpoints)
        if api_bp_available and api_bp:
            app.register_blueprint(api_bp)
            logger.info("Main API blueprint with enhanced tarot endpoints registered")

        # Register enhanced tarot system blueprint
        if enhanced_tarot_available and enhanced_tarot_bp:
            app.register_blueprint(enhanced_tarot_bp)
            logger.info("Enhanced tarot API endpoints registered")

        # Register enhanced Spotify integration blueprint
        if spotify_available and spotify_bp:
            app.register_blueprint(spotify_bp)
            logger.info("Enhanced Spotify API endpoints registered")

        # Register tarot interactions blueprint
        if 'tarot_bp' in globals():
            app.register_blueprint(tarot_bp, url_prefix='/api/v1/tarot')

        # Register feed blueprint
        if 'feed' in globals():
            app.register_blueprint(feed, url_prefix='/api/v1')

        # Register star points blueprint
        if 'star_points' in globals():
            app.register_blueprint(star_points, url_prefix='/api/v1')

        # Register notifications blueprint
        if 'notifications' in globals():
            app.register_blueprint(notifications, url_prefix='/api/v1')

        # Register group chat blueprint
        if 'group_chat_bp' in globals():
            app.register_blueprint(group_chat_bp, url_prefix='/api/v1')

        # Register analytics blueprint
        if analytics_available and analytics_bp:
            app.register_blueprint(analytics_bp, url_prefix='/api/v1')

    # ==================== AZURE APP SERVICE CONFIGURATION ====================

    def create_app():
        """Application factory for Azure App Service"""
        return app

    # For Azure App Service (WSGI)
    application = create_app()

    if __name__ == '__main__':
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
