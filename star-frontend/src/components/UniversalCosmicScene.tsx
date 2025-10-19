/// <reference path="../global.d.ts" />
import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface UniversalCosmicSceneProps {
    children?: React.ReactNode;
    enableControls?: boolean;
    cameraPosition?: [number, number, number];
    fogColor?: string;
    fogNear?: number;
    fogFar?: number;
    starCount?: number;
    ambientLightIntensity?: number;
    showStars?: boolean;
}

export const UniversalCosmicScene: React.FC<UniversalCosmicSceneProps> = ({
    children,
    enableControls = true,
    cameraPosition = [0, 0, 20],
    fogColor = '#000011',
    fogNear = 10,
    fogFar = 100,
    starCount = 15000,
    ambientLightIntensity = 0.1,
    showStars = true
}) => {
    return (
        <div className="universal-cosmic-scene w-full h-full relative">
            <Canvas
                camera={{
                    position: cameraPosition,
                    fov: 60,
                    near: 0.1,
                    far: 1000
                }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance"
                }}
                style={{ background: 'transparent' }}
            >
                {/* Cosmic fog for depth perception */}
                <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

                {/* Ambient cosmic lighting */}
                <ambientLight intensity={ambientLightIntensity} />

                {/* Layered lighting system */}
                <CosmicLighting />

                {/* Starfield layers */}
                {showStars && (
                    <>
                        <CosmicStarField count={starCount} />
                        <EnhancedStars />
                    </>
                )}

                {/* Camera controls */}
                {enableControls && (
                    <OrbitControls
                        enableZoom={true}
                        enablePan={true}
                        enableRotate={true}
                        minDistance={5}
                        maxDistance={100}
                        autoRotate={false}
                        autoRotateSpeed={0.2}
                        dampingFactor={0.05}
                        enableDamping={true}
                    />
                )}

                {/* Render children (planets, etc.) */}
                {children}
            </Canvas>
        </div>
    );
};

// Enhanced cosmic lighting with multiple light sources
const CosmicLighting: React.FC = () => {
    const lightGroupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (lightGroupRef.current) {
            // Subtle rotation of light sources for dynamic atmosphere
            lightGroupRef.current.rotation.y += 0.0005;
        }
    });

    return (
        <group ref={lightGroupRef}>
            {/* Primary cosmic light */}
            <directionalLight
                position={[10, 10, 5]}
                intensity={0.8}
                color="#ffffff"
                castShadow={false}
            />

            {/* Mystical purple light */}
            <pointLight
                position={[-15, -10, -10]}
                intensity={0.6}
                color="#8b5cf6"
                distance={50}
                decay={2}
            />

            {/* Energetic blue light */}
            <pointLight
                position={[15, 5, 10]}
                intensity={0.4}
                color="#06b6d4"
                distance={40}
                decay={2}
            />

            {/* Warm golden light */}
            <pointLight
                position={[0, -15, 5]}
                intensity={0.3}
                color="#f59e0b"
                distance={30}
                decay={2}
            />

            {/* Cool nebula light */}
            <spotLight
                position={[0, 20, 0]}
                angle={Math.PI / 6}
                penumbra={0.5}
                intensity={0.5}
                color="#ec4899"
                distance={60}
                decay={2}
                target-position={[0, 0, 0]}
            />
        </group>
    );
};

// Multi-layered starfield with different densities and colors
const CosmicStarField: React.FC<{ count: number }> = ({ count }) => {
    const starFieldRef = useRef<THREE.Points>(null);

    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Random positions in a large sphere
            const radius = Math.random() * 200 + 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Color variation based on distance and randomness
            const distance = radius / 250;
            const starType = Math.random();

            if (starType < 0.3) {
                // Blue-white stars (hot, distant)
                colors[i * 3] = 0.8 + Math.random() * 0.2;     // R
                colors[i * 3 + 1] = 0.9 + Math.random() * 0.1; // G
                colors[i * 3 + 2] = 1.0;                       // B
            } else if (starType < 0.6) {
                // Yellow-white stars (sun-like)
                colors[i * 3] = 1.0;                           // R
                colors[i * 3 + 1] = 1.0;                       // G
                colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
            } else if (starType < 0.8) {
                // Red-orange stars (cool, close)
                colors[i * 3] = 1.0;                           // R
                colors[i * 3 + 1] = 0.6 + Math.random() * 0.4; // G
                colors[i * 3 + 2] = 0.3 + Math.random() * 0.3; // B
            } else {
                // Purple stars (mystical)
                colors[i * 3] = 0.8 + Math.random() * 0.2;     // R
                colors[i * 3 + 1] = 0.4 + Math.random() * 0.3; // G
                colors[i * 3 + 2] = 1.0;                       // B
            }

            // Dim stars based on distance
            const dimming = Math.max(0.1, 1 - distance);
            colors[i * 3] *= dimming;
            colors[i * 3 + 1] *= dimming;
            colors[i * 3 + 2] *= dimming;
        }

        return { positions, colors };
    }, [count]);

    useFrame(() => {
        if (starFieldRef.current) {
            // Very slow rotation for cosmic drift effect
            starFieldRef.current.rotation.y += 0.0001;
            starFieldRef.current.rotation.x += 0.00005;
        }
    });

    return (
        <points ref={starFieldRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={2}
                vertexColors={true}
                transparent={true}
                opacity={0.8}
                sizeAttenuation={true}
            />
        </points>
    );
};

// Enhanced stars component with twinkling effect
const EnhancedStars: React.FC = () => {
    const starsRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (starsRef.current) {
            const time = state.clock.getElapsedTime();
            // Twinkling effect
            const material = starsRef.current.material as THREE.PointsMaterial;
            material.opacity = 0.6 + Math.sin(time * 2) * 0.2;
        }
    });

    return (
        <Stars
            ref={starsRef}
            radius={300}
            depth={60}
            count={5000}
            factor={7}
            saturation={0}
            fade={true}
        />
    );
};

export default UniversalCosmicScene;