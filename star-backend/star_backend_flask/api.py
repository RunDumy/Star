# Add new imports for notifications and chat
import json
import logging
import os
import random
import shutil
import subprocess
import tempfile
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
import redis
import requests
from agora_token_builder import Role_Attendee, Role_Publisher, RtcTokenBuilder
from flask import Blueprint, current_app, g, jsonify, request
from flask_socketio import SocketIO, emit, join_room
from marshmallow import Schema, ValidationError, fields

from .cosmos_db import get_cosmos_helper
from .enhanced_tarot_engine import EnhancedTarotEngine
from .main import (check_username_exists, create_user, get_user_by_username,
                   update_user_online_status)
from .oracle_engine import OccultOracleEngine
from .star_auth import token_required

# Chinese Zodiac Actions mapping for backend
CHINESE_ZODIAC_ACTIONS = {
    'Rat': {'like': 'Squeak', 'comment': 'Nibble', 'follow': 'Scamper', 'share': 'Gather'},
    'Ox': {'like': 'Moo', 'comment': 'Plow', 'follow': 'Tread', 'share': 'Carry'},
    'Tiger': {'like': 'Roar', 'comment': 'Pounce', 'follow': 'Stalk', 'share': 'Claim'},
    'Rabbit': {'like': 'Hop', 'comment': 'Bound', 'follow': 'Burrow', 'share': 'Nuzzle'},
    'Dragon': {'like': 'Bellow', 'comment': 'Soar', 'follow': 'Circle', 'share': 'Guard'},
    'Snake': {'like': 'Hiss', 'comment': 'Coil', 'follow': 'Slither', 'share': 'Shed'},
    'Horse': {'like': 'Neigh', 'comment': 'Gallop', 'follow': 'Trot', 'share': 'Prance'},
    'Goat': {'like': 'Bleat', 'comment': 'Graze', 'follow': 'Climb', 'share': 'Provide'},
    'Monkey': {'like': 'Chatter', 'comment': 'Swing', 'follow': 'Play', 'share': 'Discover'},
    'Rooster': {'like': 'Crow', 'comment': 'Peck', 'follow': 'Strut', 'share': 'Announce'},
    'Dog': {'like': 'Bark', 'comment': 'Fetch', 'follow': 'Guard', 'share': 'Protect'},
    'Pig': {'like': 'Oink', 'comment': 'Root', 'follow': 'Trot', 'share': 'Feast'},
}

# Western Zodiac Actions mapping for backend
WESTERN_ZODIAC_ACTIONS = {
    'Aries': {'like': 'Charge', 'comment': 'Spark', 'follow': 'Lead', 'share': 'Ignite'},
    'Taurus': {'like': 'Graze', 'comment': 'Root', 'follow': 'Tread', 'share': 'Sustain'},
    'Gemini': {'like': 'Chatter', 'comment': 'Flit', 'follow': 'Connect', 'share': 'Spread'},
    'Cancer': {'like': 'Nurture', 'comment': 'Embrace', 'follow': 'Guide', 'share': 'Shelter'},
    'Leo': {'like': 'Roar', 'comment': 'Shine', 'follow': 'Strut', 'share': 'Inspire'},
    'Virgo': {'like': 'Analyze', 'comment': 'Tidy', 'follow': 'Serve', 'share': 'Refine'},
    'Libra': {'like': 'Balance', 'comment': 'Harmonize', 'follow': 'Align', 'share': 'Share'},
    'Scorpio': {'like': 'Probe', 'comment': 'Sting', 'follow': 'Hunt', 'share': 'Transform'},
    'Sagittarius': {'like': 'Quest', 'comment': 'Aim', 'follow': 'Explore', 'share': 'Inspire'},
    'Capricorn': {'like': 'Plan', 'comment': 'Climb', 'follow': 'Build', 'share': 'Achieve'},
    'Aquarius': {'like': 'Innovate', 'comment': 'Spark', 'follow': 'Rebel', 'share': 'Enlighten'},
    'Pisces': {'like': 'Dream', 'comment': 'Flow', 'follow': 'Drift', 'share': 'Connect'},
}

# Combined Zodiac Actions for backend
ZODIAC_ACTIONS = {**CHINESE_ZODIAC_ACTIONS, **WESTERN_ZODIAC_ACTIONS}


def compress_and_generate_hls(video_file, post_id):
    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = os.path.join(temp_dir, video_file.filename)
        video_file.save(input_path)
        
        # Compress video
        compressed_path = os.path.join(temp_dir, f"compressed_{uuid.uuid4()}.mp4")
        hls_path = os.path.join(temp_dir, f"hls_{post_id}")
        os.makedirs(hls_path, exist_ok=True)
        hls_playlist = os.path.join(hls_path, "playlist.m3u8")
        
        # FFmpeg command for compression
        subprocess.run([
            'ffmpeg', '-i', input_path, '-vcodec', 'h264', '-acodec', 'aac',
            '-vf', 'scale=1280:720', '-b:v', '2M', '-b:a', '128k',
            compressed_path
        ], check=True)
        
        # Generate HLS playlist with multiple bitrates
        subprocess.run([
            'ffmpeg', '-i', compressed_path,
            '-hls_time', '10', '-hls_list_size', '0',
            '-hls_segment_filename', os.path.join(hls_path, 'segment_%03d.ts'),
            '-hls_base_url', f'posts/{post_id}/hls/',
            hls_playlist
        ], check=True)
        
        # Upload compressed video and HLS segments to Azure Blob Storage
        video_path = f"posts/{post_id}/video_{uuid.uuid4()}.mp4"
        with open(compressed_path, 'rb') as f:
            video_url = cosmos_helper.upload_blob(video_path, f.read(), 'video/mp4')
        
        # Upload HLS files
        hls_urls = []
        for file in os.listdir(hls_path):
            file_path = os.path.join(hls_path, file)
            blob_name = f"posts/{post_id}/hls/{file}"
            with open(file_path, 'rb') as f:
                content_type = 'application/vnd.apple.mpegurl' if file.endswith('.m3u8') else 'video/mp2t'
                url = cosmos_helper.upload_blob(blob_name, f.read(), content_type)
                if url:
                    hls_urls.append(url)
        
        playlist_url = cosmos_helper.get_blob_url(f"posts/{post_id}/hls/playlist.m3u8")
        return video_url, playlist_url

api_bp = Blueprint('api_bp', __name__)

# Initialize Cosmos DB helper
cosmos_helper = get_cosmos_helper()

