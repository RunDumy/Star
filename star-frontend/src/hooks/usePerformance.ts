"use client";

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export const usePerformance = () => {
  const { gl } = useThree();

  useEffect(() => {
    // Adaptive performance based on device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      gl.shadowMap.enabled = false;
    } else {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    // Cleanup on unmount
    return () => {
      gl.dispose();
    };
  }, [gl]);
};