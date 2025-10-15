"use client";

import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface OrbitSystemProps {
    children: React.ReactNode;
    enableDrag?: boolean;
    dragSpeed?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    centerMass?: boolean; // Add a central gravitational body
    orbitalRadius?: number; // Base orbital radius
    orbitalSpacing?: number; // Space between orbital rings
}

interface PlanetData {
    element: React.ReactElement;
    orbitRadius: number;
    orbitSpeed: number;
    orbitAngle: number;
    inclination: number; // Orbital plane inclination
    eccentricity: number; // Orbital eccentricity for elliptical orbits
}

export const Enhanced3DOrbitSystem: React.FC<OrbitSystemProps> = ({
    children,
    enableDrag = true,
    dragSpeed = 0.01,
    autoRotate = true,
    autoRotateSpeed = 0.002,
    centerMass = true,
    orbitalRadius = 15,
    orbitalSpacing = 8
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const planetGroupRef = useRef<THREE.Group>(null);
    const { gl } = useThree();
    const [isDragging, setIsDragging] = useState(false);
    const [previousMouse, setPreviousMouse] = useState({ x: 0, y: 0 });

    // Convert children to planet data with orbital parameters
    const planetsData = useRef<PlanetData[]>([]);

    // Initialize planet orbital data
    useEffect(() => {
        if (children) {
            const childrenArray = React.Children.toArray(children);
            planetsData.current = childrenArray.map((child, index) => ({
                element: child as React.ReactElement,
                orbitRadius: orbitalRadius + (index * orbitalSpacing),
                orbitSpeed: 0.5 / (1 + index * 0.3), // Outer planets orbit slower
                orbitAngle: (Math.PI * 2 * index) / childrenArray.length, // Evenly distribute initially
                inclination: (Math.random() - 0.5) * 0.3, // Random orbital plane inclination
                eccentricity: Math.random() * 0.2 // Slight elliptical orbits
            }));
        }
    }, [children, orbitalRadius, orbitalSpacing]);

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!enableDrag) return;
        setIsDragging(true);
        setPreviousMouse({ x: e.clientX, y: e.clientY });
        gl.domElement.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!isDragging || !enableDrag || !groupRef.current) return;

        const deltaX = e.clientX - previousMouse.x;
        const deltaY = e.clientY - previousMouse.y;

        // Apply rotation to the entire system
        groupRef.current.rotation.y += deltaX * dragSpeed;
        groupRef.current.rotation.x += deltaY * dragSpeed;

        setPreviousMouse({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
        if (!enableDrag) return;
        setIsDragging(false);
        gl.domElement.style.cursor = 'grab';
    };

    const handlePointerLeave = () => {
        if (isDragging) {
            handlePointerUp();
        }
    };

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Update planetary positions based on orbital mechanics
        if (planetGroupRef.current && planetsData.current.length > 0) {
            planetsData.current.forEach((planetData, index) => {
                const planetMesh = planetGroupRef.current!.children[index];
                if (planetMesh) {
                    // Update orbital angle based on orbital speed
                    planetData.orbitAngle += planetData.orbitSpeed * 0.01;

                    // Calculate elliptical orbit position
                    const a = planetData.orbitRadius; // Semi-major axis
                    const e = planetData.eccentricity; // Eccentricity
                    const angle = planetData.orbitAngle;

                    // Elliptical orbit calculation
                    const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));

                    // Base position in orbital plane
                    const x = r * Math.cos(angle);
                    const z = r * Math.sin(angle);
                    const y = Math.sin(angle + time * 0.5) * 2; // Slight vertical oscillation

                    // Apply orbital inclination
                    const inclinedX = x;
                    const inclinedY = y * Math.cos(planetData.inclination) - z * Math.sin(planetData.inclination);
                    const inclinedZ = y * Math.sin(planetData.inclination) + z * Math.cos(planetData.inclination);

                    planetMesh.position.set(inclinedX, inclinedY, inclinedZ);

                    // Make planets always face the center (like tidally locked moons)
                    planetMesh.lookAt(0, 0, 0);
                }
            });
        }

        // Add gentle auto-rotation when not dragging
        if (autoRotate && !isDragging && groupRef.current) {
            groupRef.current.rotation.y += autoRotateSpeed;

            // Add subtle precession
            groupRef.current.rotation.x += Math.sin(time * 0.1) * 0.0002;
            groupRef.current.rotation.z += Math.cos(time * 0.15) * 0.0001;
        }
    });

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
        >
            {/* Central mass (sun/star) */}
            {centerMass && (
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[2, 32, 32]} />
                    <meshStandardMaterial
                        color="#FDB813"
                        emissive="#FFA500"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.8}
                    />
                    {/* Sun corona effect */}
                    <mesh scale={[1.5, 1.5, 1.5]}>
                        <sphereGeometry args={[2, 16, 16]} />
                        <meshBasicMaterial
                            color="#FFD700"
                            transparent
                            opacity={0.1}
                            side={THREE.BackSide}
                        />
                    </mesh>
                </mesh>
            )}

            {/* Orbital rings for visual reference */}
            {planetsData.current.map((planetData, index) => (
                <mesh key={`orbit-${index}`} rotation={[Math.PI / 2, 0, planetData.inclination]}>
                    <ringGeometry args={[planetData.orbitRadius - 0.1, planetData.orbitRadius + 0.1, 64]} />
                    <meshBasicMaterial
                        color="#444444"
                        transparent
                        opacity={0.15}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Planets in orbital system */}
            <group ref={planetGroupRef}>
                {children}
            </group>
        </group>
    );
};