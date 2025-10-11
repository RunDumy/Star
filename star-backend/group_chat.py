# Group chat functionality for Star platform
import os
from datetime import datetime

from flask import Blueprint, jsonify, request
from star_auth import token_required

# TODO: Replace with Azure Cosmos DB imports
# from supabase import create_client

group_chat_bp = Blueprint('group_chat', __name__)

# Initialize Supabase client
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')
# TODO: Replace with Azure Cosmos DB client initialization
# try:
#     supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
# except Exception as e:
#     print(f"Failed to initialize Supabase client: {e}")
#     supabase = None
supabase = None  # Temporarily disabled during Azure migration

# Constants
INVALID_ZODIAC_ELEMENT = 'Invalid zodiac element'

@group_chat_bp.route('/groups', methods=['GET'])
@token_required
def get_groups(current_user):
    """Get all groups user is member of"""
    try:
        user_id = current_user.id

        # Get user's groups
        groups_response = supabase.table('group_members').select('group_id, groups(*)').eq('user_id', user_id).execute()
        groups = [member['groups'] for member in groups_response.data]

        return jsonify({'groups': groups}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@group_chat_bp.route('/groups/<group_id>/messages', methods=['GET'])
@token_required
def get_group_messages(current_user, group_id):
    """Get messages for a specific group"""
    try:
        user_id = current_user.id

        # Check if user is member of group
        member_check = supabase.table('group_members').select('user_id').eq('group_id', group_id).eq('user_id', user_id).execute()
        if not member_check.data:
            return jsonify({'error': 'Not a member of this group'}), 403

        # Get messages with user info
        messages_response = supabase.table('chat_messages').select('*, profiles(username, zodiac_sign)').eq('group_id', group_id).order('created_at', desc=True).limit(50).execute()

        return jsonify({'messages': messages_response.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@group_chat_bp.route('/groups/<group_id>/messages', methods=['POST'])
@token_required
def send_group_message(current_user, group_id):
    """Send a message to a group"""
    try:
        user_id = current_user.id
        data = request.get_json()

        if not data or 'content' not in data:
            return jsonify({'error': 'Message content required'}), 400

        # Check if user is member of group
        member_check = supabase.table('group_members').select('user_id').eq('group_id', group_id).eq('user_id', user_id).execute()
        if not member_check.data:
            return jsonify({'error': 'Not a member of this group'}), 403

        # Create message
        message_data = {
            'group_id': group_id,
            'user_id': user_id,
            'content': data['content'],
            'message_type': data.get('message_type', 'text'),
            'metadata': data.get('metadata', {})
        }

        message_response = supabase.table('chat_messages').insert(message_data).execute()

        # Create notification for other group members
        group_members = supabase.table('group_members').select('user_id').eq('group_id', group_id).neq('user_id', user_id).execute()

        # Get sender info
        sender_info = supabase.table('profiles').select('username, zodiac_sign').eq('id', user_id).execute()

        if sender_info.data and group_members.data:
            sender = sender_info.data[0]
            for member in group_members.data:
                # Create cosmic notification
                notification_data = {
                    'user_id': member['user_id'],
                    'type': 'group_chat',
                    'title': f'✨ {sender["username"]} in {group_id}',
                    'message': data['content'][:100] + ('...' if len(data['content']) > 100 else ''),
                    'related_id': message_response.data[0]['id'],
                    'related_type': 'chat_message',
                    'metadata': {
                        'sender_username': sender['username'],
                        'sender_zodiac': sender['zodiac_sign'],
                        'group_id': group_id,
                        'cosmic_effect': get_cosmic_effect(sender['zodiac_sign'])
                    }
                }
                supabase.table('notifications').insert(notification_data).execute()

        return jsonify({'message': message_response.data[0]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_cosmic_effect(zodiac_sign):
    """Get cosmic effect based on zodiac sign"""
    effects = {
        'aries': 'fiery_burst',
        'taurus': 'earth_glow',
        'gemini': 'wind_whisper',
        'cancer': 'water_ripple',
        'leo': 'golden_shine',
        'virgo': 'crystal_clarity',
        'libra': 'balance_harmony',
        'scorpio': 'mystical_shadow',
        'sagittarius': 'arrow_light',
        'capricorn': 'mountain_steady',
        'aquarius': 'electric_spark',
        'pisces': 'dreamy_wave'
    }
    return effects.get(zodiac_sign.lower(), 'cosmic_twinkle')


# Zodiac Chat Rooms
ZODIAC_ELEMENTS = {
    'fire': {
        'name': 'Fire Element',
        'description': 'Passionate, energetic, and creative souls unite!',
        'emoji': '🔥',
        'color': '#FF6B35',
        'signs': ['aries', 'leo', 'sagittarius'],
        'traits': ['Bold', 'Creative', 'Energetic', 'Passionate']
    },
    'earth': {
        'name': 'Earth Element',
        'description': 'Grounded, practical, and nurturing spirits gather here.',
        'emoji': '🌍',
        'color': '#4CAF50',
        'signs': ['taurus', 'virgo', 'capricorn'],
        'traits': ['Reliable', 'Patient', 'Practical', 'Nurturing']
    },
    'air': {
        'name': 'Air Element',
        'description': 'Intellectual, communicative, and free-spirited minds connect.',
        'emoji': '💨',
        'color': '#2196F3',
        'signs': ['gemini', 'libra', 'aquarius'],
        'traits': ['Adaptable', 'Communicative', 'Witty', 'Independent']
    },
    'water': {
        'name': 'Water Element',
        'description': 'Emotional, intuitive, and compassionate hearts flow together.',
        'emoji': '🌊',
        'color': '#9C27B0',
        'signs': ['cancer', 'scorpio', 'pisces'],
        'traits': ['Emotional', 'Intuitive', 'Protective', 'Compassionate']
    }
}

@group_chat_bp.route('/zodiac-rooms', methods=['GET'])
@token_required
def get_zodiac_rooms(current_user):
    """Get all zodiac element chat rooms"""
    try:
        user_id = current_user.id

        # Get user's zodiac sign
        user_profile = supabase.table('profiles').select('zodiac_sign').eq('id', user_id).execute()
        user_zodiac = user_profile.data[0]['zodiac_sign'] if user_profile.data else None

        # Determine user's element
        user_element = None
        if user_zodiac:
            for element, data in ZODIAC_ELEMENTS.items():
                if user_zodiac.lower() in data['signs']:
                    user_element = element
                    break

        rooms = []
        for element_key, element_data in ZODIAC_ELEMENTS.items():
            # Get recent messages count and last activity
            recent_messages = supabase.table('zodiac_chat_messages').select('id').eq('element', element_key).gte('created_at', 'now() - interval \'1 hour\'').execute()

            # Get online users in this element room (simplified - in real implementation would use Redis/WebSocket tracking)
            online_count = len(element_data['signs'])  # Placeholder

            room = {
                'id': element_key,
                'name': element_data['name'],
                'description': element_data['description'],
                'emoji': element_data['emoji'],
                'color': element_data['color'],
                'signs': element_data['signs'],
                'traits': element_data['traits'],
                'is_user_element': element_key == user_element,
                'online_count': online_count,
                'recent_activity': len(recent_messages.data) if recent_messages.data else 0,
                'user_zodiac': user_zodiac
            }
            rooms.append(room)

        return jsonify({'rooms': rooms}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@group_chat_bp.route('/zodiac-rooms/<element>/messages', methods=['GET'])
@token_required
def get_zodiac_room_messages(current_user, element):
    """Get messages for a zodiac element chat room"""
    try:
        if element not in ZODIAC_ELEMENTS:
            return jsonify({'error': INVALID_ZODIAC_ELEMENT}), 400

        # Get messages with user info, ordered by newest first
        messages_response = supabase.table('zodiac_chat_messages').select('*, profiles(username, zodiac_sign)').eq('element', element).order('created_at', desc=True).limit(50).execute()

        # Reverse to show oldest first for chat UI
        messages = messages_response.data[::-1] if messages_response.data else []

        return jsonify({
            'messages': messages,
            'room_info': ZODIAC_ELEMENTS[element]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@group_chat_bp.route('/zodiac-rooms/<element>/messages', methods=['POST'])
@token_required
def send_zodiac_room_message(current_user, element):
    """Send a message to a zodiac element chat room"""
    try:
        if element not in ZODIAC_ELEMENTS:
            return jsonify({'error': INVALID_ZODIAC_ELEMENT}), 400

        user_id = current_user.id
        data = request.get_json()

        if not data or 'content' not in data:
            return jsonify({'error': 'Message content required'}), 404

        # Get user profile
        user_profile = supabase.table('profiles').select('username, zodiac_sign').eq('id', user_id).execute()
        if not user_profile.data:
            return jsonify({'error': 'User profile not found'}), 404

        user = user_profile.data[0]

        # Verify user belongs to this element
        if user['zodiac_sign'].lower() not in ZODIAC_ELEMENTS[element]['signs']:
            return jsonify({'error': 'You can only chat in your elemental group'}), 403

        # Create message
        message_data = {
            'element': element,
            'user_id': user_id,
            'content': data['content'],
            'message_type': data.get('message_type', 'text'),
            'metadata': data.get('metadata', {})
        }

        message_response = supabase.table('zodiac_chat_messages').insert(message_data).execute()

        # Create notifications for other users in the same element
        element_signs = ZODIAC_ELEMENTS[element]['signs']
        other_users = supabase.table('profiles').select('id').in_('zodiac_sign', element_signs).neq('id', user_id).execute()

        if other_users.data:
            for other_user in other_users.data:
                notification_data = {
                    'user_id': other_user['id'],
                    'type': 'zodiac_chat',
                    'title': f'{ZODIAC_ELEMENTS[element]["emoji"]} {user["username"]} in {ZODIAC_ELEMENTS[element]["name"]}',
                    'message': data['content'][:100] + ('...' if len(data['content']) > 100 else ''),
                    'related_id': message_response.data[0]['id'],
                    'related_type': 'zodiac_chat_message',
                    'metadata': {
                        'sender_username': user['username'],
                        'sender_zodiac': user['zodiac_sign'],
                        'element': element,
                        'element_name': ZODIAC_ELEMENTS[element]['name'],
                        'cosmic_effect': get_cosmic_effect(user['zodiac_sign'])
                    }
                }
                supabase.table('notifications').insert(notification_data).execute()

        return jsonify({'message': message_response.data[0]}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@group_chat_bp.route('/zodiac-rooms/<element>/members', methods=['GET'])
@token_required
def get_zodiac_room_members(current_user, element):
    """Get members of a zodiac element chat room"""
    try:
        if element not in ZODIAC_ELEMENTS:
            return jsonify({'error': INVALID_ZODIAC_ELEMENT}), 400

        element_signs = ZODIAC_ELEMENTS[element]['signs']

        # Get all users with zodiac signs in this element
        members_response = supabase.table('profiles').select('id, username, zodiac_sign, last_active').in_('zodiac_sign', element_signs).execute()

        members = []
        for member in members_response.data:
            # Determine if user is online (active within last 5 minutes)
            is_online = False
            if member.get('last_active'):
                last_active = datetime.fromisoformat(member['last_active'].replace('Z', '+00:00'))
                is_online = (datetime.now(last_active.tzinfo) - last_active).seconds < 300

            members.append({
                'id': member['id'],
                'username': member['username'],
                'zodiac_sign': member['zodiac_sign'],
                'is_online': is_online,
                'cosmic_effect': get_cosmic_effect(member['zodiac_sign'])
            })

        return jsonify({
            'members': members,
            'room_info': ZODIAC_ELEMENTS[element]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500