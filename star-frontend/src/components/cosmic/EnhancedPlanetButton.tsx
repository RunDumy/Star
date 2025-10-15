import { a, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';

// Simple particle component for zodiac effects
const ZodiacParticles: React.FC<{
    count: number;
    size: number;
    color: string;
}> = ({ count, size, color }) => {
    const particlesRef = useRef<THREE.Points>(null);

    // Simple particle system using instanced mesh or basic approach
    return (
        <group>
            {Array.from({ length: Math.min(count, 20) }, (_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3,
                    ]}
                >
                    <sphereGeometry args={[size, 8, 8]} />
                    <meshBasicMaterial color={color} transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
};

interface EnhancedPlanetButtonProps {
    position: [number, number, number];
    planetType: 'rocky' | 'gas' | 'ice' | 'desert';
    size?: number;
    atmosphere?: boolean;
    rings?: boolean;
    onClick: () => void;
    isActive?: boolean;
    customColor?: string;
    label?: string;
    zodiacSign?: string; // New prop for zodiac-specific effects
}

export const EnhancedPlanetButton: React.FC<EnhancedPlanetButtonProps> = ({
    position,
    planetType,
    size = 1,
    atmosphere = false,
    rings = false,
    onClick,
    isActive = false,
    customColor,
    label,
    zodiacSign,
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Spring animations for scale and glow - get values
    const { scale, glowIntensity } = useSpring({
        scale: isActive ? size * 1.4 : hovered ? size * 1.2 : size,
        glowIntensity: isActive ? 1.5 : hovered ? 1.0 : 0.3,
        config: { mass: 1, tension: 280, friction: 60 },
    });

    // Zodiac-specific particle effects - Elemental Color Theme
    const getParticleConfig = () => {
        const zodiacEffects: Record<string, any> = {
            // Fire signs - Red tones
            Aries: { color: '#ef4444', count: 50, size: 0.05, type: 'fire' },
            Leo: { color: '#ef4444', count: 50, size: 0.05, type: 'fire' },
            Sagittarius: { color: '#ef4444', count: 50, size: 0.05, type: 'fire' },

            // Earth signs - Brown tones (WCAG AA compliant)
            Taurus: { color: '#92400e', count: 40, size: 0.07, type: 'earth' },
            Virgo: { color: '#92400e', count: 40, size: 0.07, type: 'earth' },
            Capricorn: { color: '#92400e', count: 40, size: 0.07, type: 'earth' },

            // Air signs - Cyan tones
            Gemini: { color: '#06b6d4', count: 60, size: 0.04, type: 'air' },
            Libra: { color: '#06b6d4', count: 60, size: 0.04, type: 'air' },
            Aquarius: { color: '#06b6d4', count: 60, size: 0.04, type: 'air' },

            // Water signs - Blue tones (accessible)
            Cancer: { color: '#3b82f6', count: 50, size: 0.06, type: 'water' },
            Scorpio: { color: '#3b82f6', count: 50, size: 0.06, type: 'water' },
            Pisces: { color: '#3b82f6', count: 50, size: 0.06, type: 'water' },
        };
        return zodiacSign ? zodiacEffects[zodiacSign] || { color: '#fbbf24', count: 30, size: 0.05, type: 'default' } : { color: '#fbbf24', count: 30, size: 0.05, type: 'default' };
    };

    const planetConfig = () => {
        const baseConfig = {
            rocky: { color: '#f59e0b', emissive: '#d97706' }, // Yellow-gold for rocky planets
            gas: { color: '#06b6d4', emissive: '#0891b2' },   // Cyan for gas giants
            ice: { color: '#0284c7', emissive: '#0369a1' },   // Deep cyan for ice worlds
            desert: { color: '#f97316', emissive: '#ea580c' }, // Orange for desert planets
        };
        const config = baseConfig[planetType];
        return customColor ? { ...config, color: customColor, emissive: customColor } : config;
    };

    const { color, emissive } = planetConfig();
    const particleConfig = getParticleConfig();

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Subtle rotation and floating
            meshRef.current.rotation.y += delta * 0.3;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Main Planet */}
            <a.mesh
                ref={meshRef}
                scale={scale}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                castShadow
                receiveShadow
            >
                <sphereGeometry args={[1, 32, 32]} />
                <a.meshStandardMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={glowIntensity}
                    roughness={0.7}
                    metalness={0.3}
                />
            </a.mesh>

            {/* Atmosphere Glow */}
            {atmosphere && (
                <mesh scale={1.3}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshBasicMaterial
                        color={emissive}
                        transparent
                        opacity={hovered ? 0.2 : 0.1}
                    />
                </mesh>
            )}

            {/* Planetary Rings */}
            {rings && (
                <mesh rotation={[Math.PI / 3, 0, 0]}>
                    <ringGeometry args={[1.8, 2.5, 64]} />
                    <meshBasicMaterial
                        color={emissive}
                        transparent
                        opacity={hovered ? 0.6 : 0.4}
                        side={2}
                    />
                </mesh>
            )}

            {/* Zodiac Particle Effects on Hover */}
            {hovered && (
                <ZodiacParticles
                    count={particleConfig.count}
                    size={particleConfig.size}
                    color={particleConfig.color}
                />
            )}

            {/* Planet Label */}
            {label && (
                <Text
                    position={[0, -1.8, 0]}
                    fontSize={0.3}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            )}

            {/* Interactive Glow */}
            <a.pointLight
                color={emissive}
                intensity={glowIntensity}
                distance={8}
                decay={2}
            />
        </group>
    );
};
