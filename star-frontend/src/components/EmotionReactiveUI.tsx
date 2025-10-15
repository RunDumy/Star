'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface MoodState {
    primary: string;
    intensity: number;
    elements: string[];
    zodiacInfluence: string;
}

interface EmotionReactiveUIProps {
    mood?: MoodState;
    children: React.ReactNode;
}

const emotionThemes: Record<string, { primary: string; glow: string; particles: string; filter: string }> = {
    excited: { primary: '#ff6b35', glow: 'rgba(255, 107, 53, 0.3)', particles: '🔥', filter: 'brightness(1.2)' },
    passionate: { primary: '#ff4757', glow: 'rgba(255, 71, 87, 0.4)', particles: '💫', filter: 'brightness(1.3)' },
    peaceful: { primary: '#42a5f5', glow: 'rgba(66, 165, 245, 0.3)', particles: '🌊', filter: 'brightness(0.9)' },
    grounded: { primary: '#8bc34a', glow: 'rgba(139, 195, 74, 0.3)', particles: '🌱', filter: 'brightness(1.0)' },
    curious: { primary: '#29b6f6', glow: 'rgba(41, 182, 246, 0.3)', particles: '💨', filter: 'brightness(1.1)' },
    creative: { primary: '#ab47bc', glow: 'rgba(171, 71, 188, 0.3)', particles: '🎨', filter: 'brightness(1.2)' }
};

const neutralTheme = {
    primary: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.2)',
    particles: '✨',
    filter: 'brightness(1.0)'
};

const EmotionReactiveUI: React.FC<EmotionReactiveUIProps> = ({ mood, children }) => {
    const [currentTheme, setCurrentTheme] = useState(neutralTheme);
    const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number; delay: number }>>([]);

    useEffect(() => {
        if (mood?.primary && emotionThemes[mood.primary]) {
            const theme = emotionThemes[mood.primary];

            const intensityMultiplier = mood.intensity / 10;
            const adjustedTheme = {
                ...theme,
                glow: theme.glow.replace(/0\.\d+/, (intensityMultiplier * 0.5).toFixed(1)),
                filter: mood.intensity > 7
                    ? `${theme.filter} brightness(${1 + intensityMultiplier * 0.2})`
                    : theme.filter
            };

            setCurrentTheme(adjustedTheme);

            const particleCount = Math.min(Math.floor(mood.intensity * 1.5), 8);
            const newParticles = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                emoji: theme.particles,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 3
            }));
            setParticles(newParticles);
        } else {
            setCurrentTheme(neutralTheme);
            setParticles([]);
        }
    }, [mood]);

    return (
        <motion.div
            className="emotion-reactive-container relative overflow-hidden min-h-full"
            style={{
                background: `radial-gradient(circle at 50% 50%, ${currentTheme.glow}, transparent 70%)`,
                filter: currentTheme.filter
            }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
        >
            <div className="mood-particles absolute inset-0 pointer-events-none z-0">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute text-2xl"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`
                        }}
                        initial={{ opacity: 0, scale: 0, y: 0 }}
                        animate={{
                            opacity: [0, 0.8, 0],
                            scale: [0, 1, 0],
                            y: [-20, -60, -80]
                        }}
                        transition={{
                            duration: 4,
                            delay: particle.delay,
                            repeat: Infinity,
                            repeatDelay: 6 + Math.random() * 4
                        }}
                    >
                        {particle.emoji}
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                    boxShadow: `0 0 20px ${currentTheme.glow}, inset 0 0 20px ${currentTheme.glow}`
                }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <motion.div
                className="relative z-10"
                style={{
                    filter: mood?.intensity ? `hue-rotate(${mood.intensity * 3}deg)` : 'none'
                }}
            >
                {children}
            </motion.div>

            {mood?.primary && (
                <motion.div
                    className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border text-white"
                    style={{
                        backgroundColor: currentTheme.glow,
                        borderColor: currentTheme.primary + '80'
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {emotionThemes[mood.primary]?.particles || '✨'} {mood.primary} {Math.round(mood.intensity)}/10
                </motion.div>
            )}

            {mood?.elements && mood.elements.length > 0 && (
                <div className="absolute bottom-4 left-4 flex space-x-2">
                    {mood.elements.slice(0, 4).map((element, index) => (
                        <motion.div
                            key={element}
                            className="w-3 h-3 rounded-full border"
                            style={{
                                backgroundColor: currentTheme.primary + '40',
                                borderColor: currentTheme.primary
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1.2, 1],
                                opacity: [0, 1, 0.7]
                            }}
                            transition={{
                                duration: 1.5,
                                delay: index * 0.2,
                                repeat: Infinity,
                                repeatDelay: 4
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default EmotionReactiveUI;