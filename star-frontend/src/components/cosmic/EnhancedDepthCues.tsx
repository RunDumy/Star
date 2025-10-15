"use client";

import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface DepthVisualizationHelperProps {
    showDepth?: boolean;
    showGrid?: boolean;
    showDistanceIndicators?: boolean;
}

export const DepthVisualizationHelper: React.FC<DepthVisualizationHelperProps> = ({
    showDepth = true,
    showGrid = false,
    showDistanceIndicators = true,
}) => {
    const { camera, scene } = useThree();
    const helperRef = useRef<THREE.Group>(null);

    // Create depth grid lines
    const depthGrid = useMemo(() => {
        const lines: JSX.Element[] = [];
        const depths = [-50, -25, 0, 25, 50];
        const size = 100;

        depths.forEach(depth => {
            // Horizontal lines
            lines.push(
                <line key={`h-${depth}`}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            array={new Float32Array([
                                -size, 0, depth, size, 0, depth
                            ])}
                            itemSize={3}
                            count={2}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#333333" opacity={0.3} transparent />
                </line>
            );

            // Vertical lines
            lines.push(
                <line key={`v-${depth}`}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            array={new Float32Array([
                                0, -size, depth, 0, size, depth
                            ])}
                            itemSize={3}
                            count={2}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#333333" opacity={0.3} transparent />
                </line>
            );
        });

        return lines;
    }, []);

    return (
        <group ref={helperRef}>
            {showGrid && depthGrid}

            {showDepth && <DepthIndicators />}
            {showDistanceIndicators && <DistanceIndicators />}
        </group>
    );
};

// Component to show depth indicators
const DepthIndicators: React.FC = () => {
    const { camera } = useThree();
    const [depthInfo, setDepthInfo] = useState({
        cameraDepth: 0,
        nearClip: 0,
        farClip: 0,
    });

    useFrame(() => {
        const cameraPosition = camera.position;
        setDepthInfo({
            cameraDepth: Math.round(cameraPosition.z * 100) / 100,
            nearClip: camera.near,
            farClip: camera.far,
        });
    });

    return (
        <Html position={[10, 8, 0]} center>
            <div style={{
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '12px',
                fontFamily: 'monospace',
                border: '1px solid #444',
            }}>
                <div>Camera Z: {depthInfo.cameraDepth}</div>
                <div>Near: {depthInfo.nearClip}</div>
                <div>Far: {depthInfo.farClip}</div>
            </div>
        </Html>
    );
};

// Component to show distance indicators for objects
const DistanceIndicators: React.FC = () => {
    const { camera, scene } = useThree();
    const indicatorsRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (!indicatorsRef.current) return;

        // Find all mesh objects in the scene and show their distances
        const meshes: THREE.Mesh[] = [];
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh && object.userData.showDistance !== false) {
                meshes.push(object);
            }
        });

        // Update indicator positions (simplified - in real implementation you'd create/update HTML elements)
        meshes.forEach((mesh, index) => {
            const distance = camera.position.distanceTo(mesh.position);
            mesh.userData.distance = distance;
        });
    });

    return <group ref={indicatorsRef} />;
};

// Hook for distance-based scaling
export const useDistanceBasedScaling = (
    baseScale: number = 1,
    minScale: number = 0.1,
    maxScale: number = 2,
    nearDistance: number = 10,
    farDistance: number = 100
) => {
    const { camera } = useThree();
    const [scale, setScale] = useState(baseScale);

    useFrame(() => {
        // This would be used in components that need distance-based scaling
        // Implementation depends on the specific use case
    });

    return scale;
};

// Hook for progressive lighting intensity
export const useProgressiveLighting = (
    baseIntensity: number = 1,
    distance: number = 0
) => {
    const { camera } = useThree();
    const [intensity, setIntensity] = useState(baseIntensity);

    useFrame(() => {
        const cameraDistance = camera.position.length();
        // Decrease intensity with distance, but maintain minimum visibility
        const newIntensity = Math.max(
            baseIntensity * (1 - cameraDistance * 0.01),
            baseIntensity * 0.3
        );
        setIntensity(newIntensity);
    });

    return intensity;
};

// Component for camera-relative positioning
interface CameraRelativeObjectProps {
    worldPosition: [number, number, number];
    children: React.ReactNode;
    maintainDistance?: number;
    smoothing?: number;
}

export const CameraRelativeObject: React.FC<CameraRelativeObjectProps> = ({
    worldPosition,
    children,
    maintainDistance = 5,
    smoothing = 0.1,
}) => {
    const { camera } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const targetPosition = useRef(new THREE.Vector3());

    useFrame(() => {
        if (!groupRef.current) return;

        const cameraPosition = camera.position;
        const cameraDirection = camera.getWorldDirection(new THREE.Vector3());

        // Calculate position relative to camera
        targetPosition.current.copy(cameraPosition)
            .add(cameraDirection.multiplyScalar(maintainDistance));

        // Add world position offset
        targetPosition.current.add(new THREE.Vector3(...worldPosition));

        // Smooth interpolation
        groupRef.current.position.lerp(targetPosition.current, smoothing);

        // Make object face camera
        groupRef.current.lookAt(cameraPosition);
    });

    return <group ref={groupRef}>{children}</group>;
};

// Enhanced depth cue system that combines all effects
interface EnhancedDepthCuesProps {
    enableVisualization?: boolean;
    enableDistanceScaling?: boolean;
    enableProgressiveLighting?: boolean;
    enableCameraRelative?: boolean;
}

export const EnhancedDepthCues: React.FC<EnhancedDepthCuesProps> = ({
    enableVisualization = true,
    enableDistanceScaling = true,
    enableProgressiveLighting = true,
    enableCameraRelative = false,
}) => {
    return (
        <group>
            {enableVisualization && (
                <DepthVisualizationHelper
                    showDepth={true}
                    showGrid={false}
                    showDistanceIndicators={true}
                />
            )}

            {/* Additional depth cue effects can be added here */}
            <DepthOfFieldEffect enabled={enableDistanceScaling} />
            <AtmosphericPerspective enabled={enableProgressiveLighting} />
        </group>
    );
};

// Depth of field effect component
const DepthOfFieldEffect: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    const { camera } = useThree();

    useFrame(() => {
        if (!enabled) return;

        // Simple depth-based blur simulation
        // In a real implementation, this would use post-processing effects
        const cameraDistance = camera.position.length();
        const blurAmount = Math.min(cameraDistance * 0.01, 0.5);

        // Apply blur to scene (simplified)
        // This would typically use a post-processing pass
    });

    return null;
};

// Atmospheric perspective effect
const AtmosphericPerspective: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    const { scene } = useThree();

    useFrame(() => {
        if (!enabled) return;

        // Adjust material properties based on depth
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                const material = object.material as THREE.MeshStandardMaterial;
                const distance = object.position.length();

                // Reduce saturation and brightness with distance
                const depthFactor = Math.min(distance * 0.01, 1);
                if (material.color) {
                    // This would modify the material's color based on depth
                    // Implementation depends on specific requirements
                }
            }
        });
    });

    return null;
};