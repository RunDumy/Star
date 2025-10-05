"use client";

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Group } from 'three';

interface GravitationalFieldProps {
  children?: React.ReactNode;
  strength?: number;
  center?: [number, number, number];
}

export const GravitationalField: React.FC<GravitationalFieldProps> = ({
  children,
  strength = 0.5,
  center = [0, 0, 0]
}) => {
  const fieldRef = useRef<Group>(null);

  // Create gravitational field visualization
  const rings = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      radius: 2 + i * 1.5,
      opacity: 0.3 - i * 0.05
    }));
  }, []);

  // Animate the gravitational field
  useFrame((state) => {
    if (fieldRef.current) {
      fieldRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={fieldRef} position={center}>
      {/* Gravitational field rings */}
      {rings.map((ring, ringIndex) => (
        <mesh key={`gravity-ring-${ringIndex}`} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.radius - 0.5, ring.radius + 0.5, 64]} />
          <meshBasicMaterial
            transparent
            opacity={ring.opacity}
            color="#8b5cf6"
          />
        </mesh>
      ))}

      {/* Central gravitational well */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          transparent
          opacity={0.5}
          color="#7c3aed"
        />
      </mesh>

      {/* Render children within the field */}
      {children}
    </group>
  );
};