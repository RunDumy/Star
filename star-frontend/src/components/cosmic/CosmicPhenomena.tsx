"use client";

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface CosmicPhenomenaProps {
    enableShootingStars?: boolean;
    enableAsteroids?: boolean;
    enableDistantGalaxies?: boolean;
    enablePulsars?: boolean;
}

// Shooting Star Component using particles for better compatibility
const ShootingStar: React.FC<{
    position: [number, number, number];
    color: string;
}> = ({ position, color }) => {
    const starRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (starRef.current) {
            // Move shooting star across the sky
            const time = state.clock.elapsedTime;
            starRef.current.position.x = position[0] + Math.cos(time * 0.5) * 200;
            starRef.current.position.y = position[1] + Math.sin(time * 0.3) * 50;
            starRef.current.position.z = position[2] + Math.sin(time * 0.8) * 300;

            // Create trail effect with opacity
            const opacity = Math.sin(time * 3) * 0.5 + 0.5;
            (starRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
        }
    });

    return (
        <mesh ref={starRef} position={position}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial
                color={color}
                transparent={true}
                opacity={0.8}
            />
        </mesh>
    );
};

// Asteroid Field Component
const AsteroidField: React.FC<{ count: number }> = ({ count }) => {
    const asteroidsRef = useRef<THREE.InstancedMesh>(null);

    const { geometry, material } = useMemo(() => {
        const geo = new THREE.DodecahedronGeometry(1, 0);
        const mat = new THREE.MeshStandardMaterial({
            color: '#8B4513',
            roughness: 0.9,
            metalness: 0.1
        });
        return { geometry: geo, material: mat };
    }, []);

    const asteroidData = useMemo(() => {
        return Array.from({ length: count }, () => ({
            position: [
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 2000
            ],
            rotation: [
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            ],
            rotationSpeed: [
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ],
            scale: 0.3 + Math.random() * 1.2
        }));
    }, [count]);

    useFrame((_, delta) => {
        if (asteroidsRef.current) {
            asteroidData.forEach((asteroid, i) => {
                // Update rotation
                asteroid.rotation[0] += asteroid.rotationSpeed[0] * delta * 60;
                asteroid.rotation[1] += asteroid.rotationSpeed[1] * delta * 60;
                asteroid.rotation[2] += asteroid.rotationSpeed[2] * delta * 60;

                // Set matrix for this instance
                const matrix = new THREE.Matrix4();
                const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...asteroid.rotation));
                matrix.compose(
                    new THREE.Vector3(...asteroid.position),
                    quaternion,
                    new THREE.Vector3(asteroid.scale, asteroid.scale, asteroid.scale)
                );
                asteroidsRef.current!.setMatrixAt(i, matrix);
            });
            asteroidsRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={asteroidsRef} args={[geometry, material, count]}>
            <primitive object={geometry} attach="geometry" />
            <primitive object={material} attach="material" />
        </instancedMesh>
    );
};

