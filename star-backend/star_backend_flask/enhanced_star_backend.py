#!/usr/bin/env python3
"""
Enhanced STAR Backend with Real-Time Features
Supports WebSocket, personalized feeds, virtual scrolling, and offline caching
"""
import json
import logging
import random
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Configure logging
logging.basicConfig(level=logging.INFO)

# Mock user database with extended zodiac profiles
USERS_DB = {
    'user_1': {
        'id': 'user_1',
        'username': 'CosmicScorpio',
        'zodiac_signs': {
            'western': 'Scorpio',
            'chinese': 'Dragon',
            'vedic': 'Vrishchika',
            'mayan': 'Serpent',
            'galactic_tone': 8
        },
        'interests': ['tarot', 'astrology', 'cosmic_events'],
        'token': 'mock-token-1'
    },
    'user_2': {
        'id': 'user_2', 
        'username': 'LibraBalance',
        'zodiac_signs': {
            'western': 'Libra',
            'chinese': 'Rabbit',
            'vedic': 'Tula',
            'mayan': 'Mirror',
            'galactic_tone': 3
        },
        'interests': ['harmony', 'relationships', 'art'],
        'token': 'mock-token-2'
    }
}

# Connected clients for real-time updates
CONNECTED_CLIENTS = {}

def generate_cosmic_posts(count=100, filters=None):
    """Generate cosmic posts with advanced filtering support"""
    posts = []
    post_types = ['tarot_reading', 'daily_feature', 'cosmic_insight', 'zodiac_wisdom', 'cosmic_event', 'community_post']
    zodiacs = {
        'western': ['Scorpio', 'Libra', 'Aries', 'Pisces', 'Leo', 'Virgo', 'Gemini', 'Cancer', 'Taurus', 'Sagittarius', 'Capricorn', 'Aquarius'],
        'chinese': ['Dragon', 'Rabbit', 'Tiger', 'Ox', 'Rat', 'Pig', 'Dog', 'Rooster', 'Monkey', 'Goat', 'Horse', 'Snake'],
        'mayan': ['Serpent', 'Mirror', 'Jaguar', 'Eagle', 'Warrior', 'Earth', 'Flint', 'Storm', 'Night', 'Seed', 'Lizard', 'Moon']
    }
    
    for i in range(count):
        hours_ago = (i * 0.3) + random.uniform(0, 2)  # More realistic time distribution
        post_type = random.choice(post_types)
        
        # Multi-zodiac system
        western_zodiac = random.choice(zodiacs['western'])
        chinese_zodiac = random.choice(zodiacs['chinese']) 
        mayan_sign = random.choice(zodiacs['mayan'])
        galactic_tone = random.randint(1, 13)
        
        post = {
            'id': f'feed_{i+1}',
            'username': f'Cosmic{western_zodiac}{i+1}',
            'zodiac': western_zodiac,
            'zodiac_signs': {
                'western': western_zodiac,
                'chinese': chinese_zodiac,
                'mayan': mayan_sign,
                'galactic_tone': galactic_tone
            },
            'type': post_type,
            'created_at': (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat(),
            'engagement': {
                'likes': random.randint(0, 50),
                'comments': random.randint(0, 20),
                'shares': random.randint(0, 15)
            }
        }
        
        # Generate content based on type
        if post_type == 'tarot_reading':
            cards = ['Death', 'The Fool', 'The Star', 'The Moon', 'The Sun', 'Justice', 'The Hermit', 'Wheel of Fortune', 'The Lovers', 'The Magician']
            card = random.choice(cards)
            post['content'] = {
                'card_name': card,
                'interpretation': f'{western_zodiac} energy reveals: {card} brings transformation and cosmic insight to your journey.',
                'spread_type': random.choice(['single', 'three_card', 'celtic_cross'])
            }
        elif post_type == 'cosmic_event':
            events = ['Mercury Retrograde', 'Full Moon in Leo', 'Venus Transit', 'Mars Conjunction', 'Solar Eclipse']
            event = random.choice(events)
            post['content'] = {
                'event_name': event,
                'description': f'{event} brings powerful {western_zodiac} energy. Expect transformation and growth!',
                'date': (datetime.now(timezone.utc) + timedelta(days=random.randint(1, 30))).isoformat()
            }
        else:
            post['content'] = f'{western_zodiac} cosmic wisdom #{i+1}: Channel your {western_zodiac.lower()} energy with {mayan_sign} guidance for manifestation and growth!'
        
        # Apply filters if provided
        if filters:
            if not matches_filters(post, filters):
                continue
                
        posts.append(post)
    
    return posts

def matches_filters(post, filters):
    """Check if post matches the given filters"""
    if filters.get('zodiacSigns'):
        user_zodiacs = set(filters['zodiacSigns'])
        post_zodiacs = set(post['zodiac_signs'].values())
        if not user_zodiacs.intersection(post_zodiacs):
            return False
    
    if filters.get('postTypes') and post['type'] not in filters['postTypes']:
        return False
    
    if filters.get('searchQuery'):
        query = filters['searchQuery'].lower()
        searchable_text = json.dumps(post).lower()
        if query not in searchable_text:
            return False
    
    return True

@app.route('/api/v1/feed', methods=['GET'])
def cosmic_feed():
    """Enhanced cosmic feed with advanced filtering and virtual scrolling support"""
    try:
        # Get pagination parameters
        limit = min(int(request.args.get('limit', 10)), 100)  # Support up to 100 items for virtual scrolling
        offset = int(request.args.get('offset', 0))
        
        # Get filtering parameters
        filters = {
            'zodiacSigns': request.args.getlist('zodiacSigns[]'),
            'interests': request.args.getlist('interests[]'),
            'postTypes': request.args.getlist('postTypes[]'),
            'searchQuery': request.args.get('searchQuery', '').strip()
        }
        
        # Remove empty filters
        filters = {k: v for k, v in filters.items() if v}
        
        # Get user context for personalization (if authenticated)
        auth_header = request.headers.get('Authorization', '')
        user_context = None
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '')
            for user in USERS_DB.values():
                if user['token'] == token:
                    user_context = user
                    break
        
        # Generate personalized content
        if user_context and not filters.get('searchQuery'):
            # Personalized feed based on user's zodiac signs and interests
            user_filters = {
                'zodiacSigns': list(user_context['zodiac_signs'].values()),
                'interests': user_context['interests']
            }
            # Mix personalized (70%) and diverse (30%) content
            personalized_count = int(limit * 0.7)
            diverse_count = limit - personalized_count
            
            personalized_posts = generate_cosmic_posts(200, user_filters)[:personalized_count]
            diverse_posts = generate_cosmic_posts(200)[:diverse_count]
            
            all_posts = personalized_posts + diverse_posts
            random.shuffle(all_posts)  # Mix them naturally
        else:
            # Standard filtered feed
            all_posts = generate_cosmic_posts(1000, filters if filters else None)
        
        # Apply pagination
        paginated_data = all_posts[offset:offset + limit]
        
        # Add virtual scrolling metadata
        response_data = {
            'posts': paginated_data,
            'pagination': {
                'offset': offset,
                'limit': limit,
                'total_available': len(all_posts),
                'has_more': offset + limit < len(all_posts)
            },
            'filters_applied': filters,
            'personalized': bool(user_context and not filters.get('searchQuery'))
        }
        
        logging.info(f"Feed request: limit={limit}, offset={offset}, filters={filters}, returned={len(paginated_data)} items")
        
        return jsonify(response_data)
        
    except Exception as e:
        logging.error(f"Feed error: {e}")
        return jsonify({'error': 'Failed to load feed'}), 500

