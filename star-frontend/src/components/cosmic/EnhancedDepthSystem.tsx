"use client";

import { PointMaterial, Points } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface EnhancedDepthSystemProps {
    enableVolumetricFog?: boolean;
    enableAtmosphericScattering?: boolean;
    enableDepthIndicator?: boolean;
    fogNear?: number;
    fogFar?: number;
}

export const EnhancedDepthSystem: React.FC<EnhancedDepthSystemProps> = ({
    enableVolumetricFog = true,
    enableAtmosphericScattering = true,
    enableDepthIndicator = false,
    fogNear = 50,
    fogFar = 300,
}) => {
    const { scene, camera } = useThree();
    const scatteringRef = useRef<THREE.Points>(null);

    // Multi-layer starfield with true parallax depth
    const starLayers = useMemo(() => {
        const layers = [];

        // Far Stars: 1000px depth, slow movement
        const farStars = new Float32Array(1500 * 3);
        for (let i = 0; i < 1500; i++) {
            farStars[i * 3] = (Math.random() - 0.5) * 2000;
            farStars[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            farStars[i * 3 + 2] = -1000 + (Math.random() - 0.5) * 200;
        }

        // Mid Stars: 500px depth, medium movement
        const midStars = new Float32Array(1000 * 3);
        for (let i = 0; i < 1000; i++) {
            midStars[i * 3] = (Math.random() - 0.5) * 1000;
            midStars[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            midStars[i * 3 + 2] = -500 + (Math.random() - 0.5) * 100;
        }

        // Near Stars: 200px depth, fast movement
        const nearStars = new Float32Array(500 * 3);
        for (let i = 0; i < 500; i++) {
            nearStars[i * 3] = (Math.random() - 0.5) * 400;
            nearStars[i * 3 + 1] = (Math.random() - 0.5) * 400;
            nearStars[i * 3 + 2] = -200 + (Math.random() - 0.5) * 50;
        }

        return [
            { positions: farStars, opacity: 0.2, size: 1.0, speed: 0.001 },
            { positions: midStars, opacity: 0.5, size: 1.5, speed: 0.002 },
            { positions: nearStars, opacity: 0.8, size: 2.0, speed: 0.003 }
        ];
    }, []);

    // Atmospheric scattering particles
    const scatteringParticles = useMemo(() => {
        const count = 200;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const radius = Math.random() * 400 + 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi) - 300;

            sizes[i] = Math.random() * 2 + 1;
        }

        return { positions, sizes };
    }, []);

    useFrame((state, delta) => {
        // Rotate star layers at different speeds for parallax effect
        if (scatteringRef.current) {
            scatteringRef.current.rotation.y += delta * 0.01;
        }
    });

    return (
        <>
            {/* Volumetric Fog */}
            {enableVolumetricFog && (
                <fog attach="fog" args={['#000000', fogNear, fogFar]} />
            )}

            {/* Multi-layer Starfield */}
            {starLayers.map((layer, index) => (
                <Points key={index} positions={layer.positions}>
                    <PointMaterial
                        transparent
                        color="#ffffff"
                        size={layer.size}
                        opacity={layer.opacity}
                        sizeAttenuation={true}
                    />
                </Points>
            ))}

            {/* Atmospheric Scattering */}
            {enableAtmosphericScattering && (
                <Points
                    ref={scatteringRef}
                    positions={scatteringParticles.positions}
                >
                    <PointMaterial
                        transparent
                        color="#3b82f6"
                        size={0.5}
                        opacity={0.1}
                        sizeAttenuation={true}
                        blending={THREE.AdditiveBlending}
                    />
                </Points>
            )}

            {/* Cosmic Fog Layers */}
            <mesh position={[0, 0, -400]} scale={[800, 800, 1]}>
                <planeGeometry />
                <meshBasicMaterial
                    transparent
                    opacity={0.05}
                    color="#3b82f6"
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            <mesh position={[0, 0, -600]} scale={[1200, 1200, 1]}>
                <planeGeometry />
                <meshBasicMaterial
                    transparent
                    opacity={0.03}
                    color="#7c3aed"
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Depth Lighting */}
            <ambientLight intensity={0.1} color="#1e3a8a" />
            <pointLight
                position={[50, 50, 50]}
                intensity={0.3}
                color="#3b82f6"
                distance={200}
                decay={2}
            />
            <pointLight
                position={[-50, -50, -50]}
                intensity={0.2}
                color="#7c3aed"
                distance={150}
                decay={2}
            />
        </>
    );
};

// Planet coordinate system component
export const PlanetCoordinateSystem: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Slow orbital rotation for natural movement
            groupRef.current.rotation.y += delta * 0.02;
            groupRef.current.rotation.x += delta * 0.01;
        }
    });

    return (
        <group
            ref={groupRef}
            className="planet-navigation-space"
        >
            {children}
        </group>
    );
};

// Depth indicator component for debugging
export const DepthIndicator: React.FC<{
    cameraPosition: THREE.Vector3;
    planetPositions: Array<{ name: string; position: [number, number, number] }>;
}> = ({ cameraPosition, planetPositions }) => {
    return (
        <div className="depth-indicator">
            <div>Camera: X:{cameraPosition.x.toFixed(1)} Y:{cameraPosition.y.toFixed(1)} Z:{cameraPosition.z.toFixed(1)}</div>
            {planetPositions.map((planet, index) => {
                const distance = Math.sqrt(
                    Math.pow(planet.position[0] - cameraPosition.x, 2) +
                    Math.pow(planet.position[1] - cameraPosition.y, 2) +
                    Math.pow(planet.position[2] - cameraPosition.z, 2)
                );
                return (
                    <div key={index} style={{ fontSize: '10px' }}>
                        {planet.name}: {distance.toFixed(1)}u
                    </div>
                );
            })}
        </div>
    );
};