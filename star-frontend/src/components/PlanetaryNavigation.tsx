import { OrbitControls, Ring, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './PlanetaryNavigation.css';

// Planetary navigation routes configuration
const PLANETARY_ROUTES = {
    // Inner System - Core Features
    SUN: {
        position: [0, 0, 0],
        size: 1.5,
        color: '#FFD700',
        route: '/cosmic-feed',
        label: 'Cosmic Feed',
        description: 'The heart of STAR - where all cosmic energy converges',
        glow: '#FF8C00',
        orbitRadius: 0,
        icon: '☉'
    },

    MERCURY: {
        position: [3, 0, 0],
        size: 0.4,
        color: '#8C7853',
        route: '/chat',
        label: 'Quick Chat',
        description: 'Swift communication and instant cosmic connections',
        glow: '#FFA500',
        orbitRadius: 3,
        orbitSpeed: 2.4,
        icon: '☿'
    },

    VENUS: {
        position: [4.5, 0, 0],
        size: 0.6,
        color: '#FF69B4',
        route: '/compatibility',
        label: 'Love & Compatibility',
        description: 'Explore romantic and friendship connections',
        glow: '#FF1493',
        orbitRadius: 4.5,
        orbitSpeed: 1.8,
        icon: '♀'
    },

    EARTH: {
        position: [6, 0, 0],
        size: 0.7,
        color: '#4F94CD',
        route: '/profile',
        label: 'Your Profile',
        description: 'Your cosmic identity and earthly manifestation',
        glow: '#00BFFF',
        orbitRadius: 6,
        orbitSpeed: 1,
        icon: '⊕'
    },

    MARS: {
        position: [8, 0, 0],
        size: 0.5,
        color: '#CD5C5C',
        route: '/social-actions',
        label: 'Social Actions',
        description: 'Express your cosmic will through likes, shares, and engagement',
        glow: '#FF4500',
        orbitRadius: 8,
        orbitSpeed: 0.8,
        icon: '♂'
    },

    // Outer System - Advanced Features
    JUPITER: {
        position: [12, 0, 0],
        size: 1.2,
        color: '#DAA520',
        route: '/collaborative-cosmos',
        label: 'Collaborative Cosmos',
        description: 'Expand consciousness through shared 3D experiences',
        glow: '#FFD700',
        orbitRadius: 12,
        orbitSpeed: 0.4,
        icon: '♃'
    },

    SATURN: {
        position: [16, 0, 0],
        size: 1,
        color: '#696969',
        route: '/badges',
        label: 'Achievement Rings',
        description: 'Structured mastery and cosmic accomplishments',
        glow: '#A9A9A9',
        orbitRadius: 16,
        orbitSpeed: 0.2,
        icon: '♄',
        hasRings: true
    },

    URANUS: {
        position: [20, 0, 0],
        size: 0.8,
        color: '#40E0D0',
        route: '/cosmic-discovery',
        label: 'Cosmic Discovery',
        description: 'Revolutionary insights and sudden enlightenment',
        glow: '#00CED1',
        orbitRadius: 20,
        orbitSpeed: 0.1,
        icon: '♅'
    },

    NEPTUNE: {
        position: [24, 0, 0],
        size: 0.8,
        color: '#4169E1',
        route: '/tarot-reading',
        label: 'Mystical Insights',
        description: 'Deep intuitive wisdom and tarot divination',
        glow: '#6495ED',
        orbitRadius: 24,
        orbitSpeed: 0.05,
        icon: '♆'
    },

    PLUTO: {
        position: [28, 0, 0],
        size: 0.3,
        color: '#800080',
        route: '/transformation',
        label: 'Transformation',
        description: 'Profound change and rebirth of consciousness',
        glow: '#9932CC',
        orbitRadius: 28,
        orbitSpeed: 0.02,
        icon: '♇'
    }
};

interface PlanetaryNavigationProps {
    onRouteSelect?: (route: string, label: string) => void;
    currentRoute?: string;
}

export const PlanetaryNavigation: React.FC<PlanetaryNavigationProps> = ({
    onRouteSelect,
    currentRoute
}) => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const handlePlanetClick = async (planetKey: string) => {
        const planet = PLANETARY_ROUTES[planetKey as keyof typeof PLANETARY_ROUTES];

        setSelectedPlanet(planetKey);
        setIsTransitioning(true);

        // Notify parent component
        onRouteSelect?.(planet.route, planet.label);

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
                />
            </Canvas>

            {/* UI Overlay */}
            <PlanetaryUI
                selectedPlanet={selectedPlanet}
                isTransitioning={isTransitioning}
                onClose={() => setSelectedPlanet(null)}
            />

            {/* Navigation Instructions */}
            <div className="absolute bottom-6 left-6 text-white/70 text-sm">
                <p>🖱️ Drag to explore • Click planets to navigate • Scroll to zoom</p>
                <p className="mt-1">✨ Each planet represents a different cosmic experience</p>
            </div>
        </div>
    );
};

