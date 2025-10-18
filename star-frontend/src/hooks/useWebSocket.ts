/**
 * WebSocket Hook for Real-time Features
 * Handles cosmic synchronization and live updates
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    connectionError: string | null;
    sendMessage: (event: string, data: any) => void;
    disconnect: () => void;
}

export const useWebSocket = (namespace: string = ''): UseWebSocketReturn => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');

        if (!token) {
            setConnectionError('Authentication required for real-time features');
            return;
        }

        // Create socket connection
        const newSocket = io(`${serverUrl}${namespace}`, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('WebSocket connected:', namespace);
            setIsConnected(true);
            setConnectionError(null);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setConnectionError(error.message);
            setIsConnected(false);
        });

        newSocket.on('error', (error) => {
            console.error('WebSocket error:', error);
            setConnectionError(error.message);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [namespace]);

    const sendMessage = useCallback((event: string, data: any) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }, [socket, isConnected]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, []);

    return {
        socket,
        isConnected,
        connectionError,
        sendMessage,
        disconnect
    };
};