@app.route('/api/v1/search', methods=['GET'])
def search_posts():
    """Infinite scroll search with advanced filtering"""
    try:
        query = request.args.get('q', '').strip()
        limit = min(int(request.args.get('limit', 20)), 100)
        offset = int(request.args.get('offset', 0))
        
        if not query:
            return jsonify({'error': 'Search query required'}), 400
        
        # Generate search filters
        filters = {'searchQuery': query}
        
        # Add additional filters
        if request.args.get('zodiac'):
            filters['zodiacSigns'] = [request.args.get('zodiac')]
        if request.args.get('type'):
            filters['postTypes'] = [request.args.get('type')]
        
        # Search through posts
        all_posts = generate_cosmic_posts(2000, filters)
        
        # Sort by relevance (mock scoring)
        for post in all_posts:
            score = 0
            content_text = json.dumps(post).lower()
            query_lower = query.lower()
            
            # Score based on query matches
            score += content_text.count(query_lower) * 10
            if query_lower in post.get('username', '').lower():
                score += 20
            if query_lower in post.get('zodiac', '').lower():
                score += 15
            
            post['relevance_score'] = score
        
        # Sort by relevance
        all_posts.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # Apply pagination
        paginated_results = all_posts[offset:offset + limit]
        
        return jsonify({
            'results': paginated_results,
            'query': query,
            'pagination': {
                'offset': offset,
                'limit': limit,
                'total_found': len(all_posts),
                'has_more': offset + limit < len(all_posts)
            }
        })
        
    except Exception as e:
        logging.error(f"Search error: {e}")
        return jsonify({'error': 'Search failed'}), 500

@app.route('/api/v1/tarot/shared', methods=['GET'])
def shared_tarot_readings():
    """Infinite scroll for shared tarot readings"""
    try:
        limit = min(int(request.args.get('limit', 15)), 50)
        offset = int(request.args.get('offset', 0))
        spread_type = request.args.get('spread_type')  # single, three_card, celtic_cross
        
        filters = {'postTypes': ['tarot_reading']}
        if spread_type:
            filters['spread_type'] = spread_type
        
        # Generate tarot-specific posts
        all_readings = generate_cosmic_posts(500, filters)
        
        # Sort by creation time (newest first)
        all_readings.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Apply pagination
        paginated_readings = all_readings[offset:offset + limit]
        
        return jsonify({
            'readings': paginated_readings,
            'pagination': {
                'offset': offset,
                'limit': limit,
                'total_available': len(all_readings),
                'has_more': offset + limit < len(all_readings)
            }
        })
        
    except Exception as e:
        logging.error(f"Shared tarot error: {e}")
        return jsonify({'error': 'Failed to load tarot readings'}), 500

