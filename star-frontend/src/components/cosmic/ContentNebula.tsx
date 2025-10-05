"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { GravitationalField } from './GravitationalField';
import { ArchaeologyToolkit } from './ArchaeologyToolkit';

interface ContentNebulaProps {
  children?: React.ReactNode;
  density?: number;
  emotionalResonance?: number;
}

export const ContentNebula: React.FC<ContentNebulaProps> = ({
  children,
  density = 0.5,
  emotionalResonance = 0.5
}) => {
  const nebulaRef = useRef<Group>(null);

  // Create nebula particle field
  const nebulaParticles = useMemo(() => {
    const particles = [];
    const particleCount = Math.floor(density * 1000);

    for (let i = 0; i < particleCount; i++) {
      const position = new Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );

      particles.push({
        id: `nebula-particle-${i}`,
        position: [position.x, position.y, position.z] as [number, number, number],
        size: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.3 + 0.1,
        color: emotionalResonance > 0.5 ? '#8b5cf6' : '#06b6d4'
      });
    }

    return particles;
  }, [density, emotionalResonance]);

  // Animate nebula
  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += 0.0005;
      nebulaRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <group ref={nebulaRef}>
      {/* Nebula particle field */}
      {nebulaParticles.map((particle) => (
        <mesh key={particle.id} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshBasicMaterial
            color={particle.color}
            transparent
            opacity={particle.opacity}
          />
        </mesh>
      ))}

      {/* Gravitational field for content */}
      <GravitationalField strength={0.3}>
        {children}
      </GravitationalField>

      {/* Archaeology toolkit */}
      <ArchaeologyToolkit />
    </group>
  );
};