from flask import Blueprint, request, jsonify, current_app
from supabase import create_client, Client
import os
from datetime import datetime, timezone
from werkzeug.exceptions import BadRequest

feed = Blueprint('feed', __name__)

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    current_app.logger.warning("Supabase credentials not found, feed functionality disabled")
    supabase = None
else:
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

@feed.route('/api/v1/feed', methods=['GET'])
def get_feed():
    """Get infinite scroll feed with mixed content types"""
    try:
        # Get current planetary hour for FOMO/context
        page = int(request.args.get('page', 1))
        user_id = request.args.get('user_id')
        per_page = 20

        if not user_id:
            return jsonify({'error': 'user_id required'}), 400

        # Build complex query with multiple content types
        query_parts = []
        params = []

        # Get user posts
        user_posts_query = """
            SELECT id, user_id, content, content_type, media_url, zodiac_sign,
                   likes, comments, shares, saves, is_featured, planetary_hour,
                   created_at, 'user_post' as type
            FROM user_posts
            WHERE user_id = %s::integer
            ORDER BY created_at DESC
            LIMIT %s::integer OFFSET %s::integer
        """
        query_parts.append(user_posts_query)
        params.extend([user_id, per_page, (page - 1) * per_page])

        # Combine all content types into one feed
        full_query = f"""
        WITH combined_content AS (
            {user_posts_query}
            UNION ALL
            SELECT id, user_id, prompt as content, 'prompt' as content_type, '' as media_url, zodiac_sign,
                   0 as likes, response_count as comments, 0 as shares, 0 as saves, false as is_featured, planetary_hour,
                   created_at::timestamptz, 'prompt' as type
            FROM prompts
            WHERE user_id = %s::integer
            ORDER BY created_at DESC
            LIMIT %s::integer OFFSET %s::integer
            UNION ALL
            SELECT id, user_id, content, 'sigil' as content_type, media_url, zodiac_sign,
                   likes, comments, shares, saves, false as is_featured, planetary_hour,
                   created_at::timestamptz, 'sigil' as type
            FROM sigils
            WHERE user_id = %s::integer
            ORDER BY created_at DESC
            LIMIT %s::integer OFFSET %s::integer
        )
        SELECT * FROM combined_content
        ORDER BY created_at DESC
        """
        params.extend([user_id, per_page, (page - 1) * per_page])
        params.extend([user_id, per_page, (page - 1) * per_page])

        # Execute query
        result = supabase.table('user_posts').select('*').eq('user_id', user_id).order('created_at.desc').range((page-1)*per_page, page*per_page-1).execute()

        if result.data is None:
            result.data = []

        # Get author's username for each post
        feed_items = []
        for item in result.data:
            # Get user info
            user_result = supabase.table('user').select('username').eq('id', item['user_id']).execute()
            if user_result.data:
                username = user_result.data[0]['username']
            else:
                username = 'Unknown'

            feed_items.append({
                'id': item['id'],
                'type': item.get('content_type', 'user_post'),
                'content': item,
                'user_id': item['user_id'],
                'author': username,
                'created_at': item['created_at'],
                'engagement': {
                    'likes': item.get('likes', 0),
                    'comments': item.get('comments', 0),
                    'shares': item.get('shares', 0),
                    'saves': item.get('saves', 0)
                },
                'metadata': {
                    'zodiac_sign': item.get('zodiac_sign'),
                    'planetary_hour': item.get('planetary_hour'),
                    'is_featured': item.get('is_featured', False)
                }
            })

        return jsonify({
            'items': feed_items,
            'has_more': len(feed_items) == per_page,
            'page': page,
            'planetary_context': get_current_planetary_context()
        })

    except Exception as e:
        current_app.logger.error(f"Feed error: {str(e)}")
        return jsonify({'error': 'Failed to fetch feed', 'details': str(e)}), 500

