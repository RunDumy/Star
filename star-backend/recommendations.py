"""
Recommendation engine for the STAR platform.
Provides personalized content recommendations based on user interactions, zodiac compatibility, and mood.
"""

import logging
import random
from datetime import datetime, timezone

COMPATIBILITY_MAP = {
    # Fire Signs
    'Aries': {
        'high': ['Leo', 'Sagittarius', 'Aries'], # Fire signs
        'medium': ['Gemini', 'Libra', 'Aquarius'], # Air signs
        'low': ['Taurus', 'Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'] # Earth and Water signs
    },
    'Leo': {
        'high': ['Aries', 'Sagittarius', 'Leo'], # Fire signs
        'medium': ['Gemini', 'Libra', 'Aquarius'], # Air signs
        'low': ['Taurus', 'Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'] # Earth and Water signs
    },
    'Sagittarius': {
        'high': ['Aries', 'Leo', 'Sagittarius'], # Fire signs
        'medium': ['Gemini', 'Libra', 'Aquarius'], # Air signs
        'low': ['Taurus', 'Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'] # Earth and Water signs
    },
    
    # Earth Signs
    'Taurus': {
        'high': ['Virgo', 'Capricorn', 'Taurus'], # Earth signs
        'medium': ['Cancer', 'Scorpio', 'Pisces'], # Water signs
        'low': ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'] # Fire and Air signs
    },
    'Virgo': {
        'high': ['Taurus', 'Capricorn', 'Virgo'], # Earth signs
        'medium': ['Cancer', 'Scorpio', 'Pisces'], # Water signs
        'low': ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'] # Fire and Air signs
    },
    'Capricorn': {
        'high': ['Taurus', 'Virgo', 'Capricorn'], # Earth signs
        'medium': ['Cancer', 'Scorpio', 'Pisces'], # Water signs
        'low': ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'] # Fire and Air signs
    },
    
    # Air Signs
    'Gemini': {
        'high': ['Libra', 'Aquarius', 'Gemini'], # Air signs
        'medium': ['Aries', 'Leo', 'Sagittarius'], # Fire signs
        'low': ['Taurus', 'Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'] # Earth and Water signs
    },
    'Libra': {
        'high': ['Gemini', 'Aquarius', 'Libra'], # Air signs
        'medium': ['Aries', 'Leo', 'Sagittarius'], # Fire signs
        'low': ['Taurus', 'Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'] # Earth and Water signs
    },
    'Aquarius': {
        'high': ['Gemini', 'Libra', 'Aquarius'], # Air signs
        'medium': ['Aries', 'Leo', 'Sagittarius'], # Fire signs
        'low': ['Taurus', 'Virgo', 'Capricorn', 'Cancer', 'Scorpio', 'Pisces'] # Earth and Water signs
    },
    
    # Water Signs
    'Cancer': {
        'high': ['Scorpio', 'Pisces', 'Cancer'], # Water signs
        'medium': ['Taurus', 'Virgo', 'Capricorn'], # Earth signs
        'low': ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'] # Fire and Air signs
    },
    'Scorpio': {
        'high': ['Cancer', 'Pisces', 'Scorpio'], # Water signs
        'medium': ['Taurus', 'Virgo', 'Capricorn'], # Earth signs
        'low': ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'] # Fire and Air signs
    },
    'Pisces': {
        'high': ['Cancer', 'Scorpio', 'Pisces'], # Water signs
        'medium': ['Taurus', 'Virgo', 'Capricorn'], # Earth signs
        'low': ['Aries', 'Leo', 'Sagittarius', 'Gemini', 'Libra', 'Aquarius'] # Fire and Air signs
    }
}

# Mood-based content recommendations
MOOD_CONTENT_MAP = {
    'Passionate': ['motivation', 'energy', 'adventure', 'action'],
    'Curious': ['learning', 'exploration', 'creativity', 'innovation'],
    'Reflective': ['analysis', 'insight', 'strategy', 'planning'],
    'Serene': ['meditation', 'relaxation', 'harmony', 'connection'],
    'Neutral': ['general', 'information', 'conversation', 'updates']
}

def get_compatibility_score(user_sign, content_sign):
    """Calculate compatibility score between user and content zodiac signs"""
    if not user_sign or not content_sign:
        return 0.5  # Default medium compatibility
    
    if user_sign == content_sign:
        return 1.0  # Perfect match
        
    compat_map = COMPATIBILITY_MAP.get(user_sign, {})
    if content_sign in compat_map.get('high', []):
        return 0.9
    elif content_sign in compat_map.get('medium', []):
        return 0.6
    elif content_sign in compat_map.get('low', []):
        return 0.3
    return 0.5  # Default

