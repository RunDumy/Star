"use client";

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface VolumetricDepthSystemProps {
    fogColor?: string;
    fogNear?: number;
    fogFar?: number;
    scatteringIntensity?: number;
    depthLayers?: number;
    enableDepthCues?: boolean;
    showDepthIndicator?: boolean;
}

export const VolumetricDepthSystem: React.FC<VolumetricDepthSystemProps> = ({
    fogColor = '#000011',
    fogNear = 50,
    fogFar = 300,
    scatteringIntensity = 0.8,
    depthLayers = 5,
    enableDepthCues = true,
    showDepthIndicator = false,
}) => {
    const { scene, camera } = useThree();
    const fogRef = useRef<THREE.Fog>(null);
    const scatteringParticlesRef = useRef<THREE.Points>(null);
    const depthIndicatorRef = useRef<HTMLDivElement>(null);

    // Create volumetric fog
    const fog = useMemo(() => {
        return new THREE.Fog(fogColor, fogNear, fogFar);
    }, [fogColor, fogNear, fogFar]);

    // Create scattering particles for atmospheric depth
    const scatteringData = useMemo(() => {
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Distribute particles in layers based on depth
            const layer = Math.floor(Math.random() * depthLayers);
            const depth = (layer / depthLayers) * fogFar;

            // Random position within the layer
            const radius = depth * 0.8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Color based on depth - deeper particles are darker
            const depthFactor = 1 - (depth / fogFar);
            colors[i * 3] = depthFactor * 0.1; // R
            colors[i * 3 + 1] = depthFactor * 0.2; // G
            colors[i * 3 + 2] = depthFactor * 0.4; // B

            // Size based on depth - closer particles are larger
            sizes[i] = (1 - depthFactor) * 2 + 0.5;
        }

        return { positions, colors, sizes };
    }, [fogFar, depthLayers]);

    // Custom shader material for volumetric scattering
    const scatteringMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uScatteringIntensity: { value: scatteringIntensity },
                uFogNear: { value: fogNear },
                uFogFar: { value: fogFar },
            },
            vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDepth;
        uniform float uTime;

        void main() {
          vColor = color;
          vDepth = -position.z;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        varying vec3 vColor;
        varying float vDepth;
        uniform float uScatteringIntensity;
        uniform float uFogNear;
        uniform float uFogFar;

        void main() {
          float r = length(gl_PointCoord - vec2(0.5));
          if (r > 0.5) discard;

          // Depth-based opacity
          float depthFactor = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
          float alpha = (1.0 - smoothstep(0.0, 0.5, r)) * depthFactor * uScatteringIntensity;

          // Atmospheric scattering effect
          vec3 scatteredColor = vColor * (1.0 + depthFactor * 0.5);

          gl_FragColor = vec4(scatteredColor, alpha);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
    }, [scatteringIntensity, fogNear, fogFar]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // Update fog density dynamically
        if (fogRef.current) {
            const cameraPosition = camera.position;
            const cameraDistance = cameraPosition.length();

            // Adjust fog based on camera distance from origin
            const dynamicFogFar = fogFar * (1 + cameraDistance * 0.01);
            fogRef.current.far = dynamicFogFar;
        }

        // Animate scattering particles
        if (scatteringParticlesRef.current) {
            scatteringParticlesRef.current.rotation.y = time * 0.01;
            scatteringParticlesRef.current.rotation.x = Math.sin(time * 0.005) * 0.1;

            // Update shader uniforms
            const material = scatteringParticlesRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = time;
        }
    });

    // Apply fog to scene
    useMemo(() => {
        scene.fog = fog;
    }, [scene, fog]);

    return (
        <>
            {/* Volumetric scattering particles */}
            <points ref={scatteringParticlesRef} material={scatteringMaterial}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={scatteringData.positions}
                        itemSize={3}
                        count={scatteringData.positions.length / 3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        array={scatteringData.colors}
                        itemSize={3}
                        count={scatteringData.colors.length / 3}
                    />
                    <bufferAttribute
                        attach="attributes-size"
                        array={scatteringData.sizes}
                        itemSize={1}
                        count={scatteringData.sizes.length}
                    />
                </bufferGeometry>
            </points>

            {/* Depth-based lighting system */}
            <DepthBasedLighting fogNear={fogNear} fogFar={fogFar} />
        </>
    );
};

// Component for depth-based lighting effects
const DepthBasedLighting: React.FC<{ fogNear: number; fogFar: number }> = ({
    fogNear,
    fogFar
}) => {
    const { camera } = useThree();
    const lightsRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!lightsRef.current) return;

        const cameraPosition = camera.position;
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3());

        // Update light positions based on camera
        lightsRef.current.children.forEach((light, index) => {
            const distance = fogNear + (index / lightsRef.current!.children.length) * (fogFar - fogNear);
            const lightPosition = cameraPosition.clone().add(
                cameraDirection.clone().multiplyScalar(distance)
            );

            // Add some orbital variation
            const angle = Date.now() * 0.001 + index * Math.PI * 0.5;
            lightPosition.x += Math.cos(angle) * 10;
            lightPosition.y += Math.sin(angle) * 5;
            lightPosition.z += Math.sin(angle * 0.7) * 8;

            light.position.copy(lightPosition);

            // Adjust intensity based on distance
            const intensity = 1 - (distance / fogFar);
            (light as THREE.PointLight).intensity = intensity * 0.5;
        });
    });

    return (
        <group ref={lightsRef}>
            {/* Multiple depth-based lights */}
            <pointLight position={[50, 0, 0]} intensity={0.3} color="#4169E1" />
            <pointLight position={[-30, 20, -20]} intensity={0.2} color="#8A2BE2" />
            <pointLight position={[0, -30, 40]} intensity={0.25} color="#FF6347" />
            <pointLight position={[40, 30, -30]} intensity={0.2} color="#32CD32" />
        </group>
    );
};