@app.route('/api/v1/cosmic-events', methods=['GET'])
def cosmic_events():
    """Real-time cosmic events with pagination"""
    try:
        limit = min(int(request.args.get('limit', 10)), 30)
        offset = int(request.args.get('offset', 0))
        
        filters = {'postTypes': ['cosmic_event']}
        
        # Generate cosmic events
        all_events = generate_cosmic_posts(200, filters)
        
        # Sort by event date (upcoming first)
        all_events.sort(key=lambda x: x['content'].get('date', x['created_at']))
        
        # Apply pagination
        paginated_events = all_events[offset:offset + limit]
        
        return jsonify({
            'events': paginated_events,
            'pagination': {
                'offset': offset,
                'limit': limit,
                'total_available': len(all_events),
                'has_more': offset + limit < len(all_events)
            }
        })
        
    except Exception as e:
        logging.error(f"Cosmic events error: {e}")
        return jsonify({'error': 'Failed to load cosmic events'}), 500

@app.route('/api/v1/multi-zodiac-calculator', methods=['POST'])
def multi_zodiac_calculator():
    """Calculate all zodiac systems from birth data"""
    try:
        data = request.get_json()
        birth_date = data.get('birth_date')  # YYYY-MM-DD
        birth_time = data.get('birth_time')  # HH:MM
        birth_location = data.get('birth_location', {})  # {lat, lng, city}
        
        if not birth_date:
            return jsonify({'error': 'Birth date required'}), 400
        
        from datetime import datetime
        date = datetime.strptime(birth_date, '%Y-%m-%d')
        
        # Calculate Western Zodiac
        western = calculate_western_zodiac(date)
        
        # Calculate Chinese Zodiac
        chinese = calculate_chinese_zodiac(date)
        
        # Calculate Vedic Zodiac (simplified)
        vedic = calculate_vedic_zodiac(date)
        
        # Calculate Mayan Day Sign
        mayan = calculate_mayan_day_sign(date)
        
        # Calculate Galactic Tone
        galactic_tone = calculate_galactic_tone(date)
        
        result = {
            'western': western,
            'chinese': chinese,
            'vedic': vedic,
            'mayan': mayan,
            'galactic_tone': galactic_tone,
            'compatibility': calculate_multi_zodiac_compatibility(western, chinese, vedic),
            'cosmic_dna': generate_multi_zodiac_dna(western, chinese, vedic, mayan, galactic_tone)
        }
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Multi-zodiac calculation error: {e}")
        return jsonify({'error': 'Calculation failed'}), 500

def calculate_western_zodiac(date):
    """Calculate Western zodiac sign"""
    day, month = date.day, date.month
    
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return 'Aries'
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return 'Taurus'
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return 'Gemini'
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return 'Cancer'
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return 'Leo'
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return 'Virgo'
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return 'Libra'
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return 'Scorpio'
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return 'Sagittarius'
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return 'Capricorn'
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return 'Aquarius'
    else:  # Pisces
        return 'Pisces'

def calculate_chinese_zodiac(date):
    """Calculate Chinese zodiac sign"""
    animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 
              'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
    return animals[(date.year - 1900) % 12]

def calculate_vedic_zodiac(date):
    """Calculate Vedic zodiac (simplified mapping)"""
    western = calculate_western_zodiac(date)
    vedic_map = {
        'Aries': 'Mesha', 'Taurus': 'Vrishabha', 'Gemini': 'Mithuna',
        'Cancer': 'Karka', 'Leo': 'Simha', 'Virgo': 'Kanya',
        'Libra': 'Tula', 'Scorpio': 'Vrishchika', 'Sagittarius': 'Dhanus',
        'Capricorn': 'Makara', 'Aquarius': 'Kumbha', 'Pisces': 'Meena'
    }
    return vedic_map.get(western, 'Mesha')

def calculate_mayan_day_sign(date):
    """Calculate Mayan day sign"""
    day_signs = ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik',
                'Lamat', 'Muluc', 'Oc', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men',
                'Cib', 'Caban', 'Etznab', 'Cauac', 'Ahau']
    return day_signs[date.day % 20]

def calculate_galactic_tone(date):
    """Calculate Galactic Tone (1-13)"""
    return (date.day % 13) + 1

def calculate_multi_zodiac_compatibility(western, chinese, vedic):
    """Calculate compatibility across zodiac systems"""
    # Simplified compatibility matrix
    compatibility = {
        'western_matches': ['Cancer', 'Pisces', 'Capricorn'] if western == 'Scorpio' else ['Gemini', 'Aquarius'],
        'chinese_matches': ['Rat', 'Monkey', 'Rooster'] if chinese == 'Dragon' else ['Pig', 'Goat'],
        'vedic_matches': ['Karka', 'Meena', 'Makara'] if vedic == 'Vrishchika' else ['Mithuna', 'Kumbha']
    }
    return compatibility

def generate_multi_zodiac_dna(western, chinese, vedic, mayan, galactic_tone):
    """Generate comprehensive cosmic DNA"""
    return {
        'archetype': f'{western} {chinese}',
        'power_number': galactic_tone,
        'elemental_signature': f'{mayan} Spirit',
        'cosmic_frequency': f'Tone {galactic_tone} Harmonics',
        'soul_mission': f'Bridge {western} wisdom with {chinese} energy through {mayan} guidance'
    }

