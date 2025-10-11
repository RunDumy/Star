import os
from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request
from star_auth import token_required

# TODO: Replace with Azure Cosmos DB imports
# from supabase import create_client

notifications = Blueprint('notifications', __name__)

# Initialize Supabase client
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')

# Initialize Supabase client lazily
supabase = None

def get_supabase_client():
    global supabase
    # TODO: Replace with Azure Cosmos DB client initialization
    # if supabase is None and SUPABASE_URL and SUPABASE_ANON_KEY:
    #     supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return supabase

def create_notification(user_id, notification_type, title, message, related_id=None, related_type=None, metadata=None):
    """Create a notification for a user"""
    try:
        notification_data = {
            'user_id': user_id,
            'type': notification_type,
            'title': title,
            'message': message,
            'is_read': False,
            'related_id': related_id,
            'related_type': related_type,
            'metadata': metadata or {}
        }

        result = get_supabase_client().table('notifications').insert(notification_data).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        current_app.logger.error(f"Failed to create notification: {e}")
        return None

@notifications.route('/api/v1/notifications', methods=['GET'])
@token_required
def get_user_notifications():
    """Get user's notifications"""
    try:
        user_id = request.user_id
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))

        result = get_supabase_client().table('notifications').select('*').eq('user_id', user_id).order('created_at', desc=True).range(offset, offset + limit - 1).execute()

        return jsonify({
            'notifications': result.data,
            'count': len(result.data)
        })
    except Exception as e:
        current_app.logger.error(f"Failed to get notifications: {e}")
        return jsonify({'error': 'Failed to get notifications'}), 500

@notifications.route('/api/v1/notifications/<notification_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        user_id = request.user_id

        result = get_supabase_client().table('notifications').update({'is_read': True}).eq('id', notification_id).eq('user_id', user_id).execute()

        if result.data:
            return jsonify({'success': True, 'notification': result.data[0]})
        else:
            return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        current_app.logger.error(f"Failed to mark notification as read: {e}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@notifications.route('/api/v1/notifications/read-all', methods=['PUT'])
@token_required
def mark_all_notifications_read():
    """Mark all user's notifications as read"""
    try:
        user_id = request.user_id

        result = get_supabase_client().table('notifications').update({'is_read': True}).eq('user_id', user_id).eq('is_read', False).execute()

        return jsonify({'success': True, 'updated_count': len(result.data)})
    except Exception as e:
        current_app.logger.error(f"Failed to mark all notifications as read: {e}")
        return jsonify({'error': 'Failed to mark all notifications as read'}), 500

@notifications.route('/api/v1/notifications/unread-count', methods=['GET'])
@token_required
def get_unread_count():
    """Get count of unread notifications"""
    try:
        user_id = request.user_id

        result = get_supabase_client().table('notifications').select('id', count='exact').eq('user_id', user_id).eq('is_read', False).execute()

        return jsonify({'unread_count': result.count})
    except Exception as e:
        current_app.logger.error(f"Failed to get unread count: {e}")
        return jsonify({'error': 'Failed to get unread count'}), 500