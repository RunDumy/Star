"use client";

import { ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface OrbitSystemProps {
  children: React.ReactNode;
}

export const OrbitSystem: React.FC<OrbitSystemProps> = ({ children }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [isDragging, setIsDragging] = useState(false);
  const [previousMouseX, setPreviousMouseX] = useState(0);
  const [previousMouseY, setPreviousMouseY] = useState(0);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); // Prevent clicking planets when starting a drag
    setIsDragging(true);
    setPreviousMouseX(e.clientX);
    setPreviousMouseY(e.clientY);
    // Capture pointer for smooth dragging
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging && groupRef.current) {
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;
      // Adjust rotation based on mouse movement
      groupRef.current.rotation.y += deltaX * 0.01;
      groupRef.current.rotation.x += deltaY * 0.01;
      setPreviousMouseX(e.clientX);
      setPreviousMouseY(e.clientY);
    }
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </group>
  );
};