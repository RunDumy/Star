import { animated as a, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';
import { getZodiacAnimation, getZodiacColor } from '../../utils/zodiacActions';

interface Particle {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
    life: number;
}

interface ZodiacAvatarProps {
    zodiacSign: string;
    position: [number, number, number];
    size?: number;
    action?: string;
    onActionComplete?: () => void;
    interactive?: boolean;
}

const ZodiacAvatar: React.FC<ZodiacAvatarProps> = ({
    zodiacSign,
    position,
    size = 1,
    action,
    onActionComplete,
    interactive = false
}) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isHovered, setIsHovered] = useState(false);

    const zodiacColor = getZodiacColor(zodiacSign);
    const animationConfig = action ? getZodiacAnimation(action) : null;

    // Spring animation for actions
    const springs = useSpring({
        scale: animationConfig?.scale || [1, 1, 1],
        position: animationConfig?.position || [0, 0, 0],
        rotation: animationConfig?.rotation || [0, 0, 0],
        emissiveIntensity: isHovered ? 0.4 : (animationConfig?.emissiveIntensity || 0.2),
        config: { duration: animationConfig?.duration || 300 },
        onRest: () => {
            if (animationConfig?.onRest) {
                // Apply rest state - handled by spring
            }
            onActionComplete?.();
        }
    });    // Handle particle creation and updates
    useFrame((state, delta) => {
        if (meshRef.current && animationConfig) {
            // Add particle effects during actions
            if (animationConfig.particles && particles.length === 0) {
                const particleConfig = animationConfig.particles;
                const newParticles: Particle[] = Array.from({ length: particleConfig.count }, (_, i) => {
                    const direction = particleConfig.direction || 'none';
                    let baseVelocity: [number, number, number] = [0, 0, 0];

                    switch (direction) {
                        case 'top':
                            baseVelocity = [0, particleConfig.speed, 0];
                            break;
                        case 'down':
                            baseVelocity = [0, -particleConfig.speed, 0];
                            break;
                        case 'forward':
                            baseVelocity = [0, 0, particleConfig.speed];
                            break;
                        case 'out': {
                            const angle = (Math.PI * 2 * i) / particleConfig.count;
                            baseVelocity = [
                                Math.cos(angle) * particleConfig.speed,
                                Math.sin(angle) * particleConfig.speed,
                                0
                            ];
                            break;
                        }
                        default:
                            baseVelocity = [
                                (Math.random() - 0.5) * particleConfig.speed,
                                (Math.random() - 0.5) * particleConfig.speed,
                                (Math.random() - 0.5) * particleConfig.speed
                            ];
                    }                    return {
                        id: i,
                        position: [
                            (Math.random() - 0.5) * 0.5,
                            (Math.random() - 0.5) * 0.5,
                            (Math.random() - 0.5) * 0.5
                        ] as [number, number, number],
                        velocity: baseVelocity,
                        life: 1
                    };
                });
                setParticles(newParticles);
            }
        }

        // Update particles
        setParticles(prev =>
            prev.map(p => ({
                ...p,
                position: [
                    p.position[0] + p.velocity[0] * delta,
                    p.position[1] + p.velocity[1] * delta,
                    p.position[2] + p.velocity[2] * delta
                ] as [number, number, number],
                life: p.life - delta * 2 // Particles fade over 0.5 seconds
            })).filter(p => p.life > 0)
        );
    });

    const handlePointerEnter = useCallback(() => {
        if (interactive) {
            setIsHovered(true);
        }
    }, [interactive]);

    const handlePointerLeave = useCallback(() => {
        if (interactive) {
            setIsHovered(false);
        }
    }, [interactive]);

    return (
        <group position={position}>
            <a.mesh
                ref={meshRef}
                scale={springs.scale}
                position={springs.position}
                rotation={springs.rotation}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
            >
                <sphereGeometry args={[0.5 * size, 32, 32]} />
                <a.meshStandardMaterial
                    color={zodiacColor}
                    emissive={zodiacColor}
                    emissiveIntensity={springs.emissiveIntensity}
                />
            </a.mesh>            {/* Particle effects */}
            {particles.map(particle => (
                <mesh key={particle.id} position={particle.position}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial
                        color={zodiacColor}
                        transparent
                        opacity={particle.life}
                    />
                </mesh>
            ))}

            {/* Zodiac glyph or symbol could be added here */}
            {isHovered && (
                <sprite position={[0, 1, 0]} scale={[0.8, 0.3, 1]}>
                    <spriteMaterial
                        transparent
                        opacity={0.8}
                        color="#ffffff"
                    />
                </sprite>
            )}
        </group>
    );
};

export default ZodiacAvatar;