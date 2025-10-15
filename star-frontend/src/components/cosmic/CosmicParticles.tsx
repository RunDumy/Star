"use client";

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface CosmicParticlesProps {
    count?: number;
    type?: 'dust' | 'nebula' | 'stars' | 'explosion';
    color?: string;
    size?: number;
    spread?: number;
    speed?: number;
    position?: [number, number, number];
}

export const CosmicParticles: React.FC<CosmicParticlesProps> = ({
    count = 1000,
    type = 'dust',
    color = '#ffffff',
    size = 1,
    spread = 100,
    speed = 0.01,
    position = [0, 0, 0]
}) => {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, velocities, colors, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorObj = new THREE.Color(color);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Position distribution based on type
            switch (type) {
                case 'dust':
                    // Random cloud distribution
                    positions[i3] = (Math.random() - 0.5) * spread + position[0];
                    positions[i3 + 1] = (Math.random() - 0.5) * spread + position[1];
                    positions[i3 + 2] = (Math.random() - 0.5) * spread + position[2];
                    break;
                case 'nebula':
                    // Spherical distribution
                    const radius = Math.random() * spread;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    positions[i3] = radius * Math.sin(phi) * Math.cos(theta) + position[0];
                    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + position[1];
                    positions[i3 + 2] = radius * Math.cos(phi) + position[2];
                    break;
                case 'stars':
                    // Distant star field
                    const starRadius = spread + Math.random() * spread;
                    const starTheta = Math.random() * Math.PI * 2;
                    const starPhi = Math.acos(2 * Math.random() - 1);
                    positions[i3] = starRadius * Math.sin(starPhi) * Math.cos(starTheta) + position[0];
                    positions[i3 + 1] = starRadius * Math.sin(starPhi) * Math.sin(starTheta) + position[1];
                    positions[i3 + 2] = starRadius * Math.cos(starPhi) + position[2];
                    break;
                case 'explosion':
                    // Radial burst from center
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * spread;
                    positions[i3] = Math.cos(angle) * distance + position[0];
                    positions[i3 + 1] = Math.sin(angle) * distance * 0.5 + position[1];
                    positions[i3 + 2] = (Math.random() - 0.5) * spread * 0.5 + position[2];
                    break;
            }

            // Velocities based on type
            switch (type) {
                case 'dust':
                    velocities[i3] = (Math.random() - 0.5) * speed;
                    velocities[i3 + 1] = (Math.random() - 0.5) * speed;
                    velocities[i3 + 2] = (Math.random() - 0.5) * speed;
                    break;
                case 'nebula':
                    velocities[i3] = (Math.random() - 0.5) * speed * 0.5;
                    velocities[i3 + 1] = (Math.random() - 0.5) * speed * 0.5;
                    velocities[i3 + 2] = (Math.random() - 0.5) * speed * 0.5;
                    break;
                case 'stars':
                    // Stars are mostly static
                    velocities[i3] = (Math.random() - 0.5) * speed * 0.1;
                    velocities[i3 + 1] = (Math.random() - 0.5) * speed * 0.1;
                    velocities[i3 + 2] = (Math.random() - 0.5) * speed * 0.1;
                    break;
                case 'explosion':
                    // Outward velocity for explosion
                    const expAngle = Math.atan2(positions[i3 + 1] - position[1], positions[i3] - position[0]);
                    velocities[i3] = Math.cos(expAngle) * speed * 2;
                    velocities[i3 + 1] = Math.sin(expAngle) * speed * 2;
                    velocities[i3 + 2] = (Math.random() - 0.5) * speed;
                    break;
            }

            // Colors with variation
            const hueVariation = (Math.random() - 0.5) * 0.1;
            const satVariation = (Math.random() - 0.5) * 0.2;
            const lightnessVariation = (Math.random() - 0.5) * 0.3;

            const variedColor = colorObj.clone();
            variedColor.offsetHSL(hueVariation, satVariation, lightnessVariation);

            colors[i3] = variedColor.r;
            colors[i3 + 1] = variedColor.g;
            colors[i3 + 2] = variedColor.b;

            // Sizes with variation
            sizes[i] = size * (0.5 + Math.random() * 0.5);
        }

        return { positions, velocities, colors, sizes };
    }, [count, type, color, size, spread, speed, position]);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const time = state.clock.elapsedTime;
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = pointsRef.current.geometry.attributes.velocity.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Update positions based on velocities
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            // Boundary wrapping for dust and nebula
            if (type === 'dust' || type === 'nebula') {
                if (Math.abs(positions[i3] - position[0]) > spread) {
                    positions[i3] = position[0] + (positions[i3] > position[0] ? -spread : spread);
                }
                if (Math.abs(positions[i3 + 1] - position[1]) > spread) {
                    positions[i3 + 1] = position[1] + (positions[i3 + 1] > position[1] ? -spread : spread);
                }
                if (Math.abs(positions[i3 + 2] - position[2]) > spread) {
                    positions[i3 + 2] = position[2] + (positions[i3 + 2] > position[2] ? -spread : spread);
                }
            }

            // Special animation for explosion
            if (type === 'explosion') {
                // Slow down over time
                velocities[i3] *= 0.99;
                velocities[i3 + 1] *= 0.99;
                velocities[i3 + 2] *= 0.99;
            }

            // Twinkling effect for stars
            if (type === 'stars') {
                const twinkle = Math.sin(time * 2 + i * 0.1) * 0.3 + 0.7;
                velocities[i3] *= twinkle;
                velocities[i3 + 1] *= twinkle;
                velocities[i3 + 2] *= twinkle;
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    count={count}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-velocity"
                    array={velocities}
                    count={count}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    array={colors}
                    count={count}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    array={sizes}
                    count={count}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                size={size}
                vertexColors
                transparent
                opacity={0.8}
                blending={type === 'explosion' ? THREE.AdditiveBlending : THREE.NormalBlending}
                sizeAttenuation={type !== 'stars'}
            />
        </points>
    );
};