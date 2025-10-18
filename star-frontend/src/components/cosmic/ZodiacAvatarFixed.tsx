import { animated as a, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import { getZodiacActions, getZodiacAnimation, getZodiacColor } from '../../utils/zodiacActions';

interface Particle {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
    life: number;
}

interface ZodiacAvatarProps {
    zodiacSign: string;
    tradition: string;
    position?: [number, number, number];
    size?: number;
    onAction?: (action: string) => void;
}

const ZodiacAvatar: React.FC<ZodiacAvatarProps> = ({
    zodiacSign,
    tradition,
    position = [0, 0, 0],
    size = 1,
    onAction
}) => {
    const meshRef = useRef<any>(null);
    const groupRef = useRef<any>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    // Get zodiac configuration
    const zodiacColor = useMemo(() => getZodiacColor(zodiacSign), [zodiacSign]);
    const animationConfig = useMemo(() => getZodiacAnimation(zodiacSign), [zodiacSign]);
    const zodiacActions = useMemo(() => getZodiacActions(zodiacSign), [zodiacSign]);

    // Spring animations with proper type casting
    const { scale, rotation } = useSpring({
        scale: isAnimating ? 1.2 : 1,
        rotation: isAnimating ? Math.PI * 2 : 0,
        config: { tension: 300, friction: 30 }
    });

    // Particle system animation
    useFrame((state, delta) => {
        if (particles.length > 0) {
            setParticles(prevParticles =>
                prevParticles
                    .map(particle => ({
                        ...particle,
                        position: [
                            particle.position[0] + particle.velocity[0] * delta,
                            particle.position[1] + particle.velocity[1] * delta,
                            particle.position[2] + particle.velocity[2] * delta
                        ] as [number, number, number],
                        life: particle.life - delta
                    }))
                    .filter(particle => particle.life > 0)
            );
        }

        // Rotate mesh
        if (meshRef.current && isAnimating) {
            meshRef.current.rotation.y += delta;
        }
    });

    // Trigger zodiac action
    const triggerAction = () => {
        if (!isAnimating && animationConfig) {
            setIsAnimating(true);

            // Create particles if configuration exists
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
                    }

                    return {
                        id: i,
                        position: [0, 0, 0] as [number, number, number],
                        velocity: baseVelocity,
                        life: 1
                    };
                });
                setParticles(newParticles);
            }

            // Call action callback
            if (onAction && zodiacActions) {
                const actionKeys = ['comment', 'like', 'follow', 'share'] as const;
                const randomKey = actionKeys[Math.floor(Math.random() * actionKeys.length)];
                const randomAction = zodiacActions[randomKey];
                onAction(randomAction);
            }

            // Reset animation after duration
            setTimeout(() => {
                setIsAnimating(false);
                setParticles([]);
            }, animationConfig?.duration || 1000);
        }
    };

    return (
        <group ref={groupRef} position={position} onClick={triggerAction}>
            {/* Main zodiac avatar */}
            <a.mesh
                ref={meshRef}
                scale={scale}
                onPointerOver={() => meshRef.current && meshRef.current.material && (meshRef.current.material.emissive.setHex(0x222222))}
                onPointerOut={() => meshRef.current && meshRef.current.material && (meshRef.current.material.emissive.setHex(0x000000))}
            >
                <sphereGeometry args={[0.5 * size, 32, 32]} />
                <meshStandardMaterial
                    color={zodiacColor}
                    transparent
                    opacity={0.8}
                />
            </a.mesh>

            {/* Particle effects */}
            {particles.map((particle) => (
                <mesh key={particle.id} position={particle.position}>
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial
                        color={zodiacColor}
                        transparent
                        opacity={particle.life}
                    />
                </mesh>
            ))}

            {/* Zodiac label */}
            {isAnimating && zodiacSign && (
                <group position={[0, 1 * size, 0]}>
                    <mesh>
                        <planeGeometry args={[1, 0.3]} />
                        <meshBasicMaterial
                            color={zodiacColor}
                            transparent
                            opacity={0.8}
                        />
                    </mesh>
                </group>
            )}
        </group>
    );
};

export default ZodiacAvatar;