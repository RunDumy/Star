import { useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';

interface EnhancedPlanetButtonProps {
    position: [number, number, number];
    size: number;
    color: string;
    glowColor: string;
    icon: string;
    label: string;
    onClick: () => void;
    isSelected?: boolean;
    isCurrent?: boolean;
    rotationSpeed?: number;
}

export const EnhancedPlanetButton: React.FC<EnhancedPlanetButtonProps> = ({
    position,
    size,
    color,
    glowColor,
    icon,
    label,
    onClick,
    isSelected = false,
    isCurrent = false,
    rotationSpeed = 0.01
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Animation loop
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += rotationSpeed;
        }

        // Pulse animation for selected/current planets
        const time = state.clock.getElapsedTime();
        const pulseScale = isSelected ? 1 + Math.sin(time * 3) * 0.1 : 1;
        const currentScale = isCurrent ? 1.1 : 1;
        const hoverScale = hovered ? 1.05 : 1;

        const finalScale = pulseScale * currentScale * hoverScale;

        if (meshRef.current) {
            meshRef.current.scale.setScalar(finalScale);
        }

        // Glow animation
        if (glowRef.current) {
            const glowIntensity = isSelected ? 0.6 : isCurrent ? 0.4 : hovered ? 0.3 : 0.1;
            const glowScale = size * (1.2 + Math.sin(time * 2) * 0.1);
            glowRef.current.scale.setScalar(glowScale);
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity;
        }

        // Ring rotation
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.005;
        }
    });

    const handlePointerOver = () => setHovered(true);
    const handlePointerOut = () => setHovered(false);

    return (
        <group position={position}>
            {/* Main planet mesh */}
            <mesh
                ref={meshRef}
                onClick={onClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <sphereGeometry args={[size, 32, 32]} />
                <meshPhongMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isSelected ? 0.3 : isCurrent ? 0.15 : 0.05}
                    shininess={100}
                />
            </mesh>

            {/* Atmosphere glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[size * 1.3, 16, 16]} />
                <meshBasicMaterial
                    color={glowColor}
                    transparent={true}
                    opacity={0.1}
                />
            </mesh>

            {/* Selection ring */}
            {(isSelected || isCurrent) && (
                <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[size * 1.5, size * 1.7, 32]} />
                    <meshBasicMaterial
                        color={isSelected ? "#00FFFF" : "#FFD700"}
                        transparent={true}
                        opacity={0.8}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Hover indicator */}
            {hovered && (
                <mesh rotation={[0, 0, 0]}>
                    <ringGeometry args={[size * 1.8, size * 2.0, 32]} />
                    <meshBasicMaterial
                        color="#FFFFFF"
                        transparent={true}
                        opacity={0.6}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Planet icon overlay (simplified - could be enhanced with Text component) */}
            <mesh position={[0, size + 0.2, 0]}>
                <planeGeometry args={[size * 0.5, size * 0.5]} />
                <meshBasicMaterial
                    color="#FFFFFF"
                    transparent={true}
                    opacity={0.9}
                />
            </mesh>
        </group>
    );
};

export default EnhancedPlanetButton;