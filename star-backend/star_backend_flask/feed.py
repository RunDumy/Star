import os
from datetime import datetime, timedelta, timezone

from azure.cosmos import CosmosClient, exceptions
from flask import Blueprint, current_app, jsonify, request
# Import notification function
from notifications import create_notification
from star_auth import token_required
from werkzeug.exceptions import BadRequest

feed = Blueprint('feed', __name__)

# Initialize Cosmos DB client
COSMOS_ENDPOINT = os.environ.get('COSMOS_ENDPOINT')
COSMOS_KEY = os.environ.get('COSMOS_KEY')

if not COSMOS_ENDPOINT or not COSMOS_KEY:
    print("Cosmos DB credentials not found, feed functionality disabled")
    cosmos_client = None
    database = None
else:
    try:
        cosmos_client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        database = cosmos_client.get_database_client("StarDB")
    except Exception as e:
        print(f"Failed to initialize Cosmos DB client: {e}")
        cosmos_client = None
        database = None

@feed.route('/api/v1/feed', methods=['GET'])
def get_feed():
    if not database:
        return jsonify({"error": "Cosmos DB not configured"}), 500
    try:
        container = database.get_container_client("Posts")
        # Optimized query: specific fields, pagination, single partition
        query = "SELECT c.id, c.user_id, c.content, c.timestamp FROM c WHERE c.user_id = @user_id ORDER BY c.timestamp DESC OFFSET 0 LIMIT 10"
        params = [{"name": "@user_id", "value": request.args.get("user_id", "default_user")}]
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        return jsonify(items)
    except exceptions.CosmosHttpResponseError as e:
        return jsonify({"error": f"Feed query failed: {str(e)}"}), 500

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

            # Create notification for post author
            post_result = supabase.table('user_posts').select('user_id').eq('id', post_id).execute()
            if post_result.data and post_result.data[0]['user_id'] != user_id:
                post_author_id = post_result.data[0]['user_id']
                user_result = supabase.table('user').select('username').eq('id', user_id).execute()
                liker_username = user_result.data[0]['username'] if user_result.data else 'Someone'
                create_notification(
                    user_id=post_author_id,
                    notification_type='like',
                    title='New Like',
                    message=f'{liker_username} liked your post',
                    related_id=str(post_id),
                    related_type='post',
                    metadata={'liker_id': user_id, 'liker_username': liker_username}
                )

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

        # Create notification for post author
        post_result = supabase.table('user_posts').select('user_id').eq('id', post_id).execute()
        if post_result.data and post_result.data[0]['user_id'] != user_id:
            post_author_id = post_result.data[0]['user_id']
            user_result = supabase.table('user').select('username').eq('id', user_id).execute()
            commenter_username = user_result.data[0]['username'] if user_result.data else 'Someone'
            create_notification(
                user_id=post_author_id,
                notification_type='comment',
                title='New Comment',
                message=f'{commenter_username} commented on your post',
                related_id=str(post_id),
                related_type='post',
                metadata={'commenter_id': user_id, 'commenter_username': commenter_username, 'comment_content': comment_text[:50]}
            )

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

@feed.route('/api/v1/cosmic_network/<int:user_id>', methods=['GET'])
@token_required
def get_cosmic_network(user_id):
    """Get cosmic network data for visualization - friends and interactions"""
    try:
        # Get user's friends
        friends_result = supabase.table('friends').select('friend_id, status, created_at').eq('user_id', user_id).eq('status', 'accepted').execute()
        
        # Get friend details
        friends_data = []
        if friends_result.data:
            for friend in friends_result.data:
                friend_id = friend['friend_id']
                # Get friend profile info
                profile_result = supabase.table('profiles').select('display_name, zodiac_sign, bio, avatar_url').eq('user_id', friend_id).execute()
                profile = profile_result.data[0] if profile_result.data else {}
                
                friends_data.append({
                    'id': friend_id,
                    'display_name': profile.get('display_name', f'User {friend_id}'),
                    'zodiac_sign': profile.get('zodiac_sign', 'Unknown'),
                    'bio': profile.get('bio', ''),
                    'avatar_url': profile.get('avatar_url', ''),
                    'friendship_date': friend['created_at']
                })

        # Get recent interactions (likes, comments, shares)
        interactions_result = supabase.table('interactions').select('target_user_id, interaction_type, created_at').eq('user_id', user_id).order('created_at.desc').limit(50).execute()
        
        # Get interaction targets' profile info
        interactions_data = []
        if interactions_result.data:
            for interaction in interactions_result.data:
                target_id = interaction['target_user_id']
                profile_result = supabase.table('profiles').select('display_name, zodiac_sign').eq('user_id', target_id).execute()
                profile = profile_result.data[0] if profile_result.data else {}
                
                interactions_data.append({
                    'target_id': target_id,
                    'target_name': profile.get('display_name', f'User {target_id}'),
                    'target_zodiac': profile.get('zodiac_sign', 'Unknown'),
                    'interaction_type': interaction['interaction_type'],
                    'timestamp': interaction['created_at']
                })

        # Get user's own profile for center node
        user_profile_result = supabase.table('profiles').select('display_name, zodiac_sign, bio, avatar_url').eq('user_id', user_id).execute()
        user_profile = user_profile_result.data[0] if user_profile_result.data else {}

        return jsonify({
            'user': {
                'id': user_id,
                'display_name': user_profile.get('display_name', f'User {user_id}'),
                'zodiac_sign': user_profile.get('zodiac_sign', 'Unknown'),
                'bio': user_profile.get('bio', ''),
                'avatar_url': user_profile.get('avatar_url', '')
            },
            'friends': friends_data,
            'interactions': interactions_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Cosmic network error: {str(e)}")
        return jsonify({'error': 'Failed to fetch cosmic network data'}), 500
