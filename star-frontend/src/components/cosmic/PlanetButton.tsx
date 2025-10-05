"use client";

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

interface PlanetButtonProps {
  position?: [number, number, number];
  route?: string;
  texture?: THREE.Texture;
  label: string;
  size?: number;
  orbitSpeed?: number;
  color?: string;
  onClick?: () => void;
}

export const PlanetButton: React.FC<PlanetButtonProps> = ({
  position = [0, 0, 0],
  route,
  texture,
  label,
  size = 1,
  orbitSpeed = 0.5,
  color = '#ffffff',
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const { scale, emissiveIntensity } = useSpring({
    scale: hovered ? size * 1.2 : size,
    emissiveIntensity: hovered ? 0.8 : 0.3,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Memoize geometry for performance
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.3;

      // Slow rotation
      groupRef.current.rotation.y += delta * orbitSpeed;
    }
  });

  const handleClick = () => {
    onClick?.();
  };

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <animated.mesh geometry={geometry} ref={meshRef}>
        <meshStandardMaterial
          map={texture}
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.7}
          metalness={0.3}
        />
      </animated.mesh>

      {/* Planet Label */}
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Glow effect */}
      <pointLight intensity={hovered ? 2 : 1} distance={5} color={color} />
    </animated.group>
  );
};