@feed.route('/api/v1/posts', methods=['POST'])
def create_post():
    """Create a new user post"""
    try:
        from flask import g  # Assuming JWT token provides user_id
        data = request.get_json()

        user_id = data.get('user_id') or getattr(g, 'user_id', None)
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401

        content = data.get('content', '').strip()
        if not content:
            return jsonify({'error': 'Content required'}), 400

        # Get user's zodiac sign
        user_result = supabase.table('user').select('zodiac_sign').eq('id', user_id).execute()
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404

        zodiac_sign = user_result.data[0]['zodiac_sign']

        # Get current planetary hour
        planetary_hour = get_current_planetary_hour()

        post_data = {
            'user_id': user_id,
            'content': content,
            'content_type': data.get('content_type', 'text'),
            'media_url': data.get('media_url'),
            'zodiac_sign': zodiac_sign,
            'planetary_hour': planetary_hour,
            'likes': 0,
            'comments': 0,
            'shares': 0,
            'saves': 0
        }

        result = supabase.table('user_posts').insert(post_data).execute()

        # Log user action for gamification
        log_user_action(user_id, 'post_create', 'text_post', planetary_hour)

        return jsonify({
            'message': 'Post created successfully',
            'post': result.data[0] if result.data else None
        }), 201

    except Exception as e:
        current_app.logger.error(f"Post creation error: {str(e)}")
        return jsonify({'error': 'Failed to create post'}), 500

