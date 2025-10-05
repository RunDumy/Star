import { useCollaboration } from '@/contexts/CollaborationContext';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const CollaborativeAvatar = ({
  userId,
  position = [0, 0, 0],
  showLabel = true,
  interactive = true,
  onClick,
  ...props
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [userData, setUserData] = useState(null);
  const { onlineUsers, avatars, currentUser, updateAvatar } = useCollaboration();

  // Get user data
  useEffect(() => {
    if (userId === currentUser?.id) {
      setUserData(currentUser);
    } else {
      const onlineUser = onlineUsers.get(userId);
      if (onlineUser) {
        setUserData(onlineUser);
      }
    }
  }, [userId, currentUser, onlineUsers]);

  // Get avatar data
  const avatarData = avatars.get(userId) || userData?.avatar || {
    position: position,
    color: '#ffffff',
    shape: 'sphere',
    size: 0.5,
  };

  // Update position if this is current user
  useEffect(() => {
    if (userId === currentUser?.id && meshRef.current) {
      const newPosition = meshRef.current.position.toArray();
      if (JSON.stringify(newPosition) !== JSON.stringify(avatarData.position)) {
        updateAvatar({ position: newPosition });
      }
    }
  }, [userId, currentUser?.id, avatarData.position, updateAvatar]);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = avatarData.position[1] + Math.sin(state.clock.elapsedTime + userId.length) * 0.1;

      // Subtle rotation
      meshRef.current.rotation.y += 0.005;

      // Pulse effect when hovered
      if (hovered) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  // Handle avatar shape
  const renderAvatarShape = () => {
    const { shape, size = 0.5 } = avatarData;

    switch (shape) {
      case 'cube':
        return (
          <boxGeometry args={[size * 1.6, size * 1.6, size * 1.6]} />
        );
      case 'pyramid':
        return (
          <coneGeometry args={[size * 1.2, size * 2, 4]} />
        );
      case 'octahedron':
        return (
          <octahedronGeometry args={[size]} />
        );
      case 'tetrahedron':
        return (
          <tetrahedronGeometry args={[size]} />
        );
      case 'dodecahedron':
        return (
          <dodecahedronGeometry args={[size]} />
        );
      case 'sphere':
      default:
        return (
          <sphereGeometry args={[size, 16, 16]} />
        );
    }
  };

  // Handle click
  const handleClick = (event) => {
    event.stopPropagation();
    if (onClick && userData) {
      onClick(userData, event);
    }
  };

  if (!userData) {
    return null; // Don't render if user data not available
  }

  return (
    <group position={avatarData.position} {...props}>
      {/* Avatar mesh */}
      <mesh
        ref={meshRef}
        onClick={interactive ? handleClick : undefined}
        onPointerOver={() => interactive && setHovered(true)}
        onPointerOut={() => interactive && setHovered(false)}
        castShadow
        receiveShadow
      >
        {renderAvatarShape()}
        <meshStandardMaterial
          color={avatarData.color}
          emissive={avatarData.color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* User label */}
      {showLabel && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.2}
          color={avatarData.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {userData.name}
        </Text>
      )}

      {/* Online indicator */}
      <mesh position={[0.3, 0.3, 0.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#4CAF50" />
      </mesh>

      {/* Hover indicator */}
      {hovered && (
        <mesh position={[0, -0.8, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial
            color={avatarData.color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

CollaborativeAvatar.propTypes = {
  userId: PropTypes.string.isRequired,
  position: PropTypes.arrayOf(PropTypes.number),
  showLabel: PropTypes.bool,
  interactive: PropTypes.bool,
  onClick: PropTypes.func,
};