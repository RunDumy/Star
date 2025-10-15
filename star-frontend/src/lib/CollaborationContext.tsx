/**
 * Real-time Collaboration System for STAR Platform
 * Handles shared tarot readings, group numerology sessions, collaborative cosmos features,
 * live cursors, voice/video communication, and synchronized experiences.
 */

import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import io, { Socket } from 'socket.io-client';

// Types and Interfaces
export interface CollaborationUser {
    user_id: string;
    username: string;
    zodiac_sign: string;
    role: 'host' | 'participant' | 'observer' | 'guide';
    avatar_url?: string;
    is_online: boolean;
    cursor_position?: { x: number; y: number; element?: string };
}

export interface CollaborationSession {
    session_id: string;
    title: string;
    description: string;
    session_type: 'tarot_reading' | 'numerology_session' | 'cosmos_exploration' | 'group_meditation' | 'zodiac_circle' | 'cosmic_playlist';
    status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled';
    host_id: string;
    participants: CollaborationUser[];
    participant_count: number;
    max_participants: number;
    is_private: boolean;
    room_code?: string;
    created_at: string;
    started_at?: string;
    shared_state: Record<string, any>;
    live_cursors: Record<string, { x: number; y: number; timestamp: string; element?: string }>;
}

export interface CursorPosition {
    x: number;
    y: number;
    element?: string;
}

export interface TarotEvent {
    event_type: 'card_drawn' | 'interpretation_added' | 'spread_completed';
    card?: any;
    position?: string;
    interpretation?: string;
}

export interface NumerologyEvent {
    event_type: 'personal_calculation' | 'group_compatibility' | 'cosmic_timing';
    participant_data?: any;
    compatibility_data?: any;
    timing_data?: any;
}

export interface CosmosEvent {
    event_type: 'avatar_movement' | 'object_creation' | 'environment_change';
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    object_data?: any;
    environment_data?: any;
}

export interface VoiceChannelState {
    connected: boolean;
    muted: boolean;
    video_enabled: boolean;
    agora_uid?: number;
    token?: string;
    channel_name?: string;
}

// Collaboration Context
interface CollaborationContextType {
    // Connection state
    socket: Socket | null;
    connected: boolean;

    // Session management
    currentSession: CollaborationSession | null;
    availableSessions: CollaborationSession[];

    // Real-time features
    liveCursors: Record<string, CursorPosition & { username: string; zodiac_sign: string }>;
    voiceChannel: VoiceChannelState;

    // Actions
    createSession: (sessionData: Partial<CollaborationSession>) => Promise<string>;
    joinSession: (sessionId: string, password?: string) => Promise<boolean>;
    joinByRoomCode: (roomCode: string) => Promise<boolean>;
    leaveSession: () => Promise<boolean>;
    endSession: () => Promise<boolean>;

    // Real-time collaboration
    updateCursor: (position: CursorPosition) => void;
    syncState: (stateUpdate: Record<string, any>) => void;
    sendTarotEvent: (event: TarotEvent) => void;
    sendNumerologyEvent: (event: NumerologyEvent) => void;
    sendCosmosEvent: (event: CosmosEvent) => void;

    // Voice/Video
    joinVoiceChannel: () => Promise<boolean>;
    leaveVoiceChannel: () => Promise<boolean>;
    toggleMute: () => void;
    toggleVideo: () => void;

    // Session data
    refreshSessions: () => Promise<void>;
    getSessionHistory: () => Promise<any[]>;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

// Collaboration Provider Component
export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Socket and connection state
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    // Session state
    const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
    const [availableSessions, setAvailableSessions] = useState<CollaborationSession[]>([]);

    // Real-time state
    const [liveCursors, setLiveCursors] = useState<Record<string, CursorPosition & { username: string; zodiac_sign: string }>>({});
    const [voiceChannel, setVoiceChannel] = useState<VoiceChannelState>({
        connected: false,
        muted: false,
        video_enabled: false
    });

