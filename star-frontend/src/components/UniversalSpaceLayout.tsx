'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { UniversalPlanetNavigation } from './UniversalPlanetNavigation';

// Cosmic Weather Components
const CosmicNebula: React.FC = () => {
    const nebulaRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (nebulaRef.current) {
            const time = clock.getElapsedTime();
            nebulaRef.current.rotation.y = time * 0.05;
            nebulaRef.current.rotation.x = Math.sin(time * 0.03) * 0.1;
        }
    });

    return (
        // @ts-ignore
        <group ref={nebulaRef}>
            {/* Large nebula cloud */}
            {/* @ts-ignore */}
            <mesh position={[30, 10, -40]}>
                {/* @ts-ignore */}
                <sphereGeometry args={[15, 32, 32]} />
                {/* @ts-ignore */}
                <meshBasicMaterial
                    color="#4B0082"
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* @ts-ignore */}
            <mesh position={[35, 8, -35]}>
                {/* @ts-ignore */}
                <sphereGeometry args={[12, 32, 32]} />
                {/* @ts-ignore */}
                <meshBasicMaterial
                    color="#8A2BE2"
                    transparent
                    opacity={0.08}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* @ts-ignore */}
            <mesh position={[25, 12, -45]}>
                {/* @ts-ignore */}
                <sphereGeometry args={[10, 32, 32]} />
                {/* @ts-ignore */}
                <meshBasicMaterial
                    color="#9932CC"
                    transparent
                    opacity={0.06}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

const AuroraBorealis: React.FC = () => {
    const auroraRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (auroraRef.current) {
            const time = clock.getElapsedTime();
            auroraRef.current.children.forEach((child, index) => {
                const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
                material.opacity = 0.3 + Math.sin(time * (0.5 + index * 0.1)) * 0.2;
            });
        }
    });

    return (
        <group ref={auroraRef} position={[0, 25, -30]}>
            {/* Aurora curtain */}
            <mesh rotation={[0, 0, Math.PI / 6]}>
                <planeGeometry args={[60, 20, 32, 16]} />
                <meshBasicMaterial
                    color="#00FF7F"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 8]} position={[0, 2, 0]}>
                <planeGeometry args={[50, 15, 32, 16]} />
                <meshBasicMaterial
                    color="#32CD32"
                    transparent
                    opacity={0.25}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 12]} position={[0, -2, 0]}>
                <planeGeometry args={[40, 12, 32, 16]} />
                <meshBasicMaterial
                    color="#00CED1"
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

const CosmicPhenomena: React.FC = () => {
    const phenomenaRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (phenomenaRef.current) {
            const time = clock.getElapsedTime();
            phenomenaRef.current.rotation.z = time * 0.02;
            phenomenaRef.current.position.x = Math.sin(time * 0.1) * 5;
            phenomenaRef.current.position.y = Math.cos(time * 0.08) * 3;
        }
    });

    return (
        <group ref={phenomenaRef} position={[-20, -15, -50]}>
            {/* Cosmic dust cloud */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={200}
                        array={new Float32Array(Array.from({ length: 600 }, () => (Math.random() - 0.5) * 40))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.5}
                    color="#FFD700"
                    transparent
                    opacity={0.4}
                    sizeAttenuation={false}
                />
            </points>

            {/* Energy tendrils */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.3, 8, 8]} />
                <meshBasicMaterial
                    color="#FF4500"
                    transparent
                    opacity={0.6}
                />
            </mesh>
            <mesh position={[2, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.08, 0.2, 6, 8]} />
                <meshBasicMaterial
                    color="#FF6347"
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </group>
    );
};

// Mobile Touch Controls - Enhanced gesture handling for cosmic navigation
interface MobileTouchControlsProps {
    onPlanetSelect: (route: string, label: string) => void;
    isTransitioning: boolean;
}