const SolarSystem: React.FC<{
    onPlanetClick: (planetKey: string) => void;
    selectedPlanet: string | null;
    currentRoute?: string;
}> = ({ onPlanetClick, selectedPlanet, currentRoute }) => {
    return (
        <group>
            {/* Ambient lighting */}
            <ambientLight intensity={0.2} />

            {/* Sunlight */}
            <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" />

            {/* Background stars */}
            <StarField />

            {/* Orbital paths */}
            {Object.entries(PLANETARY_ROUTES).map(([key, planet]) => (
                planet.orbitRadius > 0 && (
                    <OrbitPath key={`orbit-${key}`} radius={planet.orbitRadius} />
                )
            ))}

            {/* Planets */}
            {Object.entries(PLANETARY_ROUTES).map(([key, planet]) => (
                <PlanetObject
                    key={key}
                    planetKey={key}
                    config={planet}
                    onClick={() => onPlanetClick(key)}
                    isSelected={selectedPlanet === key}
                    isCurrent={currentRoute === planet.route}
                />
            ))}

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

const PlanetObject: React.FC<{
    planetKey: string;
    config: any;
    onClick: () => void;
    isSelected: boolean;
    isCurrent: boolean;
}> = ({ planetKey, config, onClick, isSelected, isCurrent }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Extract nested ternary for readability
    let targetScale;
    if (isSelected) {
        targetScale = 1.2;
    } else if (isCurrent) {
        targetScale = 1.1;
    } else {
        targetScale = 1;
    }

    // Calculate initial position for non-orbiting bodies (Sun)
    const initialPosition = config.orbitRadius === 0 ? config.position : [0, 0, 0];

    return (
        <group ref={groupRef} position={initialPosition as [number, number, number]}>
            {/* Planet mesh with glow */}
            <mesh ref={meshRef} onClick={onClick}>
                <sphereGeometry args={[config.size, 32, 32]} />
                <meshPhongMaterial
                    color={config.color}
                    emissive={config.color}
                    emissiveIntensity={isSelected ? 0.3 : 0.1}
                />
            </mesh>

            {/* Planet rings (Saturn) */}
            {config.hasRings && (
                <Ring
                    args={[config.size * 1.5, config.size * 2.5, 64]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <meshBasicMaterial
                        color={config.color}
                        transparent
                        opacity={0.6}
                        side={THREE.DoubleSide}
                    />
                </Ring>
            )}

            {/* Planet glow effect */}
            <mesh>
                <sphereGeometry args={[config.size * 1.2, 16, 16]} />
                <meshBasicMaterial
                    color={config.glow}
                    transparent
                    opacity={isSelected ? 0.3 : 0.1}
                />
            </mesh>

            {/* Planet label */}
            <Text
                position={[0, config.size + 0.8, 0]}
                fontSize={0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="/fonts/orbitron.woff"
            >
                {config.icon} {config.label}
            </Text>

            {/* Selection indicator */}
            {isSelected && (
                <mesh rotation={[0, 0, 0]}>
                    <ringGeometry args={[config.size * 1.8, config.size * 2, 32]} />
                    <meshBasicMaterial
                        color="#00FFFF"
                        transparent
                        opacity={0.8}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Current route indicator */}
            {isCurrent && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[config.size * 1.6, config.size * 1.7, 32]} />
                    <meshBasicMaterial
                        color="#FFD700"
                        transparent
                        opacity={0.9}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
};

const OrbitPath: React.FC<{ radius: number }> = ({ radius }) => {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
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
        <points ref={stars}>
            <bufferGeometry />
            <pointsMaterial size={0.5} color="#FFFFFF" transparent opacity={0.8} />
        </points>
    );
};

const PlanetaryUI: React.FC<{
    selectedPlanet: string | null;
    isTransitioning: boolean;
    onClose: () => void;
}> = ({ selectedPlanet, isTransitioning, onClose }) => {
    const planet = selectedPlanet ? PLANETARY_ROUTES[selectedPlanet as keyof typeof PLANETARY_ROUTES] : null;

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

export default PlanetaryNavigation;