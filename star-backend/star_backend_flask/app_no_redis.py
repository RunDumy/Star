# -*- coding: utf-8 -*-
# Project: Star App - The Cosmic Social Network
# Production version without Redis for Azure F1 tier
import json
import logging
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request, send_from_directory
from flask_caching import Cache
from flask_cors import CORS

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app with React frontend support
frontend_build_path = 'static'
app = Flask(__name__, static_folder=frontend_build_path, static_url_path='')

app.config.update({
    'SECRET_KEY': os.environ.get('SECRET_KEY', 'dev-secret-change-in-production'),
    'MAX_CONTENT_LENGTH': 50 * 1024 * 1024,  # 50MB max upload
    'JSON_SORT_KEYS': False
})

# Enhanced CORS for production
allowed_origins = [
    'http://localhost:3000',
    'https://star-app-backend.azurewebsites.net'
]
CORS(app, origins=allowed_origins, supports_credentials=True)

# Simple cache configuration (no Redis)
cache_config = {'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300}
cache = Cache(config=cache_config)
cache.init_app(app)
logger.info("Using SimpleCache (no Redis)")

# Module availability flags
oracle_available = False
cosmos_helper = None

# Core module imports with error handling
try:
    from cosmos_db import get_cosmos_helper
    cosmos_helper = get_cosmos_helper()
    logger.info("Azure Cosmos DB connection established")
except (ImportError, ValueError) as e:
    logger.warning(f"Cosmos DB not available: {e}")
    cosmos_helper = None

try:
    from oracle_engine import OccultOracleEngine
    oracle_available = True
    logger.info("Oracle engine loaded successfully")
except ImportError as e:
    logger.warning(f"Oracle engine not available: {e}")

# API routes
api_available = False
try:
    from api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api/v1')
    api_available = True
    logger.info("API routes loaded successfully")
except Exception as e:
    logger.warning(f"API routes not available: {e}")

# Health check endpoint
@app.route('/api/health')
def health_check():
    """Health check endpoint for Azure App Service"""
    logger.info("Health check endpoint called")
    
    status = {
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'database': cosmos_helper is not None,
        'oracle': oracle_available,
        'api': api_available,
        'cache': 'SimpleCache',
        'redis': False,  # Explicitly disabled
        'static_files': os.path.exists(os.path.join(app.static_folder, 'index.html')) if app.static_folder else False
    }
    
    # Test Cosmos DB connection
    if cosmos_helper:
        try:
            # Simple connection test
            test_query = "SELECT VALUE COUNT(1) FROM c"
            result = list(cosmos_helper.containers['users'].query_items(
                query=test_query, 
                enable_cross_partition_query=True
            )) if cosmos_helper.containers.get('users') else [0]
            status['database_test'] = 'success'
        except Exception as e:
            status['database_test'] = f'error: {str(e)}'
            logger.error(f"Database test failed: {e}")
    
    return jsonify(status)

# Serve React frontend
@app.route('/')
def serve_react():
    """Serve the React frontend"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files or fallback to React app"""
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Fallback to React app for client-side routing
        return send_from_directory(app.static_folder, 'index.html')

# API routes
@app.route('/api/v1/stream/token', methods=['POST'])
def get_stream_token():
    """Generate Agora RTC token for streaming"""
    try:
        data = request.get_json() or {}
        channel = data.get('channel', 'cosmic-channel')
        
        # Mock token for development (replace with actual Agora token generation)
        token = {
            'token': f'mock_token_{channel}',
            'channel': channel,
            'uid': data.get('uid', 0),
            'expiry': int((datetime.now().timestamp() + 3600))
        }
        
        return jsonify({'success': True, 'data': token})
    except Exception as e:
        logger.error(f"Error generating stream token: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration endpoint"""
    if request.method == 'GET':
        # Return registration form HTML
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Star App - Register</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
                input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
                button { width: 100%; padding: 12px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background: #005a8a; }
                .form-group { margin-bottom: 15px; }
                h1 { text-align: center; color: #333; }
            </style>
        </head>
        <body>
            <h1>🌟 Join the Star Platform</h1>
            <form method="POST" action="/register">
                <div class="form-group">
                    <input type="text" name="username" placeholder="Username" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="Email" required>
                </div>
                <div class="form-group">
                    <input type="password" name="password" placeholder="Password" required>
                </div>
                <div class="form-group">
                    <select name="zodiac_sign" required style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="">Select your zodiac sign</option>
                        <option value="Aries">Aries ♈</option>
                        <option value="Taurus">Taurus ♉</option>
                        <option value="Gemini">Gemini ♊</option>
                        <option value="Cancer">Cancer ♋</option>
                        <option value="Leo">Leo ♌</option>
                        <option value="Virgo">Virgo ♍</option>
                        <option value="Libra">Libra ♎</option>
                        <option value="Scorpio">Scorpio ♏</option>
                        <option value="Sagittarius">Sagittarius ♐</option>
                        <option value="Capricorn">Capricorn ♑</option>
                        <option value="Aquarius">Aquarius ♒</option>
                        <option value="Pisces">Pisces ♓</option>
                    </select>
                </div>
                <button type="submit">Create Account ✨</button>
            </form>
            <p style="text-align: center; margin-top: 20px;">
                <a href="/collaborative-cosmos">Enter the Cosmic Realm →</a>
            </p>
        </body>
        </html>
        '''
    else:
        # Handle POST request
        try:
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            zodiac_sign = request.form.get('zodiac_sign')
            
            if not all([username, email, password, zodiac_sign]):
                return jsonify({'success': False, 'error': 'All fields are required'}), 400
            
            # Create user (mock implementation)
            user_data = {
                'id': f'user_{username}',
                'username': username,
                'email': email,
                'zodiac_sign': zodiac_sign,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            if cosmos_helper:
                try:
                    cosmos_helper.create_user(user_data)
                    return jsonify({'success': True, 'message': 'Account created successfully!'})
                except Exception as e:
                    logger.error(f"Error creating user: {e}")
                    return jsonify({'success': False, 'error': 'Failed to create account'}), 500
            else:
                return jsonify({'success': False, 'error': 'Database not available'}), 503
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return jsonify({'success': False, 'error': str(e)}), 500

# Additional API endpoints
@app.route('/api/v1/posts', methods=['GET', 'POST'])
def posts():
    """Handle posts creation and retrieval"""
    try:
        if request.method == 'POST':
            data = request.get_json()
            if not data:
                return jsonify({'success': False, 'error': 'No data provided'}), 400
            
            # Create post
            post_data = {
                'id': f'post_{datetime.now().timestamp()}',
                'content': data.get('content', ''),
                'author': data.get('author', 'Anonymous'),
                'zodiac_sign': data.get('zodiac_sign', ''),
                'created_at': datetime.now(timezone.utc).isoformat(),
                'likes': 0,
                'comments': []
            }
            
            logger.info(f"Creating post: {post_data['id']}")
            return jsonify({'success': True, 'message': 'Post created', 'post': post_data})
        else:
            # Return posts feed (mock data)
            mock_posts = [
                {
                    'id': 'post_1',
                    'content': 'The cosmic energy is strong today! ✨',
                    'author': 'CosmicUser',
                    'zodiac_sign': 'Leo',
                    'created_at': datetime.now(timezone.utc).isoformat(),
                    'likes': 42,
                    'comments': ['Amazing energy!', 'Feeling it too!']
                }
            ]
            return jsonify({'success': True, 'posts': mock_posts})
    except Exception as e:
        logger.error(f"Posts error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/tarot/calculate-energy-flow', methods=['POST'])
def calculate_energy_flow():
    """Calculate tarot energy flow"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        cards = data.get('cards', [])
        
        # Mock energy calculation
        energy_flow = {
            'past_energy': 0.7,
            'present_energy': 0.8,
            'future_energy': 0.6,
            'overall_flow': 0.7,
            'cards_analyzed': len(cards),
            'recommendations': ['Focus on balance', 'Trust your intuition'],
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify({'success': True, 'energy_flow': energy_flow})
    except Exception as e:
        logger.error(f"Energy flow error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/v1/oracle/natal-chart', methods=['POST'])
def natal_chart():
    """Generate natal chart analysis"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No birth data provided'}), 400
            
        # Mock natal chart
        chart = {
            'sun_sign': 'Leo',
            'moon_sign': 'Pisces',
            'rising_sign': 'Scorpio',
            'planetary_positions': {'mercury': 'Gemini', 'venus': 'Cancer'},
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
        
        return jsonify({'success': True, 'natal_chart': chart})
    except Exception as e:
        logger.error(f"Natal chart error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/collaborative-cosmos')
def collaborative_cosmos():
    """Serve the collaborative cosmos page"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Star App - Collaborative Cosmos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { margin: 0; padding: 0; background: #000; color: #fff; font-family: Arial, sans-serif; overflow: hidden; }
            .cosmos-container { position: relative; width: 100vw; height: 100vh; }
            .zodiac-wheel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                          width: 300px; height: 300px; border: 2px solid #gold; border-radius: 50%; 
                          animation: rotate 20s linear infinite; }
            .zodiac-sign { position: absolute; width: 40px; height: 40px; text-align: center; 
                          line-height: 40px; border-radius: 50%; background: rgba(255,215,0,0.3); }
            .streaming-panel { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); 
                             padding: 20px; border-radius: 10px; width: 250px; }
            .stars { position: absolute; width: 100%; height: 100%; z-index: -1; }
            .star { position: absolute; width: 2px; height: 2px; background: #fff; border-radius: 50%; 
                   animation: twinkle 2s infinite; }
            @keyframes rotate { from { transform: translate(-50%, -50%) rotate(0deg); } 
                               to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            .stream-btn { background: #007cba; color: white; padding: 10px 20px; border: none; 
                         border-radius: 5px; cursor: pointer; margin: 5px 0; width: 100%; }
            .stream-btn:hover { background: #005a8a; }
        </style>
    </head>
    <body>
        <div class="cosmos-container">
            <div class="stars" id="stars"></div>
            <div class="zodiac-wheel">
                <div class="zodiac-sign" style="top: 0; left: 50%; transform: translateX(-50%);">♈</div>
                <div class="zodiac-sign" style="top: 15%; right: 15%;">♉</div>
                <div class="zodiac-sign" style="top: 50%; right: 0; transform: translateY(-50%);">♊</div>
                <div class="zodiac-sign" style="bottom: 15%; right: 15%;">♋</div>
                <div class="zodiac-sign" style="bottom: 0; left: 50%; transform: translateX(-50%);">♌</div>
                <div class="zodiac-sign" style="bottom: 15%; left: 15%;">♍</div>
                <div class="zodiac-sign" style="top: 50%; left: 0; transform: translateY(-50%);">♎</div>
                <div class="zodiac-sign" style="top: 15%; left: 15%;">♏</div>
                <div class="zodiac-sign" style="top: 8%; left: 38%;">♐</div>
                <div class="zodiac-sign" style="top: 8%; right: 38%;">♑</div>
                <div class="zodiac-sign" style="bottom: 8%; right: 38%;">♒</div>
                <div class="zodiac-sign" style="bottom: 8%; left: 38%;">♓</div>
            </div>
            <div class="streaming-panel">
                <h3>🌟 Live Cosmic Stream</h3>
                <p>Join the celestial conversation</p>
                <button class="stream-btn" onclick="startStream()">Start Broadcasting</button>
                <button class="stream-btn" onclick="joinStream()">Join Stream</button>
                <div id="stream-status">Ready to connect...</div>
            </div>
        </div>
        
        <script>
            // Create animated stars
            function createStars() {
                const starsContainer = document.getElementById('stars');
                for (let i = 0; i < 100; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.style.left = Math.random() * 100 + '%';
                    star.style.top = Math.random() * 100 + '%';
                    star.style.animationDelay = Math.random() * 2 + 's';
                    starsContainer.appendChild(star);
                }
            }
            
            function startStream() {
                document.getElementById('stream-status').textContent = 'Starting your cosmic broadcast...';
                // Mock streaming start
                setTimeout(() => {
                    document.getElementById('stream-status').innerHTML = 
                        '🔴 LIVE<br>Viewers: ' + Math.floor(Math.random() * 50 + 1);
                }, 1000);
            }
            
            function joinStream() {
                document.getElementById('stream-status').textContent = 'Connecting to the cosmos...';
                setTimeout(() => {
                    document.getElementById('stream-status').innerHTML = 
                        '✨ Connected<br>Channel: Cosmic Harmony';
                }, 1000);
            }
            
            createStars();
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info("=" * 50)
    logger.info("🌟 STAR Backend Server Starting (No Redis)")
    logger.info("=" * 50)
    logger.info(f"Port: {port}")
    logger.info(f"Debug: {debug_mode}")
    logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'production')}")
    logger.info(f"Frontend: {app.static_folder is not None}")
    logger.info(f"Oracle Engine: {oracle_available}")
    logger.info(f"API Routes: {api_available}")
    logger.info(f"Cosmos DB: {cosmos_helper is not None}")
    logger.info("Cache: SimpleCache (no Redis)")
    logger.info("=" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)