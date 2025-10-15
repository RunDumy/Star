import { useFrame, useThree } from '@react-three/fiber';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { EnhancedPlanetButton } from './EnhancedPlanetButton';

export const UniversalPlanetNavigation: React.FC = () => {
    const router = useRouter();
    const navigationGroupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const [targetPosition, setTargetPosition] = React.useState<THREE.Vector3 | null>(null);

    // Enhanced 3D Planet Positioning System with zodiac correlations - Elemental Color Theme
    // True 3D coordinates with depth-based distribution
    const navigationPlanets = [
        {
            id: 'feed',
            label: 'Cosmic Feed',
            path: '/cosmic-feed',
            position: [12, 4, -8] as [number, number, number], // Far right, elevated, deep
            type: 'rocky' as const,
            size: 1.1,
            color: '#92400e', // Earth element - Brown (WCAG AA compliant)
            atmosphere: true,
            zodiacSign: 'Aries',
            depth: 'far',
            description: 'Explore community posts',
        },
        {
            id: 'chat',
            label: 'Star Chat',
            path: '/cosmic-chat',
            position: [-8, -3, 6] as [number, number, number], // Left, lower, near
            type: 'gas' as const,
            size: 1.4,
            color: '#06b6d4', // Air element - Cyan
            atmosphere: true,
            rings: false,
            zodiacSign: 'Gemini',
            depth: 'near',
            description: 'Connect with other travelers',
        },
        {
            id: 'profile',
            label: 'Profile Nebula',
            path: '/cosmic-profile-enhanced',
            position: [-14, 8, -2] as [number, number, number], // Far left, high, mid-depth
            type: 'ice' as const,
            size: 1.2,
            color: '#06b6d4', // Air element - Cyan
            atmosphere: true,
            rings: true,
            zodiacSign: 'Libra',
            depth: 'mid',
            description: 'Your cosmic identity',
        },
        {
            id: 'explore',
            label: 'Galaxy Explorer',
            path: '/cosmic-explore',
            position: [12, -5, 4] as [number, number, number],
            type: 'desert' as const,
            size: 1.3,
            color: '#ef4444', // Fire element - Red
            atmosphere: false,
            zodiacSign: 'Sagittarius',
            description: 'Discover new worlds',
        },
        {
            id: 'create',
            label: 'Creation Star',
            path: '/cosmic-create',
            position: [-4, -8, -7] as [number, number, number],
            type: 'rocky' as const,
            size: 1.0,
            color: '#ef4444', // Fire element - Red
            atmosphere: true,
            zodiacSign: 'Leo',
            description: 'Create new content',
        },
        {
            id: 'reflection',
            label: 'Reflection Planet',
            path: '/cosmic-reflection',
            position: [5, 10, 2] as [number, number, number],
            type: 'gas' as const,
            size: 1.5,
            color: '#3b82f6', // Water element - Blue (accessible)
            atmosphere: true,
            rings: true,
            zodiacSign: 'Pisces',
            description: 'Meditate and reflect',
        },
    ];

    // Orbital animation and camera transitions
    useFrame((state, delta) => {
        if (navigationGroupRef.current) {
            // Subtle group rotation
            navigationGroupRef.current.rotation.y += delta * 0.02;
            navigationGroupRef.current.rotation.x += delta * 0.01;

            // Individual planet orbital paths
            navigationPlanets.forEach((planet, index) => {
                const group = navigationGroupRef.current!.children[index];
                if (group) {
                    const orbitRadius = Math.sqrt(planet.position[0] ** 2 + planet.position[2] ** 2);
                    const angle = state.clock.elapsedTime * 0.1 + (index * Math.PI * 2) / navigationPlanets.length;
                    group.position.x = orbitRadius * Math.cos(angle);
                    group.position.z = orbitRadius * Math.sin(angle);
                }
            });

            // Smooth camera transition to selected planet
            if (targetPosition) {
                camera.position.lerp(targetPosition, 0.05);
                camera.lookAt(0, 0, 0);
            }
        }
    });

    const handlePlanetClick = (path: string, label: string, position: [number, number, number]) => {
        console.log(`🪐 Navigating to ${label}`);
        // Set camera target to zoom towards planet
        setTargetPosition(new THREE.Vector3(position[0], position[1] + 2, position[2] + 5));
        // Delay navigation to allow animation
        setTimeout(() => {
            router.push(path);
            setTargetPosition(null); // Reset camera after navigation
        }, 500);
    };

    // Orbital path visualizations
    const orbitalPaths = navigationPlanets.map((planet, index) => {
        const orbitRadius = Math.sqrt(planet.position[0] ** 2 + planet.position[2] ** 2);
        return (
            <mesh key={`orbit-${index}`} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[orbitRadius, 0.05, 16, 100]} />
                <meshBasicMaterial color={planet.color} transparent opacity={0.2} />
            </mesh>
        );
    });

    return (
        <group ref={navigationGroupRef}>
            {orbitalPaths}
            {navigationPlanets.map((planet) => (
                <group key={planet.id} position={planet.position}>
                    <EnhancedPlanetButton
                        position={[0, 0, 0]}
                        planetType={planet.type}
                        size={planet.size}
                        atmosphere={planet.atmosphere}
                        rings={planet.rings}
                        onClick={() => handlePlanetClick(planet.path, planet.label, planet.position)}
                        customColor={planet.color}
                        label={planet.label}
                        zodiacSign={planet.zodiacSign}
                        isActive={router.pathname === planet.path}
                    />
                </group>
            ))}
        </group>
    );
};
