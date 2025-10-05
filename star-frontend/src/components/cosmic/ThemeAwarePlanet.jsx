import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export const ThemeAwarePlanet = ({ position = [0, 0, 0], size = 1, ...props }) => {
  const meshRef = useRef();
  const { theme } = useCosmicTheme();

  // Memoize geometry based on theme
  const geometry = useMemo(() => {
    switch (theme.geometry.planetShape) {
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(size, 0);
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(size, 0);
      case 'torus':
        return new THREE.TorusGeometry(size, 0.3, 16, 32);
      case 'asteroid': {
        // Create organic asteroid shape
        const asteroidGeometry = new THREE.IcosahedronGeometry(size, 1);
        const positions = asteroidGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * 0.3;
          positions[i + 1] += (Math.random() - 0.5) * 0.3;
          positions[i + 2] += (Math.random() - 0.5) * 0.3;
        }
        asteroidGeometry.computeVertexNormals();
        return asteroidGeometry;
      }
      default: // sphere
        return new THREE.SphereGeometry(size, 32, 32);
    }
  }, [theme.geometry.planetShape, size]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      {...props}
    >
      <meshStandardMaterial
        color={theme.palette.primary}
        emissive={theme.palette.primary}
        emissiveIntensity={0.3}
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
  );
};

ThemeAwarePlanet.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  size: PropTypes.number,
};