# WebSocket Events for Real-Time Features

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    client_id = request.sid
    CONNECTED_CLIENTS[client_id] = {
        'connected_at': datetime.now(timezone.utc).isoformat(),
        'rooms': []
    }
    logging.info(f"Client connected: {client_id}")
    emit('connected', {'message': 'Connected to STAR cosmic network', 'client_id': client_id})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    client_id = request.sid
    if client_id in CONNECTED_CLIENTS:
        del CONNECTED_CLIENTS[client_id]
    logging.info(f"Client disconnected: {client_id}")

@socketio.on('join_feed_room')
def handle_join_feed_room(data):
    """Join a personalized feed room for real-time updates"""
    room_name = data.get('room', 'general_feed')
    client_id = request.sid
    
    join_room(room_name)
    if client_id in CONNECTED_CLIENTS:
        CONNECTED_CLIENTS[client_id]['rooms'].append(room_name)
    
    logging.info(f"Client {client_id} joined room: {room_name}")
    emit('joined_room', {'room': room_name, 'message': f'Joined {room_name} for cosmic updates'})

@socketio.on('leave_feed_room')
def handle_leave_feed_room(data):
    """Leave a feed room"""
    room_name = data.get('room', 'general_feed')
    client_id = request.sid
    
    leave_room(room_name)
    if client_id in CONNECTED_CLIENTS and room_name in CONNECTED_CLIENTS[client_id]['rooms']:
        CONNECTED_CLIENTS[client_id]['rooms'].remove(room_name)
    
    logging.info(f"Client {client_id} left room: {room_name}")
    emit('left_room', {'room': room_name})

@socketio.on('new_post_created')
def handle_new_post(data):
    """Broadcast new post to relevant rooms"""
    post = data.get('post')
    if not post:
        return
    
    # Determine which rooms should receive this post
    rooms = ['general_feed']
    
    # Add zodiac-specific rooms
    if post.get('zodiac_signs'):
        for zodiac_type, sign in post['zodiac_signs'].items():
            rooms.append(f'zodiac_{zodiac_type}_{sign}')
    
    # Add type-specific rooms
    if post.get('type'):
        rooms.append(f'type_{post["type"]}')
    
    # Broadcast to all relevant rooms
    for room in rooms:
        socketio.emit('feed_update', {
            'type': 'new_post',
            'post': post,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }, room=room)
    
    logging.info(f"Broadcasted new post {post.get('id')} to rooms: {rooms}")

@socketio.on('cosmic_event_alert')
def handle_cosmic_event(data):
    """Broadcast cosmic events to all connected clients"""
    event = data.get('event')
    if not event:
        return
    
    socketio.emit('cosmic_alert', {
        'type': 'cosmic_event',
        'event': event,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })
    
    logging.info(f"Broadcasted cosmic event: {event.get('name')}")