@feed.route('/api/v1/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    """Like or unlike a post"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400

        # Check if already liked
        existing_like = supabase.table('user_interactions').select('*').eq('user_id', user_id).eq('post_id', post_id).eq('interaction_type', 'like').execute()

        if existing_like.data:
            # Unlike: remove interaction and decrement counter
            supabase.table('user_interactions').delete().eq('user_id', user_id).eq('post_id', post_id).eq('interaction_type', 'like').execute()
            supabase.table('user_posts').update({
                'likes': supabase.raw('likes - 1'),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', post_id).execute()
            action = 'unliked'
        else:
            # Like: add interaction and increment counter
            supabase.table('user_interactions').insert({
                'user_id': user_id,
                'post_id': post_id,
                'interaction_type': 'like'
            }).execute()
            supabase.table('user_posts').update({
                'likes': supabase.raw('likes + 1'),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', post_id).execute()

            # Log action for gamification
            log_user_action(user_id, 'like', 'post_like')
            action = 'liked'

        return jsonify({'message': f'Post {action} successfully'}), 200

    except Exception as e:
        current_app.logger.error(f"Like error: {str(e)}")
        return jsonify({'error': 'Failed to process like'}), 500

@feed.route('/api/v1/posts/<int:post_id>/comment', methods=['POST'])
def comment_on_post(post_id):
    """Add a comment to a post"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        comment_text = data.get('comment', '').strip()

        if not user_id or not comment_text:
            return jsonify({'error': 'user_id and comment required'}), 400

        # Get user's zodiac sign
        user_result = supabase.table('user').select('zodiac_sign').eq('id', user_id).execute()
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404

        zodiac_sign = user_result.data[0]['zodiac_sign']

        comment_data = {
            'post_id': post_id,
            'user_id': user_id,
            'content': comment_text,
            'zodiac_sign': zodiac_sign,
            'likes': 0
        }

        result = supabase.table('comments').insert(comment_data).execute()

        # Update comment count on post
        supabase.table('user_posts').update({
            'comments': supabase.raw('comments + 1'),
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', post_id).execute()

        # Log action for gamification
        log_user_action(user_id, 'comment', 'post_comment')

        return jsonify({
            'message': 'Comment added successfully',
            'comment': result.data[0] if result.data else None
        }), 201

    except Exception as e:
        current_app.logger.error(f"Comment error: {str(e)}")
        return jsonify({'error': 'Failed to add comment'}), 500

@feed.route('/api/v1/posts/<int:post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    """Get comments for a specific post"""
    try:
        result = supabase.table('comments').select('*').eq('post_id', post_id).order('created_at.asc').execute()

        comments = []
        for comment in result.data or []:
            # Get username
            user_result = supabase.table('user').select('username').eq('id', comment['user_id']).execute()
            username = user_result.data[0]['username'] if user_result.data else 'Unknown'

            comments.append({
                'id': comment['id'],
                'content': comment['content'],
                'author': username,
                'zodiac_sign': comment.get('zodiac_sign'),
                'likes': comment.get('likes', 0),
                'created_at': comment['created_at']
            })

        return jsonify({'comments': comments}), 200

    except Exception as e:
        current_app.logger.error(f"Get comments error: {str(e)}")
        return jsonify({'error': 'Failed to fetch comments'}), 500

@feed.route('/api/v1/trending', methods=['GET'])
def get_trending():
    """Get trending content for FOMO algorithm"""
    try:
        # Get recent highly engaged posts
        result = supabase.table('user_posts').select('*').order('likes.desc').order('created_at.desc').limit(10).execute()

        trending_content = []
        for post in result.data or []:
            if post.get('likes', 0) > 5:  # Simple threshold for trending
                user_result = supabase.table('user').select('username').eq('id', post['user_id']).execute()
                username = user_result.data[0]['username'] if user_result.data else 'Unknown'

                trending_content.append({
                    'id': post['id'],
                    'type': 'trending_post',
                    'content': {
                        'text': post['content'][:100] + '...' if len(post['content']) > 100 else post['content'],
                        'engagement_score': calculate_engagement_score(post)
                    },
                    'author': username,
                    'zodiac_sign': post.get('zodiac_sign'),
                    'engagement': {
                        'likes': post.get('likes', 0),
                        'comments': post.get('comments', 0),
                        'shares': post.get('shares', 0)
                    }
                })

        return jsonify({
            'trending_content': trending_content[:5],  # Limit to top 5
            'planetary_context': get_current_planetary_context()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Trending error: {str(e)}")
        return jsonify({'error': 'Failed to fetch trending content'}), 500

@feed.route('/api/v1/profile/<int:user_id>', methods=['GET'])
def get_cosmic_profile(user_id):
    """Get user's cosmic profile with social stats"""
    try:
        # Get basic profile info
        user_result = supabase.table('user').select('*').eq('id', user_id).execute()
        if not user_result.data:
            return jsonify({'error': 'User not found'}), 404

        user = user_result.data[0]

        # Get profile data
        profile_result = supabase.table('profiles').select('*').eq('user_id', user_id).execute()
        profile = profile_result.data[0] if profile_result.data else {}

        # Get post stats
        stats_result = supabase.table('user_posts').select('count(*) as post_count, sum(likes) as total_likes, sum(comments) as total_comments').eq('user_id', user_id).execute()
        stats = stats_result.data[0] if stats_result.data else {'post_count': 0, 'total_likes': 0, 'total_comments': 0}

        # Get recent posts
        posts_result = supabase.table('user_posts').select('*').eq('user_id', user_id).order('created_at.desc').limit(5).execute()

        # Get user badges
        badges_result = supabase.table('user_badges').select('*').eq('user_id', user_id).execute()

        # Get engagement streak
        streak_result = supabase.table('engagement_streaks').select('*').eq('user_id', user_id).eq('streak_type', 'general').execute()
        streak = streak_result.data[0] if streak_result.data else None

        return jsonify({
            'profile': {
                'username': user['username'],
                'zodiac_sign': user['zodiac_sign'],
                'chinese_zodiac': user.get('chinese_zodiac'),
                'vedic_zodiac': user.get('vedic_zodiac'),
                'join_date': user['created_at'],
                'archetype': profile.get('archetype'),
                'bio': profile.get('bio'),
                'avatar_url': profile.get('avatar_url'),
                'theme': profile.get('background_theme', 'cosmic')
            },
            'stats': {
                'posts': stats.get('post_count', 0),
                'total_likes': stats.get('total_likes', 0),
                'total_comments': stats.get('total_comments', 0),
                'current_streak': streak['current_streak'] if streak else 0
            },
            'recent_posts': posts_result.data or [],
            'badges': badges_result.data or [],
            'planetary_context': get_current_planetary_context()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Profile error: {str(e)}")
        return jsonify({'error': 'Failed to fetch profile'}), 500

# Utility functions

def get_current_planetary_hour():
    """Get current planetary hour (simplified)"""
    # This would integrate with your planetary hour system
    # For now, return a mock hour
    hours = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars']
    from datetime import datetime
    hour_index = datetime.now().hour % len(hours)
    return hours[hour_index]

def get_current_planetary_context():
    """Get current planetary context for personalization"""
    current_hour = get_current_planetary_hour()
    return {
        'current_hour': current_hour,
        'dominant_energy': get_planet_energy(current_hour),
        'favorable_actions': get_favorable_actions(current_hour)
    }

def get_planet_energy(planet):
    """Get the energetic quality of a planet"""
    energies = {
        'Sun': 'Creative expression and vitality',
        'Moon': 'Emotional depth and intuition',
        'Mercury': 'Communication and learning',
        'Venus': 'Harmony and relationships',
        'Mars': 'Action and drive',
        'Jupiter': 'Growth and expansion',
        'Saturn': 'Structure and discipline'
    }
    return energies.get(planet, 'Balanced cosmic energy')

def get_favorable_actions(planet):
    """Get actions that align with current planetary hour"""
    actions = {
        'Sun': ['Share creative work', 'Express yourself', 'Lead others'],
        'Moon': ['Reflect emotionally', 'Connect with intuition', 'Nurture relationships'],
        'Mercury': ['Communicate ideas', 'Learn something new', 'Write or read'],
        'Venus': ['Build relationships', 'Create harmony', 'Express affection'],
        'Mars': ['Take action', 'Start new projects', 'Exercise or compete'],
        'Jupiter': ['Expand horizons', 'Teach or mentor', 'Explore philosophy'],
        'Saturn': ['Build structure', 'Focus on discipline', 'Organize systems']
    }
    return actions.get(planet, ['Engage mindfully', 'Connect with cosmos', 'Express authentically'])

def calculate_engagement_score(post):
    """Calculate trending score based on engagement and time"""
    likes = post.get('likes', 0)
    comments = post.get('comments', 0)
    shares = post.get('shares', 0)
    saves = post.get('saves', 0)

    # Simple scoring algorithm
    return likes * 2 + comments * 3 + shares * 5 + saves * 4

def log_user_action(user_id, action_type, action_subtype=None, planetary_context=None):
    """Log user actions for gamification"""
    try:
        data = {
            'user_id': user_id,
            'action_type': action_type,
            'points_earned': get_points_for_action(action_type),
            'planetary_influence': planetary_context or get_current_planetary_hour()
        }
        if action_subtype:
            data['action_subtype'] = action_subtype

        supabase.table('user_actions').insert(data).execute()

        # Update engagement streak
        update_engagement_streak(user_id)

    except Exception as e:
        current_app.logger.error(f"Action logging error: {str(e)}")

def get_points_for_action(action_type):
    """Get points earned for different actions"""
    points = {
        'post_create': 10,
        'like': 1,
        'comment': 3,
        'share': 5,
        'sigil_generate': 15,
        'tarot_reading': 8
    }
    return points.get(action_type, 0)

def update_engagement_streak(user_id):
    """Update user's daily engagement streak"""
    try:
        today = datetime.now(timezone.utc).date()

        # Get current streak
        result = supabase.table('engagement_streaks').select('*').eq('user_id', user_id).eq('streak_type', 'general').execute()

        if result.data:
            streak = result.data[0]
            if streak['last_action_date'] == str(today - timedelta(days=1)):
                # Continued streak
                new_streak = streak['current_streak'] + 1
                supabase.table('engagement_streaks').update({
                    'current_streak': new_streak,
                    'longest_streak': max(new_streak, streak['longest_streak']),
                    'last_action_date': str(today),
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }).eq('user_id', user_id).eq('streak_type', 'general').execute()
            elif streak['last_action_date'] != str(today):
                # Reset streak if not consecutive
                supabase.table('engagement_streaks').update({
                    'current_streak': 1,
                    'last_action_date': str(today),
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }).eq('user_id', user_id).eq('streak_type', 'general').execute()
        else:
            # Create new streak
            supabase.table('engagement_streaks').insert({
                'user_id': user_id,
                'current_streak': 1,
                'longest_streak': 1,
                'last_action_date': str(today),
                'streak_type': 'general'
            }).execute()

    except Exception as e:
        current_app.logger.error(f"Streak update error: {str(e)}")
