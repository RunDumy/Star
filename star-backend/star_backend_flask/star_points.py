import os
from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request
from star_auth import token_required

from supabase import create_client

star_points = Blueprint('star_points', __name__)

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')

# Initialize Supabase client lazily
supabase = None

def get_supabase_client():
    global supabase
    if supabase is None and SUPABASE_URL and SUPABASE_ANON_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return supabase

@star_points.route('/api/v1/star-points', methods=['GET'])
@token_required
def get_user_star_points():
    """Get user's star points and level"""
    try:
        user_id = request.user_id

        # Get or create star points record
        result = get_supabase_client().table('star_points').select('*').eq('user_id', user_id).execute()

        if not result.data:
            # Create initial star points record
            initial_data = {
                'user_id': user_id,
                'total_points': 0,
                'current_level': 1
            }
            create_result = get_supabase_client().table('star_points').insert(initial_data).execute()
            star_points_data = create_result.data[0] if create_result.data else initial_data
        else:
            star_points_data = result.data[0]

        return jsonify({
            'star_points': star_points_data,
            'level_info': calculate_level_info(star_points_data['total_points'])
        })

    except Exception as e:
        current_app.logger.error(f"Get star points error: {str(e)}")
        return jsonify({'error': 'Failed to get star points'}), 500

@star_points.route('/api/v1/challenges', methods=['GET'])
def get_challenges():
    """Get available challenges"""
    try:
        zodiac_sign = request.args.get('zodiac_sign')
        element = request.args.get('element')
        challenge_type = request.args.get('type')  # 'daily', 'weekly', 'achievement'

        query = get_supabase_client().table('challenges').select('*').eq('is_active', True)

        if zodiac_sign:
            # Get challenges for specific zodiac or general challenges
            result = query.execute()
            filtered_challenges = [
                c for c in (result.data or [])
                if c.get('zodiac_sign') == zodiac_sign or c.get('zodiac_sign') is None
            ]
        elif element:
            result = query.execute()
            filtered_challenges = [
                c for c in (result.data or [])
                if c.get('element') == element or c.get('element') is None
            ]
        else:
            result = query.execute()
            filtered_challenges = result.data or []

        if challenge_type:
            filtered_challenges = [c for c in filtered_challenges if c.get('challenge_type') == challenge_type]

        return jsonify({
            'challenges': filtered_challenges
        })

    except (ValueError, TypeError, KeyError) as e:
        current_app.logger.error(f"Get challenges error: {str(e)}")
        return jsonify({'error': 'Failed to get challenges'}), 500

@star_points.route('/api/v1/user-challenges', methods=['GET'])
@token_required
def get_user_challenges():
    """Get user's challenge progress"""
    try:
        user_id = request.user_id

        result = get_supabase_client().table('user_challenges').select('*, challenges(*)').eq('user_id', user_id).execute()

        return jsonify({
            'user_challenges': result.data or []
        })

    except (ValueError, TypeError, KeyError) as e:
        current_app.logger.error(f"Get user challenges error: {str(e)}")
        return jsonify({'error': 'Failed to get user challenges'}), 500

@star_points.route('/api/v1/challenges/<challenge_id>/start', methods=['POST'])
@token_required
def start_challenge(challenge_id):
    """Start a challenge for the user"""
    try:
        user_id = request.user_id

        # Check if challenge exists and is active
        challenge_result = get_supabase_client().table('challenges').select('*').eq('id', challenge_id).eq('is_active', True).execute()

        if not challenge_result.data:
            return jsonify({'error': 'Challenge not found or inactive'}), 404

        # Check if user already has this challenge
        existing = get_supabase_client().table('user_challenges').select('*').eq('user_id', user_id).eq('challenge_id', challenge_id).execute()

        if existing.data:
            return jsonify({'error': 'Challenge already started'}), 400

        # Start the challenge
        user_challenge_data = {
            'user_id': user_id,
            'challenge_id': challenge_id,
            'status': 'in_progress',
            'progress': {}
        }

        result = get_supabase_client().table('user_challenges').insert(user_challenge_data).execute()

        return jsonify({
            'message': 'Challenge started successfully',
            'user_challenge': result.data[0] if result.data else None
        }), 201

    except (ValueError, TypeError, KeyError) as e:
        current_app.logger.error(f"Start challenge error: {str(e)}")
        return jsonify({'error': 'Failed to start challenge'}), 500

