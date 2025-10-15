"use client";

import { Loader, OrbitControls, Stars } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitSystem } from './OrbitSystem';
import { PlanetButton } from './PlanetButton';

// Performance component that uses hooks
const CosmicContent = () => {
  const navigationPlanets = [
    {
      position: [8, 3, -5] as [number, number, number],
      route: '/chat',
      label: 'Chat',
      color: '#4a90e2',
      size: 1.2,
      orbitSpeed: 0.3,
      hasAtmosphere: true,
      planetType: 'gas' as const
    },
    {
      position: [-6, 1, 4] as [number, number, number],
      route: '/profile',
      label: 'Profile',
      color: '#9b59b6',
      size: 1,
      orbitSpeed: 0.4,
      hasRings: true,
      planetType: 'ice' as const
    },
    {
      position: [0, -3, -8] as [number, number, number],
      route: '/feed',
      label: 'Feed',
      color: '#2ecc71',
      size: 1.1,
      orbitSpeed: 0.2,
      hasAtmosphere: false,
      planetType: 'rocky' as const
    },
    {
      position: [5, -2, 6] as [number, number, number],
      route: '/mirror',
      label: 'Reflection',
      color: '#e74c3c',
      size: 0.9,
      orbitSpeed: 0.5,
      hasRings: false,
      planetType: 'desert' as const
    }
  ];

  return (
    <>
      <color attach="background" args={['#000000']} />

      {/* Cosmic Environment */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#4a90e2" />

      {/* Interactive System */}
      <OrbitSystem>
        <Suspense fallback={<FallbackSphere position={[0, 0, 0]} color="#666" />}>
          {navigationPlanets.map((planet, index) => (
            <PlanetButton
              key={planet.route}
              {...planet}
              onClick={() => console.log(`Navigating to ${planet.route}`)}
            />
          ))}
        </Suspense>
      </OrbitSystem>

      {/* Backup Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        zoomSpeed={0.6}
        minDistance={5}
        maxDistance={30}
      />
    </>
  );
};

// Fallback component for lazy loading
const FallbackSphere = ({ position, color }: { position: [number, number, number]; color: string }) => (
  <mesh position={position}>
    <sphereGeometry args={[1, 16, 16]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

export const CosmicNavigationScene = () => {
  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{
          antialias: true,
          alpha: true
        }}
        dpr={[1, 2]} // Responsive pixel ratio
      >
        <CosmicContent />
      </Canvas>

      {/* Loading Indicator */}
      <Loader />

      {/* UI Instructions */}
      <div className="absolute bottom-4 left-4 text-white/70 text-sm">
        🖱️ Drag to rotate • Click planets to navigate
      </div>
    </div>
  );
};