"use client";

import { Loader } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

import { CosmicPhenomena } from './CosmicPhenomena';
import { CosmicStarfield } from './CosmicStarfield';
import { Enhanced3DOrbitSystem } from './Enhanced3DOrbitSystem';
import { EnhancedCameraControls } from './EnhancedCameraControls';
import { EnhancedPlanetButton } from './EnhancedPlanetButton';

// Navigation planets configuration
const navigationPlanets = [
    {
        position: [20, 8, -15] as [number, number, number],
        route: '/chat',
        label: 'Cosmic Chat',
        color: '#4a90e2',
        size: 1.4,
        orbitSpeed: 0.25,
        hasAtmosphere: true,
        hasAurora: true,
        planetType: 'gas' as const,
        emissiveColor: '#87ceeb',
        atmosphereColor: '#4fc3f7'
    },
    {
        position: [-25, 2, 18] as [number, number, number],
        route: '/profile',
        label: 'Soul Profile',
        color: '#9b59b6',
        size: 1.2,
        orbitSpeed: 0.35,
        hasRings: true,
        hasMoons: true,
        planetType: 'ice' as const,
        emissiveColor: '#bb86fc',
        ringColor: '#e1bee7'
    },
    {
        position: [5, -12, -28] as [number, number, number],
        route: '/feed',
        label: 'Cosmic Feed',
        color: '#2ecc71',
        size: 1.3,
        orbitSpeed: 0.18,
        hasAtmosphere: false,
        planetType: 'rocky' as const,
        emissiveColor: '#4caf50'
    },
    {
        position: [35, -6, 22] as [number, number, number],
        route: '/mirror',
        label: 'Soul Mirror',
        color: '#e74c3c',
        size: 1.1,
        orbitSpeed: 0.42,
        hasRings: false,
        planetType: 'volcanic' as const,
        emissiveColor: '#ff5722',
        hasAurora: false
    },
    {
        position: [-18, 15, -8] as [number, number, number],
        route: '/tarot',
        label: 'Tarot Cosmos',
        color: '#f39c12',
        size: 1.0,
        orbitSpeed: 0.28,
        hasAtmosphere: true,
        planetType: 'desert' as const,
        emissiveColor: '#ff9800',
        atmosphereColor: '#ffc107'
    },
    {
        position: [8, 25, 35] as [number, number, number],
        route: '/collaborative-cosmos',
        label: 'Shared Universe',
        color: '#1abc9c',
        size: 1.6,
        orbitSpeed: 0.15,
        hasAtmosphere: true,
        hasRings: true,
        hasMoons: true,
        planetType: 'ocean' as const,
        emissiveColor: '#26a69a',
        atmosphereColor: '#4dd0e1',
        ringColor: '#80cbc4'
    }
];

// Enhanced cosmic content with all improvements
const EnhancedCosmicContent = () => {
    // Camera targets for navigation
    const cameraTargets = navigationPlanets.map(planet => ({
        name: planet.label,
        position: planet.position,
        lookAt: [0, 0, 0] as [number, number, number]
    }));

    return (
        <>
            {/* Deep space background */}
            <color attach="background" args={['#000008']} />

            {/* Enhanced cosmic environment */}
            <CosmicStarfield
                count={15000}
                radius={1200}
                enableTwinkling={true}
                enableNebulae={true}
            />

            {/* Cosmic phenomena */}
            <CosmicPhenomena
                enableShootingStars={true}
                enableAsteroids={true}
                enableDistantGalaxies={true}
                enablePulsars={true}
            />

            {/* Enhanced lighting system */}
            <ambientLight intensity={0.15} color="#4a4a8a" />
            <pointLight
                position={[0, 0, 0]}
                intensity={2}
                color="#FDB813"
                castShadow
            />
            <pointLight
                position={[50, 30, 20]}
                intensity={0.8}
                color="#4a90e2"
            />
            <pointLight
                position={[-40, -20, 30]}
                intensity={0.6}
                color="#9b59b6"
            />

            {/* Directional light for depth */}
            <directionalLight
                position={[100, 100, 50]}
                intensity={0.3}
                color="#ffffff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            {/* Enhanced 3D orbital system */}
            <Enhanced3DOrbitSystem
                enableDrag={true}
                autoRotate={true}
                autoRotateSpeed={0.001}
                centerMass={true}
                orbitalRadius={12}
                orbitalSpacing={6}
            >
                {navigationPlanets.map((planet, index) => (
                    <Suspense key={planet.route} fallback={<FallbackSphere position={planet.position} color={planet.color} />}>
                        <EnhancedPlanetButton
                            {...planet}
                            onClick={() => {
                                console.log(`🚀 Navigating to ${planet.route}`);
                                // Add navigation logic here
                                if (typeof window !== 'undefined') {
                                    window.location.href = planet.route;
                                }
                            }}
                        />
                    </Suspense>
                ))}
            </Enhanced3DOrbitSystem>

            {/* Enhanced camera controls */}
            <EnhancedCameraControls
                enableAutoRotate={false}
                enableZoom={true}
                enablePan={true}
                minDistance={10}
                maxDistance={300}
                autoRotateSpeed={0.3}
                dampingFactor={0.05}
                enableTransitions={true}
                targets={cameraTargets}
            />

            {/* Fog for atmospheric depth */}
            <fog attach="fog" args={['#000033', 50, 800]} />
        </>
    );
};

// Fallback component for loading states
const FallbackSphere = ({ position, color }: { position: [number, number, number]; color: string }) => (
    <mesh position={position}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
);

export const EnhancedCosmicNavigationScene = () => {
    return (
        <div className="w-full h-screen relative bg-black overflow-hidden">
            <Canvas
                camera={{
                    position: [0, 20, 60],
                    fov: 60,
                    near: 0.1,
                    far: 2000
                }}
                gl={{
                    antialias: true,
                    alpha: true
                }}
                dpr={[1, 2]}
                shadows
            >
                <EnhancedCosmicContent />
            </Canvas>

            {/* Loading indicator */}
            <Loader />

            {/* Enhanced UI Instructions */}
            <div className="absolute top-4 left-4 text-white/80 text-sm bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="font-bold mb-2 text-cyan-400">🌌 Enhanced Cosmic Navigation</div>
                <div className="space-y-1 text-xs">
                    <div>🖱️ Drag to explore the cosmos</div>
                    <div>🎯 Scroll to zoom through space</div>
                    <div>🪐 Click planets to navigate</div>
                    <div>⌨️ Press 1-6 for quick planet access</div>
                    <div>⌨️ Space bar to return to center</div>
                </div>
            </div>

            {/* Planet legend */}
            <div className="absolute top-4 right-4 text-white/80 text-xs bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="font-bold mb-2 text-purple-400">🚀 Cosmic Destinations</div>
                <div className="space-y-1">
                    {navigationPlanets.map((planet, index) => (
                        <div key={planet.route} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full bg-current"
                            />
                            <span>{index + 1}. {planet.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance indicator */}
            <div className="absolute bottom-4 right-4 text-white/60 text-xs bg-black/30 backdrop-blur-sm rounded px-2 py-1">
                Enhanced 3D Space Experience
            </div>
        </div>
    );
};