    // Agora RTC client
    const agoraClient = useRef<IAgoraRTCClient | null>(null);
    const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);
    const localVideoTrack = useRef<ICameraVideoTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

    // Initialize socket connection
    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const newSocket = io(API_URL, {
            transports: ['websocket'],
            upgrade: true
        });

        // Socket event listeners
        newSocket.on('connect', () => {
            console.log('[Collaboration] Connected to server');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('[Collaboration] Disconnected from server');
            setConnected(false);
        });

        newSocket.on('connection_confirmed', (data) => {
            console.log('[Collaboration] Connection confirmed:', data);
        });

        // Session events
        newSocket.on('session_created', (data) => {
            console.log('[Collaboration] Session created:', data);
            if (data.session_data) {
                setCurrentSession(data.session_data);
            }
        });

        newSocket.on('session_joined', (data) => {
            console.log('[Collaboration] Session joined:', data);
            setCurrentSession(prevSession => ({
                ...prevSession!,
                participants: data.participants || [],
                shared_state: data.session_data?.shared_state || {}
            }));
        });

        newSocket.on('session_left', () => {
            console.log('[Collaboration] Session left');
            setCurrentSession(null);
            setLiveCursors({});
        });

        newSocket.on('user_joined', (data) => {
            console.log('[Collaboration] User joined:', data);
            setCurrentSession(prevSession => {
                if (!prevSession) return null;

                const newUser: CollaborationUser = {
                    user_id: data.user_id,
                    username: data.username,
                    zodiac_sign: data.zodiac_sign,
                    role: data.role,
                    is_online: true
                };

                return {
                    ...prevSession,
                    participants: [...prevSession.participants.filter(p => p.user_id !== data.user_id), newUser],
                    participant_count: data.participant_count
                };
            });
        });

        newSocket.on('user_left', (data) => {
            console.log('[Collaboration] User left:', data);
            setCurrentSession(prevSession => {
                if (!prevSession) return null;

                return {
                    ...prevSession,
                    participants: prevSession.participants.filter(p => p.user_id !== data.user_id),
                    participant_count: data.participant_count
                };
            });

            // Remove user's cursor
            setLiveCursors(prevCursors => {
                const newCursors = { ...prevCursors };
                delete newCursors[data.user_id];
                return newCursors;
            });
        });

        // Real-time collaboration events
        newSocket.on('cursor_updated', (data) => {
            setLiveCursors(prevCursors => ({
                ...prevCursors,
                [data.user_id]: {
                    x: data.position.x,
                    y: data.position.y,
                    element: data.position.element,
                    username: data.username,
                    zodiac_sign: data.zodiac_sign || 'unknown'
                }
            }));
        });

        newSocket.on('state_synchronized', (data) => {
            console.log('[Collaboration] State synchronized:', data);
            setCurrentSession(prevSession => {
                if (!prevSession) return null;

                return {
                    ...prevSession,
                    shared_state: data.full_state || prevSession.shared_state
                };
            });
        });

        // Specialized collaboration events
        newSocket.on('tarot_event', (data) => {
            console.log('[Collaboration] Tarot event:', data);
            setCurrentSession(prevSession => {
                if (!prevSession) return null;

                return {
                    ...prevSession,
                    shared_state: {
                        ...prevSession.shared_state,
                        tarot_spread: data.tarot_spread
                    }
                };
            });
        });

        newSocket.on('numerology_event', (data) => {
            console.log('[Collaboration] Numerology event:', data);
            setCurrentSession(prevSession => {
                if (!prevSession) return null;

                return {
                    ...prevSession,
                    shared_state: {
                        ...prevSession.shared_state,
                        numerology_data: data.numerology_data
                    }
                };
            });
        });

        newSocket.on('cosmos_event', (data) => {
            console.log('[Collaboration] Cosmos event:', data);
            setCurrentSession(prevSession => {
                if (!prevSession) return null;

                return {
                    ...prevSession,
                    shared_state: {
                        ...prevSession.shared_state,
                        cosmos_state: data.cosmos_state
                    }
                };
            });
        });

        newSocket.on('voice_event', (data) => {
            console.log('[Collaboration] Voice event:', data);
            // Handle voice channel updates
        });

        newSocket.on('host_transferred', (data) => {
            console.log('[Collaboration] Host transferred:', data);
            setCurrentSession(prevSession => {
                if (!prevSession) return null;

                return {
                    ...prevSession,
                    host_id: data.new_host_id,
                    participants: prevSession.participants.map(p => ({
                        ...p,
                        role: p.user_id === data.new_host_id ? 'host' : 'participant'
                    }))
                };
            });
        });

        newSocket.on('error', (data) => {
            console.error('[Collaboration] Socket error:', data);
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
            newSocket.disconnect();
            setSocket(null);
            setConnected(false);
        };
    }, []);

    // Initialize Agora client
    useEffect(() => {
        agoraClient.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

        // Agora event handlers
        agoraClient.current.on('user-published', async (user, mediaType) => {
            await agoraClient.current!.subscribe(user, mediaType);
            console.log('[Agora] User published:', user.uid, mediaType);

            setRemoteUsers(prevUsers => {
                const updatedUsers = prevUsers.filter(u => u.uid !== user.uid);
                return [...updatedUsers, user];
            });
        });

        agoraClient.current.on('user-unpublished', (user) => {
            console.log('[Agora] User unpublished:', user.uid);
            setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
        });

        return () => {
            if (agoraClient.current) {
                agoraClient.current.removeAllListeners();
                agoraClient.current = null;
            }
        };
    }, []);

    // Session management functions
    const createSession = useCallback(async (sessionData: Partial<CollaborationSession>): Promise<string> => {
        if (!socket) throw new Error('Not connected');

        return new Promise((resolve, reject) => {
            socket.emit('create_session', {
                user_id: getUserId(),
                session_type: sessionData.session_type,
                title: sessionData.title,
                description: sessionData.description || '',
                max_participants: sessionData.max_participants || 8,
                is_private: sessionData.is_private || false,
                password: sessionData.password
            });

            socket.once('session_created', (data) => {
                resolve(data.session_id);
            });

            socket.once('error', (error) => {
                reject(new Error(error.message));
            });
        });
    }, [socket]);

    const joinSession = useCallback(async (sessionId: string, password?: string): Promise<boolean> => {
        if (!socket) throw new Error('Not connected');

        return new Promise((resolve, reject) => {
            socket.emit('join_collaboration', {
                session_id: sessionId,
                user_id: getUserId(),
                username: getUsername(),
                zodiac_sign: getZodiacSign(),
                password
            });

            socket.once('session_joined', () => {
                resolve(true);
            });

            socket.once('error', (error) => {
                reject(new Error(error.message));
            });
        });
    }, [socket]);

    const joinByRoomCode = useCallback(async (roomCode: string): Promise<boolean> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const response = await fetch(`${API_URL}/api/v1/collaboration/sessions/join-by-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ room_code: roomCode })
            });

            if (response.ok) {
                const data = await response.json();
                await joinSession(data.session_id);
                return true;
            }

            return false;
        } catch (error) {
            console.error('[Collaboration] Failed to join by room code:', error);
            return false;
        }
    }, [joinSession]);

    const leaveSession = useCallback(async (): Promise<boolean> => {
        if (!socket || !currentSession) return false;

        return new Promise((resolve) => {
            socket.emit('leave_collaboration', {
                session_id: currentSession.session_id,
                user_id: getUserId()
            });

            socket.once('session_left', () => {
                resolve(true);
            });

            socket.once('error', () => {
                resolve(false);
            });
        });
    }, [socket, currentSession]);

    const endSession = useCallback(async (): Promise<boolean> => {
        if (!currentSession) return false;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const response = await fetch(`${API_URL}/api/v1/collaboration/sessions/${currentSession.session_id}/end`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('[Collaboration] Failed to end session:', error);
            return false;
        }
    }, [currentSession]);

    // Real-time collaboration functions
    const updateCursor = useCallback((position: CursorPosition) => {
        if (!socket || !currentSession) return;

        socket.emit('cursor_move', {
            session_id: currentSession.session_id,
            position
        });
    }, [socket, currentSession]);

    const syncState = useCallback((stateUpdate: Record<string, any>) => {
        if (!socket || !currentSession) return;

        socket.emit('sync_state', {
            session_id: currentSession.session_id,
            state_update: stateUpdate
        });
    }, [socket, currentSession]);

    const sendTarotEvent = useCallback((event: TarotEvent) => {
        if (!socket || !currentSession) return;

        socket.emit('tarot_card_drawn', {
            session_id: currentSession.session_id,
            tarot_data: event
        });
    }, [socket, currentSession]);

    const sendNumerologyEvent = useCallback((event: NumerologyEvent) => {
        if (!socket || !currentSession) return;

        socket.emit('numerology_calculation', {
            session_id: currentSession.session_id,
            numerology_data: event
        });
    }, [socket, currentSession]);

    const sendCosmosEvent = useCallback((event: CosmosEvent) => {
        if (!socket || !currentSession) return;

        socket.emit('cosmos_interaction', {
            session_id: currentSession.session_id,
            cosmos_data: event
        });
    }, [socket, currentSession]);

    // Voice/Video functions
    const joinVoiceChannel = useCallback(async (): Promise<boolean> => {
        if (!currentSession || !agoraClient.current) return false;

        try {
            // Get Agora token from backend
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/v1/collaboration/sessions/${currentSession.session_id}/agora-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (!response.ok) return false;

            const { token, channel_name, uid, app_id } = await response.json();

            // Join Agora channel
            await agoraClient.current.join(app_id, channel_name, token, uid);

            // Create and publish local audio track
            localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack();
            await agoraClient.current.publish(localAudioTrack.current);

            setVoiceChannel({
                connected: true,
                muted: false,
                video_enabled: false,
                agora_uid: uid,
                token,
                channel_name
            });

            // Notify other participants
            if (socket) {
                socket.emit('voice_channel_join', {
                    session_id: currentSession.session_id,
                    voice_data: {
                        status: 'joined',
                        agora_uid: uid
                    }
                });
            }

            return true;
        } catch (error) {
            console.error('[Agora] Failed to join voice channel:', error);
            return false;
        }
    }, [currentSession, socket]);

    const leaveVoiceChannel = useCallback(async (): Promise<boolean> => {
        try {
            if (localAudioTrack.current) {
                localAudioTrack.current.close();
                localAudioTrack.current = null;
            }

            if (localVideoTrack.current) {
                localVideoTrack.current.close();
                localVideoTrack.current = null;
            }

            if (agoraClient.current) {
                await agoraClient.current.leave();
            }

            setVoiceChannel({
                connected: false,
                muted: false,
                video_enabled: false
            });

            setRemoteUsers([]);

            return true;
        } catch (error) {
            console.error('[Agora] Failed to leave voice channel:', error);
            return false;
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (localAudioTrack.current) {
            const muted = !voiceChannel.muted;
            localAudioTrack.current.setEnabled(!muted);

            setVoiceChannel(prev => ({
                ...prev,
                muted
            }));
        }
    }, [voiceChannel.muted]);

    const toggleVideo = useCallback(async () => {
        if (!agoraClient.current) return;

        try {
            const videoEnabled = !voiceChannel.video_enabled;

            if (videoEnabled) {
                // Enable video
                if (!localVideoTrack.current) {
                    localVideoTrack.current = await AgoraRTC.createCameraVideoTrack();
                    await agoraClient.current.publish(localVideoTrack.current);
                }
            } else {
                // Disable video
                if (localVideoTrack.current) {
                    await agoraClient.current.unpublish(localVideoTrack.current);
                    localVideoTrack.current.close();
                    localVideoTrack.current = null;
                }
            }

            setVoiceChannel(prev => ({
                ...prev,
                video_enabled: videoEnabled
            }));
        } catch (error) {
            console.error('[Agora] Failed to toggle video:', error);
        }
    }, [voiceChannel.video_enabled]);

    // Data fetching functions
    const refreshSessions = useCallback(async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const response = await fetch(`${API_URL}/api/v1/collaboration/sessions`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableSessions(data.sessions);
            }
        } catch (error) {
            console.error('[Collaboration] Failed to refresh sessions:', error);
        }
    }, []);

    const getSessionHistory = useCallback(async (): Promise<any[]> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const response = await fetch(`${API_URL}/api/v1/collaboration/history`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.history;
            }

            return [];
        } catch (error) {
            console.error('[Collaboration] Failed to get session history:', error);
            return [];
        }
    }, []);

    // Helper functions
    const getUserId = () => {
        const auth = JSON.parse(localStorage.getItem('star_auth') || '{}');
        return auth.user?.id || 'anonymous';
    };

    const getUsername = () => {
        const auth = JSON.parse(localStorage.getItem('star_auth') || '{}');
        return auth.user?.username || 'Anonymous User';
    };

    const getZodiacSign = () => {
        const auth = JSON.parse(localStorage.getItem('star_auth') || '{}');
        return auth.user?.zodiac_sign || 'unknown';
    };

    const getAuthToken = () => {
        const auth = JSON.parse(localStorage.getItem('star_auth') || '{}');
        return auth.token || '';
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (voiceChannel.connected) {
                leaveVoiceChannel();
            }
        };
    }, [voiceChannel.connected, leaveVoiceChannel]);

    // Context value
    const value = useMemo<CollaborationContextType>(() => ({
        socket,
        connected,
        currentSession,
        availableSessions,
        liveCursors,
        voiceChannel,
        createSession,
        joinSession,
        joinByRoomCode,
        leaveSession,
        endSession,
        updateCursor,
        syncState,
        sendTarotEvent,
        sendNumerologyEvent,
        sendCosmosEvent,
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        toggleVideo,
        refreshSessions,
        getSessionHistory
    }), [
        socket,
        connected,
        currentSession,
        availableSessions,
        liveCursors,
        voiceChannel,
        createSession,
        joinSession,
        joinByRoomCode,
        leaveSession,
        endSession,
        updateCursor,
        syncState,
        sendTarotEvent,
        sendNumerologyEvent,
        sendCosmosEvent,
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        toggleVideo,
        refreshSessions,
        getSessionHistory
    ]);

    return (
        <CollaborationContext.Provider value={value}>
            {children}
        </CollaborationContext.Provider>
    );
};

// Hook for using collaboration context
export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (!context) {
        throw new Error('useCollaboration must be used within a CollaborationProvider');
    }
    return context;
};

// Export types
export type { CollaborationContextType };
