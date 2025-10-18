/**
 * Enhanced Cosmic WebSocket Service for STAR Platform
 * Handles real-time communication for music sync, cosmic events, and collaborative features
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export interface CosmicEvent {
    type: string;
    data: any;
    timestamp: string;
    userId?: string;
    cosmicSignature?: string;
}

export interface MusicSyncEvent {
    track_id: string;
    position: number;
    is_playing: boolean;
    timestamp: number;
    cosmic_phase?: string;
    energy_level?: number;
}

export interface CollaborativeSession {
    session_id: string;
    participants: Array<{
        user_id: string;
        username: string;
        zodiac_sign: string;
        cosmic_role: string;
    }>;
    current_activity: string;
    cosmic_alignment: number;
    energy_flows: Record<string, number>;
}

export interface CosmicNotification {
    id: string;
    type: 'cosmic_event' | 'music_sync' | 'tarot_insight' | 'lunar_phase' | 'user_action';
    title: string;
    message: string;
    cosmic_significance: number;
    expires_at?: string;
    action_url?: string;
}

class EnhancedCosmicWebSocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isConnecting = false;
    private eventListeners = new Map<string, Set<Function>>();
    private connectionCallbacks = new Set<Function>();
    private disconnectionCallbacks = new Set<Function>();

    constructor() {
        this.initializeSocket();
    }

    private initializeSocket(): void {
        if (this.isConnecting || this.socket?.connected) return;

        this.isConnecting = true;
        const token = localStorage.getItem('token');

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay
        });

        this.setupEventHandlers();
        this.isConnecting = false;
    }

    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('[CosmicWebSocket] Connected to cosmic realm');
            this.reconnectAttempts = 0;
            this.connectionCallbacks.forEach(callback => callback());
        });

        this.socket.on('disconnect', (reason) => {
            console.log('[CosmicWebSocket] Disconnected from cosmic realm:', reason);
            this.disconnectionCallbacks.forEach(callback => callback(reason));
        });

        this.socket.on('connect_error', (error) => {
            console.error('[CosmicWebSocket] Connection error:', error);
            this.handleReconnection();
        });

        // Music sync events
        this.socket.on('music_sync', (data: MusicSyncEvent) => {
            this.emitToListeners('music_sync', data);
        });

        this.socket.on('music_state_change', (data: any) => {
            this.emitToListeners('music_state_change', data);
        });

        // Cosmic events
        this.socket.on('cosmic_event', (data: CosmicEvent) => {
            this.emitToListeners('cosmic_event', data);
        });

        this.socket.on('lunar_phase_change', (data: any) => {
            this.emitToListeners('lunar_phase_change', data);
        });

        this.socket.on('energy_shift', (data: any) => {
            this.emitToListeners('energy_shift', data);
        });

        // Collaborative features
        this.socket.on('session_update', (data: CollaborativeSession) => {
            this.emitToListeners('session_update', data);
        });

        this.socket.on('participant_joined', (data: any) => {
            this.emitToListeners('participant_joined', data);
        });

        this.socket.on('participant_left', (data: any) => {
            this.emitToListeners('participant_left', data);
        });

        // Real-time notifications
        this.socket.on('cosmic_notification', (data: CosmicNotification) => {
            this.emitToListeners('cosmic_notification', data);
        });

        // Tarot and spiritual events
        this.socket.on('tarot_insight', (data: any) => {
            this.emitToListeners('tarot_insight', data);
        });

        this.socket.on('synchronicity_event', (data: any) => {
            this.emitToListeners('synchronicity_event', data);
        });

        // Analytics events
        this.socket.on('analytics_update', (data: any) => {
            this.emitToListeners('analytics_update', data);
        });

        this.socket.on('real_time_metrics', (data: any) => {
            this.emitToListeners('real_time_metrics', data);
        });
    }

    private emitToListeners(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(data);
                } catch (error) {
                    console.error(`[CosmicWebSocket] Error in listener for ${event}:`, error);
                }
            });
        }
    }

    private handleReconnection(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[CosmicWebSocket] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        setTimeout(() => {
            console.log(`[CosmicWebSocket] Reconnection attempt ${this.reconnectAttempts}`);
            this.initializeSocket();
        }, delay);
    }

    // Public API methods

    /**
     * Connect to the cosmic WebSocket
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve();
                return;
            }

            this.initializeSocket();

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, 10000);

            this.onConnect(() => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }

    /**
     * Disconnect from the cosmic WebSocket
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.eventListeners.clear();
        this.connectionCallbacks.clear();
        this.disconnectionCallbacks.clear();
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Join a collaborative cosmic session
     */
    joinCosmicSession(sessionId: string, userInfo: any): void {
        if (this.socket?.connected) {
            this.socket.emit('join_cosmic_session', {
                session_id: sessionId,
                user_info: userInfo,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Leave a collaborative cosmic session
     */
    leaveCosmicSession(sessionId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_cosmic_session', {
                session_id: sessionId,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Sync music state across connected users
     */
    syncMusicState(syncData: MusicSyncEvent): void {
        if (this.socket?.connected) {
            this.socket.emit('sync_music_state', syncData);
        }
    }

    /**
     * Broadcast cosmic event
     */
    broadcastCosmicEvent(event: CosmicEvent): void {
        if (this.socket?.connected) {
            this.socket.emit('broadcast_cosmic_event', event);
        }
    }

    /**
     * Send tarot synchronicity signal
     */
    sendTarotSynchronicity(data: {
        card_id: string;
        cosmic_timing: number;
        energy_signature: string;
    }): void {
        if (this.socket?.connected) {
            this.socket.emit('tarot_synchronicity', data);
        }
    }

    /**
     * Update user's cosmic presence
     */
    updateCosmicPresence(presence: {
        activity: string;
        energy_level: number;
        cosmic_mood: string;
        location?: string;
    }): void {
        if (this.socket?.connected) {
            this.socket.emit('update_cosmic_presence', presence);
        }
    }

    /**
     * Request real-time analytics
     */
    requestRealTimeAnalytics(metrics: string[] = []): void {
        if (this.socket?.connected) {
            this.socket.emit('request_real_time_analytics', { metrics });
        }
    }

    // Event subscription methods

    /**
     * Subscribe to an event
     */
    on(event: string, callback: Function): () => void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }

        this.eventListeners.get(event)!.add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.eventListeners.get(event);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.eventListeners.delete(event);
                }
            }
        };
    }

    /**
     * Subscribe to connection events
     */
    onConnect(callback: Function): () => void {
        this.connectionCallbacks.add(callback);

        // If already connected, call immediately
        if (this.socket?.connected) {
            callback();
        }

        return () => {
            this.connectionCallbacks.delete(callback);
        };
    }

    /**
     * Subscribe to disconnection events
     */
    onDisconnect(callback: Function): () => void {
        this.disconnectionCallbacks.add(callback);
        return () => {
            this.disconnectionCallbacks.delete(callback);
        };
    }

    /**
     * Subscribe to music sync events
     */
    onMusicSync(callback: (data: MusicSyncEvent) => void): () => void {
        return this.on('music_sync', callback);
    }

    /**
     * Subscribe to cosmic events
     */
    onCosmicEvent(callback: (data: CosmicEvent) => void): () => void {
        return this.on('cosmic_event', callback);
    }

    /**
     * Subscribe to session updates
     */
    onSessionUpdate(callback: (data: CollaborativeSession) => void): () => void {
        return this.on('session_update', callback);
    }

    /**
     * Subscribe to cosmic notifications
     */
    onCosmicNotification(callback: (data: CosmicNotification) => void): () => void {
        return this.on('cosmic_notification', callback);
    }

    /**
     * Subscribe to real-time analytics
     */
    onAnalyticsUpdate(callback: (data: any) => void): () => void {
        return this.on('analytics_update', callback);
    }

    /**
     * Get connection statistics
     */
    getConnectionStats(): {
        connected: boolean;
        reconnectAttempts: number;
        activeListeners: number;
        uptime: number;
    } {
        return {
            connected: this.socket?.connected || false,
            reconnectAttempts: this.reconnectAttempts,
            activeListeners: Array.from(this.eventListeners.values())
                .reduce((total, listeners) => total + listeners.size, 0),
            uptime: this.socket?.connected ? Date.now() - (this.socket as any).auth?.connectedAt || 0 : 0
        };
    }
}

// Create and export singleton instance
const cosmicWebSocketService = new EnhancedCosmicWebSocketService();
export default cosmicWebSocketService;