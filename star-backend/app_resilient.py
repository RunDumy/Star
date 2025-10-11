"""
STAR Platform Production Application - Resilient Version
This version gracefully handles missing environment variables and database connections
"""

import json
import logging
import os
import sys
import time
from datetime import datetime
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.utils import secure_filename

# Add current directory to path for module imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Static folder path
static_folder = os.path.join(current_dir, 'static')

# Create Flask app with proper configuration
app = Flask(__name__, static_folder=static_folder, static_url_path='')

# Enable CORS with more specific configuration for production
CORS(app, 
     origins=['*'],  # In production, specify actual domains
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'])

# Apply ProxyFix for proper handling of proxy headers
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# Request timing and metrics
request_counts = {}
request_times = []

@app.before_request
def before_request():
    """Track request timing and basic metrics"""
    g.start_time = time.time()
    
    # Simple rate limiting (in production, use Redis)
    client_ip = request.environ.get('REMOTE_ADDR', 'unknown')
    current_time = time.time()
    
    # Clean old entries (older than 1 minute)
    if client_ip in request_counts:
        request_counts[client_ip] = [t for t in request_counts[client_ip] if current_time - t < 60]
    else:
        request_counts[client_ip] = []
    
    # Add current request
    request_counts[client_ip].append(current_time)
    
    # Basic rate limiting: 100 requests per minute
    if len(request_counts[client_ip]) > 100:
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")

@app.after_request
def after_request(response):
    """Log request timing and add security headers"""
    if hasattr(g, 'start_time'):
        request_time = time.time() - g.start_time
        request_times.append(request_time)
        
        # Keep only last 1000 request times
        if len(request_times) > 1000:
            request_times.pop(0)
        
        # Log slow requests
        if request_time > 5.0:
            logger.warning(f"Slow request: {request.path} took {request_time:.2f}s")
    
    # Add security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    
    return response

# App configuration with enhanced security
app.config.update({
    'SECRET_KEY': os.environ.get('SECRET_KEY', 'fallback-secret-key-for-development'),
    'JSON_SORT_KEYS': False,
    'MAX_CONTENT_LENGTH': 50 * 1024 * 1024,  # 50MB max upload
    'WTF_CSRF_ENABLED': False,  # Disable CSRF for API endpoints
    'SEND_FILE_MAX_AGE_DEFAULT': 31536000,  # Cache static files for 1 year
    'START_TIME': time.time(),  # Track application start time
})

# Initialize optional features
database_available = False
redis_available = False
tonalpohualli_available = False

# Try to initialize database connection
cosmos_helper = None
try:
    from cosmos_db import CosmosDBHelper

    # Check if Cosmos DB environment variables are available
    cosmos_url = os.environ.get('AZURE_COSMOS_URL')
    cosmos_key = os.environ.get('AZURE_COSMOS_KEY')
    cosmos_db = os.environ.get('AZURE_COSMOS_DATABASE', 'star-db')
    
    if cosmos_url and cosmos_key:
        cosmos_helper = CosmosDBHelper()
        database_available = True
        logger.info("Database connection established successfully")
    else:
        logger.info("Database credentials not available, running without database")
        database_available = False
except ImportError:
    logger.warning("cosmos_db module not found")
    database_available = False
except Exception as e:
    logger.warning(f"Database not available: {e}")
    database_available = False

# Try to initialize tonalpohualli system
AZTEC_ZODIAC = {}
AZTEC_ZODIAC_ACTIONS = {}
GALACTIC_TONES = {}
calculate_aztec_day_sign_and_tone = None

try:
    from tonalpohualli import (AZTEC_ZODIAC, AZTEC_ZODIAC_ACTIONS,
                               GALACTIC_TONES,
                               calculate_aztec_day_sign_and_tone)
    tonalpohualli_available = True
    logger.info("Tonalpohualli system loaded successfully")
except ImportError:
    logger.warning("tonalpohualli module not found")
    tonalpohualli_available = False
except Exception as e:
    logger.warning(f"Tonalpohualli system not available: {e}")
    tonalpohualli_available = False

# Utility functions
def validate_json_input(required_fields=None):
    """Decorator to validate JSON input"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Invalid JSON data'}), 400
            
            if required_fields:
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    return jsonify({
                        'error': 'Missing required fields',
                        'missing_fields': missing_fields
                    }), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def sanitize_input(text, max_length=1000):
    """Sanitize text input"""
    if not isinstance(text, str):
        return str(text)[:max_length]
    return text.strip()[:max_length]

def create_error_response(message, status_code=400, details=None):
    """Create standardized error response"""
    response = {
        'error': message,
        'timestamp': datetime.utcnow().isoformat(),
        'status_code': status_code
    }
    if details:
        response['details'] = details
    return jsonify(response), status_code

# Routes
@app.route('/api/health')
def health_check():
    """Enhanced health check with system status"""
    return jsonify({
        'status': 'healthy',
        'message': 'STAR Platform Online',
        'version': '2.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'environment': os.environ.get('FLASK_ENV', 'production'),
        'features': {
            'database': database_available,
            'redis': redis_available,
            'tonalpohualli': tonalpohualli_available,
            'static_files': os.path.exists(static_folder)
        },
        'azure_config': {
            'cosmos_url_set': bool(os.environ.get('AZURE_COSMOS_URL')),
            'secret_key_set': bool(os.environ.get('SECRET_KEY')),
            'flask_env': os.environ.get('FLASK_ENV', 'not_set')
        }
    })

@app.route('/api/metrics')
def metrics():
    """Performance metrics endpoint"""
    if not request_times:
        avg_response_time = 0
        max_response_time = 0
    else:
        avg_response_time = sum(request_times) / len(request_times)
        max_response_time = max(request_times)
    
    metrics_data = {
        'performance': {
            'avg_response_time_ms': round(avg_response_time * 1000, 2),
            'max_response_time_ms': round(max_response_time * 1000, 2),
            'total_requests': len(request_times),
            'active_ips': len(request_counts),
            'slow_requests': len([t for t in request_times if t > 2.0])
        },
        'services': {
            'database': database_available,
            'redis': redis_available,
            'tonalpohualli': tonalpohualli_available,
            'static_files': os.path.exists(static_folder)
        },
        'system': {
            'python_version': sys.version.split()[0],
            'flask_env': os.environ.get('FLASK_ENV', 'production'),
            'app_start_time': app.config.get('START_TIME', 'unknown')
        },
        'timestamp': datetime.utcnow().isoformat()
    }
    
    return jsonify(metrics_data)

@app.route('/api/system/status')
def system_status():
    """Detailed system status"""
    static_files = []
    if os.path.exists(static_folder):
        try:
            static_files = os.listdir(static_folder)[:10]  # First 10 files
        except:
            static_files = ["error_reading_directory"]
    
    return jsonify({
        'system': {
            'python_version': sys.version,
            'working_directory': os.getcwd(),
            'static_folder': static_folder,
            'static_folder_exists': os.path.exists(static_folder),
            'static_files_sample': static_files
        },
        'environment_variables': {
            'SECRET_KEY': 'SET' if os.environ.get('SECRET_KEY') else 'NOT_SET',
            'AZURE_COSMOS_URL': 'SET' if os.environ.get('AZURE_COSMOS_URL') else 'NOT_SET',
            'AZURE_COSMOS_DATABASE': 'SET' if os.environ.get('AZURE_COSMOS_DATABASE') else 'NOT_SET',
            'FLASK_ENV': os.environ.get('FLASK_ENV', 'NOT_SET'),
            'PORT': os.environ.get('PORT', 'NOT_SET')
        },
        'features': {
            'database_connection': database_available,
            'tonalpohualli_module': tonalpohualli_available,
            'redis_cache': redis_available
        }
    })

@app.route('/api/oracle/daily-tonalpohualli')
def get_daily_tonalpohualli():
    """Get today's Tonalpohualli energy"""
    if not tonalpohualli_available:
        return jsonify({
            'error': 'Tonalpohualli system not available',
            'message': 'This feature requires the tonalpohualli module to be loaded',
            'fallback': {
                'day_sign': 'Sun',
                'sacred_number': 13,
                'energy': 'Cosmic Presence',
                'meaning': 'Today brings transcendent energy and universal connection'
            }
        }), 200
    
    try:
        from datetime import date
        today = date.today()
        result = calculate_aztec_day_sign_and_tone(today)
        
        return jsonify({
            'success': True,
            'date': today.isoformat(),
            'aztec_sign': {
                'day_sign': result['day_sign'],
                'sacred_number': result['sacred_number'],
                'description': result['description'],
                'traits': result.get('traits', ''),
                'galactic_tone': result.get('galactic_tone', {})
            }
        })
    except Exception as e:
        logger.error(f"Error getting daily Tonalpohualli: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/test')
def api_test():
    """Simple API test endpoint"""
    return jsonify({
        'test': 'success',
        'message': 'STAR Platform API is working',
        'timestamp': datetime.utcnow().isoformat(),
        'request_info': {
            'method': request.method,
            'path': request.path,
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        }
    })

@app.route('/api/echo', methods=['POST'])
@validate_json_input(required_fields=['message'])
def echo_api():
    """Example API endpoint with validation"""
    try:
        data = request.get_json()
        message = sanitize_input(data.get('message', ''))
        
        return jsonify({
            'success': True,
            'echo': message,
            'length': len(message),
            'timestamp': datetime.utcnow().isoformat(),
            'request_info': {
                'method': request.method,
                'content_type': request.headers.get('Content-Type'),
                'user_agent': request.headers.get('User-Agent', 'Unknown')[:50]
            }
        })
    except Exception as e:
        logger.error(f"Echo API error: {e}")
        return create_error_response(f"Echo API error: {str(e)}", 500)

@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path='index.html'):
    """Serve the frontend files with SPA routing support"""
    try:
        # Handle root path
        if not path or path == '/' or path == '':
            path = 'index.html'
        
        # Construct full file path
        file_path = os.path.join(static_folder, path)
        
        # Security: Prevent directory traversal
        if not os.path.commonpath([static_folder, file_path]) == static_folder:
            logger.warning(f"Directory traversal attempt blocked: {path}")
            return jsonify({'error': 'Invalid path'}), 400
        
        # Check if file exists
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(static_folder, path)
        else:
            # For SPA routing, serve index.html for any unknown routes
            index_path = os.path.join(static_folder, 'index.html')
            if os.path.exists(index_path):
                return send_from_directory(static_folder, 'index.html')
            else:
                # Fallback: Return minimal HTML if no static files
                return f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>STAR Platform</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body>
                    <h1>🌟 STAR Platform</h1>
                    <p>Backend is running successfully!</p>
                    <p>Frontend files: {os.path.exists(static_folder)}</p>
                    <p>API Health: <a href="/api/health">/api/health</a></p>
                    <p>System Status: <a href="/api/system/status">/api/system/status</a></p>
                </body>
                </html>
                """, 200, {'Content-Type': 'text/html'}
    except Exception as e:
        logger.error(f"Error serving file {path}: {e}")
        return jsonify({'error': f'Error serving file: {str(e)}'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    if request.path.startswith('/api/'):
        return jsonify({
            'error': 'Not found',
            'message': 'The requested API endpoint was not found',
            'path': request.path
        }), 404
    else:
        # For non-API routes, serve the SPA
        return serve_frontend()

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.utcnow().isoformat()
    }), 500

@app.errorhandler(413)
def file_too_large(error):
    """Handle file upload size errors"""
    return jsonify({
        'error': 'File too large',
        'message': 'The uploaded file exceeds the maximum size limit',
        'max_size': '50MB'
    }), 413

@app.errorhandler(400)
def bad_request(error):
    """Handle bad request errors"""
    return jsonify({
        'error': 'Bad request',
        'message': 'The request was invalid or malformed'
    }), 400

# Create application
def create_app():
    """Create and configure the Flask application"""
    logger.info("Creating STAR Platform Application")
    logger.info(f"Static folder: {static_folder}")
    logger.info(f"Static folder exists: {os.path.exists(static_folder)}")
    logger.info(f"Database available: {database_available}")
    logger.info(f"Tonalpohualli available: {tonalpohualli_available}")
    
    return app

# Application instance for Azure
application = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting STAR Platform on port {port}")
    logger.info(f"Debug mode: {debug_mode}")
    logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'production')}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode,
        threaded=True
    )