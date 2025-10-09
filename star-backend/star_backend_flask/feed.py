import os
import uuid
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

# Cosmos DB helper functions
def get_user_by_id(user_id):
    """Get user by ID from Cosmos DB"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Users")
        query = "SELECT * FROM c WHERE c.id = @user_id"
        params = [{"name": "@user_id", "value": user_id}]
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        return items[0] if items else None
    except exceptions.CosmosHttpResponseError:
        return None

def create_post(post_data):
    """Create a new post in Cosmos DB"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Posts")
        # Generate ID if not provided
        if 'id' not in post_data:
            post_data['id'] = str(uuid.uuid4())
        container.create_item(post_data)
        return post_data
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to create post: {str(e)}")

def get_posts_by_user(user_id, limit=10):
    """Get posts by user ID"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Posts")
        query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit"
        params = [
            {"name": "@user_id", "value": user_id},
            {"name": "@limit", "value": limit}
        ]
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        return items
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to get posts: {str(e)}")

def toggle_like(user_id, post_id):
    """Toggle like on a post"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        interactions_container = database.get_container_client("Interactions")
        posts_container = database.get_container_client("Posts")
        
        # Check if like exists
        query = "SELECT * FROM c WHERE c.user_id = @user_id AND c.post_id = @post_id AND c.interaction_type = 'like'"
        params = [
            {"name": "@user_id", "value": user_id},
            {"name": "@post_id", "value": post_id}
        ]
        existing_likes = list(interactions_container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        
        if existing_likes:
            # Unlike: remove interaction and decrement likes
            for like in existing_likes:
                interactions_container.delete_item(like['id'], partition_key=like['user_id'])
            
            # Update post likes count
            query = "SELECT * FROM c WHERE c.id = @post_id"
            params = [{"name": "@post_id", "value": post_id}]
            posts = list(posts_container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
            if posts:
                post = posts[0]
                post['likes'] = max(0, post.get('likes', 0) - 1)
                posts_container.replace_item(post['id'], post)
            
            return False  # Unliked
        else:
            # Like: add interaction and increment likes
            like_data = {
                'id': str(uuid.uuid4()),
                'user_id': user_id,
                'post_id': post_id,
                'interaction_type': 'like',
                'timestamp': datetime.utcnow().isoformat()
            }
            interactions_container.create_item(like_data)
            
            # Update post likes count
            query = "SELECT * FROM c WHERE c.id = @post_id"
            params = [{"name": "@post_id", "value": post_id}]
            posts = list(posts_container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
            if posts:
                post = posts[0]
                post['likes'] = post.get('likes', 0) + 1
                posts_container.replace_item(post['id'], post)
            
            return True  # Liked
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to toggle like: {str(e)}")

def create_comment(comment_data):
    """Create a new comment"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Comments")
        if 'id' not in comment_data:
            comment_data['id'] = str(uuid.uuid4())
        container.create_item(comment_data)
        
        # Update post comment count
        posts_container = database.get_container_client("Posts")
        query = "SELECT * FROM c WHERE c.id = @post_id"
        params = [{"name": "@post_id", "value": comment_data['post_id']}]
        posts = list(posts_container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        if posts:
            post = posts[0]
            post['comments'] = post.get('comments', 0) + 1
            posts_container.replace_item(post['id'], post)
        
        return comment_data
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to create comment: {str(e)}")

def get_comments_by_post(post_id):
    """Get comments for a post"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Comments")
        query = "SELECT * FROM c WHERE c.post_id = @post_id ORDER BY c.created_at ASC"
        params = [{"name": "@post_id", "value": post_id}]
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        return items
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to get comments: {str(e)}")

def get_popular_posts(limit=10):
    """Get popular posts ordered by likes then timestamp"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Posts")
        query = "SELECT * FROM c ORDER BY c.likes DESC, c.timestamp DESC OFFSET 0 LIMIT @limit"
        params = [{"name": "@limit", "value": limit}]
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=True))
        return items
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to get popular posts: {str(e)}")

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
@token_required
def create_post():
    """Create a new user post"""
    try:
        data = request.get_json()
        user_id = request.user_id  # From token_required decorator

        content = data.get('content', '').strip()
        if not content:
            return jsonify({'error': 'Content required'}), 400

        # Get user's zodiac sign
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        zodiac_sign = user.get('zodiac_sign')

        # Get current planetary hour (assuming this function exists)
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
            'saves': 0,
            'timestamp': datetime.utcnow().isoformat(),
            'created_at': datetime.utcnow().isoformat()
        }

        result = create_post(post_data)

        # Log user action for gamification (assuming this function exists)
        log_user_action(user_id, 'post_create', 'text_post', planetary_hour)

        return jsonify({
            'message': 'Post created successfully',
            'post': result
        }), 201

    except Exception as e:
        current_app.logger.error(f"Post creation error: {str(e)}")
        return jsonify({'error': 'Failed to create post'}), 500

@feed.route('/api/v1/posts/<post_id>/like', methods=['POST'])
@token_required
def like_post(post_id):
    """Like or unlike a post"""
    try:
        user_id = request.user_id  # From token_required decorator

        # Use Cosmos DB helper function
        liked = toggle_like(user_id, post_id)
        action = 'liked' if liked else 'unliked'

        # Create notification for post author if liked
        if liked:
            try:
                # Get post author
                posts_container = database.get_container_client("Posts")
                query = "SELECT c.user_id FROM c WHERE c.id = @post_id"
                params = [{"name": "@post_id", "value": post_id}]
                posts = list(posts_container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
                
                if posts and posts[0]['user_id'] != user_id:
                    post_author_id = posts[0]['user_id']
                    
                    # Get liker username
                    liker = get_user_by_id(user_id)
                    liker_username = liker.get('username', 'Someone') if liker else 'Someone'
                    
                    create_notification(
                        user_id=post_author_id,
                        notification_type='like',
                        title='New Like',
                        message=f'{liker_username} liked your post',
                        related_id=post_id,
                        related_type='post',
                        metadata={'liker_id': user_id, 'liker_username': liker_username}
                    )

                # Log action for gamification
                log_user_action(user_id, 'like', 'post_like')
                
            except Exception as e:
                current_app.logger.error(f"Notification creation error: {str(e)}")
                # Don't fail the like operation if notification fails

        return jsonify({'message': f'Post {action} successfully'}), 200

    except Exception as e:
        current_app.logger.error(f"Like error: {str(e)}")
        return jsonify({'error': 'Failed to process like'}), 500

@feed.route('/api/v1/posts/<int:post_id>/comment', methods=['POST'])
@token_required
def comment_on_post(post_id):
    """Add a comment to a post"""
    try:
        data = request.get_json()
        user_id = request.user_id  # From token_required decorator
        comment_text = data.get('comment', '').strip()

        if not comment_text:
            return jsonify({'error': 'comment required'}), 400

        # Get user's zodiac sign
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        zodiac_sign = user.get('zodiac_sign')

        comment_data = {
            'post_id': str(post_id),
            'user_id': user_id,
            'content': comment_text,
            'zodiac_sign': zodiac_sign,
            'likes': 0,
            'created_at': datetime.utcnow().isoformat()
        }

        result = create_comment(comment_data)

        # Create notification for post author
        try:
            posts_container = database.get_container_client("Posts")
            query = "SELECT c.user_id FROM c WHERE c.id = @post_id"
            params = [{"name": "@post_id", "value": str(post_id)}]
            posts = list(posts_container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
            
            if posts and posts[0]['user_id'] != user_id:
                post_author_id = posts[0]['user_id']
                commenter_username = user.get('username', 'Someone')
                
                create_notification(
                    user_id=post_author_id,
                    notification_type='comment',
                    title='New Comment',
                    message=f'{commenter_username} commented on your post',
                    related_id=str(post_id),
                    related_type='post',
                    metadata={'commenter_id': user_id, 'commenter_username': commenter_username, 'comment_content': comment_text[:50]}
                )
        except Exception as e:
            current_app.logger.error(f"Notification creation error: {str(e)}")
            # Don't fail the comment operation if notification fails

        # Log action for gamification
        log_user_action(user_id, 'comment', 'post_comment')

        return jsonify({
            'message': 'Comment added successfully',
            'comment': result
        }), 201

    except Exception as e:
        current_app.logger.error(f"Comment error: {str(e)}")
        return jsonify({'error': 'Failed to add comment'}), 500

@feed.route('/api/v1/posts/<int:post_id>/comments', methods=['GET'])
def get_post_comments(post_id):
    """Get comments for a specific post"""
    try:
        comments = get_comments_by_post(str(post_id))
        
        # Enrich comments with usernames
        enriched_comments = []
        for comment in comments:
            user = get_user_by_id(comment['user_id'])
            username = user.get('username', 'Unknown') if user else 'Unknown'
            
            enriched_comments.append({
                'id': comment['id'],
                'content': comment['content'],
                'author': username,
                'zodiac_sign': comment.get('zodiac_sign'),
                'likes': comment.get('likes', 0),
                'created_at': comment.get('created_at', comment.get('timestamp'))
            })

        return jsonify({'comments': enriched_comments}), 200

    except Exception as e:
        current_app.logger.error(f"Get comments error: {str(e)}")
        return jsonify({'error': 'Failed to fetch comments'}), 500

@feed.route('/api/v1/trending', methods=['GET'])
def get_trending():
    """Get trending content for FOMO algorithm"""
    try:
        # Get recent highly engaged posts
        posts = get_popular_posts(10)

        trending_content = []
        for post in posts:
            if post.get('likes', 0) > 5:  # Simple threshold for trending
                user = get_user_by_id(post['user_id'])
                username = user.get('username', 'Unknown') if user else 'Unknown'

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

def get_user_stats(user_id):
    """Get user post statistics"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Posts")
        # Note: Cosmos DB doesn't have built-in aggregation like SQL COUNT/SUM
        # For now, we'll fetch all posts and calculate stats
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        params = [{"name": "@user_id", "value": user_id}]
        posts = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        
        post_count = len(posts)
        total_likes = sum(post.get('likes', 0) for post in posts)
        total_comments = sum(post.get('comments', 0) for post in posts)
        
        return {
            'post_count': post_count,
            'total_likes': total_likes,
            'total_comments': total_comments
        }
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to get user stats: {str(e)}")

def get_recent_posts(user_id, limit=5):
    """Get recent posts by user"""
    if not database:
        raise Exception("Cosmos DB not available")
    try:
        container = database.get_container_client("Posts")
        query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit"
        params = [
            {"name": "@user_id", "value": user_id},
            {"name": "@limit", "value": limit}
        ]
        items = list(container.query_items(query=query, parameters=params, enable_cross_partition_query=False))
        return items
    except exceptions.CosmosHttpResponseError as e:
        raise Exception(f"Failed to get recent posts: {str(e)}")

@feed.route('/api/v1/profile/<int:user_id>', methods=['GET'])
def get_cosmic_profile(user_id):
    """Get user's cosmic profile with social stats"""
    try:
        user_id_str = str(user_id)
        
        # Get basic profile info
        user = get_user_by_id(user_id_str)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get profile data (assuming profiles are stored in Users container for now)
        profile = {}  # Placeholder - would need separate Profiles container

        # Get post stats
        stats = get_user_stats(user_id_str)

        # Get recent posts
        recent_posts = get_recent_posts(user_id_str, 5)

        # Placeholder for badges and streaks - would need separate containers
        badges = []
        streak = {'current_streak': 0}

        return jsonify({
            'profile': {
                'username': user.get('username'),
                'zodiac_sign': user.get('zodiac_sign'),
                'chinese_zodiac': user.get('chinese_zodiac'),
                'vedic_zodiac': user.get('vedic_zodiac'),
                'join_date': user.get('created_at'),
                'archetype': profile.get('archetype'),
                'bio': profile.get('bio'),
                'avatar_url': profile.get('avatar_url'),
                'theme': profile.get('background_theme', 'cosmic')
            },
            'stats': {
                'posts': stats.get('post_count', 0),
                'total_likes': stats.get('total_likes', 0),
                'total_comments': stats.get('total_comments', 0),
                'current_streak': streak.get('current_streak', 0)
            },
            'recent_posts': recent_posts,
            'badges': badges,
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
        # For now, just log to console - would need UserActions container in Cosmos DB
        current_app.logger.info(f"User action: {user_id} - {action_type} - {action_subtype} - {planetary_context}")
        # TODO: Implement Cosmos DB logging for gamification
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
        # For now, simplified - would need EngagementStreaks container in Cosmos DB
        current_app.logger.info(f"Engagement streak update for user: {user_id}")
        # TODO: Implement Cosmos DB streak tracking
    except Exception as e:
        current_app.logger.error(f"Streak update error: {str(e)}")

@feed.route('/api/v1/cosmic_network/<int:user_id>', methods=['GET'])
@token_required
def get_cosmic_network(user_id):
    """Get cosmic network data for visualization - friends and interactions"""
    try:
        user_id_str = str(user_id)
        
        # Get user's own profile for center node
        user = get_user_by_id(user_id_str)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # For now, return simplified network - would need Friends and Interactions containers
        # TODO: Implement full cosmic network with Cosmos DB
        
        return jsonify({
            'user': {
                'id': user_id_str,
                'display_name': user.get('username', f'User {user_id_str}'),
                'zodiac_sign': user.get('zodiac_sign', 'Unknown'),
                'bio': '',
                'avatar_url': user.get('avatar_url', '')
            },
            'friends': [],  # TODO: Implement friends from Cosmos DB
            'interactions': []  # TODO: Implement interactions from Cosmos DB
        }), 200

    except Exception as e:
        current_app.logger.error(f"Cosmic network error: {str(e)}")
        return jsonify({'error': 'Failed to fetch cosmic network data'}), 500
