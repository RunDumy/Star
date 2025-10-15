/**
 * Mobile-Responsive Enhanced 3D Cosmos
 * Optimized version of the 3D cosmic environment for mobile devices
 * Features: Touch gestures, performance optimization, responsive design
 */

import {
    Environment,
    Loader,
    OrbitControls,
    Sphere,
    Stars,
    Text
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Color } from 'three';
import {
    useDeviceDetection,
    useMobileOptimization,
    useTouchGestures,
    type TouchGesture
} from '../../lib/MobileOptimization';

// Planet interface for cosmic navigation
interface Planet {
    name: string;
    position: [number, number, number];
    color: string;
    size: number;
    description: string;
    route: string;
    zodiacElement?: 'fire' | 'water' | 'air' | 'earth';
    energy?: number;
}

// Mobile-optimized planet configurations
const MOBILE_PLANETS: Planet[] = [
    {
        name: 'Profile',
        position: [0, 8, 0],
        color: '#FF6B6B',
        size: 1.2,
        description: 'Your Cosmic Identity & Zodiac Profile',
        route: '/cosmic-profile-enhanced',
        zodiacElement: 'fire',
        energy: 85
    },
    {
        name: 'Feed',
        position: [-6, 4, -4],
        color: '#4ECDC4',
        size: 1.0,
        description: 'Cosmic Social Feed & Community',
        route: '/cosmic-feed',
        zodiacElement: 'water',
        energy: 70
    },
    {
        name: 'Tarot',
        position: [6, 4, -4],
        color: '#45B7D1',
        size: 1.1,
        description: 'Divine Tarot Readings & Cosmic Insights',
        route: '/tarot-reader',
        zodiacElement: 'air',
        energy: 90
    },
    {
        name: 'Cosmos',
        position: [0, -6, 2],
        color: '#96CEB4',
        size: 1.3,
        description: 'Collaborative 3D Cosmic Space',
        route: '/collaborative-cosmos',
        zodiacElement: 'earth',
        energy: 75
    },
    {
        name: 'Numerology',
        position: [-8, 0, 0],
        color: '#FFEAA7',
        size: 0.9,
        description: 'Sacred Numbers & Life Path Analysis',
        route: '/numerology-enhanced',
        zodiacElement: 'air',
        energy: 80
    },
    {
        name: 'Music',
        position: [8, 0, 0],
        color: '#DDA0DD',
        size: 1.0,
        description: 'Cosmic Playlists & Elemental Soundscapes',
        route: '/enhanced-spotify',
        zodiacElement: 'water',
        energy: 88
    }
];

