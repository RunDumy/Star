import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Interfaces
export interface CollaborationParticipant {
    user_id: string;
    username: string;
    zodiac_sign: string;
    role: string;
    joined_at?: string;
    is_online: boolean;
}

export interface CollaborationSession {
    session_id: string;
    title: string;
    description?: string;
    session_type: string;
    status: string;
    host_id: string;
    participants: CollaborationParticipant[];
    participant_count?: number; // For compatibility
    max_participants: number;
    is_private: boolean;
    room_code: string;
    created_at: string;
    started_at?: string; // For compatibility
    shared_state: any;
    live_cursors: any;
}export interface CursorPosition {
    x: number;
    y: number;
    user_id: string;
    username: string;
    zodiac_sign: string;
}

export interface CollaborationContextType {
    // Session management
    currentSession: CollaborationSession | null;
    availableSessions: CollaborationSession[];
    createSession: (data: {
        session_type: string;
        title: string;
        description?: string;
        max_participants?: number;
        is_private?: boolean;
        password?: string;
    }) => Promise<CollaborationSession>;
    joinSession: (sessionId: string, password?: string) => Promise<boolean>;
    joinSessionByCode: (roomCode: string, password?: string) => Promise<CollaborationSession>;
    leaveSession: () => Promise<boolean>;
    joinByRoomCode: (roomCode: string) => Promise<boolean>;
    refreshSessions: () => Promise<void>;

    // State synchronization
    updateSharedState: (updates: any) => void;
    sharedState: any;

    // Live cursors
    cursors: CursorPosition[];
    updateCursor: (position: { x: number; y: number }) => void;

    // Socket connection
    socket: Socket | null;
    isConnected: boolean;
    isLoading: boolean;

    // Error handling
    error: string | null;
    clearError: () => void;

    // Voice channel (placeholder for future AgoraRTC integration)
    voiceChannel: {
        connected: boolean;
        muted: boolean;
        video_enabled: boolean;
    };
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export interface CollaborationProviderProps {
    children: React.ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
    const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
    const [availableSessions, setAvailableSessions] = useState<CollaborationSession[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sharedState, setSharedState] = useState<any>({});
    const [cursors, setCursors] = useState<CursorPosition[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [voiceChannel, setVoiceChannel] = useState({
        connected: false,
        muted: false,
        video_enabled: false
    }); const socketRef = useRef<Socket | null>(null);

    // Socket event handlers
    const handleStateUpdated = useCallback((data: any) => {
        console.log('[COLLABORATION] State updated:', data);
        setSharedState((prev: any) => ({ ...prev, ...data.updates }));
    }, []); const handleCursorMoved = useCallback((data: any) => {
        setCursors(prev => {
            const existing = prev.findIndex(c => c.user_id === data.user_id);
            const cursorData = { x: data.x, y: data.y, user_id: data.user_id, username: data.username, zodiac_sign: data.zodiac_sign };

            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = cursorData;
                return updated;
            }
            return [...prev, cursorData];
        });
    }, []);

    const handleCursorRemoved = useCallback((data: any) => {
        setCursors(prev => prev.filter(c => c.user_id !== data.user_id));
    }, []);

    const handleParticipantJoined = useCallback((data: any) => {
        setCurrentSession(prev => prev ? { ...prev, participants: [...prev.participants, data.participant] } : null);
    }, []);

    const handleParticipantLeft = useCallback((data: any) => {
        setCurrentSession(prev => prev ? { ...prev, participants: prev.participants.filter(p => p.user_id !== data.user_id) } : null);
    }, []);

    // Initialize Socket.IO connection
    const initSocket = useCallback(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[COLLABORATION] Connected to server');
            setIsConnected(true);
            setError(null);
        });