@app.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check with feature status"""
    return jsonify({
        'status': 'healthy',
        'message': 'STAR Enhanced Backend - All Systems Cosmic!',
        'features': {
            'websockets': True,
            'personalized_feed': True,
            'virtual_scrolling': True,
            'multi_zodiac': True,
            'real_time_events': True,
            'search': True,
            'offline_support': True
        },
        'connected_clients': len(CONNECTED_CLIENTS),
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

# Simulate real-time events (for demonstration)
def simulate_cosmic_events():
    """Simulate cosmic events being broadcasted"""
    import threading
    import time
    
    def event_loop():
        events = [
            {'name': 'Mercury Retrograde Beginning', 'description': 'Communication challenges ahead'},
            {'name': 'Full Moon in Leo', 'description': 'Creative energies peak'},
            {'name': 'Venus Transit in Libra', 'description': 'Love and harmony flow'},
            {'name': 'Mars Conjunction', 'description': 'Action energy intensifies'}
        ]
        
        while True:
            time.sleep(30)  # Every 30 seconds
            event = random.choice(events)
            socketio.emit('cosmic_alert', {
                'type': 'cosmic_event',
                'event': event,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            logging.info(f"Simulated cosmic event: {event['name']}")
    
    thread = threading.Thread(target=event_loop)
    thread.daemon = True
    thread.start()

# Zodiac Moments API endpoints
@app.route('/api/v1/zodiac-moments', methods=['GET'])
def get_zodiac_moments():
    """Get paginated zodiac moments (TikTok-style videos)"""
    try:
        page = int(request.args.get('page', 0))
        limit = min(int(request.args.get('limit', 20)), 50)  # Max 50 per request
        
        # Mock zodiac moments data - replace with actual database queries
        mock_moments = []
        zodiac_signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                       'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
        elements = ['fire', 'water', 'air', 'earth', 'none']
        
        for i in range(page * limit, (page + 1) * limit):
            zodiac = zodiac_signs[i % len(zodiac_signs)]
            moment = {
                'id': f'moment_{i}',
                'userId': f'user_{i % 100}',
                'username': f'cosmic_{zodiac}_{i}',
                'avatar': f'/avatars/{zodiac}.png',
                'videoUrl': f'/videos/zodiac_{zodiac}_{i % 10}.mp4',
                'thumbnail': f'/thumbnails/{zodiac}_{i}.jpg',
                'caption': f'Embracing my {zodiac.title()} energy today! ✨ #{zodiac} #cosmic #vibes',
                'zodiacSign': {
                    'western': zodiac,
                    'chinese': ['rat', 'ox', 'tiger', 'rabbit'][i % 4],
                    'galactic_tone': (i % 13) + 1
                },
                'elementalFilter': elements[i % len(elements)],
                'likes': (i * 47) % 10000,
                'comments': (i * 23) % 500,
                'shares': (i * 11) % 200,
                'isLiked': i % 7 == 0,
                'timestamp': (datetime.now() - timedelta(hours=i % 48)).isoformat(),
                'duration': 15 + (i % 45),  # 15-60 seconds
                'tags': [zodiac, 'cosmic', 'vibes', f'tone{(i % 13) + 1}'],
                'cosmicResonance': min(95, 30 + (i * 7) % 70)
            }
            mock_moments.append(moment)
        
        return jsonify({
            'moments': mock_moments,
            'hasMore': page < 10,  # Mock has more data
            'nextPage': page + 1 if page < 10 else None
        })
    except Exception as e:
        app.logger.error(f"Error fetching zodiac moments: {e}")
        return jsonify({'error': 'Failed to fetch zodiac moments'}), 500

@app.route('/api/v1/zodiac-moments/<moment_id>/like', methods=['POST'])
def like_zodiac_moment(moment_id):
    """Like or unlike a zodiac moment"""
    try:
        user_id = request.json.get('userId', 'anonymous')
        is_liked = request.json.get('isLiked', False)
        
        # Emit real-time like update
        socketio.emit('moment_liked', {
            'momentId': moment_id,
            'userId': user_id,
            'isLiked': is_liked,
            'timestamp': datetime.now().isoformat()
        }, room=f'moment_{moment_id}')
        
        return jsonify({
            'success': True,
            'momentId': moment_id,
            'isLiked': is_liked,
            'newLikeCount': 1000 + int(moment_id.split('_')[1]) * 47 % 10000  # Mock count
        })
    except Exception as e:
        app.logger.error(f"Error liking moment {moment_id}: {e}")
        return jsonify({'error': 'Failed to like moment'}), 500

@app.route('/api/v1/zodiac-moments/upload', methods=['POST'])
def upload_zodiac_moment():
    """Upload a new zodiac moment video"""
    try:
        user_id = request.form.get('userId', 'anonymous')
        caption = request.form.get('caption', '')
        elemental_filter = request.form.get('elementalFilter', 'none')
        tags = request.form.getlist('tags[]') if request.form.getlist('tags[]') else []
        
        # Generate mock moment ID
        moment_id = f"moment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Mock zodiac calculation based on user profile
        user_zodiac = {
            'western': 'scorpio',  # Get from user profile
            'chinese': 'dragon',
            'galactic_tone': 7
        }
        
        new_moment = {
            'id': moment_id,
            'userId': user_id,
            'username': f'cosmic_user_{user_id}',
            'videoUrl': f'/uploads/{moment_id}.mp4',
            'caption': caption,
            'zodiacSign': user_zodiac,
            'elementalFilter': elemental_filter,
            'likes': 0,
            'comments': 0, 
            'shares': 0,
            'timestamp': datetime.now().isoformat(),
            'tags': tags,
            'cosmicResonance': 50  # Initial resonance
        }
        
        # Emit new moment to all users
        socketio.emit('new_moment', new_moment, broadcast=True)
        
        return jsonify({
            'success': True,
            'moment': new_moment
        }), 201
    except Exception as e:
        app.logger.error(f"Error uploading zodiac moment: {e}")
        return jsonify({'error': 'Failed to upload moment'}), 500

# Constellation Threads API endpoints
@app.route('/api/v1/constellation-threads', methods=['GET'])
def get_constellation_threads():
    """Get paginated constellation threads with astrological connections"""
    try:
        page = int(request.args.get('page', 0))
        limit = min(int(request.args.get('limit', 10)), 20)  # Max 20 per request
        
        # Mock constellation threads data
        mock_threads = []
        zodiac_signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                       'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
        elements = ['fire', 'water', 'air', 'earth']
        
        for i in range(page * limit, (page + 1) * limit):
            root_zodiac = zodiac_signs[i % len(zodiac_signs)]
            thread_zodiacs = [
                root_zodiac,
                zodiac_signs[(i + 3) % len(zodiac_signs)],
                zodiac_signs[(i + 7) % len(zodiac_signs)]
            ]
            
            root_post = {
                'id': f'thread_{i}_root',
                'userId': f'user_{i}',
                'username': f'cosmic_{root_zodiac}_{i}',
                'avatar': f'/avatars/{root_zodiac}.png',
                'content': f'Experiencing incredible {root_zodiac} energy during this cosmic shift! Anyone else feeling the planetary alignment? ✨ #{root_zodiac} #cosmic #energy',
                'zodiacSign': {
                    'western': root_zodiac,
                    'chinese': ['rat', 'ox', 'tiger', 'rabbit'][i % 4],
                    'galactic_tone': (i % 13) + 1
                },
                'timestamp': (datetime.now() - timedelta(hours=i % 72)).isoformat(),
                'likes': (i * 33) % 500,
                'replies': (i * 7) % 50 + 5,
                'reposts': (i * 11) % 100,
                'isLiked': i % 5 == 0,
                'threadId': f'thread_{i}',
                'constellationPath': thread_zodiacs,
                'elementalResonance': elements[i % len(elements)],
                'cosmicDepth': 0
            }
            
            # Generate thread replies
            thread_posts = []
            reply_count = random.randint(3, 8)
            for j in range(reply_count):
                reply_zodiac = thread_zodiacs[j % len(thread_zodiacs)]
                thread_posts.append({
                    'id': f'thread_{i}_post_{j}',
                    'userId': f'user_{i + j + 1}',
                    'username': f'cosmic_{reply_zodiac}_{i + j}',
                    'avatar': f'/avatars/{reply_zodiac}.png',
                    'content': f'As a {reply_zodiac}, I completely resonate with this! The {root_zodiac}-{reply_zodiac} connection is creating such powerful vibrations right now. 🌟',
                    'zodiacSign': {
                        'western': reply_zodiac,
                        'chinese': ['dragon', 'snake', 'horse', 'goat'][j % 4],
                        'galactic_tone': ((i + j) % 13) + 1
                    },
                    'timestamp': (datetime.now() - timedelta(hours=(i % 72)) + timedelta(minutes=j * 15)).isoformat(),
                    'likes': (i * j * 7) % 200,
                    'replies': (i * j * 3) % 10,
                    'reposts': (i * j * 5) % 20,
                    'isLiked': (i + j) % 7 == 0,
                    'parentId': root_post['id'] if j == 0 else f'thread_{i}_post_{j-1}',
                    'threadId': f'thread_{i}',
                    'constellationPath': thread_zodiacs,
                    'elementalResonance': elements[(i + j) % len(elements)],
                    'cosmicDepth': min(j + 1, 5)
                })
            
            thread = {
                'id': f'thread_{i}',
                'rootPost': root_post,
                'posts': thread_posts,
                'constellationPattern': '→'.join(thread_zodiacs),
                'elementalFlow': '→'.join(elements[:3]),
                'totalPosts': len(thread_posts) + 1,
                'activeUsers': random.randint(3, 18),
                'cosmicEnergy': min(95, 40 + (i * 13) % 60)
            }
            mock_threads.append(thread)
        
        return jsonify({
            'threads': mock_threads,
            'hasMore': page < 5,  # Mock has 5 pages
            'nextPage': page + 1 if page < 5 else None
        })
    except Exception as e:
        app.logger.error(f"Error fetching constellation threads: {e}")
        return jsonify({'error': 'Failed to fetch constellation threads'}), 500

@app.route('/api/v1/constellation-threads/<thread_id>/reply', methods=['POST'])
def reply_to_thread(thread_id):
    """Add a reply to a constellation thread"""
    try:
        user_id = request.json.get('userId', 'anonymous')
        content = request.json.get('content', '')
        parent_id = request.json.get('parentId')
        
        # Mock user zodiac data
        user_zodiac = {
            'western': 'scorpio',  # Get from user profile
            'chinese': 'dragon',
            'galactic_tone': 7
        }
        
        new_reply = {
            'id': f'reply_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'userId': user_id,
            'username': f'cosmic_user_{user_id}',
            'content': content,
            'zodiacSign': user_zodiac,
            'timestamp': datetime.now().isoformat(),
            'likes': 0,
            'replies': 0,
            'reposts': 0,
            'isLiked': False,
            'parentId': parent_id,
            'threadId': thread_id,
            'cosmicDepth': 1  # Calculate based on thread depth
        }
        
        # Emit real-time thread update
        socketio.emit('thread_reply', {
            'threadId': thread_id,
            'reply': new_reply,
            'timestamp': datetime.now().isoformat()
        }, room=f'thread_{thread_id}')
        
        return jsonify({
            'success': True,
            'reply': new_reply
        }), 201
    except Exception as e:
        app.logger.error(f"Error replying to thread {thread_id}: {e}")
        return jsonify({'error': 'Failed to add reply'}), 500

@app.route('/api/v1/profile/<user_id>/influence', methods=['GET'])
def get_profile_influence(user_id):
    """Get user's influence showcase data - connections, viral content, stats"""
    try:
        # Mock influence data - in production, query from database
        # Generate mock user posts for influence calculation
        user_posts = generate_cosmic_posts(20, {'user_id': user_id})
        
        # Calculate top follows with zodiac compatibility
        user = USERS_DB.get(user_id, {})
        user_zodiac = user.get('zodiac_signs', {}).get('western', 'Aries')
        
        top_follows = []
        for other_user_id, other_user in USERS_DB.items():
            if other_user_id != user_id:
                compatibility_score = calculate_zodiac_compatibility(
                    user_zodiac, 
                    other_user.get('zodiac_signs', {}).get('western', 'Aries')
                )
                top_follows.append({
                    'id': other_user_id,
                    'username': other_user.get('username', 'Unknown'),
                    'zodiac': other_user.get('zodiac_signs', {}).get('western', 'Aries'),
                    'zodiac_signs': other_user.get('zodiac_signs', {}),
                    'compatibility_score': compatibility_score,
                    'mutual_connections': random.randint(5, 50),
                    'follower_count': random.randint(100, 10000)
                })
        
        # Sort by compatibility and limit
        top_follows.sort(key=lambda x: x['compatibility_score'], reverse=True)
        top_follows = top_follows[:5]
        
        # Get most liked posts with ritual reactions
        most_liked_posts = []
        for post in user_posts:
            if random.random() > 0.7:  # Only some posts become popular
                ritual_reactions = {
                    'fire': random.randint(5, 100),
                    'water': random.randint(3, 80),
                    'air': random.randint(2, 60),
                    'earth': random.randint(4, 90),
                    'zodiac_specific': {}
                }
                
                # Add zodiac-specific reactions
                zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo']
                for sign in random.sample(zodiac_signs, random.randint(1, 3)):
                    ritual_reactions['zodiac_specific'][sign] = random.randint(1, 20)
                
                total_likes = sum([v for v in ritual_reactions.values() if isinstance(v, int)])
                total_likes += sum(ritual_reactions['zodiac_specific'].values())
                
                most_liked_posts.append({
                    'id': post.get('id'),
                    'content': post.get('content', ''),
                    'type': post.get('type', 'text'),
                    'likes_count': total_likes,
                    'ritual_reactions': ritual_reactions,
                    'created_at': post.get('created_at', datetime.now().isoformat()),
                    'viral_score': min(total_likes / 100.0, 1.0)
                })
        
        # Sort by likes and limit
        most_liked_posts.sort(key=lambda x: x['likes_count'], reverse=True)
        most_liked_posts = most_liked_posts[:3]
        
        # Generate viral content with cross-sign resonance
        viral_content = []
        for post in user_posts:
            if random.random() > 0.9:  # Only rare posts go viral
                cross_sign_resonance = random.uniform(0.6, 0.95)
                engagement_diversity = random.randint(70, 95)
                cosmic_reach = random.randint(1000, 50000)
                
                viral_content.append({
                    'id': post.get('id'),
                    'content': post.get('content', ''),
                    'type': post.get('type', 'text'),
                    'cross_sign_resonance': cross_sign_resonance,
                    'engagement_diversity': engagement_diversity,
                    'cosmic_reach': cosmic_reach,
                    'created_at': post.get('created_at', datetime.now().isoformat())
                })
        
        # Sort by resonance and limit
        viral_content.sort(key=lambda x: x['cross_sign_resonance'], reverse=True)
        viral_content = viral_content[:2]
        
        # Generate elemental playlist
        user_element = get_zodiac_element(user_zodiac)
        
        elemental_playlist = {
            'current_song': f"Cosmic {user_element.title()} Meditation",
            'artist': "Celestial Harmonics",
            'elemental_vibe': user_element,
            'spotify_track_id': f"mock_track_{user_element}"
        }
        
        # Calculate cosmic stats
        total_ritual_reactions = sum([post['likes_count'] for post in most_liked_posts])
        zodiac_influence_score = len(most_liked_posts) * 10 + len(viral_content) * 50
        cross_sign_engagement = sum([content['cross_sign_resonance'] for content in viral_content]) / max(len(viral_content), 1)
        mythic_reach = sum([content['cosmic_reach'] for content in viral_content])
        
        cosmic_stats = {
            'total_ritual_reactions': total_ritual_reactions,
            'zodiac_influence_score': zodiac_influence_score,
            'cross_sign_engagement': cross_sign_engagement,
            'mythic_reach': mythic_reach
        }
        
        influence_data = {
            'topFollows': top_follows,
            'mostLikedPosts': most_liked_posts,
            'viralContent': viral_content,
            'elementalPlaylist': elemental_playlist,
            'cosmicStats': cosmic_stats
        }
        
        return jsonify(influence_data)
        
    except Exception as e:
        logging.error(f"Error fetching influence data: {e}")
        return jsonify({'error': 'Failed to fetch influence data'}), 500

