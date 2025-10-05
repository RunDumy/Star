"use client";

import { animated, useSpring } from '@react-spring/three';
import { OrbitControls, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { OrbitSystem } from '../OrbitSystem';

interface Orb {
  id: string;
  message: string;
  emotionalTone: string;
  anonymity: boolean;
  timestamp: string;
  responses: any[];
}

interface ThoughtOrbSystemProps {
  orbs?: Orb[];
  onOrbCreate: (orb: Omit<Orb, 'id' | 'timestamp' | 'responses'>) => void;
}

export const ThoughtOrbSystem: React.FC<ThoughtOrbSystemProps> = ({ orbs = [], onOrbCreate }) => {
  const [creatingOrb, setCreatingOrb] = useState(false);
  
  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={['#0f0f23']} />
        
        <Stars radius={100} depth={50} count={3000} factor={4} />
        <ambientLight intensity={0.4} />
        <pointLight position={[15, 15, 15]} intensity={1} />
        
        <OrbitSystem>
          <OrbNebula orbs={orbs} />
        </OrbitSystem>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={40}
        />
      </Canvas>
      
      {/* Orb Creation Interface */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setCreatingOrb(true)}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          Release Thought Orb
        </button>
      </div>
      
      {creatingOrb && (
        <OrbCreator 
          onSubmit={onOrbCreate}
          onClose={() => setCreatingOrb(false)}
        />
      )}
    </div>
  );
};

interface OrbNebulaProps {
  orbs: Orb[];
}

const OrbNebula: React.FC<OrbNebulaProps> = ({ orbs }) => {
  const positions = useMemo(() => 
    orbs.map((_, i) => {
      const radius = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      return new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }), [orbs.length]
  );

  return (
    <>
      {orbs.map((orb, i) => (
        <ThoughtOrb
          key={orb.id}
          orb={orb}
          position={positions[i]}
          index={i}
        />
      ))}
    </>
  );
};

interface ThoughtOrbProps {
  orb: Orb;
  position: THREE.Vector3;
  index: number;
}

const ThoughtOrb: React.FC<ThoughtOrbProps> = ({ orb, position, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  
  const { scale } = useSpring({
    scale: active ? 1.5 : 1,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.1;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.2 + index) * 0.1;
    }
  });

  const emotionalColor = {
    meditative: '#4a90e2',
    curious: '#9b59b6', 
    hopeful: '#2ecc71',
    reflective: '#3498db',
    mysterious: '#e74c3c'
  }[orb.emotionalTone] || '#f1c40f';

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerOver={() => setActive(true)}
      onPointerOut={() => setActive(false)}
      onClick={() => console.log('Orb clicked:', orb)}
    >
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial 
        color={emotionalColor}
        emissive={emotionalColor}
        emissiveIntensity={0.4}
        transparent
        opacity={0.9}
        roughness={0.2}
        metalness={0.8}
      />
      
      {/* Orb Glow Effect */}
      <pointLight color={emotionalColor} intensity={0.5} distance={4} />
    </animated.mesh>
  );
};

interface OrbCreatorProps {
  onSubmit: (orb: Omit<Orb, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

export const OrbCreator: React.FC<OrbCreatorProps> = ({ onSubmit, onClose }) => {
  const [message, setMessage] = useState('');
  const [emotionalTone, setEmotionalTone] = useState('meditative');
  const [anonymity, setAnonymity] = useState(true);

  const emotionalTones = [
    { value: 'meditative', label: '🧘 Meditative', color: '#4a90e2' },
    { value: 'curious', label: '🔍 Curious', color: '#9b59b6' },
    { value: 'hopeful', label: '🌟 Hopeful', color: '#2ecc71' },
    { value: 'reflective', label: '💭 Reflective', color: '#3498db' },
    { value: 'mysterious', label: '🔮 Mysterious', color: '#e74c3c' }
  ];

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit({
        message: message.trim(),
        emotionalTone,
        anonymity,
        responses: []
      });
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Release Thought Orb</h2>
          <p className="text-cyan-200 mb-6">Send your message into the cosmic void</p>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What wisdom, question, or intention would you release to the cosmos?"
            className="w-full h-32 bg-black/30 border border-cyan-500/30 rounded-lg p-4 text-white placeholder-cyan-200/60 resize-none focus:outline-none focus:border-cyan-400"
            maxLength={280}
          />
          
          <div className="text-cyan-200 text-sm text-right mb-4">
            {message.length}/280
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-cyan-200 text-sm font-medium mb-2 block">
                Emotional Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {emotionalTones.map(tone => (
                  <button
                    key={tone.value}
                    onClick={() => setEmotionalTone(tone.value)}
                    className={`p-2 rounded-lg border transition-all ${
                      emotionalTone === tone.value 
                        ? 'border-cyan-400 bg-cyan-400/20 text-white' 
                        : 'border-cyan-500/30 text-cyan-200 hover:border-cyan-400'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
            
            <label className="flex items-center space-x-3 text-cyan-200">
              <input
                type="checkbox"
                checked={anonymity}
                onChange={(e) => setAnonymity(e.target.checked)}
                className="rounded border-cyan-500/30 bg-black/30 text-cyan-400 focus:ring-cyan-400"
              />
              <span>Release anonymously</span>
            </label>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-cyan-500/30 text-cyan-200 rounded-lg hover:bg-cyan-500/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Release Orb
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};