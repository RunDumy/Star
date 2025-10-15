/**
 * Live Cursors Component for Real-time Collaboration
 * Displays other participants' cursors with zodiac-themed styling and smooth animations
 * Tracks mouse movements and provides visual feedback for collaborative interactions
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCollaboration } from '../../lib/CollaborationContext';

// Zodiac cursor styles
const ZODIAC_CURSOR_STYLES = {
    aries: { color: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-red-500/50', symbol: '♈' },
    taurus: { color: 'text-green-400', bg: 'bg-green-500', glow: 'shadow-green-500/50', symbol: '♉' },
    gemini: { color: 'text-yellow-400', bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50', symbol: '♊' },
    cancer: { color: 'text-blue-400', bg: 'bg-blue-500', glow: 'shadow-blue-500/50', symbol: '♋' },
    leo: { color: 'text-orange-400', bg: 'bg-orange-500', glow: 'shadow-orange-500/50', symbol: '♌' },
    virgo: { color: 'text-indigo-400', bg: 'bg-indigo-500', glow: 'shadow-indigo-500/50', symbol: '♍' },
    libra: { color: 'text-pink-400', bg: 'bg-pink-500', glow: 'shadow-pink-500/50', symbol: '♎' },
    scorpio: { color: 'text-purple-400', bg: 'bg-purple-500', glow: 'shadow-purple-500/50', symbol: '♏' },
    sagittarius: { color: 'text-cyan-400', bg: 'bg-cyan-500', glow: 'shadow-cyan-500/50', symbol: '♐' },
    capricorn: { color: 'text-slate-400', bg: 'bg-slate-500', glow: 'shadow-slate-500/50', symbol: '♑' },
    aquarius: { color: 'text-sky-400', bg: 'bg-sky-500', glow: 'shadow-sky-500/50', symbol: '♒' },
    pisces: { color: 'text-teal-400', bg: 'bg-teal-500', glow: 'shadow-teal-500/50', symbol: '♓' },
    unknown: { color: 'text-gray-400', bg: 'bg-gray-500', glow: 'shadow-gray-500/50', symbol: '✨' }
};

interface LiveCursorsProps {
    containerRef?: React.RefObject<HTMLElement>;
    enabled?: boolean;
    showLabels?: boolean;
    showTrails?: boolean;
}

interface CursorTrail {
    id: string;
    x: number;
    y: number;
    timestamp: number;
}

export const LiveCursors: React.FC<LiveCursorsProps> = ({
    containerRef,
    enabled = true,
    showLabels = true,
    showTrails = false
}) => {
    const { currentSession, liveCursors, updateCursor } = useCollaboration();

    const [localCursor, setLocalCursor] = useState({ x: 0, y: 0 });
    const [cursorTrails, setCursorTrails] = useState<Record<string, CursorTrail[]>>({});
    const lastUpdate = useRef<number>(0);
    const throttleDelay = 16; // ~60fps

    // Get current user ID
    const getCurrentUserId = () => {
        const auth = JSON.parse(localStorage.getItem('star_auth') || '{}');
        return auth.user?.id || 'anonymous';
    };

    const currentUserId = getCurrentUserId();

    // Handle mouse movement with throttling
    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (!enabled || !currentSession) return;

        const now = Date.now();
        if (now - lastUpdate.current < throttleDelay) return;

        const container = containerRef?.current || document.body;
        const rect = container.getBoundingClientRect();

        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        // Clamp to bounds
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setLocalCursor({ x: clampedX, y: clampedY });

        // Update collaboration cursor
        updateCursor({
            x: clampedX,
            y: clampedY,
            element: (event.target as HTMLElement)?.id || undefined
        });

        lastUpdate.current = now;
    }, [enabled, currentSession, updateCursor, containerRef, throttleDelay]);

    // Add cursor trail point
    const addTrailPoint = useCallback((userId: string, x: number, y: number) => {
        if (!showTrails) return;

        setCursorTrails(prev => {
            const userTrails = prev[userId] || [];
            const newTrail: CursorTrail = {
                id: `${userId}-${Date.now()}`,
                x,
                y,
                timestamp: Date.now()
            };

            // Keep only recent trails (last 10 points)
            const updatedTrails = [...userTrails, newTrail].slice(-10);

            return {
                ...prev,
                [userId]: updatedTrails
            };
        });
    }, [showTrails]);

    // Clean up old trails
    useEffect(() => {
        if (!showTrails) return;

        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setCursorTrails(prev => {
                const updated: Record<string, CursorTrail[]> = {};

                Object.entries(prev).forEach(([userId, trails]) => {
                    // Keep trails from last 2 seconds
                    updated[userId] = trails.filter(trail => now - trail.timestamp < 2000);
                });

                return updated;
            });
        }, 500);

        return () => clearInterval(cleanupInterval);
    }, [showTrails]);

    // Add event listeners
    useEffect(() => {
        if (!enabled) return;

        const container = containerRef?.current || document;

        container.addEventListener('mousemove', handleMouseMove);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
        };
    }, [enabled, handleMouseMove, containerRef]);

    // Update trails when cursors move
    useEffect(() => {
        Object.entries(liveCursors).forEach(([userId, cursor]) => {
            if (userId !== currentUserId) {
                addTrailPoint(userId, cursor.x, cursor.y);
            }
        });
    }, [liveCursors, currentUserId, addTrailPoint]);

    if (!enabled || !currentSession) {
        return null;
    }

    // Filter out current user's cursor
    const otherCursors = Object.entries(liveCursors).filter(
        ([userId]) => userId !== currentUserId
    );

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            <AnimatePresence>
                {otherCursors.map(([userId, cursor]) => {
                    const zodiacStyle = ZODIAC_CURSOR_STYLES[cursor.zodiac_sign as keyof typeof ZODIAC_CURSOR_STYLES]
                        || ZODIAC_CURSOR_STYLES.unknown;
                    const userTrails = cursorTrails[userId] || [];

                    return (
                        <React.Fragment key={userId}>
                            {/* Cursor trails */}
                            {showTrails && userTrails.map((trail, index) => (
                                <motion.div
                                    key={trail.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: Math.max(0, 0.8 - (index * 0.1)),
                                        scale: Math.max(0.2, 1 - (index * 0.1))
                                    }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    style={{
                                        position: 'absolute',
                                        left: `${trail.x}%`,
                                        top: `${trail.y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    className={`w-2 h-2 rounded-full ${zodiacStyle.bg} blur-sm`}
                                />
                            ))}

                            {/* Main cursor */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                style={{
                                    position: 'absolute',
                                    left: `${cursor.x}%`,
                                    top: `${cursor.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                className="flex items-center space-x-2"
                            >
                                {/* Cursor pointer */}
                                <motion.div
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={`relative flex items-center justify-center w-6 h-6 rounded-full ${zodiacStyle.bg} shadow-lg ${zodiacStyle.glow}`}
                                >
                                    <span className="text-white text-xs font-bold">
                                        {zodiacStyle.symbol}
                                    </span>

                                    {/* Cosmic sparkles */}
                                    <motion.div
                                        animate={{
                                            rotate: 360,
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{
                                            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                                        }}
                                        className="absolute inset-0 pointer-events-none"
                                    >
                                        <Sparkles className={`absolute -top-1 -right-1 w-3 h-3 ${zodiacStyle.color}`} />
                                        <Star className={`absolute -bottom-1 -left-1 w-2 h-2 ${zodiacStyle.color}`} />
                                    </motion.div>
                                </motion.div>

                                {/* User label */}
                                {showLabels && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className={`px-2 py-1 rounded-md bg-gray-900/90 text-white text-xs font-medium backdrop-blur-sm border ${zodiacStyle.color.replace('text-', 'border-')}/30`}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{cursor.username}</span>
                                            <span className={zodiacStyle.color}>
                                                {zodiacStyle.symbol}
                                            </span>
                                        </div>

                                        {/* Element interaction indicator */}
                                        {cursor.element && (
                                            <div className="text-xs text-gray-300 mt-1">
                                                Interacting with: {cursor.element}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </AnimatePresence>

            {/* Local cursor indicator (subtle) */}
            <motion.div
                style={{
                    position: 'absolute',
                    left: `${localCursor.x}%`,
                    top: `${localCursor.y}%`,
                    transform: 'translate(-50%, -50%)'
                }}
                className="w-2 h-2 bg-white/30 rounded-full pointer-events-none"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

/**
 * Cursor Awareness Hook
 * Provides cursor position and element interaction data for collaborative features
 */
export const useCursorAwareness = (elementId?: string) => {
    const { currentSession, liveCursors } = useCollaboration();
    const [hoveredUsers, setHoveredUsers] = useState<string[]>([]);
    const [interactingUsers, setInteractingUsers] = useState<string[]>([]);

    useEffect(() => {
        if (!currentSession || !elementId) return;

        const hovered: string[] = [];
        const interacting: string[] = [];

        Object.entries(liveCursors).forEach(([userId, cursor]) => {
            if (cursor.element === elementId) {
                interacting.push(userId);
            }

            // Check if cursor is within element bounds (approximate)
            const element = document.getElementById(elementId);
            if (element) {
                const rect = element.getBoundingClientRect();
                const containerRect = element.closest('[data-collaboration-container]')?.getBoundingClientRect()
                    || document.body.getBoundingClientRect();

                const cursorX = (cursor.x / 100) * containerRect.width + containerRect.left;
                const cursorY = (cursor.y / 100) * containerRect.height + containerRect.top;

                if (
                    cursorX >= rect.left &&
                    cursorX <= rect.right &&
                    cursorY >= rect.top &&
                    cursorY <= rect.bottom
                ) {
                    hovered.push(userId);
                }
            }
        });

        setHoveredUsers(hovered);
        setInteractingUsers(interacting);
    }, [currentSession, liveCursors, elementId]);

    return {
        hoveredUsers,
        interactingUsers,
        isBeingViewed: hoveredUsers.length > 0 || interactingUsers.length > 0,
        viewerCount: hoveredUsers.length + interactingUsers.length,
        viewers: [...new Set([...hoveredUsers, ...interactingUsers])]
    };
};

/**
 * Collaboration Container Component
 * Wrapper component that enables cursor tracking within a specific area
 */
interface CollaborationContainerProps {
    children: React.ReactNode;
    className?: string;
    showCursors?: boolean;
    showLabels?: boolean;
    showTrails?: boolean;
}

export const CollaborationContainer: React.FC<CollaborationContainerProps> = ({
    children,
    className = '',
    showCursors = true,
    showLabels = true,
    showTrails = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            data-collaboration-container="true"
        >
            {children}
            {showCursors && (
                <LiveCursors
                    containerRef={containerRef}
                    enabled={showCursors}
                    showLabels={showLabels}
                    showTrails={showTrails}
                />
            )}
        </div>
    );
};

export default LiveCursors;