"use client";

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface CosmicSpaceProps {
    children: React.ReactNode;
    starCount?: number;
    nebulaCount?: number;
    shootingStarCount?: number;
    backgroundColor?: string;
    enableLOD?: boolean;
}

export const CosmicSpace: React.FC<CosmicSpaceProps> = ({
    children,
    starCount = 25000,
    nebulaCount = 3,
    shootingStarCount = 3,
    backgroundColor = '#000000',
    enableLOD = true
}) => {
    const nebulaRefs = useRef<(THREE.Mesh | null)[]>([]);
    const shootingStarRefs = useRef<(THREE.Group | null)[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [devicePerformance, setDevicePerformance] = useState<'high' | 'medium' | 'low'>('high');

    // Performance detection
    useEffect(() => {
        const checkDevice = () => {
            const mobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);

            // Simple performance detection
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
                const isLowEnd = /intel.*integrated|radeon.*vega|geforce.*9|geforce.*1\d\d/i.test(renderer.toLowerCase());
                setDevicePerformance(isLowEnd ? 'low' : mobile ? 'medium' : 'high');
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Adjust counts based on performance
    const adjustedStarCount = useMemo(() => {
        if (!enableLOD) return starCount;
        switch (devicePerformance) {
            case 'low': return Math.min(starCount * 0.1, 1000);
            case 'medium': return Math.min(starCount * 0.3, 5000);
            default: return starCount;
        }
    }, [starCount, devicePerformance, enableLOD]);

    const adjustedNebulaCount = useMemo(() => {
        if (!enableLOD) return nebulaCount;
        return devicePerformance === 'low' ? 1 : nebulaCount;
    }, [nebulaCount, devicePerformance, enableLOD]);

    const adjustedShootingStarCount = useMemo(() => {
        if (!enableLOD) return shootingStarCount;
        return devicePerformance === 'low' ? 0 : shootingStarCount;
    }, [shootingStarCount, devicePerformance, enableLOD]);

    // Enhanced starfield with procedural generation
    const starfield = useMemo(() => {
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            // Spherical distribution for more realistic starfield
            const radius = 100 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            // Varied star colors (white, blue, yellow, red)
            const starType = Math.random();
            if (starType < 0.7) {
                // White stars
                colors[i3] = 1;
                colors[i3 + 1] = 1;
                colors[i3 + 2] = 1;
            } else if (starType < 0.85) {
                // Blue stars
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1;
            } else if (starType < 0.95) {
                // Yellow stars
                colors[i3] = 1;
                colors[i3 + 1] = 1;
                colors[i3 + 2] = 0.8;
            } else {
                // Red stars
                colors[i3] = 1;
                colors[i3 + 1] = 0.6;
                colors[i3 + 2] = 0.4;
            }
        }

        return { positions, colors };
    }, [starCount]);

    // Nebula generation
    const nebulae = useMemo(() => {
        return Array.from({ length: nebulaCount }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 400
            ] as [number, number, number],
            color: [
                Math.random() * 0.5 + 0.2, // R
                Math.random() * 0.5 + 0.2, // G
                Math.random() * 0.8 + 0.2  // B
            ] as [number, number, number],
            scale: Math.random() * 2 + 1,
            rotationSpeed: (Math.random() - 0.5) * 0.01
        }));
    }, [nebulaCount]);

    // Shooting stars
    const shootingStars = useMemo(() => {
        return Array.from({ length: shootingStarCount }, (_, i) => ({
            startPosition: [
                (Math.random() - 0.5) * 600,
                200 + Math.random() * 200,
                (Math.random() - 0.5) * 600
            ] as [number, number, number],
            endPosition: [
                (Math.random() - 0.5) * 600,
                -200 - Math.random() * 200,
                (Math.random() - 0.5) * 600
            ] as [number, number, number],
            speed: Math.random() * 0.02 + 0.01,
            delay: Math.random() * 20
        }));
    }, [shootingStarCount]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Animate nebulae
        nebulaRefs.current.forEach((nebula, i) => {
            if (nebula) {
                nebula.rotation.x += nebulae[i].rotationSpeed;
                nebula.rotation.y += nebulae[i].rotationSpeed * 0.7;
                nebula.rotation.z += nebulae[i].rotationSpeed * 0.5;

                // Subtle pulsing
                const pulse = Math.sin(time * 0.5 + i) * 0.1 + 1;
                nebula.scale.setScalar(nebulae[i].scale * pulse);
            }
        });

        // Animate shooting stars
        shootingStarRefs.current.forEach((star, i) => {
            if (star) {
                const progress = ((time * shootingStars[i].speed) + shootingStars[i].delay) % 1;
                const easedProgress = easeInOutCubic(progress);

                star.position.x = THREE.MathUtils.lerp(
                    shootingStars[i].startPosition[0],
                    shootingStars[i].endPosition[0],
                    easedProgress
                );
                star.position.y = THREE.MathUtils.lerp(
                    shootingStars[i].startPosition[1],
                    shootingStars[i].endPosition[1],
                    easedProgress
                );
                star.position.z = THREE.MathUtils.lerp(
                    shootingStars[i].startPosition[2],
                    shootingStars[i].endPosition[2],
                    easedProgress
                );

                // Fade in/out
                const opacity = Math.sin(progress * Math.PI);
                star.children.forEach((child) => {
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
                        child.material.opacity = opacity;
                    }
                });
            }
        });
    });

    // Easing function for smooth shooting star movement
    const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    return (
        <group>
            {/* Background */}
            <color attach="background" args={[backgroundColor]} />

            {/* Enhanced Starfield */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={starfield.positions}
                        count={starCount}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        array={starfield.colors}
                        count={starCount}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={2}
                    vertexColors
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Nebulae */}
            {nebulae.map((nebula, i) => (
                <mesh
                    key={`nebula-${i}`}
                    ref={(el) => { nebulaRefs.current[i] = el; }}
                    position={nebula.position}
                >
                    <sphereGeometry args={[50, 32, 32]} />
                    <meshBasicMaterial
                        color={nebula.color}
                        transparent
                        opacity={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Shooting Stars */}
            {shootingStars.map((star, i) => (
                <group key={`shooting-star-${i}`} ref={(el) => { shootingStarRefs.current[i] = el; }}>
                    <mesh>
                        <sphereGeometry args={[0.5, 8, 8]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
                    </mesh>
                    <mesh>
                        <cylinderGeometry args={[0, 0.2, 20, 8]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={0}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                </group>
            ))}

            {/* Render children (planets, interfaces, etc.) */}
            {children}
        </group>
    );
};