// platforms/star-app/src/lib/zodiacAnimations.js
import { getAnimationConfig, getElementForSign, ZODIAC_ACTIONS } from './zodiacSystems';

// Base animation configurations for different action types
const BASE_ANIMATION_TYPES = {
  comment: {
    scale: [1.2, 1.2, 1.2],
    duration: 250,
    config: { tension: 300, friction: 40 }
  },
  like: {
    scale: [1.15, 1.15, 1.15],
    duration: 200,
    config: { tension: 350, friction: 30 }
  },
  follow: {
    position: [0, 0, 0.5],
    duration: 350,
    config: { tension: 250, friction: 45 }
  },
  share: {
    rotation: [0, Math.PI / 4, 0],
    duration: 400,
    config: { tension: 280, friction: 35 }
  }
};

// System-specific animation modifiers
const SYSTEM_MODIFIERS = {
  WESTERN: {
    scale: 1.0,
    duration: 1.0,
    intensity: 1.0
  },
  CHINESE: {
    scale: 1.1,
    duration: 1.2,
    intensity: 1.1
  },
  VEDIC: {
    scale: 0.9,
    duration: 0.8,
    intensity: 0.9
  },
  MAYAN: {
    scale: 1.0,
    duration: 1.1,
    intensity: 1.2
  },
  AZTEC: {
    scale: 1.15,
    duration: 1.0,
    intensity: 1.3
  }
};

// Element-specific animation properties
const ELEMENT_ANIMATIONS = {
  Fire: {
    scale: [0, 0.3, 0],
    rotation: [0, 0.2, 0],
    particleCount: 25,
    particleSpeed: 0.04,
    color: '#ff4444'
  },
  Earth: {
    scale: [0, -0.2, 0],
    rotation: [0, 0, 0.1],
    particleCount: 20,
    particleSpeed: 0.02,
    color: '#8B4513'
  },
  Air: {
    scale: [0, 0.4, 0],
    rotation: [0.1, 0, 0],
    particleCount: 30,
    particleSpeed: 0.05,
    color: '#87CEEB'
  },
  Water: {
    scale: [0, 0.1, 0.2],
    rotation: [0, 0, -0.1],
    particleCount: 22,
    particleSpeed: 0.03,
    color: '#4361ee'
  },
  Wood: {
    scale: [0.1, 0.2, 0],
    rotation: [0, 0.15, 0],
    particleCount: 18,
    particleSpeed: 0.025,
    color: '#228B22'
  },
  Metal: {
    scale: [0.05, 0.05, 0.05],
    rotation: [0, 0.1, 0.05],
    particleCount: 15,
    particleSpeed: 0.015,
    color: '#C0C0C0'
  }
};

