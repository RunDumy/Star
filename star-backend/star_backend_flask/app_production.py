# -*- coding: utf-8 -*-
"""
STAR Backend - Production Ready
Cosmic Social Network with Oracle Readings, Social Feed & PWA Support
"""
import json
import logging
import os
import random
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_caching import Cache
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Load environment variables
load_dotenv()

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate critical environment variables
required_env_vars = ['SECRET_KEY']
for var in required_env_vars:
    if not os.environ.get(var):
        logger.warning(f"Missing environment variable: {var}")

# React frontend build path
frontend_build_path = os.path.join(os.path.dirname(__file__), '../../../star-frontend/out')
static_folder = frontend_build_path if os.path.exists(frontend_build_path) else None

# Initialize Flask app with React frontend support
app = Flask(__name__, 
    static_folder=static_folder, 
    static_url_path='')

app.config.update({
    'SECRET_KEY': os.environ.get('SECRET_KEY', 'dev-secret-change-in-production'),
    'MAX_CONTENT_LENGTH': 50 * 1024 * 1024,  # 50MB max upload
    'JSON_SORT_KEYS': False
})

# Enhanced CORS for production
allowed_origins = [
    'http://localhost:3000',
    'https://star-backend.azurewebsites.net'
]
CORS(app, origins=allowed_origins, supports_credentials=True)

# Cache configuration
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
    logger.info("Using SimpleCache")

cache = Cache(config=cache_config)
cache.init_app(app)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Module availability flags
oracle_available = False
cosmos_helper = None

# Core module imports with error handling
try:
    from cosmos_db import get_cosmos_helper
    cosmos_helper = get_cosmos_helper()
    logger.info("Azure Cosmos DB connection established")
except ImportError as e:
    logger.warning(f"Cosmos DB not available: {e}")

try:
    from oracle_engine import OccultOracleEngine
    oracle_available = True
    logger.info("Oracle engine loaded successfully")
except ImportError as e:
    logger.warning(f"Oracle engine not available: {e}")

# Import zodiac systems for Galactic Tone calculations
try:
    from tonalpohualli import (AZTEC_ZODIAC, AZTEC_ZODIAC_ACTIONS,
                               GALACTIC_TONES,
                               calculate_aztec_day_sign_and_tone)
    tonalpohualli_available = True
    logger.info("Tonalpohualli system loaded")
except ImportError as e:
    logger.warning(f"Tonalpohualli system not available: {e}")
    tonalpohualli_available = False
    GALACTIC_TONES = {}
    AZTEC_ZODIAC = {}
    AZTEC_ZODIAC_ACTIONS = {}

# ===============================
# FRONTEND SERVING ROUTES
# ===============================

@app.route('/')
def serve_react_app():
    """Serve React app's index.html"""
    if app.static_folder:
        return send_from_directory(app.static_folder, 'index.html')
    return jsonify({
        "name": "STAR Backend API",
        "version": "1.0.0",
        "description": "Cosmic Social Network API",
        "endpoints": {
            "health": "/api/health",
            "oracle": "/api/oracle/*",
            "posts": "/api/posts/*",
            "pwa": "/manifest.json"
        }
    })

@app.route('/<path:path>')
def serve_react_assets(path):
    """Serve React app static assets"""
    if app.static_folder:
        try:
            return send_from_directory(app.static_folder, path)
        except FileNotFoundError:
            return send_from_directory(app.static_folder, 'index.html')
    return jsonify({"error": "Frontend not available"}), 404

# ===============================
# API HEALTH & STATUS
# ===============================

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
            "tonalpohualli": tonalpohualli_available,
            "cache": redis_url is not None
        },
        "environment": os.environ.get('FLASK_ENV', 'production'),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    })

@app.route('/api/status')
@limiter.limit("10 per minute")
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

# ===============================
# ORACLE API ENDPOINTS
# ===============================