# Initialize Socket.IO and Redis for real-time features
try:
    redis_client = redis.Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'), decode_responses=True)
    redis_client.ping()
    logging.info("Redis connected successfully")
    socketio = SocketIO(cors_allowed_origins="*", message_queue=os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
except Exception as e:
    logging.warning(f"Redis not available, using default Socket.IO: {e}")
    socketio = SocketIO(cors_allowed_origins="*")
    redis_client = None

@api_bp.route('/api/v1/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400

        username = data['username'].strip()
        password = data['password']

        # Check if username already exists
        if check_username_exists(username):
            return jsonify({'error': 'Username already exists'}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create user data
        user_data = {
            'id': str(uuid.uuid4()),
            'username': username,
            'password_hash': hashed_password,
            'zodiac_sign': data.get('zodiac_sign', ''),
            'chinese_zodiac': data.get('chinese_zodiac', ''),
            'vedic_zodiac': data.get('vedic_zodiac', ''),
            'bio': data.get('bio', ''),
            'full_name': data.get('full_name', ''),
            'birth_date': data.get('birth_date', ''),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'last_seen': datetime.now(timezone.utc).isoformat(),
            'is_online': False
        }

        # Create user in Cosmos DB
        create_user(user_data)

        # Generate JWT token
        token = jwt.encode({
            'user_id': user_data['id'],
            'username': username,
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }, current_app.config['JWT_SECRET_KEY'], algorithm=current_app.config['JWT_ALGORITHM'])

        return jsonify({
            'message': 'User registered successfully',
            'token': token
        }), 201

    except Exception as e:
        logging.error(f"Registration error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@api_bp.route('/api/v1/auth/register', methods=['POST'])
def cosmic_register():
    """Enhanced registration for cosmic awakening ritual"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'birthdate']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        username = data['username'].strip()
        email = data['email'].strip()
        password = data['password']
        birthdate = data['birthdate']
        zodiac_signs = data.get('zodiacSigns', {})
        archetype = data.get('archetype', {})

        # Check if username already exists
        if check_username_exists(username):
            return jsonify({'error': 'Username already exists'}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user_id = str(uuid.uuid4())

        # Create user data
        user_data = {
            'id': user_id,
            'username': username,
            'email': email,
            'password_hash': hashed_password,
            'birth_date': birthdate,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'last_seen': datetime.now(timezone.utc).isoformat(),
            'is_online': False,
            'onboarding_complete': True,
            'ritual_phase': 'complete'
        }

        # Create user in Cosmos DB
        create_user(user_data)

        # Create cosmic profile
        helper = get_cosmos_helper()
        profiles_container = helper.get_container('profiles')
        
        cosmic_profile = {
            'id': user_id,
            'userId': user_id,
            'zodiacSigns': zodiac_signs,
            'archetype': archetype,
            'numerology': zodiac_signs.get('numerology', {}),
            'elementalBalance': zodiac_signs.get('elementalBalance', {}),
            'badges': [],
            'sigils': [],
            'soundtrack': {
                'elementalPlaylist': f"{zodiac_signs.get('primaryElement', 'cosmic')}_ambient",
                'spotifyConnected': False
            },
            'onboardingComplete': True,
            'ritualPhase': 'cosmic_integration',
            'lastPlanet': 'Profile (Venus)',
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        profiles_container.create_item(cosmic_profile)

        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'username': username,
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }, current_app.config['JWT_SECRET_KEY'], algorithm=current_app.config['JWT_ALGORITHM'])

        return jsonify({
            'message': 'Cosmic profile created successfully',
            'token': token,
            'profile': cosmic_profile
        }), 201

    except Exception as e:
        logging.error(f"Cosmic registration error: {e}")
        return jsonify({'error': 'Cosmic registration failed'}), 500

@api_bp.route('/api/v1/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400

        username = data['username'].strip()
        password = data['password']

        # Get user by username
        user = get_user_by_username(username)
        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401

        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid username or password'}), 401

        # Update last seen
        update_user_online_status(user['username'], False)

        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'username': username,
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }, current_app.config['JWT_SECRET_KEY'], algorithm=current_app.config['JWT_ALGORITHM'])

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'username': username,
                'zodiac_sign': user['zodiac_sign']
            }
        }), 200

    except Exception as e:
        logging.error(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

# Zodiac Profile Endpoints - Enhanced for Cosmic Awakening Ritual
@api_bp.route('/api/v1/zodiac-calculator', methods=['POST'])
def zodiac_calculator():
    """Calculate zodiac signs across all 5 systems from birth date"""
    try:
        data = request.get_json()
        logging.info(f"Zodiac calculator received data: {data}")
        
        if data is None:
            return jsonify({'error': 'No JSON data received'}), 400
            
        birthdate = data.get('birthdate')
        birthtime = data.get('birthtime', '12:00')  # Optional birth time
        
        logging.info(f"Parsed birthdate: {birthdate}, birthtime: {birthtime}")
        
        if not birthdate:
            return jsonify({'error': 'Birth date required'}), 400
        
        import calendar
        from datetime import datetime
        
        date = datetime.strptime(birthdate, '%Y-%m-%d')
        day = date.day
        month = date.month
        year = date.year
        
        # Enhanced Western Zodiac calculation
        def get_western_zodiac(month, day):
            if (month == 3 and day >= 21) or (month == 4 and day <= 19):
                return 'aries'
            elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
                return 'taurus'
            elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
                return 'gemini'
            elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
                return 'cancer'
            elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
                return 'leo'
            elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
                return 'virgo'
            elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
                return 'libra'
            elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
                return 'scorpio'
            elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
                return 'sagittarius'
            elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
                return 'capricorn'
            elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
                return 'aquarius'
            else:  # (month == 2 and day >= 19) or (month == 3 and day <= 20)
                return 'pisces'
        
        # Chinese Zodiac calculation
        chinese_animals = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 
                          'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig']
        chinese = chinese_animals[(year - 1900) % 12]
        
        # Galactic Tone calculation (Mayan Tzolkin)
        # Days since Mayan correlation constant
        gregorian_offset = date.toordinal() - datetime(1900, 1, 1).toordinal()
        galactic_tone = ((gregorian_offset + 159) % 13) + 1  # More accurate calculation
        
        # Mayan Day Sign calculation (20 day signs)
        mayan_signs = ['imix', 'ik', 'akbal', 'kan', 'chicchan', 'cimi', 'manik', 'lamat', 
                      'muluc', 'oc', 'chuen', 'eb', 'ben', 'ix', 'men', 'cib', 'caban', 
                      'etznab', 'cauac', 'ahau']
        mayan_day_sign = mayan_signs[(gregorian_offset + 159) % 20]
        
        # Vedic/Sidereal calculation (simplified - 23-24 day offset from Western)
        # For precise Vedic calculation, would need birth time and location
        vedic_offset_days = -23  # Approximate ayanamsa
        vedic_date = date.replace(day=max(1, day + vedic_offset_days))
        vedic = get_western_zodiac(vedic_date.month, vedic_date.day)
        
        # Calculate numerology Life Path Number
        def calculate_life_path(birth_date):
            # Sum all digits in birth date
            date_str = birth_date.replace('-', '')
            total = sum(int(digit) for digit in date_str)
            
            # Reduce to single digit or master number
            while total > 9 and total not in [11, 22, 33]:
                total = sum(int(digit) for digit in str(total))
            
            return total
        
        life_path = calculate_life_path(birthdate)
        
        # Calculate elemental balance
        def get_element(sign):
            fire_signs = ['aries', 'leo', 'sagittarius']
            earth_signs = ['taurus', 'virgo', 'capricorn']
            air_signs = ['gemini', 'libra', 'aquarius']
            water_signs = ['cancer', 'scorpio', 'pisces']
            
            if sign in fire_signs:
                return 'fire'
            elif sign in earth_signs:
                return 'earth'
            elif sign in air_signs:
                return 'air'
            else:
                return 'water'
        
        western_element = get_element(get_western_zodiac(month, day))
        
        return jsonify({
            'western': get_western_zodiac(month, day),
            'chinese': chinese,
            'vedic': vedic,
            'mayan': mayan_day_sign,
            'galacticTone': galactic_tone,
            'numerology': {
                'lifePathNumber': life_path
            },
            'elementalBalance': {
                'fire': 25 if western_element == 'fire' else 0,
                'earth': 25 if western_element == 'earth' else 0,
                'air': 25 if western_element == 'air' else 0,
                'water': 25 if western_element == 'water' else 0
            },
            'primaryElement': western_element
        })
        
    except Exception as e:
        logging.error(f"Zodiac calculation error: {e}")
        return jsonify({'error': 'Calculation failed'}), 500


# Archetype System for Cosmic Awakening
@api_bp.route('/api/v1/archetype', methods=['GET', 'POST'])
def archetype_system():
    """Get archetype definitions or select user archetype"""
    try:
        if request.method == 'GET':
            # Return all available archetypes
            archetypes = {
                'seeker': {
                    'name': 'The Seeker',
                    'description': 'You quest for hidden knowledge and cosmic truth',
                    'traits': ['curious', 'introspective', 'philosophical', 'adventurous'],
                    'mentor': 'the_wandering_sage',
                    'rituals': ['meditation', 'journaling', 'stargazing', 'research'],
                    'element_affinity': ['air', 'fire'],
                    'zodiac_compatibility': ['gemini', 'sagittarius', 'aquarius'],
                    'life_path_affinity': [7, 11, 22]
                },
                'guardian': {
                    'name': 'The Guardian',
                    'description': 'You protect and nurture the cosmic order',
                    'traits': ['protective', 'nurturing', 'reliable', 'empathetic'],
                    'mentor': 'the_protective_mother',
                    'rituals': ['grounding', 'healing', 'community_service', 'protection_spells'],
                    'element_affinity': ['earth', 'water'],
                    'zodiac_compatibility': ['cancer', 'virgo', 'taurus'],
                    'life_path_affinity': [2, 6, 9]
                },
                'rebel': {
                    'name': 'The Rebel',
                    'description': 'You challenge boundaries and create new realities',
                    'traits': ['innovative', 'courageous', 'independent', 'transformative'],
                    'mentor': 'the_revolutionary_fire',
                    'rituals': ['activism', 'creativity', 'transformation', 'breakthrough'],
                    'element_affinity': ['fire', 'air'],
                    'zodiac_compatibility': ['aries', 'aquarius', 'leo'],
                    'life_path_affinity': [1, 5, 8]
                },
                'mystic': {
                    'name': 'The Mystic',
                    'description': 'You channel divine wisdom and spiritual insight',
                    'traits': ['intuitive', 'spiritual', 'perceptive', 'mysterious'],
                    'mentor': 'the_wise_serpent',
                    'rituals': ['tarot', 'meditation', 'shadow_work', 'divination'],
                    'element_affinity': ['water', 'earth'],
                    'zodiac_compatibility': ['scorpio', 'pisces', 'cancer'],
                    'life_path_affinity': [7, 9, 11]
                }
            }
            return jsonify(archetypes)
            
        else:  # POST - Select archetype for user
            data = request.get_json()
            user_id = data.get('user_id')
            archetype_key = data.get('archetype')
            zodiac_data = data.get('zodiac_signs', {})
            
            if not user_id or not archetype_key:
                return jsonify({'error': 'User ID and archetype required'}), 400
            
            # Store archetype selection in profiles container
            helper = get_cosmos_helper()
            profiles_container = helper.get_container('profiles')
            
            # Get or create profile
            try:
                profile = profiles_container.read_item(item=user_id, partition_key=user_id)
            except:
                profile = {
                    'id': user_id,
                    'userId': user_id,
                    'zodiacSigns': zodiac_data,
                    'onboardingComplete': False
                }
            
            # Add archetype data
            profile['archetype'] = {
                'primary': archetype_key,
                'selected_at': datetime.utcnow().isoformat()
            }
            profile['ritualPhase'] = 'archetypal_integration'
            
            # Upsert profile
            profiles_container.upsert_item(profile)
            
            return jsonify({
                'message': 'Archetype selected successfully',
                'profile': profile
            })
            
    except Exception as e:
        logging.error(f"Archetype system error: {e}")
        return jsonify({'error': 'Archetype operation failed'}), 500


# Sigil Generation System for Cosmic Awakening
@api_bp.route('/api/v1/sigils', methods=['GET', 'POST'])
def sigil_generation_system():
    """Generate personalized sigils combining zodiac and archetype data"""
    try:
        from sigil_generator import (generate_base_sigil,
                                     generate_sigil_variations)
        
        if request.method == 'GET':
            # Return sigil generation parameters and examples
            return jsonify({
                'zodiac_influences': {
                    'aries': {'pattern': 'sharp triangular', 'energy': 'dynamic'},
                    'taurus': {'pattern': 'grounded square', 'energy': 'stable'},
                    'gemini': {'pattern': 'dual hexagon', 'energy': 'communicative'},
                    'cancer': {'pattern': 'protective spiral', 'energy': 'nurturing'},
                    'leo': {'pattern': 'radiant pentagon', 'energy': 'dramatic'},
                    'virgo': {'pattern': 'precise hexagon', 'energy': 'analytical'},
                    'libra': {'pattern': 'balanced symmetry', 'energy': 'harmonious'},
                    'scorpio': {'pattern': 'intense spiral', 'energy': 'transformative'},
                    'sagittarius': {'pattern': 'arrow triangle', 'energy': 'adventurous'},
                    'capricorn': {'pattern': 'mountain structure', 'energy': 'ambitious'},
                    'aquarius': {'pattern': 'wave innovation', 'energy': 'revolutionary'},
                    'pisces': {'pattern': 'fluid flow', 'energy': 'intuitive'}
                },
                'archetype_modifiers': {
                    'seeker': {'scale': 1.2, 'complexity': 'open', 'energy': 'exploring'},
                    'guardian': {'scale': 0.9, 'complexity': 'protective', 'energy': 'stabilizing'},
                    'rebel': {'scale': 1.4, 'complexity': 'dynamic', 'energy': 'transforming'},
                    'mystic': {'scale': 1.1, 'complexity': 'deep', 'energy': 'channeling'}
                }
            })
            
        else:  # POST - Generate sigil for user
            data = request.get_json()
            user_id = data.get('user_id')
            zodiac_signs = data.get('zodiac_signs', {})
            archetype = data.get('archetype')
            variation_count = data.get('variations', 3)
            
            if not user_id or not zodiac_signs or not archetype:
                return jsonify({'error': 'User ID, zodiac signs, and archetype required'}), 400
            
            # Use Western zodiac as primary for sigil generation
            primary_zodiac = zodiac_signs.get('western', 'scorpio')
            
            # Generate base sigil
            base_sigil = generate_base_sigil(primary_zodiac, archetype, user_id)
            
            # Generate variations
            sigil_variations = generate_sigil_variations(base_sigil, variation_count)
            
            # Store sigils in profiles container
            helper = get_cosmos_helper()
            profiles_container = helper.get_container('profiles')
            
            # Update user profile with sigil options
            try:
                profile = profiles_container.read_item(item=user_id, partition_key=user_id)
            except:
                profile = {
                    'id': user_id,
                    'userId': user_id,
                    'zodiacSigns': zodiac_signs,
                    'archetype': {'primary': archetype},
                    'onboardingComplete': False
                }
            
            # Add sigil data to profile
            profile['sigilOptions'] = sigil_variations
            profile['ritualPhase'] = 'sigil_selection'
            
            # Upsert profile
            profiles_container.upsert_item(profile)
            
            return jsonify({
                'message': 'Sigils generated successfully',
                'sigils': sigil_variations,
                'primary_zodiac': primary_zodiac,
                'archetype': archetype,
                'elemental_influence': sigil_variations[0]['metadata']['element']
            })
            
    except Exception as e:
        logging.error(f"Sigil generation error: {e}")
        return jsonify({'error': 'Sigil generation failed'}), 500


@api_bp.route('/api/v1/sigils/select', methods=['POST'])
def select_user_sigil():
    """Allow user to select their preferred sigil from generated options"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        sigil_id = data.get('sigil_id')
        
        if not user_id or not sigil_id:
            return jsonify({'error': 'User ID and sigil ID required'}), 400
        
        helper = get_cosmos_helper()
        profiles_container = helper.get_container('profiles')
        
        # Get user profile
        try:
            profile = profiles_container.read_item(item=user_id, partition_key=user_id)
        except:
            return jsonify({'error': 'Profile not found'}), 404
        
        # Find selected sigil from options
        selected_sigil = None
        for sigil in profile.get('sigilOptions', []):
            if sigil['id'] == sigil_id:
                selected_sigil = sigil
                break
        
        if not selected_sigil:
            return jsonify({'error': 'Sigil not found'}), 404
        
        # Update profile with selected sigil
        profile['selectedSigil'] = selected_sigil
        profile['ritualPhase'] = 'profile_customization'
        
        # Clean up sigil options to save space
        profile['sigilOptions'] = []
        
        # Upsert profile
        profiles_container.upsert_item(profile)
        
        return jsonify({
            'message': 'Sigil selected successfully',
            'sigil': selected_sigil
        })
        
    except Exception as e:
        logging.error(f"Sigil selection error: {e}")
        return jsonify({'error': 'Sigil selection failed'}), 500

@api_bp.route('/api/v1/user/profile', methods=['GET', 'PUT'])
@token_required
def user_profile(current_user):
    """Get or update user profile"""
    try:
        cosmos_helper = get_cosmos_helper()
        
        if request.method == 'PUT':
            data = request.get_json()
            user_id = current_user['id']
            
            # Update user profile
            user_data = cosmos_helper.get_user(user_id)
            if not user_data:
                return jsonify({'error': 'User not found'}), 404
            
            # Update allowed fields
            allowed_fields = ['avatar', 'background', 'bio', 'zodiac_sign', 'chinese_zodiac']
            for field in allowed_fields:
                if field in data:
                    user_data[field] = data[field]
            
            user_data['updated_at'] = datetime.now(timezone.utc).isoformat()
            cosmos_helper.update_user(user_data)
            
            return jsonify({'status': 'Profile updated successfully'})
        
        # GET request - return profile
        user_data = current_user
        cosmic_dna = generate_cosmic_dna(user_data.get('zodiac_sign', 'Scorpio'))
        
        return jsonify({
            'username': user_data.get('username'),
            'zodiac': user_data.get('zodiac_sign', 'Scorpio'),
            'chinese_zodiac': user_data.get('chinese_zodiac', 'Dragon'),
            'galactic_tone': user_data.get('galactic_tone', 1),
            'cosmic_dna': cosmic_dna,
            'avatar': user_data.get('avatar', f"/assets/{user_data.get('zodiac_sign', 'scorpio').lower()}_avatar.png"),
            'background': user_data.get('background', f"/assets/{user_data.get('zodiac_sign', 'scorpio').lower()}_bg.jpg"),
            'bio': user_data.get('bio', '')
        })
        
    except Exception as e:
        logging.error(f"Profile error: {e}")
        return jsonify({'error': 'Profile operation failed'}), 500

@api_bp.route('/api/v1/daily-features', methods=['GET'])
@token_required
def daily_features(current_user):
    """Get daily zodiac features"""
    try:
        zodiac = current_user.get('zodiac_sign', 'Scorpio')
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
        logging.error(f"Daily features error: {e}")
        return jsonify({'error': 'Failed to get daily features'}), 500

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

# Mock tarot card mapping
TAROT_TRAIT_MAP = {
    "The Emperor": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.2},
    "The Star": {"trait_name": "Creativity", "zodiac_sign": "Leo", "strength_boost": 0.15},
    "The Hermit": {"trait_name": "Precision", "zodiac_sign": "Virgo", "strength_boost": 0.18},
    "Justice": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.17}
}

# Expanded transit mapping to traits
TRANSIT_TRAIT_MAP = {
    "Mars in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.25},
    "Sun in Leo": {"trait_name": "Creativity", "zodiac_sign": "Leo", "strength_boost": 0.2},
    "Mercury in Virgo": {"trait_name": "Precision", "zodiac_sign": "Virgo", "strength_boost": 0.22},
    "Venus in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.2},
    "Jupiter in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.3},
    "Moon in Pisces": {"trait_name": "Creativity", "zodiac_sign": "Pisces", "strength_boost": 0.15},
    "Saturn in Virgo": {"trait_name": "Precision", "zodiac_sign": "Virgo", "strength_boost": 0.25},
    "Neptune in Pisces": {"trait_name": "Creativity", "zodiac_sign": "Pisces", "strength_boost": 0.18},
    "Mars in Scorpio": {"trait_name": "Courage", "zodiac_sign": "Scorpio", "strength_boost": 0.22},
    "Sun in Gemini": {"trait_name": "Creativity", "zodiac_sign": "Gemini", "strength_boost": 0.17},
    "Mercury in Gemini": {"trait_name": "Precision", "zodiac_sign": "Gemini", "strength_boost": 0.2},
    "Venus in Cancer": {"trait_name": "Harmony", "zodiac_sign": "Cancer", "strength_boost": 0.18},
    "Moon in Cancer": {"trait_name": "Harmony", "zodiac_sign": "Cancer", "strength_boost": 0.15},
    "Jupiter in Scorpio": {"trait_name": "Courage", "zodiac_sign": "Scorpio", "strength_boost": 0.2},
    "Saturn in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.18},
    "Neptune in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.17},
    "Uranus in Gemini": {"trait_name": "Creativity", "zodiac_sign": "Gemini", "strength_boost": 0.2},
    "Uranus in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.22},
    "Uranus in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.18},
    "Uranus in Scorpio": {"trait_name": "Precision", "zodiac_sign": "Scorpio", "strength_boost": 0.19},
    "Pluto in Scorpio": {"trait_name": "Courage", "zodiac_sign": "Scorpio", "strength_boost": 0.25},
    "Pluto in Libra": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.2},
    "Pluto in Gemini": {"trait_name": "Precision", "zodiac_sign": "Gemini", "strength_boost": 0.18},
    "Pluto in Aries": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.23}
}

# Mood mapping based on traits and interactions
MOOD_MAP = {
    "Courage": "Passionate",
    "Creativity": "Curious",
    "Precision": "Reflective",
    "Harmony": "Serene"
}

