"use client";

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { Suspense, useEffect, useState } from 'react';
import { DepthVisualizationDashboard } from './DepthVisualizationDashboard';
import { Enhanced3DPlanetSystem } from './Enhanced3DPlanetSystem';
import { EnhancedDepthCues } from './EnhancedDepthCues';
import { EnhancedStarfield } from './EnhancedStarfield';
import { VolumetricDepthSystem } from './VolumetricDepthSystem';

interface EnhancedCosmicSceneProps {
    enableStarfield?: boolean;
    enablePlanets?: boolean;
    enableVolumetricDepth?: boolean;
    enableDepthCues?: boolean;
    enableDashboard?: boolean;
    cameraPosition?: [number, number, number];
    fov?: number;
}

const SceneContent: React.FC<EnhancedCosmicSceneProps> = ({
    enableStarfield = true,
    enablePlanets = true,
    enableVolumetricDepth = true,
    enableDepthCues = true,
    enableDashboard = true,
}) => {
    return (
        <>
            {/* Enhanced Multi-Layer Starfield */}
            {enableStarfield && <EnhancedStarfield />}

            {/* 3D Planet System with Orbital Motion */}
            {enablePlanets && <Enhanced3DPlanetSystem />}

            {/* Volumetric Depth Perception System */}
            {enableVolumetricDepth && (
                <VolumetricDepthSystem
                    fogColor="#000011"
                    fogNear={50}
                    fogFar={300}
                    scatteringIntensity={0.8}
                    depthLayers={5}
                />
            )}

            {/* Enhanced Visual Depth Cues */}
            {enableDepthCues && (
                <EnhancedDepthCues
                    enableVisualization={true}
                    enableDistanceScaling={true}
                    enableProgressiveLighting={true}
                    enableCameraRelative={false}
                />
            )}

            {/* Depth Visualization Dashboard */}
            {enableDashboard && (
                <DepthVisualizationDashboard
                    showDashboard={true}
                    position={[-15, 10, 0]}
                />
            )}

            {/* Camera Controls */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                zoomSpeed={0.6}
                panSpeed={0.8}
                rotateSpeed={0.4}
                minDistance={5}
                maxDistance={500}
            />

            {/* Ambient Lighting */}
            <ambientLight intensity={0.1} color="#ffffff" />

            {/* Key Light */}
            <directionalLight
                position={[10, 10, 5]}
                intensity={0.8}
                color="#ffffff"
                castShadow
            />

            {/* Fill Light */}
            <directionalLight
                position={[-10, -10, -5]}
                intensity={0.3}
                color="#4169E1"
            />

            {/* Rim Light */}
            <directionalLight
                position={[0, 0, -10]}
                intensity={0.4}
                color="#9370DB"
            />
        </>
    );
};

const LoadingFallback: React.FC = () => {
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffffff',
            fontSize: '18px',
            textAlign: 'center',
        }}>
            <div>🌌</div>
            <div>Loading Enhanced Cosmic Scene...</div>
        </div>
    );
};

export const EnhancedCosmicScene: React.FC<EnhancedCosmicSceneProps> = (props) => {
    const {
        cameraPosition = [0, 0, 30],
        fov = 60,
    } = props;

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#000000',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <Canvas
                camera={{
                    position: cameraPosition,
                    fov: fov,
                    near: 0.1,
                    far: 2000,
                }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 2]} // Responsive pixel ratio
            >
                <Suspense fallback={null}>
                    <SceneContent {...props} />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'monospace',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #444',
            }}>
                <div>🌟 Enhanced 3D Depth System Active</div>
                <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>
                    Multi-layer parallax • Volumetric effects • Orbital motion
                </div>
            </div>

            {/* Performance Indicator */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                color: '#ffffff',
                fontSize: '12px',
                fontFamily: 'monospace',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #444',
            }}>
                <div>🎯 3D Depth Rendering</div>
                <div style={{ fontSize: '10px', marginTop: '3px', opacity: 0.7 }}>
                    Optimized for desktop & mobile
                </div>
            </div>
        </div>
    );
};

// Performance optimized version for mobile devices
export const MobileEnhancedCosmicScene: React.FC<EnhancedCosmicSceneProps> = (props) => {
    return (
        <EnhancedCosmicScene
            {...props}
            enableDashboard={false} // Disable dashboard on mobile for performance
            cameraPosition={[0, 0, 40]} // Further back for mobile viewing
            fov={70} // Slightly wider FOV for mobile
        />
    );
};

// Hook for detecting mobile devices
export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// Auto-switching component based on device
export const AdaptiveEnhancedCosmicScene: React.FC<EnhancedCosmicSceneProps> = (props) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileEnhancedCosmicScene {...props} />;
    }

    return <EnhancedCosmicScene {...props} />;
};