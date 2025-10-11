import logging
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

# Simple test app for deployment
app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def home():
    return jsonify({
        "name": "STAR Platform",
        "version": "1.0.0", 
        "status": "running",
        "message": "Welcome to the STAR cosmic social network!",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "message": "STAR Backend is running",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": os.environ.get('FLASK_ENV', 'production'),
        "cosmos_db": os.environ.get('COSMOS_DB_CONNECTION_STRING') is not None
    })

@app.route('/api/v1/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Simple test response without Cosmos DB for now
        data = request.get_json() or {}
        
        # Calculate cosmic signature (simplified)
        birth_date = data.get('birthDate', '1990-01-01')
        username = data.get('username', 'testuser')
        
        # Simple tone calculation
        from datetime import datetime
        bd = datetime.strptime(birth_date, '%Y-%m-%d')
        day_num = bd.toordinal()
        tone = (day_num % 13) + 1
        day_signs = ['Crocodile', 'Wind', 'House', 'Lizard', 'Serpent', 'Death', 'Deer', 'Rabbit', 
                    'Water', 'Dog', 'Monkey', 'Grass', 'Reed', 'Jaguar', 'Eagle', 'Vulture', 
                    'Earthquake', 'Flint', 'Rain', 'Flower']
        day_sign = day_signs[day_num % 20]
        
        profile = {
            'id': username,
            'username': username,
            'email': data.get('email', ''),
            'birth_date': birth_date,
            'tone': tone,
            'day_sign': day_sign,
            'signature': f"{tone}-{day_sign}",
            'zodiac_system': data.get('zodiacSystem', 'Aztec'),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'message': 'Profile created successfully! (Test mode - no database storage yet)'
        }
        
        logger.info(f"Test registration: {username} -> {profile['signature']}")
        
        return jsonify({
            'success': True,
            'profile': profile
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)