@star_points.route('/api/v1/challenges/<challenge_id>/progress', methods=['POST'])
@token_required
def update_challenge_progress(challenge_id):
    """Update progress on a challenge"""
    try:
        user_id = request.user_id
        data = request.get_json()
        progress_update = data.get('progress', {})

        # Get current user challenge
        user_challenge_result = get_supabase_client().table('user_challenges').select('*, challenges(*)').eq('user_id', user_id).eq('challenge_id', challenge_id).execute()

        if not user_challenge_result.data:
            return jsonify({'error': 'User challenge not found'}), 404

        user_challenge = user_challenge_result.data[0]
        challenge = user_challenge['challenges']

        # Update progress
        current_progress = user_challenge.get('progress', {})
        current_progress.update(progress_update)

        # Check if challenge is completed
        is_completed = check_challenge_completion(current_progress, challenge['requirements'])

        update_data = {
            'progress': current_progress,
            'status': 'completed' if is_completed else 'in_progress'
        }

        if is_completed:
            update_data['completed_at'] = datetime.now(timezone.utc).isoformat()

        result = get_supabase_client().table('user_challenges').update(update_data).eq('user_id', user_id).eq('challenge_id', challenge_id).execute()

        # Award points if completed
        if is_completed and user_challenge['status'] != 'completed':
            award_challenge_points(user_id, challenge_id, challenge['points_reward'])

        return jsonify({
            'message': 'Progress updated successfully',
            'user_challenge': result.data[0] if result.data else None,
            'completed': is_completed
        })

    except (ValueError, TypeError, KeyError) as e:
        current_app.logger.error(f"Update challenge progress error: {str(e)}")
        return jsonify({'error': 'Failed to update challenge progress'}), 500

@star_points.route('/api/v1/star-points/transactions', methods=['GET'])
@token_required
def get_star_point_transactions():
    """Get user's star point transaction history"""
    try:
        user_id = request.user_id
        limit = int(request.args.get('limit', 20))

        result = get_supabase_client().table('star_point_transactions').select('*, challenges(title)').eq('user_id', user_id).order('created_at.desc').limit(limit).execute()

        return jsonify({
            'transactions': result.data or []
        })

    except (ValueError, TypeError, KeyError) as e:
        current_app.logger.error(f"Get transactions error: {str(e)}")
        return jsonify({'error': 'Failed to get transactions'}), 500

def calculate_level_info(total_points):
    """Calculate level and progress to next level"""
    # Simple level calculation: level = floor(sqrt(points / 100)) + 1
    # Points needed for next level = (level^2) * 100
    import math

    level = math.floor(math.sqrt(total_points / 100)) + 1
    points_for_current_level = ((level - 1) ** 2) * 100
    points_for_next_level = (level ** 2) * 100

    return {
        'current_level': level,
        'points_to_next_level': points_for_next_level - total_points,
        'progress_percentage': ((total_points - points_for_current_level) / (points_for_next_level - points_for_current_level)) * 100
    }

def check_challenge_completion(progress, requirements):
    """Check if challenge requirements are met"""
    if not requirements:
        return True

    for req_key, req_value in requirements.items():
        if req_key not in progress:
            return False

        current_value = progress[req_key]

        # Simple numeric comparison
        if isinstance(req_value, (int, float)) and current_value < req_value:
            return False

    return True

def award_challenge_points(user_id, challenge_id, points):
    """Award points for completing a challenge"""
    try:
        # Record transaction
        transaction_data = {
            'user_id': user_id,
            'challenge_id': challenge_id,
            'points_earned': points,
            'transaction_type': 'challenge_completion',
            'description': f'Completed challenge and earned {points} star points'
        }

        get_supabase_client().table('star_point_transactions').insert(transaction_data).execute()

        # Update user star points
        star_points_result = get_supabase_client().table('star_points').select('total_points').eq('user_id', user_id).execute()

        if star_points_result.data:
            current_points = star_points_result.data[0]['total_points']
            new_total = current_points + points

            get_supabase_client().table('star_points').update({
                'total_points': new_total,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('user_id', user_id).execute()

            # Check for level up
            level_info = calculate_level_info(new_total)
            if level_info['current_level'] > calculate_level_info(current_points)['current_level']:
                # Award bonus points for leveling up
                bonus_points = level_info['current_level'] * 50
                bonus_transaction = {
                    'user_id': user_id,
                    'points_earned': bonus_points,
                    'transaction_type': 'level_up',
                    'description': f'Leveled up to {level_info["current_level"]} and earned {bonus_points} bonus star points'
                }
                get_supabase_client().table('star_point_transactions').insert(bonus_transaction).execute()

                get_supabase_client().table('star_points').update({
                    'total_points': new_total + bonus_points,
                    'current_level': level_info['current_level'],
                    'updated_at': datetime.now(timezone.utc).isoformat()
                }).eq('user_id', user_id).execute()

    except Exception as e:
        current_app.logger.error(f"Award points error: {str(e)}")