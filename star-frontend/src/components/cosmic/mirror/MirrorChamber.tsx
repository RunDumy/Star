"use client";

import { Environment, OrbitControls, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { OrbitSystem } from '../OrbitSystem';

export const MirrorChamber = () => {
  const [activePortal, setActivePortal] = useState<string | null>(null);
  const [reflectionDepth, setReflectionDepth] = useState(0);

  const portals = [
    { id: 'emotional', label: 'Emotional Timeline', emoji: '📊', color: '#4a90e2' },
    { id: 'tarot', label: 'Tarot Wisdom', emoji: '🃏', color: '#9b59b6' },
    { id: 'mentor', label: 'Mentor Guidance', emoji: '👁️', color: '#2ecc71' },
    { id: 'journal', label: 'Cosmic Journal', emoji: '📖', color: '#e74c3c' }
  ];

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <Environment preset="night" />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        
        {/* Central Mirror and Portals with Orbit System */}
        <OrbitSystem>
          <MirrorSurface 
            reflectionDepth={reflectionDepth}
            onDepthChange={setReflectionDepth}
          />
          
          <PortalRing 
            portals={portals}
            onPortalSelect={setActivePortal}
          />
        </OrbitSystem>
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* Reflection Depth Control */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 border border-cyan-500/30">
          <input
            type="range"
            min="0"
            max="100"
            value={reflectionDepth * 100}
            onChange={(e) => setReflectionDepth(Number(e.target.value) / 100)}
            className="w-64 accent-cyan-400"
          />
        </div>
      </div>
      
      {/* Active Portal Overlay */}
      <AnimatePresence>
        {activePortal && (
          <PortalRealm 
            portal={activePortal}
            onClose={() => setActivePortal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface MirrorSurfaceProps {
  reflectionDepth: number;
  onDepthChange: (depth: number) => void;
}

const MirrorSurface: React.FC<MirrorSurfaceProps> = ({ reflectionDepth, onDepthChange }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <circleGeometry args={[3, 64]} />
      <meshStandardMaterial 
        color="#4a90e2"
        emissive="#4a90e2"
        emissiveIntensity={0.3 + reflectionDepth * 0.7}
        transparent
        opacity={0.8 + reflectionDepth * 0.2}
        metalness={0.9}
        roughness={0.1}
      />
      
      {/* Reflection Depth Indicator */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`Reflection: ${Math.round(reflectionDepth * 100)}%`}
      </Text>
    </mesh>
  );
};

interface PortalRingProps {
  portals: { id: string; label: string; emoji: string; color: string }[];
  onPortalSelect: (id: string) => void;
}

const PortalRing: React.FC<PortalRingProps> = ({ portals, onPortalSelect }) => {
  return (
    <>
      {portals.map((portal, i) => {
        const angle = (i / portals.length) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <PortalGate
            key={portal.id}
            portal={portal}
            position={[x, y, 0]}
            onClick={() => onPortalSelect(portal.id)}
          />
        );
      })}
    </>
  );
};

interface PortalGateProps {
  portal: { id: string; label: string; emoji: string; color: string };
  position: [number, number, number];
  onClick: () => void;
}

const PortalGate: React.FC<PortalGateProps> = ({ portal, position, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      meshRef.current.scale.x = hovered ? 1.2 : 1;
      meshRef.current.scale.y = hovered ? 1.2 : 1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <ringGeometry args={[0.8, 1, 32]} />
      <meshStandardMaterial 
        color={portal.color}
        emissive={portal.color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.8}
      />
      
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {portal.emoji}
      </Text>
    </mesh>
  );
};

interface PortalRealmProps {
  portal: string;
  onClose: () => void;
}

const PortalRealm: React.FC<PortalRealmProps> = ({ portal, onClose }) => {
  const content = {
    emotional: "Explore your emotional timeline...",
    tarot: "Draw a tarot card for guidance...",
    mentor: "Connect with your inner mentor...",
    journal: "Write in your cosmic journal..."
  }[portal] || "Portal content";

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-white mb-4">{portal}</h2>
          <p className="text-cyan-200">{content}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};