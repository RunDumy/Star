// platforms/star-app/src/components/cosmic/MultiSystemSocialOrbit.jsx
import { animated, useSpring } from '@react-spring/three';
import {
    Float,
    QuadraticBezierLine,
    Text,
    Trail
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';

// Context and Data
import { useCollaboration } from '@/contexts/CollaborationContext';
import { ELEMENT_COLORS, ZODIAC_SYSTEMS } from '@/lib/zodiacSystems';

// Enhanced Multi-System Social Orbit Component
export const MultiSystemSocialOrbit = ({ position = [0, 0, 0], radius = 15 }) => {
  const { onlineUsers, currentUser, constellations } = useCollaboration();
  const orbitRef = useRef();
  const [selectedSystem, setSelectedSystem] = useState('WESTERN');
  const [hoveredUser, setHoveredUser] = useState(null);
  const [orbitSpeed, setOrbitSpeed] = useState(0.5);

  // System-specific orbit configurations
  const systemConfigs = {
    WESTERN: {
      radius: radius,
      color: '#ff6b6b',
      signs: ZODIAC_SYSTEMS.WESTERN.signs,
      elementColors: ELEMENT_COLORS,
      rotationSpeed: 0.3
    },
    CHINESE: {
      radius: radius * 1.2,
      color: '#4ecdc4',
      signs: ZODIAC_SYSTEMS.CHINESE.signs,
      elementColors: ELEMENT_COLORS,
      rotationSpeed: 0.25
    },
    VEDIC: {
      radius: radius * 1.4,
      color: '#ffe66d',
      signs: ZODIAC_SYSTEMS.VEDIC.signs,
      elementColors: ELEMENT_COLORS,
      rotationSpeed: 0.2
    }
  };

  // Animate orbit rotation
  useFrame((state) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = state.clock.elapsedTime * orbitSpeed;
    }
  });

  // Distribute users across the three zodiac systems
  const distributedUsers = useMemo(() => {
    const users = Array.from(onlineUsers.keys());
    const distribution = { WESTERN: [], CHINESE: [], VEDIC: [] };

    users.forEach((userId, index) => {
      const systemIndex = index % 3;
      const systems = ['WESTERN', 'CHINESE', 'VEDIC'];
      distribution[systems[systemIndex]].push(userId);
    });

    return distribution;
  }, [onlineUsers]);

  return (
    <group ref={orbitRef} position={position}>
      {/* Triple Concentric Orbit Rings */}
      {Object.entries(systemConfigs).map(([system, config], index) => (
        <OrbitRing
          key={system}
          system={system}
          config={config}
          users={distributedUsers[system]}
          selected={selectedSystem === system}
          onSelect={() => setSelectedSystem(system)}
          onUserHover={setHoveredUser}
          layer={index}
        />
      ))}

      {/* Central Nexus */}
      <CentralNexus
        selectedSystem={selectedSystem}
        onSystemChange={setSelectedSystem}
        userCount={onlineUsers.size}
      />

      {/* Connection Lines Between Systems */}
      <SystemConnectionLines
        systems={systemConfigs}
        selectedSystem={selectedSystem}
      />

      {/* User Info Tooltip */}
      {hoveredUser && (
        <UserTooltip
          userId={hoveredUser}
          position={[0, 8, 0]}
        />
      )}

      {/* Orbit Controls */}
      <OrbitControls
        orbitSpeed={orbitSpeed}
        onSpeedChange={setOrbitSpeed}
        selectedSystem={selectedSystem}
      />
    </group>
  );
};

