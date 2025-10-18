import '@testing-library/jest-dom';

// Mock React Three Fiber components
jest.mock('@react-three/fiber', () => ({
  Canvas: jest.fn(({ children }) => children),
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: { position: { set: jest.fn() } },
    scene: { add: jest.fn(), remove: jest.fn() }
  })),
  extend: jest.fn(),
}));

// Mock React Three Drei components
jest.mock('@react-three/drei', () => ({
  OrbitControls: jest.fn(() => null),
  Stars: jest.fn(() => null),
  Text: jest.fn(() => null),
  Sphere: jest.fn(() => null),
  Box: jest.fn(() => null),
  Line: jest.fn(() => null),
  useTexture: jest.fn(() => ({})),
  Html: jest.fn(({ children }) => children),
}));

// Mock Three.js
jest.mock('three', () => ({
  Vector3: jest.fn().mockImplementation((x, y, z) => ({ x: x || 0, y: y || 0, z: z || 0, set: jest.fn(), add: jest.fn(), sub: jest.fn(), normalize: jest.fn(), multiplyScalar: jest.fn(), length: jest.fn(() => 1) })),
  Vector2: jest.fn().mockImplementation((x, y) => ({ x: x || 0, y: y || 0, set: jest.fn(), add: jest.fn(), sub: jest.fn(), normalize: jest.fn(), multiplyScalar: jest.fn(), length: jest.fn(() => 1) })),
  Color: jest.fn().mockImplementation((color) => ({ r: 1, g: 1, b: 1, set: jest.fn(), setHex: jest.fn() })),
  Mesh: jest.fn(),
  SphereGeometry: jest.fn().mockImplementation(() => ({ type: 'SphereGeometry' })),
  IcosahedronGeometry: jest.fn().mockImplementation(() => ({ type: 'IcosahedronGeometry' })),
  DodecahedronGeometry: jest.fn().mockImplementation(() => ({ type: 'DodecahedronGeometry' })),
  TorusGeometry: jest.fn().mockImplementation(() => ({ type: 'TorusGeometry' })),
  BoxGeometry: jest.fn().mockImplementation(() => ({ type: 'BoxGeometry' })),
  PlaneGeometry: jest.fn().mockImplementation(() => ({ type: 'PlaneGeometry' })),
  MeshBasicMaterial: jest.fn(),
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  WebGLRenderer: jest.fn(),
  BufferGeometry: jest.fn(),
  LineBasicMaterial: jest.fn(),
  Points: jest.fn(),
  PointsMaterial: jest.fn(),
  BufferAttribute: jest.fn(),
  Raycaster: jest.fn().mockImplementation(() => ({ setFromCamera: jest.fn(), intersectObjects: jest.fn(() => []) })),
  Object3D: jest.fn(),
}));

// Mock React Spring Three
jest.mock('@react-spring/three', () => ({
  useSpring: jest.fn(() => [{ position: [0, 0, 0], scale: [1, 1, 1] }, jest.fn()]),
  animated: {
    mesh: 'mesh',
    group: 'group',
  },
  config: {
    wobbly: {},
  },
}));

// Mock Web Speech API
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition,
});

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({}),
  },
});

// Mock fetch globally for Jest environment
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
) as jest.Mock;

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));



// Mock MediaRecorder
global.MediaRecorder = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive',
})) as any;

// Mock audio context
global.AudioContext = jest.fn().mockImplementation(() => ({
  createAnalyser: jest.fn(() => ({
    connect: jest.fn(),
    getFloatFrequencyData: jest.fn(),
    fftSize: 256,
    frequencyBinCount: 128,
  })),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
  })),
})) as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock CosmicThemeContext
jest.mock('@/contexts/CosmicThemeContext', () => ({
  __esModule: true,
  useCosmicTheme: jest.fn(() => ({
    theme: 'cosmic',
    setTheme: jest.fn(),
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#0f0f23',
      surface: '#1a1a2e',
      text: '#e2e8f0',
      textSecondary: '#94a3b8'
    },
    fonts: {
      primary: 'Inter, sans-serif',
      cosmic: 'Orbitron, monospace'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem'
    },
    shadows: {
      cosmic: '0 0 20px rgba(99, 102, 241, 0.5)',
      glow: '0 0 10px rgba(139, 92, 246, 0.3)'
    }
  })),
  CosmicThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock CollaborationContext
jest.mock('@/contexts/CollaborationContext', () => ({
  __esModule: true,
  useCollaboration: jest.fn(() => ({
    users: [
      { id: '1', username: 'TestUser1', position: [0, 0, 0], isActive: true },
      { id: '2', username: 'TestUser2', position: [1, 1, 1], isActive: false }
    ],
    onlineUsers: new Map([
      ['1', { id: '1', username: 'TestUser1', position: [0, 0, 0], isActive: true }],
      ['2', { id: '2', username: 'TestUser2', position: [1, 1, 1], isActive: false }]
    ]),
    socket: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: 'mock-socket-id'
    },
    updateUserPosition: jest.fn(),
    sendMessage: jest.fn(),
    joinConstellation: jest.fn(),
    leaveConstellation: jest.fn(),
    isConnected: true,
    currentConstellation: null,
    messages: [],
    triggerZodiacAction: jest.fn().mockResolvedValue({}),
    recentActions: [],
    constellations: []
  })),
  CollaborationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock @use-gesture/react
jest.mock('@use-gesture/react', () => {
  return {
    useGesture: jest.fn((handlers: any) => {
      return () => {
        const gestureProps: any = {};

        if (handlers.onDrag) {
          let dragSequence = 0;

          gestureProps.onPointerDown = (event: any) => {

            dragSequence = 1;
            const dragState = {
              down: true,
              first: true,
              last: false,
              active: true,
              movement: [0, 0],
              offset: [0, 0],
              xy: [100, 100],
              direction: [0, 0],
              distance: 0,
              velocity: [0, 0],
              event
            };
            handlers.onDrag(dragState);
          };

          gestureProps.onPointerMove = (event: any) => {
            if (dragSequence === 1) {
              dragSequence = 2;
              // Simulate 60px right movement to exceed threshold of 50px
              const dragState = {
                down: true,
                first: false,
                last: false,
                active: true,
                movement: [60, 0], // Exceed 50px threshold
                offset: [60, 0],
                xy: [160, 100],
                direction: [1, 0],
                distance: 60,
                velocity: [1, 0],
                event
              };
              handlers.onDrag(dragState);
            }
          };

          gestureProps.onPointerUp = (event: any) => {
            if (dragSequence === 2) {
              const dragState = {
                down: false,
                first: false,
                last: true,
                active: false,
                movement: [60, 0],
                offset: [60, 0],
                xy: [160, 100],
                direction: [1, 0],
                distance: 60,
                velocity: [0, 0],
                event
              };
              handlers.onDrag(dragState);
            }
            dragSequence = 0;
          };
        }

        return gestureProps;
      };
    })
  };
});

// Setup fake timers for gaze navigation tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});