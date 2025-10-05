"use client";

import { animated, useSpring } from '@react-spring/three';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { OrbitSystem } from '../OrbitSystem';

interface Post {
  id: string;
  content: string;
  author: string;
  zodiacEmoji: string;
  emotionalTone: string;
  timestamp: string;
}

interface FloatingPostIslandsProps {
  posts?: Post[];
}

export const FloatingPostIslands: React.FC<FloatingPostIslandsProps> = ({ posts = [] }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  return (
    <div className="w-full h-screen relative">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <color attach="background" args={['#0a0a1f']} />
        
        {/* Cosmic Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        {/* Post Asteroids with Orbit System */}
        <OrbitSystem>
          <PostNebula 
            posts={posts} 
            onPostSelect={setSelectedPost}
          />
        </OrbitSystem>
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>
      
      {/* UI Overlay */}
      {selectedPost && (
        <PostModal 
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

interface PostNebulaProps {
  posts: Post[];
  onPostSelect: (post: Post) => void;
}

const PostNebula: React.FC<PostNebulaProps> = ({ posts, onPostSelect }) => {
  const positions = useMemo(() => 
    posts.map((_, i) => {
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      return [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ];
    }), [posts.length]
  );

  return (
    <>
      {positions.map((position, i) => (
        <PostAsteroid
          key={posts[i].id}
          post={posts[i]}
          position={position as [number, number, number]}
          onClick={() => onPostSelect(posts[i])}
          index={i}
        />
      ))}
    </>
  );
};

interface PostAsteroidProps {
  post: Post;
  position: [number, number, number];
  onClick: () => void;
  index: number;
}

const PostAsteroid: React.FC<PostAsteroidProps> = ({ post, position, onClick, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { scale, rotationY } = useSpring({
    scale: hovered ? 1.2 : 1,
    rotationY: hovered ? Math.PI : 0,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.3;
    }
  });

  const emotionalColor = {
    joyful: '#ffd700',
    contemplative: '#4a90e2',
    passionate: '#ff6b6b',
    peaceful: '#9b59b6',
    mysterious: '#2ecc71'
  }[post.emotionalTone] || '#ffffff';

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      rotation-y={rotationY}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial 
        color={emotionalColor}
        emissive={emotionalColor}
        emissiveIntensity={0.3}
        roughness={0.7}
        metalness={0.3}
      />
      
      {/* Surface Glyphs */}
      <Text
        position={[0, 0, 1.2]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {post.zodiacEmoji}
      </Text>
    </animated.mesh>
  );
};

interface PostModalProps {
  post: Post;
  onClose: () => void;
}

export const PostModal: React.FC<PostModalProps> = ({ post, onClose }) => {
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
          className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{post.zodiacEmoji}</div>
              <div>
                <h3 className="text-white font-semibold">{post.author}</h3>
                <p className="text-cyan-200 text-sm">{post.timestamp}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-cyan-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="text-white mb-4 leading-relaxed">
            {post.content}
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex space-x-4 text-cyan-200">
              <button className="hover:text-white transition-colors">💫 Resonate</button>
              <button className="hover:text-white transition-colors">🔗 Thread</button>
              <button className="hover:text-white transition-colors">⭐ Save</button>
            </div>
            <div className="text-purple-300">
              {post.emotionalTone}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};