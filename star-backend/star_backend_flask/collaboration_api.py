"""
Real-time Collaboration API Endpoints for STAR Platform
Handles REST API endpoints for collaboration sessions, session management,
and integration with the collaboration engine.
"""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from collaboration_engine import (CollaborationSessionType, UserRole,
                                  get_collaboration_engine)
from flask import Blueprint, g, jsonify, request
from star_auth import token_required

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create collaboration blueprint
collaboration_bp = Blueprint('collaboration', __name__, url_prefix='/api/v1/collaboration')

@collaboration_bp.route('/sessions', methods=['GET'])
@token_required
def get_sessions():
    """Get list of active collaboration sessions."""
    
    try:
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        show_all = request.args.get('all', 'false').lower() == 'true'
        
        # Get sessions (all or user-specific)
        sessions = engine.get_active_sessions(user_id if not show_all else None)
        
        return jsonify({
            'sessions': sessions,
            'count': len(sessions),
            'user_sessions': [s for s in sessions if user_id in s.get('participants', [])]
        })
        
    except Exception as e:
        logger.error(f"Failed to get sessions: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions', methods=['POST'])
@token_required
def create_session():
    """Create a new collaboration session."""
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['session_type', 'title']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate session type
        try:
            session_type = CollaborationSessionType(data['session_type'])
        except ValueError:
            return jsonify({'error': 'Invalid session type'}), 400
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        
        # Create session
        session = engine.create_session(
            host_id=user_id,
            session_type=session_type,
            title=data['title'],
            description=data.get('description', ''),
            max_participants=data.get('max_participants', 8),
            is_private=data.get('is_private', False),
            password=data.get('password')
        )
        
        return jsonify({
            'session_id': session.session_id,
            'room_code': session.room_code,
            'title': session.title,
            'session_type': session.session_type.value,
            'status': session.status.value,
            'created_at': session.created_at.isoformat(),
            'host_id': session.host_id,
            'max_participants': session.max_participants,
            'is_private': session.is_private
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>', methods=['GET'])
@token_required
def get_session(session_id: str):
    """Get details of a specific collaboration session."""
    
    try:
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        if session_id not in engine.active_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = engine.active_sessions[session_id]
        user_id = g.current_user.get('id')
        
        # Check if user is participant or if session is public
        if not session.is_private or user_id in session.participants:
            return jsonify({
                'session_id': session.session_id,
                'title': session.title,
                'description': session.description,
                'session_type': session.session_type.value,
                'status': session.status.value,
                'host_id': session.host_id,
                'participants': [
                    {
                        'user_id': p.user_id,
                        'username': p.username,
                        'zodiac_sign': p.zodiac_sign,
                        'role': p.role.value,
                        'is_online': p.is_online
                    }
                    for p in session.participants.values()
                ],
                'participant_count': len(session.participants),
                'max_participants': session.max_participants,
                'is_private': session.is_private,
                'room_code': session.room_code,
                'created_at': session.created_at.isoformat(),
                'started_at': session.started_at.isoformat() if session.started_at else None,
                'shared_state': session.shared_state,
                'live_cursors': session.live_cursors
            })
        else:
            return jsonify({'error': 'Access denied'}), 403
        
    except Exception as e:
        logger.error(f"Failed to get session {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/join', methods=['POST'])
@token_required
def join_session(session_id: str):
    """Join an existing collaboration session."""
    
    try:
        data = request.get_json() or {}
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        username = g.current_user.get('username', f'User_{user_id[-4:]}')
        zodiac_sign = g.current_user.get('zodiac_sign', 'unknown')
        password = data.get('password')
        
        success = engine.join_session(
            session_id=session_id,
            user_id=user_id,
            username=username,
            zodiac_sign=zodiac_sign,
            password=password
        )
        
        if success:
            session = engine.active_sessions[session_id]
            return jsonify({
                'message': 'Successfully joined session',
                'session_id': session_id,
                'participant_count': len(session.participants),
                'status': session.status.value
            })
        else:
            return jsonify({'error': 'Failed to join session'}), 400
        
    except Exception as e:
        logger.error(f"Failed to join session {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/leave', methods=['POST'])
@token_required
def leave_session(session_id: str):
    """Leave a collaboration session."""
    
    try:
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        
        success = engine.leave_session(session_id, user_id)
        
        if success:
            return jsonify({
                'message': 'Successfully left session',
                'session_id': session_id
            })
        else:
            return jsonify({'error': 'Failed to leave session'}), 400
        
    except Exception as e:
        logger.error(f"Failed to leave session {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/end', methods=['POST'])
@token_required
def end_session(session_id: str):
    """End a collaboration session (host only)."""
    
    try:
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        if session_id not in engine.active_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = engine.active_sessions[session_id]
        user_id = g.current_user.get('id')
        
        # Check if user is host
        if session.host_id != user_id:
            return jsonify({'error': 'Only the host can end the session'}), 403
        
        # End session
        session.status = session.status.COMPLETED
        session.ended_at = datetime.now(timezone.utc)
        engine._end_session(session_id)
        
        return jsonify({
            'message': 'Session ended successfully',
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"Failed to end session {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/join-by-code', methods=['POST'])
@token_required
def join_by_room_code():
    """Join a session using room code."""
    
    try:
        data = request.get_json()
        room_code = data.get('room_code')
        
        if not room_code:
            return jsonify({'error': 'Room code is required'}), 400
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        # Find session by room code
        target_session = None
        for session in engine.active_sessions.values():
            if session.room_code == room_code.upper():
                target_session = session
                break
        
        if not target_session:
            return jsonify({'error': 'Invalid room code'}), 404
        
        user_id = g.current_user.get('id')
        username = g.current_user.get('username', f'User_{user_id[-4:]}')
        zodiac_sign = g.current_user.get('zodiac_sign', 'unknown')
        
        success = engine.join_session(
            session_id=target_session.session_id,
            user_id=user_id,
            username=username,
            zodiac_sign=zodiac_sign
        )
        
        if success:
            return jsonify({
                'message': 'Successfully joined session',
                'session_id': target_session.session_id,
                'session_title': target_session.title,
                'session_type': target_session.session_type.value,
                'participant_count': len(target_session.participants)
            })
        else:
            return jsonify({'error': 'Failed to join session'}), 400
        
    except Exception as e:
        logger.error(f"Failed to join by room code: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/state', methods=['GET'])
@token_required
def get_session_state(session_id: str):
    """Get current session state."""
    
    try:
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        if session_id not in engine.active_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = engine.active_sessions[session_id]
        user_id = g.current_user.get('id')
        
        # Check access
        if user_id not in session.participants:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({
            'session_id': session_id,
            'shared_state': session.shared_state,
            'tarot_spread': session.tarot_spread,
            'numerology_data': session.numerology_data,
            'cosmos_state': session.cosmos_state,
            'live_cursors': session.live_cursors,
            'voice_channels': session.voice_channels,
            'last_updated': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"Failed to get session state {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/state', methods=['POST'])
@token_required
def update_session_state(session_id: str):
    """Update session state."""
    
    try:
        data = request.get_json()
        state_update = data.get('state_update')
        
        if not state_update:
            return jsonify({'error': 'State update is required'}), 400
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        
        success = engine.sync_session_state(session_id, user_id, state_update)
        
        if success:
            return jsonify({
                'message': 'State updated successfully',
                'session_id': session_id,
                'updated_keys': list(state_update.keys())
            })
        else:
            return jsonify({'error': 'Failed to update state'}), 400
        
    except Exception as e:
        logger.error(f"Failed to update session state {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/tarot', methods=['POST'])
@token_required
def handle_tarot_event(session_id: str):
    """Handle tarot collaboration events."""
    
    try:
        data = request.get_json()
        tarot_data = data.get('tarot_data')
        
        if not tarot_data:
            return jsonify({'error': 'Tarot data is required'}), 400
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        
        success = engine.handle_tarot_collaboration(session_id, user_id, tarot_data)
        
        if success:
            return jsonify({
                'message': 'Tarot event processed successfully',
                'session_id': session_id,
                'event_type': tarot_data.get('event_type')
            })
        else:
            return jsonify({'error': 'Failed to process tarot event'}), 400
        
    except Exception as e:
        logger.error(f"Failed to handle tarot event {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/numerology', methods=['POST'])
@token_required
def handle_numerology_event(session_id: str):
    """Handle numerology collaboration events."""
    
    try:
        data = request.get_json()
        numerology_data = data.get('numerology_data')
        
        if not numerology_data:
            return jsonify({'error': 'Numerology data is required'}), 400
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        
        success = engine.handle_numerology_collaboration(session_id, user_id, numerology_data)
        
        if success:
            return jsonify({
                'message': 'Numerology event processed successfully',
                'session_id': session_id,
                'event_type': numerology_data.get('event_type')
            })
        else:
            return jsonify({'error': 'Failed to process numerology event'}), 400
        
    except Exception as e:
        logger.error(f"Failed to handle numerology event {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/cosmos', methods=['POST'])
@token_required
def handle_cosmos_event(session_id: str):
    """Handle cosmos collaboration events."""
    
    try:
        data = request.get_json()
        cosmos_data = data.get('cosmos_data')
        
        if not cosmos_data:
            return jsonify({'error': 'Cosmos data is required'}), 400
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        user_id = g.current_user.get('id')
        
        success = engine.handle_cosmos_collaboration(session_id, user_id, cosmos_data)
        
        if success:
            return jsonify({
                'message': 'Cosmos event processed successfully',
                'session_id': session_id,
                'event_type': cosmos_data.get('event_type')
            })
        else:
            return jsonify({'error': 'Failed to process cosmos event'}), 400
        
    except Exception as e:
        logger.error(f"Failed to handle cosmos event {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/sessions/<session_id>/agora-token', methods=['POST'])
@token_required
def get_agora_token(session_id: str):
    """Generate Agora RTC token for voice/video collaboration."""
    
    try:
        import os
        import time

        from agora_token_builder import Role_Attendee, RtcTokenBuilder
        
        engine = get_collaboration_engine()
        if not engine:
            return jsonify({'error': 'Collaboration engine not initialized'}), 500
        
        if session_id not in engine.active_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session = engine.active_sessions[session_id]
        user_id = g.current_user.get('id')
        
        # Check access
        if user_id not in session.participants:
            return jsonify({'error': 'Access denied'}), 403
        
        # Agora configuration
        app_id = os.getenv('AGORA_APP_ID')
        app_certificate = os.getenv('AGORA_APP_CERTIFICATE')
        
        if not app_id or not app_certificate:
            return jsonify({'error': 'Agora configuration not found'}), 500
        
        # Generate token
        channel_name = f"star_collab_{session_id}"
        uid = hash(user_id) % (2**31)  # Convert user_id to int
        expiration_time_in_seconds = 3600 * 24  # 24 hours
        current_timestamp = int(time.time())
        privilege_expired_ts = current_timestamp + expiration_time_in_seconds
        
        token = RtcTokenBuilder.buildTokenWithUid(
            app_id, 
            app_certificate, 
            channel_name, 
            uid, 
            Role_Attendee, 
            privilege_expired_ts
        )
        
        return jsonify({
            'token': token,
            'channel_name': channel_name,
            'uid': uid,
            'app_id': app_id,
            'expires_at': privilege_expired_ts
        })
        
    except ImportError:
        return jsonify({'error': 'Agora token builder not available'}), 500
    except Exception as e:
        logger.error(f"Failed to generate Agora token for session {session_id}: {e}")
        return jsonify({'error': str(e)}), 500

@collaboration_bp.route('/history', methods=['GET'])
@token_required
def get_collaboration_history():
    """Get user's collaboration history."""
    
    try:
        from cosmos_db import get_cosmos_helper
        
        user_id = g.current_user.get('id')
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
        
        cosmos_helper = get_cosmos_helper()
        container = cosmos_helper.get_container('collaboration_history')
        
        # Query user's collaboration history
        query = """
        SELECT * FROM c 
        WHERE c.host_id = @user_id OR ARRAY_CONTAINS(c.participant_usernames, @username)
        ORDER BY c.completed_at DESC
        OFFSET @offset LIMIT @limit
        """
        
        username = g.current_user.get('username', f'User_{user_id[-4:]}')
        
        parameters = [
            {'name': '@user_id', 'value': user_id},
            {'name': '@username', 'value': username},
            {'name': '@offset', 'value': offset},
            {'name': '@limit', 'value': limit}
        ]
        
        results = list(container.query_items(
            query=query,
            parameters=parameters,
            enable_cross_partition_query=True
        ))
        
        return jsonify({
            'history': results,
            'count': len(results),
            'offset': offset,
            'limit': limit
        })
        
    except Exception as e:
        logger.error(f"Failed to get collaboration history: {e}")
        return jsonify({'error': str(e)}), 500

# Error handlers for collaboration blueprint
@collaboration_bp.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@collaboration_bp.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500