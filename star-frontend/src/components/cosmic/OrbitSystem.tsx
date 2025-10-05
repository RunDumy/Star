"use client";

import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface OrbitSystemProps {
  children: React.ReactNode;
  enableDrag?: boolean;
  dragSpeed?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export const OrbitSystem: React.FC<OrbitSystemProps> = ({
  children,
  enableDrag = true,
  dragSpeed = 0.01,
  autoRotate = true,
  autoRotateSpeed = 0.001
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [previousMouse, setPreviousMouse] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!enableDrag) return;
    setIsDragging(true);
    setPreviousMouse({ x: e.clientX, y: e.clientY });
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !enableDrag || !groupRef.current) return;

    const deltaX = e.clientX - previousMouse.x;
    const deltaY = e.clientY - previousMouse.y;

    groupRef.current.rotation.y += deltaX * dragSpeed;
    groupRef.current.rotation.x += deltaY * dragSpeed;

    setPreviousMouse({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    if (!enableDrag) return;
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
  };

  const handlePointerLeave = () => {
    if (isDragging) {
      handlePointerUp();
    }
  };

  useFrame(() => {
    // Add gentle auto-rotation when not dragging
    if (autoRotate && !isDragging && groupRef.current) {
      groupRef.current.rotation.y += autoRotateSpeed;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </group>
  );
};