import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { AuthGuard } from '../src/components/AuthGuard';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';
import UnifiedCosmicFeed from '../src/components/cosmic/UnifiedCosmicFeed';

/**
 * Complete Social Feed System - Integration Page
 * 
 * This page provides the unified social feed experience combining:
 * - Real-time WebSocket updates
 * - 304 zodiac-specific social actions 
 * - Advanced filtering and sorting
 * - Infinite scroll pagination
 * - Cosmic energy calculations
 * - Multi-zodiac system support
 * 
 * Replaces the fragmented feed components (CosmicFeed.tsx, StarUniverseFeed.tsx, feed.tsx)
 * with a single, comprehensive social experience.
 */

interface FloatingAction {
    id: string;
    zodiac: string;
    action: string;
    x: number;
    y: number;
    opacity: number;
}

const CompleteSocialFeedSystem: React.FC = () => {
    // Cosmic ambience state
    const [cosmicParticles, setCosmicParticles] = useState<Array<{ id: string; x: number; y: number; size: number }>>([]);
    const [floatingActions, setFloatingActions] = useState<FloatingAction[]>([]);
    const [currentCosmicEvent, setCurrentCosmicEvent] = useState<string>('');

    // Generate cosmic background particles
    useEffect(() => {
        const generateParticles = () => {
            const particles = Array.from({ length: 50 }, (_, i) => ({
                id: `particle_${i}`,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 1
            }));
            setCosmicParticles(particles);
        };

        generateParticles();
        const interval = setInterval(generateParticles, 30000); // Regenerate every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Simulate cosmic events
    useEffect(() => {
        const cosmicEvents = [
            'Mercury Retrograde Influence Active',
            'Full Moon Energy Surge Detected',
            'Solar Flare Enhancing Intuition',
            'Planetary Alignment Amplifying Creativity',
            'Cosmic Portal Opening - Manifestation Power Increased',
            'Galactic Center Transmission - Consciousness Expanding',
            'Starseed Activation Sequence Initiated',
            'Dimensional Veil Thinning - Psychic Abilities Enhanced'
        ];

        const updateCosmicEvent = () => {
            const randomEvent = cosmicEvents[Math.floor(Math.random() * cosmicEvents.length)];
            setCurrentCosmicEvent(randomEvent);
        };

        updateCosmicEvent();
        const interval = setInterval(updateCosmicEvent, 120000); // Change every 2 minutes

        return () => clearInterval(interval);
    }, []);

    // Handle zodiac action animations
    const handleActionAnimation = (zodiac: string, action: string) => {
        const newFloatingAction: FloatingAction = {
            id: `action_${Date.now()}`,
            zodiac,
            action,
            x: Math.random() * (window.innerWidth - 200),
            y: Math.random() * (window.innerHeight - 100),
            opacity: 1
        };

        setFloatingActions(prev => [...prev, newFloatingAction]);

        // Remove after animation
        setTimeout(() => {
            setFloatingActions(prev => prev.filter(a => a.id !== newFloatingAction.id));
        }, 3000);
    };

    return (
        <AuthGuard>
            <CosmicPageWrapper>
                <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
                    {/* Cosmic Background Particles */}
                    <div className="fixed inset-0 pointer-events-none">
                        {cosmicParticles.map(particle => (
                            <motion.div
                                key={particle.id}
                                className="absolute bg-white rounded-full opacity-30"
                                style={{
                                    width: particle.size,
                                    height: particle.size,
                                    left: particle.x,
                                    top: particle.y
                                }}
                                animate={{
                                    y: [particle.y, particle.y - 100, particle.y],
                                    opacity: [0.1, 0.3, 0.1],
                                    scale: [0.8, 1.2, 0.8]
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        ))}
                    </div>

                    {/* Floating Action Animations */}
                    {floatingActions.map(action => (
                        <motion.div
                            key={action.id}
                            className="fixed pointer-events-none z-50"
                            style={{ left: action.x, top: action.y }}
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{
                                opacity: 0,
                                scale: 1.5,
                                y: -100,
                                rotate: 360
                            }}
                            transition={{ duration: 3 }}
                        >
                            <div className="bg-purple-500/70 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                                {action.zodiac} {action.action}! ✨
                            </div>
                        </motion.div>
                    ))}

                    {/* Cosmic Event Banner */}
                    {currentCosmicEvent && (
                        <motion.div
                            className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-md text-white text-center py-2 border-b border-white/20"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className="flex items-center justify-center space-x-2"
                                animate={{
                                    scale: [1, 1.05, 1],
                                    textShadow: ["0 0 0px #fff", "0 0 10px #fff", "0 0 0px #fff"]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="text-yellow-300">🌟</span>
                                <span className="text-sm font-medium">{currentCosmicEvent}</span>
                                <span className="text-yellow-300">🌟</span>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Main Feed Content */}
                    <div className={`${currentCosmicEvent ? 'pt-12' : 'pt-0'} relative z-10`}>
                        <UnifiedCosmicFeed />
                    </div>

                    {/* Cosmic Energy Indicator */}
                    <motion.div
                        className="fixed bottom-6 right-6 z-30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <motion.div
                            className="bg-purple-900/80 backdrop-blur-md rounded-full p-4 border border-purple-500/50"
                            animate={{
                                boxShadow: [
                                    "0 0 20px rgba(139, 69, 199, 0.5)",
                                    "0 0 40px rgba(139, 69, 199, 0.8)",
                                    "0 0 20px rgba(139, 69, 199, 0.5)"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-300">∞</div>
                                <div className="text-xs text-purple-400 mt-1">COSMIC</div>
                                <div className="text-xs text-purple-400">FLOW</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* System Status Indicator */}
                    <motion.div
                        className="fixed bottom-6 left-6 z-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-green-500/30">
                            <div className="flex items-center space-x-2">
                                <motion.div
                                    className="w-2 h-2 bg-green-400 rounded-full"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="text-green-400 text-xs font-medium">
                                    Unified Feed Active
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Real-time • Multi-zodiac • 304 Actions
                            </div>
                        </div>
                    </motion.div>

                    {/* Hidden Action Handler for Animations */}
                    <div
                        id="action-animation-handler"
                        style={{ display: 'none' }}
                        data-handler={(zodiac: string, action: string) => handleActionAnimation(zodiac, action)}
                    />
                </div>
            </CosmicPageWrapper>
        </AuthGuard>
    );
};

export default CompleteSocialFeedSystem;