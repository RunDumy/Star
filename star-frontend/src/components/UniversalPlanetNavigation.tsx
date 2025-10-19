/// <reference path="../global.d.ts" />
import { OrbitControls, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Temporary Three.js JSX declarations
declare global {
    namespace JSX {
        interface IntrinsicElements {
            ambientLight: any;
            pointLight: any;
            mesh: any;
            sphereGeometry: any;
            meshStandardMaterial: any;
            meshBasicMaterial: any;
            ringGeometry: any;
            points: any;
            bufferGeometry: any;
            bufferAttribute: any;
            pointsMaterial: any;
            group: any;
            planeGeometry: any;
            cylinderGeometry: any;
            line: any;
            lineBasicMaterial: any;
            primitive: any;
        }
    }
}

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

interface UniversalPlanetNavigationProps {
    onPlanetSelect?: (route: string, label: string) => void;
    currentRoute?: string;
    showLabels?: boolean;
}

export const UniversalPlanetNavigation: React.FC<UniversalPlanetNavigationProps> = ({
    onPlanetSelect,
    currentRoute,
    showLabels = true
}) => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const handlePlanetClick = async (planetKey: string) => {
        const planet = PLANETARY_NAVIGATION[planetKey as keyof typeof PLANETARY_NAVIGATION];

        setSelectedPlanet(planetKey);
        setIsTransitioning(true);

        // Notify parent component
        onPlanetSelect?.(planet.route, planet.label);

        // Wait for transition animation
        await new Promise(resolve => setTimeout(resolve, 800));

        // Navigate to the route
        await router.push(planet.route);

        setIsTransitioning(false);
    };

    return (
        <div className="planetary-navigation w-full h-screen relative bg-black overflow-hidden">
            {/* 3D Solar System */}
            <Canvas
                camera={{ position: [0, 15, 30], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
            >
                <SolarSystem
                    onPlanetClick={handlePlanetClick}
                    selectedPlanet={selectedPlanet}
                    currentRoute={currentRoute}
                    showLabels={showLabels}
                />
            </Canvas>

            {/* UI Overlay */}
            <PlanetaryUI
                selectedPlanet={selectedPlanet}
                isTransitioning={isTransitioning}
                onClose={() => setSelectedPlanet(null)}
            />

            {/* Navigation Instructions */}
            <div className="navigation-indicator">
                Navigate by clicking planets • Drag to explore the cosmos
            </div>
        </div>
    );
};

const SolarSystem: React.FC<{
    onPlanetClick: (planetKey: string) => void;
    selectedPlanet: string | null;
    currentRoute?: string;
    showLabels: boolean;
}> = ({ onPlanetClick, selectedPlanet, currentRoute, showLabels }) => {
    return (
        // @ts-ignore
        <group>
            {/* Ambient lighting */}
            {/* @ts-ignore */}
            <ambientLight intensity={0.2} />

            {/* Sunlight */}
            {/* @ts-ignore */}
            <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" />

            {/* Background stars */}
            <StarField />

            {/* Orbital paths - removed for universal navigation */}
            {/* Background stars */}
            <StarField />

            {/* Planets */}
            {Object.entries(PLANETARY_NAVIGATION).map(([key, planet]) => (
                <CosmicPlanet
                    key={key}
                    planetKey={key}
                    config={planet}
                    onClick={() => onPlanetClick(key)}
                    isSelected={selectedPlanet === key}
                    isCurrent={currentRoute === planet.route}
                    showLabel={showLabels}
                />
            ))}

            {/* Constellation overlays connecting related planets */}
            <ConstellationOverlay />

            {/* Camera controls */}
            <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                minDistance={10}
                maxDistance={50}
                autoRotate={false}
                autoRotateSpeed={0.5}
            />
        </group>
    );
};

const CosmicPlanet: React.FC<{
    planetKey: string;
    config: any;
    onClick: () => void;
    isSelected: boolean;
    isCurrent: boolean;
    showLabel: boolean;
}> = ({ planetKey, config, onClick, isSelected, isCurrent, showLabel }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const trailRef = useRef<THREE.Points>(null);
    const [hovered, setHovered] = useState(false);
    const [lodLevel, setLodLevel] = useState<'high' | 'medium' | 'low'>('high');
    const trailPositions = useRef<Float32Array>(new Float32Array(100 * 3)); // Store last 100 positions
    const trailIndex = useRef(0);

    // Performance monitoring
    const frameCount = useRef(0);
    const lastFpsCheck = useRef(performance.now());

    // LOD configuration based on distance
    const getLODConfig = (distance: number) => {
        if (distance < 15) return { level: 'high' as const, segments: 32, particles: 100 };
        if (distance < 30) return { level: 'medium' as const, segments: 16, particles: 50 };
        return { level: 'low' as const, segments: 8, particles: 25 };
    };

    // Mobile detection for additional optimizations
    const isMobile = typeof globalThis !== 'undefined' &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(globalThis.navigator?.userAgent || '');

    // 3D/4D Orbital motion - mythic drift through space-time
    useFrame(({ clock, camera }) => {
        if (groupRef.current && config.orbitalRadius > 0) {
            const t = clock.getElapsedTime();

            // Complex orbital motion with 3D components
            const x = Math.sin(t * config.orbitalSpeed + config.orbitalOffset) * config.orbitalRadius;
            const y = Math.cos(t * config.orbitalSpeed + config.orbitalOffset) * config.orbitalRadius * 0.7;
            const z = Math.sin(t * config.orbitalSpeed * 0.5 + config.orbitalOffset) * config.orbitalRadius * 0.3;

            groupRef.current.position.set(x, y, z);

            // Distance-based LOD calculation
            const distance = camera.position.distanceTo(groupRef.current.position);
            const newLodConfig = getLODConfig(distance);

            if (newLodConfig.level !== lodLevel) {
                setLodLevel(newLodConfig.level);
            }

            // Update orbital trail with LOD consideration
            if (trailRef.current && newLodConfig.level !== 'low') {
                trailPositions.current[trailIndex.current * 3] = x;
                trailPositions.current[trailIndex.current * 3 + 1] = y;
                trailPositions.current[trailIndex.current * 3 + 2] = z;

                trailIndex.current = (trailIndex.current + 1) % newLodConfig.particles;
                trailRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(trailPositions.current.slice(0, newLodConfig.particles * 3), 3));
                trailRef.current.geometry.attributes.position.needsUpdate = true;
            }
        }

        // Axial rotation - reduce frequency on low LOD
        if (meshRef.current) {
            const rotationSpeed = lodLevel === 'low' ? config.rotationSpeed * 0.5 : config.rotationSpeed;
            meshRef.current.rotation.y += rotationSpeed;
        }

        // Mythic pulsation - breathing planets (less frequent on mobile/low LOD)
        if (groupRef.current) {
            const time = clock.getElapsedTime();
            const baseScale = isSelected ? 1.3 : isCurrent ? 1.15 : 1;
            const pulseScale = baseScale * (1 + Math.sin(time * (lodLevel === 'low' ? 1 : 2)) * 0.05);
            const hoverScale = hovered ? 1.1 : 1;

            groupRef.current.scale.setScalar(pulseScale * hoverScale);
        }

        // Performance monitoring (check FPS every 60 frames)
        frameCount.current++;
        if (frameCount.current >= 60) {
            const now = performance.now();
            const fps = 60 / ((now - lastFpsCheck.current) / 1000);

            // Adaptive quality based on performance
            if (fps < 30 && lodLevel !== 'low') {
                setLodLevel('low');
            }

            frameCount.current = 0;
            lastFpsCheck.current = now;
        }
    });

    // Calculate initial position for non-orbiting bodies (Sun-like)
    const initialPosition = config.orbitalRadius > 0 ? [0, 0, 0] : config.position;

    // @ts-ignore - Three.js JSX elements are not recognized by TypeScript
    return (
        <group ref={groupRef} position={initialPosition as [number, number, number]}>
            {/* Orbital path visualization */}
            {config.orbitalRadius > 0 && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[config.orbitalRadius - 0.02, config.orbitalRadius + 0.02, 64]} />
                    <meshBasicMaterial
                        color={config.color}
                        transparent
                        opacity={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Planet mesh with LOD-based geometry */}
            <mesh
                ref={meshRef}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[config.size, lodLevel === 'high' ? 32 : lodLevel === 'medium' ? 16 : 8, lodLevel === 'high' ? 32 : lodLevel === 'medium' ? 16 : 8]} />
                <meshStandardMaterial
                    color={config.color}
                    emissive={config.color}
                    emissiveIntensity={isSelected ? 0.4 : isCurrent ? 0.2 : hovered ? 0.15 : 0.05}
                    metalness={0.1}
                    roughness={0.3}
                />
            </mesh>

            {/* Enhanced atmosphere glow - reduce on low LOD */}
            {lodLevel !== 'low' && (
                <mesh>
                    <sphereGeometry args={[config.size * 1.4, lodLevel === 'high' ? 20 : 12, lodLevel === 'high' ? 20 : 12]} />
                    <meshBasicMaterial
                        color={config.glow}
                        transparent={true}
                        opacity={isSelected ? 0.5 : isCurrent ? 0.3 : hovered ? 0.2 : 0.1}
                    />
                </mesh>
            )}

            {/* Orbital Trail Effect - only on high/medium LOD */}
            {config.orbitalRadius > 0 && lodLevel !== 'low' && (
                <points ref={trailRef}>
                    <bufferGeometry />
                    <pointsMaterial
                        size={0.1}
                        color={config.glow}
                        transparent
                        opacity={0.6}
                        sizeAttenuation={false}
                    />
                </points>
            )}

            {/* Archetypal aura rings - reduce detail on low LOD */}
            {(isSelected || isCurrent) && lodLevel !== 'low' && (
                <>
                    <mesh rotation={[0, 0, 0]}>
                        <ringGeometry args={[config.size * 1.8, config.size * 2.2, lodLevel === 'high' ? 32 : 16]} />
                        <meshBasicMaterial
                            color="#00FFFF"
                            transparent
                            opacity={0.6}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[config.size * 2.0, config.size * 2.4, lodLevel === 'high' ? 32 : 16]} />
                        <meshBasicMaterial
                            color="#FFD700"
                            transparent
                            opacity={0.4}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </>
            )}

            {/* Hover indicator - only on high/medium LOD */}
            {hovered && lodLevel !== 'low' && (
                <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                    <ringGeometry args={[config.size * 2.5, config.size * 2.7, lodLevel === 'high' ? 32 : 16]} />
                    <meshBasicMaterial
                        color="#FFFFFF"
                        transparent
                        opacity={0.8}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Planet label with enhanced styling */}
            {showLabel && (
                <Text
                    position={[0, config.size + 1.2, 0]}
                    fontSize={0.4}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/inter.woff"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {config.icon} {config.label}
                </Text>
            )}

            {/* Archetype indicator */}
            {hovered && (
                <Text
                    position={[0, -(config.size + 1.5), 0]}
                    fontSize={0.25}
                    color="#888"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/inter.woff"
                >
                    {config.archetype} • {config.element}
                </Text>
            )}
        </group>
    );
};

