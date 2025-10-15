# -*- coding: utf-8 -*-
# Star App - Zodiac Profile Test Server
import json
import logging
import os
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'test-secret-key')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'test-jwt-key')
app.config['JWT_ALGORITHM'] = 'HS256'
CORS(app, origins=['http://localhost:3000'])

# Mock user storage (in production, use Cosmos DB)
mock_users = {}
mock_tokens = {}

def generate_cosmic_dna(zodiac_sign):
    """Generate cosmic DNA for a zodiac sign"""
    dna_map = {
        'Scorpio': {
            'archetype': 'Intense Transformer: Passionate, mysterious, and deeply intuitive.',
            'compatibility': ['Pisces', 'Cancer', 'Capricorn']
        },
        'Libra': {
            'archetype': 'Harmonious Diplomat: Charming, balanced, and socially adept.',
            'compatibility': ['Gemini', 'Aquarius', 'Leo']
        },
        'Aries': {
            'archetype': 'Bold Pioneer: Courageous, dynamic, and action-oriented.',
            'compatibility': ['Leo', 'Sagittarius', 'Gemini']
        },
        'Taurus': {
            'archetype': 'Grounded Builder: Loyal, sensual, and steadfast.',
            'compatibility': ['Virgo', 'Capricorn', 'Cancer']
        },
        'Gemini': {
            'archetype': 'Curious Communicator: Witty, versatile, and intellectually driven.',
            'compatibility': ['Libra', 'Aquarius', 'Aries']
        },
        'Cancer': {
            'archetype': 'Nurturing Protector: Emotional, caring, and intuitive.',
            'compatibility': ['Scorpio', 'Pisces', 'Taurus']
        },
        'Leo': {
            'archetype': 'Radiant Leader: Confident, generous, and charismatic.',
            'compatibility': ['Aries', 'Sagittarius', 'Libra']
        },
        'Virgo': {
            'archetype': 'Precise Perfectionist: Analytical, practical, and helpful.',
            'compatibility': ['Taurus', 'Capricorn', 'Scorpio']
        },
        'Sagittarius': {
            'archetype': 'Adventurous Explorer: Optimistic, philosophical, and free-spirited.',
            'compatibility': ['Aries', 'Leo', 'Aquarius']
        },
        'Capricorn': {
            'archetype': 'Ambitious Achiever: Disciplined, responsible, and determined.',
            'compatibility': ['Taurus', 'Virgo', 'Scorpio']
        },
        'Aquarius': {
            'archetype': 'Innovative Visionary: Independent, humanitarian, and progressive.',
            'compatibility': ['Gemini', 'Libra', 'Sagittarius']
        },
        'Pisces': {
            'archetype': 'Dreamy Mystic: Compassionate, artistic, and spiritually connected.',
            'compatibility': ['Cancer', 'Scorpio', 'Capricorn']
        }
    }
    
    return dna_map.get(zodiac_sign, dna_map['Scorpio'])

@app.route('/')
def hello():
    return "Star App Backend - Zodiac Profile Test Server"

