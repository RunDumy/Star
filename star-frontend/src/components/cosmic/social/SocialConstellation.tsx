"use client";

import { animated, useSpring } from '@react-spring/three';
import { Line, OrbitControls, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { OrbitSystem } from '../OrbitSystem';

interface Connection {
  id: string;
  name: string;
  zodiac: string;
  emotionalState: string;
  engagement: number;
}

interface SocialConstellationProps {
  connections?: Connection[];
}

export const SocialConstellation: React.FC<SocialConstellationProps> = ({ connections = [] }) => {
  const [selectedUser, setSelectedUser] = useState<Connection | null>(null);
  const [viewMode, setViewMode] = useState('emotional');
  
  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#000011']} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} />
        <ambientLight intensity={0.2} />
        
        <OrbitSystem>
          <ConstellationNetwork 
            connections={connections}
            viewMode={viewMode}
            onUserSelect={setSelectedUser}
          />
        </OrbitSystem>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
      
      {/* View Mode Controls */}
      <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
        <div className="flex space-x-2">
          {['emotional', 'zodiac', 'temporal', 'engagement'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-sm capitalize transition-all ${
                viewMode === mode 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-cyan-200 hover:bg-cyan-500/20'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected User Info */}
      {selectedUser && (
        <UserDetails 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

interface ConstellationNetworkProps {
  connections: Connection[];
  viewMode: string;
  onUserSelect: (user: Connection) => void;
}

const ConstellationNetwork: React.FC<ConstellationNetworkProps> = ({ connections, viewMode, onUserSelect }) => {
  const userNodes = useMemo(() => {
    const centerUser = {
      id: 'current',
      name: 'You',
      zodiac: 'current',
      emotionalState: 'centered',
      engagement: 1
    };
    
    return [centerUser, ...connections];
  }, [connections]);

  const positions = useMemo(() => 
    userNodes.map((_, i) => {
      if (i === 0) return [0, 0, 0]; // Center user
      
      const radius = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      return [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ];
    }), [userNodes.length]
  );

  return (
    <group>
      {/* Connection Lines */}
      {userNodes.slice(1).map((user, i) => (
        <ConnectionBeam
          key={user.id}
          from={[0, 0, 0]}
          to={positions[i + 1] as [number, number, number]}
          strength={user.engagement}
          viewMode={viewMode}
        />
      ))}
      
      {/* User Nodes */}
      {userNodes.map((user, i) => (
        <UserNode
          key={user.id}
          user={user}
          position={positions[i] as [number, number, number]}
          viewMode={viewMode}
          onClick={() => onUserSelect(user)}
          isCenter={i === 0}
        />
      ))}
    </group>
  );
};

interface UserNodeProps {
  user: Connection;
  position: [number, number, number];
  viewMode: string;
  onClick: () => void;
  isCenter: boolean;
}

const UserNode: React.FC<UserNodeProps> = ({ user, position, viewMode, onClick, isCenter }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { scale } = useSpring({
    scale: hovered ? 1.3 : 1,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  useFrame((state) => {
    if (meshRef.current && !isCenter) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const getNodeColor = () => {
    if (isCenter) return '#ffffff';
    
    switch (viewMode) {
      case 'emotional':
        return {
          joyful: '#f1c40f',
          contemplative: '#3498db',
          passionate: '#e74c3c',
          peaceful: '#2ecc71',
          mysterious: '#9b59b6'
        }[user.emotionalState] || '#95a5a6';
      
      case 'zodiac':
        return {
          aries: '#e74c3c',
          taurus: '#27ae60',
          gemini: '#f1c40f',
          cancer: '#3498db',
          leo: '#e67e22',
          virgo: '#2ecc71',
          libra: '#9b59b6',
          scorpio: '#8e44ad',
          sagittarius: '#d35400',
          capricorn: '#34495e',
          aquarius: '#2980b9',
          pisces: '#16a085'
        }[user.zodiac] || '#7f8c8d';
      
      default:
        return '#4a90e2';
    }
  };

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[isCenter ? 0.8 : 0.4, 16, 16]} />
      <meshStandardMaterial 
        color={getNodeColor()}
        emissive={getNodeColor()}
        emissiveIntensity={0.3}
        transparent
        opacity={0.9}
      />
      
      {/* User Name */}
      <Text
        position={[0, isCenter ? 1.2 : 0.7, 0]}
        fontSize={isCenter ? 0.3 : 0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {isCenter ? 'You' : user.name}
      </Text>
    </animated.mesh>
  );
};

interface ConnectionBeamProps {
  from: [number, number, number];
  to: [number, number, number];
  strength: number;
  viewMode: string;
}

const ConnectionBeam: React.FC<ConnectionBeamProps> = ({ from, to, strength, viewMode }) => {
  const lineRef = useRef<THREE.Line>(null);
  
  useFrame((state) => {
    if (lineRef.current) {
      // Pulsing effect based on connection strength
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      lineRef.current.material.opacity = strength * pulse * 0.6;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={viewMode === 'emotional' ? '#4a90e2' : '#9b59b6'}
      lineWidth={strength * 3}
      transparent
      opacity={strength * 0.6}
    />
  );
};

interface UserDetailsProps {
  user: Connection;
  onClose: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
        <p className="text-cyan-200">Zodiac: {user.zodiac}</p>
        <p className="text-cyan-200">Emotional State: {user.emotionalState}</p>
        <p className="text-cyan-200">Engagement: {user.engagement}</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded">Close</button>
      </div>
    </div>,
    document.body
  );
};