#!/usr/bin/env python3
"""
Minimal test server to verify infinite scroll functionality
Run this script to test the paginated feed endpoint
"""
import json
import logging
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.route('/api/v1/feed', methods=['GET'])
def cosmic_feed():
    """Get cosmic feed with shared readings and posts - supports pagination"""
    try:
        # Get pagination parameters
        limit = min(int(request.args.get('limit', 10)), 50)  # Max 50 items per request
        offset = int(request.args.get('offset', 0))
        
        # Generate 100 mock posts for demonstration
        all_mock_data = []
        
        for i in range(100):
            hours_ago = (i * 0.5) + 1  # Spread posts over time
            post_types = ['tarot_reading', 'daily_feature', 'cosmic_insight', 'zodiac_wisdom']
            zodiacs = ['Scorpio', 'Libra', 'Aries', 'Pisces', 'Leo', 'Virgo', 'Gemini', 'Cancer', 'Taurus', 'Sagittarius', 'Capricorn', 'Aquarius']
            
            zodiac = zodiacs[i % len(zodiacs)]
            post_type = post_types[i % len(post_types)]
            
            if post_type == 'tarot_reading':
                cards = ['Death', 'The Fool', 'The Star', 'The Moon', 'The Sun', 'Justice', 'The Hermit', 'Wheel of Fortune']
                card = cards[i % len(cards)]
                content = {
                    'card_name': card,
                    'interpretation': f'{zodiac} energy reveals: {card} brings transformation and insight to your cosmic journey.'
                }
            else:
                content = f'{zodiac} cosmic wisdom #{i+1}: Channel your {zodiac.lower()} energy for manifestation and growth!'
            
            all_mock_data.append({
                'id': f'feed_{i+1}',
                'username': f'Cosmic{zodiac}{i+1}',
                'zodiac': zodiac,
                'type': post_type,
                'content': content,
                'created_at': (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()
            })
        
        # Apply pagination
        paginated_data = all_mock_data[offset:offset + limit]
        
        logging.info(f"Feed request: limit={limit}, offset={offset}, returned={len(paginated_data)} items")
        
        return jsonify(paginated_data)
        
    except Exception as e:
        logging.error(f"Feed error: {e}")
        return jsonify({'error': 'Failed to load feed'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'STAR Infinite Scroll Test Server'})

if __name__ == '__main__':
    print("🌟 Starting STAR Infinite Scroll Test Server...")
    print("📡 Feed endpoint: http://localhost:5000/api/v1/feed")
    print("❤️  Health check: http://localhost:5000/health")
    print("📖 Usage: GET /api/v1/feed?limit=10&offset=0")
    app.run(debug=True, host='0.0.0.0', port=5000)