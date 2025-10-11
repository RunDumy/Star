// platforms/star-app/src/components/cosmic/ZodiacParticleUniverse.jsx
import { PointMaterial, Points } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

// Context and Data
import { useCosmicTheme } from '@/contexts/CosmicThemeContext';
import { ELEMENT_COLORS, ZODIAC_SYSTEMS } from '@/lib/zodiacSystems';

// Zodiac Particle Universe Component
export const ZodiacParticleUniverse = ({ count = 10000, radius = 100 }) => {
  const { theme } = useCosmicTheme();
  const pointsRef = useRef();
  const { camera } = useThree();

  // Generate particle positions based on zodiac systems
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    // Create particle clusters for each zodiac system
    const systems = Object.keys(ZODIAC_SYSTEMS);
    const particlesPerSystem = Math.floor(count / systems.length);

    systems.forEach((system, systemIndex) => {
      const systemData = ZODIAC_SYSTEMS[system];
      const systemOffset = systemIndex * particlesPerSystem;

      // Create orbital rings for each sign
      systemData.signs.forEach((sign, signIndex) => {
        const signParticles = Math.floor(particlesPerSystem / systemData.signs.length);
        const signOffset = systemOffset + signIndex * signParticles;

        // Get element for this sign
        const element = Object.entries(systemData.elements)
          .find(([_, signs]) => signs.includes(sign))?.[0];
        const elementColor = ELEMENT_COLORS[element] || ELEMENT_COLORS.FIRE;

        // Create particles in orbital pattern
        for (let i = 0; i < signParticles; i++) {
          const particleIndex = signOffset + i;
          if (particleIndex >= count) break;

          // Orbital position
          const angle = (i / signParticles) * Math.PI * 2;
          const distance = radius * (0.5 + Math.random() * 0.5);
          const height = (Math.random() - 0.5) * 20;

          // Add some randomness to orbital paths
          const randomOffset = (Math.random() - 0.5) * 10;
          const x = Math.cos(angle) * distance + randomOffset;
          const z = Math.sin(angle) * distance + randomOffset;
          const y = height + Math.sin(angle * 2) * 5;

          positions[particleIndex * 3] = x;
          positions[particleIndex * 3 + 1] = y;
          positions[particleIndex * 3 + 2] = z;

          // Color based on element
          colors[particleIndex * 3] = elementColor.primary.r / 255;
          colors[particleIndex * 3 + 1] = elementColor.primary.g / 255;
          colors[particleIndex * 3 + 2] = elementColor.primary.b / 255;

          // Size variation
          sizes[particleIndex] = Math.random() * 2 + 0.5;
        }
      });
    });

    // Fill remaining particles with cosmic dust
    for (let i = systems.length * particlesPerSystem; i < count; i++) {
      const distance = Math.random() * radius * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = distance * Math.cos(phi);

      // Cosmic dust colors
      colors[i * 3] = 0.5 + Math.random() * 0.5;     // R
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.4; // G
      colors[i * 3 + 2] = 0.7 + Math.random() * 0.3; // B

      sizes[i] = Math.random() * 1 + 0.2;
    }

    return { positions, colors, sizes };
  }, [count, radius]);

  // Animation loop
  useFrame((state) => {
    if (pointsRef.current) {
      // Gentle rotation
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;

      // Camera-based movement
      const cameraDistance = camera.position.length();
      const scale = Math.max(0.1, Math.min(1, cameraDistance / 50));
      pointsRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={2}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Enhanced Zodiac Constellation Particles
export const ZodiacConstellationParticles = ({ constellation, active = false }) => {
  const pointsRef = useRef();

  const { positions, colors } = useMemo(() => {
    if (!constellation || !constellation.stars) return { positions: [], colors: [] };

    const positions = new Float32Array(constellation.stars.length * 3);
    const colors = new Float32Array(constellation.stars.length * 3);

    constellation.stars.forEach((star, index) => {
      positions[index * 3] = star.x;
      positions[index * 3 + 1] = star.y;
      positions[index * 3 + 2] = star.z;

      // Star colors based on magnitude
      const intensity = Math.max(0.3, 1 - star.magnitude / 6);
      colors[index * 3] = intensity;     // R
      colors[index * 3 + 1] = intensity; // G
      colors[index * 3 + 2] = intensity; // B
    });

    return { positions, colors };
  }, [constellation]);

  useFrame((state) => {
    if (pointsRef.current && active) {
      // Pulsing effect for active constellations
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      pointsRef.current.material.size = (2 + pulse) * (constellation?.scale || 1);
    }
  });

  if (!positions.length) return null;

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={active ? 3 : 2}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Elemental Particle Systems
export const ElementalParticleSystem = ({ element, position = [0, 0, 0], count = 500 }) => {
  const pointsRef = useRef();

  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    const elementColor = ELEMENT_COLORS[element] || ELEMENT_COLORS.FIRE;

    for (let i = 0; i < count; i++) {
      // Random spherical distribution
      const radius = Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Element-based colors
      colors[i * 3] = elementColor.primary.r / 255;
      colors[i * 3 + 1] = elementColor.primary.g / 255;
      colors[i * 3 + 2] = elementColor.primary.b / 255;

      // Initial velocities for movement
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions, colors, velocities };
  }, [element, count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;

      // Update particle positions
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        // Reset particles that go too far
        const distance = Math.sqrt(
          positions[i * 3] ** 2 +
          positions[i * 3 + 1] ** 2 +
          positions[i * 3 + 2] ** 2
        );

        if (distance > 8) {
          positions[i * 3] *= 0.9;
          positions[i * 3 + 1] *= 0.9;
          positions[i * 3 + 2] *= 0.9;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;

      // Gentle rotation
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={1.5}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

// Cosmic Energy Flow Particles
export const CosmicEnergyFlow = ({ startPosition, endPosition, particleCount = 200 }) => {
  const pointsRef = useRef();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const direction = new THREE.Vector3()
      .subVectors(endPosition, startPosition)
      .normalize();

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const position = new THREE.Vector3()
        .copy(startPosition)
        .lerp(endPosition, t);

      // Add some perpendicular offset for flow effect
      const perpendicular = new THREE.Vector3()
        .crossVectors(direction, new THREE.Vector3(0, 1, 0))
        .normalize()
        .multiplyScalar((Math.random() - 0.5) * 2);

      position.add(perpendicular);

      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Energy flow colors (blue to purple gradient)
      colors[i * 3] = 0.2 + t * 0.8;     // R
      colors[i * 3 + 1] = 0.4 + t * 0.6; // G
      colors[i * 3 + 2] = 1.0 - t * 0.3; // B
    }

    return { positions, colors };
  }, [startPosition, endPosition, particleCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Flowing animation
      const time = state.clock.elapsedTime;
      const positions = pointsRef.current.geometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        const baseIndex = i * 3;
        const speed = 0.5 + Math.sin(time * 2 + i * 0.1) * 0.3;

        // Move particles along the flow
        positions[baseIndex] += (endPosition.x - startPosition.x) * speed * 0.01;
        positions[baseIndex + 1] += (endPosition.y - startPosition.y) * speed * 0.01;
        positions[baseIndex + 2] += (endPosition.z - startPosition.z) * speed * 0.01;

        // Reset particles that reach the end
        const currentPos = new THREE.Vector3(
          positions[baseIndex],
          positions[baseIndex + 1],
          positions[baseIndex + 2]
        );

        if (currentPos.distanceTo(endPosition) < 1) {
          positions[baseIndex] = startPosition.x;
          positions[baseIndex + 1] = startPosition.y;
          positions[baseIndex + 2] = startPosition.z;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.8}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Zodiac Sign Aura Particles
export const ZodiacSignAura = ({ sign, system, position = [0, 0, 0], active = false }) => {
  const pointsRef = useRef();

  const { positions, colors } = useMemo(() => {
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Get element for this sign
    const element = Object.entries(ZODIAC_SYSTEMS[system]?.elements || {})
      .find(([_, signs]) => signs.includes(sign))?.[0];
    const elementColor = ELEMENT_COLORS[element] || ELEMENT_COLORS.FIRE;

    for (let i = 0; i < particleCount; i++) {
      // Create aura around the sign
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Aura colors
      const alpha = Math.random();
      colors[i * 3] = elementColor.primary.r / 255 * alpha;
      colors[i * 3 + 1] = elementColor.primary.g / 255 * alpha;
      colors[i * 3 + 2] = elementColor.primary.b / 255 * alpha;
    }

    return { positions, colors };
  }, [sign, system]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Aura breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      pointsRef.current.scale.setScalar(active ? breathe : 0.3);

      // Gentle rotation
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={1}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

export default ZodiacParticleUniverse;