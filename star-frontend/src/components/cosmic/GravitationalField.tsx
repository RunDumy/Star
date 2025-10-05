"use client";

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const fieldRings = Array.from({ length: 5 }, (_, i) => ({
    radius: (i + 1) * 10,
    opacity: (5 - i) * 0.1,
    speed: (i + 1) * 0.001
  }));

  useFrame((state) => {
    if (fieldRef.current) {
      // Rotate the field slowly
      fieldRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={fieldRef} position={center}>
      {/* Gravitational field rings */}
      {fieldRings.map((ring, index) => (
        <mesh key={`gravity-ring-${index}`} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.radius - 0.5, ring.radius + 0.5, 64]} />
          <meshBasicMaterial
            color="#4f46e5"
            transparent
            opacity={ring.opacity}
          />
        </mesh>
      ))}

      {/* Central gravitational well */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#1e1b4b"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Render children within the field */}
      <group>
        {children}
      </group>
    </group>
  );
};