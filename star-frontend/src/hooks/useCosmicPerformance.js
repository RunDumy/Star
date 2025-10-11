import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export const useCosmicPerformance = () => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    // Enable basic optimizations
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Adaptive quality based on frame rate
    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        // Adjust quality based on FPS
        if (fps < 30) {
          // Reduce quality
          scene.traverse((child) => {
            if (child.isMesh && child.geometry) {
              // Simplify geometries if needed
            }
          });
        }
      }

      requestAnimationFrame(checkPerformance);
    };

    checkPerformance();

    return () => {
      // Cleanup
    };
  }, [gl, scene, camera]);

  return null;
};