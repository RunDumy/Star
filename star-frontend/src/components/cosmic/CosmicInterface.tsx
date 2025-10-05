"use client";

import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { CosmicScene } from './components/cosmic/CosmicScene';

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
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{ position: cameraPosition, fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4338ca" />

        {/* Cosmic Background */}
        <Stars
          radius={300}
          depth={60}
          count={20000}
          factor={7}
          saturation={0}
          fade
          speed={0.5}
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
            minDistance={5}
            maxDistance={100}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        )}
      </Canvas>
    </div>
  );
};