const OrbitPath: React.FC<{ radius: number }> = ({ radius }) => {
    return (
        // @ts-ignore
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            {/* @ts-ignore */}
            <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
            {/* @ts-ignore */}
            <meshBasicMaterial
                color="#444444"
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

const StarField: React.FC = () => {
    const stars = useRef<THREE.Points>(null);

    useEffect(() => {
        if (stars.current) {
            const starCount = 1000;
            const positions = new Float32Array(starCount * 3);

            for (let i = 0; i < starCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 200;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            }

            stars.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        }
    }, []);

    useFrame(() => {
        if (stars.current) {
            stars.current.rotation.x += 0.0001;
            stars.current.rotation.y += 0.0002;
        }
    });

    return (
        // @ts-ignore
        <points ref={stars}>
            {/* @ts-ignore */}
            <bufferGeometry />
            {/* @ts-ignore */}
            <pointsMaterial size={0.5} color="#FFFFFF" transparent opacity={0.8} />
        </points>
    );
};

const ConstellationOverlay: React.FC = () => {
    // Define constellation connections between planets
    const constellations = [
        // Inner system constellation (core features)
        { planets: ['FEED', 'CHAT', 'PROFILE'], color: '#FFD700', opacity: 0.4 },
        // Outer system constellation (advanced tools)
        { planets: ['EXPLORE', 'CREATE'], color: '#9370DB', opacity: 0.3 },
        // Cross-system connections
        { planets: ['FEED', 'EXPLORE'], color: '#00CED1', opacity: 0.2 },
        { planets: ['PROFILE', 'CREATE'], color: '#32CD32', opacity: 0.2 },
    ];

    return (
        // @ts-ignore
        <group>
            {constellations.map((constellation, index) => (
                <ConstellationLines
                    key={`constellation-${index}`}
                    planetKeys={constellation.planets}
                    color={constellation.color}
                    opacity={constellation.opacity}
                />
            ))}
        </group>
    );
};

const ConstellationLines: React.FC<{
    planetKeys: string[];
    color: string;
    opacity: number;
}> = ({ planetKeys, color, opacity }) => {
    const linesRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (linesRef.current) {
            // Gentle pulsing effect for constellation lines
            const time = clock.getElapsedTime();
            const pulseOpacity = opacity * (0.8 + Math.sin(time * 0.5) * 0.2);
            for (const child of linesRef.current.children) {
                if (child instanceof THREE.Line) {
                    const material = child.material as THREE.LineBasicMaterial;
                    material.opacity = pulseOpacity;
                }
            }
        }
    });

    // Create line segments between planets
    const lineSegments = [];
    for (let i = 0; i < planetKeys.length - 1; i++) {
        const startPlanet = PLANETARY_NAVIGATION[planetKeys[i] as keyof typeof PLANETARY_NAVIGATION];
        const endPlanet = PLANETARY_NAVIGATION[planetKeys[i + 1] as keyof typeof PLANETARY_NAVIGATION];

        if (startPlanet && endPlanet) {
            // Calculate current positions (accounting for orbital motion)
            const startPos = startPlanet.orbitalRadius > 0 ? [0, 0, 0] : startPlanet.position;
            const endPos = endPlanet.orbitalRadius > 0 ? [0, 0, 0] : endPlanet.position;

            const points: THREE.Vector3[] = [];
            points[0] = new THREE.Vector3(...startPos);
            points[1] = new THREE.Vector3(...endPos);

            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            lineSegments.push(
                // @ts-ignore
                <line key={`${planetKeys[i]}-${planetKeys[i + 1]}`}>
                    {/* @ts-ignore */}
                    <primitive object={geometry} />
                    {/* @ts-ignore */}
                    <lineBasicMaterial color={color} transparent opacity={opacity} />
                </line>
            );
        }
    }

    return (
        // @ts-ignore
        <group ref={linesRef}>
            {lineSegments}
        </group>
    );
};

