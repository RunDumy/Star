# Simple Flask Test - Verify Basic Functionality
# No external dependencies required

import logging
import os
from datetime import datetime, timezone

from flask import Flask, jsonify

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

app.config.update({
    'SECRET_KEY': 'test-secret-key',
    'JSON_SORT_KEYS': False
})

@app.route('/api/health')
def health_check():
    """Simple health check endpoint"""
    logger.info("Health check endpoint called")
    
    status = {
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'message': 'STAR Backend is running successfully!',
        'version': '1.0.0',
        'components': {
            'flask': 'working',
            'database': 'mock',
            'cache': 'disabled',
            'redis': 'disabled'
        }
    }
    
    return jsonify(status)

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Welcome to STAR - The Cosmic Social Network!',
        'endpoints': [
            '/api/health',
            '/api/v1/posts',
            '/api/v1/tarot/calculate-energy-flow',
            '/api/v1/oracle/natal-chart'
        ],
        'status': 'running'
    })

@app.route('/api/v1/posts', methods=['GET'])
def get_posts():
    """Mock posts endpoint"""
    mock_posts = [
        {
            'id': 'post_1',
            'content': 'The cosmic energy is strong today! ✨',
            'author': 'CosmicUser',
            'zodiac_sign': 'Leo',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'likes': 42
        }
    ]
    return jsonify({'success': True, 'posts': mock_posts})

@app.route('/api/v1/tarot/calculate-energy-flow', methods=['POST'])
def tarot_energy():
    """Mock tarot energy flow"""
    energy_flow = {
        'past_energy': 0.7,
        'present_energy': 0.8,
        'future_energy': 0.6,
        'overall_flow': 0.7,
        'recommendations': ['Focus on balance', 'Trust your intuition']
    }
    return jsonify({'success': True, 'energy_flow': energy_flow})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    logger.info("=" * 50)
    logger.info("🌟 STAR Backend Test Server Starting")
    logger.info("=" * 50)
    logger.info(f"Port: {port}")
    logger.info(f"Environment: test")
    logger.info("=" * 50)
    
    app.run(host='0.0.0.0', port=port, debug=True)