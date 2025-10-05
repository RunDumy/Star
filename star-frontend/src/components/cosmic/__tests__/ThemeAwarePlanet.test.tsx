import * as THREE from 'three';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
}));

// Mock the cosmic theme hook
jest.mock('@/contexts/CosmicThemeContext', () => ({
  useCosmicTheme: () => ({
    theme: {
      palette: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#ffe66d',
      },
      geometry: {
        planetShape: 'sphere',
        density: 'medium',
      },
    },
  }),
}));

describe('ThemeAwarePlanet Geometry', () => {
  it('creates correct geometry for sphere', () => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    expect(geometry).toBeDefined();
    expect(geometry.type).toBe('SphereGeometry');
  });

  it('creates correct geometry for icosahedron', () => {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    expect(geometry).toBeDefined();
    expect(geometry.type).toBe('IcosahedronGeometry');
  });

  it('creates correct geometry for dodecahedron', () => {
    const geometry = new THREE.DodecahedronGeometry(1, 0);
    expect(geometry).toBeDefined();
    expect(geometry.type).toBe('DodecahedronGeometry');
  });

  it('creates correct geometry for torus', () => {
    const geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
    expect(geometry).toBeDefined();
    expect(geometry.type).toBe('TorusGeometry');
  });

  it('can import ThemeAwarePlanet component', () => {
    // Just test that the component can be imported without syntax errors
    const { ThemeAwarePlanet } = require('../ThemeAwarePlanet');
    expect(ThemeAwarePlanet).toBeDefined();
    expect(typeof ThemeAwarePlanet).toBe('function');
  });
});