const PlanetaryUI: React.FC<{
    selectedPlanet: string | null;
    isTransitioning: boolean;
    onClose: () => void;
}> = ({ selectedPlanet, isTransitioning, onClose }) => {
    const planet = selectedPlanet ? PLANETARY_NAVIGATION[selectedPlanet as keyof typeof PLANETARY_NAVIGATION] : null;

    return (
        <>
            {/* Loading overlay during transition */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white text-xl">Traveling through the cosmos...</p>
                            <p className="text-purple-300 mt-2">Destination: {planet?.label}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Planet information panel */}
            <AnimatePresence>
                {selectedPlanet && planet && !isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className="absolute top-6 right-6 w-80 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-md rounded-xl border border-purple-500/30 p-6 z-40"
                    >
                        <button
                            onClick={onClose}
                            type="button"
                            className="close-button"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-4">
                            <div
                                className={`planet-icon-container planet-icon-${selectedPlanet.toLowerCase()}`}
                            >
                                {planet.icon}
                            </div>
                            <h3 className="planet-label">{planet.label}</h3>
                            <p className="planet-key">{selectedPlanet}</p>
                        </div>

                        <div className="mb-6">
                            <p className="text-white/90 text-sm leading-relaxed">
                                {planet.description}
                            </p>
                        </div>

                        <button
                            onClick={() => globalThis.location.href = planet.route}
                            type="button"
                            className="navigate-button"
                        >
                            🚀 Navigate to {planet.label}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* System overview */}
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
                <h2 className="text-lg font-bold mb-2">🌌 STAR Navigation System</h2>
                <p className="text-sm text-white/70 mb-3">
                    Navigate the cosmos by clicking on planets. Each celestial body represents a different aspect of your cosmic journey.
                </p>

                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400">☉</span>
                        <span>Inner System: Core Features</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400">♃</span>
                        <span>Outer System: Advanced Tools</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-purple-400">♇</span>
                        <span>Deep Space: Transformation</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UniversalPlanetNavigation;