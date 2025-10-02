import { useEffect, useRef, useCallback } from 'react';

export interface SpringAnimationConfig {
  mass: number;
  tension: number;
  friction: number;
}

export interface SpringAnimationState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  target: { x: number; y: number };
  isAnimating: boolean;
}

const DEFAULT_CONFIG: SpringAnimationConfig = {
  mass: 1,
  tension: 120,
  friction: 14
};

export function useSpringAnimation(
  initialPosition: { x: number; y: number },
  config: Partial<SpringAnimationConfig> = {}
) {
  const animationRef = useRef<SpringAnimationState>({
    position: initialPosition,
    velocity: { x: 0, y: 0 },
    target: initialPosition,
    isAnimating: false
  });

  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });
  const requestRef = useRef<number>();
  const listenersRef = useRef<Set<(state: SpringAnimationState) => void>>(new Set());
  const lastUpdateRef = useRef<number>(0);

  // Physics calculation for one step of spring animation
  const step = useCallback((timestamp: number) => {
    const state = animationRef.current;
    const config = configRef.current;

    // Throttle updates to ~60fps but allow for varying frame rates
    if (timestamp - lastUpdateRef.current < 16) { // ~60fps
      requestRef.current = requestAnimationFrame(step);
      return;
    }

    lastUpdateRef.current = timestamp;

    // Calculate delta time for frame-rate independent animation
    const deltaTime = 16 / 1000; // Target 60fps for consistency

    // Calculate spring force (Hooke's law: F = -k * x)
    const displacementX = state.position.x - state.target.x;
    const displacementY = state.position.y - state.target.y;

    const springForceX = -config.tension * displacementX;
    const springForceY = -config.tension * displacementY;

    // Calculate damping force
    const dampingForceX = -config.friction * state.velocity.x;
    const dampingForceY = -config.friction * state.velocity.y;

    // Calculate acceleration (F = ma -> a = F/m)
    const accelerationX = (springForceX + dampingForceX) / config.mass;
    const accelerationY = (springForceY + dampingForceY) / config.mass;

    // Update velocity (v += a * dt)
    state.velocity.x += accelerationX * deltaTime;
    state.velocity.y += accelerationY * deltaTime;

    // Update position (p += v * dt)
    state.position.x += state.velocity.x * deltaTime;
    state.position.y += state.velocity.y * deltaTime;

    // Check if animation is complete (very close to target and nearly stopped)
    const threshold = 0.1;
    const velocityThreshold = 0.01;
    const isComplete =
      Math.abs(displacementX) < threshold &&
      Math.abs(displacementY) < threshold &&
      Math.abs(state.velocity.x) < velocityThreshold &&
      Math.abs(state.velocity.y) < velocityThreshold;

    if (isComplete) {
      // Snap to exact target position and stop animation
      state.position.x = state.target.x;
      state.position.y = state.target.y;
      state.velocity.x = 0;
      state.velocity.y = 0;
      state.isAnimating = false;
      // Final notification for completion
      listenersRef.current.forEach(listener => listener(state));
    } else {
      state.isAnimating = true;
      requestRef.current = requestAnimationFrame(step);
      // Notify listeners only when position significantly changes
      listenersRef.current.forEach(listener => listener(state));
    }
  }, []);

  // Start animation to new target
  const animateTo = useCallback((newTarget: { x: number; y: number }) => {
    const state = animationRef.current;
    state.target.x = newTarget.x;
    state.target.y = newTarget.y;

    // Reset animation state if we're starting a new animation
    if (!state.isAnimating) {
      state.isAnimating = true;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      requestRef.current = requestAnimationFrame(step);
    }
  }, [step]);

  // Set position immediately without animation
  const setPosition = useCallback((newPosition: { x: number; y: number }) => {
    const state = animationRef.current;
    state.position.x = newPosition.x;
    state.position.y = newPosition.y;
    state.velocity.x = 0;
    state.velocity.y = 0;
    state.target.x = newPosition.x;
    state.target.y = newPosition.y;
    state.isAnimating = false;

    // Cancel any ongoing animation
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }

    // Notify listeners immediately
    listenersRef.current.forEach(listener => listener(state));
  }, []);

  // Add state change listener
  const addListener = useCallback((listener: (state: SpringAnimationState) => void) => {
    listenersRef.current.add(listener);
  }, []);

  // Remove state change listener
  const removeListener = useCallback((listener: (state: SpringAnimationState) => void) => {
    listenersRef.current.delete(listener);
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<SpringAnimationConfig>) => {
    Object.assign(configRef.current, newConfig);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      listenersRef.current.clear();
    };
  }, []);

  return {
    state: animationRef.current,
    animateTo,
    setPosition,
    addListener,
    removeListener,
    updateConfig,
    config: configRef.current
  };
}

// Ease function for smooth visual interpolation
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

// Alternative spring configuration presets
export const SPRING_PRESETS = {
  gentle: { mass: 1, tension: 120, friction: 14 },
  bouncy: { mass: 1, tension: 180, friction: 12 },
  snappy: { mass: 1, tension: 200, friction: 16 },
  slow: { mass: 2, tension: 60, friction: 20 },
  smooth: { mass: 1, tension: 100, friction: 18 }
};

// Utility function to create spring animation for multiple properties
export function createSpringGroup(properties: string[], config: SpringAnimationConfig = DEFAULT_CONFIG) {
  return properties.reduce((acc, prop) => ({
    ...acc,
    [prop]: SPRING_PRESETS.gentle // Default to gentle for each property
  }), {});
}
