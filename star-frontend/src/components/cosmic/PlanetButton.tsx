"use client";

import { animated, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
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
  hasAtmosphere?: boolean;
  hasRings?: boolean;
  planetType?: 'rocky' | 'gas' | 'ice' | 'desert' | 'ocean' | 'volcanic';
  emissiveColor?: string;
  ringColor?: string;
  atmosphereColor?: string;
}

export const PlanetButton: React.FC<PlanetButtonProps> = ({
  position = [0, 0, 0],
  route,
  texture,
  label,
  size = 1,
  orbitSpeed = 0.5,
  color = '#ffffff',
  onClick,
  hasAtmosphere = false,
  hasRings = false,
  planetType = 'rocky',
  emissiveColor,
  ringColor,
  atmosphereColor
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Calculate scale based on state
  const getScale = () => {
    if (hovered) return size * 1.3;
    if (clicked) return size * 1.1;
    return size;
  };

  // Calculate emissive intensity based on state
  const getEmissiveIntensity = () => {
    if (hovered) return 0.8;
    if (clicked) return 0.6;
    return 0.3;
  };

  const { scale, emissiveIntensity, rotationY } = useSpring({
    scale: getScale(),
    emissiveIntensity: getEmissiveIntensity(),
    rotationY: clicked ? Math.PI * 2 : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  // Memoize geometries for performance
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);
  const atmosphereGeometry = useMemo(() => new THREE.SphereGeometry(1.2, 16, 16), []);
  const ringsGeometry = useMemo(() => {
    const geometry = new THREE.RingGeometry(1.5, 2.5, 32);
    return geometry;
  }, []);

  // Planet material based on type
  const planetMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial();

    switch (planetType) {
      case 'gas':
        material.color = new THREE.Color(color);
        material.emissive = new THREE.Color(emissiveColor || color).multiplyScalar(0.2);
        material.roughness = 0.1;
        material.metalness = 0.8;
        break;
      case 'ice':
        material.color = new THREE.Color('#e0f6ff');
        material.emissive = new THREE.Color(emissiveColor || '#4fc3f7').multiplyScalar(0.1);
        material.roughness = 0.9;
        material.metalness = 0.1;
        break;
      case 'desert':
        material.color = new THREE.Color('#d4a574');
        material.emissive = new THREE.Color(emissiveColor || '#ff8a65').multiplyScalar(0.1);
        material.roughness = 0.8;
        material.metalness = 0.2;
        break;
      case 'ocean':
        material.color = new THREE.Color('#1e3a8a');
        material.emissive = new THREE.Color(emissiveColor || '#3b82f6').multiplyScalar(0.15);
        material.roughness = 0.2;
        material.metalness = 0.9;
        break;
      case 'volcanic':
        material.color = new THREE.Color('#7f1d1d');
        material.emissive = new THREE.Color(emissiveColor || '#dc2626').multiplyScalar(0.3);
        material.roughness = 0.6;
        material.metalness = 0.4;
        break;
      default: // rocky
        material.color = new THREE.Color(color);
        material.emissive = new THREE.Color(emissiveColor || color).multiplyScalar(0.1);
        material.roughness = 0.7;
        material.metalness = 0.3;
    }

    if (texture) {
      material.map = texture;
    }

    return material;
  }, [color, texture, planetType, emissiveColor]);

  // Atmosphere material
  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(atmosphereColor || color).multiplyScalar(0.3),
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });
  }, [color, atmosphereColor]);

  // Rings material
  const ringsMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(ringColor || color).multiplyScalar(0.5),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
  }, [color, ringColor]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;

      // Slow rotation
      groupRef.current.rotation.y += delta * orbitSpeed;

      // Add slight wobble for more realism
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.03;
    }

    // Animate atmosphere
    if (atmosphereRef.current && hasAtmosphere) {
      atmosphereRef.current.rotation.y += delta * orbitSpeed * 0.5;
      atmosphereRef.current.rotation.x += delta * orbitSpeed * 0.3;
    }

    // Animate rings
    if (ringsRef.current && hasRings) {
      ringsRef.current.rotation.z += delta * orbitSpeed * 0.8;
    }
  });

  const handleClick = () => {
    setClicked(true);
    onClick?.();

    // Reset click animation
    setTimeout(() => setClicked(false), 300);
  };

  return (
    <animated.group
      ref={groupRef}
      position={position}
      scale={scale}
      rotation-y={rotationY}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Planet Core */}
      <animated.mesh geometry={geometry} material={planetMaterial} ref={meshRef}>
        <animated.meshStandardMaterial
          color={planetMaterial.color}
          emissive={planetMaterial.emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={planetMaterial.roughness}
          metalness={planetMaterial.metalness}
          map={texture}
        />
      </animated.mesh>

      {/* Atmosphere */}
      {hasAtmosphere && (
        <animated.mesh
          ref={atmosphereRef}
          geometry={atmosphereGeometry}
          material={atmosphereMaterial}
        />
      )}

      {/* Rings */}
      {hasRings && (
        <animated.mesh
          ref={ringsRef}
          geometry={ringsGeometry}
          material={ringsMaterial}
          rotation={[Math.PI / 2, 0, 0]}
        />
      )}

      {/* Planet Label */}
      <Text
        position={[0, size + 0.8, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {label}
      </Text>
    </animated.group>
  );
};