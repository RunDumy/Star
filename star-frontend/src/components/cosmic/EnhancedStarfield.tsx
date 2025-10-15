"use client";

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface StarLayer {
    count: number;
    depth: number;
    speed: number;
    size: number;
    color: THREE.Color;
}

interface EnhancedStarfieldProps {
    layers?: StarLayer[];
    enableTwinkling?: boolean;
    enableNebulae?: boolean;
    enableCosmicDust?: boolean;
}

const defaultLayers: StarLayer[] = [
    // Far stars - slow movement, deep space
    { count: 8000, depth: 2000, speed: 0.05, size: 0.3, color: new THREE.Color(0.7, 0.8, 1.0) },
    // Mid stars - medium movement
    { count: 4000, depth: 800, speed: 0.15, size: 0.8, color: new THREE.Color(1.0, 1.0, 0.9) },
    // Near stars - fast movement, close to camera
    { count: 2000, depth: 300, speed: 0.4, size: 1.2, color: new THREE.Color(1.0, 0.9, 0.7) },
    // Bright foreground stars
    { count: 500, depth: 150, speed: 0.8, size: 2.0, color: new THREE.Color(0.9, 0.95, 1.0) }
];

export const EnhancedStarfield: React.FC<EnhancedStarfieldProps> = ({
    layers = defaultLayers,
    enableTwinkling = true,
    enableNebulae = true,
    enableCosmicDust = true
}) => {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const nebulaRef = useRef<THREE.Points>(null);
    const dustRef = useRef<THREE.Points>(null);

    // Create star layers with proper geometries and materials
    const starLayers = useMemo(() => {
        return layers.map((layer, layerIndex) => {
            const positions = new Float32Array(layer.count * 3);
            const colors = new Float32Array(layer.count * 3);
            const sizes = new Float32Array(layer.count);

            for (let i = 0; i < layer.count; i++) {
                // Random spherical distribution
                const radius = layer.depth;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = radius * Math.cos(phi);

                // Color variation with star types
                const starType = Math.random();
                let brightness = 0.6 + Math.random() * 0.4;

                if (starType < 0.6) {
                    // Blue-white stars (hot)
                    colors[i * 3] = 0.7 * brightness;
                    colors[i * 3 + 1] = 0.8 * brightness;
                    colors[i * 3 + 2] = 1.0 * brightness;
                } else if (starType < 0.8) {
                    // Yellow-white stars (sun-like)
                    colors[i * 3] = 1.0 * brightness;
                    colors[i * 3 + 1] = 0.95 * brightness;
                    colors[i * 3 + 2] = 0.8 * brightness;
                } else {
                    // Red stars (cool)
                    colors[i * 3] = 1.0 * brightness;
                    colors[i * 3 + 1] = 0.4 * brightness;
                    colors[i * 3 + 2] = 0.3 * brightness;
                }

                sizes[i] = layer.size * (0.3 + Math.random() * 0.7);
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
                },
                vertexShader: `
                    uniform float uTime;
                    uniform float uPixelRatio;
                    attribute float size;
                    varying vec3 vColor;
                    
                    void main() {
                        vColor = color;
                        
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        
                        // ${enableTwinkling ? 'Twinkling effect' : 'Steady stars'}
                        float twinkle = ${enableTwinkling ? 'sin(uTime * 3.0 + position.x * 0.01 + position.z * 0.005) * 0.4 + 0.8' : '1.0'};
                        
                        gl_PointSize = size * uPixelRatio * twinkle * (400.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    
                    void main() {
                        vec2 center = gl_PointCoord - vec2(0.5);
                        float distanceToCenter = length(center);
                        
                        if (distanceToCenter > 0.5) discard;
                        
                        float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                        strength = pow(strength, 1.5);
                        
                        gl_FragColor = vec4(vColor, strength);
                    }
                `,
                transparent: true,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            return {
                geometry,
                material,
                speed: layer.speed,
                id: `star-layer-${layerIndex}`
            };
        });
    }, [layers, enableTwinkling]);

    // Create nebula system
    const nebulaSystem = useMemo(() => {
        if (!enableNebulae) return null;

        const nebulaCount = 800;
        const positions = new Float32Array(nebulaCount * 3);
        const colors = new Float32Array(nebulaCount * 3);
        const sizes = new Float32Array(nebulaCount);

        for (let i = 0; i < nebulaCount; i++) {
            const i3 = i * 3;

            // Create nebula clusters in different regions
            const clusterType = Math.floor(Math.random() * 3);
            let centerX, centerY, centerZ;

            switch (clusterType) {
                case 0:
                    centerX = 300 + Math.random() * 200;
                    centerY = (Math.random() - 0.5) * 400;
                    centerZ = (Math.random() - 0.5) * 400;
                    break;
                case 1:
                    centerX = -300 - Math.random() * 200;
                    centerY = (Math.random() - 0.5) * 400;
                    centerZ = (Math.random() - 0.5) * 400;
                    break;
                default:
                    centerX = (Math.random() - 0.5) * 600;
                    centerY = 300 + Math.random() * 200;
                    centerZ = (Math.random() - 0.5) * 400;
            }

            positions[i3] = centerX + (Math.random() - 0.5) * 150;
            positions[i3 + 1] = centerY + (Math.random() - 0.5) * 150;
            positions[i3 + 2] = centerZ + (Math.random() - 0.5) * 150;

            // Nebula colors (purple, blue, pink, teal)
            const nebulaType = Math.random();
            if (nebulaType < 0.3) {
                // Purple nebula
                colors[i3] = 0.6 + Math.random() * 0.4;
                colors[i3 + 1] = 0.2 + Math.random() * 0.3;
                colors[i3 + 2] = 1.0;
            } else if (nebulaType < 0.6) {
                // Pink nebula
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.2 + Math.random() * 0.4;
                colors[i3 + 2] = 0.7 + Math.random() * 0.3;
            } else if (nebulaType < 0.8) {
                // Teal nebula
                colors[i3] = 0.2 + Math.random() * 0.3;
                colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i3 + 2] = 0.9 + Math.random() * 0.1;
            } else {
                // Blue nebula
                colors[i3] = 0.1 + Math.random() * 0.2;
                colors[i3 + 1] = 0.3 + Math.random() * 0.4;
                colors[i3 + 2] = 1.0;
            }

            sizes[i] = Math.random() * 12 + 4;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                attribute float size;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Slow pulsing effect
                    float pulse = sin(uTime * 0.7 + position.y * 0.003) * 0.3 + 0.8;
                    
                    gl_PointSize = size * uPixelRatio * pulse * (600.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float distanceToCenter = length(center);
                    
                    // Soft circular gradient for nebula effect
                    float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    strength = pow(strength, 3.0);
                    
                    gl_FragColor = vec4(vColor, strength * 0.15);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return { geometry, material };
    }, [enableNebulae]);

    // Create cosmic dust system
    const dustSystem = useMemo(() => {
        if (!enableCosmicDust) return null;

        const dustCount = 3000;
        const positions = new Float32Array(dustCount * 3);
        const colors = new Float32Array(dustCount * 3);
        const sizes = new Float32Array(dustCount);

        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 1500;
            positions[i3 + 1] = (Math.random() - 0.5) * 1500;
            positions[i3 + 2] = (Math.random() - 0.5) * 1500;

            // Dust colors (golden, brownish, reddish)
            const dustType = Math.random();
            if (dustType < 0.6) {
                colors[i3] = 0.8 + Math.random() * 0.2;
                colors[i3 + 1] = 0.6 + Math.random() * 0.3;
                colors[i3 + 2] = 0.2 + Math.random() * 0.2;
            } else {
                colors[i3] = 0.7 + Math.random() * 0.2;
                colors[i3 + 1] = 0.5 + Math.random() * 0.2;
                colors[i3 + 2] = 0.3 + Math.random() * 0.3;
            }

            sizes[i] = Math.random() * 2 + 0.5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1.0,
            transparent: true,
            opacity: 0.08,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        return { geometry, material };
    }, [enableCosmicDust]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Update star layers
        starLayers.forEach((layer, index) => {
            if (layer.material.uniforms) {
                layer.material.uniforms.uTime.value = time;
            }
        });

        // Update nebula system
        if (nebulaSystem?.material && 'uniforms' in nebulaSystem.material) {
            (nebulaSystem.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
        }

        // Rotate the entire group for subtle movement
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.02;
            groupRef.current.rotation.x = Math.sin(time * 0.01) * 0.05;
        }

        // Rotate nebula independently
        if (nebulaRef.current) {
            nebulaRef.current.rotation.y = -time * 0.015;
            nebulaRef.current.rotation.z = time * 0.008;
        }

        // Rotate dust slowly
        if (dustRef.current) {
            dustRef.current.rotation.y = time * 0.005;
            dustRef.current.rotation.x = -time * 0.003;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Star layers */}
            {starLayers.map((layer) => (
                <points key={layer.id}>
                    <primitive object={layer.geometry} attach="geometry" />
                    <primitive object={layer.material} attach="material" />
                </points>
            ))}

            {/* Nebula system */}
            {nebulaSystem && (
                <points ref={nebulaRef}>
                    <primitive object={nebulaSystem.geometry} attach="geometry" />
                    <primitive object={nebulaSystem.material} attach="material" />
                </points>
            )}

            {/* Cosmic dust */}
            {dustSystem && (
                <points ref={dustRef}>
                    <primitive object={dustSystem.geometry} attach="geometry" />
                    <primitive object={dustSystem.material} attach="material" />
                </points>
            )}
        </group>
    );
};