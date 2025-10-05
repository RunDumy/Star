import os
from datetime import datetime, timezone

import socketio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from supabase import create_client

router = APIRouter()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=["http://localhost:3000", "https://star-app.vercel.app"])

# Initialize Supabase client
supabase = create_client(
    os.getenv("SUPABASE_URL", "https://your-supabase-url.supabase.co"),
    os.getenv("SUPABASE_ANON_KEY", "your-supabase-anon-key")
)

# Socket.IO event handlers
@sio.event
async def connect(sid, _environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def new_post(_sid, data):
    print(f"New post received: {data}")
    await sio.emit('post_update', data)

class PostCreate(BaseModel):
    content: str
    zodiac_sign: str
    username: str

@router.get("/posts")
async def get_posts():
    return {"items": []}  # Placeholder for database integration

@router.post("/posts")
async def create_post(post: PostCreate):
    try:
        post_data = {
            "id": 1,  # Placeholder ID
            "username": post.username,
            "zodiac_sign": post.zodiac_sign,
            "content": post.content,
            "image_url": None,
            "created_at": datetime.now().isoformat()
        }
        await sio.emit('post_update', post_data)
        return post_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating post: {str(e)}") from e

# Mood mapping based on traits and interactions
MOOD_MAP = {
    "Courage": "Passionate",
    "Creativity": "Curious",
    "Precision": "Reflective",
    "Harmony": "Serene"
}

# Tarot trait mapping
TAROT_TRAIT_MAP = {
    "The Emperor": {"trait_name": "Courage", "zodiac_sign": "Aries", "strength_boost": 0.2},
    "The Star": {"trait_name": "Creativity", "zodiac_sign": "Leo", "strength_boost": 0.15},
    "The Hermit": {"trait_name": "Precision", "zodiac_sign": "Virgo", "strength_boost": 0.18},
    "Justice": {"trait_name": "Harmony", "zodiac_sign": "Libra", "strength_boost": 0.17}
}

# Transit trait mapping
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

@router.get("/mood")
async def get_mood(user_id: str):
    try:
        interactions = _fetch_recent_interactions(user_id)
        if not interactions:
            return {"success": True, "mood": "Neutral", "intensity": 0.5}

        trait_counts = _count_traits_from_interactions(interactions)
        mood, intensity = _calculate_mood_from_traits(trait_counts)
        _log_mood_interaction(user_id, mood, intensity)

        return {"success": True, "mood": mood, "intensity": intensity}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching mood: {str(e)}") from e


def _fetch_recent_interactions(user_id: str):
    """Fetch the 10 most recent user interactions."""
    return supabase.table("user_interactions").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute().data


def _count_traits_from_interactions(interactions):
    """Count traits from user interactions."""
    trait_counts = {"Courage": 0, "Creativity": 0, "Precision": 0, "Harmony": 0}

    for interaction in interactions:
        trait = _extract_trait_from_interaction(interaction)
        if trait:
            trait_counts[trait] += 1

    return trait_counts


def _extract_trait_from_interaction(interaction):
    """Extract trait name from a single interaction."""
    interaction_type = interaction["interaction_type"]
    details = interaction["details"]

    if interaction_type == "tarot_pull":
        card = details.get("card")
        return TAROT_TRAIT_MAP.get(card, {}).get("trait_name")
    elif interaction_type == "transit_view":
        transit = details.get("transit")
        return TRANSIT_TRAIT_MAP.get(transit, {}).get("trait_name")
    elif interaction_type == "trail_click":
        zodiac_sign = interaction.get("zodiac_sign")
        for transit in TRANSIT_TRAIT_MAP.values():
            if transit["zodiac_sign"] == zodiac_sign:
                return transit["trait_name"]

    return None


def _calculate_mood_from_traits(trait_counts):
    """Calculate mood and intensity from trait counts."""
    dominant_trait = max(trait_counts, key=trait_counts.get)
    mood = MOOD_MAP.get(dominant_trait, "Neutral")
    intensity = min(trait_counts[dominant_trait] / 10.0 + 0.5, 1.0)
    return mood, intensity


def _log_mood_interaction(user_id: str, mood: str, intensity: float):
    """Log the mood view interaction."""
    supabase.table("user_interactions").insert({
        "user_id": user_id,
        "interaction_type": "mood_view",
        "zodiac_sign": None,
        "details": {"mood": mood, "intensity": intensity, "timestamp": datetime.now(timezone.utc).isoformat()}
    }).execute()