@app.route('/api/oracle/natal-chart', methods=['POST'])
@limiter.limit("5 per minute")
def get_natal_chart():
    """Calculate natal chart from birth data"""
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        birth_time = data.get('birth_time')
        location = data.get('location')

        if not all([birth_date, birth_time, location]):
            return jsonify({
                "error": "Missing required fields",
                "required": ["birth_date", "birth_time", "location"]
            }), 400

        oracle = OccultOracleEngine()
        chart = oracle.calculate_natal_chart(birth_date, birth_time, location)

        return jsonify({
            "success": True,
            "chart": chart,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error calculating natal chart: {e}")
        return jsonify({"error": "Failed to calculate natal chart"}), 500

@app.route('/api/oracle/tarot', methods=['POST'])
@limiter.limit("10 per minute") 
def get_tarot_reading():
    """Get tarot card reading"""
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json() or {}
        question = data.get('question', 'What guidance do you have for me?')

        oracle = OccultOracleEngine()
        reading = oracle.draw_tarot_cards(question)

        return jsonify({
            "success": True,
            "reading": reading,
            "question": question,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting tarot reading: {e}")
        return jsonify({"error": "Failed to get tarot reading"}), 500

@app.route('/api/oracle/numerology', methods=['POST'])
@limiter.limit("10 per minute")
def get_numerology():
    """Calculate numerology from birth date and name"""
    if not oracle_available:
        return jsonify({"error": "Oracle engine not available"}), 503

    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        name = data.get('name', '')

        if not birth_date:
            return jsonify({"error": "Missing required field: birth_date"}), 400

        oracle = OccultOracleEngine()
        numerology = oracle.calculate_numerology(birth_date, name)

        return jsonify({
            "success": True,
            "numerology": numerology,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error calculating numerology: {e}")
        return jsonify({"error": "Failed to calculate numerology"}), 500

@app.route('/api/oracle/galactic-tone', methods=['POST'])
@limiter.limit("10 per minute")
def get_galactic_tone():
    """Calculate Galactic Tone and Aztec Day Sign from birth date"""
    if not tonalpohualli_available:
        return jsonify({"error": "Tonalpohualli system not available"}), 503

    try:
        data = request.get_json()
        birth_date = data.get('birth_date')

        if not birth_date:
            return jsonify({"error": "Missing required field: birth_date"}), 400

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
            "tonalpohualli_position": result['tonalpohualli_position'],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error calculating galactic tone: {e}")
        return jsonify({"error": "Failed to calculate galactic tone"}), 500

@app.route('/api/oracle/daily-tonalpohualli', methods=['GET'])
@cache.cached(timeout=86400)  # Cache for 24 hours
def get_daily_tonalpohualli():
    """Get today's Tonalpohualli energy"""
    if not tonalpohualli_available:
        return jsonify({"error": "Tonalpohualli system not available"}), 503

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
            "tone_info": result['tone_info'],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting daily Tonalpohualli: {e}")
        return jsonify({"error": "Failed to get daily energy"}), 500

# ===============================
# SOCIAL FEED API ENDPOINTS
# ===============================

@app.route('/api/posts', methods=['GET'])
@cache.cached(timeout=30)
@limiter.limit("100 per minute")
def get_posts():
    """Get social feed posts with pagination and filtering"""
    try:
        # Query parameters
        page = request.args.get('page', 1, type=int)
        limit = min(request.args.get('limit', 20, type=int), 50)
        post_type = request.args.get('type')
        user_id = request.args.get('user_id')
        
        if not cosmos_helper:
            return jsonify({"error": "Database not available"}), 503
            
        # Build query
        query = "SELECT * FROM c WHERE c.type = 'post'"
        parameters = []
        
        if post_type:
            query += " AND c.post_type = @post_type"
            parameters.append({"name": "@post_type", "value": post_type})
            
        if user_id:
            query += " AND c.user_id = @user_id"
            parameters.append({"name": "@user_id", "value": user_id})
            
        query += " ORDER BY c.created_at DESC"
        offset = (page - 1) * limit
        query += f" OFFSET {offset} LIMIT {limit}"
        
        posts = list(cosmos_helper.query_items(query, parameters))
        
        # Get total count
        count_query = "SELECT VALUE COUNT(1) FROM c WHERE c.type = 'post'"
        if post_type:
            count_query = count_query.replace("WHERE c.type = 'post'", 
                                            "WHERE c.type = 'post' AND c.post_type = @post_type")
        
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
@limiter.limit("10 per minute")
def create_post():
    """Create a new social post"""
    try:
        if not cosmos_helper:
            return jsonify({"error": "Database not available"}), 503
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['content', 'user_id', 'username']
        if not all(field in data for field in required_fields):
            return jsonify({
                "error": "Missing required fields", 
                "required": required_fields
            }), 400
            
        # Create post object
        timestamp = datetime.now(timezone.utc)
        post = {
            "id": f"post_{int(timestamp.timestamp() * 1000)}",
            "type": "post",
            "post_type": data.get('post_type', 'social'),
            "content": data['content'][:500],  # Limit content
            "user_id": data['user_id'],
            "username": data['username'],
            "avatar_url": data.get('avatar_url', ''),
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "liked_by": [],
            "oracle_data": data.get('oracle_data', {}),
            "cosmic_signature": data.get('cosmic_signature', ''),
            "created_at": timestamp.isoformat(),
            "updated_at": timestamp.isoformat()
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

@app.route('/api/posts/<post_id>/like', methods=['POST'])
@limiter.limit("20 per minute")
def like_post(post_id):
    """Like/unlike a post"""
    try:
        if not cosmos_helper:
            return jsonify({"error": "Database not available"}), 503
            
        data = request.get_json() or {}
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
        post.update({
            'likes': likes,
            'liked_by': liked_by,
            'updated_at': datetime.now(timezone.utc).isoformat()
        })
        
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

# ===============================
# PWA SUPPORT ENDPOINTS
# ===============================

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
        "orientation": "portrait-primary",
        "scope": "/",
        "lang": "en-US",
        "icons": [
            {
                "src": "/icons/icon-192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable"
            },
            {
                "src": "/icons/icon-512.png", 
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any maskable"
            }
        ],
        "categories": ["social", "entertainment", "lifestyle", "spirituality"],
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
        ],
        "shortcuts": [
            {
                "name": "Oracle Reading",
                "short_name": "Oracle",
                "description": "Get a cosmic oracle reading",
                "url": "/oracle",
                "icons": [{"src": "/icons/oracle-96.png", "sizes": "96x96"}]
            },
            {
                "name": "Social Feed",
                "short_name": "Feed",
                "description": "View the cosmic social feed",
                "url": "/feed",
                "icons": [{"src": "/icons/feed-96.png", "sizes": "96x96"}]
            }
        ]
    }
    
    response = jsonify(manifest)
    response.headers['Content-Type'] = 'application/manifest+json'
    response.headers['Cache-Control'] = 'max-age=86400'  # Cache for 24 hours
    return response

@app.route('/sw.js')
def serve_service_worker():
    """Serve service worker for PWA"""
    if app.static_folder:
        try:
            return send_from_directory(app.static_folder, 'sw.js')
        except FileNotFoundError:
            pass
    
    # Fallback service worker
    sw_content = '''
const CACHE_NAME = 'star-pwa-v1';
const STATIC_CACHE = 'star-static-v1';
const API_CACHE = 'star-api-v1';

const STATIC_FILES = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/offline.html'
];

const API_ENDPOINTS = ['/api/health', '/api/oracle/daily-tonalpohualli'];

// Install event
self.addEventListener('install', function(event) {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES)),
            caches.open(API_CACHE)
        ]).then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event with network-first strategy
self.addEventListener('fetch', function(event) {
    const url = new URL(event.request.url);
    
    // API requests - network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }
    
    // Static files - cache first, network fallback
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        const responseClone = fetchResponse.clone();
                        caches.open(STATIC_CACHE).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                        return fetchResponse;
                    });
            })
            .catch(() => {
                if (event.request.destination === 'document') {
                    return caches.match('/offline.html');
                }
            })
    );
});

// Background sync for offline posts
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Implement background sync logic for offline functionality
    return Promise.resolve();
}
'''.strip()
    
    response = app.response_class(
        response=sw_content,
        status=200,
        mimetype='application/javascript'
    )
    response.headers['Cache-Control'] = 'max-age=0, no-cache, no-store, must-revalidate'
    return response

@app.route('/api/notifications/subscribe', methods=['POST'])
@limiter.limit("5 per minute")
def subscribe_notifications():
    """Subscribe to push notifications"""
    try:
        data = request.get_json()
        subscription = data.get('subscription')
        user_id = data.get('user_id')
        
        if not subscription or not user_id:
            return jsonify({
                "error": "Missing data",
                "required": ["subscription", "user_id"]
            }), 400
            
        if cosmos_helper:
            sub_data = {
                "id": f"sub_{user_id}_{int(datetime.now().timestamp())}",
                "type": "push_subscription", 
                "user_id": user_id,
                "subscription": subscription,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "active": True
            }
            cosmos_helper.upsert_item(sub_data)
            
        return jsonify({
            "success": True,
            "message": "Subscription saved successfully"
        })
        
    except Exception as e:
        logger.error(f"Error subscribing to notifications: {e}")
        return jsonify({"error": "Failed to subscribe"}), 500

# ===============================
# ERROR HANDLERS
# ===============================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    if request.path.startswith('/api/'):
        return jsonify({"error": "API endpoint not found"}), 404
    
    # Serve React app for frontend routes
    if app.static_folder:
        return send_from_directory(app.static_folder, 'index.html')
    
    return jsonify({"error": "Page not found"}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({"error": "Method not allowed"}), 405

# ===============================
# USER REGISTRATION ENDPOINT
# ===============================

@app.route('/api/v1/register', methods=['POST'])
@limiter.limit("5 per minute")
def register_user():
    """Register new user with cosmic profile"""
    try:
        if not cosmos_helper:
            return jsonify({"error": "Database not available"}), 503
            
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'birthDate', 'zodiacSystem']
        if not all(field in data for field in required_fields):
            return jsonify({
                "error": "Missing required fields", 
                "required": required_fields
            }), 400
        
        # Calculate cosmic signature
        birth_date = datetime.strptime(data['birthDate'], '%Y-%m-%d')
        day_number = (birth_date - datetime(1900, 1, 1)).days + 693595
        
        tone = (day_number % 13) + 1
        day_signs = ['Crocodile', 'Wind', 'House', 'Lizard', 'Serpent', 'Death', 'Deer', 'Rabbit', 
                    'Water', 'Dog', 'Monkey', 'Grass', 'Reed', 'Jaguar', 'Eagle', 'Vulture', 
                    'Earthquake', 'Flint', 'Rain', 'Flower']
        day_sign = day_signs[day_number % 20]
        
        # Create profile
        timestamp = datetime.now(timezone.utc)
        profile = {
            'id': data['username'],
            'username': data['username'],
            'email': data['email'],
            'birth_date': data['birthDate'],
            'tone': tone,
            'day_sign': day_sign,
            'signature': f"{tone}-{day_sign}",
            'zodiac_system': data['zodiacSystem'],
            'created_at': timestamp.isoformat(),
            'updated_at': timestamp.isoformat(),
            'is_active': True,
            'type': 'user'
        }
        
        # Check if user already exists
        query = "SELECT * FROM c WHERE c.id = @username OR c.email = @email"
        parameters = [
            {"name": "@username", "value": data['username']},
            {"name": "@email", "value": data['email']}
        ]
        existing_users = list(cosmos_helper.query_items(query, parameters))
        
        if existing_users:
            return jsonify({"error": "User with this username or email already exists"}), 409
        
        # Save to database
        cosmos_helper.create_item(profile)
        
        logger.info(f"New user registered: {profile['username']} ({profile['signature']})")
        
        return jsonify({
            "success": True, 
            "profile": profile,
            "message": f"Welcome to STAR! Your cosmic signature is {profile['signature']}"
        }), 201
        
    except ValueError as e:
        return jsonify({"error": f"Invalid date format: {e}"}), 400
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        return jsonify({"error": "Failed to register user"}), 500

@app.errorhandler(429) 
def rate_limit_exceeded(error):
    """Handle rate limit errors"""
    return jsonify({"error": "Rate limit exceeded"}), 429

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({"error": "Internal server error"}), 500

# ===============================
# APPLICATION FACTORY & STARTUP
# ===============================

def create_app():
    """Application factory for WSGI deployment"""
    logger.info("STAR Backend initialized successfully")
    logger.info(f"Modules: Oracle={oracle_available}, Cosmos={cosmos_helper is not None}")
    return app

# For Azure App Service (WSGI)
application = create_app()

if __name__ == '__main__':
    # Development server
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info("=" * 50)
    logger.info("🌟 STAR Backend Server Starting")
    logger.info("=" * 50)
    logger.info(f"Port: {port}")
    logger.info(f"Debug: {debug_mode}")
    logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'production')}")
    logger.info(f"Frontend: {app.static_folder is not None}")
    logger.info(f"Oracle Engine: {oracle_available}")
    logger.info(f"Cosmos DB: {cosmos_helper is not None}")
    logger.info(f"Tonalpohualli: {tonalpohualli_available}")
    logger.info(f"Cache: {'Redis' if redis_url else 'Memory'}")
    logger.info("=" * 50)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode,
        threaded=True
    )