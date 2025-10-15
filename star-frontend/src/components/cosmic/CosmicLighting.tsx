"use client";

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface CosmicLightingProps {
    ambientIntensity?: number;
    pointLightCount?: number;
    dynamicLights?: boolean;
    colorScheme?: 'cool' | 'warm' | 'mixed';
}

export const CosmicLighting: React.FC<CosmicLightingProps> = ({
    ambientIntensity = 0.2,
    pointLightCount = 5,
    dynamicLights = true,
    colorScheme = 'mixed'
}) => {
    const pointLightRefs = useRef<(THREE.PointLight | null)[]>([]);

    // Generate point lights with different colors based on scheme
    const pointLights = Array.from({ length: pointLightCount }, (_, i) => {
        let color: string;
        let intensity: number;
        let distance: number;

        switch (colorScheme) {
            case 'cool':
                color = i % 3 === 0 ? '#4a90e2' : i % 3 === 1 ? '#7c3aed' : '#06b6d4';
                intensity = 0.8 + Math.random() * 0.4;
                break;
            case 'warm':
                color = i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#dc2626' : '#ea580c';
                intensity = 0.6 + Math.random() * 0.3;
                break;
            default: // mixed
                const colors = ['#4a90e2', '#7c3aed', '#f59e0b', '#dc2626', '#06b6d4', '#ea580c', '#8b5cf6'];
                color = colors[i % colors.length];
                intensity = 0.5 + Math.random() * 0.5;
        }

        distance = 50 + Math.random() * 100;

        return {
            position: [
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            ] as [number, number, number],
            color,
            intensity,
            distance,
            orbitRadius: 20 + Math.random() * 80,
            orbitSpeed: (Math.random() - 0.5) * 0.02,
            phase: Math.random() * Math.PI * 2
        };
    });

    useFrame((state) => {
        if (!dynamicLights) return;

        const time = state.clock.elapsedTime;

        pointLightRefs.current.forEach((light, i) => {
            if (light) {
                const lightConfig = pointLights[i];

                // Orbital movement
                const angle = time * lightConfig.orbitSpeed + lightConfig.phase;
                light.position.x = Math.cos(angle) * lightConfig.orbitRadius;
                light.position.z = Math.sin(angle) * lightConfig.orbitRadius;
                light.position.y = Math.sin(angle * 0.7) * lightConfig.orbitRadius * 0.5;

                // Pulsing intensity
                const pulse = Math.sin(time * (1 + i * 0.1)) * 0.3 + 0.7;
                light.intensity = lightConfig.intensity * pulse;

                // Subtle color shifting for some lights
                if (i % 3 === 0) {
                    const hueShift = Math.sin(time * 0.5 + i) * 0.1;
                    const color = new THREE.Color(lightConfig.color);
                    color.offsetHSL(hueShift, 0, 0);
                    light.color = color;
                }
            }
        });
    });

    return (
        <>
            {/* Ambient light for base illumination */}
            <ambientLight intensity={ambientIntensity} />

            {/* Dynamic point lights */}
            {pointLights.map((light, i) => (
                <pointLight
                    key={`point-light-${i}`}
                    ref={(el) => { pointLightRefs.current[i] = el; }}
                    position={light.position}
                    color={light.color}
                    intensity={light.intensity}
                    distance={light.distance}
                    decay={2}
                />
            ))}

            {/* Rim lighting for depth */}
            <directionalLight
                position={[100, 100, 50]}
                intensity={0.3}
                color="#ffffff"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={500}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
            />

            {/* Fill light from opposite side */}
            <directionalLight
                position={[-50, -50, -100]}
                intensity={0.2}
                color="#4a90e2"
            />

            {/* Subtle hemisphere light for atmospheric feel */}
            <hemisphereLight
                args={['#1e1b4b', '#000000', 0.1]}
            />
        </>
    );
};