        socket.on('disconnect', (reason) => {
            console.log('[COLLABORATION] Disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('[COLLABORATION] Connection error:', error);
            setError('Failed to connect to collaboration server');
            setIsConnected(false);
        });

        // Session events
        socket.on('session_joined', (data) => {
            console.log('[COLLABORATION] Session joined:', data);
            setCurrentSession(data.session);
            setSharedState(data.shared_state || {});
        });

        socket.on('session_left', (data) => {
            console.log('[COLLABORATION] Session left:', data);
            setCurrentSession(null);
            setSharedState({});
            setCursors([]);
        });

        socket.on('session_updated', (data) => {
            console.log('[COLLABORATION] Session updated:', data);
            setCurrentSession(data.session);
        });

        socket.on('participant_joined', handleParticipantJoined);
        socket.on('participant_left', handleParticipantLeft);

        // State synchronization events
        socket.on('state_updated', handleStateUpdated);

        // Cursor events
        socket.on('cursor_moved', handleCursorMoved);
        socket.on('cursor_removed', handleCursorRemoved);

        // Error handling
        socket.on('error', (data) => {
            console.error('[COLLABORATION] Socket error:', data);
            setError(data.message || 'Collaboration error occurred');
        });

    }, [handleStateUpdated, handleCursorMoved, handleCursorRemoved, handleParticipantJoined, handleParticipantLeft]);

    // Load available sessions
    const loadSessions = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/v1/collaboration/sessions');
            setAvailableSessions(response.data.sessions || []);
        } catch (error) {
            console.error('[COLLABORATION] Failed to load sessions:', error);
            setError('Failed to load available sessions');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create session
    const createSession = useCallback(async (data: {
        session_type: string;
        title: string;
        description?: string;
        max_participants?: number;
        is_private?: boolean;
        password?: string;
    }): Promise<CollaborationSession> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.post('/api/v1/collaboration/sessions', data);

            const newSession: CollaborationSession = {
                session_id: response.data.session_id,
                title: response.data.title,
                description: response.data.description || '',
                session_type: response.data.session_type,
                status: response.data.status,
                host_id: response.data.host_id,
                participants: [],
                max_participants: response.data.max_participants,
                is_private: response.data.is_private,
                room_code: response.data.room_code,
                created_at: response.data.created_at,
                shared_state: {},
                live_cursors: {}
            };

            setCurrentSession(newSession);
            await loadSessions(); // Refresh available sessions

            return newSession;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to create session';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [loadSessions]);

    // Join session
    const joinSession = useCallback(async (sessionId: string, password?: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            await axios.post(`/api/v1/collaboration/sessions/${sessionId}/join`, {
                password
            });

            // Socket will handle the session_joined event
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to join session';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Join session by room code
    const joinSessionByCode = useCallback(async (roomCode: string, password?: string): Promise<CollaborationSession> => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.post('/api/v1/collaboration/sessions/join-by-code', {
                room_code: roomCode,
                password
            });

            const session: CollaborationSession = {
                session_id: response.data.session_id,
                title: response.data.session_title,
                description: '',
                session_type: response.data.session_type,
                status: 'active',
                host_id: '',
                participants: [],
                max_participants: 8,
                is_private: false,
                room_code: roomCode,
                created_at: new Date().toISOString(),
                shared_state: {},
                live_cursors: {}
            };

            setCurrentSession(session);
            return session;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to join session';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Leave session
    const leaveSession = useCallback(async (): Promise<boolean> => {
        if (!currentSession) return false;

        try {
            setIsLoading(true);
            setError(null);

            await axios.post(`/api/v1/collaboration/sessions/${currentSession.session_id}/leave`);

            // Socket will handle the session_left event
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to leave session';
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [currentSession]);

    // Update shared state
    const updateSharedState = useCallback((updates: any) => {
        if (!currentSession || !socketRef.current) return;

        socketRef.current.emit('update_state', {
            session_id: currentSession.session_id,
            updates
        });
    }, [currentSession]);

    // Update cursor position
    const updateCursor = useCallback((position: { x: number; y: number }) => {
        if (!currentSession || !socketRef.current) return;

        socketRef.current.emit('cursor_move', {
            session_id: currentSession.session_id,
            x: position.x,
            y: position.y
        });
    }, [currentSession]);

    // Voice channel functions (placeholder for future AgoraRTC integration)
    const joinVoiceChannel = useCallback(async () => {
        setVoiceChannel(prev => ({ ...prev, connected: true }));
    }, []);

    const leaveVoiceChannel = useCallback(async () => {
        setVoiceChannel(prev => ({ ...prev, connected: false, muted: false, video_enabled: false }));
    }, []);

    const toggleMute = useCallback(() => {
        setVoiceChannel(prev => ({ ...prev, muted: !prev.muted }));
    }, []);

    const toggleVideo = useCallback(() => {
        setVoiceChannel(prev => ({ ...prev, video_enabled: !prev.video_enabled }));
    }, []);    // Join by room code (alias for joinSessionByCode)
    const joinByRoomCode = useCallback(async (roomCode: string): Promise<boolean> => {
        try {
            await joinSessionByCode(roomCode);
            return true;
        } catch {
            return false;
        }
    }, [joinSessionByCode]);

    // Refresh sessions
    const refreshSessions = useCallback(async () => {
        await loadSessions();
    }, [loadSessions]);

    // Clear error
    const clearError = useCallback(() => setError(null), []);

    // Initialize on mount
    useEffect(() => {
        initSocket();
        loadSessions();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [initSocket, loadSessions]);

    const value: CollaborationContextType = useMemo(() => ({
        currentSession,
        availableSessions,
        isConnected,
        isLoading,
        createSession,
        joinSession,
        joinSessionByCode,
        leaveSession,
        updateSharedState,
        sharedState,
        cursors,
        updateCursor,
        socket: socketRef.current,
        error,
        clearError,
        // Additional properties for compatibility
        connected: isConnected,
        voiceChannel,
        joinByRoomCode,
        refreshSessions,
        // Voice channel functions
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        toggleVideo
    }), [currentSession, availableSessions, isConnected, isLoading, createSession, joinSession, joinSessionByCode, leaveSession, updateSharedState, sharedState, cursors, updateCursor, error, clearError, voiceChannel, joinByRoomCode, refreshSessions, joinVoiceChannel, leaveVoiceChannel, toggleMute, toggleVideo]);

    return (
        <CollaborationContext.Provider value={value}>
            {children}
        </CollaborationContext.Provider>
    );
};

export const useCollaboration = (): CollaborationContextType => {
    const context = useContext(CollaborationContext);
    if (context === undefined) {
        throw new Error('useCollaboration must be used within a CollaborationProvider');
    }
    return context;
};

export default CollaborationContext;