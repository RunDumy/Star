"use client";

import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { CosmicScene } from './CosmicScene';

interface CosmicInterfaceProps {
  children?: React.ReactNode;
  showControls?: boolean;
  cameraPosition?: [number, number, number];
}

export const CosmicInterface: React.FC<CosmicInterfaceProps> = ({
  children,
  showControls = true,
  cameraPosition = [0, 0, 10]
}) => {
  return (
    <div className="w-full h-full cosmic-space-background">
      <Canvas
        camera={{ position: cameraPosition, fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Cosmic Environment */}
        <color attach="background" args={['#000000']} />

        {/* Enhanced Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4338ca" />
        <pointLight position={[0, -20, 0]} intensity={0.3} color="#7c3aed" />

        {/* Enhanced Cosmic Background */}
        <Stars
          radius={400}
          depth={80}
          count={25000}
          factor={8}
          saturation={0}
          fade
          speed={0.3}
        />

        {/* Cosmic Scene */}
        <Suspense fallback={null}>
          <CosmicScene>
            {children}
          </CosmicScene>
        </Suspense>

        {/* Controls */}
        {showControls && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={150}
            autoRotate={false}
            autoRotateSpeed={0.2}
          />
        )}
      </Canvas>

      {/* Cosmic UI Overlay */}
      <div className="absolute top-4 left-4 text-white/80 text-sm pointer-events-none">
        🌌 Drag to explore • Scroll to zoom • Planets are interactive
      </div>
    </div>
  );
};