def calculate_zodiac_compatibility(sign1, sign2):
    """Calculate compatibility score between two zodiac signs"""
    # Simplified compatibility matrix
    compatibility_matrix = {
        'Aries': {'Leo': 0.9, 'Sagittarius': 0.9, 'Gemini': 0.8, 'Aquarius': 0.8},
        'Taurus': {'Virgo': 0.9, 'Capricorn': 0.9, 'Cancer': 0.8, 'Pisces': 0.8},
        'Gemini': {'Libra': 0.9, 'Aquarius': 0.9, 'Aries': 0.8, 'Leo': 0.8},
        'Cancer': {'Scorpio': 0.9, 'Pisces': 0.9, 'Taurus': 0.8, 'Virgo': 0.8},
        'Leo': {'Aries': 0.9, 'Sagittarius': 0.9, 'Gemini': 0.8, 'Libra': 0.8},
        'Virgo': {'Taurus': 0.9, 'Capricorn': 0.9, 'Cancer': 0.8, 'Scorpio': 0.8},
        'Libra': {'Gemini': 0.9, 'Aquarius': 0.9, 'Leo': 0.8, 'Sagittarius': 0.8},
        'Scorpio': {'Cancer': 0.9, 'Pisces': 0.9, 'Virgo': 0.8, 'Capricorn': 0.8},
        'Sagittarius': {'Aries': 0.9, 'Leo': 0.9, 'Libra': 0.8, 'Aquarius': 0.8},
        'Capricorn': {'Taurus': 0.9, 'Virgo': 0.9, 'Scorpio': 0.8, 'Pisces': 0.8},
        'Aquarius': {'Gemini': 0.9, 'Libra': 0.9, 'Aries': 0.8, 'Sagittarius': 0.8},
        'Pisces': {'Cancer': 0.9, 'Scorpio': 0.9, 'Taurus': 0.8, 'Capricorn': 0.8}
    }
    
    if sign1 == sign2:
        return 0.95  # Same sign high compatibility
    
    sign1_compat = compatibility_matrix.get(sign1, {})
    return sign1_compat.get(sign2, random.uniform(0.3, 0.7))  # Default random compatibility