const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({ onPlanetSelect, isTransitioning }) => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastTap, setLastTap] = useState(0);

    // Haptic feedback for mobile devices
    const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof globalThis !== 'undefined' && 'vibrate' in globalThis.navigator) {
            const patterns = {
                light: 50,
                medium: 100,
                heavy: 200
            };
            globalThis.navigator.vibrate(patterns[type]);
        }
    }, []);

    // Handle touch start
    const handleTouchStart = useCallback((event: React.TouchEvent) => {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            setTouchStart({ x: touch.clientX, y: touch.clientY });
            setIsDragging(false);
        }
    }, []);

    // Handle touch move
    const handleTouchMove = useCallback((event: React.TouchEvent) => {
        if (touchStart && event.touches.length === 1) {
            const touch = event.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStart.x);
            const deltaY = Math.abs(touch.clientY - touchStart.y);

            // If moved more than 10px, consider it a drag
            if (deltaX > 10 || deltaY > 10) {
                setIsDragging(true);
            }
        }
    }, [touchStart]);

    // Handle touch end
    const handleTouchEnd = useCallback((event: React.TouchEvent) => {
        if (!touchStart || isDragging || isTransitioning) {
            setTouchStart(null);
            setIsDragging(false);
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = Math.abs(touch.clientX - touchStart.x);
        const deltaY = Math.abs(touch.clientY - touchStart.y);

        // Only process if it wasn't a drag
        if (deltaX < 10 && deltaY < 10) {
            const now = Date.now();
            const timeSinceLastTap = now - lastTap;

            // Double tap detection
            if (timeSinceLastTap < 300) {
                // Double tap - could trigger special action
                triggerHapticFeedback('medium');
                setLastTap(0);
            } else {
                // Single tap - check if tapping on a planet
                // This would need to be enhanced with raycasting to detect planet hits
                triggerHapticFeedback('light');
                setLastTap(now);
            }
        }

        setTouchStart(null);
        setIsDragging(false);
    }, [touchStart, isDragging, isTransitioning, lastTap, triggerHapticFeedback]);

    // Only render on mobile devices
    const isMobile = typeof globalThis !== 'undefined' &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(globalThis.navigator?.userAgent || '');

    if (!isMobile) return null;

    return (
        <div
            className="mobile-touch-overlay"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-transitioning={isTransitioning}
        >
            {/* Mobile-specific UI hints */}
            <div className="mobile-hints">
                <div>👆 Tap planets to navigate</div>
                <div>🤏 Pinch to zoom</div>
                <div>🌀 Drag to rotate view</div>
            </div>
        </div>
    );
};

// Cosmic Audio System - Ambient soundscapes for mythic immersion
interface CosmicAudioSystemProps {
    currentPlanet?: string;
    isTransitioning?: boolean;
}

