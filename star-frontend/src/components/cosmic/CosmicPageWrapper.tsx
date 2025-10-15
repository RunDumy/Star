import { Canvas } from '@react-three/fiber';
import React, { Suspense } from 'react';
import { EnhancedDepthSystem, PlanetCoordinateSystem } from './EnhancedDepthSystem';
import { UniversalCosmicScene } from './UniversalCosmicScene';
import { UniversalPlanetNavigation } from './UniversalPlanetNavigation';
import UniversalSpaceBackground from './UniversalSpaceBackground';

interface CosmicPageWrapperProps {
    children: React.ReactNode;
    showNavigation?: boolean;
    customContent?: React.ReactNode;
    enableInteraction?: boolean;
    className?: string;
}

export const CosmicPageWrapper: React.FC<CosmicPageWrapperProps> = ({
    children,
    showNavigation = true,
    customContent,
    enableInteraction = true,
    className = ''
}) => {
    return (
        <div className={`cosmic-page-wrapper ${className}`}>
            {/* CSS-based starfield background for performance */}
            <UniversalSpaceBackground />

            {/* 3D Canvas for cosmic scene */}
            <div className="cosmic-canvas-container">
                <Canvas
                    camera={{
                        position: [0, 8, 25],
                        fov: 55,
                        near: 0.1,
                        far: 2000
                    }}
                    gl={{
                        antialias: true,
                        alpha: false,
                        powerPreference: "high-performance",
                        stencil: false,
                        depth: true
                    }}
                    dpr={[1, 2]}
                    shadows
                >
                    <Suspense fallback={null}>
                        <UniversalCosmicScene enableControls={enableInteraction}>
                            {/* Enhanced Depth System with volumetric effects */}
                            <EnhancedDepthSystem
                                enableVolumetricFog={true}
                                enableAtmosphericScattering={true}
                                fogNear={50}
                                fogFar={400}
                            />

                            {/* Planet Navigation with coordinate system */}
                            {showNavigation && (
                                <PlanetCoordinateSystem>
                                    <UniversalPlanetNavigation />
                                </PlanetCoordinateSystem>
                            )}

                            {customContent}
                        </UniversalCosmicScene>
                    </Suspense>
                </Canvas>
            </div>

            {/* Page content overlay */}
            <div className="cosmic-content-overlay">
                {children}
            </div>

            {/* Navigation instructions */}
            <div className="universal-space-ui">
                <div className="space-nav-indicator">
                    <span>🌟 Click planets to navigate • Use mouse to explore the cosmos</span>
                </div>
            </div>
        </div>
    );
};