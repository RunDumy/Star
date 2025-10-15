"use client";

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { PlanetButton } from './PlanetButton';

interface PlanetData {
    id: string;
    name: string;
    position: [number, number, number];
    orbitRadius: number;
    orbitSpeed: number;
    orbitOffset: number;
    size: number;
    color: string;
    planetType: 'rocky' | 'gas' | 'ice' | 'desert' | 'ocean' | 'volcanic';
    hasAtmosphere?: boolean;
    hasRings?: boolean;
    onClick?: () => void;
}

interface Enhanced3DPlanetSystemProps {
    planets?: PlanetData[];
}

const defaultPlanets: PlanetData[] = [
    {
        id: 'venus',
        name: 'Venus',
        position: [8, 2, -5],
        orbitRadius: 12,
        orbitSpeed: 0.3,
        orbitOffset: 0,
        size: 0.8,
        color: '#FFD700',
        planetType: 'rocky',
        hasAtmosphere: true,
    },
    {
        id: 'mars',
        name: 'Mars',
        position: [-6, -3, 8],
        orbitRadius: 18,
        orbitSpeed: 0.2,
        orbitOffset: Math.PI / 3,
        size: 0.7,
        color: '#CD5C5C',
        planetType: 'desert',
        hasAtmosphere: true,
    },
    {
        id: 'jupiter',
        name: 'Jupiter',
        position: [12, 5, -12],
        orbitRadius: 25,
        orbitSpeed: 0.1,
        orbitOffset: Math.PI / 2,
        size: 2.5,
        color: '#DAA520',
        planetType: 'gas',
        hasAtmosphere: true,
        hasRings: true,
    },
    {
        id: 'saturn',
        name: 'Saturn',
        position: [-15, -2, 6],
        orbitRadius: 32,
        orbitSpeed: 0.08,
        orbitOffset: Math.PI,
        size: 2.2,
        color: '#FAD5A5',
        planetType: 'gas',
        hasAtmosphere: true,
        hasRings: true,
    },
    {
        id: 'neptune',
        name: 'Neptune',
        position: [5, -8, -18],
        orbitRadius: 40,
        orbitSpeed: 0.05,
        orbitOffset: Math.PI * 1.5,
        size: 1.8,
        color: '#4B9CD3',
        planetType: 'ice',
        hasAtmosphere: true,
    },
    {
        id: 'pluto',
        name: 'Pluto',
        position: [-8, 10, 15],
        orbitRadius: 48,
        orbitSpeed: 0.03,
        orbitOffset: Math.PI * 0.7,
        size: 0.4,
        color: '#8B7355',
        planetType: 'ice',
    },
];

export const Enhanced3DPlanetSystem: React.FC<Enhanced3DPlanetSystemProps> = ({
    planets = defaultPlanets
}) => {
    const groupRef = useRef<THREE.Group>(null);

    // Calculate orbital positions for each planet
    const orbitalPositions = useMemo(() => {
        return planets.map(planet => ({
            ...planet,
            currentAngle: planet.orbitOffset,
        }));
    }, [planets]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;

        // Update orbital positions
        orbitalPositions.forEach((planet, index) => {
            const angle = planet.orbitOffset + time * planet.orbitSpeed;

            // Calculate elliptical orbit with some variation
            const eccentricity = 0.2 + Math.sin(index) * 0.1; // Slight eccentricity variation
            const radiusX = planet.orbitRadius * (1 + eccentricity * Math.cos(angle));
            const radiusZ = planet.orbitRadius * (1 + eccentricity * Math.sin(angle));

            // Add vertical oscillation for more dynamic movement
            const verticalOffset = Math.sin(angle * 2 + index) * 2;

            const x = Math.cos(angle) * radiusX;
            const y = planet.position[1] + verticalOffset;
            const z = Math.sin(angle) * radiusZ;

            // Update planet position
            const planetMesh = groupRef.current!.children[index] as THREE.Group;
            if (planetMesh) {
                planetMesh.position.set(x, y, z);

                // Add slight axial tilt and rotation
                planetMesh.rotation.x = Math.sin(time * 0.1 + index) * 0.1;
                planetMesh.rotation.z = Math.cos(time * 0.15 + index) * 0.05;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {orbitalPositions.map((planet) => (
                <PlanetButton
                    key={planet.id}
                    position={planet.position}
                    label={planet.name}
                    size={planet.size}
                    color={planet.color}
                    planetType={planet.planetType}
                    hasAtmosphere={planet.hasAtmosphere}
                    hasRings={planet.hasRings}
                    orbitSpeed={planet.orbitSpeed * 2} // Faster rotation for visual appeal
                    onClick={planet.onClick}
                />
            ))}
        </group>
    );
};