def get_mood_match_score(user_mood, content_keywords):
    """Calculate how well content matches a user's mood"""
    if not user_mood or not content_keywords:
        return 0.5  # Default medium match
        
    mood_keywords = MOOD_CONTENT_MAP.get(user_mood, [])
    if not mood_keywords:
        return 0.5
        
    # Check for keyword matches
    matches = sum(1 for keyword in mood_keywords if any(keyword.lower() in content.lower() for content in content_keywords))
    return min(1.0, matches / len(mood_keywords) + 0.3)  # Base score of 0.3 + matches

def get_content_recommendations(supabase, user_id, content_type='posts', limit=10):
    """
    Get personalized content recommendations for a user
    
    Args:
        supabase: Supabase client
        user_id: User ID to get recommendations for
        content_type: Type of content to recommend ('posts', 'streams', etc)
        limit: Maximum number of recommendations to return
        
    Returns:
        List of recommended content items with scoring information
    """
    try:
        # Get user profile and current mood
        profile = supabase.table('profiles').select('zodiac_sign').eq('id', user_id).single().execute()
        user_sign = profile.data.get('zodiac_sign') if profile.data else None
        
        # Get user's mood
        interactions = supabase.table('user_interactions').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(10).execute()
        mood = "Neutral"  # Default
        if interactions.data:
            for interaction in interactions.data:
                if interaction.get('interaction_type') == 'mood_view' and interaction.get('details', {}).get('mood'):
                    mood = interaction.get('details', {}).get('mood')
                    break
        
        # Get recent content
        if content_type == 'posts':
            content_items = supabase.table('posts').select('*, profiles(display_name, zodiac_sign)').order('created_at', desc=True).limit(50).execute()
        elif content_type == 'streams':
            content_items = supabase.table('live_stream').select('*, profiles(display_name, zodiac_sign)').eq('is_active', True).order('created_at', desc=True).limit(20).execute()
        else:
            return []
            
        if not content_items.data:
            return []
            
        # Score and rank items
        scored_items = []
        for item in content_items.data:
            # Skip user's own content
            if item.get('user_id') == user_id:
                continue
                
            content_sign = item.get('zodiac_sign') or (item.get('profiles', {}) or {}).get('zodiac_sign')
            
            # Base score on zodiac compatibility
            compatibility_score = get_compatibility_score(user_sign, content_sign)
            
            # Content keywords from title/content/tags
            content_keywords = []
            if content_type == 'posts':
                content_keywords.append(item.get('content', ''))
                # Add tags if available
                tags_response = supabase.table('post_tags').select('tag').eq('post_id', item.get('id')).execute()
                if tags_response.data:
                    content_keywords.extend([tag.get('tag', '') for tag in tags_response.data])
            elif content_type == 'streams':
                content_keywords.append(item.get('title', ''))
                content_keywords.append(item.get('description', ''))
                content_keywords.extend(item.get('tags', []))
            
            # Calculate mood match
            mood_score = get_mood_match_score(mood, content_keywords)
            
            # Calculate final score (weighted)
            final_score = (compatibility_score * 0.6) + (mood_score * 0.4)
            
            # Add engagement boost if there are likes/comments/viewers
            engagement = 0
            if content_type == 'posts':
                likes = supabase.table('likes').select('id', count='exact').eq('post_id', item.get('id')).execute()
                comments = supabase.table('comments').select('id', count='exact').eq('post_id', item.get('id')).execute()
                engagement = (likes.count or 0) + (comments.count or 0)
            elif content_type == 'streams':
                engagement = item.get('viewer_count', 0)
                
            # Normalize engagement (0-0.2 range)
            engagement_boost = min(0.2, engagement * 0.01)
            final_score += engagement_boost
            
            # Record all scoring factors for transparency
            scored_items.append({
                'item': item,
                'score': min(1.0, final_score),
                'factors': {
                    'compatibility': compatibility_score,
                    'mood_match': mood_score,
                    'engagement': engagement_boost
                }
            })
            
        # Sort by score (highest first)
        scored_items.sort(key=lambda x: x['score'], desc=True)
        
        # Return top items
        return scored_items[:limit]
    except Exception as e:
        logging.error(f"Error generating recommendations: {str(e)}", exc_info=True)
        return []