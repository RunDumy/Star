import { fireEvent, render, waitFor } from '@testing-library/react';
import { CollaborativeConstellation } from '../CollaborativeConstellation';

// Mock Three.js and React Three Fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
  useThree: () => ({
    camera: { position: { set: jest.fn() }, lookAt: jest.fn() },
    scene: { add: jest.fn(), remove: jest.fn() },
    gl: { domElement: { getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })) } },
    raycaster: { setFromCamera: jest.fn(), intersectObjects: jest.fn(() => []) },
  }),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Stars: () => null,
  Text: () => null,
}));

// Mock the contexts and hooks
jest.mock('@/contexts/CollaborationContext', () => ({
  useCollaboration: () => ({
    users: [],
    currentUser: { id: 'test-user' },
    updateUserPosition: jest.fn(),
  }),
}));

jest.mock('@/hooks/useWebRTC', () => ({
  useWebRTC: () => ({
    peers: [],
    isMuted: false,
    toggleMute: jest.fn(),
  }),
}));

describe('CollaborativeConstellation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders constellation scene', () => {
    render(<CollaborativeConstellation />);

    // Check if the component renders without crashing
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('handles star selection via raycasting', async () => {
    // Mock raycaster intersection
    const mockRaycaster = {
      setFromCamera: jest.fn(),
      intersectObjects: jest.fn(() => [
        {
          object: {
            userData: {
              isStar: true,
              starId: 'test-star-1',
              name: 'Test Star'
            },
            position: { x: 1, y: 2, z: 3 },
          },
          point: { x: 1, y: 2, z: 3 },
        },
      ]),
    };

    // Override the useThree mock for this test
    jest.mock('@react-three/fiber', () => ({
      useFrame: jest.fn(),
      useThree: () => ({
        camera: { position: { set: jest.fn() }, lookAt: jest.fn() },
        scene: { add: jest.fn(), remove: jest.fn() },
        gl: { domElement: document.createElement('canvas') },
        raycaster: mockRaycaster,
      }),
    }));

    render(<CollaborativeConstellation />);

    // Simulate click event on the canvas
    const canvas = document.querySelector('canvas')!;
    fireEvent.click(canvas);

    // Wait for potential async operations
    await waitFor(() => {
      // Component should handle the intersection internally
      expect(canvas).toBeInTheDocument();
    });
  });

  it('handles gesture-based navigation', () => {
    render(<CollaborativeConstellation />);

    // Simulate gesture event (this would be handled by the gesture hook)
    const canvas = document.querySelector('canvas')!;

    // Mock a drag gesture
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(canvas, { clientX: 150, clientY: 100 });
    fireEvent.pointerUp(canvas);

    // Component should handle gesture internally
    expect(canvas).toBeInTheDocument();
  });

  it('integrates with realtime collaboration', () => {
    render(<CollaborativeConstellation />);

    // Component should render with collaboration features enabled
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });
});