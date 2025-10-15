import { OrbitControls, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { CosmicPhenomena } from './CosmicPhenomena';
import { EnhancedStarfield } from './EnhancedStarfield';

interface UniversalCosmicSceneProps {
    children: React.ReactNode;
    enableControls?: boolean;
    enableInteraction?: boolean;
}

export const UniversalCosmicScene: React.FC<UniversalCosmicSceneProps> = ({
    children,
    enableControls = true,
    enableInteraction = true
}) => {
    const sceneRef = useRef<THREE.Group>(null);
    const backgroundStarsRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        // Gentle scene rotation for immersion
        if (sceneRef.current) {
            sceneRef.current.rotation.y += delta * 0.002;
        }

        // Rotate background stars for depth
        if (backgroundStarsRef.current) {
            backgroundStarsRef.current.rotation.y += delta * 0.005;
            backgroundStarsRef.current.rotation.x += delta * 0.002;
        }
    });

    return (
        <>
            {/* Pure black void background */}
            <color attach="background" args={['#000000']} />

            {/* Enhanced lighting system for depth */}
            <ambientLight intensity={0.08} color="#1a1a2e" />

            {/* Primary cosmic light sources */}
            <pointLight
                position={[100, 100, 100]}
                intensity={0.3}
                color="#4a90e2"
                distance={300}
                decay={2}
            />
            <pointLight
                position={[-80, -60, -80]}
                intensity={0.25}
                color="#9b59b6"
                distance={250}
                decay={2}
            />
            <pointLight
                position={[50, -100, 200]}
                intensity={0.2}
                color="#2ecc71"
                distance={400}
                decay={2}
            />

            {/* Directional light for subtle rim lighting */}
            <directionalLight
                position={[200, 200, 100]}
                intensity={0.1}
                color="#ffffff"
                castShadow
            />

            {/* Space fog for depth perception */}
            <fog attach="fog" args={['#000000', 80, 500]} />

            {/* Background starfield layers */}
            <group ref={backgroundStarsRef}>
                <EnhancedStarfield
                    layers={[
                        { count: 12000, depth: 3000, speed: 0.03, size: 0.2, color: new THREE.Color(0.7, 0.8, 1.0) },
                        { count: 6000, depth: 1500, speed: 0.08, size: 0.5, color: new THREE.Color(1.0, 1.0, 0.9) },
                        { count: 3000, depth: 800, speed: 0.15, size: 0.8, color: new THREE.Color(1.0, 0.9, 0.7) },
                        { count: 1000, depth: 400, speed: 0.25, size: 1.2, color: new THREE.Color(0.9, 0.95, 1.0) }
                    ]}
                    enableTwinkling={true}
                    enableNebulae={true}
                    enableCosmicDust={true}
                />

                {/* Additional drei stars for enhanced density */}
                <Stars
                    radius={500}
                    depth={200}
                    count={8000}
                    factor={6}
                    saturation={0.3}
                    fade
                    speed={0.2}
                />
                <Stars
                    radius={800}
                    depth={100}
                    count={4000}
                    factor={10}
                    saturation={0.1}
                    fade
                    speed={0.1}
                />
            </group>

            {/* Cosmic phenomena for atmosphere */}
            <CosmicPhenomena />

            {/* Main scene content */}
            <group ref={sceneRef}>
                {children}
            </group>

            {/* Interactive camera controls */}
            {enableControls && enableInteraction && (
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    zoomSpeed={0.6}
                    panSpeed={0.4}
                    rotateSpeed={0.3}
                    minDistance={8}
                    maxDistance={300}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI}
                    autoRotate={false}
                    autoRotateSpeed={0.2}
                    dampingFactor={0.05}
                    enableDamping={true}
                />
            )}
        </>
    );
};