// Animated planet component with mobile optimizations
const AnimatedPlanet: React.FC<{
    planet: Planet;
    isSelected: boolean;
    onClick: (planet: Planet) => void;
    deviceInfo: any;
}> = ({ planet, isSelected, onClick, deviceInfo }) => {
    const meshRef = useRef<any>();
    const textRef = useRef<any>();
    const [hovered, setHovered] = useState(false);

    // Reduce animation complexity on mobile
    const animationSpeed = deviceInfo.isMobile ? 0.3 : 0.5;
    const pulseIntensity = deviceInfo.isMobile ? 0.1 : 0.2;

    useFrame((state) => {
        if (!meshRef.current) return;

        // Gentle floating animation
        meshRef.current.position.y = planet.position[1] + Math.sin(state.clock.elapsedTime * animationSpeed) * pulseIntensity;

        // Rotation based on zodiac element
        const rotationSpeed = planet.zodiacElement === 'fire' ? 0.8 : 0.4;
        meshRef.current.rotation.y += (deviceInfo.isMobile ? rotationSpeed * 0.5 : rotationSpeed) * 0.01;

        // Scale animation for selection/hover
        const targetScale = isSelected ? 1.4 : hovered ? 1.2 : 1.0;
        meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);

        // Text rotation to always face camera (simplified on mobile)
        if (textRef.current && !deviceInfo.isMobile) {
            textRef.current.lookAt(state.camera.position);
        }
    });

    // Energy particle system (disabled on mobile for performance)
    const particles = useMemo(() => {
        if (deviceInfo.isMobile) return [];
        const particleCount = 20;
        const temp = [];
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = planet.size + 0.5;
            temp.push([
                Math.cos(angle) * radius,
                Math.sin(angle * 0.5) * 0.5,
                Math.sin(angle) * radius
            ]);
        }
        return temp;
    }, [deviceInfo.isMobile, planet.size]);

    const EnergyParticles = !deviceInfo.isMobile && particles.length > 0 ? (
        <group>
            {particles.map((position, index) => (
                <Sphere key={index} args={[0.02]} position={position as [number, number, number]}>
                    <meshBasicMaterial color={planet.color} transparent opacity={0.6} />
                </Sphere>
            ))}
        </group>
    ) : null;

    return (
        <group position={planet.position}>
            <Sphere
                ref={meshRef}
                args={[planet.size]}
                onClick={() => onClick(planet)}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={planet.color}
                    transparent
                    opacity={0.8}
                    emissive={new Color(planet.color)}
                    emissiveIntensity={isSelected ? 0.5 : hovered ? 0.3 : 0.1}
                />
            </Sphere>

            {/* Planet label */}
            <Text
                ref={textRef}
                position={[0, planet.size + 1, 0]}
                fontSize={deviceInfo.isMobile ? 0.4 : 0.6}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="/fonts/cosmic.woff"
            >
                {planet.name}
            </Text>

            {/* Energy indicator */}
            {!deviceInfo.isMobile && (
                <Text
                    position={[0, -planet.size - 0.8, 0]}
                    fontSize={0.3}
                    color={planet.color}
                    anchorX="center"
                    anchorY="middle"
                >
                    {planet.energy}% Energy
                </Text>
            )}

            {/* Energy particles (desktop only) */}
            {EnergyParticles}
        </group>
    );
};

// Mobile-optimized cosmic background
const CosmicBackground: React.FC<{ deviceInfo: any }> = ({ deviceInfo }) => {
    let starCount = 5000;
    if (deviceInfo.isMobile) {
        starCount = 1000;
    } else if (deviceInfo.isTablet) {
        starCount = 3000;
    }
    const nebulaIntensity = deviceInfo.isMobile ? 0.3 : 0.6;

    return (
        <>
            <Stars radius={300} depth={50} count={starCount} factor={4} saturation={0} fade />

            {/* Cosmic nebula effect (reduced on mobile) */}
            <Sphere args={[200]} position={[0, 0, 0]}>
                <meshBasicMaterial
                    color="#1a0033"
                    transparent
                    opacity={nebulaIntensity}
                    side={2}
                />
            </Sphere>

            {/* Ambient lighting */}
            <ambientLight intensity={deviceInfo.isMobile ? 0.4 : 0.2} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={deviceInfo.isMobile ? 0.6 : 1.0}
                castShadow={!deviceInfo.isMobile}
            />
        </>
    );
};

// Touch gesture handler for 3D navigation
const TouchNavigationHandler: React.FC<{
    onNavigate: (direction: 'up' | 'down' | 'left' | 'right') => void;
    onZoom: (delta: number) => void;
    onSelect: () => void;
}> = ({ onNavigate, onZoom, onSelect }) => {
    const { camera } = useThree();

    const handleGesture = (gesture: TouchGesture) => {
        gesture.preventDefault();

        switch (gesture.type) {
            case 'tap':
                onSelect();
                break;

            case 'doubleTap':
                // Reset camera position
                camera.position.set(0, 0, 20);
                camera.lookAt(0, 0, 0);
                break;

            case 'swipe':
                if (gesture.direction) {
                    onNavigate(gesture.direction);
                }
                break;

            case 'pinch':
                if (gesture.scale) {
                    const zoomDelta = (gesture.scale - 1) * 10;
                    onZoom(zoomDelta);
                }
                break;

            case 'longPress':
                // Show planet info or context menu
                console.log('Long press detected - show context menu');
                break;
        }
    };

    const touchHandlers = useTouchGestures(handleGesture);

    // Apply touch handlers to the canvas
    useEffect(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('touchstart', touchHandlers.onTouchStart);
            canvas.addEventListener('touchmove', touchHandlers.onTouchMove);
            canvas.addEventListener('touchend', touchHandlers.onTouchEnd);

            return () => {
                canvas.removeEventListener('touchstart', touchHandlers.onTouchStart);
                canvas.removeEventListener('touchmove', touchHandlers.onTouchMove);
                canvas.removeEventListener('touchend', touchHandlers.onTouchEnd);
            };
        }
    }, [touchHandlers]);

    return null;
};

