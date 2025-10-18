import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    joinRoom: (room: string) => void;
    leaveRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    joinRoom: () => { },
    leaveRoom: () => { }
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('token');

        if (token) {
            // Initialize SocketIO connection with auth
            const newSocket = io(API_URL, {
                auth: {
                    token: token
                },
                autoConnect: true
            });

            newSocket.on('connect', () => {
                console.log('🌌 Connected to cosmic stream');
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('⭐ Disconnected from cosmic stream');
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('🔥 Cosmic connection error:', error);
                setConnected(false);
            });

            // Set up real-time event listeners for feed updates
            newSocket.on('new_post', (post) => {
                console.log('✨ New cosmic post received:', post);
                // Trigger a custom event that components can listen to
                globalThis.dispatchEvent(new CustomEvent('cosmic_new_post', { detail: post }));
            });

            newSocket.on('post_liked', (data) => {
                console.log('❤️ Post liked:', data);
                globalThis.dispatchEvent(new CustomEvent('cosmic_post_liked', { detail: data }));
            });

            newSocket.on('new_comment', (comment) => {
                console.log('💬 New comment:', comment);
                globalThis.dispatchEvent(new CustomEvent('cosmic_new_comment', { detail: comment }));
            });

            newSocket.on('zodiac_action', (action) => {
                console.log('🔮 Zodiac action:', action);
                globalThis.dispatchEvent(new CustomEvent('cosmic_zodiac_action', { detail: action }));
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, []);

    const joinRoom = (room: string) => {
        if (socket) {
            socket.emit('join_room', room);
            console.log(`🌍 Joined cosmic room: ${room}`);
        }
    };

    const leaveRoom = (room: string) => {
        if (socket) {
            socket.emit('leave_room', room);
            console.log(`🚀 Left cosmic room: ${room}`);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, connected, joinRoom, leaveRoom }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);