// Specific action animations for dynamic effects
const SPECIFIC_ANIMATIONS = {
  CHINESE: {
    // Rat
    Squeak: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 200,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Nibble: {
      scale: [1.2, 1.2, 1.2],
      position: [0, 0, 0.3],
      emissiveIntensity: 0.5,
      duration: 150,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Scamper: {
      position: [0.4, 0, 0.5],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Gather: {
      scale: [1.25, 1.25, 1.25],
      rotation: [0, Math.PI / 4, 0],
      emissiveIntensity: 0.6,
      duration: 400,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Ox
    Moo: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.1, 0],
      emissiveIntensity: 0.6,
      duration: 250,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Plow: {
      position: [0, -0.4, 0.2],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1.5, direction: 'down' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Tread: {
      position: [0.5, 0, 0.3],
      rotation: [0, Math.PI / 8, 0],
      emissiveIntensity: 0.5,
      duration: 400,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Carry: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Tiger
    Roar: {
      scale: [1.6, 1.6, 1.6],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.7,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 30, speed: 3, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Pounce: {
      position: [0, 0, 1.2],
      scale: [1.3, 1.3, 1.3],
      emissiveIntensity: 0.6,
      duration: 200,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Stalk: {
      position: [0.6, 0, 0.4],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 500,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Claim: {
      scale: [1.4, 1.4, 1.4],
      rotation: [0, Math.PI / 4, 0],
      emissiveIntensity: 0.6,
      duration: 250,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Rabbit
    Hop: {
      position: [0, 0.5, 0],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 200,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Bound: {
      position: [0, 0, 0.7],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Burrow: {
      position: [0, -0.4, 0],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1.5, direction: 'down' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Nuzzle: {
      scale: [1.25, 1.25, 1.25],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 250,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Dragon (using Bellow, Soar, Circle, Guard)
    Bellow: {
      scale: [1.5, 1.5, 1.5],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.7,
      duration: 350,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 30, speed: 3, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Soar: {
      position: [0, 0.6, 0],
      scale: [1.3, 1.3, 1.3],
      emissiveIntensity: 0.6,
      duration: 400,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Circle: {
      rotation: [0, Math.PI / 2, 0],
      position: [0.4, 0, 0.4],
      emissiveIntensity: 0.5,
      duration: 600,
      onRest: { rotation: [0, 0, 0], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Guard: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Snake
    Hiss: {
      scale: [1.3, 1.3, 1.3],
      rotation: [0, Math.PI / 8, 0],
      emissiveIntensity: 0.5,
      duration: 250,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Coil: {
      rotation: [0, Math.PI / 6, 0],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { rotation: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1.5, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Slither: {
      position: [0.5, 0, 0.5],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 450,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Shed: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 350,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Horse
    Neigh: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.6,
      duration: 250,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Gallop: {
      position: [0, 0, 0.8],
      scale: [1.3, 1.3, 1.3],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Trot: {
      position: [0.5, 0, 0.3],
      rotation: [0, Math.PI / 8, 0],
      emissiveIntensity: 0.5,
      duration: 400,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Prance: {
      scale: [1.4, 1.4, 1.4],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.6,
      duration: 350,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Goat
    Bleat: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.5,
      duration: 200,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Graze: {
      position: [0, -0.3, 0.2],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1.5, direction: 'down' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Climb: {
      position: [0, 0.5, 0],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Provide: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 250,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Monkey
    Chatter: {
      scale: [1.3, 1.3, 1.3],
      rotation: [0, Math.PI / 8, 0],
      emissiveIntensity: 0.5,
      duration: 200,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Swing: {
      position: [0.4, 0.4, 0],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Play: {
      rotation: [0, Math.PI / 3, 0],
      position: [0.3, 0, 0.3],
      emissiveIntensity: 0.5,
      duration: 400,
      onRest: { rotation: [0, 0, 0], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Discover: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Rooster
    Crow: {
      scale: [1.5, 1.5, 1.5],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.7,
      duration: 250,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Peck: {
      position: [0, 0, 0.4],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 200,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Strut: {
      position: [0.5, 0, 0.2],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Announce: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Dog
    Bark: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 200,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Fetch: {
      position: [0, 0, 0.6],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Guard: {
      position: [0.4, 0, 0.4],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 400,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Protect: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Pig
    Oink: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.5,
      duration: 200,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Root: {
      position: [0, -0.3, 0.3],
      scale: [1.2, 1.2, 1.2],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1.5, direction: 'down' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Trot: {
      position: [0.4, 0, 0.3],
      rotation: [0, Math.PI / 8, 0],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Feast: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    }
  },
  WESTERN: {
    // Aries
    Charge: {
      scale: [1.5, 1.5, 1.5],
      position: [0, 0, 1],
      emissiveIntensity: 0.7,
      duration: 250,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 30, speed: 3, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Spark: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.6,
      duration: 200,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Lead: {
      position: [0.5, 0, 0.5],
      rotation: [0, Math.PI / 6, 0],
      emissiveIntensity: 0.5,
      duration: 400,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Ignite: {
      scale: [1.4, 1.4, 1.4],
      rotation: [0, Math.PI / 4, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Taurus
    Graze: {
      scale: [1.3, 1.3, 1.3],
      position: [0, -0.3, 0.2],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1.5, direction: 'down' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Root: {
      scale: [1.2, 1.2, 1.2],
      position: [0, -0.2, 0],
      emissiveIntensity: 0.5,
      duration: 250,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Tread: {
      position: [0.4, 0, 0.3],
      rotation: [0, Math.PI / 8, 0],
      emissiveIntensity: 0.5,
      duration: 400,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Sustain: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Gemini
    Chatter: {
      scale: [1.2, 1.2, 1.2],
      rotation: [0, Math.PI / 3, 0],
      emissiveIntensity: 0.5,
      duration: 250,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Flit: {
      position: [0.5, 0.5, 0.5],
      emissiveIntensity: 0.5,
      duration: 200,
      onRest: { position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Connect: {
      rotation: [0, Math.PI / 4, 0],
      position: [0.3, 0, 0.3],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { rotation: [0, 0, 0], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Spread: {
      scale: [1.4, 1.4, 1.4],
      rotation: [0, Math.PI / 2, 0],
      emissiveIntensity: 0.6,
      duration: 400,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Cancer
    Nurture: {
      scale: [1.3, 1.3, 1.3],
      position: [0, 0.1, 0],
      emissiveIntensity: 0.6,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Embrace: {
      position: [0, 0.2, 0.2],
      scale: [1.25, 1.25, 1.25],
      emissiveIntensity: 0.5,
      duration: 250,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 18, speed: 1.5, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Guide: {
      rotation: [0, Math.PI / 6, 0],
      position: [0.4, 0, 0.4],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { rotation: [0, 0, 0], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Shelter: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.3, 0],
      emissiveIntensity: 0.6,
      duration: 400,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 22, speed: 2, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Leo
    Roar: {
      scale: [1.6, 1.6, 1.6],
      position: [0, 0.4, 0],
      emissiveIntensity: 0.7,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 30, speed: 3, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Shine: {
      scale: [1.5, 1.5, 1.5],
      emissiveIntensity: 0.8,
      duration: 250,
      onRest: { scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'top' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Strut: {
      position: [0.6, 0, 0.3],
      rotation: [0, Math.PI / 8, 0],
      emissiveIntensity: 0.6,
      duration: 350,
      onRest: { position: [0, 0, 0], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Inspire: {
      scale: [1.4, 1.4, 1.4],
      position: [0, 0.2, 0],
      emissiveIntensity: 0.7,
      duration: 300,
      onRest: { scale: [1, 1, 1], position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 25, speed: 3, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    // Virgo
    Analyze: {
      scale: [1.2, 1.2, 1.2],
      rotation: [0, Math.PI / 10, 0],
      emissiveIntensity: 0.5,
      duration: 300,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 15, speed: 1.5, direction: 'none' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Tidy: {
      position: [ -0.2, 0, 0.2],
      scale: [1.1, 1.1, 1.1],
      emissiveIntensity: 0.4,
      duration: 200,
      onRest: { position: [0, 0, 0], scale: [1, 1, 1], emissiveIntensity: 0.2 },
      particles: { count: 10, speed: 1, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Serve: {
      position: [0, 0.1, 0.3],
      emissiveIntensity: 0.5,
      duration: 350,
      onRest: { position: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 18, speed: 2, direction: 'forward' },
      config: { mass: 1, tension: 280, friction: 60 }
    },
    Refine: {
      scale: [1.3, 1.3, 1.3],
      rotation: [0, Math.PI / 12, 0],
      emissiveIntensity: 0.6,
      duration: 400,
      onRest: { scale: [1, 1, 1], rotation: [0, 0, 0], emissiveIntensity: 0.2 },
      particles: { count: 20, speed: 2, direction: 'out' },
      config: { mass: 1, tension: 280, friction: 60 }
    }
  }
};

// Helper function to determine particle direction based on action and element
const getParticleDirection = (actionType, element) => {
  const directions = {
    comment: ['outward', 'upward'],
    like: ['forward', 'circular'],
    follow: ['direction', 'spiral'],
    share: ['explosive', 'wave']
  };

  const elementDirections = {
    Fire: ['upward', 'explosive'],
    Earth: ['downward', 'ground'],
    Air: ['outward', 'circular'],
    Water: ['wave', 'flow'],
    Wood: ['growth', 'spiral'],
    Metal: ['precise', 'linear']
  };

  const actionDirs = directions[actionType] || ['outward'];
  const elementDirs = elementDirections[element] || ['outward'];

  return [...actionDirs, ...elementDirs][0];
};

// Export all animations
export const ALL_ZODIAC_ANIMATIONS = GENERATE_ALL_ZODIAC_ANIMATIONS();

// Get animation for specific system and action
export const getZodiacAnimation = (system, actionWord) => {
  return ALL_ZODIAC_ANIMATIONS[system]?.[actionWord] || ALL_ZODIAC_ANIMATIONS.WESTERN.Blare;
};

// Get all animations for a user across all systems
export const getUserAllSystemAnimations = (user) => {
  if (!user) return {};

  return {
    WESTERN: Object.values(ZODIAC_ACTIONS.WESTERN[user.zodiac_sign] || {}).map(action =>
      getZodiacAnimation('WESTERN', action)
    ),
    CHINESE: Object.values(ZODIAC_ACTIONS.CHINESE[user.chinese_zodiac] || {}).map(action =>
      getZodiacAnimation('CHINESE', action)
    ),
    VEDIC: Object.values(ZODIAC_ACTIONS.VEDIC[user.vedic_zodiac] || {}).map(action =>
      getZodiacAnimation('VEDIC', action)
    )
  };
};

// Get animation config for specific parameters
export const getAnimationForAction = (system, sign, actionType) => {
  const element = getElementForSign(system, sign);
  const config = getAnimationConfig(system, element, actionType);
  const actions = ZODIAC_ACTIONS[system][sign] || {};
  const actionWord = actions[actionType];

  return {
    ...config,
    actionWord,
    animation: getZodiacAnimation(system, actionWord)
  };
};

// Batch generate animations for performance
export const generateBatchAnimations = (system, signs) => {
  const animations = {};

  signs.forEach(sign => {
    animations[sign] = {};
    const actions = ZODIAC_ACTIONS[system][sign] || {};

    Object.entries(actions).forEach(([actionType, actionWord]) => {
      animations[sign][actionType] = getZodiacAnimation(system, actionWord);
    });
  });

  return animations;
};

// Enhanced animation functions with Galactic Tone support
export const getToneEnhancedAnimation = (system, sign, actionType, galacticTone) => {
  const baseAnimation = getAnimationForAction(system, sign, actionType);
  const toneModifier = getToneModifierForAction(galacticTone, actionType);
  
  return {
    ...baseAnimation,
    ...toneModifier,
    // Blend base animation with tone effects
    scale: toneModifier.scale || baseAnimation.scale,
    duration: Math.min(toneModifier.duration || baseAnimation.duration, 600), // Max 600ms
    emissiveIntensity: (baseAnimation.emissiveIntensity || 0.5) * (toneModifier.emissiveIntensity || 1.0),
    particles: {
      ...baseAnimation.particles,
      ...toneModifier.particles,
      color: toneModifier.toneColor || baseAnimation.color,
      toneEffect: toneModifier.effect
    },
    toneData: getGalacticTone(galacticTone)
  };
};

// Get complete animation set with tone enhancements for a user
export const getUserToneEnhancedAnimations = (user) => {
  if (!user || !user.galactic_tone) return getUserAllSystemAnimations(user);

  const tone = user.galactic_tone;
  const animations = {};

  // Generate for Aztec system (primary with tone support)
  if (user.aztec_zodiac) {
    animations.AZTEC = {};
    const actions = ZODIAC_ACTIONS.AZTEC[user.aztec_zodiac] || {};
    
    Object.entries(actions).forEach(([actionType, actionWord]) => {
      animations.AZTEC[actionType] = getToneEnhancedAnimation('AZTEC', user.aztec_zodiac, actionType, tone);
    });
  }

  // Generate for Mayan system (also supports tones)
  if (user.mayan_zodiac) {
    animations.MAYAN = {};
    const actions = ZODIAC_ACTIONS.MAYAN[user.mayan_zodiac] || {};
    
    Object.entries(actions).forEach(([actionType, actionWord]) => {
      animations.MAYAN[actionType] = getToneEnhancedAnimation('MAYAN', user.mayan_zodiac, actionType, tone);
    });
  }

  // Other systems without tone enhancement
  ['WESTERN', 'CHINESE', 'VEDIC'].forEach(system => {
    let zodiacField;
    if (system === 'WESTERN') {
      zodiacField = 'zodiac_sign';
    } else if (system === 'CHINESE') {
      zodiacField = 'chinese_zodiac';
    } else {
      zodiacField = 'vedic_zodiac';
    }
    
    if (user[zodiacField]) {
      animations[system] = {};
      const actions = ZODIAC_ACTIONS[system][user[zodiacField]] || {};
      
      Object.entries(actions).forEach(([actionType, actionWord]) => {
        animations[system][actionType] = getAnimationForAction(system, user[zodiacField], actionType);
      });
    }
  });

  return animations;
};

// Apply Galactic Tone particle effects to existing animations
export const applyToneParticleEffect = (baseParticleConfig, galacticTone) => {
  const toneData = getGalacticTone(galacticTone);
  const toneParticles = toneData.particleEffect;
  
  return {
    ...baseParticleConfig,
    count: Math.max(baseParticleConfig.count || 15, toneParticles.count),
    speed: (baseParticleConfig.speed || 1.0) * (toneParticles.speed / 2),
    direction: toneParticles.direction === 'none' ? baseParticleConfig.direction : toneParticles.direction,
    pattern: toneParticles.pattern,
    color: toneData.color,
    toneIntensity: toneData.avatarEffect.emissiveIntensity,
    size: baseParticleConfig.size || 3,
    opacity: 0.8,
    life: (baseParticleConfig.life || 1.0) * (toneData.avatarEffect.duration / 250)
  };
};

// Get daily cosmic animation effects based on current Tonalpohualli
export const getDailyCosmicAnimations = () => {
  const today = new Date();
  
  // Calculate today's Tonalpohualli energy
  const jd = today.getTime() / 86400000 + 2440587.5;
  const tonalpohalliPosition = Math.floor(jd + 0.5) % 260;
  const todayTone = (tonalpohalliPosition % 13) + 1;
  const todaySignIndex = tonalpohalliPosition % 20;
  
  const aztecSigns = ['Crocodile', 'Wind', 'House', 'Lizard', 'Serpent', 'Death', 'Deer',
                     'Rabbit', 'Water', 'Dog', 'Monkey', 'Grass', 'Reed', 'Jaguar',
                     'Eagle', 'Vulture', 'Movement', 'Flint', 'Storm', 'Sun'];
  const todaySign = aztecSigns[todaySignIndex];
  
  return {
    dailyTone: todayTone,
    dailySign: todaySign,
    cosmicEnergy: getGalacticTone(todayTone),
    enhancedAnimations: {
      comment: getToneEnhancedAnimation('AZTEC', todaySign, 'comment', todayTone),
      like: getToneEnhancedAnimation('AZTEC', todaySign, 'like', todayTone),
      follow: getToneEnhancedAnimation('AZTEC', todaySign, 'follow', todayTone),
      share: getToneEnhancedAnimation('AZTEC', todaySign, 'share', todayTone)
    }
  };
};