def get_zodiac_element(zodiac_sign):
    """Get the elemental association of a zodiac sign"""
    elements = {
        'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
        'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
        'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
        'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water'
    }
    return elements.get(zodiac_sign, 'air')

@app.route('/api/v1/posts/<post_id>/react', methods=['POST'])
def add_post_reaction(post_id):
    """Add elemental or zodiac reaction to a post"""
    try:
        data = request.get_json()
        reaction_type = data.get('reaction_type')  # 'elemental' or 'zodiac'
        
        if reaction_type == 'elemental':
            element = data.get('element')  # 'fire', 'water', 'air', 'earth'
            
            # Log the elemental reaction
            logging.info(f"Elemental reaction: {element} on post {post_id}")
            
            # Emit real-time update to all connected clients
            socketio.emit('post_reaction', {
                'post_id': post_id,
                'reaction_type': 'elemental',
                'element': element,
                'timestamp': datetime.now().isoformat()
            })
            
            return jsonify({
                'success': True,
                'reaction_type': 'elemental',
                'element': element,
                'message': f'{element.title()} energy added to the cosmic feed!'
            })
            
        elif reaction_type == 'zodiac':
            zodiac = data.get('zodiac')  # User's zodiac sign
            action = data.get('action')  # Zodiac-specific action
            
            # Log the zodiac reaction
            logging.info(f"Zodiac reaction: {zodiac} {action} on post {post_id}")
            
            # Emit real-time update to all connected clients
            socketio.emit('post_reaction', {
                'post_id': post_id,
                'reaction_type': 'zodiac',
                'zodiac': zodiac,
                'action': action,
                'timestamp': datetime.now().isoformat()
            })
            
            return jsonify({
                'success': True,
                'reaction_type': 'zodiac',
                'zodiac': zodiac,
                'action': action,
                'message': f'{zodiac} {action} activated in the cosmic web!'
            })
            
        else:
            return jsonify({'error': 'Invalid reaction type'}), 400
            
    except Exception as e:
        logging.error(f"Error adding reaction: {e}")
        return jsonify({'error': 'Failed to add reaction'}), 500

