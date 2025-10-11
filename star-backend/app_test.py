"""
Minimal STAR Backend Test - Basic Flask App without Complex Dependencies
This file tests basic functionality without requiring Cosmos DB or other external services
"""

import logging
import os
import sys

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

# Create Flask app
static_folder = os.path.join(os.path.dirname(__file__), 'static')
app = Flask(__name__, static_folder=static_folder, static_url_path='')

# Enable CORS
CORS(app, origins=['*'])

# Basic configuration
app.config.update({
    'SECRET_KEY': os.environ.get('SECRET_KEY', 'dev-secret-for-testing-only'),
    'JSON_SORT_KEYS': False
})

@app.route('/api/health')
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'STAR Platform Basic Test - OK',
        'version': '1.0.0',
        'environment': os.environ.get('FLASK_ENV', 'production'),
        'python_version': sys.version,
        'static_folder_exists': os.path.exists(static_folder),
        'available_routes': [
            '/api/health',
            '/api/test',
            '/' 
        ]
    })

@app.route('/api/test')
def test_endpoint():
    """Basic test endpoint"""
    return jsonify({
        'test': 'success',
        'message': 'Basic API functionality working',
        'timestamp': '2025-10-10'
    })

@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path='index.html'):
    """Serve the frontend files"""
    try:
        if path == '/' or path == '':
            path = 'index.html'
        
        if os.path.exists(os.path.join(static_folder, path)):
            return send_from_directory(static_folder, path)
        else:
            # If specific file not found, serve index.html for SPA routing
            return send_from_directory(static_folder, 'index.html')
    except Exception as e:
        logger.error(f"Error serving file {path}: {e}")
        return jsonify({'error': f'File not found: {path}'}), 404

# Create application for Azure
def create_test_app():
    """Create the Flask application"""
    logger.info("Creating STAR Platform Test Application")
    logger.info(f"Static folder: {static_folder}")
    logger.info(f"Static folder exists: {os.path.exists(static_folder)}")
    
    if os.path.exists(static_folder):
        files_in_static = os.listdir(static_folder)[:10]  # First 10 files
        logger.info(f"Files in static folder: {files_in_static}")
    
    return app

# Application instance for Azure
application = create_test_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting STAR Platform Test on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)