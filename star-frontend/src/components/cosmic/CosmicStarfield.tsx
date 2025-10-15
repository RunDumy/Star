"use client";

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface CosmicStarfieldProps {
    count?: number;
    radius?: number;
    enableTwinkling?: boolean;
    enableNebulae?: boolean;
}

export const CosmicStarfield: React.FC<CosmicStarfieldProps> = ({
    count = 12000,
    radius = 800,
    enableTwinkling = true,
    enableNebulae = true
}) => {
    const starsRef = useRef<THREE.Points>(null);
    const nebulaRef = useRef<THREE.Points>(null);
    const dustRef = useRef<THREE.Points>(null);

    // Enhanced star system with multiple layers
    const starGeometry = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spherical distribution for true 3D depth
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * (0.5 + Math.random() * 0.5); // Varying distances

            const i3 = i * 3;
            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);

            // Star classification colors
            const starClass = Math.random();
            if (starClass < 0.1) {
                // O-type stars (blue-white, very hot)
                colors[i3] = 0.7;
                colors[i3 + 1] = 0.8;
                colors[i3 + 2] = 1.0;
            } else if (starClass < 0.3) {
                // B-type stars (blue-white)
                colors[i3] = 0.8;
                colors[i3 + 1] = 0.9;
                colors[i3 + 2] = 1.0;
            } else if (starClass < 0.5) {
                // A-type stars (white)
                colors[i3] = 1.0;
                colors[i3 + 1] = 1.0;
                colors[i3 + 2] = 1.0;
            } else if (starClass < 0.7) {
                // G-type stars (yellow, like our Sun)
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.95;
                colors[i3 + 2] = 0.7;
            } else if (starClass < 0.9) {
                // K-type stars (orange)
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.7;
                colors[i3 + 2] = 0.4;
            } else {
                // M-type stars (red)
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.4;
                colors[i3 + 2] = 0.2;
            }

            // Brightness variation
            const brightness = 0.3 + Math.random() * 0.7;
            colors[i3] *= brightness;
            colors[i3 + 1] *= brightness;
            colors[i3 + 2] *= brightness;

            // Size based on distance and type
            const distance = Math.sqrt(positions[i3] ** 2 + positions[i3 + 1] ** 2 + positions[i3 + 2] ** 2);
            const sizeFactor = 1 - (distance / radius) * 0.8; // Closer stars appear larger
            sizes[i] = (0.5 + Math.random() * 2) * sizeFactor;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return geometry;
    }, [count, radius]);

    // Enhanced twinkling star material
    const starMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
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
          
          // Advanced twinkling with multiple frequencies
          float twinkle1 = sin(uTime * 4.0 + position.x * 0.02 + position.z * 0.01) * 0.3;
          float twinkle2 = sin(uTime * 2.5 + position.y * 0.015) * 0.2;
          float twinkle3 = sin(uTime * 6.0 + length(position) * 0.005) * 0.15;
          
          float totalTwinkle = ${enableTwinkling ? '0.5 + twinkle1 + twinkle2 + twinkle3' : '1.0'};
          totalTwinkle = clamp(totalTwinkle, 0.2, 1.2);
          
          gl_PointSize = size * uPixelRatio * totalTwinkle * (500.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float distanceToCenter = length(center);
          
          if (distanceToCenter > 0.5) discard;
          
          // Create star-like cross pattern for brighter stars
          float crossPattern = 1.0;
          if (length(vColor) > 2.0) {
            float horizontal = abs(center.x) < 0.05 ? 1.5 : 1.0;
            float vertical = abs(center.y) < 0.05 ? 1.5 : 1.0;
            crossPattern = max(horizontal, vertical);
          }
          
          float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          strength = pow(strength, 1.5) * crossPattern;
          
          gl_FragColor = vec4(vColor, strength);
        }
      `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }, [enableTwinkling]);

    // Nebula system
    const nebulaGeometry = useMemo(() => {
        if (!enableNebulae) return null;

        const nebulaCount = 600;
        const positions = new Float32Array(nebulaCount * 3);
        const colors = new Float32Array(nebulaCount * 3);
        const sizes = new Float32Array(nebulaCount);

        for (let i = 0; i < nebulaCount; i++) {
            const i3 = i * 3;

            // Create nebula in clustered regions
            const clusterIndex = Math.floor(Math.random() * 4);
            const clusterCenters = [
                [400, 200, -300],
                [-500, -100, 400],
                [200, -400, 200],
                [-300, 300, -500]
            ];

            const center = clusterCenters[clusterIndex];
            const spread = 200;

            positions[i3] = center[0] + (Math.random() - 0.5) * spread;
            positions[i3 + 1] = center[1] + (Math.random() - 0.5) * spread;
            positions[i3 + 2] = center[2] + (Math.random() - 0.5) * spread;

            // Nebula color types
            const nebulaType = Math.random();
            if (nebulaType < 0.25) {
                // Emission nebula (red/pink)
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.2 + Math.random() * 0.3;
                colors[i3 + 2] = 0.4 + Math.random() * 0.3;
            } else if (nebulaType < 0.5) {
                // Planetary nebula (blue/cyan)
                colors[i3] = 0.2 + Math.random() * 0.4;
                colors[i3 + 1] = 0.7 + Math.random() * 0.3;
                colors[i3 + 2] = 1.0;
            } else if (nebulaType < 0.75) {
                // Dark nebula with illuminated edges (purple)
                colors[i3] = 0.6 + Math.random() * 0.4;
                colors[i3 + 1] = 0.3 + Math.random() * 0.3;
                colors[i3 + 2] = 0.9 + Math.random() * 0.1;
            } else {
                // Supernova remnant (green/teal)
                colors[i3] = 0.2 + Math.random() * 0.3;
                colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i3 + 2] = 0.6 + Math.random() * 0.4;
            }

            sizes[i] = Math.random() * 15 + 5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        return geometry;
    }, [enableNebulae]);

    // Nebula material with organic movement
    const nebulaMaterial = useMemo(() => {
        if (!enableNebulae) return null;

        return new THREE.ShaderMaterial({
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
          
          // Organic pulsing and breathing effect
          float pulse = sin(uTime * 0.5 + position.x * 0.001) * 0.3;
          float breathe = cos(uTime * 0.3 + position.y * 0.002) * 0.2;
          float fluctuate = sin(uTime * 0.8 + length(position) * 0.001) * 0.1;
          
          float totalEffect = 0.6 + pulse + breathe + fluctuate;
          
          gl_PointSize = size * uPixelRatio * totalEffect * (800.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float distanceToCenter = length(center);
          
          // Soft nebula glow with layered opacity
          float innerGlow = 1.0 - smoothstep(0.0, 0.3, distanceToCenter);
          float outerGlow = 1.0 - smoothstep(0.3, 0.5, distanceToCenter);
          
          float strength = pow(innerGlow, 2.0) + outerGlow * 0.3;
          
          gl_FragColor = vec4(vColor, strength * 0.12);
        }
      `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }, [enableNebulae]);

    // Cosmic dust particles
    const dustGeometry = useMemo(() => {
        const dustCount = 4000;
        const positions = new Float32Array(dustCount * 3);
        const colors = new Float32Array(dustCount * 3);

        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;

            // Distribute dust throughout the space
            positions[i3] = (Math.random() - 0.5) * radius * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * radius * 2;
            positions[i3 + 2] = (Math.random() - 0.5) * radius * 2;

            // Dust colors (brownish, golden)
            const dustBrightness = Math.random() * 0.6 + 0.2;
            colors[i3] = dustBrightness * 0.8;
            colors[i3 + 1] = dustBrightness * 0.6;
            colors[i3 + 2] = dustBrightness * 0.3;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        return geometry;
    }, [radius]);

    const dustMaterial = useMemo(() => {
        return new THREE.PointsMaterial({
            size: 0.8,
            transparent: true,
            opacity: 0.06,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }, []);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Update star twinkling
        if (starMaterial.uniforms) {
            starMaterial.uniforms.uTime.value = time;
        }

        // Update nebula animation
        if (nebulaMaterial?.uniforms) {
            nebulaMaterial.uniforms.uTime.value = time;
        }

        // Gentle rotation for depth perception
        if (starsRef.current) {
            starsRef.current.rotation.y = time * 0.008;
            starsRef.current.rotation.x = Math.sin(time * 0.005) * 0.02;
        }

        // Independent nebula movement
        if (nebulaRef.current) {
            nebulaRef.current.rotation.y = -time * 0.012;
            nebulaRef.current.rotation.z = time * 0.006;
        }

        // Slow dust drift
        if (dustRef.current) {
            dustRef.current.rotation.y = time * 0.003;
            dustRef.current.rotation.x = -time * 0.002;
        }
    });

    return (
        <>
            {/* Enhanced starfield */}
            <points ref={starsRef}>
                <bufferGeometry attach="geometry" {...starGeometry} />
                <primitive object={starMaterial} attach="material" />
            </points>

            {/* Nebula system */}
            {enableNebulae && nebulaGeometry && nebulaMaterial && (
                <points ref={nebulaRef}>
                    <bufferGeometry attach="geometry" {...nebulaGeometry} />
                    <primitive object={nebulaMaterial} attach="material" />
                </points>
            )}

            {/* Cosmic dust */}
            <points ref={dustRef}>
                <bufferGeometry attach="geometry" {...dustGeometry} />
                <primitive object={dustMaterial} attach="material" />
            </points>
        </>
    );
};