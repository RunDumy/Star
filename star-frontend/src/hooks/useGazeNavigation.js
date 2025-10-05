import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useGazeNavigation = (options = {}) => {
  const {
    gazeThreshold = 1000, // ms to consider it a "gaze"
    gazeRadius = 50, // pixels radius for gaze detection
    updateInterval = 100, // ms between position updates
  } = options;

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [gazeTarget, setGazeTarget] = useState(null);
  const [isGazing, setIsGazing] = useState(false);
  const gazeStartTime = useRef(null);
  const gazeTimer = useRef(null);
  const lastUpdateTime = useRef(Date.now());

  // Track mouse movement
  const handleMouseMove = useCallback((event) => {
    const now = Date.now();
    if (now - lastUpdateTime.current >= updateInterval) {
      const newPosition = { x: event.clientX, y: event.clientY };
      setMousePosition(newPosition);
      lastUpdateTime.current = now;

      // Check if we're still gazing at the same area
      if (gazeTarget) {
        const distance = Math.sqrt(
          Math.pow(newPosition.x - gazeTarget.x, 2) +
          Math.pow(newPosition.y - gazeTarget.y, 2)
        );

        if (distance > gazeRadius) {
          // Moved outside gaze radius, reset gaze
          setIsGazing(false);
          setGazeTarget(null);
          gazeStartTime.current = null;
          if (gazeTimer.current) {
            clearTimeout(gazeTimer.current);
            gazeTimer.current = null;
          }
        }
      } else {
        // Start potential gaze at new position
        setGazeTarget(newPosition);
        gazeStartTime.current = now;

        // Set timer to detect gaze
        gazeTimer.current = setTimeout(() => {
          setIsGazing(true);
        }, gazeThreshold);
      }
    }
  }, [gazeThreshold, gazeRadius, updateInterval, gazeTarget]);

  // Handle mouse leaving the window
  const handleMouseLeave = useCallback(() => {
    setIsGazing(false);
    setGazeTarget(null);
    gazeStartTime.current = null;
    if (gazeTimer.current) {
      clearTimeout(gazeTimer.current);
      gazeTimer.current = null;
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (gazeTimer.current) {
        clearTimeout(gazeTimer.current);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Calculate gaze progress (0-1)
  const gazeProgress = useMemo(() => {
    if (!gazeStartTime.current || !gazeTarget) return 0;

    const elapsed = Date.now() - gazeStartTime.current;
    return Math.min(elapsed / gazeThreshold, 1);
  }, [gazeTarget, gazeThreshold]);

  // Get gaze direction relative to center of screen
  const gazeDirection = useMemo(() => {
    if (!gazeTarget) return { x: 0, y: 0 };

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    return {
      x: (gazeTarget.x - centerX) / centerX, // -1 to 1
      y: (gazeTarget.y - centerY) / centerY, // -1 to 1
    };
  }, [gazeTarget]);

  return {
    mousePosition,
    gazeTarget,
    isGazing,
    gazeProgress,
    gazeDirection,
    // Utility functions
    resetGaze: () => {
      setIsGazing(false);
      setGazeTarget(null);
      gazeStartTime.current = null;
      if (gazeTimer.current) {
        clearTimeout(gazeTimer.current);
        gazeTimer.current = null;
      }
    },
  };
};