@api_bp.route('/api/v1/spotify/token', methods=['POST'])
@token_required
def spotify_token():
    data = request.get_json()
    code = data.get('code')
    code_verifier = data.get('code_verifier')
    user_id = g.user['sub']
    
    if not code or not code_verifier:
        return jsonify({'error': 'Missing code or code_verifier'}), 400

    try:
        token_response = requests.post(
            'https://accounts.spotify.com/api/token',
            data={
                'client_id': os.getenv('SPOTIFY_CLIENT_ID'),
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': os.getenv('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/api/auth/callback/spotify'),
                'code_verifier': code_verifier,
            }
        ).json()

        if 'access_token' in token_response:
            cosmos_helper.update_profile(user_id, {
                'spotify_access_token': token_response['access_token'],
                'spotify_refresh_token': token_response.get('refresh_token'),
                'spotify_token_expires': token_response.get('expires_in'),
            })
            return jsonify({'success': True, 'access_token': token_response['access_token']})
        else:
            return jsonify({'error': 'Token exchange failed', 'details': token_response.get('error')}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/posts', methods=['GET'])
@token_required
def get_posts():
    try:
        # Get pagination parameters from query string
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Fetch posts with pagination
        posts = cosmos_helper.get_posts(limit=limit, offset=offset)

        # Enrich posts with additional data
        for post in posts:
            # Get likes count
            post['like_count'] = cosmos_helper.get_likes_count(post['id'])
            # Check if user liked this post
            post['liked_by_user'] = cosmos_helper.check_like_exists(post['id'], g.user['sub'])
            # Get comments for this post
            comments = cosmos_helper.get_comments_for_post(post['id'])
            # Enrich comments with user display names
            for comment in comments:
                profile = cosmos_helper.get_profile_by_user_id(comment['user_id'])
                comment['display_name'] = profile.get('display_name', 'Cosmic Traveler') if profile else 'Cosmic Traveler'
            post['comments'] = comments

            # Get user profile for post author
            profile = cosmos_helper.get_profile_by_user_id(post['user_id'])
            post['display_name'] = profile.get('display_name', 'Cosmic Traveler') if profile else 'Cosmic Traveler'

        return jsonify({'posts': posts})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/posts', methods=['POST'])
@token_required
def create_post():
    data = request.form
    content = data.get('content', '').strip()
    image_file = request.files.get('image')
    video_file = request.files.get('video')
    tags = data.get('tags', '').split(',')
    user_id = g.user['sub']

    if not content and not image_file and not video_file:
        return jsonify({'success': False, 'error': 'Content, image, or video required'}), 400

    try:
        # Fetch user's zodiac sign
        profile = cosmos_helper.get_profile_by_user_id(user_id)
        zodiac_sign = profile.get('zodiac_sign', 'Aries') if profile else 'Aries'

        post_data = {
            'user_id': user_id,
            'content': content,
            'zodiac_sign': zodiac_sign
        }

        # TODO: Implement Azure Blob Storage for media uploads
        # For now, skip media uploads until Azure Blob Storage is configured
        if image_file:
            # Generate unique filename
            image_filename = f"posts/{uuid.uuid4()}/image_{uuid.uuid4()}.{image_file.filename.split('.')[-1]}"
            # Upload to Azure Blob Storage
            image_url = cosmos_helper.upload_blob(image_filename, image_file.read(), content_type=image_file.content_type)
            if image_url:
                post_data['image_url'] = image_url

        if video_file:
            # Generate unique filename
            video_filename = f"posts/{uuid.uuid4()}/video_{uuid.uuid4()}.{video_file.filename.split('.')[-1]}"
            # Upload to Azure Blob Storage
            video_url = cosmos_helper.upload_blob(video_filename, video_file.read(), content_type=video_file.content_type)
            if video_url:
                post_data['video_url'] = video_url

        # Create post
        post_data['id'] = str(uuid.uuid4())
        post_data['created_at'] = datetime.now(timezone.utc).isoformat()
        created_post = cosmos_helper.create_post(post_data)
        post_id = created_post['id']

        # Store tags
        for tag in tags:
            if tag.strip():
                cosmos_helper.create_post_tag({
                    'id': str(uuid.uuid4()),
                    'post_id': post_id,
                    'tag': tag.strip()
                })

        # TODO: Implement follower notifications with Azure services
        # For now, skip notifications until follower query is implemented
        # followers = cosmos_helper.get_followers(user_id)
        # for follower in followers:
        #     notification = {
        #         'id': str(uuid.uuid4()),
        #         'user_id': follower['follower_id'],
        #         'message': f"{zodiac_sign} created a new post!",
        #         'type': 'post',
        #         'related_id': post_id,
        #         'created_at': datetime.now(timezone.utc).isoformat(),
        #         'is_read': False
        #     }
        #     cosmos_helper.create_notification(notification)
        #     socketio.emit('notification', notification, room=f"user_{follower['follower_id']}")

        return jsonify({'success': True, 'post': created_post})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/posts/<int:post_id>/like', methods=['POST'])
@token_required
def like_post(post_id):
    user_id = g.user['sub']
    try:
        # Check if already liked
        if cosmos_helper.check_like_exists(str(post_id), user_id):
            # Unlike
            cosmos_helper.delete_like(str(post_id), user_id)
            return jsonify({'success': True, 'liked': False})
        else:
            # Like
            cosmos_helper.create_like({
                'id': str(uuid.uuid4()),
                'post_id': str(post_id),
                'user_id': user_id
            })
            return jsonify({'success': True, 'liked': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/posts/<int:post_id>/comment', methods=['POST'])
@token_required
def comment_post(post_id):
    data = request.get_json()
    content = data.get('content')
    user_id = g.user['sub']

    if not content:
        return jsonify({'error': 'Comment content is required'}), 400

    try:
        comment_data = {
            'id': str(uuid.uuid4()),
            'post_id': str(post_id),
            'user_id': user_id,
            'content': content,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        created_comment = cosmos_helper.create_comment(comment_data)
        return jsonify({'success': True, 'comment': created_comment})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/comments/<string:post_id>', methods=['GET'])
@token_required
def get_comments(current_user, post_id):
    page = int(request.args.get('page', 1))
    per_page = 20
    comments = cosmos_helper.get_comments(post_id, page=page, per_page=per_page)
    return jsonify({'comments': comments}), 200

@api_bp.route("/api/v1/zodiac-dna", methods=["POST"])
@token_required
def update_dna(current_user):
    data = request.get_json()
    trait_name = data.get("trait_name")
    zodiac_sign = data.get("zodiac_sign")
    strength = data.get("strength")
    if not all([trait_name, zodiac_sign, strength]):
        return jsonify({"success": False, "error": "Trait name, zodiac sign, and strength required"}), 400
    cosmos_helper.upsert_zodiac_dna({
        "user_id": current_user.id,
        "trait_name": trait_name,
        "zodiac_sign": zodiac_sign,
        "strength": strength
    })
    return jsonify({"success": True, "message": "DNA updated"})

@api_bp.route("/api/v1/zodiac-dna", methods=["GET"])
@token_required
def get_dna(current_user):
    dna_result = cosmos_helper.get_zodiac_dna_by_user(current_user.id)
    dna = dna_result['data'] if dna_result['data'] else []
    return jsonify({"success": True, "dna": dna})

@api_bp.route("/api/v1/transit", methods=["GET"])
@token_required
def get_transit(current_user):
    transit = random.choice(list(TRANSIT_TRAIT_MAP.keys()))
    trait = TRANSIT_TRAIT_MAP[transit]
    
    # Fetch current DNA
    dna_result = cosmos_helper.get_zodiac_dna_by_trait(current_user.id, trait["trait_name"])
    current_strength = dna_result['data']['strength'] if dna_result['data'] else 0.5
    new_strength = min(current_strength + trait["strength_boost"], 1.0)

    # Update DNA
    cosmos_helper.upsert_zodiac_dna({
        "user_id": current_user.id,
        "trait_name": trait["trait_name"],
        "zodiac_sign": trait["zodiac_sign"],
        "strength": new_strength
    })

    # Log interaction
    cosmos_helper.create_user_interaction({
        "user_id": current_user.id,
        "interaction_type": "transit_view",
        "zodiac_sign": trait["zodiac_sign"],
        "details": {"transit": transit, "timestamp": datetime.now(timezone.utc).isoformat()}
    })
    
    return jsonify({
        "success": True, 
        "transit": transit, 
        "trait": trait["trait_name"], 
        "strength": new_strength,
        "zodiac_sign": trait["zodiac_sign"]
    })

@api_bp.route("/api/v1/tarot-pull", methods=["POST"])
@token_required
def tarot_pull(current_user):
    card = random.choice(list(TAROT_TRAIT_MAP.keys()))
    trait = TAROT_TRAIT_MAP[card]
    
    dna = cosmos_helper.get_zodiac_dna_by_user_and_trait(current_user.id, trait["trait_name"])
    current_strength = dna.get("strength", 0.5) if dna else 0.5
    new_strength = min(current_strength + trait["strength_boost"], 1.0)
    
    cosmos_helper.upsert_zodiac_dna({
        "user_id": current_user.id,
        "trait_name": trait["trait_name"],
        "zodiac_sign": trait["zodiac_sign"],
        "strength": new_strength
    })
    
    cosmos_helper.create_user_interaction({
        "user_id": current_user.id,
        "interaction_type": "tarot_pull",
        "zodiac_sign": trait["zodiac_sign"],
        "details": {"card": card}
    })
    
    return jsonify({"success": True, "card": card, "trait": trait["trait_name"], "strength": new_strength})

@api_bp.route("/api/v1/transit-mappings", methods=["GET"])
@token_required
def get_transit_mappings(current_user):
    """Return all available transit mappings for frontend reference"""
    return jsonify({"success": True, "mappings": TRANSIT_TRAIT_MAP})

@api_bp.route("/api/v1/timeline", methods=["GET"])
@token_required
def get_timeline(current_user):
    interactions_result = cosmos_helper.get_user_interactions(current_user.id, limit=10)
    interactions = interactions_result['data'] if interactions_result['data'] else []
    timeline = [
        {
            "id": interaction["id"],
            "type": interaction["interaction_type"],
            "zodiac_sign": interaction["zodiac_sign"],
            "details": interaction["details"],
            "timestamp": interaction["created_at"]
        } for interaction in interactions
    ]
    return jsonify({"success": True, "timeline": timeline})

@api_bp.route("/api/v1/interactions", methods=["POST"])
@token_required
def log_interaction(current_user):
    data = request.get_json()
    interaction_type = data.get("interaction_type")
    zodiac_sign = data.get("zodiac_sign")
    details = data.get("details", {})
    if not interaction_type:
        return jsonify({"success": False, "error": "Interaction type required"}), 400
    cosmos_helper.create_user_interaction({
        "user_id": current_user.id,
        "interaction_type": interaction_type,
        "zodiac_sign": zodiac_sign,
        "details": details
    })
    return jsonify({"success": True})

@api_bp.route("/api/v1/mood", methods=["GET"])
@token_required
def get_mood(current_user):
    interactions_result = cosmos_helper.get_user_interactions(current_user.id, limit=10)
    interactions = interactions_result['data'] if interactions_result['data'] else []
    if not interactions:
        return jsonify({"success": True, "mood": "Neutral", "intensity": 0.5})

    # Calculate mood based on interaction types and traits
    trait_counts = {"Courage": 0, "Creativity": 0, "Precision": 0, "Harmony": 0}
    for interaction in interactions:
        trait = None
        if interaction["interaction_type"] == "tarot_pull":
            card = interaction["details"].get("card")
            trait = TAROT_TRAIT_MAP.get(card, {}).get("trait_name")
        elif interaction["interaction_type"] == "transit_view":
            transit = interaction["details"].get("transit")
            trait = TRANSIT_TRAIT_MAP.get(transit, {}).get("trait_name")
        elif interaction["interaction_type"] == "trail_click":
            zodiac_sign = interaction["zodiac_sign"]
            for transit in TRANSIT_TRAIT_MAP.values():
                if transit["zodiac_sign"] == zodiac_sign:
                    trait = transit["trait_name"]
                    break
        if trait:
            trait_counts[trait] += 1

    # Determine dominant trait and map to mood
    dominant_trait = max(trait_counts, key=trait_counts.get)
    mood = MOOD_MAP.get(dominant_trait, "Neutral")
    intensity = min(trait_counts[dominant_trait] / 10.0 + 0.5, 1.0)

    # Log mood interaction
    cosmos_helper.create_user_interaction({
        "user_id": current_user.id,
        "interaction_type": "mood_view",
        "zodiac_sign": None,
        "details": {"mood": mood, "intensity": intensity, "timestamp": datetime.now(timezone.utc).isoformat()}
    })

    return jsonify({"success": True, "mood": mood, "intensity": intensity})

@api_bp.route("/api/v1/action", methods=["POST"])
@token_required
def trigger_user_action(current_user):
    """Trigger a user action and emit zodiac-themed notification"""
    try:
        data = request.get_json()
        action_type = data.get('action_type')  # 'like', 'comment', 'follow', 'share'
        room = data.get('room', 'cosmos')

        if not action_type or action_type not in ['like', 'comment', 'follow', 'share']:
            return jsonify({"success": False, "error": "Valid action_type required"}), 400

        # Get user's chinese zodiac sign
        cosmos_helper = get_cosmos_helper()
        user_query = "SELECT * FROM users WHERE id = @user_id"
        users = cosmos_helper.query_items(user_query, parameters=[{"name": "@user_id", "value": current_user.id}])

        if not users:
            return jsonify({"success": False, "error": "User not found"}), 404

        user = users[0]
        chinese_zodiac = user.get('chinese_zodiac', 'Rat')
        western_zodiac = user.get('western_zodiac')

        # Determine which zodiac system to use (prefer Western if available)
        zodiac_sign = western_zodiac if western_zodiac else chinese_zodiac
        zodiac_actions = WESTERN_ZODIAC_ACTIONS if western_zodiac else CHINESE_ZODIAC_ACTIONS

        # Get the zodiac action
        action = zodiac_actions.get(zodiac_sign, {}).get(action_type, action_type)

        # Emit action notification
        socketio.emit('action_notification', {
            'user_id': current_user.id,
            'username': user.get('username', 'Unknown'),
            'action': action,
            'action_type': action_type,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }, room=room)

        return jsonify({
            "success": True,
            "action": action,
            "zodiac": zodiac_sign,
            "zodiac_system": "western" if western_zodiac else "chinese",
            "message": f"{user.get('username')} performed {action}"
        })

    except Exception as e:
        logging.error(f"Error triggering user action: {e}")
        return jsonify({"success": False, "error": "Internal server error"}), 500

# New endpoints for notifications and live stream chat

@api_bp.route('/api/v1/live-stream', methods=['POST'])
@token_required
def create_live_stream():
    data = request.get_json()
    stream_title = data.get('title', 'Live Cosmic Stream').strip()
    user_id = g.user['sub']

    if not stream_title:
        return jsonify({'success': False, 'error': 'Stream title required'}), 400

    try:
        # Fetch user's zodiac sign
        profile = cosmos_helper.get_profile_by_user_id(user_id)
        zodiac_sign = profile.get('zodiac_sign', 'Aries') if profile else 'Aries'
        username = profile.get('display_name', 'Cosmic Traveler') if profile else 'Cosmic Traveler'

        stream_id = str(uuid.uuid4())
        channel_name = f"stream_{stream_id}"

        # Generate real AgoraRTC token
        agora_app_id = os.environ.get('AGORA_APP_ID')
        agora_app_certificate = os.environ.get('AGORA_APP_CERTIFICATE')

        if not agora_app_id or not agora_app_certificate:
            return jsonify({'success': False, 'error': 'AgoraRTC configuration missing'}), 500

        # Token valid for 24 hours
        expiration_time = int((datetime.now(timezone.utc) + timedelta(hours=24)).timestamp())
        agora_token = RtcTokenBuilder.buildTokenWithUid(
            agora_app_id,
            agora_app_certificate,
            channel_name,
            0,  # uid 0 for publisher
            Role_Publisher,
            expiration_time
        )

        stream = {
            'id': stream_id,
            'user_id': user_id,
            'title': stream_title,
            'channel_name': channel_name,
            'agora_token': agora_token,
            'zodiac_sign': zodiac_sign,
            'username': username,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'is_active': True
        }

        cosmos_helper.create_live_stream(stream)
        if redis_client:
            redis_client.setex(f"stream_{stream_id}", 7200, json.dumps(stream))  # 2 hour expiry with full stream data

        socketio.emit('live_stream_started', stream)

        # Notify followers
        followers_result = cosmos_helper.get_followers(user_id)
        followers = followers_result['data'] if followers_result['data'] else []
        for follower in followers:
            notification = {
                'id': str(uuid.uuid4()),
                'user_id': follower['follower_id'],
                'message': f"{zodiac_sign} is live now!",
                'type': 'live_stream',
                'related_id': stream_id,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'is_read': False
            }
            cosmos_helper.create_notification(notification)
            socketio.emit('notification', notification, room=f"user_{follower['follower_id']}")

        return jsonify({'success': True, 'message': 'Live stream created', 'stream': stream}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/live-stream/<stream_id>', methods=['GET'])
@token_required
def get_live_stream(stream_id):
    try:
        # Check Redis cache first
        cache_key = f"stream_{stream_id}"
        if redis_client:
            cached_stream = redis_client.get(cache_key)
            if cached_stream:
                return jsonify({'success': True, 'stream': json.loads(cached_stream)}), 200

        # Fetch from Cosmos DB if not in cache
        stream_result = cosmos_helper.get_active_live_stream(stream_id)
        if stream_result['data']:
            stream_data = stream_result['data']
            # Cache the stream data for 5 minutes
            if redis_client:
                redis_client.setex(cache_key, 300, json.dumps(stream_data))
            return jsonify({'success': True, 'stream': stream_data}), 200
            # Cache the stream data for 5 minutes
            if redis_client:
                redis_client.setex(cache_key, 300, json.dumps(stream_data))
            return jsonify({'success': True, 'stream': stream_data}), 200

        return jsonify({'success': False, 'error': 'Stream not found or inactive'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/live-stream/<stream_id>/end', methods=['POST'])
@token_required
def end_live_stream(stream_id):
    user_id = g.user['sub']
    try:
        # Verify stream ownership
        container = cosmos_helper._get_container('streams')
        if container:
            query = f"SELECT * FROM c WHERE c.id = '{stream_id}' AND c.user_id = '{user_id}'"
            items = list(container.query_items(query=query, enable_cross_partition_query=True))
            if not items:
                return jsonify({'success': False, 'error': 'Stream not found or unauthorized'}), 404

        cosmos_helper.end_live_stream(stream_id, user_id)
        if redis_client:
            redis_client.delete(f"stream_{stream_id}")
        socketio.emit('live_stream_ended', {'stream_id': stream_id})
        return jsonify({'success': True, 'message': 'Live stream ended'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/live-streams', methods=['GET'])
@token_required
def get_live_streams():
    try:
        # Check Redis cache first
        cache_key = "active_live_streams"
        if redis_client:
            cached_streams = redis_client.get(cache_key)
            if cached_streams:
                return jsonify({'success': True, 'streams': json.loads(cached_streams)}), 200

        # Fetch active live streams from Cosmos DB
        streams = cosmos_helper.get_active_live_streams()

        # Cache the result for 30 seconds
        if redis_client and streams:
            redis_client.setex(cache_key, 30, json.dumps(streams))

        return jsonify({'success': True, 'streams': streams or []}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/notifications', methods=['GET'])
@token_required
def get_notifications():
    user_id = g.user['sub']
    try:
        notifications = cosmos_helper.get_notifications(user_id, limit=50)
        return jsonify({'success': True, 'notifications': notifications}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/notifications/<notification_id>/read', methods=['POST'])
@token_required
def mark_notification_read(notification_id):
    user_id = g.user['sub']
    try:
        notification = cosmos_helper.get_notification_by_id(notification_id, user_id)
        if not notification:
            return jsonify({'success': False, 'error': 'Notification not found or unauthorized'}), 404

        cosmos_helper.update_notification(notification_id, {'is_read': True})
        return jsonify({'success': True, 'message': 'Notification marked as read'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/stream-chat/<stream_id>', methods=['POST'])
@token_required
def send_stream_chat(stream_id):
    data = request.get_json()
    message = data.get('message', '').strip()
    user_id = g.user['sub']

    if not message:
        return jsonify({'success': False, 'error': 'Message required'}), 400

    try:
        # Verify stream exists and is active
        stream = cosmos_helper.get_active_live_stream_by_id(stream_id)
        if not stream:
            return jsonify({'success': False, 'error': 'Stream not found or inactive'}), 404

        # Fetch user profile
        profile = cosmos_helper.get_profile_by_user_id(user_id)
        zodiac_sign = profile.get('zodiac_sign', 'Unknown') if profile else 'Unknown'
        username = profile.get('display_name', 'Cosmic Traveler') if profile else 'Cosmic Traveler'

        chat = {
            'id': str(uuid.uuid4()),
            'stream_id': stream_id,
            'user_id': user_id,
            'username': username,
            'zodiac_sign': zodiac_sign,
            'message': message,
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        cosmos_helper.create_stream_chat_message(chat)
        socketio.emit('stream_chat_message', chat, room=f'stream_{stream_id}')
        return jsonify({'success': True, 'message': 'Chat message sent', 'chat': chat}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Occult Oracle AI Endpoints
oracle_engine = OccultOracleEngine()

@api_bp.route('/api/oracle/natal-chart', methods=['POST'])
@token_required
def get_natal_chart():
    """Generate a natal chart for the authenticated user"""
    try:
        data = request.get_json()
        birth_date = data.get('birth_date')  # ISO format: YYYY-MM-DD
        birth_time = data.get('birth_time')  # HH:MM format
        birth_place = data.get('birth_place')  # City, Country

        if not all([birth_date, birth_time, birth_place]):
            return jsonify({'error': 'Missing required fields: birth_date, birth_time, birth_place'}), 400

        # Parse birth datetime
        from datetime import datetime
        birth_datetime = datetime.fromisoformat(f"{birth_date}T{birth_time}")

        # Generate natal chart
        natal_chart = oracle_engine.calculate_natal_chart(birth_datetime, birth_place)

        return jsonify({
            'success': True,
            'natal_chart': natal_chart.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/oracle/tarot-reading', methods=['POST'])
@token_required
def get_tarot_reading():
    """Get a tarot reading for the authenticated user"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        spread_type = data.get('spread_type', 'single')  # single, three, celtic_cross

        # Draw cards based on spread type
        if spread_type == 'single':
            cards = oracle_engine.draw_tarot_cards(1)
        elif spread_type == 'three':
            cards = oracle_engine.draw_tarot_cards(3)
        elif spread_type == 'celtic_cross':
            cards = oracle_engine.draw_tarot_cards(10)
        else:
            return jsonify({'error': 'Invalid spread_type. Use: single, three, celtic_cross'}), 400

        # Get insights
        insights = oracle_engine.get_tarot_insights(cards, question)

        return jsonify({
            'success': True,
            'cards': [card.to_dict() for card in cards],
            'insights': insights,
            'question': question
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Weekly Tarot and Sharing Endpoints
@api_bp.route('/api/v1/tarot/weekly', methods=['GET'])
@token_required
def weekly_tarot(current_user):
    """Get weekly tarot reading"""
    try:
        user_id = current_user['id']
        cosmos_helper = get_cosmos_helper()
        
        # Calculate week start (Monday)
        today = datetime.now(timezone.utc)
        week_start = today - timedelta(days=today.weekday())
        week_start_str = week_start.strftime('%Y-%m-%d')
        
        # Check if user already has a weekly reading
        try:
            # Mock weekly reading for now - in production, store in Cosmos DB
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
            logging.error(f"Weekly tarot error: {e}")
            return jsonify({'error': 'Failed to generate weekly reading'}), 500
            
    except Exception as e:
        logging.error(f"Weekly tarot endpoint error: {e}")
        return jsonify({'error': 'Service unavailable'}), 500

@api_bp.route('/api/v1/share-reading', methods=['POST'])
@token_required  
def share_reading(current_user):
    """Share a tarot reading to profile or feed"""
    try:
        data = request.get_json()
        reading_id = data.get('reading_id')
        share_to = data.get('share_to', 'profile')  # profile or feed
        
        if not reading_id:
            return jsonify({'error': 'Reading ID required'}), 400
            
        user_id = current_user['id']
        username = current_user.get('username', 'Unknown')
        zodiac = current_user.get('zodiac_sign', 'Scorpio')
        
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
        
        # In production, save to Cosmos DB shared_readings container
        logging.info(f"Tarot reading shared: {shared_reading['id']}")
        
        return jsonify({
            'status': 'Reading shared successfully',
            'shared_id': shared_reading['id']
        })
        
    except Exception as e:
        logging.error(f"Share reading error: {e}")
        return jsonify({'error': 'Failed to share reading'}), 500


# ==================== ENHANCED TAROT SYSTEM API ====================

# Initialize Enhanced Tarot Engine
enhanced_tarot_engine = EnhancedTarotEngine()

@api_bp.route('/api/v1/enhanced-tarot/spreads', methods=['GET'])
@token_required
def get_available_spreads(current_user):
    """Get all available tarot spreads"""
    try:
        spreads = enhanced_tarot_engine.get_available_spreads()
        return jsonify({
            'success': True,
            'spreads': spreads
        }), 200
    except Exception as e:
        logging.error(f"Error getting available spreads: {e}")
        return jsonify({'error': 'Failed to get available spreads'}), 500


@api_bp.route('/api/v1/enhanced-tarot/draw', methods=['POST'])
@token_required
def enhanced_tarot_draw(current_user):
    """Draw cards for an enhanced tarot reading"""
    try:
        data = request.get_json()
        spread_type = data.get('spread_type', 'single_card')
        question = data.get('question', '')
        reading_intention = data.get('reading_intention', '')
        
        user_id = current_user.get('id')
        
        # Get user's profile for enhanced reading
        helper = get_cosmos_helper()
        profiles_container = helper.get_container('profiles')
        
        try:
            profile = profiles_container.read_item(item=user_id, partition_key=user_id)
            user_profile = {
                'zodiac_signs': profile.get('zodiacSigns', {}),
                'numerology': profile.get('numerology', {}),
                'archetype': profile.get('archetype', {})
            }
        except Exception:
            # Use default profile if none found
            user_profile = {
                'zodiac_signs': {'western': 'scorpio'},
                'numerology': {'lifePathNumber': 7},
                'archetype': {'primary': 'mystic'}
            }
        
        # Create enhanced reading
        reading = enhanced_tarot_engine.create_enhanced_reading(
            user_id=user_id,
            spread_type=spread_type,
            question=question,
            user_profile=user_profile,
            reading_intention=reading_intention
        )
        
        # Store reading in database
        readings_container = helper.get_container('tarot_readings')
        readings_container.create_item(reading)
        
        return jsonify({
            'success': True,
            'reading': reading
        }), 200
        
    except Exception as e:
        logging.error(f"Error creating enhanced tarot reading: {e}")
        return jsonify({'error': 'Failed to create enhanced tarot reading'}), 500


@api_bp.route('/api/v1/enhanced-tarot/reading/<reading_id>', methods=['GET'])
@token_required
def get_enhanced_reading(current_user, reading_id):
    """Get a specific enhanced tarot reading"""
    try:
        user_id = current_user.get('id')
        helper = get_cosmos_helper()
        readings_container = helper.get_container('tarot_readings')
        
        # Get reading by ID and verify ownership
        query = "SELECT * FROM c WHERE c.id = @reading_id AND c.user_id = @user_id"
        parameters = [
            {"name": "@reading_id", "value": reading_id},
            {"name": "@user_id", "value": user_id}
        ]
        readings = list(readings_container.query_items(query=query, parameters=parameters))
        
        if not readings:
            return jsonify({'error': 'Reading not found'}), 404
            
        reading = readings[0]
        
        return jsonify({
            'success': True,
            'reading': reading
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting enhanced reading: {e}")
        return jsonify({'error': 'Failed to get enhanced reading'}), 500


@api_bp.route('/api/v1/enhanced-tarot/cosmic-influences', methods=['GET'])
@token_required
def get_cosmic_influences(current_user):
    """Get current cosmic influences for tarot readings"""
    try:
        influences = enhanced_tarot_engine.get_current_cosmic_influences()
        
        return jsonify({
            'success': True,
            'cosmic_influences': influences
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting cosmic influences: {e}")
        return jsonify({'error': 'Failed to get cosmic influences'}), 500


@api_bp.route('/api/v1/enhanced-tarot/daily-guidance', methods=['GET'])
@token_required
def get_daily_tarot_guidance(current_user):
    """Get personalized daily tarot guidance"""
    try:
        user_id = current_user.get('id')
        
        # Get user's profile for personalization
        helper = get_cosmos_helper()
        profiles_container = helper.get_container('profiles')
        
        try:
            profile = profiles_container.read_item(item=user_id, partition_key=user_id)
            user_profile = {
                'zodiac_signs': profile.get('zodiacSigns', {}),
                'numerology': profile.get('numerology', {}),
                'archetype': profile.get('archetype', {})
            }
        except Exception:
            user_profile = {
                'zodiac_signs': {'western': 'scorpio'},
                'numerology': {'lifePathNumber': 7},
                'archetype': {'primary': 'mystic'}
            }
        
        guidance = enhanced_tarot_engine.get_daily_guidance(user_profile)
        
        return jsonify({
            'success': True,
            'daily_guidance': guidance
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting daily guidance: {e}")
        return jsonify({'error': 'Failed to get daily guidance'}), 500


@api_bp.route('/api/v1/enhanced-tarot/interpretation/<reading_id>', methods=['POST'])
@token_required
def get_enhanced_interpretation(current_user, reading_id):
    """Get enhanced AI interpretation for a reading"""
    try:
        data = request.get_json()
        focus_area = data.get('focus_area', 'general')
        specific_question = data.get('specific_question', '')
        
        user_id = current_user.get('id')
        helper = get_cosmos_helper()
        readings_container = helper.get_container('tarot_readings')
        
        # Get the reading
        query = "SELECT * FROM c WHERE c.id = @reading_id AND c.user_id = @user_id"
        parameters = [
            {"name": "@reading_id", "value": reading_id},
            {"name": "@user_id", "value": user_id}
        ]
        readings = list(readings_container.query_items(query=query, parameters=parameters))
        
        if not readings:
            return jsonify({'error': 'Reading not found'}), 404
            
        reading = readings[0]
        
        # Generate enhanced interpretation
        interpretation = enhanced_tarot_engine.generate_enhanced_interpretation(
            reading, focus_area, specific_question
        )
        
        # Update reading with new interpretation
        if 'enhanced_interpretations' not in reading:
            reading['enhanced_interpretations'] = []
        
        reading['enhanced_interpretations'].append({
            'focus_area': focus_area,
            'question': specific_question,
            'interpretation': interpretation,
            'created_at': datetime.now(timezone.utc).isoformat()
        })
        
        readings_container.upsert_item(reading)
        
        return jsonify({
            'success': True,
            'interpretation': interpretation
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting enhanced interpretation: {e}")
        return jsonify({'error': 'Failed to get enhanced interpretation'}), 500


@api_bp.route('/api/v1/enhanced-tarot/share', methods=['POST'])
@token_required
def share_enhanced_reading(current_user):
    """Share an enhanced tarot reading"""
    try:
        data = request.get_json()
        reading_id = data.get('reading_id')
        share_type = data.get('share_type', 'public')  # public, friends, private
        message = data.get('message', '')
        
        if not reading_id:
            return jsonify({'error': 'Reading ID required'}), 400
            
        user_id = current_user.get('id')
        helper = get_cosmos_helper()
        
        # Verify reading ownership
        readings_container = helper.get_container('tarot_readings')
        query = "SELECT * FROM c WHERE c.id = @reading_id AND c.user_id = @user_id"
        parameters = [
            {"name": "@reading_id", "value": reading_id},
            {"name": "@user_id", "value": user_id}
        ]
        readings = list(readings_container.query_items(query=query, parameters=parameters))
        
        if not readings:
            return jsonify({'error': 'Reading not found'}), 404
            
        # Create share record
        shares_container = helper.get_container('reading_shares')
        share_record = {
            'id': str(uuid.uuid4()),
            'reading_id': reading_id,
            'user_id': user_id,
            'share_type': share_type,
            'message': message,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        shares_container.create_item(share_record)
        
        return jsonify({
            'success': True,
            'share_id': share_record['id'],
            'message': 'Reading shared successfully'
        }), 200
        
    except Exception as e:
        logging.error(f"Error sharing reading: {e}")
        return jsonify({'error': 'Failed to share reading'}), 500


@api_bp.route('/api/v1/enhanced-tarot/reflection', methods=['POST'])
@token_required
def add_reading_reflection(current_user):
    """Add a personal reflection to a tarot reading"""
    try:
        data = request.get_json()
        reading_id = data.get('reading_id')
        reflection_text = data.get('reflection', '')
        tags = data.get('tags', [])
        
        if not reading_id or not reflection_text:
            return jsonify({'error': 'Reading ID and reflection text required'}), 400
            
        user_id = current_user.get('id')
        helper = get_cosmos_helper()
        readings_container = helper.get_container('tarot_readings')
        
        # Get and verify reading ownership
        query = "SELECT * FROM c WHERE c.id = @reading_id AND c.user_id = @user_id"
        parameters = [
            {"name": "@reading_id", "value": reading_id},
            {"name": "@user_id", "value": user_id}
        ]
        readings = list(readings_container.query_items(query=query, parameters=parameters))
        
        if not readings:
            return jsonify({'error': 'Reading not found'}), 404
            
        reading = readings[0]
        
        # Add reflection
        reflection = {
            'id': str(uuid.uuid4()),
            'text': reflection_text,
            'tags': tags,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        if 'reflections' not in reading:
            reading['reflections'] = []
        reading['reflections'].append(reflection)
        
        readings_container.upsert_item(reading)
        
        return jsonify({
            'success': True,
            'reflection': reflection,
            'message': 'Reflection added successfully'
        }), 200
        
    except Exception as e:
        logging.error(f"Error adding reflection: {e}")
        return jsonify({'error': 'Failed to add reflection'}), 500


@api_bp.route('/api/v1/enhanced-tarot/history', methods=['GET'])
@token_required
def get_reading_history(current_user):
    """Get user's tarot reading history"""
    try:
        user_id = current_user.get('id')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        spread_type = request.args.get('spread_type')
        
        helper = get_cosmos_helper()
        readings_container = helper.get_container('tarot_readings')
        
        # Build query
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        parameters = [{"name": "@user_id", "value": user_id}]
        
        if spread_type:
            query += " AND c.spread_type = @spread_type"
            parameters.append({"name": "@spread_type", "value": spread_type})
        
        query += " ORDER BY c._ts DESC"
        
        readings = list(readings_container.query_items(
            query=query, 
            parameters=parameters
        ))
        
        # Apply pagination
        total_count = len(readings)
        paginated_readings = readings[offset:offset + limit]
        
        return jsonify({
            'success': True,
            'readings': paginated_readings,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_count
            }
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting reading history: {e}")
        return jsonify({'error': 'Failed to get reading history'}), 500


@api_bp.route('/api/v1/enhanced-tarot/statistics', methods=['GET'])
@token_required
def get_tarot_statistics(current_user):
    """Get user's tarot reading statistics"""
    try:
        user_id = current_user.get('id')
        helper = get_cosmos_helper()
        readings_container = helper.get_container('tarot_readings')
        
        # Get all user's readings
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        parameters = [{"name": "@user_id", "value": user_id}]
        readings = list(readings_container.query_items(query=query, parameters=parameters))
        
        # Calculate statistics
        stats = enhanced_tarot_engine.calculate_reading_statistics(readings)
        
        return jsonify({
            'success': True,
            'statistics': stats
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting tarot statistics: {e}")
        return jsonify({'error': 'Failed to get tarot statistics'}), 500

# ==================== END ENHANCED TAROT SYSTEM API ====================

@api_bp.route('/api/v1/feed', methods=['GET'])
@token_required
def cosmic_feed(current_user):
    """Enhanced cosmic feed with advanced filtering, sorting, and real-time features"""
    try:
        # Enhanced pagination parameters
        limit = min(int(request.args.get('limit', 20)), 50)
        offset = int(request.args.get('offset', 0))
        
        # Advanced filtering parameters
        zodiac_filter = request.args.get('zodiac_filter', '').split(',') if request.args.get('zodiac_filter') else []
        content_types = request.args.get('content_types', '').split(',') if request.args.get('content_types') else []
        time_range = request.args.get('time_range', 'all')  # all, 24h, 7d, 30d
        energy_level = request.args.get('energy_level', 'all')  # all, high, medium, low
        search_query = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', 'newest')  # newest, trending, cosmic_energy
        
        # User context for personalization
        user_zodiac = current_user.get('zodiac_sign', 'Scorpio')
        user_interests = current_user.get('interests', [])
        
        # Generate enhanced mock data with realistic variety
        all_mock_data = []
        post_types = ['tarot_reading', 'daily_feature', 'cosmic_insight', 'zodiac_wisdom', 'ritual_sharing', 'constellation_creation']
        zodiacs = ['Scorpio', 'Libra', 'Aries', 'Pisces', 'Leo', 'Virgo', 'Gemini', 'Cancer', 'Taurus', 'Sagittarius', 'Capricorn', 'Aquarius']
        chinese_zodiacs = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
        
        # Generate 200 posts for robust infinite scroll
        for i in range(200):
            hours_ago = (i * 0.3) + 1  # More frequent posting
            zodiac = zodiacs[i % len(zodiacs)]
            chinese_zodiac = chinese_zodiacs[i % len(chinese_zodiacs)]
            post_type = post_types[i % len(post_types)]
            
            # Calculate cosmic energy and engagement metrics
            cosmic_energy = calculate_cosmic_energy(zodiac, post_type, hours_ago)
            engagement_data = generate_engagement_data(cosmic_energy, zodiac)
            
            # Generate content based on type
            content = generate_post_content(post_type, zodiac, i)
            
            # Generate cosmic tags
            cosmic_tags = generate_cosmic_tags(post_type, zodiac, chinese_zodiac)
            
            post = {
                'id': f'feed_{i+1}',
                'username': f'Cosmic{zodiac}{i+1}',
                'zodiac': zodiac,
                'zodiac_signs': {
                    'western': zodiac,
                    'chinese': chinese_zodiac,
                    'vedic': get_vedic_equivalent(zodiac),
                    'galactic_tone': (i % 13) + 1
                },
                'type': post_type,
                'content': content,
                'created_at': (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat(),
                'likes': engagement_data['likes'],
                'comments': engagement_data['comments'],
                'shares': engagement_data['shares'],
                'engagement_data': {
                    'zodiac_reactions': engagement_data['zodiac_reactions'],
                    'cosmic_energy': cosmic_energy,
                    'viral_score': engagement_data['viral_score']
                },
                'author_avatar': f'/avatars/{zodiac.lower()}_avatar.png',
                'cosmic_tags': cosmic_tags
            }
            
            all_mock_data.append(post)
        
        # Apply filters
        filtered_data = apply_feed_filters(
            all_mock_data, 
            zodiac_filter, 
            content_types, 
            time_range, 
            energy_level, 
            search_query
        )
        
        # Apply sorting
        sorted_data = apply_feed_sorting(filtered_data, sort_by, user_zodiac)
        
        # Apply pagination
        paginated_data = sorted_data[offset:offset + limit]
        
        # Add personalization context
        for post in paginated_data:
            post['user_context'] = {
                'compatibility_score': calculate_compatibility(user_zodiac, post['zodiac']),
                'interest_match': calculate_interest_match(user_interests, post['cosmic_tags']),
                'recommended_actions': get_recommended_actions(user_zodiac, post)
            }
        
        # Return enhanced response with metadata
        return jsonify({
            'posts': paginated_data,
            'metadata': {
                'total_filtered': len(filtered_data),
                'has_more': offset + limit < len(sorted_data),
                'filters_applied': {
                    'zodiac_filter': zodiac_filter,
                    'content_types': content_types,
                    'time_range': time_range,
                    'energy_level': energy_level,
                    'search_query': search_query
                },
                'sort_by': sort_by,
                'user_context': {
                    'zodiac': user_zodiac,
                    'interests': user_interests
                }
            }
        })
        
    except Exception as e:
        logging.error(f"Enhanced feed error: {e}")
        return jsonify({'error': 'Failed to load enhanced feed'}), 500


def calculate_cosmic_energy(zodiac, post_type, hours_ago):
    """Calculate cosmic energy based on zodiac, content type, and recency"""
    base_energy = {
        'tarot_reading': 85,
        'cosmic_insight': 75,
        'zodiac_wisdom': 65,
        'ritual_sharing': 80,
        'constellation_creation': 90,
        'daily_feature': 70
    }.get(post_type, 60)
    
    # Zodiac energy modifiers
    zodiac_modifiers = {
        'Scorpio': 1.2, 'Leo': 1.1, 'Aries': 1.1, 'Sagittarius': 1.0,
        'Aquarius': 0.95, 'Gemini': 0.9, 'Libra': 0.85, 'Pisces': 0.9,
        'Cancer': 0.85, 'Virgo': 0.8, 'Taurus': 0.8, 'Capricorn': 0.8
    }
    
    # Time decay factor
    time_factor = max(0.3, 1.0 - (hours_ago / 168))  # Week decay
    
    cosmic_energy = int(base_energy * zodiac_modifiers.get(zodiac, 1.0) * time_factor)
    return max(10, min(100, cosmic_energy))


def generate_engagement_data(cosmic_energy, zodiac):
    """Generate realistic engagement metrics based on cosmic energy"""
    import random
    
    base_multiplier = cosmic_energy / 100
    likes = int(random.randint(5, 50) * base_multiplier)
    comments = int(random.randint(2, 15) * base_multiplier)
    shares = int(random.randint(1, 8) * base_multiplier)
    
    # Zodiac-specific reaction distribution
    zodiac_reactions = {}
    for sign in WESTERN_ZODIAC_ACTIONS.keys():
        if sign == zodiac:
            zodiac_reactions[sign] = random.randint(3, 12)
        else:
            zodiac_reactions[sign] = random.randint(0, 5)
    
    viral_score = (likes * 1) + (comments * 3) + (shares * 5)
    
    return {
        'likes': likes,
        'comments': comments,
        'shares': shares,
        'zodiac_reactions': zodiac_reactions,
        'viral_score': viral_score
    }


def generate_post_content(post_type, zodiac, index):
    """Generate diverse content based on post type and zodiac"""
    if post_type == 'tarot_reading':
        cards = [
            'Death', 'The Fool', 'The Star', 'The Moon', 'The Sun', 'Justice', 
            'The Hermit', 'Wheel of Fortune', 'The Lovers', 'The Magician',
            'High Priestess', 'The Emperor', 'The Empress', 'Hierophant',
            'Chariot', 'Strength', 'Hanged Man', 'Temperance', 'Devil',
            'Tower', 'World', 'Judgement'
        ]
        card = cards[index % len(cards)]
        interpretations = [
            f'{zodiac} energy reveals: {card} brings transformation through shadow work.',
            f'The {card} calls to your {zodiac} nature, urging deep introspection.',
            f'{zodiac} cosmic alignment with {card} suggests major breakthroughs ahead.',
            f'Channel your {zodiac} intuition - {card} opens new dimensional pathways.'
        ]
        return {
            'card_name': card,
            'interpretation': interpretations[index % len(interpretations)]
        }
    
    elif post_type == 'cosmic_insight':
        insights = [
            f'{zodiac} cosmic currents reveal hidden patterns in your energy field.',
            f'Universal frequencies align with {zodiac} consciousness today.',
            f'The cosmic web pulses with {zodiac} archetypal wisdom.',
            f'{zodiac} starlight activates dormant DNA sequences within you.',
            f'Quantum entanglement strengthens {zodiac} intuitive abilities.',
            f'Galactic center communication enhances {zodiac} psychic reception.'
        ]
        return insights[index % len(insights)]
    
    elif post_type == 'ritual_sharing':
        rituals = [
            f'{zodiac} moon ritual for manifestation and inner alchemy.',
            f'Crystal grid activation ceremony channeling {zodiac} energy.',
            f'Sacred geometry meditation aligned with {zodiac} frequencies.',
            f'Planetary invocation ritual honoring {zodiac} archetypal powers.',
            f'Chakra balancing ceremony infused with {zodiac} elemental force.'
        ]
        return rituals[index % len(rituals)]
    
    elif post_type == 'constellation_creation':
        return f'New star pattern discovered: {zodiac} Gateway - connecting terrestrial consciousness with galactic intelligence networks.'
    
    else:  # zodiac_wisdom, daily_feature
        wisdom = [
            f'{zodiac} wisdom: Trust the cosmic timing of your soul\'s evolution.',
            f'{zodiac} cosmic law: What you seek in others, cultivate within yourself.',
            f'{zodiac} universal principle: Consciousness creates reality through focused intention.',
            f'{zodiac} galactic truth: You are stardust becoming aware of itself.',
            f'{zodiac} cosmic reminder: Your frequency determines your reality.',
            f'{zodiac} stellar wisdom: Embrace the chaos - it\'s where magic is born.'
        ]
        return wisdom[index % len(wisdom)]


def generate_cosmic_tags(post_type, western_zodiac, chinese_zodiac):
    """Generate relevant cosmic tags for categorization and discovery"""
    base_tags = [western_zodiac.lower(), chinese_zodiac.lower()]
    
    type_tags = {
        'tarot_reading': ['tarot', 'divination', 'oracle', 'cards'],
        'cosmic_insight': ['cosmic', 'consciousness', 'awakening', 'frequency'],
        'zodiac_wisdom': ['wisdom', 'astrology', 'ancient_knowledge', 'guidance'],
        'ritual_sharing': ['ritual', 'ceremony', 'sacred', 'practice'],
        'constellation_creation': ['stars', 'creation', 'astronomy', 'discovery'],
        'daily_feature': ['daily', 'inspiration', 'motivation', 'growth']
    }
    
    elemental_tags = {
        'Aries': ['fire'], 'Leo': ['fire'], 'Sagittarius': ['fire'],
        'Taurus': ['earth'], 'Virgo': ['earth'], 'Capricorn': ['earth'],
        'Gemini': ['air'], 'Libra': ['air'], 'Aquarius': ['air'],
        'Cancer': ['water'], 'Scorpio': ['water'], 'Pisces': ['water']
    }
    
    all_tags = (base_tags + 
               type_tags.get(post_type, []) + 
               elemental_tags.get(western_zodiac, []))
    
    return all_tags[:6]  # Limit to 6 tags


def get_vedic_equivalent(western_zodiac):
    """Map Western zodiac to Vedic equivalents"""
    mapping = {
        'Aries': 'Mesha', 'Taurus': 'Vrishabha', 'Gemini': 'Mithuna',
        'Cancer': 'Karkata', 'Leo': 'Simha', 'Virgo': 'Kanya',
        'Libra': 'Tula', 'Scorpio': 'Vrishchika', 'Sagittarius': 'Dhanus',
        'Capricorn': 'Makara', 'Aquarius': 'Kumbha', 'Pisces': 'Meena'
    }
    return mapping.get(western_zodiac, 'Unknown')


def apply_feed_filters(posts, zodiac_filter, content_types, time_range, energy_level, search_query):
    """Apply comprehensive filtering to feed posts"""
    filtered_posts = posts
    
    # Zodiac filtering
    if zodiac_filter:
        filtered_posts = [p for p in filtered_posts if p['zodiac'] in zodiac_filter]
    
    # Content type filtering  
    if content_types:
        filtered_posts = [p for p in filtered_posts if p['type'] in content_types]
    
    # Time range filtering
    if time_range != 'all':
        now = datetime.now(timezone.utc)
        if time_range == '24h':
            cutoff = now - timedelta(hours=24)
        elif time_range == '7d':
            cutoff = now - timedelta(days=7)
        elif time_range == '30d':
            cutoff = now - timedelta(days=30)
        else:
            cutoff = now - timedelta(days=365)
        
        filtered_posts = [p for p in filtered_posts 
                         if datetime.fromisoformat(p['created_at'].replace('Z', '+00:00')) > cutoff]
    
    # Energy level filtering
    if energy_level != 'all':
        if energy_level == 'high':
            filtered_posts = [p for p in filtered_posts if p['engagement_data']['cosmic_energy'] >= 70]
        elif energy_level == 'medium':
            filtered_posts = [p for p in filtered_posts if 40 <= p['engagement_data']['cosmic_energy'] < 70]
        elif energy_level == 'low':
            filtered_posts = [p for p in filtered_posts if p['engagement_data']['cosmic_energy'] < 40]
    
    # Search query filtering
    if search_query:
        search_lower = search_query.lower()
        filtered_posts = [p for p in filtered_posts 
                         if search_lower in str(p['content']).lower() or 
                            search_lower in p['username'].lower() or
                            any(search_lower in tag for tag in p['cosmic_tags'])]
    
    return filtered_posts


def apply_feed_sorting(posts, sort_by, user_zodiac):
    """Apply intelligent sorting based on user preferences and cosmic factors"""
    if sort_by == 'newest':
        return sorted(posts, key=lambda p: p['created_at'], reverse=True)
    
    elif sort_by == 'trending':
        return sorted(posts, key=lambda p: p['engagement_data']['viral_score'], reverse=True)
    
    elif sort_by == 'cosmic_energy':
        return sorted(posts, key=lambda p: p['engagement_data']['cosmic_energy'], reverse=True)
    
    else:  # Default to newest
        return sorted(posts, key=lambda p: p['created_at'], reverse=True)


def calculate_compatibility(user_zodiac, post_zodiac):
    """Calculate compatibility score between user and post zodiac signs"""
    # Elemental compatibility matrix
    elements = {
        'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
        'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth', 
        'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
        'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    }
    
    user_element = elements.get(user_zodiac)
    post_element = elements.get(post_zodiac)
    
    compatibility_matrix = {
        ('Fire', 'Fire'): 0.9, ('Fire', 'Air'): 0.8, ('Fire', 'Earth'): 0.4, ('Fire', 'Water'): 0.3,
        ('Earth', 'Earth'): 0.9, ('Earth', 'Water'): 0.8, ('Earth', 'Fire'): 0.4, ('Earth', 'Air'): 0.3,
        ('Air', 'Air'): 0.9, ('Air', 'Fire'): 0.8, ('Air', 'Water'): 0.4, ('Air', 'Earth'): 0.3,
        ('Water', 'Water'): 0.9, ('Water', 'Earth'): 0.8, ('Water', 'Air'): 0.4, ('Water', 'Fire'): 0.3
    }
    
    return compatibility_matrix.get((user_element, post_element), 0.5)


def calculate_interest_match(user_interests, post_tags):
    """Calculate how well post tags match user interests"""
    if not user_interests or not post_tags:
        return 0.5
    
    matches = len(set(user_interests) & set(post_tags))
    return min(1.0, matches / len(user_interests))


def get_recommended_actions(user_zodiac, post):
    """Get personalized action recommendations based on user zodiac and post content"""
    actions = WESTERN_ZODIAC_ACTIONS.get(user_zodiac, {})
    
    recommendations = []
    if post['engagement_data']['cosmic_energy'] > 70:
        recommendations.append(f"{actions.get('like', 'like')} this high-energy post")
    
    if post['type'] == 'tarot_reading':
        recommendations.append(f"{actions.get('comment', 'comment')} with your interpretation")
    
    if calculate_compatibility(user_zodiac, post['zodiac']) > 0.7:
        recommendations.append(f"{actions.get('share', 'share')} with compatible energy")
    
    return recommendations[:2]  # Limit to top 2 recommendations

@api_bp.route('/api/v1/social-actions', methods=['POST'])
@token_required
def enhanced_social_actions(current_user):
    """Enhanced zodiac-specific social actions with real-time updates and cosmic effects"""
    try:
        data = request.get_json()
        action = data.get('action')  # e.g., 'scorpio_like', 'libra_comment'
        post_id = data.get('post_id')
        action_text = data.get('action_text', action)  # Custom zodiac action text
        zodiac_context = data.get('zodiac_context', {})
        comment_text = data.get('comment_text', '')  # For comment actions
        
        if not action or not post_id:
            return jsonify({'error': 'Action and post_id required'}), 400
            
        user_id = current_user['id']
        user_zodiac = current_user.get('zodiac_sign', 'Scorpio')
        
        # Enhanced action validation
        valid_actions = ['like', 'comment', 'share', 'follow', 'boost', 'transform']
        base_action = action.split('_')[-1] if '_' in action else action
        
        if base_action not in valid_actions:
            return jsonify({'error': f'Invalid action: {base_action}'}), 400
        
        # Calculate cosmic energy impact
        cosmic_impact = calculate_action_cosmic_impact(
            user_zodiac, 
            zodiac_context.get('post_zodiac', ''), 
            base_action,
            zodiac_context.get('cosmic_compatibility', 0.5)
        )
        
        # Generate action effects
        action_effects = generate_zodiac_action_effects(user_zodiac, base_action, cosmic_impact)
        
        # Create comprehensive action record
        action_record = {
            'id': f"action_{user_id}_{action}_{int(datetime.now(timezone.utc).timestamp())}",
            'user_id': user_id,
            'action': action,
            'base_action': base_action,
            'action_text': action_text,
            'post_id': post_id,
            'user_zodiac': user_zodiac,
            'zodiac_context': zodiac_context,
            'comment_text': comment_text,
            'cosmic_impact': cosmic_impact,
            'action_effects': action_effects,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', '')
        }
        
        logging.info(f"Enhanced social action recorded: {action_record['id']} with cosmic impact {cosmic_impact}")
        
        # Award cosmic points based on action type and compatibility
        points_awarded = calculate_cosmic_points(base_action, cosmic_impact, zodiac_context)
        
        # Update user cosmic energy (mock - in production save to Cosmos DB)
        user_cosmic_energy = current_user.get('cosmic_energy', 100) + points_awarded
        
        # Generate real-time updates for connected clients
        real_time_update = {
            'type': 'action_performed',
            'action_record': action_record,
            'cosmic_effects': action_effects,
            'points_awarded': points_awarded,
            'user_cosmic_energy': user_cosmic_energy,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Emit to WebSocket clients (in production via SocketIO)
        try:
            from flask import current_app
            if hasattr(current_app, 'socketio'):
                current_app.socketio.emit('post_engagement_update', {
                    'postId': post_id,
                    'action': base_action,
                    'actionText': action_text,
                    'userZodiac': user_zodiac,
                    'cosmicImpact': cosmic_impact,
                    'effects': action_effects
                }, room=f'post_{post_id}')
                
                current_app.socketio.emit('user_action_performed', real_time_update, room=f'user_{user_id}')
        except Exception as socket_error:
            logging.warning(f"SocketIO emission failed: {socket_error}")
        
        # Return enhanced response with cosmic effects
        return jsonify({
            'success': True,
            'action_id': action_record['id'],
            'action_text': action_text,
            'cosmic_impact': cosmic_impact,
            'action_effects': action_effects,
            'points_awarded': points_awarded,
            'user_cosmic_energy': user_cosmic_energy,
            'zodiac_resonance': {
                'compatibility': zodiac_context.get('cosmic_compatibility', 0.5),
                'elemental_harmony': calculate_elemental_harmony(user_zodiac, zodiac_context.get('post_zodiac', '')),
                'archetypal_alignment': get_archetypal_alignment(user_zodiac, base_action)
            },
            'next_actions': get_suggested_next_actions(user_zodiac, base_action, cosmic_impact)
        })
        
    except Exception as e:
        logging.error(f"Enhanced social action error: {e}")
        return jsonify({'error': 'Failed to process social action'}), 500


def calculate_action_cosmic_impact(user_zodiac, post_zodiac, action, compatibility_score):
    """Calculate the cosmic energy impact of a social action"""
    # Base impact values for different actions
    base_impacts = {
        'like': 10, 'comment': 25, 'share': 35, 
        'follow': 50, 'boost': 40, 'transform': 60
    }
    
    base_impact = base_impacts.get(action, 10)
    
    # Zodiac action multipliers based on archetypal strengths
    zodiac_multipliers = {
        'Aries': {'like': 1.2, 'comment': 1.0, 'share': 1.3, 'follow': 1.1},
        'Taurus': {'like': 1.1, 'comment': 1.2, 'share': 0.9, 'follow': 1.3},
        'Gemini': {'like': 0.9, 'comment': 1.4, 'share': 1.3, 'follow': 1.0},
        'Cancer': {'like': 1.3, 'comment': 1.1, 'share': 0.8, 'follow': 1.4},
        'Leo': {'like': 1.4, 'comment': 1.2, 'share': 1.2, 'follow': 1.1},
        'Virgo': {'like': 1.0, 'comment': 1.3, 'share': 1.0, 'follow': 1.2},
        'Libra': {'like': 1.1, 'comment': 1.1, 'share': 1.4, 'follow': 1.2},
        'Scorpio': {'like': 1.2, 'comment': 1.4, 'share': 1.1, 'follow': 1.3},
        'Sagittarius': {'like': 1.0, 'comment': 1.0, 'share': 1.4, 'follow': 1.1},
        'Capricorn': {'like': 0.9, 'comment': 1.1, 'share': 1.0, 'follow': 1.4},
        'Aquarius': {'like': 1.0, 'comment': 1.2, 'share': 1.3, 'follow': 1.0},
        'Pisces': {'like': 1.2, 'comment': 1.0, 'share': 1.0, 'follow': 1.3}
    }
    
    # Apply zodiac multiplier
    zodiac_multiplier = zodiac_multipliers.get(user_zodiac, {}).get(action, 1.0)
    
    # Apply compatibility bonus
    compatibility_bonus = 1.0 + (compatibility_score * 0.5)  # Up to 50% bonus
    
    # Calculate final impact
    cosmic_impact = int(base_impact * zodiac_multiplier * compatibility_bonus)
    
    return max(5, min(100, cosmic_impact))  # Ensure reasonable bounds


def generate_zodiac_action_effects(zodiac, action, cosmic_impact):
    """Generate visual and energetic effects for zodiac actions"""
    # Base effect patterns by zodiac
    zodiac_effects = {
        'Aries': {'color': '#FF6B6B', 'pattern': 'burst', 'element': 'fire'},
        'Taurus': {'color': '#4ECDC4', 'pattern': 'spiral', 'element': 'earth'},
        'Gemini': {'color': '#45B7D1', 'pattern': 'flutter', 'element': 'air'},
        'Cancer': {'color': '#96CEB4', 'pattern': 'wave', 'element': 'water'},
        'Leo': {'color': '#FFEAA7', 'pattern': 'radiance', 'element': 'fire'},
        'Virgo': {'color': '#DDA0DD', 'pattern': 'geometric', 'element': 'earth'},
        'Libra': {'color': '#98D8C8', 'pattern': 'balance', 'element': 'air'},
        'Scorpio': {'color': '#F06292', 'pattern': 'transform', 'element': 'water'},
        'Sagittarius': {'color': '#AED581', 'pattern': 'arrow', 'element': 'fire'},
        'Capricorn': {'color': '#FFB74D', 'pattern': 'mountain', 'element': 'earth'},
        'Aquarius': {'color': '#64B5F6', 'pattern': 'electricity', 'element': 'air'},
        'Pisces': {'color': '#A1C4FD', 'pattern': 'flow', 'element': 'water'}
    }
    
    base_effect = zodiac_effects.get(zodiac, zodiac_effects['Scorpio'])
    
    # Action-specific modifications
    action_modifiers = {
        'like': {'intensity': 0.7, 'duration': 1000, 'particles': 15},
        'comment': {'intensity': 0.8, 'duration': 1500, 'particles': 20},
        'share': {'intensity': 0.9, 'duration': 2000, 'particles': 25},
        'follow': {'intensity': 1.0, 'duration': 2500, 'particles': 30},
        'boost': {'intensity': 1.1, 'duration': 2000, 'particles': 35},
        'transform': {'intensity': 1.2, 'duration': 3000, 'particles': 40}
    }
    
    modifier = action_modifiers.get(action, action_modifiers['like'])
    
    # Scale by cosmic impact
    impact_scale = cosmic_impact / 50.0  # Normalize to 0-2 range
    
    return {
        'visual': {
            'color': base_effect['color'],
            'pattern': base_effect['pattern'],
            'intensity': modifier['intensity'] * impact_scale,
            'duration': int(modifier['duration'] * impact_scale),
            'particle_count': int(modifier['particles'] * impact_scale)
        },
        'energetic': {
            'element': base_effect['element'],
            'frequency': calculate_zodiac_frequency(zodiac),
            'resonance': cosmic_impact / 100.0,
            'harmonic': get_action_harmonic(action)
        },
        'cosmic': {
            'chakra_activation': get_zodiac_chakra(zodiac),
            'dimensional_shift': calculate_dimensional_shift(cosmic_impact),
            'timeline_influence': get_timeline_influence(zodiac, action)
        }
    }


def calculate_cosmic_points(action, cosmic_impact, zodiac_context):
    """Calculate cosmic points awarded for an action"""
    base_points = {
        'like': 5, 'comment': 15, 'share': 25, 
        'follow': 40, 'boost': 30, 'transform': 50
    }
    
    points = base_points.get(action, 5)
    
    # Cosmic impact bonus (up to 100% bonus)
    impact_bonus = points * (cosmic_impact / 100.0)
    
    # Compatibility bonus
    compatibility = zodiac_context.get('cosmic_compatibility', 0.5)
    compatibility_bonus = points * (compatibility * 0.5)
    
    total_points = int(points + impact_bonus + compatibility_bonus)
    return max(1, min(200, total_points))  # Reasonable bounds


def calculate_elemental_harmony(zodiac1, zodiac2):
    """Calculate elemental harmony between two zodiac signs"""
    elements = {
        'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
        'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
        'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
        'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
    }
    
    element1 = elements.get(zodiac1)
    element2 = elements.get(zodiac2)
    
    if not element1 or not element2:
        return 0.5
    
    # Elemental relationships
    harmonious = {
        'Fire': ['Air'], 'Air': ['Fire'], 
        'Earth': ['Water'], 'Water': ['Earth']
    }
    
    if element1 == element2:
        return 1.0  # Same element, perfect harmony
    elif element2 in harmonious.get(element1, []):
        return 0.8  # Complementary elements
    else:
        return 0.4  # Challenging aspects


def get_archetypal_alignment(zodiac, action):
    """Get archetypal alignment score for zodiac-action combination"""
    archetypal_strengths = {
        'Aries': ['like', 'share', 'boost'],
        'Taurus': ['like', 'follow', 'comment'],
        'Gemini': ['comment', 'share'],
        'Cancer': ['like', 'follow', 'transform'],
        'Leo': ['like', 'share', 'boost'],
        'Virgo': ['comment', 'follow'],
        'Libra': ['share', 'follow'],
        'Scorpio': ['comment', 'transform', 'follow'],
        'Sagittarius': ['share', 'boost'],
        'Capricorn': ['follow', 'boost'],
        'Aquarius': ['share', 'comment', 'transform'],
        'Pisces': ['like', 'follow', 'transform']
    }
    
    strengths = archetypal_strengths.get(zodiac, [])
    return 1.0 if action in strengths else 0.6


def get_suggested_next_actions(zodiac, current_action, cosmic_impact):
    """Suggest next actions based on current cosmic state"""
    action_flows = {
        'like': ['comment', 'share'],
        'comment': ['share', 'follow'],
        'share': ['follow', 'boost'],
        'follow': ['boost', 'transform'],
        'boost': ['transform'],
        'transform': ['share', 'boost']
    }
    
    base_suggestions = action_flows.get(current_action, ['like', 'comment'])
    
    # Filter by zodiac preferences
    zodiac_preferences = {
        'Aries': ['share', 'boost'],
        'Taurus': ['follow', 'like'],
        'Gemini': ['comment', 'share'],
        'Cancer': ['follow', 'transform'],
        'Leo': ['boost', 'share'],
        'Virgo': ['comment', 'follow'],
        'Libra': ['share', 'follow'],
        'Scorpio': ['transform', 'comment'],
        'Sagittarius': ['boost', 'share'],
        'Capricorn': ['follow', 'boost'],
        'Aquarius': ['transform', 'comment'],
        'Pisces': ['transform', 'follow']
    }
    
    preferences = zodiac_preferences.get(zodiac, ['like', 'comment'])
    
    # Prioritize based on cosmic impact
    if cosmic_impact > 70:
        suggestions = [action for action in base_suggestions if action in preferences]
    else:
        suggestions = base_suggestions
    
    return suggestions[:2]  # Limit to 2 suggestions


# Utility functions for cosmic calculations
def calculate_zodiac_frequency(zodiac):
    """Calculate the base frequency of a zodiac sign"""
    frequencies = {
        'Aries': 432.0, 'Taurus': 417.0, 'Gemini': 528.0,
        'Cancer': 396.0, 'Leo': 741.0, 'Virgo': 852.0,
        'Libra': 639.0, 'Scorpio': 285.0, 'Sagittarius': 963.0,
        'Capricorn': 174.0, 'Aquarius': 888.0, 'Pisces': 333.0
    }
    return frequencies.get(zodiac, 432.0)


def get_action_harmonic(action):
    """Get the harmonic number for an action"""
    harmonics = {
        'like': 3, 'comment': 5, 'share': 7, 
        'follow': 11, 'boost': 13, 'transform': 17
    }
    return harmonics.get(action, 3)


def get_zodiac_chakra(zodiac):
    """Map zodiac to primary chakra activation"""
    chakras = {
        'Aries': 'Root', 'Taurus': 'Sacral', 'Gemini': 'Throat',
        'Cancer': 'Heart', 'Leo': 'Solar Plexus', 'Virgo': 'Throat',
        'Libra': 'Heart', 'Scorpio': 'Sacral', 'Sagittarius': 'Third Eye',
        'Capricorn': 'Root', 'Aquarius': 'Crown', 'Pisces': 'Third Eye'
    }
    return chakras.get(zodiac, 'Heart')


def calculate_dimensional_shift(cosmic_impact):
    """Calculate dimensional shift based on cosmic impact"""
    if cosmic_impact >= 80:
        return 'Fifth Dimension'
    elif cosmic_impact >= 60:
        return 'Fourth Dimension'
    elif cosmic_impact >= 40:
        return 'Third Dimension Enhanced'
    else:
        return 'Third Dimension'


def get_timeline_influence(zodiac, action):
    """Calculate timeline influence of zodiac action"""
    influences = {
        ('Aries', 'boost'): 'Accelerated Timeline',
        ('Taurus', 'follow'): 'Stable Timeline', 
        ('Gemini', 'share'): 'Multiple Timelines',
        ('Cancer', 'transform'): 'Ancestral Timeline',
        ('Leo', 'boost'): 'Solar Timeline',
        ('Virgo', 'comment'): 'Detailed Timeline',
        ('Libra', 'share'): 'Balanced Timeline',
        ('Scorpio', 'transform'): 'Shadow Timeline',
        ('Sagittarius', 'share'): 'Expanded Timeline',
        ('Capricorn', 'follow'): 'Structured Timeline',
        ('Aquarius', 'transform'): 'Future Timeline',
        ('Pisces', 'transform'): 'Intuitive Timeline'
    }
    return influences.get((zodiac, action), 'Present Timeline')

@api_bp.route('/api/oracle/numerology', methods=['POST'])
@token_required
def get_numerology():
    """Calculate numerology for the authenticated user"""
    try:
        data = request.get_json()
        full_name = data.get('full_name')
        birth_date = data.get('birth_date')  # ISO format: YYYY-MM-DD

        if not all([full_name, birth_date]):
            return jsonify({'error': 'Missing required fields: full_name, birth_date'}), 400

        # Calculate numerology
        numerology = oracle_engine.calculate_numerology(full_name, birth_date)

        return jsonify({
            'success': True,
            'numerology': numerology
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/oracle/synastry', methods=['POST'])
@token_required
def get_synastry():
    """Calculate synastry (relationship compatibility) between two people"""
    try:
        data = request.get_json()
        person1 = data.get('person1')  # {birth_date, birth_time, birth_place}
        person2 = data.get('person2')  # {birth_date, birth_time, birth_place}

        if not all([person1, person2]):
            return jsonify({'error': 'Missing person1 or person2 data'}), 400

        # Parse birth datetimes
        from datetime import datetime
        p1_datetime = datetime.fromisoformat(f"{person1['birth_date']}T{person1['birth_time']}")
        p2_datetime = datetime.fromisoformat(f"{person2['birth_date']}T{person2['birth_time']}")

        # Calculate synastry
        synastry = oracle_engine.calculate_synastry(
            p1_datetime, person1['birth_place'],
            p2_datetime, person2['birth_place']
        )

        return jsonify({
            'success': True,
            'synastry': synastry
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/oracle/astrological-insights', methods=['GET'])
@token_required
def get_astrological_insights():
    """Get current astrological insights and transits"""
    try:
        insights = oracle_engine.get_astrological_insights()
        return jsonify({
            'success': True,
            'insights': insights
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ENHANCED NUMEROLOGY API ====================

@api_bp.route('/api/v1/numerology/comprehensive', methods=['POST'])
@token_required
def get_comprehensive_numerology(current_user):
    """Calculate comprehensive numerology profile with cosmic insights"""
    try:
        from numerology import NumerologyCalculator
        
        data = request.get_json() or {}
        full_name = data.get('full_name') or g.current_user.get('full_name')
        birth_date_str = data.get('birth_date') or g.current_user.get('birth_date')
        
        if not full_name or not birth_date_str:
            return jsonify({'error': 'Full name and birth date required'}), 400
        
        # Parse birth date
        if isinstance(birth_date_str, str):
            birth_date = datetime.fromisoformat(birth_date_str.replace('Z', '+00:00'))
        else:
            birth_date = birth_date_str
        
        # Calculate comprehensive cosmic profile
        cosmic_profile = NumerologyCalculator.calculate_comprehensive_cosmic_profile(full_name, birth_date)
        
        if 'error' in cosmic_profile:
            return jsonify({'error': cosmic_profile['error']}), 400
        
        # Add user context for personalization
        user_context = {
            'user_id': g.current_user['id'],
            'zodiac_sign': g.current_user.get('zodiac_sign', 'Unknown'),
            'profile_completion': calculate_profile_completion(g.current_user)
        }
        
        # Generate personalized recommendations
        personalized_recommendations = generate_numerology_recommendations(
            cosmic_profile, 
            user_context
        )
        
        return jsonify({
            'success': True,
            'cosmic_profile': cosmic_profile,
            'user_context': user_context,
            'personalized_recommendations': personalized_recommendations,
            'next_steps': get_numerology_next_steps(cosmic_profile)
        }), 200
        
    except Exception as e:
        logging.error(f"Comprehensive numerology calculation error: {e}")
        return jsonify({'error': 'Failed to calculate comprehensive numerology'}), 500


@api_bp.route('/api/v1/numerology/personal-year', methods=['GET'])
@token_required 
def get_personal_year_analysis():
    """Get detailed personal year analysis for current or specified year"""
    try:
        from numerology import NumerologyCalculator

        # Get parameters
        year = int(request.args.get('year', datetime.now().year))
        birth_date_str = g.current_user.get('birth_date')
        
        if not birth_date_str:
            return jsonify({'error': 'Birth date required in user profile'}), 400
            
        birth_date = datetime.fromisoformat(birth_date_str.replace('Z', '+00:00'))
        
        # Calculate personal year with full forecast
        yearly_forecast = NumerologyCalculator.get_yearly_forecast(birth_date, year)
        personal_year = NumerologyCalculator.calculate_personal_year(birth_date, year)
        
        # Get compatibility with current date
        current_month = datetime.now().month
        personal_month = NumerologyCalculator.calculate_personal_month(birth_date, year, current_month)
        
        # Generate actionable insights
        actionable_insights = generate_personal_year_insights(
            personal_year, 
            personal_month,
            g.current_user.get('zodiac_sign')
        )
        
        return jsonify({
            'success': True,
            'personal_year': personal_year,
            'personal_month': personal_month,
            'yearly_forecast': yearly_forecast,
            'actionable_insights': actionable_insights,
            'cosmic_alignment': calculate_numerology_zodiac_alignment(
                personal_year['number'], 
                g.current_user.get('zodiac_sign')
            )
        }), 200
        
    except Exception as e:
        logging.error(f"Personal year analysis error: {e}")
        return jsonify({'error': 'Failed to calculate personal year analysis'}), 500


@api_bp.route('/api/v1/numerology/compatibility', methods=['POST'])
@token_required
def calculate_numerology_compatibility():
    """Calculate numerology compatibility between users"""
    try:
        from numerology import NumerologyCalculator
        
        data = request.get_json()
        other_user_id = data.get('other_user_id')
        
        if not other_user_id:
            return jsonify({'error': 'Other user ID required'}), 400
            
        # Get current user's numerology data
        user_birth_date = g.current_user.get('birth_date')
        user_name = g.current_user.get('full_name') or g.current_user.get('username')
        
        if not user_birth_date or not user_name:
            return jsonify({'error': 'Complete profile required for compatibility'}), 400
            
        user_birth_date = datetime.fromisoformat(user_birth_date.replace('Z', '+00:00'))
        user_core = NumerologyCalculator.calculate_comprehensive_readings(user_name, user_birth_date)
        
        # In production, fetch other user's data from database
        # For now, use provided data
        other_name = data.get('other_name', 'Unknown User')
        other_birth_date_str = data.get('other_birth_date')
        
        if other_birth_date_str:
            other_birth_date = datetime.fromisoformat(other_birth_date_str.replace('Z', '+00:00'))
            other_core = NumerologyCalculator.calculate_comprehensive_readings(other_name, other_birth_date)
        else:
            return jsonify({'error': 'Other user birth date required'}), 400
        
        # Calculate compatibility across all core numbers
        compatibility_results = {}
        
        for category in ['life_path', 'destiny', 'soul_urge', 'personality']:
            if (category in user_core and 'number' in user_core[category] and 
                category in other_core and 'number' in other_core[category]):
                
                user_num = user_core[category]['number']
                other_num = other_core[category]['number']
                
                compatibility_results[category] = NumerologyCalculator.get_numerology_compatibility(
                    user_num, other_num
                )
        
        # Calculate overall compatibility score
        overall_compatibility = calculate_overall_numerology_compatibility(compatibility_results)
        
        # Generate relationship insights
        relationship_insights = generate_numerology_relationship_insights(
            compatibility_results,
            overall_compatibility,
            user_core,
            other_core
        )
        
        return jsonify({
            'success': True,
            'user_profile': {
                'name': user_name,
                'core_numbers': user_core
            },
            'other_profile': {
                'name': other_name, 
                'core_numbers': other_core
            },
            'compatibility_breakdown': compatibility_results,
            'overall_compatibility': overall_compatibility,
            'relationship_insights': relationship_insights
        }), 200
        
    except Exception as e:
        logging.error(f"Numerology compatibility error: {e}")
        return jsonify({'error': 'Failed to calculate numerology compatibility'}), 500


@api_bp.route('/api/v1/numerology/feed-recommendations', methods=['GET'])
@token_required
def get_numerology_feed_recommendations():
    """Get numerology-based content recommendations for social feed"""
    try:
        from numerology import NumerologyCalculator

        # Get user's numerology profile
        birth_date_str = g.current_user.get('birth_date')
        user_name = g.current_user.get('full_name') or g.current_user.get('username')
        
        if not birth_date_str or not user_name:
            return jsonify({'error': 'Complete numerology profile required'}), 400
            
        birth_date = datetime.fromisoformat(birth_date_str.replace('Z', '+00:00'))
        
        # Calculate current cycles
        current_year = datetime.now().year
        current_month = datetime.now().month
        
        personal_year = NumerologyCalculator.calculate_personal_year(birth_date, current_year)
        personal_month = NumerologyCalculator.calculate_personal_month(birth_date, current_year, current_month)
        
        # Generate feed recommendations based on current numerology cycles
        feed_recommendations = generate_numerology_feed_content(personal_year, personal_month, g.current_user)
        
        # Get compatible user suggestions
        compatible_users = get_numerologically_compatible_users(g.current_user, personal_year['number'])
        
        # Generate daily numerology insight
        daily_insight = generate_daily_numerology_insight(personal_year, personal_month, g.current_user)
        
        return jsonify({
            'success': True,
            'current_cycles': {
                'personal_year': personal_year,
                'personal_month': personal_month
            },
            'feed_recommendations': feed_recommendations,
            'compatible_users': compatible_users,
            'daily_insight': daily_insight,
            'cosmic_timing': get_cosmic_timing_recommendations(personal_year, personal_month)
        }), 200
        
    except Exception as e:
        logging.error(f"Numerology feed recommendations error: {e}")
        return jsonify({'error': 'Failed to generate numerology recommendations'}), 500


# Helper functions for numerology API endpoints
def calculate_profile_completion(user_data: dict) -> float:
    """Calculate user profile completion percentage"""
    required_fields = ['full_name', 'birth_date', 'zodiac_sign']
    optional_fields = ['bio', 'interests', 'location', 'avatar_url']
    
    required_score = sum(1 for field in required_fields if user_data.get(field))
    optional_score = sum(1 for field in optional_fields if user_data.get(field))
    
    # Weight required fields more heavily
    total_possible = len(required_fields) * 2 + len(optional_fields)
    total_actual = required_score * 2 + optional_score
    
    return (total_actual / total_possible) * 100


def generate_numerology_recommendations(cosmic_profile: dict, user_context: dict) -> dict:
    """Generate personalized recommendations based on numerology profile"""
    try:
        recommendations = {
            'immediate_actions': [],
            'weekly_focus': [],
            'monthly_themes': [],
            'yearly_goals': [],
            'spiritual_practices': [],
            'crystal_work': []
        }
        
        # Get current cycles
        current_cycles = cosmic_profile.get('current_cycles', {})
        personal_year = current_cycles.get('personal_year', {})
        personal_month = current_cycles.get('personal_month', {})
        
        # Immediate actions based on personal month
        if personal_month.get('monthly_focus'):
            focus = personal_month['monthly_focus']['focus']
            recommendations['immediate_actions'].append(f"This month: {focus}")
            
            actions = personal_month['monthly_focus'].get('recommended_actions', [])
            recommendations['immediate_actions'].extend(actions[:2])
        
        # Weekly focus based on energy level
        if personal_month.get('monthly_focus', {}).get('energy_level'):
            energy = personal_month['monthly_focus']['energy_level']
            if 'High' in energy:
                recommendations['weekly_focus'].append("Take advantage of high energy - initiate projects")
            elif 'Low' in energy:
                recommendations['weekly_focus'].append("Use this reflective period for planning and introspection")
        
        # Yearly goals from personal year theme
        if personal_year.get('theme_data'):
            theme_data = personal_year['theme_data']
            recommendations['yearly_goals'].append(f"Year theme: {theme_data.get('theme', '')}")
            recommendations['yearly_goals'].append(f"Focus on: {theme_data.get('focus', '')}")
            
            if 'opportunities' in theme_data:
                recommendations['yearly_goals'].append(f"Opportunities: {theme_data['opportunities']}")
        
        # Crystal recommendations
        crystal_profile = cosmic_profile.get('crystal_profile', {})
        if crystal_profile.get('primary_crystals'):
            primary = crystal_profile['primary_crystals'][:3]
            recommendations['crystal_work'].extend([
                f"Carry {crystal_profile.get('daily_carry_recommendation', 'Clear Quartz')} daily",
                f"Meditate with: {', '.join(primary)}"
            ])
        
        # Spiritual practices based on chakra profile
        chakra_profile = cosmic_profile.get('chakra_profile', {})
        if chakra_profile.get('primary_chakras'):
            primary_chakra = chakra_profile['primary_chakras'][0][0]
            recommendations['spiritual_practices'].append(f"Focus on {primary_chakra} meditation")
        
        return recommendations
        
    except Exception as e:
        logging.error(f"Error generating numerology recommendations: {e}")
        return {'error': 'Failed to generate recommendations'}


def generate_personal_year_insights(personal_year: dict, personal_month: dict, zodiac_sign: str) -> dict:
    """Generate actionable insights for personal year and month"""
    try:
        insights = {
            'current_focus': '',
            'key_opportunities': [],
            'potential_challenges': [],
            'best_days': [],
            'avoid_dates': [],
            'zodiac_numerology_synergy': ''
        }
        
        # Current focus from personal year and month
        year_theme = personal_year.get('theme_data', {}).get('theme', '')
        month_focus = personal_month.get('monthly_focus', {}).get('focus', '')
        
        insights['current_focus'] = f"Year: {year_theme}. Month: {month_focus}"
        
        # Opportunities and challenges
        theme_data = personal_year.get('theme_data', {})
        opportunities = theme_data.get('opportunities', '')
        challenges = theme_data.get('challenges', '')
        
        if opportunities:
            insights['key_opportunities'] = opportunities.split(', ')[:3]
        if challenges:
            insights['potential_challenges'] = challenges.split(', ')[:3]
        
        # Zodiac-numerology synergy
        personal_year_num = personal_year.get('number', 1)
        synergy = calculate_numerology_zodiac_synergy(personal_year_num, zodiac_sign)
        insights['zodiac_numerology_synergy'] = synergy
        
        return insights
        
    except Exception as e:
        logging.error(f"Error generating personal year insights: {e}")
        return {'error': 'Failed to generate insights'}


def calculate_numerology_zodiac_alignment(personal_year_number: int, zodiac_sign: str) -> dict:
    """Calculate alignment between numerology and zodiac energies"""
    try:
        # Element mapping for zodiac signs
        zodiac_elements = {
            'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
            'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
            'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
            'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
        }
        
        # Numerology element mapping
        numerology_elements = {
            1: 'Fire', 2: 'Water', 3: 'Air', 4: 'Earth', 5: 'Air',
            6: 'Earth', 7: 'Water', 8: 'Fire', 9: 'Fire', 11: 'Air', 22: 'Earth'
        }
        
        zodiac_element = zodiac_elements.get(zodiac_sign, 'Unknown')
        numerology_element = numerology_elements.get(personal_year_number, 'Unknown')
        
        # Calculate alignment score
        if zodiac_element == numerology_element:
            alignment_score = 1.0
            alignment_description = "Perfect harmony - zodiac and numerology elements match"
        elif ((zodiac_element == 'Fire' and numerology_element == 'Air') or 
              (zodiac_element == 'Air' and numerology_element == 'Fire') or
              (zodiac_element == 'Earth' and numerology_element == 'Water') or
              (zodiac_element == 'Water' and numerology_element == 'Earth')):
            alignment_score = 0.8
            alignment_description = "Harmonious - complementary elemental energies"
        else:
            alignment_score = 0.6
            alignment_description = "Challenging - requires balance between different energies"
        
        return {
            'zodiac_element': zodiac_element,
            'numerology_element': numerology_element,
            'alignment_score': alignment_score,
            'alignment_description': alignment_description,
            'integration_advice': get_element_integration_advice(zodiac_element, numerology_element)
        }
        
    except Exception as e:
        logging.error(f"Error calculating zodiac-numerology alignment: {e}")
        return {'error': 'Failed to calculate alignment'}


def calculate_numerology_zodiac_synergy(personal_year_number: int, zodiac_sign: str) -> str:
    """Calculate synergy between personal year number and zodiac sign"""
    synergy_combinations = {
        (1, 'Aries'): "Double fire energy - exceptional year for leadership and new ventures",
        (1, 'Leo'): "Royal fire combination - year for creative leadership and recognition", 
        (2, 'Cancer'): "Deep emotional wisdom - year for nurturing relationships and intuition",
        (2, 'Pisces'): "Spiritual sensitivity - year for psychic development and compassion",
        (3, 'Gemini'): "Communication mastery - exceptional year for writing and networking",
        (3, 'Sagittarius'): "Expansive expression - year for teaching and inspiring others",
        (4, 'Taurus'): "Stable building energy - excellent year for financial and material progress",
        (4, 'Capricorn'): "Master builder combination - year for significant career achievements",
        (5, 'Aquarius'): "Revolutionary change - year for innovation and breakthrough thinking",
        (6, 'Libra'): "Harmony and beauty - year for relationships and artistic pursuits",
        (7, 'Scorpio'): "Deep transformation - powerful year for spiritual and psychological growth",
        (8, 'Leo'): "Royal authority - exceptional year for business success and recognition",
        (9, 'Pisces'): "Universal love - year for humanitarian service and spiritual completion"
    }
    
    key = (personal_year_number, zodiac_sign)
    return synergy_combinations.get(key, f"{zodiac_sign} energy combines with Personal Year {personal_year_number} for unique growth opportunities")


def get_element_integration_advice(zodiac_element: str, numerology_element: str) -> str:
    """Get advice for integrating zodiac and numerology elements"""
    if zodiac_element == numerology_element:
        return f"Embrace your strong {zodiac_element} nature this year - it's perfectly aligned with cosmic timing"
    
    integration_advice = {
        ('Fire', 'Water'): "Balance passion with intuition - let emotions guide your actions",
        ('Fire', 'Air'): "Your fiery nature gets intellectual wings - communicate your passions",
        ('Fire', 'Earth'): "Ground your enthusiasm in practical steps - build lasting foundations",
        ('Water', 'Fire'): "Let your intuition ignite action - emotional insights lead to breakthroughs", 
        ('Water', 'Air'): "Express your emotions through communication - share your inner wisdom",
        ('Water', 'Earth'): "Your emotional depth creates solid foundations - nurture practical growth",
        ('Air', 'Fire'): "Your ideas need passionate action - communicate with enthusiasm",
        ('Air', 'Water'): "Let your thoughts connect with emotions - intuitive communication",
        ('Air', 'Earth'): "Ground your ideas in practical reality - manifest your visions",
        ('Earth', 'Fire'): "Your stability provides foundation for passionate pursuits",
        ('Earth', 'Water'): "Nurture your practical nature with emotional wisdom",
        ('Earth', 'Air'): "Build structures for your ideas - practical thinking leads to success"
    }
    
    return integration_advice.get((zodiac_element, numerology_element), "Find balance between your natural zodiac energy and this year's numerological influence")


def calculate_overall_numerology_compatibility(compatibility_results: dict) -> dict:
    """Calculate overall compatibility score from individual number comparisons"""
    try:
        if not compatibility_results:
            return {'score': 0.5, 'level': 'Unknown', 'description': 'Insufficient data'}
            
        scores = [result['compatibility_score'] for result in compatibility_results.values()]
        average_score = sum(scores) / len(scores)
        
        # Determine compatibility level
        if average_score >= 0.8:
            level = "Excellent"
            description = "Strong numerological harmony across all areas"
        elif average_score >= 0.7:
            level = "Very Good" 
            description = "Good numerological compatibility with minor challenges"
        elif average_score >= 0.6:
            level = "Good"
            description = "Moderate compatibility requiring understanding"
        elif average_score >= 0.5:
            level = "Fair"
            description = "Some compatibility with effort needed"
        else:
            level = "Challenging"
            description = "Significant differences requiring patience and communication"
        
        return {
            'score': round(average_score, 2),
            'level': level, 
            'description': description,
            'strongest_area': max(compatibility_results.items(), key=lambda x: x[1]['compatibility_score'])[0],
            'growth_area': min(compatibility_results.items(), key=lambda x: x[1]['compatibility_score'])[0]
        }
        
    except Exception as e:
        logging.error(f"Error calculating overall compatibility: {e}")
        return {'score': 0.5, 'level': 'Unknown', 'description': 'Calculation error'}


def generate_numerology_relationship_insights(compatibility_results: dict, overall: dict, user_core: dict, other_core: dict) -> dict:
    """Generate detailed relationship insights from numerology compatibility"""
    try:
        insights = {
            'relationship_strengths': [],
            'growth_opportunities': [],
            'communication_style': '',
            'conflict_resolution': '',
            'shared_goals': [],
            'individual_growth': []
        }
        
        # Analyze life path compatibility
        if 'life_path' in compatibility_results:
            life_path_compat = compatibility_results['life_path']
            if life_path_compat['compatibility_score'] >= 0.7:
                insights['relationship_strengths'].append("Strong life path harmony - shared life direction")
            else:
                insights['growth_opportunities'].append("Different life paths offer learning opportunities")
        
        # Communication insights from destiny numbers
        if 'destiny' in compatibility_results:
            destiny_compat = compatibility_results['destiny']
            if destiny_compat['compatibility_score'] >= 0.7:
                insights['communication_style'] = "Natural understanding in expression and goals"
            else:
                insights['communication_style'] = "Different communication styles require patience"
        
        # Emotional compatibility from soul urge
        if 'soul_urge' in compatibility_results:
            soul_compat = compatibility_results['soul_urge']
            if soul_compat['compatibility_score'] >= 0.7:
                insights['relationship_strengths'].append("Deep emotional understanding and shared values")
            else:
                insights['growth_opportunities'].append("Different emotional needs require understanding")
        
        return insights
        
    except Exception as e:
        logging.error(f"Error generating relationship insights: {e}")
        return {'error': 'Failed to generate relationship insights'}


def generate_numerology_feed_content(personal_year: dict, personal_month: dict, user_data: dict) -> dict:
    """Generate numerology-based content recommendations for social feed"""
    try:
        recommendations = {
            'content_types': [],
            'hashtags': [],
            'post_themes': [],
            'engagement_timing': '',
            'collaboration_suggestions': []
        }
        
        year_number = personal_year.get('number', 1)
        month_number = personal_month.get('number', 1)
        
        # Content type recommendations based on numbers
        content_mapping = {
            1: ['leadership_posts', 'new_project_announcements', 'motivational_content'],
            2: ['collaboration_posts', 'relationship_content', 'supportive_messages'],
            3: ['creative_content', 'social_updates', 'artistic_shares'],
            4: ['progress_updates', 'organizational_tips', 'foundation_building'],
            5: ['travel_content', 'adventure_posts', 'change_announcements'],
            6: ['family_content', 'nurturing_posts', 'community_service'],
            7: ['wisdom_sharing', 'spiritual_content', 'analytical_posts'],
            8: ['achievement_posts', 'business_content', 'success_stories'],
            9: ['humanitarian_content', 'completion_celebrations', 'wisdom_sharing']
        }
        
        recommendations['content_types'] = content_mapping.get(year_number, ['general_updates'])
        
        # Generate relevant hashtags
        hashtag_mapping = {
            1: ['#NewBeginnings', '#Leadership', '#Innovation'],
            2: ['#Collaboration', '#Relationships', '#Harmony'],
            3: ['#Creativity', '#Expression', '#Social'],
            4: ['#Progress', '#Building', '#Foundation'],
            5: ['#Adventure', '#Change', '#Freedom'],
            6: ['#Family', '#Community', '#Service'],
            7: ['#Wisdom', '#Spiritual', '#Insight'],
            8: ['#Success', '#Achievement', '#Business'],
            9: ['#Completion', '#Service', '#Wisdom']
        }
        
        recommendations['hashtags'] = hashtag_mapping.get(year_number, ['#CosmicJourney'])
        
        # Engagement timing based on numerology
        if month_number in [1, 3, 5, 8]:
            recommendations['engagement_timing'] = "High energy month - increase posting frequency"
        elif month_number in [2, 4, 6]:
            recommendations['engagement_timing'] = "Steady energy - maintain consistent posting"
        else:
            recommendations['engagement_timing'] = "Reflective period - focus on meaningful content"
        
        return recommendations
        
    except Exception as e:
        logging.error(f"Error generating numerology feed content: {e}")
        return {'error': 'Failed to generate feed recommendations'}


def get_numerologically_compatible_users(current_user: dict, personal_year_number: int) -> list:
    """Get suggestions for numerologically compatible users (mock implementation)"""
    # In production, this would query the database for users with compatible numerology
    compatible_numbers = [1, 3, 5] if personal_year_number in [1, 3, 5] else [2, 4, 6, 8, 9]
    
    # Mock compatible users
    mock_users = [
        {'username': f'CosmicUser{num}', 'personal_year': num, 'compatibility_score': 0.8}
        for num in compatible_numbers[:3]
    ]
    
    return mock_users


def generate_daily_numerology_insight(personal_year: dict, personal_month: dict, user_data: dict) -> dict:
    """Generate daily numerology insight for feed"""
    try:
        year_number = personal_year.get('number', 1)
        month_number = personal_month.get('number', 1)
        
        # Combine year and month energies for daily insight
        daily_number = (year_number + month_number + datetime.now().day) % 9
        if daily_number == 0:
            daily_number = 9
        
        daily_insights = {
            1: "Today's energy supports new beginnings and taking initiative",
            2: "Focus on cooperation and building relationships today",
            3: "Express your creativity and connect with others socially",
            4: "Organize, plan, and build solid foundations today",
            5: "Embrace change and seek new experiences",
            6: "Nurture your relationships and take care of responsibilities",
            7: "Seek inner wisdom and spend time in reflection",
            8: "Focus on material goals and business matters",
            9: "Complete projects and help others today"
        }
        
        return {
            'daily_number': daily_number,
            'insight': daily_insights.get(daily_number, "Trust your inner guidance today"),
            'recommended_action': f"Channel {daily_number} energy into your most important task",
            'cosmic_timing': "Optimal" if daily_number == year_number else "Supportive"
        }
        
    except Exception as e:
        logging.error(f"Error generating daily insight: {e}")
        return {'error': 'Failed to generate daily insight'}


def get_cosmic_timing_recommendations(personal_year: dict, personal_month: dict) -> dict:
    """Get cosmic timing recommendations for activities"""
    try:
        year_number = personal_year.get('number', 1)
        month_number = personal_month.get('number', 1)
        
        # Timing recommendations based on numbers
        timing_map = {
            1: {'best_for': 'Starting new projects', 'avoid': 'Major endings'},
            2: {'best_for': 'Building partnerships', 'avoid': 'Aggressive actions'},
            3: {'best_for': 'Creative projects', 'avoid': 'Serious commitments'},
            4: {'best_for': 'Organization and planning', 'avoid': 'Impulsive decisions'},
            5: {'best_for': 'Travel and change', 'avoid': 'Routine commitments'},
            6: {'best_for': 'Family and home matters', 'avoid': 'Selfish pursuits'},
            7: {'best_for': 'Study and reflection', 'avoid': 'Social overcommitment'},
            8: {'best_for': 'Business and finances', 'avoid': 'Emotional decisions'},
            9: {'best_for': 'Completing projects', 'avoid': 'Starting new ventures'}
        }
        
        return {
            'year_timing': timing_map.get(year_number, {'best_for': 'General growth', 'avoid': 'Rushing decisions'}),
            'month_timing': timing_map.get(month_number, {'best_for': 'Following intuition', 'avoid': 'Forcing outcomes'}),
            'integration_advice': f"Align your actions with both year {year_number} and month {month_number} energies"
        }
        
    except Exception as e:
        logging.error(f"Error getting cosmic timing: {e}")
        return {'error': 'Failed to get timing recommendations'}


def get_numerology_next_steps(cosmic_profile: dict) -> list:
    """Get next steps for user based on their numerology profile"""
    try:
        next_steps = []
        
        # Check for life path number recommendations
        core_numbers = cosmic_profile.get('core_numbers', {})
        if 'life_path' in core_numbers:
            life_path_num = core_numbers['life_path'].get('number')
            next_steps.append(f"Embrace your Life Path {life_path_num} qualities in daily life")
        
        # Current cycle recommendations
        current_cycles = cosmic_profile.get('current_cycles', {})
        if current_cycles.get('personal_year'):
            year_advice = current_cycles['personal_year'].get('theme_data', {}).get('advice')
            if year_advice:
                next_steps.append(year_advice)
        
        # Crystal work suggestions
        crystal_profile = cosmic_profile.get('crystal_profile', {})
        if crystal_profile.get('daily_carry_recommendation'):
            crystal = crystal_profile['daily_carry_recommendation']
            next_steps.append(f"Start carrying {crystal} for daily energy alignment")
        
        return next_steps[:3]  # Limit to 3 actionable steps
        
    except Exception as e:
        logging.error(f"Error getting next steps: {e}")
        return ["Continue your cosmic journey with awareness and intention"]

# ==================== BADGE SYSTEM API ====================

@api_bp.route('/api/v1/badges/manifest', methods=['GET'])
def get_badge_manifests():
    """Get all available badge manifests"""
    try:
        from badge_system import badge_engine

        # Return all badge manifests with public info
        manifests = []
        for badge_id, manifest in badge_engine.badge_manifests.items():
            public_manifest = {
                'id': badge_id,
                'metadata': manifest.get('metadata', {}),
                'rarity': manifest.get('rarity', 'common'),
                'category': manifest.get('metadata', {}).get('category', 'general'),
                'unlock_hint': _get_unlock_hint(manifest)
            }
            manifests.append(public_manifest)
            
        return jsonify({
            'success': True,
            'manifests': manifests,
            'total_count': len(manifests)
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting badge manifests: {e}")
        return jsonify({'error': 'Failed to get badge manifests'}), 500

@api_bp.route('/api/v1/badges/user', methods=['GET'])
@api_bp.route('/api/v1/badges/user/<user_id>', methods=['GET'])
@token_required  
def get_user_badges(current_user, user_id=None):
    """Get user's badge collection"""
    try:
        from badge_system import badge_engine

        # Use current user's ID if not specified
        target_user_id = user_id if user_id else current_user.get('id')
        
        # Users can only see their own badges (privacy)
        if str(target_user_id) != str(current_user.get('id')):
            return jsonify({'error': 'Cannot view other users badges'}), 403
        
        include_locked = request.args.get('include_locked', 'false').lower() == 'true'
        badges = badge_engine.get_user_badges(str(target_user_id), include_locked)
        
        return jsonify({
            'success': True,
            'badges': badges
        }), 200
        
    except Exception as e:
        logging.error(f"Error getting user badges: {e}")
        return jsonify({'error': 'Failed to get user badges'}), 500

@api_bp.route('/api/v1/badges/check-unlock', methods=['POST'])
@token_required
def check_badge_unlocks(current_user):
    """Check for newly unlocked badges"""
    try:
        from badge_system import badge_engine
        
        user_id = str(current_user.get('id'))
        newly_unlocked = badge_engine.check_user_badge_unlocks(user_id)
        
        return jsonify({
            'success': True,
            'newly_unlocked': newly_unlocked,
            'count': len(newly_unlocked)
        }), 200
        
    except Exception as e:
        logging.error(f"Error checking badge unlocks: {e}")
        return jsonify({'error': 'Failed to check badge unlocks'}), 500

@api_bp.route('/api/v1/badges/equip/<badge_id>', methods=['PUT'])
@token_required
def equip_badge(current_user, badge_id):
    """Equip or unequip a badge for display"""
    try:
        user_id = str(current_user.get('id'))
        data = request.get_json() or {}
        equipped = data.get('equipped', True)
        
        # Update badge equipped status
        container = get_cosmos_helper().get_container('user_badges')
        record_id = f"{user_id}_{badge_id}"
        
        try:
            badge_record = container.read_item(item=record_id, partition_key=user_id)
            
            # Verify user owns this badge
            if badge_record.get('status') != 'unlocked':
                return jsonify({'error': 'Badge not unlocked'}), 403
                
            badge_record['equipped'] = equipped
            if equipped:
                badge_record['display_order'] = data.get('display_order', 1)
                
            container.upsert_item(badge_record)
            
            return jsonify({
                'success': True,
                'message': f"Badge {'equipped' if equipped else 'unequipped'} successfully"
            }), 200
            
        except Exception:
            return jsonify({'error': 'Badge not found'}), 404
            
    except Exception as e:
        logging.error(f"Error equipping badge: {e}")
        return jsonify({'error': 'Failed to equip badge'}), 500

def _get_unlock_hint(manifest: dict) -> str:
    """Generate helpful unlock hint from manifest conditions"""
    try:
        conditions = manifest.get('unlock_conditions', {}).get('conditions', [])
        if not conditions:
            return "Complete cosmic activities to unlock"
            
        hints = []
        for condition in conditions[:2]:  # Show max 2 hints
            condition_type = condition['condition_type']
            target = condition['target_value']
            
            if 'posts' in condition_type:
                hints.append(f"Create {target}+ posts")
            elif 'tarot' in condition_type:
                hints.append(f"Complete {target}+ tarot readings")
            elif 'interactions' in condition_type:
                hints.append(f"Engage with community {target}+ times")
            else:
                hints.append(condition.get('description', 'Complete special activities'))
                
        return " • ".join(hints)
        
    except:
        return "Complete cosmic activities to unlock"

# Socket.IO event handlers
@socketio.on('join_post')
def handle_join_post(data):
    post_id = data.get('post_id')
    if post_id:
        join_room(f'post_{post_id}')
        emit('post_joined', {'post_id': post_id})

@socketio.on('join_stream')
def handle_join_stream(data):
    stream_id = data.get('stream_id')
    if stream_id:
        join_room(f'stream_{stream_id}')
        emit('stream_joined', {'stream_id': stream_id})

@socketio.on('join_notifications')
def handle_join_notifications(data):
    user_id = data.get('user_id')
    if user_id:
        join_room(f'user_{user_id}')
        emit('notifications_joined', {'user_id': user_id})

@socketio.on('typing_start')
def handle_typing_start(data):
    post_id = data.get('post_id')
    username = data.get('username')
    if post_id and username:
        emit('user_typing', {'username': username, 'post_id': post_id}, room=f'post_{post_id}', include_self=False)

@socketio.on('typing_stop')
def handle_typing_stop(data):
    post_id = data.get('post_id')
    username = data.get('username')
    if post_id and username:
        emit('user_stopped_typing', {'username': username, 'post_id': post_id}, room=f'post_{post_id}', include_self=False)

@socketio.on('user_action')
def handle_user_action(data):
    """Handle user actions (like, comment, follow, share) and emit zodiac-themed notifications"""
    try:
        user_id = data.get('user_id')
        action_type = data.get('action_type')  # 'like', 'comment', 'follow', 'share'
        room = data.get('room', 'cosmos')

        if not user_id or not action_type:
            return

        # Get user data from Cosmos DB
        cosmos_helper = get_cosmos_helper()
        user_query = "SELECT * FROM users WHERE id = @user_id"
        users = cosmos_helper.query_items(user_query, parameters=[{"name": "@user_id", "value": user_id}])

        if not users:
            return

        user = users[0]
        chinese_zodiac = user.get('chinese_zodiac', 'Rat')
        western_zodiac = user.get('western_zodiac')

        # Determine which zodiac system to use (prefer Western if available)
        zodiac_sign = western_zodiac if western_zodiac else chinese_zodiac
        zodiac_actions = WESTERN_ZODIAC_ACTIONS if western_zodiac else CHINESE_ZODIAC_ACTIONS

        # Get the zodiac action
        action = zodiac_actions.get(zodiac_sign, {}).get(action_type, action_type)

        # Emit action notification to the room
        socketio.emit('action_notification', {
            'user_id': user_id,
            'username': user.get('username', 'Unknown'),
            'action': action,
            'action_type': action_type,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }, room=room)

    except Exception as e:
        logging.error(f"Error handling user action: {e}")

@api_bp.route('/api/v1/cosmic-profile-display/<user_id>', methods=['GET'])
@token_required
def cosmic_profile_display(current_user, user_id):
    """Get comprehensive cosmic profile data optimized for display system"""
    try:
        cosmos_helper = get_cosmos_helper()
        profiles_container = cosmos_helper.get_container('profiles')
        
        # Get profile data
        profile_query = "SELECT * FROM profiles WHERE userId = @user_id"
        profiles = cosmos_helper.query_items_from_container(
            profiles_container, 
            profile_query, 
            parameters=[{"name": "@user_id", "value": user_id}]
        )
        
        if not profiles:
            return jsonify({'error': 'Profile not found'}), 404
        
        profile = profiles[0]
        
        # Generate elemental balance if not present
        if 'elementalBalance' not in profile:
            zodiac_sign = profile.get('zodiacSigns', {}).get('western', 'scorpio').lower()
            elemental_map = {
                'aries': {'fire': 40, 'earth': 20, 'air': 25, 'water': 15},
                'taurus': {'fire': 15, 'earth': 45, 'air': 20, 'water': 20},
                'gemini': {'fire': 25, 'earth': 15, 'air': 45, 'water': 15},
                'cancer': {'fire': 15, 'earth': 25, 'air': 15, 'water': 45},
                'leo': {'fire': 45, 'earth': 20, 'air': 20, 'water': 15},
                'virgo': {'fire': 15, 'earth': 40, 'air': 30, 'water': 15},
                'libra': {'fire': 20, 'earth': 20, 'air': 40, 'water': 20},
                'scorpio': {'fire': 25, 'earth': 20, 'air': 15, 'water': 40},
                'sagittarius': {'fire': 40, 'earth': 15, 'air': 30, 'water': 15},
                'capricorn': {'fire': 15, 'earth': 45, 'air': 20, 'water': 20},
                'aquarius': {'fire': 20, 'earth': 15, 'air': 50, 'water': 15},
                'pisces': {'fire': 15, 'earth': 20, 'air': 20, 'water': 45}
            }
            profile['elementalBalance'] = elemental_map.get(zodiac_sign, {
                'fire': 25, 'earth': 25, 'air': 25, 'water': 25
            })
        
        # Generate sample badges if not present
        if 'badges' not in profile or not profile['badges']:
            archetype = profile.get('archetype', {}).get('primary', 'seeker')
            zodiac = profile.get('zodiacSigns', {}).get('western', 'scorpio')
            
            sample_badges = [
                {
                    'id': f'{zodiac}_master',
                    'name': f'{zodiac.title()} Master',
                    'category': 'zodiac',
                    'x': 100,
                    'y': 50,
                    'earned_at': datetime.now(timezone.utc).isoformat(),
                    'rarity': 'epic'
                },
                {
                    'id': f'{archetype}_initiate',
                    'name': f'{archetype.title()} Initiate',
                    'category': 'archetype',
                    'x': 200,
                    'y': 100,
                    'earned_at': datetime.now(timezone.utc).isoformat(),
                    'rarity': 'rare'
                },
                {
                    'id': 'cosmic_awakening',
                    'name': 'Cosmic Awakening',
                    'category': 'ritual',
                    'x': 150,
                    'y': 150,
                    'earned_at': datetime.now(timezone.utc).isoformat(),
                    'rarity': 'legendary'
                }
            ]
            profile['badges'] = sample_badges
        
        # Prepare display-optimized data
        display_data = {
            'id': profile.get('id'),
            'userId': profile.get('userId'),
            'zodiacSigns': profile.get('zodiacSigns', {}),
            'numerology': profile.get('numerology', {}),
            'archetype': profile.get('archetype', {}),
            'selectedSigil': profile.get('selectedSigil'),
            'badges': profile.get('badges', []),
            'elementalBalance': profile['elementalBalance'],
            'lastUpdated': profile.get('updated_at', datetime.now(timezone.utc).isoformat())
        }
        
        logging.info(f"Cosmic profile display data retrieved for user {user_id}")
        
        return jsonify({
            'profile': display_data,
            'displayModes': ['shrine', 'carousel', 'orbit', 'grid'],
            'elementalDominance': max(profile['elementalBalance'], key=profile['elementalBalance'].get),
            'badgeCount': len(profile.get('badges', [])),
            'sigilSelected': bool(profile.get('selectedSigil'))
        })
        
    except Exception as e:
        logging.error(f"Cosmic profile display error: {e}")
        return jsonify({'error': 'Failed to retrieve cosmic profile display data'}), 500

@api_bp.route('/api/v1/badges/position', methods=['PUT'])
@token_required  
def update_badge_positions(current_user):
    """Update badge positions on cosmic profile"""
    try:
        data = request.get_json()
        user_id = current_user['id']
        badge_positions = data.get('badges', [])
        
        cosmos_helper = get_cosmos_helper()
        profiles_container = cosmos_helper.get_container('profiles')
        
        # Get profile
        profile_query = "SELECT * FROM profiles WHERE userId = @user_id"
        profiles = cosmos_helper.query_items_from_container(
            profiles_container, 
            profile_query, 
            parameters=[{"name": "@user_id", "value": user_id}]
        )
        
        if not profiles:
            return jsonify({'error': 'Profile not found'}), 404
        
        profile = profiles[0]
        
        # Update badge positions
        existing_badges = profile.get('badges', [])
        for new_badge in badge_positions:
            badge_id = new_badge.get('id')
            for i, existing_badge in enumerate(existing_badges):
                if existing_badge.get('id') == badge_id:
                    existing_badges[i]['x'] = new_badge.get('x', existing_badge.get('x', 0))
                    existing_badges[i]['y'] = new_badge.get('y', existing_badge.get('y', 0))
                    break
        
        profile['badges'] = existing_badges
        profile['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        profiles_container.upsert_item(profile)
        
        return jsonify({
            'message': 'Badge positions updated successfully',
            'badges': existing_badges
        })
        
    except Exception as e:
        logging.error(f"Badge position update error: {e}")
        return jsonify({'error': 'Failed to update badge positions'}), 500