const CosmicAudioSystem: React.FC<CosmicAudioSystemProps> = ({ currentPlanet, isTransitioning }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
    const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
    const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
    const audioSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
    const currentSoundscapeRef = useRef<string>('');

    // Ambient audio files for different planets
    const AMBIENT_AUDIO_FILES = {
        FEED: '/audio/energy-uplift-meditation-122872.mp3',
        CHAT: '/audio/anime-lasers-71342.mp3',
        PROFILE: '/audio/high-energy-loop-69158.mp3',
        EXPLORE: '/audio/energy-drink-effect-230559.mp3',
        CREATE: '/audio/madeinabyss-194408.mp3',
        COLLABORATE: '/audio/sword-schwing-40520.mp3',
        TAROT: '/audio/energy-uplift-meditation-122872.mp3',
        REGISTER: '/audio/high-energy-loop-69158.mp3',
        ZODIAC: '/audio/madeinabyss-194408.mp3',
        COMPATIBILITY: '/audio/anime-lasers-71342.mp3',
        ARENA: '/audio/sword-schwing-40520.mp3',
        MUSIC: '/audio/energy-drink-effect-230559.mp3'
    };

    // Elemental soundscape configurations (fallback procedural audio)
    const SOUNDSCAPES = {
        FEED: {
            name: 'Cosmic Heartbeat',
            element: 'Fire',
            frequencies: [220, 330, 440, 550], // Harmonic series
            volumes: [0.1, 0.08, 0.06, 0.04],
            waveTypes: ['sine', 'triangle', 'sine', 'sawtooth']
        },
        CHAT: {
            name: 'Whispering Winds',
            element: 'Air',
            frequencies: [293.66, 369.99, 440, 523.25], // D major chord
            volumes: [0.08, 0.06, 0.05, 0.04],
            waveTypes: ['sine', 'sine', 'triangle', 'sine']
        },
        PROFILE: {
            name: 'Soul Reflection',
            element: 'Spirit',
            frequencies: [261.63, 329.63, 392, 523.25], // C major 7th
            volumes: [0.07, 0.06, 0.05, 0.03],
            waveTypes: ['triangle', 'sine', 'sine', 'triangle']
        },
        EXPLORE: {
            name: 'Ocean Depths',
            element: 'Water',
            frequencies: [146.83, 220, 293.66, 369.99], // Deep resonant tones
            volumes: [0.09, 0.07, 0.05, 0.04],
            waveTypes: ['sawtooth', 'triangle', 'sine', 'sine']
        },
        CREATE: {
            name: 'Earth Resonance',
            element: 'Earth',
            frequencies: [82.41, 123.47, 164.81, 207.65], // Low fundamental tones
            volumes: [0.08, 0.06, 0.05, 0.04],
            waveTypes: ['sawtooth', 'triangle', 'sine', 'triangle']
        },
        COLLABORATE: {
            name: 'Unity Harmonics',
            element: 'Fire',
            frequencies: [277.18, 369.99, 440, 554.37], // B minor chord
            volumes: [0.08, 0.07, 0.06, 0.04],
            waveTypes: ['sine', 'triangle', 'sine', 'sawtooth']
        },
        TAROT: {
            name: 'Mystic Whispers',
            element: 'Spirit',
            frequencies: [174, 220, 277.18, 349.23], // Mystical frequencies
            volumes: [0.06, 0.05, 0.04, 0.03],
            waveTypes: ['triangle', 'sine', 'triangle', 'sine']
        },
        REGISTER: {
            name: 'Birth Awakening',
            element: 'Spirit',
            frequencies: [396, 528, 639, 741], // Solfeggio frequencies for awakening
            volumes: [0.07, 0.06, 0.05, 0.04],
            waveTypes: ['sine', 'triangle', 'sine', 'triangle']
        },
        ZODIAC: {
            name: 'Celestial Harmony',
            element: 'Earth',
            frequencies: [261.63, 329.63, 392, 523.25], // C major scale
            volumes: [0.08, 0.07, 0.06, 0.05],
            waveTypes: ['sine', 'triangle', 'sine', 'sawtooth']
        },
        COMPATIBILITY: {
            name: 'Heart Resonance',
            element: 'Fire',
            frequencies: [432, 528, 639, 741], // Love frequencies
            volumes: [0.07, 0.06, 0.05, 0.04],
            waveTypes: ['triangle', 'sine', 'triangle', 'sine']
        },
        ARENA: {
            name: 'Battle Drums',
            element: 'Fire',
            frequencies: [110, 165, 220, 330], // Powerful rhythms
            volumes: [0.09, 0.08, 0.07, 0.06],
            waveTypes: ['sawtooth', 'triangle', 'sawtooth', 'sine']
        },
        MUSIC: {
            name: 'Cosmic Melody',
            element: 'Air',
            frequencies: [440, 554.37, 659.25, 880], // A major scale
            volumes: [0.08, 0.07, 0.06, 0.05],
            waveTypes: ['sine', 'triangle', 'sine', 'sawtooth']
        }
    };

    // Load audio buffer from file
    const loadAudioBuffer = useCallback(async (url: string): Promise<AudioBuffer | null> => {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            if (audioContextRef.current) {
                return await audioContextRef.current.decodeAudioData(arrayBuffer);
            }
        } catch (error) {
            console.warn('Failed to load audio file:', url, error);
        }
        return null;
    }, []);

    // Play audio buffer
    const playAudioBuffer = useCallback((buffer: AudioBuffer, volume: number = 0.5) => {
        if (!audioContextRef.current) return null;

        const source = audioContextRef.current.createBufferSource();
        const gainNode = audioContextRef.current.createGain();

        source.buffer = buffer;
        gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);

        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        source.loop = true;
        source.start();

        return { source, gainNode };
    }, []);

    // Initialize audio context
    const initAudioContext = useCallback(async () => {
        try {
            audioContextRef.current ??= new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();

            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // Preload audio files
            for (const [planetKey, audioUrl] of Object.entries(AMBIENT_AUDIO_FILES)) {
                const buffer = await loadAudioBuffer(audioUrl);
                if (buffer) {
                    audioBuffersRef.current.set(planetKey, buffer);
                }
            }
        } catch (error) {
            console.warn('Audio context initialization failed:', error);
        }
    }, [loadAudioBuffer]);

    // Create oscillator for a specific frequency
    const createOscillator = useCallback((frequency: number, volume: number, waveType: OscillatorType, element: string) => {
        if (!audioContextRef.current) return null;

        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
        oscillator.type = waveType;

        gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.start();

        const key = `${element}_${frequency}`;
        oscillatorsRef.current.set(key, oscillator);
        gainNodesRef.current.set(key, gainNode);

        return { oscillator, gainNode, key };
    }, []);

    // Stop all oscillators
    const stopAllOscillators = useCallback(() => {
        for (const oscillator of Array.from(oscillatorsRef.current.values())) {
            oscillator.stop();
        }
        oscillatorsRef.current.clear();
        gainNodesRef.current.clear();
    }, []);

    // Stop all audio sources
    const stopAllAudioSources = useCallback(() => {
        for (const source of Array.from(audioSourcesRef.current.values())) {
            try {
                source.stop();
            } catch (e) {
                // Source might already be stopped
            }
        }
        audioSourcesRef.current.clear();
    }, []);

    // Play soundscape for a planet
    const playSoundscape = useCallback((planetKey: string) => {
        const soundscape = SOUNDSCAPES[planetKey as keyof typeof SOUNDSCAPES];
        if (!soundscape) return;

        // Stop current soundscape
        stopAllOscillators();
        stopAllAudioSources();

        // Try to play audio file first
        const audioBuffer = audioBuffersRef.current.get(planetKey);
        if (audioBuffer) {
            const audioPlayback = playAudioBuffer(audioBuffer, 0.3);
            if (audioPlayback) {
                audioSourcesRef.current.set(planetKey, audioPlayback.source);
                currentSoundscapeRef.current = planetKey;
                return;
            }
        }

        // Fallback to procedural audio
        for (let i = 0; i < soundscape.frequencies.length; i++) {
            createOscillator(
                soundscape.frequencies[i],
                soundscape.volumes[i],
                soundscape.waveTypes[i] as OscillatorType,
                soundscape.element
            );
        }

        currentSoundscapeRef.current = planetKey;
    }, [createOscillator, stopAllOscillators, stopAllAudioSources, playAudioBuffer]);

    // Handle planet changes
    useEffect(() => {
        if (currentPlanet && !isTransitioning) {
            const planetKey = Object.keys(PLANETARY_NAVIGATION).find(
                key => PLANETARY_NAVIGATION[key as keyof typeof PLANETARY_NAVIGATION].route === currentPlanet
            );

            if (planetKey && planetKey !== currentSoundscapeRef.current) {
                playSoundscape(planetKey);
            }
        }
    }, [currentPlanet, isTransitioning, playSoundscape]);

    // Initialize audio on mount
    useEffect(() => {
        initAudioContext();

        // Cleanup on unmount
        return () => {
            stopAllOscillators();
            stopAllAudioSources();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [initAudioContext, stopAllOscillators, stopAllAudioSources]);

    // Handle transitioning state
    useEffect(() => {
        const gainNodes = Array.from(gainNodesRef.current.values());
        const audioSources = Array.from(audioSourcesRef.current.values());

        if (isTransitioning) {
            // Fade out during transitions
            for (const gainNode of gainNodes) {
                if (audioContextRef.current) {
                    gainNode.gain.exponentialRampToValueAtTime(
                        0.01,
                        audioContextRef.current.currentTime + 0.5
                    );
                }
            }
            for (const source of audioSources) {
                try {
                    const gainNode = audioContextRef.current?.createGain();
                    if (gainNode) {
                        source.disconnect();
                        source.connect(gainNode);
                        gainNode.connect(audioContextRef.current.destination);
                        gainNode.gain.exponentialRampToValueAtTime(
                            0.01,
                            audioContextRef.current.currentTime + 0.5
                        );
                    }
                } catch (e) {
                    // Handle disconnect errors
                }
            }
        } else {
            // Fade back in after transition
            for (const gainNode of gainNodes) {
                if (audioContextRef.current) {
                    gainNode.gain.exponentialRampToValueAtTime(
                        0.1,
                        audioContextRef.current.currentTime + 1
                    );
                }
            }
            for (const source of audioSources) {
                try {
                    const gainNode = audioContextRef.current?.createGain();
                    if (gainNode) {
                        source.disconnect();
                        source.connect(gainNode);
                        gainNode.connect(audioContextRef.current.destination);
                        gainNode.gain.exponentialRampToValueAtTime(
                            0.3,
                            audioContextRef.current.currentTime + 1
                        );
                    }
                } catch (e) {
                    // Handle disconnect errors
                }
            }
        }
    }, [isTransitioning]);

    return null; // Audio system is invisible
};

// Planetary navigation configuration for mythic cosmic navigation
const PLANETARY_NAVIGATION = {
    FEED: {
        position: [0, 0, 0] as [number, number, number], // Center - the heart of STAR
        size: 1.2,
        color: '#FFD700',
        route: '/cosmic-feed',
        label: 'Cosmic Feed',
        description: 'The heart of STAR - where all cosmic energy converges',
        glow: '#FFA500',
        rotationSpeed: 0.01,
        orbitalRadius: 0, // Sun-like, doesn't orbit
        orbitalSpeed: 0,
        orbitalOffset: 0,
        icon: '☉',
        archetype: 'Creator',
        element: 'Fire'
    },

    CHAT: {
        position: [8, 0, 0] as [number, number, number],
        size: 0.8,
        color: '#00CED1',
        route: '/chat',
        label: 'Quick Chat',
        description: 'Swift communication and instant cosmic connections',
        glow: '#40E0D0',
        rotationSpeed: 0.015,
        orbitalRadius: 8,
        orbitalSpeed: 0.8,
        orbitalOffset: 0,
        icon: '☿',
        archetype: 'Messenger',
        element: 'Air'
    },

    PROFILE: {
        position: [0, 0, 10] as [number, number, number],
        size: 1,
        color: '#4F94CD',
        route: '/cosmic-profile-enhanced',
        label: 'Your Profile',
        description: 'Your cosmic identity and personal mythology',
        glow: '#87CEEB',
        rotationSpeed: 0.012,
        orbitalRadius: 10,
        orbitalSpeed: 0.6,
        orbitalOffset: Math.PI / 4,
        icon: '♀',
        archetype: 'Self',
        element: 'Spirit'
    },

    EXPLORE: {
        position: [-6, 0, -6] as [number, number, number],
        size: 0.9,
        color: '#4169E1',
        route: '/cosmic-explore',
        label: 'Explore Cosmos',
        description: 'Discover new worlds and cosmic wonders',
        glow: '#6495ED',
        rotationSpeed: 0.008,
        orbitalRadius: 8.5,
        orbitalSpeed: 0.4,
        orbitalOffset: Math.PI / 2,
        icon: '♆',
        archetype: 'Explorer',
        element: 'Water'
    },

    CREATE: {
        position: [0, 8, 0] as [number, number, number],
        size: 1.1,
        color: '#9370DB',
        route: '/cosmic-create',
        label: 'Create Ritual',
        description: 'Forge new realities and cosmic artifacts',
        glow: '#BA55D3',
        rotationSpeed: 0.014,
        orbitalRadius: 8,
        orbitalSpeed: 0.5,
        orbitalOffset: Math.PI,
        icon: '♄',
        archetype: 'Architect',
        element: 'Earth'
    },

    COLLABORATE: {
        position: [6, 0, -6] as [number, number, number],
        size: 0.85,
        color: '#FF6347',
        route: '/collaborative-cosmos',
        label: 'Collaborate',
        description: 'Join forces in the cosmic dance',
        glow: '#FF7F50',
        rotationSpeed: 0.016,
        orbitalRadius: 8.5,
        orbitalSpeed: 0.7,
        orbitalOffset: 3 * Math.PI / 4,
        icon: '♂',
        archetype: 'Warrior',
        element: 'Fire'
    },

    TAROT: {
        position: [10, 5, 5] as [number, number, number],
        size: 0.95,
        color: '#8B008B',
        route: '/tarot-reading',
        label: 'Tarot Oracle',
        description: 'Divine guidance through ancient wisdom',
        glow: '#DA70D6',
        rotationSpeed: 0.011,
        orbitalRadius: 12,
        orbitalSpeed: 0.3,
        orbitalOffset: Math.PI / 3,
        icon: '🔮',
        archetype: 'Oracle',
        element: 'Spirit'
    },

    REGISTER: {
        position: [-10, -3, 8] as [number, number, number],
        size: 0.75,
        color: '#FF69B4',
        route: '/register',
        label: 'Cosmic Birth',
        description: 'Begin your journey through the stars',
        glow: '#FFB6C1',
        rotationSpeed: 0.018,
        orbitalRadius: 11,
        orbitalSpeed: 0.9,
        orbitalOffset: 2 * Math.PI / 3,
        icon: '✨',
        archetype: 'Initiate',
        element: 'Spirit'
    },

    ZODIAC: {
        position: [0, -8, -8] as [number, number, number],
        size: 1.05,
        color: '#32CD32',
        route: '/zodiac',
        label: 'Zodiac Realm',
        description: 'Explore the twelve cosmic archetypes',
        glow: '#00FF7F',
        rotationSpeed: 0.013,
        orbitalRadius: 10,
        orbitalSpeed: 0.5,
        orbitalOffset: 5 * Math.PI / 6,
        icon: '♋',
        archetype: 'Sage',
        element: 'Earth'
    },

    COMPATIBILITY: {
        position: [-8, 6, -4] as [number, number, number],
        size: 0.9,
        color: '#FF4500',
        route: '/zodiac-compatibility',
        label: 'Soul Bonds',
        description: 'Discover cosmic connections and affinities',
        glow: '#FF6347',
        rotationSpeed: 0.017,
        orbitalRadius: 9,
        orbitalSpeed: 0.6,
        orbitalOffset: Math.PI / 6,
        icon: '💕',
        archetype: 'Lover',
        element: 'Fire'
    },

    ARENA: {
        position: [8, -4, -8] as [number, number, number],
        size: 0.85,
        color: '#DC143C',
        route: '/zodiac-arena',
        label: 'Zodiac Arena',
        description: 'Test your cosmic strength in mythic battles',
        glow: '#FF0000',
        rotationSpeed: 0.019,
        orbitalRadius: 11,
        orbitalSpeed: 0.8,
        orbitalOffset: 4 * Math.PI / 3,
        icon: '⚔️',
        archetype: 'Champion',
        element: 'Fire'
    },

    MUSIC: {
        position: [-6, -6, 6] as [number, number, number],
        size: 0.8,
        color: '#9370DB',
        route: '/music',
        label: 'Cosmic Sound',
        description: 'Harmonize with the universe\'s melody',
        glow: '#BA55D3',
        rotationSpeed: 0.014,
        orbitalRadius: 9.5,
        orbitalSpeed: 0.4,
        orbitalOffset: 3 * Math.PI / 2,
        icon: '🎵',
        archetype: 'Bard',
        element: 'Air'
    }
};

// Cosmic Starfield Component - Simplified version
const CosmicStarfield: React.FC = () => {
    return null; // Using UniversalPlanetNavigation's starfield instead
};

// Cosmic Content Overlay Component
interface CosmicContentOverlayProps {
    children: React.ReactNode;
    currentPage?: string;
}

const CosmicContentOverlay: React.FC<CosmicContentOverlayProps> = ({ children, currentPage }) => {
    return (
        <motion.div
            className="cosmic-content-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            {/* Navigation Indicator */}
            <motion.div
                className="navigation-indicator"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
            >
                Navigate by clicking planets • Current realm: {currentPage || 'Cosmic Void'}
            </motion.div>

            {/* Page Content */}
            <div className="cosmic-page-content">
                {children}
            </div>
        </motion.div>
    );
};

// Main Universal Space Layout Component
interface UniversalSpaceLayoutProps {
    children: React.ReactNode;
    currentPage?: string;
}

const UniversalSpaceLayout: React.FC<UniversalSpaceLayoutProps> = ({ children, currentPage }) => {
    const router = useRouter();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetPlanet, setTargetPlanet] = useState<string | null>(null);

    const handlePlanetClick = (route: string) => {
        // Find the planet key from the route
        const planetKey = Object.keys(PLANETARY_NAVIGATION).find(
            key => PLANETARY_NAVIGATION[key as keyof typeof PLANETARY_NAVIGATION].route === route
        );

        if (planetKey) {
            setIsTransitioning(true);
            setTargetPlanet(planetKey);

            // Add warp effect animation
            setTimeout(() => {
                router.push(route);
                setIsTransitioning(false);
                setTargetPlanet(null);
            }, 1500);
        }
    };

    return (
        <div className="universal-space-layout">
            {/* Pure Black Void Background */}
            <div className="universal-black-void" />

            {/* 3D Cosmic Canvas */}
            <Canvas
                camera={{
                    position: [0, 5, 20],
                    fov: 60,
                    near: 0.1,
                    far: 1000
                }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: -1,
                    pointerEvents: 'auto'
                }}
            >
                {/* Cosmic Environment */}
                <CosmicStarfield />

                {/* Planetary Navigation System */}
                <UniversalPlanetNavigation
                    onPlanetSelect={(route, label) => handlePlanetClick(route)}
                    currentRoute={router.pathname}
                    showLabels={true}
                />

                {/* Cosmic Weather Effects */}
                <CosmicNebula />
                <AuroraBorealis />
                <CosmicPhenomena />

                {/* Ambient Audio System */}
                <CosmicAudioSystem
                    currentPlanet={router.pathname}
                    isTransitioning={isTransitioning}
                />

                {/* Camera Controls */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={5}
                    maxDistance={100}
                    enableDamping
                    // Mobile-specific touch controls
                    touches={{
                        ONE: THREE.TOUCH.ROTATE,
                        TWO: THREE.TOUCH.DOLLY_PAN
                    }}
                    // Enhanced mobile responsiveness
                    rotateSpeed={0.5}
                    zoomSpeed={0.8}
                    panSpeed={0.8}
                    // Better mobile damping
                    dampingFactor={0.1}
                    // Prevent zoom out too far on mobile
                    maxPolarAngle={Math.PI * 0.8}
                />
            </Canvas>

            {/* Transition Effects */}
            <AnimatePresence>
                {isTransitioning && targetPlanet && (
                    <motion.div
                        className="cosmic-transition-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                    >
                        <div className="warp-effect">
                            <div className="warp-rings" />
                            <div className="warp-particles" />
                        </div>
                        <div className="transition-text">
                            Journeying to {PLANETARY_NAVIGATION[targetPlanet as keyof typeof PLANETARY_NAVIGATION]?.label}...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cosmic Content Overlay */}
            <CosmicContentOverlay currentPage={currentPage}>
                {children}
            </CosmicContentOverlay>

            {/* Mobile Touch Controls */}
            <MobileTouchControls
                onPlanetSelect={handlePlanetClick}
                isTransitioning={isTransitioning}
            />
        </div>
    );
};

export default UniversalSpaceLayout;