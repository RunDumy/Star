"""
Real-time Collaboration Engine for STAR Platform
Handles shared tarot readings, group numerology sessions, collaborative cosmos features,
and synchronized multi-user experiences using SocketIO and real-time state management.
"""

import json
import logging
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Set

from cosmos_db import get_cosmos_helper
from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CollaborationSessionType(Enum):
    TAROT_READING = "tarot_reading"
    NUMEROLOGY_SESSION = "numerology_session"
    COSMOS_EXPLORATION = "cosmos_exploration"
    GROUP_MEDITATION = "group_meditation"
    ZODIAC_CIRCLE = "zodiac_circle"
    COSMIC_PLAYLIST = "cosmic_playlist"

class SessionStatus(Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class UserRole(Enum):
    HOST = "host"
    PARTICIPANT = "participant"
    OBSERVER = "observer"
    GUIDE = "guide"

@dataclass
class CollaborationUser:
    user_id: str
    username: str
    zodiac_sign: str
    role: UserRole
    avatar_url: Optional[str] = None
    is_online: bool = True
    last_activity: datetime = None
    cursor_position: Optional[Dict[str, float]] = None
    selected_element: Optional[str] = None
    
    def __post_init__(self):
        if self.last_activity is None:
            self.last_activity = datetime.utcnow()

@dataclass
class CollaborationSession:
    session_id: str
    session_type: CollaborationSessionType
    title: str
    description: str
    host_id: str
    participants: Dict[str, CollaborationUser]
    status: SessionStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    max_participants: int = 8
    is_private: bool = False
    password: Optional[str] = None
    room_code: Optional[str] = None
    
    # Session-specific data
    shared_state: Dict[str, Any] = None
    tarot_spread: Optional[Dict[str, Any]] = None
    numerology_data: Optional[Dict[str, Any]] = None
    cosmos_state: Optional[Dict[str, Any]] = None
    
    # Real-time collaboration features
    live_cursors: Dict[str, Dict[str, float]] = None
    voice_channels: Dict[str, Any] = None
    screen_sharing: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.shared_state is None:
            self.shared_state = {}
        if self.live_cursors is None:
            self.live_cursors = {}
        if self.voice_channels is None:
            self.voice_channels = {}

class CollaborationEngine:
    def __init__(self, socketio: SocketIO):
        self.socketio = socketio
        self.active_sessions: Dict[str, CollaborationSession] = {}
        self.user_sessions: Dict[str, Set[str]] = {}  # user_id -> set of session_ids
        self.socket_users: Dict[str, str] = {}  # socket_id -> user_id
        
        # Register SocketIO event handlers
        self._register_socket_events()
        
        # Initialize database helper
        self.cosmos_helper = get_cosmos_helper()
        self._ensure_containers()
    
    def _ensure_containers(self):
        """Ensure required Cosmos DB containers exist."""
        try:
            containers = ['collaboration_sessions', 'collaboration_history', 'collaboration_recordings']
            for container in containers:
                self.cosmos_helper.get_container(container)
            logger.info("Collaboration containers initialized")
        except Exception as e:
            logger.error(f"Failed to initialize collaboration containers: {e}")
    
    def _register_socket_events(self):
        """Register all SocketIO event handlers."""
        
        @self.socketio.on('connect')
        def handle_connect():
            logger.info(f"User connected: {request.sid}")
            emit('connection_confirmed', {'socket_id': request.sid})
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            logger.info(f"User disconnected: {request.sid}")
            self._handle_user_disconnect(request.sid)
        
        @self.socketio.on('join_collaboration')
        def handle_join_collaboration(data):
            return self._handle_join_session(data, request.sid)
        
        @self.socketio.on('leave_collaboration')
        def handle_leave_collaboration(data):
            return self._handle_leave_session(data, request.sid)
        
        @self.socketio.on('create_session')
        def handle_create_session(data):
            return self._handle_create_session(data, request.sid)
        
        @self.socketio.on('cursor_move')
        def handle_cursor_move(data):
            return self._handle_cursor_movement(data, request.sid)
        
        @self.socketio.on('sync_state')
        def handle_sync_state(data):
            return self._handle_state_sync(data, request.sid)
        
        @self.socketio.on('tarot_card_drawn')
        def handle_tarot_card_drawn(data):
            return self._handle_tarot_collaboration(data, request.sid)
        
        @self.socketio.on('numerology_calculation')
        def handle_numerology_calculation(data):
            return self._handle_numerology_collaboration(data, request.sid)
        
        @self.socketio.on('cosmos_interaction')
        def handle_cosmos_interaction(data):
            return self._handle_cosmos_collaboration(data, request.sid)
        
        @self.socketio.on('voice_channel_join')
        def handle_voice_join(data):
            return self._handle_voice_collaboration(data, request.sid)
    
    def create_session(
        self,
        host_id: str,
        session_type: CollaborationSessionType,
        title: str,
        description: str = "",
        max_participants: int = 8,
        is_private: bool = False,
        password: Optional[str] = None
    ) -> CollaborationSession:
        """Create a new collaboration session."""
        
        session_id = str(uuid.uuid4())
        room_code = self._generate_room_code() if not is_private else None
        
        # Create host user
        host_user = CollaborationUser(
            user_id=host_id,
            username=f"Host_{host_id[-4:]}",  # Will be updated with real username
            zodiac_sign="unknown",  # Will be updated with real zodiac sign
            role=UserRole.HOST
        )
        
        session = CollaborationSession(
            session_id=session_id,
            session_type=session_type,
            title=title,
            description=description,
            host_id=host_id,
            participants={host_id: host_user},
            status=SessionStatus.WAITING,
            created_at=datetime.utcnow(),
            max_participants=max_participants,
            is_private=is_private,
            password=password,
            room_code=room_code
        )
        
        # Store session
        self.active_sessions[session_id] = session
        
        # Track user sessions
        if host_id not in self.user_sessions:
            self.user_sessions[host_id] = set()
        self.user_sessions[host_id].add(session_id)
        
        # Save to database
        self._save_session_to_db(session)
        
        logger.info(f"Created collaboration session: {session_id} ({session_type.value})")
        return session
    
    def join_session(
        self,
        session_id: str,
        user_id: str,
        username: str,
        zodiac_sign: str,
        password: Optional[str] = None,
        role: UserRole = UserRole.PARTICIPANT
    ) -> bool:
        """Join an existing collaboration session."""
        
        if session_id not in self.active_sessions:
            logger.warning(f"Attempted to join non-existent session: {session_id}")
            return False
        
        session = self.active_sessions[session_id]
        
        # Check if session is full
        if len(session.participants) >= session.max_participants:
            logger.warning(f"Session {session_id} is full")
            return False
        
        # Check password if private
        if session.is_private and session.password != password:
            logger.warning(f"Incorrect password for private session: {session_id}")
            return False
        
        # Check if user already in session
        if user_id in session.participants:
            logger.info(f"User {user_id} already in session {session_id}")
            return True
        
        # Create participant user
        participant = CollaborationUser(
            user_id=user_id,
            username=username,
            zodiac_sign=zodiac_sign,
            role=role
        )
        
        # Add to session
        session.participants[user_id] = participant
        
        # Track user sessions
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = set()
        self.user_sessions[user_id].add(session_id)
        
        # Start session if not already started
        if session.status == SessionStatus.WAITING and len(session.participants) >= 2:
            session.status = SessionStatus.ACTIVE
            session.started_at = datetime.utcnow()
        
        # Update database
        self._save_session_to_db(session)
        
        # Notify all participants
        self._broadcast_to_session(session_id, 'user_joined', {
            'user_id': user_id,
            'username': username,
            'zodiac_sign': zodiac_sign,
            'role': role.value,
            'participant_count': len(session.participants)
        })
        
        logger.info(f"User {user_id} joined session {session_id}")
        return True
    
    def leave_session(self, session_id: str, user_id: str) -> bool:
        """Leave a collaboration session."""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if user_id not in session.participants:
            return False
        
        # Remove user from session
        user = session.participants.pop(user_id, None)
        
        # Remove from live cursors
        session.live_cursors.pop(user_id, None)
        
        # Update user sessions tracking
        if user_id in self.user_sessions:
            self.user_sessions[user_id].discard(session_id)
            if not self.user_sessions[user_id]:
                del self.user_sessions[user_id]
        
        # Handle host leaving
        if user_id == session.host_id and len(session.participants) > 0:
            # Transfer host to another participant
            new_host_id = next(iter(session.participants.keys()))
            session.host_id = new_host_id
            session.participants[new_host_id].role = UserRole.HOST
            
            self._broadcast_to_session(session_id, 'host_transferred', {
                'new_host_id': new_host_id,
                'new_host_username': session.participants[new_host_id].username
            })
        
        # End session if empty or only host remains
        if len(session.participants) == 0:
            session.status = SessionStatus.COMPLETED
            session.ended_at = datetime.utcnow()
            self._end_session(session_id)
        
        # Notify remaining participants
        self._broadcast_to_session(session_id, 'user_left', {
            'user_id': user_id,
            'username': user.username if user else 'Unknown',
            'participant_count': len(session.participants)
        })
        
        # Update database
        self._save_session_to_db(session)
        
        logger.info(f"User {user_id} left session {session_id}")
        return True
    
    def update_cursor_position(self, session_id: str, user_id: str, position: Dict[str, float]):
        """Update user's cursor position in real-time."""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if user_id not in session.participants:
            return False
        
        # Update cursor position
        session.live_cursors[user_id] = {
            'x': position.get('x', 0),
            'y': position.get('y', 0),
            'timestamp': datetime.utcnow().isoformat(),
            'element': position.get('element')
        }
        
        # Broadcast to other participants
        self._broadcast_to_session(session_id, 'cursor_updated', {
            'user_id': user_id,
            'username': session.participants[user_id].username,
            'position': session.live_cursors[user_id]
        }, exclude_user=user_id)
        
        return True
    
    def sync_session_state(self, session_id: str, user_id: str, state_update: Dict[str, Any]):
        """Synchronize session state across all participants."""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if user_id not in session.participants:
            return False
        
        # Update shared state
        for key, value in state_update.items():
            session.shared_state[key] = {
                'value': value,
                'updated_by': user_id,
                'timestamp': datetime.utcnow().isoformat()
            }
        
        # Broadcast state update
        self._broadcast_to_session(session_id, 'state_synchronized', {
            'updated_by': user_id,
            'updates': state_update,
            'full_state': session.shared_state
        }, exclude_user=user_id)
        
        # Update database
        self._save_session_to_db(session)
        
        return True
    
    def handle_tarot_collaboration(self, session_id: str, user_id: str, tarot_data: Dict[str, Any]):
        """Handle collaborative tarot reading events."""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if session.session_type != CollaborationSessionType.TAROT_READING:
            return False
        
        if user_id not in session.participants:
            return False
        
        # Update tarot spread state
        if session.tarot_spread is None:
            session.tarot_spread = {}
        
        event_type = tarot_data.get('event_type')
        
        if event_type == 'card_drawn':
            card_data = tarot_data.get('card')
            position = tarot_data.get('position')
            
            session.tarot_spread[position] = {
                'card': card_data,
                'drawn_by': user_id,
                'drawn_at': datetime.utcnow().isoformat()
            }
            
        elif event_type == 'interpretation_added':
            position = tarot_data.get('position')
            interpretation = tarot_data.get('interpretation')
            
            if position in session.tarot_spread:
                session.tarot_spread[position]['interpretation'] = interpretation
                session.tarot_spread[position]['interpreted_by'] = user_id
        
        elif event_type == 'spread_completed':
            session.tarot_spread['completed_at'] = datetime.utcnow().isoformat()
            session.tarot_spread['completed_by'] = user_id
        
        # Broadcast tarot event
        self._broadcast_to_session(session_id, 'tarot_event', {
            'event_type': event_type,
            'user_id': user_id,
            'username': session.participants[user_id].username,
            'data': tarot_data,
            'tarot_spread': session.tarot_spread
        })
        
        # Update database
        self._save_session_to_db(session)
        
        return True
    
    def handle_numerology_collaboration(self, session_id: str, user_id: str, numerology_data: Dict[str, Any]):
        """Handle collaborative numerology session events."""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if session.session_type != CollaborationSessionType.NUMEROLOGY_SESSION:
            return False
        
        if user_id not in session.participants:
            return False
        
        # Update numerology data
        if session.numerology_data is None:
            session.numerology_data = {'participants': {}, 'group_analysis': {}}
        
        event_type = numerology_data.get('event_type')
        
        if event_type == 'personal_calculation':
            participant_data = numerology_data.get('participant_data')
            session.numerology_data['participants'][user_id] = {
                'data': participant_data,
                'calculated_by': user_id,
                'calculated_at': datetime.utcnow().isoformat()
            }
            
        elif event_type == 'group_compatibility':
            compatibility_data = numerology_data.get('compatibility_data')
            session.numerology_data['group_analysis']['compatibility'] = {
                'data': compatibility_data,
                'analyzed_by': user_id,
                'analyzed_at': datetime.utcnow().isoformat()
            }
        
        elif event_type == 'cosmic_timing':
            timing_data = numerology_data.get('timing_data')
            session.numerology_data['group_analysis']['cosmic_timing'] = {
                'data': timing_data,
                'calculated_by': user_id,
                'calculated_at': datetime.utcnow().isoformat()
            }
        
        # Broadcast numerology event
        self._broadcast_to_session(session_id, 'numerology_event', {
            'event_type': event_type,
            'user_id': user_id,
            'username': session.participants[user_id].username,
            'data': numerology_data,
            'numerology_data': session.numerology_data
        })
        
        # Update database
        self._save_session_to_db(session)
        
        return True
    
    def handle_cosmos_collaboration(self, session_id: str, user_id: str, cosmos_data: Dict[str, Any]):
        """Handle collaborative 3D cosmos exploration events."""
        
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        
        if session.session_type != CollaborationSessionType.COSMOS_EXPLORATION:
            return False
        
        if user_id not in session.participants:
            return False
        
        # Update cosmos state
        if session.cosmos_state is None:
            session.cosmos_state = {'avatars': {}, 'shared_objects': {}, 'environments': {}}
        
        event_type = cosmos_data.get('event_type')
        
        if event_type == 'avatar_movement':
            position = cosmos_data.get('position')
            rotation = cosmos_data.get('rotation')
            
            session.cosmos_state['avatars'][user_id] = {
                'position': position,
                'rotation': rotation,
                'updated_at': datetime.utcnow().isoformat()
            }
            
        elif event_type == 'object_creation':
            object_data = cosmos_data.get('object_data')
            object_id = str(uuid.uuid4())
            
            session.cosmos_state['shared_objects'][object_id] = {
                'data': object_data,
                'created_by': user_id,
                'created_at': datetime.utcnow().isoformat()
            }
            
        elif event_type == 'environment_change':
            environment_data = cosmos_data.get('environment_data')
            
            session.cosmos_state['environments']['current'] = {
                'data': environment_data,
                'changed_by': user_id,
                'changed_at': datetime.utcnow().isoformat()
            }
        
        # Broadcast cosmos event
        self._broadcast_to_session(session_id, 'cosmos_event', {
            'event_type': event_type,
            'user_id': user_id,
            'username': session.participants[user_id].username,
            'data': cosmos_data,
            'cosmos_state': session.cosmos_state
        })
        
        return True
    
    def _handle_join_session(self, data: Dict[str, Any], socket_id: str):
        """Handle join session request from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = data.get('user_id')
        username = data.get('username')
        zodiac_sign = data.get('zodiac_sign')
        password = data.get('password')
        
        if not all([session_id, user_id, username, zodiac_sign]):
            emit('error', {'message': 'Missing required fields'})
            return
        
        # Track socket-user mapping
        self.socket_users[socket_id] = user_id
        
        success = self.join_session(session_id, user_id, username, zodiac_sign, password)
        
        if success:
            join_room(session_id)
            session = self.active_sessions[session_id]
            
            emit('session_joined', {
                'session_id': session_id,
                'participants': [asdict(p) for p in session.participants.values()],
                'session_data': {
                    'title': session.title,
                    'description': session.description,
                    'type': session.session_type.value,
                    'status': session.status.value,
                    'shared_state': session.shared_state
                }
            })
        else:
            emit('error', {'message': 'Failed to join session'})
    
    def _handle_leave_session(self, data: Dict[str, Any], socket_id: str):
        """Handle leave session request from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = self.socket_users.get(socket_id)
        
        if session_id and user_id:
            leave_room(session_id)
            success = self.leave_session(session_id, user_id)
            
            if success:
                emit('session_left', {'session_id': session_id})
            else:
                emit('error', {'message': 'Failed to leave session'})
    
    def _handle_create_session(self, data: Dict[str, Any], socket_id: str):
        """Handle create session request from SocketIO."""
        
        user_id = data.get('user_id')
        session_type = data.get('session_type')
        title = data.get('title')
        description = data.get('description', '')
        max_participants = data.get('max_participants', 8)
        is_private = data.get('is_private', False)
        password = data.get('password')
        
        if not all([user_id, session_type, title]):
            emit('error', {'message': 'Missing required fields'})
            return
        
        try:
            session_type_enum = CollaborationSessionType(session_type)
        except ValueError:
            emit('error', {'message': 'Invalid session type'})
            return
        
        # Track socket-user mapping
        self.socket_users[socket_id] = user_id
        
        session = self.create_session(
            host_id=user_id,
            session_type=session_type_enum,
            title=title,
            description=description,
            max_participants=max_participants,
            is_private=is_private,
            password=password
        )
        
        join_room(session.session_id)
        
        emit('session_created', {
            'session_id': session.session_id,
            'room_code': session.room_code,
            'session_data': asdict(session)
        })
    
    def _handle_cursor_movement(self, data: Dict[str, Any], socket_id: str):
        """Handle cursor movement from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = self.socket_users.get(socket_id)
        position = data.get('position')
        
        if session_id and user_id and position:
            self.update_cursor_position(session_id, user_id, position)
    
    def _handle_state_sync(self, data: Dict[str, Any], socket_id: str):
        """Handle state synchronization from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = self.socket_users.get(socket_id)
        state_update = data.get('state_update')
        
        if session_id and user_id and state_update:
            self.sync_session_state(session_id, user_id, state_update)
    
    def _handle_tarot_collaboration(self, data: Dict[str, Any], socket_id: str):
        """Handle tarot collaboration from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = self.socket_users.get(socket_id)
        tarot_data = data.get('tarot_data')
        
        if session_id and user_id and tarot_data:
            self.handle_tarot_collaboration(session_id, user_id, tarot_data)
    
    def _handle_numerology_collaboration(self, data: Dict[str, Any], socket_id: str):
        """Handle numerology collaboration from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = self.socket_users.get(socket_id)
        numerology_data = data.get('numerology_data')
        
        if session_id and user_id and numerology_data:
            self.handle_numerology_collaboration(session_id, user_id, numerology_data)
    
    def _handle_cosmos_collaboration(self, data: Dict[str, Any], socket_id: str):
        """Handle cosmos collaboration from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = self.socket_users.get(socket_id)
        cosmos_data = data.get('cosmos_data')
        
        if session_id and user_id and cosmos_data:
            self.handle_cosmos_collaboration(session_id, user_id, cosmos_data)
    
    def _handle_voice_collaboration(self, data: Dict[str, Any], socket_id: str):
        """Handle voice channel collaboration from SocketIO."""
        
        session_id = data.get('session_id')
        user_id = self.socket_users.get(socket_id)
        voice_data = data.get('voice_data')
        
        if session_id and user_id:
            if session_id in self.active_sessions:
                session = self.active_sessions[session_id]
                
                # Update voice channel state
                session.voice_channels[user_id] = {
                    'status': voice_data.get('status', 'joined'),
                    'muted': voice_data.get('muted', False),
                    'agora_uid': voice_data.get('agora_uid'),
                    'joined_at': datetime.utcnow().isoformat()
                }
                
                # Broadcast voice event
                self._broadcast_to_session(session_id, 'voice_event', {
                    'user_id': user_id,
                    'username': session.participants[user_id].username,
                    'voice_data': voice_data,
                    'voice_channels': session.voice_channels
                })
    
    def _handle_user_disconnect(self, socket_id: str):
        """Handle user disconnection from SocketIO."""
        
        user_id = self.socket_users.get(socket_id)
        if not user_id:
            return
        
        # Remove user from all sessions
        if user_id in self.user_sessions:
            session_ids = list(self.user_sessions[user_id])
            for session_id in session_ids:
                self.leave_session(session_id, user_id)
        
        # Clean up socket mapping
        del self.socket_users[socket_id]
    
    def _broadcast_to_session(self, session_id: str, event: str, data: Dict[str, Any], exclude_user: Optional[str] = None):
        """Broadcast event to all participants in a session."""
        
        if exclude_user:
            # Find socket IDs for users in session except excluded user
            target_sockets = []
            for socket_id, user_id in self.socket_users.items():
                if user_id != exclude_user and user_id in self.active_sessions.get(session_id, {}).participants:
                    target_sockets.append(socket_id)
            
            for socket_id in target_sockets:
                self.socketio.emit(event, data, room=socket_id)
        else:
            self.socketio.emit(event, data, room=session_id)
    
    def _generate_room_code(self) -> str:
        """Generate a unique room code for public sessions."""
        import random
        import string
        
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            # Check if code is already in use
            code_exists = any(
                session.room_code == code 
                for session in self.active_sessions.values() 
                if session.room_code
            )
            if not code_exists:
                return code
    
    def _save_session_to_db(self, session: CollaborationSession):
        """Save session to Cosmos DB."""
        
        try:
            container = self.cosmos_helper.get_container('collaboration_sessions')
            
            # Convert session to dict for storage
            session_data = {
                'id': session.session_id,
                'session_type': session.session_type.value,
                'title': session.title,
                'description': session.description,
                'host_id': session.host_id,
                'participants': {uid: asdict(user) for uid, user in session.participants.items()},
                'status': session.status.value,
                'created_at': session.created_at.isoformat(),
                'started_at': session.started_at.isoformat() if session.started_at else None,
                'ended_at': session.ended_at.isoformat() if session.ended_at else None,
                'max_participants': session.max_participants,
                'is_private': session.is_private,
                'room_code': session.room_code,
                'shared_state': session.shared_state,
                'tarot_spread': session.tarot_spread,
                'numerology_data': session.numerology_data,
                'cosmos_state': session.cosmos_state,
                'live_cursors': session.live_cursors,
                'voice_channels': session.voice_channels,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            container.upsert_item(session_data)
            logger.info(f"Saved session to database: {session.session_id}")
            
        except Exception as e:
            logger.error(f"Failed to save session to database: {e}")
    
    def _end_session(self, session_id: str):
        """End and clean up a collaboration session."""
        
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            
            # Save final state to history
            self._save_session_history(session)
            
            # Clean up active sessions
            del self.active_sessions[session_id]
            
            # Clean up user sessions tracking
            for user_id in list(session.participants.keys()):
                if user_id in self.user_sessions:
                    self.user_sessions[user_id].discard(session_id)
                    if not self.user_sessions[user_id]:
                        del self.user_sessions[user_id]
            
            logger.info(f"Session ended and cleaned up: {session_id}")
    
    def _save_session_history(self, session: CollaborationSession):
        """Save completed session to history."""
        
        try:
            container = self.cosmos_helper.get_container('collaboration_history')
            
            history_data = {
                'id': f"{session.session_id}_history",
                'session_id': session.session_id,
                'session_type': session.session_type.value,
                'title': session.title,
                'description': session.description,
                'host_id': session.host_id,
                'participant_count': len(session.participants),
                'participant_usernames': [user.username for user in session.participants.values()],
                'duration_minutes': (
                    (session.ended_at - session.started_at).total_seconds() / 60
                    if session.started_at and session.ended_at else 0
                ),
                'final_state': session.shared_state,
                'tarot_results': session.tarot_spread,
                'numerology_results': session.numerology_data,
                'cosmos_final_state': session.cosmos_state,
                'completed_at': datetime.utcnow().isoformat()
            }
            
            container.create_item(history_data)
            logger.info(f"Saved session history: {session.session_id}")
            
        except Exception as e:
            logger.error(f"Failed to save session history: {e}")
    
    def get_active_sessions(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get list of active collaboration sessions."""
        
        sessions = []
        for session in self.active_sessions.values():
            if user_id and user_id not in session.participants:
                continue
                
            session_info = {
                'session_id': session.session_id,
                'title': session.title,
                'description': session.description,
                'session_type': session.session_type.value,
                'status': session.status.value,
                'participant_count': len(session.participants),
                'max_participants': session.max_participants,
                'is_private': session.is_private,
                'room_code': session.room_code,
                'created_at': session.created_at.isoformat(),
                'host_username': session.participants.get(session.host_id, {}).username if session.host_id in session.participants else 'Unknown'
            }
            sessions.append(session_info)
        
        return sessions

# Global collaboration engine instance
collaboration_engine = None

def init_collaboration_engine(socketio: SocketIO) -> CollaborationEngine:
    """Initialize the global collaboration engine."""
    global collaboration_engine
    collaboration_engine = CollaborationEngine(socketio)
    return collaboration_engine

def get_collaboration_engine() -> CollaborationEngine:
    """Get the global collaboration engine instance."""
    return collaboration_engine