@app.route('/api/v1/posts/<post_id>/reactions', methods=['GET'])
def get_post_reactions(post_id):
    """Get all reactions for a specific post"""
    try:
        # Mock reaction data - in production, query from database
        reactions = {
            'fire': random.randint(0, 50),
            'water': random.randint(0, 40),
            'air': random.randint(0, 35),
            'earth': random.randint(0, 45),
            'zodiac_specific': {}
        }
        
        # Add some zodiac-specific reactions
        zodiac_signs = ['Aries', 'Leo', 'Scorpio', 'Aquarius', 'Pisces']
        for sign in random.sample(zodiac_signs, random.randint(1, 3)):
            reactions['zodiac_specific'][sign] = random.randint(1, 15)
        
        return jsonify({
            'post_id': post_id,
            'reactions': reactions,
            'total_reactions': (
                reactions['fire'] + reactions['water'] + 
                reactions['air'] + reactions['earth'] +
                sum(reactions['zodiac_specific'].values())
            )
        })
        
    except Exception as e:
        logging.error(f"Error fetching reactions: {e}")
        return jsonify({'error': 'Failed to fetch reactions'}), 500

# WebSocket event for real-time reaction updates
@socketio.on('join_post')
def handle_join_post(data):
    """Join a post room for real-time reaction updates"""
    post_id = data.get('post_id')
    if post_id:
        join_room(f"post_{post_id}")
        emit('joined_post', {'post_id': post_id})
        logging.info(f"User joined post room: {post_id}")

@socketio.on('leave_post')
def handle_leave_post(data):
    """Leave a post room"""
    post_id = data.get('post_id')
    if post_id:
        leave_room(f"post_{post_id}")
        emit('left_post', {'post_id': post_id})
        logging.info(f"User left post room: {post_id}")

if __name__ == '__main__':
    print("🌟 Starting STAR Enhanced Backend with Real-Time Features...")
    print("🔮 WebSocket Support: Enabled")
    print("⚡ Real-Time Updates: Active")
    print("🎯 Personalized Feeds: Active")  
    print("🚀 Virtual Scrolling: Supported")
    print("🔍 Advanced Search: Available")
    print("🌌 Multi-Zodiac System: Complete")
    print("📡 Feed endpoint: http://localhost:5000/api/v1/feed")
    print("🔍 Search endpoint: http://localhost:5000/api/v1/search")
    print("🔮 Tarot endpoint: http://localhost:5000/api/v1/tarot/shared")
    print("🌟 Events endpoint: http://localhost:5000/api/v1/cosmic-events")
    print("❤️  Health check: http://localhost:5000/health")
    
    # Start cosmic event simulation
    simulate_cosmic_events()
    
    # Run with SocketIO
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)