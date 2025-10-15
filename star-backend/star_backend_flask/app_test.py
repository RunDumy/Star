# -*- coding: utf-8 -*-
# Test version of Star App backend without Cosmos DB requirement
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

# Initialize Flask app
app = Flask(__name__, static_folder='static', static_url_path='')

app.config.update({
    'SECRET_KEY': os.environ.get('SECRET_KEY', 'dev-secret-change-in-production'),
    'MAX_CONTENT_LENGTH': 50 * 1024 * 1024,  # 50MB max upload
    'JSON_SORT_KEYS': False
})

# Enhanced CORS for production
allowed_origins = [
    'http://localhost:3000',
    'https://star-frontend.vercel.app',
    'https://*.vercel.app',
    'https://star-app-backend.azurewebsites.net'
]
CORS(app, origins=allowed_origins, supports_credentials=True)

# Simple cache configuration (no Redis)
cache_config = {'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300}
cache = Cache(config=cache_config)
cache.init_app(app)
logger.info("Using SimpleCache (no Redis)")

# Health check endpoint
@app.route('/api/health')
def health_check():
    """Health check endpoint for Azure App Service"""
    logger.info("Health check endpoint called")
    
    status = {
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'database': False,  # Set to False for testing without Cosmos DB
        'oracle': False,
        'cache': 'SimpleCache',
        'redis': False,  # Explicitly disabled
        'static_files': os.path.exists(os.path.join(app.static_folder, 'index.html')) if app.static_folder else False
    }
    
    return jsonify(status)

# Serve React frontend
@app.route('/')
def serve_react():
    """Serve the React frontend"""
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    else:
        return '''
        <!DOCTYPE html>
        <html>
        <head><title>Star App</title></head>
        <body><h1>🌟 Star App Backend is Running!</h1><p><a href="/api/health">Health Check</a></p></body>
        </html>
        '''

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files or fallback to React app"""
    if app.static_folder and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Fallback to React app for client-side routing
        return serve_react()

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
                body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; background: #000; color: #fff; }
                input, select { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #444; border-radius: 4px; background: #333; color: #fff; }
                button { width: 100%; padding: 12px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background: #005a8a; }
                .form-group { margin-bottom: 15px; }
                h1 { text-align: center; color: #007cba; }
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
                    <select name="zodiac_sign" required>
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
                <a href="/collaborative-cosmos" style="color: #007cba;">Enter the Cosmic Realm →</a>
            </p>
        </body>
        </html>
        '''
    else:
        # Handle POST request (mock implementation)
        try:
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            zodiac_sign = request.form.get('zodiac_sign')
            
            if not all([username, email, password, zodiac_sign]):
                return jsonify({'success': False, 'error': 'All fields are required'}), 400
            
            # Mock success response (database not available in test mode)
            return jsonify({'success': True, 'message': f'Account created for {username}! (Test Mode - Database not connected)'})
                
        except Exception as e:
            logger.error(f"Registration error: {e}")
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
            body { margin: 0; padding: 0; background: linear-gradient(45deg, #000428, #004e92); color: #fff; font-family: Arial, sans-serif; overflow: hidden; }
            .cosmos-container { position: relative; width: 100vw; height: 100vh; }
            .zodiac-wheel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                          width: 300px; height: 300px; border: 2px solid #ffd700; border-radius: 50%; 
                          animation: rotate 20s linear infinite; box-shadow: 0 0 20px rgba(255,215,0,0.5); }
            .zodiac-sign { position: absolute; width: 40px; height: 40px; text-align: center; 
                          line-height: 40px; border-radius: 50%; background: rgba(255,215,0,0.3);
                          font-size: 20px; transition: all 0.3s ease; }
            .zodiac-sign:hover { background: rgba(255,215,0,0.8); transform: scale(1.2); }
            .streaming-panel { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); 
                             padding: 20px; border-radius: 10px; width: 250px; backdrop-filter: blur(10px); }
            .stars { position: absolute; width: 100%; height: 100%; z-index: -1; }
            .star { position: absolute; width: 2px; height: 2px; background: #fff; border-radius: 50%; 
                   animation: twinkle 2s infinite; }
            .constellation { position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.8);
                           padding: 15px; border-radius: 10px; backdrop-filter: blur(10px); }
            @keyframes rotate { from { transform: translate(-50%, -50%) rotate(0deg); } 
                               to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            .stream-btn { background: linear-gradient(45deg, #007cba, #00a8ff); color: white; padding: 10px 20px; 
                         border: none; border-radius: 5px; cursor: pointer; margin: 5px 0; width: 100%; 
                         transition: all 0.3s ease; }
            .stream-btn:hover { background: linear-gradient(45deg, #005a8a, #0078cc); transform: translateY(-2px); }
            .pulse { animation: pulse 2s infinite; }
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 124, 186, 0.7); }
                              70% { box-shadow: 0 0 0 10px rgba(0, 124, 186, 0); }
                              100% { box-shadow: 0 0 0 0 rgba(0, 124, 186, 0); } }
        </style>
    </head>
    <body>
        <div class="cosmos-container">
            <div class="stars" id="stars"></div>
            
            <div class="constellation">
                <h4>🌌 Multi-Zodiac System</h4>
                <p>76+ Signs | 13 Galactic Tones</p>
                <div id="constellation-info">Ready to explore...</div>
            </div>
            
            <div class="zodiac-wheel pulse">
                <div class="zodiac-sign" style="top: 0; left: 50%; transform: translateX(-50%);" title="Aries">♈</div>
                <div class="zodiac-sign" style="top: 15%; right: 15%;" title="Taurus">♉</div>
                <div class="zodiac-sign" style="top: 50%; right: 0; transform: translateY(-50%);" title="Gemini">♊</div>
                <div class="zodiac-sign" style="bottom: 15%; right: 15%;" title="Cancer">♋</div>
                <div class="zodiac-sign" style="bottom: 0; left: 50%; transform: translateX(-50%);" title="Leo">♌</div>
                <div class="zodiac-sign" style="bottom: 15%; left: 15%;" title="Virgo">♍</div>
                <div class="zodiac-sign" style="top: 50%; left: 0; transform: translateY(-50%);" title="Libra">♎</div>
                <div class="zodiac-sign" style="top: 15%; left: 15%;" title="Scorpio">♏</div>
                <div class="zodiac-sign" style="top: 8%; left: 38%;" title="Sagittarius">♐</div>
                <div class="zodiac-sign" style="top: 8%; right: 38%;" title="Capricorn">♑</div>
                <div class="zodiac-sign" style="bottom: 8%; right: 38%;" title="Aquarius">♒</div>
                <div class="zodiac-sign" style="bottom: 8%; left: 38%;" title="Pisces">♓</div>
            </div>
            
            <div class="streaming-panel">
                <h3>🌟 Live Cosmic Stream</h3>
                <p>AgoraRTC Integration Active</p>
                <button class="stream-btn" onclick="startStream()">🔴 Start Broadcasting</button>
                <button class="stream-btn" onclick="joinStream()">✨ Join Stream</button>
                <button class="stream-btn" onclick="testAPI()">🧪 Test API</button>
                <div id="stream-status" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.5); border-radius: 5px;">
                    Ready to connect...
                </div>
            </div>
        </div>
        
        <script>
            // Create animated stars
            function createStars() {
                const starsContainer = document.getElementById('stars');
                for (let i = 0; i < 150; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.style.left = Math.random() * 100 + '%';
                    star.style.top = Math.random() * 100 + '%';
                    star.style.animationDelay = Math.random() * 2 + 's';
                    starsContainer.appendChild(star);
                }
            }
            
            // Add constellation info updates
            const constellationInfo = document.getElementById('constellation-info');
            const constellations = [
                'Mapping galactic coordinates...',
                'Detecting cosmic energy flows...',
                'Synchronizing with celestial bodies...',
                'Analyzing astrological patterns...',
                'Processing multi-dimensional data...'
            ];
            let constellationIndex = 0;
            
            setInterval(() => {
                constellationInfo.textContent = constellations[constellationIndex];
                constellationIndex = (constellationIndex + 1) % constellations.length;
            }, 3000);
            
            function startStream() {
                document.getElementById('stream-status').innerHTML = 
                    '<div style="color: #ff4444;">🔴 STARTING BROADCAST...</div>';
                setTimeout(() => {
                    document.getElementById('stream-status').innerHTML = 
                        '<div style="color: #44ff44;">🔴 LIVE<br>Viewers: ' + Math.floor(Math.random() * 50 + 1) + 
                        '<br>Channel: Cosmic-' + Math.floor(Math.random() * 1000) + '</div>';
                }, 2000);
            }
            
            function joinStream() {
                document.getElementById('stream-status').innerHTML = 
                    '<div style="color: #ffaa44;">✨ CONNECTING...</div>';
                setTimeout(() => {
                    document.getElementById('stream-status').innerHTML = 
                        '<div style="color: #44ffaa;">✨ Connected to Stream<br>Channel: Cosmic Harmony<br>Users: ' + 
                        Math.floor(Math.random() * 20 + 5) + ' online</div>';
                }, 1500);
            }
            
            function testAPI() {
                document.getElementById('stream-status').innerHTML = 
                    '<div style="color: #aaaaff;">🧪 Testing API...</div>';
                
                fetch('/api/v1/stream/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channel: 'test-channel', uid: Math.floor(Math.random() * 10000) })
                })
                .then(response => response.json())
                .then(data => {
                    document.getElementById('stream-status').innerHTML = 
                        '<div style="color: #44ff44;">🧪 API Test Success<br>' +
                        'Token: ' + data.data.token.substring(0, 20) + '...<br>' +
                        'Channel: ' + data.data.channel + '</div>';
                })
                .catch(error => {
                    document.getElementById('stream-status').innerHTML = 
                        '<div style="color: #ff4444;">🧪 API Test Failed<br>' + error.message + '</div>';
                });
            }
            
            // Add zodiac sign hover effects
            document.querySelectorAll('.zodiac-sign').forEach(sign => {
                sign.addEventListener('click', (e) => {
                    const title = e.target.getAttribute('title');
                    constellationInfo.innerHTML = `<strong>${title}</strong> selected<br>Analyzing cosmic influence...`;
                });
            });
            
            createStars();
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info("=" * 50)
    logger.info("🌟 STAR Backend Server Starting (Test Mode - No Database)")
    logger.info("=" * 50)
    logger.info(f"Port: {port}")
    logger.info(f"Debug: {debug_mode}")
    logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'production')}")
    logger.info(f"Frontend: {app.static_folder is not None}")
    logger.info("Cache: SimpleCache (no Redis)")
    logger.info("Database: Disabled for testing")
    logger.info("=" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)