// Main mobile-responsive cosmos component
export const MobileEnhancedStarCosmos: React.FC<{
    onPlanetSelect?: (planet: Planet) => void;
    selectedPlanet?: string;
    className?: string;
}> = ({ onPlanetSelect, selectedPlanet, className = '' }) => {
    const deviceInfo = useDeviceDetection();
    const { getCosmosConfig } = useMobileOptimization();
    const [currentPlanet, setCurrentPlanet] = useState<Planet | null>(null);
    const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 20]);

    // Get device-optimized configuration
    const cosmosConfig = getCosmosConfig();

    // Handle planet selection
    const handlePlanetClick = (planet: Planet) => {
        setCurrentPlanet(planet);
        onPlanetSelect?.(planet);

        // Navigate to planet route on mobile (immediate)
        if (deviceInfo.isMobile) {
            window.location.href = planet.route;
        }
    };

    // Touch navigation handlers
    const handleNavigation = (direction: 'up' | 'down' | 'left' | 'right') => {
        const moveDistance = 5;
        setCameraPosition(prev => {
            switch (direction) {
                case 'up': return [prev[0], prev[1] + moveDistance, prev[2]];
                case 'down': return [prev[0], prev[1] - moveDistance, prev[2]];
                case 'left': return [prev[0] - moveDistance, prev[1], prev[2]];
                case 'right': return [prev[0] + moveDistance, prev[1], prev[2]];
                default: return prev;
            }
        });
    };

    const handleZoom = (delta: number) => {
        setCameraPosition(prev => [prev[0], prev[1], Math.max(10, Math.min(50, prev[2] + delta))]);
    };

    const handleSelect = () => {
        if (currentPlanet) {
            handlePlanetClick(currentPlanet);
        }
    };

    // Mobile-specific CSS classes
    const mobileClasses = `
    ${deviceInfo.isMobile ? 'mobile-cosmos' : ''}
    ${deviceInfo.isTablet ? 'tablet-cosmos' : ''}
    ${deviceInfo.touchEnabled ? 'touch-enabled' : ''}
    ${className}
  `;

    return (
        <div className={`w-full h-full relative ${mobileClasses}`} id="mobile-cosmos-container">
            {/* Canvas with optimized settings */}
            <Canvas
                camera={{
                    position: cameraPosition,
                    fov: deviceInfo.isMobile ? 75 : 60,
                    near: 0.1,
                    far: 2000
                }}
                gl={{
                    antialias: cosmosConfig.antiAliasing,
                    alpha: true,
                    preserveDrawingBuffer: true,
                    powerPreference: deviceInfo.isMobile ? 'low-power' : 'high-performance'
                }}
                dpr={deviceInfo.isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
                performance={{
                    min: cosmosConfig.frameRate * 0.8,
                    max: cosmosConfig.frameRate,
                    debounce: 200
                }}
                shadows={cosmosConfig.enableShadows}
            >
                <Suspense fallback={null}>
                    {/* Cosmic background */}
                    <CosmicBackground deviceInfo={deviceInfo} />

                    {/* Planets */}
                    {MOBILE_PLANETS.map((planet) => (
                        <AnimatedPlanet
                            key={planet.name}
                            planet={planet}
                            isSelected={selectedPlanet === planet.name}
                            onClick={handlePlanetClick}
                            deviceInfo={deviceInfo}
                        />
                    ))}

                    {/* Camera controls */}
                    {!deviceInfo.touchEnabled ? (
                        <OrbitControls
                            enablePan={true}
                            enableZoom={true}
                            enableRotate={true}
                            minDistance={10}
                            maxDistance={50}
                            maxPolarAngle={Math.PI}
                        />
                    ) : (
                        <TouchNavigationHandler
                            onNavigate={handleNavigation}
                            onZoom={handleZoom}
                            onSelect={handleSelect}
                        />
                    )}

                    {/* Environment lighting (reduced on mobile) */}
                    {!deviceInfo.isMobile && (
                        <Environment preset="night" background={false} />
                    )}
                </Suspense>
            </Canvas>

            {/* Loading indicator */}
            <Loader />

            {/* Mobile UI overlay */}
            {deviceInfo.isMobile && (
                <div className="absolute top-4 left-4 right-4 z-10">
                    {/* Touch instruction hint */}
                    <div className="bg-black bg-opacity-50 rounded-lg p-3 text-white text-sm">
                        <p className="mb-1">🌟 Tap planets to explore</p>
                        <p className="mb-1">👆 Swipe to navigate</p>
                        <p>🤏 Pinch to zoom</p>
                    </div>
                </div>
            )}

            {/* Planet info panel (mobile-optimized) */}
            {currentPlanet && (
                <div className={`
          absolute bottom-4 left-4 right-4 z-10
          bg-gradient-to-r from-purple-900 to-blue-900
          rounded-lg p-4 text-white
          ${deviceInfo.isMobile ? 'text-sm' : 'text-base'}
        `}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1" style={{ color: currentPlanet.color }}>
                                {currentPlanet.name}
                            </h3>
                            <p className="opacity-90 mb-2">{currentPlanet.description}</p>

                            {/* Energy bar */}
                            <div className="flex items-center space-x-2">
                                <span className="text-xs">Energy:</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${currentPlanet.energy}%`,
                                            backgroundColor: currentPlanet.color
                                        }}
                                    />
                                </div>
                                <span className="text-xs">{currentPlanet.energy}%</span>
                            </div>
                        </div>

                        {/* Navigation button */}
                        <button
                            onClick={() => handlePlanetClick(currentPlanet)}
                            className={`
                ml-4 px-4 py-2 rounded-lg font-semibold
                bg-white bg-opacity-20 hover:bg-opacity-30
                transition-all duration-200
                ${deviceInfo.isMobile ? 'text-sm px-3 py-1' : ''}
              `}
                            style={{ borderColor: currentPlanet.color, borderWidth: '1px' }}
                        >
                            {deviceInfo.isMobile ? 'Go' : 'Enter'}
                        </button>
                    </div>
                </div>
            )}

            {/* Performance indicator (development only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 rounded p-2 text-white text-xs">
                    <div>Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</div>
                    <div>WebGL: {deviceInfo.supportsWebGL ? '✅' : '❌'}</div>
                    <div>Touch: {deviceInfo.touchEnabled ? '✅' : '❌'}</div>
                    <div>FPS Target: {cosmosConfig.frameRate}</div>
                    <div>Particles: {cosmosConfig.maxParticles}</div>
                </div>
            )}

            <style jsx>{`
        .mobile-cosmos canvas {
          touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .tablet-cosmos {
          /* Tablet-specific optimizations */
        }

        .touch-enabled {
          cursor: grab;
        }

        .touch-enabled:active {
          cursor: grabbing;
        }

        @media (max-width: 768px) {
          .mobile-cosmos {
            height: calc(100vh - 60px); /* Account for mobile nav */
          }
        }

        @media (orientation: landscape) and (max-height: 500px) {
          .mobile-cosmos {
            height: 100vh; /* Full height in mobile landscape */
          }
        }
      `}</style>
        </div>
    );
};

export default MobileEnhancedStarCosmos;