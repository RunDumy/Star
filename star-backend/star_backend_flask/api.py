import os
import random
from datetime import datetime, timezone

import requests
from flask import Blueprint, g, jsonify, request
from star_backend_flask.app import supabase

from .star_auth import token_required

api_bp = Blueprint('api', __name__)

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
    data = request.get_json()
    content = data.get('content')
    media_url = data.get('media_url')
    user_id = g.user['sub']

    if not content:
        return jsonify({'error': 'Content is required'}), 400

    try:
        # Fetch user's zodiac sign
        profile = supabase.table('profiles').select('zodiac_sign').eq('id', user_id).single().execute()
        zodiac_sign = profile.data['zodiac_sign'] if profile.data else 'Aries'

        # Create post
        response = supabase.table('posts').insert({
            'user_id': user_id,
            'content': content,
            'media_url': media_url,
            'zodiac_sign': zodiac_sign
        }).execute()

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