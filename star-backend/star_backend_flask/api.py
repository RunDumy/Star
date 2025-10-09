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
from flask import Blueprint, g, jsonify, request, current_app
from flask_socketio import SocketIO, emit, join_room
from marshmallow import Schema, ValidationError, fields
from .main import check_username_exists, create_user, get_user_by_username, update_user_online_status
from .star_auth import token_required
from .oracle_engine import OccultOracleEngine
from .cosmos_db import get_cosmos_helper


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
        # Fetch posts
        posts = cosmos_helper.get_posts(limit=50)

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