// Distant Galaxy Component
const DistantGalaxy: React.FC<{
    position: [number, number, number];
    rotation: number;
    color: string;
    scale: number;
}> = ({ position, rotation, color, scale }) => {
    const galaxyRef = useRef<THREE.Points>(null);

    const { geometry, material } = useMemo(() => {
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        const galaxyColor = new THREE.Color(color);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Create spiral galaxy pattern
            const radius = Math.random() * 50;
            const spinAngle = radius * 0.3 + Math.random() * 0.5;
            const branchAngle = (i % 3) * (Math.PI * 2 / 3);

            const angle = branchAngle + spinAngle;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 10;

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            // Color gradient from center
            const distanceFromCenter = radius / 50;
            const brightness = 1 - distanceFromCenter * 0.7;

            colors[i3] = galaxyColor.r * brightness;
            colors[i3 + 1] = galaxyColor.g * brightness;
            colors[i3 + 2] = galaxyColor.b * brightness;

            sizes[i] = Math.random() * 2 + 0.5;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            size: 1.5,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return { geometry: geo, material: mat };
    }, [color]);

    useFrame((state) => {
        if (galaxyRef.current) {
            galaxyRef.current.rotation.y = rotation + state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <points ref={galaxyRef} position={position} scale={[scale, scale, scale]}>
            <bufferGeometry attach="geometry" {...geometry} />
            <primitive object={material} attach="material" />
        </points>
    );
};

// Pulsar Component
const Pulsar: React.FC<{
    position: [number, number, number];
    color: string;
    pulseSpeed: number;
}> = ({ position, color, pulseSpeed }) => {
    const pulsarRef = useRef<THREE.Mesh>(null);
    const beamRef = useRef<THREE.Mesh>(null);

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(color) },
                uPulseSpeed: { value: pulseSpeed }
            },
            vertexShader: `
        uniform float uTime;
        uniform float uPulseSpeed;
        varying vec3 vPosition;
        
        void main() {
          vPosition = position;
          
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
        }
      `,
            fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uPulseSpeed;
        varying vec3 vPosition;
        
        void main() {
          float pulse = sin(uTime * uPulseSpeed) * 0.5 + 0.5;
          float intensity = pulse * (2.0 - length(vPosition));
          
          gl_FragColor = vec4(uColor, intensity);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
    }, [color, pulseSpeed]);

    useFrame((state) => {
        if (material.uniforms) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }

        if (pulsarRef.current) {
            const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3 + 1;
            pulsarRef.current.scale.setScalar(pulse);
        }

        if (beamRef.current) {
            beamRef.current.rotation.y = state.clock.elapsedTime * pulseSpeed * 0.5;
        }
    });

    return (
        <group position={position}>
            {/* Pulsar core */}
            <mesh ref={pulsarRef}>
                <sphereGeometry args={[2, 16, 16]} />
                <primitive object={material} attach="material" />
            </mesh>

            {/* Pulsar beam */}
            <mesh ref={beamRef}>
                <cylinderGeometry args={[0.2, 0.2, 100, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </group>
    );
};

export const CosmicPhenomena: React.FC<CosmicPhenomenaProps> = ({
    enableShootingStars = true,
    enableAsteroids = true,
    enableDistantGalaxies = true,
    enablePulsars = true
}) => {
    // Generate shooting stars
    const shootingStars = useMemo(() => {
        if (!enableShootingStars) return [];

        return Array.from({ length: 5 }, (_, i) => ({
            id: i,
            startPos: [
                (Math.random() - 0.5) * 1000,
                200 + Math.random() * 200,
                (Math.random() - 0.5) * 1000
            ] as [number, number, number],
            endPos: [
                (Math.random() - 0.5) * 1000,
                -200 - Math.random() * 200,
                (Math.random() - 0.5) * 1000
            ] as [number, number, number],
            speed: 0.3 + Math.random() * 0.7,
            color: ['#ffffff', '#ffdd44', '#44ddff', '#dd44ff'][Math.floor(Math.random() * 4)]
        }));
    }, [enableShootingStars]);

    // Generate distant galaxies
    const galaxies = useMemo(() => {
        if (!enableDistantGalaxies) return [];

        return Array.from({ length: 3 }, (_, i) => ({
            id: i,
            position: [
                (Math.random() - 0.5) * 3000,
                (Math.random() - 0.5) * 1000,
                -1500 - Math.random() * 1000
            ] as [number, number, number],
            rotation: Math.random() * Math.PI * 2,
            color: ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4'][Math.floor(Math.random() * 4)],
            scale: 0.5 + Math.random() * 1
        }));
    }, [enableDistantGalaxies]);

    // Generate pulsars
    const pulsars = useMemo(() => {
        if (!enablePulsars) return [];

        return Array.from({ length: 2 }, (_, i) => ({
            id: i,
            position: [
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 500,
                -800 - Math.random() * 800
            ] as [number, number, number],
            color: ['#00ffff', '#ff00ff'][i],
            pulseSpeed: 8 + Math.random() * 4
        }));
    }, [enablePulsars]);

    return (
        <group>
            {/* Shooting Stars */}
            {shootingStars.map(star => (
                <ShootingStar
                    key={star.id}
                    position={star.startPos}
                    color={star.color}
                />
            ))}

            {/* Asteroid Field */}
            {enableAsteroids && <AsteroidField count={150} />}

            {/* Distant Galaxies */}
            {galaxies.map(galaxy => (
                <DistantGalaxy
                    key={galaxy.id}
                    position={galaxy.position}
                    rotation={galaxy.rotation}
                    color={galaxy.color}
                    scale={galaxy.scale}
                />
            ))}

            {/* Pulsars */}
            {pulsars.map(pulsar => (
                <Pulsar
                    key={pulsar.id}
                    position={pulsar.position}
                    color={pulsar.color}
                    pulseSpeed={pulsar.pulseSpeed}
                />
            ))}
        </group>
    );
};