@app.route('/api/health')
def health():
    return {
        "status": "healthy",
        "message": "Star App Backend is running",
        "database": True,  # Mock for now
        "static_files": True,  # Mock for now
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.route('/api/v1/zodiac-calculator', methods=['POST'])
def zodiac_calculator():
    """Calculate zodiac signs from birth date"""
    try:
        data = request.get_json()
        birth_date = data.get('birth_date')
        
        if not birth_date:
            return jsonify({'error': 'Birth date required'}), 400
        
        from datetime import datetime
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
        logger.error(f"Zodiac calculation error: {e}")
        return jsonify({'error': 'Calculation failed'}), 500

@app.route('/api/v1/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        username = data.get('username')
        user_id = data.get('user_id', username)
        zodiac = data.get('zodiac', 'Scorpio')
        
        # Create mock user
        user = {
            'id': user_id,
            'username': username,
            'zodiac_sign': zodiac,
            'galactic_tone': data.get('galactic_tone', 1),
            'cosmic_dna': generate_cosmic_dna(zodiac),
            'avatar': f"/assets/{zodiac.lower()}_avatar.png",
            'background': f"/assets/{zodiac.lower()}_bg.jpg",
            'bio': '',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        mock_users[user_id] = user
        
        # Create mock token
        token = f"mock_token_{user_id}_{int(datetime.now(timezone.utc).timestamp())}"
        mock_tokens[token] = user_id
        
        return jsonify({'token': token})
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/v1/user/profile', methods=['GET', 'PUT'])
def user_profile():
    """Get or update user profile"""
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
            
        token = auth_header.replace('Bearer ', '')
        user_id = mock_tokens.get(token)
        
        if not user_id or user_id not in mock_users:
            return jsonify({'error': 'Invalid token'}), 401
            
        user = mock_users[user_id]
        
        if request.method == 'PUT':
            data = request.get_json()
            # Update allowed fields
            allowed_fields = ['avatar', 'background', 'bio', 'zodiac_sign', 'chinese_zodiac']
            for field in allowed_fields:
                if field in data:
                    user[field] = data[field]
            
            user['updated_at'] = datetime.now(timezone.utc).isoformat()
            return jsonify({'status': 'Profile updated successfully'})
        
        # GET request - return profile
        return jsonify({
            'username': user.get('username'),
            'zodiac': user.get('zodiac_sign', 'Scorpio'),
            'chinese_zodiac': user.get('chinese_zodiac', 'Dragon'),
            'galactic_tone': user.get('galactic_tone', 1),
            'cosmic_dna': user.get('cosmic_dna'),
            'avatar': user.get('avatar'),
            'background': user.get('background'),
            'bio': user.get('bio', '')
        })
        
    except Exception as e:
        logger.error(f"Profile error: {e}")
        return jsonify({'error': 'Profile operation failed'}), 500

@app.route('/api/v1/daily-features', methods=['GET'])
def daily_features():
    """Get daily zodiac features"""
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
            
        token = auth_header.replace('Bearer ', '')
        user_id = mock_tokens.get(token)
        
        if not user_id or user_id not in mock_users:
            return jsonify({'error': 'Invalid token'}), 401
            
        user = mock_users[user_id]
        zodiac = user.get('zodiac_sign', 'Scorpio')
        today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
        # Generate daily features based on zodiac
        features_map = {
            'Aries': ['Aries Energy Boost: Channel your pioneering spirit today!'],
            'Taurus': ['Taurus Strength: Your persistence will pay off today!'],
            'Gemini': ['Gemini Communication: Your words have extra power today!'],
            'Cancer': ['Cancer Intuition: Trust your emotional insights today!'],
            'Leo': ['Leo Confidence: Shine brightly and lead by example!'],
            'Virgo': ['Virgo Precision: Your attention to detail is heightened!'],
            'Libra': ['Libra Balance: Harmony flows through all your interactions!'],
            'Scorpio': ['Scorpio Intensity: Embrace your transformative power today!'],
            'Sagittarius': ['Sagittarius Adventure: New horizons await you!'],
            'Capricorn': ['Capricorn Ambition: Your determination is unshakeable!'],
            'Aquarius': ['Aquarius Innovation: Revolutionary ideas are flowing!'],
            'Pisces': ['Pisces Dreams: Your intuitive gifts are strongest now!']
        }
        
        features = features_map.get(zodiac, ['Cosmic Energy: The universe is aligned with you!'])
        
        return jsonify({
            'id': f"{zodiac}_{today}",
            'zodiac': zodiac,
            'date': today,
            'features': features
        })
        
    except Exception as e:
        logger.error(f"Daily features error: {e}")
        return jsonify({'error': 'Failed to get daily features'}), 500

@app.route('/api/v1/tarot/weekly', methods=['GET'])
def weekly_tarot():
    """Get weekly tarot reading"""
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
            
        token = auth_header.replace('Bearer ', '')
        user_id = mock_tokens.get(token)
        
        if not user_id or user_id not in mock_users:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Calculate week start (Monday)
        today = datetime.now(timezone.utc)
        week_start = today - timedelta(days=today.weekday())
        week_start_str = week_start.strftime('%Y-%m-%d')
        
        # Mock weekly reading
        mock_cards = [
            {
                'id': f"weekly_{user_id}_{week_start_str}_1",
                'name': 'The Star',
                'interpretation': 'Hope and inspiration guide your path this week.',
                'image_url': '/assets/tarot/the_star.png'
            },
            {
                'id': f"weekly_{user_id}_{week_start_str}_2", 
                'name': 'Three of Cups',
                'interpretation': 'Celebration and friendship bring joy mid-week.',
                'image_url': '/assets/tarot/three_of_cups.png'
            },
            {
                'id': f"weekly_{user_id}_{week_start_str}_3",
                'name': 'The World',
                'interpretation': 'Completion and achievement crown the week.',
                'image_url': '/assets/tarot/the_world.png'
            }
        ]
        
        return jsonify({
            'id': f"weekly_{user_id}_{week_start_str}",
            'user_id': user_id,
            'cards': mock_cards,
            'created_at': week_start.isoformat(),
            'week_start': week_start_str
        })
            
    except Exception as e:
        logger.error(f"Weekly tarot error: {e}")
        return jsonify({'error': 'Service unavailable'}), 500

@app.route('/api/v1/share-reading', methods=['POST'])
def share_reading():
    """Share a tarot reading to profile or feed"""
    try:
        # Extract token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
            
        token = auth_header.replace('Bearer ', '')
        user_id = mock_tokens.get(token)
        
        if not user_id or user_id not in mock_users:
            return jsonify({'error': 'Invalid token'}), 401
            
        data = request.get_json()
        reading_id = data.get('reading_id')
        share_to = data.get('share_to', 'profile')
        
        if not reading_id:
            return jsonify({'error': 'Reading ID required'}), 400
            
        user = mock_users[user_id]
        username = user.get('username', 'Unknown')
        zodiac = user.get('zodiac_sign', 'Scorpio')
        
        # Create shared reading entry (mock for now)
        shared_reading = {
            'id': f"shared_{user_id}_{reading_id}_{int(datetime.now(timezone.utc).timestamp())}",
            'user_id': user_id,
            'username': username,
            'zodiac': zodiac,
            'type': 'tarot_reading',
            'content': {
                'card_name': 'The Star',  # Would fetch from actual reading
                'interpretation': 'Hope and inspiration guide your cosmic journey.'
            },
            'share_to': share_to,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"Tarot reading shared: {shared_reading['id']}")
        
        return jsonify({
            'status': 'Reading shared successfully',
            'shared_id': shared_reading['id']
        })
        
    except Exception as e:
        logger.error(f"Share reading error: {e}")
        return jsonify({'error': 'Failed to share reading'}), 500

@app.route('/api/v1/feed', methods=['GET'])
def cosmic_feed():
    """Get cosmic feed with shared readings and posts"""
    try:
        # Mock feed data
        mock_feed = [
            {
                'id': 'feed_1',
                'username': 'CosmicScorpio',
                'zodiac': 'Scorpio', 
                'type': 'tarot_reading',
                'content': {
                    'card_name': 'Death',
                    'interpretation': 'Transformation and renewal are coming your way.'
                },
                'created_at': (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
            },
            {
                'id': 'feed_2',
                'username': 'LibraBalance',
                'zodiac': 'Libra',
                'type': 'tarot_reading', 
                'content': {
                    'card_name': 'Justice',
                    'interpretation': 'Balance and fairness guide your decisions today.'
                },
                'created_at': (datetime.now(timezone.utc) - timedelta(hours=5)).isoformat()
            },
            {
                'id': 'feed_3',
                'username': 'AriesWarrior',
                'zodiac': 'Aries',
                'type': 'daily_feature',
                'content': 'Aries Energy Boost: Channel your pioneering spirit today!',
                'created_at': (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat()
            }
        ]
        
        return jsonify(mock_feed)
        
    except Exception as e:
        logger.error(f"Feed error: {e}")
        return jsonify({'error': 'Failed to load feed'}), 500

@app.route('/api/v1/social-actions', methods=['POST'])
def social_actions():
    """Handle zodiac-specific social actions like likes/comments"""
    try:
        data = request.get_json()
        action = data.get('action')  # e.g., 'scorpio_like', 'libra_comment'
        post_id = data.get('post_id')
        
        if not action or not post_id:
            return jsonify({'error': 'Action and post_id required'}), 400
        
        # Log the action
        logger.info(f"Social action: {action} on post {post_id}")
        
        # Award points for actions (mock implementation)
        points_awarded = 5 if 'like' in action else 10 if 'comment' in action else 3
        
        return jsonify({
            'status': 'Action recorded successfully',
            'action_id': f"action_{int(datetime.now(timezone.utc).timestamp())}",
            'points_awarded': points_awarded
        })
        
    except Exception as e:
        logger.error(f"Social actions error: {e}")
        return jsonify({'error': 'Failed to record action'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting Star App Backend on port {port}")
    logger.info("Available endpoints:")
    logger.info("  GET /api/health - Health check")
    logger.info("  POST /api/v1/zodiac-calculator - Calculate zodiac signs")
    logger.info("  POST /api/v1/register - Register user")
    logger.info("  GET/PUT /api/v1/user/profile - User profile")
    logger.info("  GET /api/v1/daily-features - Daily zodiac features")
    logger.info("  GET /api/v1/tarot/weekly - Weekly tarot reading")
    logger.info("  POST /api/v1/share-reading - Share tarot reading")
    logger.info("  GET /api/v1/feed - Cosmic feed")
    logger.info("  POST /api/v1/social-actions - Social actions")
    
    app.run(host='0.0.0.0', port=port, debug=True)