import { useCollaboration } from '@/contexts/CollaborationContext';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import * as THREE from 'three';

export const ConstellationRenderer = ({
  constellationId,
  onStarClick,
  onLineClick,
  interactive = true,
  showLabels = true,
  ...props
}) => {
  const groupRef = useRef();
  const [hoveredStar, setHoveredStar] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);
  const { constellations } = useCollaboration();

  // Get the constellation data
  const constellation = constellations.get(constellationId);

  // Animation loop - must be called unconditionally before any early returns
  useFrame((state) => {
    if (groupRef.current && constellation) {
      // Gentle pulsing animation for the entire constellation
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  if (!constellation) return null;

  const handleStarClick = (star, starIndex, event) => {
    event.stopPropagation();
    if (interactive && onStarClick) {
      onStarClick(star, starIndex, constellation, event);
    }
  };

  const handleLineClick = (connection, connectionIndex, event) => {
    event.stopPropagation();
    if (interactive && onLineClick) {
      onLineClick(connection, connectionIndex, constellation, event);
    }
  };

  return (
    <group ref={groupRef} {...props}>
      {/* Render stars */}
      {constellation.stars.map((star, starIndex) => {
        const isHovered = hoveredStar === starIndex;
        return (
          <group key={star.id} position={star.position}>
            {/* Star mesh */}
            <mesh
              onClick={(event) => handleStarClick(star, starIndex, event)}
              onPointerOver={() => interactive && setHoveredStar(starIndex)}
              onPointerOut={() => interactive && setHoveredStar(null)}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[star.size, 16, 16]} />
              <meshStandardMaterial
                color={star.color}
                emissive={star.color}
                emissiveIntensity={isHovered ? 0.4 : 0.2}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>

            {/* Star label */}
            {showLabels && (
              <Text
                position={[0, star.size + 0.3, 0]}
                fontSize={0.15}
                color={star.color}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
              >
                {star.name}
              </Text>
            )}

            {/* Hover indicator */}
            {isHovered && (
              <mesh position={[0, -star.size - 0.2, 0]}>
                <ringGeometry args={[star.size * 1.5, star.size * 1.8, 16]} />
                <meshBasicMaterial
                  color={star.color}
                  transparent
                  opacity={0.6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Render connections */}
      {constellation.connections.map((connection, connectionIndex) => {
        const [startIndex, endIndex] = connection;
        const startStar = constellation.stars[startIndex];
        const endStar = constellation.stars[endIndex];

        if (!startStar || !endStar) return null;

        const startPos = new THREE.Vector3(...startStar.position);
        const endPos = new THREE.Vector3(...endStar.position);
        const distance = startPos.distanceTo(endPos);
        const direction = endPos.clone().sub(startPos).normalize();
        const position = startPos.clone().add(direction.clone().multiplyScalar(distance * 0.5));

        // Calculate rotation to align with the connection
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

        const isHovered = hoveredLine === connectionIndex;

        return (
          <group key={`${startIndex}-${endIndex}`}>
            {/* Connection line */}
            <mesh
              position={position}
              quaternion={quaternion}
              onClick={(event) => handleLineClick(connection, connectionIndex, event)}
              onPointerOver={() => interactive && setHoveredLine(connectionIndex)}
              onPointerOut={() => interactive && setHoveredLine(null)}
            >
              <cylinderGeometry args={[0.01, 0.01, distance, 8]} />
              <meshStandardMaterial
                color={constellation.lineColor || '#ffffff'}
                emissive={constellation.lineColor || '#ffffff'}
                emissiveIntensity={isHovered ? 0.3 : 0.1}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Connection glow effect */}
            <mesh
              position={position}
              quaternion={quaternion}
            >
              <cylinderGeometry args={[0.02, 0.02, distance, 8]} />
              <meshBasicMaterial
                color={constellation.lineColor || '#ffffff'}
                transparent
                opacity={isHovered ? 0.2 : 0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Constellation name label */}
      {showLabels && constellation.name && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {constellation.name}
        </Text>
      )}
    </group>
  );
};

ConstellationRenderer.propTypes = {
  constellationId: PropTypes.string.isRequired,
  onStarClick: PropTypes.func,
  onLineClick: PropTypes.func,
  interactive: PropTypes.bool,
  showLabels: PropTypes.bool,
};