// Individual Orbit Ring Component
const OrbitRing = ({
  system,
  config,
  users,
  selected,
  onSelect,
  onUserHover,
  layer
}) => {
  const ringRef = useRef();
  const [ringHovered, setRingHovered] = useState(false);

  // Spring animation for ring selection
  const { scale, opacity } = useSpring({
    scale: selected ? 1.1 : 1,
    opacity: selected ? 1 : 0.7,
    config: config.gentle
  });

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * config.rotationSpeed;
    }
  });

  return (
    <animated.group scale={scale}>
      {/* Main Orbit Ring */}
      <mesh
        ref={ringRef}
        onPointerOver={() => setRingHovered(true)}
        onPointerOut={() => setRingHovered(false)}
        onClick={onSelect}
      >
        <ringGeometry args={[config.radius - 0.5, config.radius + 0.5, 64]} />
        <animated.meshStandardMaterial
          color={config.color}
          emissive={config.color}
          emissiveIntensity={selected ? 0.6 : 0.3}
          transparent
          opacity={opacity}
          side={2}
        />
      </mesh>

      {/* Zodiac Sign Markers */}
      {config.signs.map((sign, index) => {
        const angle = (index / config.signs.length) * Math.PI * 2;
        const x = Math.cos(angle) * config.radius;
        const z = Math.sin(angle) * config.radius;

        const element = Object.entries(ZODIAC_SYSTEMS[system].elements)
          .find(([_, signs]) => signs.includes(sign))?.[0];
        const elementColor = config.elementColors[element]?.primary || config.color;

        return (
          <ZodiacMarker
            key={sign}
            position={[x, 0, z]}
            sign={sign}
            color={elementColor}
            system={system}
            selected={selected}
          />
        );
      })}

      {/* User Avatars on Orbit */}
      {users.map((userId, index) => {
        const angle = (index / Math.max(users.length, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * config.radius;
        const z = Math.sin(angle) * config.radius;

        return (
          <OrbitUserAvatar
            key={userId}
            userId={userId}
            position={[x, 1, z]}
            system={system}
            onHover={onUserHover}
            layer={layer}
          />
        );
      })}

      {/* Ring Highlight Effect */}
      {(selected || ringHovered) && (
        <mesh>
          <ringGeometry args={[config.radius - 1, config.radius + 1, 64]} />
          <meshBasicMaterial
            color={config.color}
            transparent
            opacity={0.2}
            side={2}
          />
        </mesh>
      )}

      {/* System Label */}
      <Text
        position={[0, config.radius + 2, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {system}
      </Text>
    </animated.group>
  );
};

// Zodiac Sign Marker Component
const ZodiacMarker = ({ position, sign, color, system, selected }) => {
  const markerRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      markerRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group ref={markerRef} position={position}>
      {/* Marker Base */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : (selected ? 0.5 : 0.2)}
        />
      </mesh>

      {/* Sign Symbol */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        {sign}
      </Text>

      {/* Hover Effect */}
      {hovered && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
              side={2}
            />
          </mesh>
        </Float>
      )}
    </group>
  );
};

// User Avatar on Orbit
const OrbitUserAvatar = ({ userId, position, system, onHover, layer }) => {
  const avatarRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Get user data (mock for now)
  const userData = useMemo(() => ({
    name: `User ${userId.slice(0, 4)}`,
    zodiacSign: ZODIAC_SYSTEMS[system].signs[Math.floor(Math.random() * 12)],
    element: Object.keys(ZODIAC_SYSTEMS[system].elements)[Math.floor(Math.random() * 4)]
  }), [userId, system]);

  const elementColor = ELEMENT_COLORS[userData.element]?.primary || '#ffffff';

  useFrame((state) => {
    if (avatarRef.current) {
      avatarRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      avatarRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + layer) * 0.3;
    }
  });

  return (
    <group
      ref={avatarRef}
      position={position}
      onPointerOver={() => {
        setHovered(true);
        onHover(userId);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
    >
      {/* Avatar Sphere */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            color={elementColor}
            emissive={elementColor}
            emissiveIntensity={hovered ? 0.7 : 0.3}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      </Float>

      {/* User Indicator */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* Connection Trail */}
      {hovered && (
        <Trail
          width={2}
          length={8}
          color={elementColor}
          attenuation={(t) => t * t}
        >
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={elementColor} />
          </mesh>
        </Trail>
      )}
    </group>
  );
};

// Central Nexus Component
const CentralNexus = ({ selectedSystem, onSystemChange, userCount }) => {
  const nexusRef = useRef();
  const [rotating, setRotating] = useState(true);

  useFrame((state) => {
    if (nexusRef.current && rotating) {
      nexusRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      nexusRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={nexusRef}>
      {/* Central Core */}
      <mesh castShadow>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* System Selection Rings */}
      {['WESTERN', 'CHINESE', 'VEDIC'].map((system, index) => {
        const angle = (index / 3) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <SystemSelector
            key={system}
            system={system}
            position={[x, 0, z]}
            selected={selectedSystem === system}
            onSelect={() => onSystemChange(system)}
          />
        );
      })}

      {/* User Count Display */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {userCount} Online
      </Text>

      {/* Energy Field */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          side={2}
          wireframe
        />
      </mesh>
    </group>
  );
};

// System Selector Component
const SystemSelector = ({ system, position, selected, onSelect }) => {
  const selectorRef = useRef();
  const [hovered, setHovered] = useState(false);

  const systemColors = {
    WESTERN: '#ff6b6b',
    CHINESE: '#4ecdc4',
    VEDIC: '#ffe66d'
  };

  const color = systemColors[system];

  useFrame((state) => {
    if (selectorRef.current) {
      selectorRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group
      ref={selectorRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Selector Ring */}
      <mesh>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.8 : (hovered ? 0.6 : 0.3)}
        />
      </mesh>

      {/* System Initial */}
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {system[0]}
      </Text>
    </group>
  );
};

// Connection Lines Between Systems
const SystemConnectionLines = ({ systems, selectedSystem }) => {
  const connections = [
    ['WESTERN', 'CHINESE'],
    ['CHINESE', 'VEDIC'],
    ['VEDIC', 'WESTERN']
  ];

  return connections.map(([from, to]) => {
    const fromConfig = systems[from];
    const toConfig = systems[to];
    const fromPos = [fromConfig.radius * Math.cos(0), 0, fromConfig.radius * Math.sin(0)];
    const toPos = [toConfig.radius * Math.cos(Math.PI * 2 / 3), 0, toConfig.radius * Math.sin(Math.PI * 2 / 3)];

    return (
      <QuadraticBezierLine
        key={`${from}-${to}`}
        start={fromPos}
        end={toPos}
        mid={[0, 2, 0]}
        color={selectedSystem === from || selectedSystem === to ? '#ffffff' : '#444444'}
        lineWidth={selectedSystem === from || selectedSystem === to ? 3 : 1}
        transparent
        opacity={selectedSystem === from || selectedSystem === to ? 0.8 : 0.3}
      />
    );
  });
};

// User Tooltip Component
const UserTooltip = ({ userId, position }) => {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[3, 1]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        User: {userId.slice(0, 8)}
      </Text>
    </group>
  );
};

// Orbit Controls Component
const OrbitControls = ({ orbitSpeed, onSpeedChange, selectedSystem }) => {
  return (
    <group position={[0, -3, 0]}>
      {/* Speed Control */}
      <mesh
        position={[-2, 0, 0]}
        onClick={() => onSpeedChange(Math.max(0.1, orbitSpeed - 0.1))}
      >
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>

      <Text
        position={[-2, 0.8, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Slower
      </Text>

      <mesh
        position={[2, 0, 0]}
        onClick={() => onSpeedChange(Math.min(2, orbitSpeed + 0.1))}
      >
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#44ff44" />
      </mesh>

      <Text
        position={[2, 0.8, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Faster
      </Text>

      {/* Speed Display */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Speed: {orbitSpeed.toFixed(1)}x
      </Text>
    </group>
  );
};

export default MultiSystemSocialOrbit;