"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useCosmicPhysics } from '../hooks/useCosmicPhysics';

interface CosmicSceneProps {
  children?: React.ReactNode;
}

export const CosmicScene: React.FC<CosmicSceneProps> = ({ children }) => {
  const sceneRef = useRef<Group>(null);
  const { updatePhysics } = useCosmicPhysics();

  // Update cosmic physics on each frame
  useFrame((state, delta) => {
    updatePhysics(delta);
  });

  return (
    <group ref={sceneRef}>
      {/* Render children components */}
      {children}
    </group>
  );
};