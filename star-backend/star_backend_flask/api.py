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

import redis
import requests
from agora_token_builder import Role_Attendee, Role_Publisher, RtcTokenBuilder
from flask import Blueprint, g, jsonify, request
from flask_socketio import SocketIO, emit, join_room
from .main import supabase

from .star_auth import token_required


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
        
        # Upload compressed video and HLS segments to Supabase Storage
        video_path = f"posts/{post_id}/video_{uuid.uuid4()}.mp4"
        supabase.storage.from_('posts').upload(video_path, open(compressed_path, 'rb').read())
        
        # Upload HLS files
        for file in os.listdir(hls_path):
            file_path = os.path.join(hls_path, file)
            supabase.storage.from_('posts').upload(f"posts/{post_id}/hls/{file}", open(file_path, 'rb').read())
        
        return supabase.storage.from_('posts').get_public_url(video_path), supabase.storage.from_('posts').get_public_url(f"posts/{post_id}/hls/playlist.m3u8")

api_bp = Blueprint('api_bp', __name__)

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
            supabase.table('profiles').update({
                'spotify_access_token': token_response['access_token'],
                'spotify_refresh_token': token_response.get('refresh_token'),
                'spotify_token_expires': token_response.get('expires_in'),
            }).eq('id', user_id).execute()
            return jsonify({'success': True, 'access_token': token_response['access_token']})
        else:
            return jsonify({'error': 'Token exchange failed', 'details': token_response.get('error')}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/posts', methods=['GET'])
@token_required
def get_posts():
    try:
        # Fetch posts with user details
        response = supabase.table('posts').select('id, user_id, content, media_url, zodiac_sign, created_at, profiles(display_name)').order('created_at', desc=True).execute()
        posts = response.data

        # Fetch likes count for each post
        for post in posts:
            likes = supabase.table('likes').select('id').eq('post_id', post['id']).execute()
            post['like_count'] = len(likes.data)
            post['liked_by_user'] = bool(supabase.table('likes').select('id').eq('post_id', post['id']).eq('user_id', g.user['sub']).execute().data)

            # Fetch comments
            comments = supabase.table('comments').select('id, user_id, content, created_at, profiles(display_name)').eq('post_id', post['id']).order('created_at').execute()
            post['comments'] = comments.data

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
        profile = supabase.table('profiles').select('zodiac_sign').eq('id', user_id).single().execute()
        zodiac_sign = profile.data['zodiac_sign'] if profile.data else 'Aries'

        post_data = {
            'user_id': user_id,
            'content': content,
            'zodiac_sign': zodiac_sign
        }

        if image_file:
            image_path = f"posts/{uuid.uuid4()}/image_{uuid.uuid4()}.{image_file.filename.split('.')[-1]}"
            supabase.storage.from_('posts').upload(image_path, image_file.read())
            post_data['image_url'] = supabase.storage.from_('posts').get_public_url(image_path)

        if video_file:
            if video_file.content_type not in ['video/mp4', 'video/webm']:
                return jsonify({'success': False, 'error': 'Unsupported video format. Use MP4 or WebM'}), 400
            video_url, hls_url = compress_and_generate_hls(video_file, str(uuid.uuid4()))
            post_data['video_url'] = video_url
            post_data['hls_url'] = hls_url

        # Create post
        response = supabase.table('posts').insert(post_data).execute()
        post_id = response.data[0]['id']

        # Store tags
        for tag in tags:
            if tag.strip():
                supabase.table('post_tags').insert({
                    'post_id': post_id,
                    'tag': tag.strip()
                }).execute()

        # Notify followers
        followers = supabase.table('follow').select('follower_id').eq('following_id', user_id).execute().data
        for follower in followers:
            notification = {
                'id': str(uuid.uuid4()),
                'user_id': follower['follower_id'],
                'message': f"{zodiac_sign} created a new post!",
                'type': 'post',
                'related_id': post_id,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'is_read': False
            }
            supabase.table('notification').insert(notification).execute()
            socketio.emit('notification', notification, room=f"user_{follower['follower_id']}")

        return jsonify({'success': True, 'post': response.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/posts/<int:post_id>/like', methods=['POST'])
@token_required
def like_post(post_id):
    user_id = g.user['sub']
    try:
        # Check if already liked
        existing_like = supabase.table('likes').select('id').eq('post_id', post_id).eq('user_id', user_id).execute()
        if existing_like.data:
            # Unlike
            supabase.table('likes').delete().eq('post_id', post_id).eq('user_id', user_id).execute()
            return jsonify({'success': True, 'liked': False})
        else:
            # Like
            supabase.table('likes').insert({'post_id': post_id, 'user_id': user_id}).execute()
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
        response = supabase.table('comments').insert({
            'post_id': post_id,
            'user_id': user_id,
            'content': content
        }).execute()
        return jsonify({'success': True, 'comment': response.data[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/comments/<string:post_id>', methods=['GET'])
@token_required
def get_comments(current_user, post_id):
    page = int(request.args.get('page', 1))
    per_page = 20
    comments = supabase.table('comment').select('*').eq('post_id', post_id).order('created_at', desc=True).range((page - 1) * per_page, page * per_page - 1).execute().data
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
    supabase.table("zodiac_dna").upsert({
        "user_id": current_user.id,
        "trait_name": trait_name,
        "zodiac_sign": zodiac_sign,
        "strength": strength
    }).execute()
    return jsonify({"success": True, "message": "DNA updated"})

@api_bp.route("/api/v1/zodiac-dna", methods=["GET"])
@token_required
def get_dna(current_user):
    dna = supabase.table("zodiac_dna").select("*").eq("user_id", current_user.id).execute().data
    return jsonify({"success": True, "dna": dna})

@api_bp.route("/api/v1/transit", methods=["GET"])
@token_required
def get_transit(current_user):
    transit = random.choice(list(TRANSIT_TRAIT_MAP.keys()))
    trait = TRANSIT_TRAIT_MAP[transit]
    
    # Fetch current DNA
    dna = supabase.table("zodiac_dna").select("*").eq("user_id", current_user.id).eq("trait_name", trait["trait_name"]).execute().data
    current_strength = dna[0]["strength"] if dna else 0.5
    new_strength = min(current_strength + trait["strength_boost"], 1.0)
    
    # Update DNA
    supabase.table("zodiac_dna").upsert({
        "user_id": current_user.id,
        "trait_name": trait["trait_name"],
        "zodiac_sign": trait["zodiac_sign"],
        "strength": new_strength
    }).execute()
    
    # Log interaction
    supabase.table("user_interactions").insert({
        "user_id": current_user.id,
        "interaction_type": "transit_view",
        "zodiac_sign": trait["zodiac_sign"],
        "details": {"transit": transit, "timestamp": datetime.now(timezone.utc).isoformat()}
    }).execute()
    
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
    
    dna = supabase.table("zodiac_dna").select("*").eq("user_id", current_user.id).eq("trait_name", trait["trait_name"]).execute().data
    current_strength = dna[0]["strength"] if dna else 0.5
    new_strength = min(current_strength + trait["strength_boost"], 1.0)
    
    supabase.table("zodiac_dna").upsert({
        "user_id": current_user.id,
        "trait_name": trait["trait_name"],
        "zodiac_sign": trait["zodiac_sign"],
        "strength": new_strength
    }).execute()
    
    supabase.table("user_interactions").insert({
        "user_id": current_user.id,
        "interaction_type": "tarot_pull",
        "zodiac_sign": trait["zodiac_sign"],
        "details": {"card": card}
    }).execute()
    
    return jsonify({"success": True, "card": card, "trait": trait["trait_name"], "strength": new_strength})

@api_bp.route("/api/v1/transit-mappings", methods=["GET"])
@token_required
def get_transit_mappings(current_user):
    """Return all available transit mappings for frontend reference"""
    return jsonify({"success": True, "mappings": TRANSIT_TRAIT_MAP})

@api_bp.route("/api/v1/timeline", methods=["GET"])
@token_required
def get_timeline(current_user):
    interactions = supabase.table("user_interactions").select("*").eq("user_id", current_user.id).order("created_at", desc=True).limit(10).execute().data
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
    supabase.table("user_interactions").insert({
        "user_id": current_user.id,
        "interaction_type": interaction_type,
        "zodiac_sign": zodiac_sign,
        "details": details
    }).execute()
    return jsonify({"success": True})

@api_bp.route("/api/v1/mood", methods=["GET"])
@token_required
def get_mood(current_user):
    interactions = supabase.table("user_interactions").select("*").eq("user_id", current_user.id).order("created_at", desc=True).limit(10).execute().data
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
    supabase.table("user_interactions").insert({
        "user_id": current_user.id,
        "interaction_type": "mood_view",
        "zodiac_sign": None,
        "details": {"mood": mood, "intensity": intensity, "timestamp": datetime.now(timezone.utc).isoformat()}
    }).execute()

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
        profile = supabase.table('profiles').select('zodiac_sign').eq('id', user_id).single().execute()
        zodiac_sign = profile.data['zodiac_sign'] if profile.data else 'Aries'
        username = profile.data.get('display_name', 'Cosmic Traveler') if profile.data else 'Cosmic Traveler'

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

        supabase.table('live_stream').insert(stream).execute()
        if redis_client:
            redis_client.setex(f"stream_{stream_id}", 7200, json.dumps(stream))  # 2 hour expiry with full stream data

        socketio.emit('live_stream_started', stream)

        # Notify followers
        followers = supabase.table('follow').select('follower_id').eq('following_id', user_id).execute().data
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
            supabase.table('notification').insert(notification).execute()
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

        # Fetch from Supabase if not in cache
        stream_data = supabase.table('live_stream').select('*').eq('id', stream_id).eq('is_active', True).single().execute().data
        if stream_data:
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
        stream = supabase.table('live_stream').select('*').eq('id', stream_id).eq('user_id', user_id).single().execute().data
        if not stream:
            return jsonify({'success': False, 'error': 'Stream not found or unauthorized'}), 404

        supabase.table('live_stream').update({'is_active': False}).eq('id', stream_id).execute()
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

        # Fetch active live streams from Supabase
        streams = supabase.table('live_stream').select('*').eq('is_active', True).order('created_at', desc=True).execute().data

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
        notifications = supabase.table('notification').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(50).execute().data
        return jsonify({'success': True, 'notifications': notifications}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/api/v1/notifications/<notification_id>/read', methods=['POST'])
@token_required
def mark_notification_read(notification_id):
    user_id = g.user['sub']
    try:
        notification = supabase.table('notification').select('*').eq('id', notification_id).eq('user_id', user_id).single().execute().data
        if not notification:
            return jsonify({'success': False, 'error': 'Notification not found or unauthorized'}), 404

        supabase.table('notification').update({'is_read': True}).eq('id', notification_id).execute()
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
        stream = supabase.table('live_stream').select('*').eq('id', stream_id).eq('is_active', True).single().execute().data
        if not stream:
            return jsonify({'success': False, 'error': 'Stream not found or inactive'}), 404

        # Fetch user profile
        profile = supabase.table('profiles').select('zodiac_sign, display_name').eq('id', user_id).single().execute()
        zodiac_sign = profile.data['zodiac_sign'] if profile.data else 'Unknown'
        username = profile.data.get('display_name', 'Cosmic Traveler') if profile.data else 'Cosmic Traveler'

        chat = {
            'id': str(uuid.uuid4()),
            'stream_id': stream_id,
            'user_id': user_id,
            'username': username,
            'zodiac_sign': zodiac_sign,
            'message': message,
            'created_at': datetime.now(timezone.utc).isoformat()
        }

        supabase.table('stream_chat').insert(chat).execute()
        socketio.emit('stream_chat_message', chat, room=f'stream_{stream_id}')
        return jsonify({'success': True, 'message': 'Chat message sent', 'chat': chat}), 200
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