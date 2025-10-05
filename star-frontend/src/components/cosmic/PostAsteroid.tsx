"use client";

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Html } from '@react-three/drei';

interface PostData {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  emotionalTone: string;
  zodiacSigns: string[];
  engagementScore: number;
  likes: number;
  comments: number;
}

interface PostAsteroidProps {
  post: PostData;
  position: [number, number, number];
  onExcavate?: (postId: string) => void;
  discoveryState?: 'hidden' | 'discovered' | 'excavated';
}

export const PostAsteroid: React.FC<PostAsteroidProps> = ({
  post,
  position,
  onExcavate,
  discoveryState = 'hidden'
}) => {
  const meshRef = useRef<Mesh>(null);
  const [rotationPhase, setRotationPhase] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isExcavated, setIsExcavated] = useState(discoveryState === 'excavated');
  const [showContent, setShowContent] = useState(false);

  // Asteroid rotation when unexplored
  useEffect(() => {
    if (!isExcavated && discoveryState !== 'excavated') {
      const rotation = setInterval(() => {
        setRotationPhase(prev => (prev + 0.005) % (Math.PI * 2));
      }, 50);
      return () => clearInterval(rotation);
    }
  }, [isExcavated, discoveryState]);

  // Handle excavation
  const handleExcavate = () => {
    setIsExcavated(true);
    setShowContent(true);
    onExcavate?.(post.id);
  };

  // Calculate asteroid size based on engagement
  const asteroidSize = 1 + (post.engagementScore * 0.3);

  // Get color based on emotional tone
  const getEmotionalColor = (tone: string) => {
    const colors = {
      joy: '#fbbf24',
      sadness: '#3b82f6',
      anger: '#ef4444',
      fear: '#8b5cf6',
      love: '#ec4899',
      peace: '#10b981'
    };
    return colors[tone as keyof typeof colors] || '#6b7280';
  };

  // Generate surface glyphs
  const surfaceGlyphs = post.zodiacSigns.map((sign, index) => ({
    id: `glyph-${index}`,
    sign,
    position: new Vector3(
      Math.sin((index / post.zodiacSigns.length) * Math.PI * 2) * (asteroidSize + 0.2),
      Math.cos((index / post.zodiacSigns.length) * Math.PI * 2) * (asteroidSize + 0.2),
      Math.sin(index * 0.5) * 0.3
    )
  }));

  useFrame(() => {
    if (meshRef.current && !isExcavated) {
      meshRef.current.rotation.y = rotationPhase;
      meshRef.current.rotation.x = rotationPhase * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Main Asteroid */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={handleExcavate}
      >
        <dodecahedronGeometry args={[asteroidSize, 0]} />
        <meshStandardMaterial
          color={getEmotionalColor(post.emotionalTone)}
          roughness={0.8}
          metalness={0.2}
          emissive={isHovered ? getEmotionalColor(post.emotionalTone) : '#000000'}
          emissiveIntensity={isHovered ? 0.2 : 0}
        />
      </mesh>

      {/* Surface Glyphs (when not excavated) */}
      {!isExcavated && surfaceGlyphs.map((glyph) => (
        <Html key={glyph.id} position={[glyph.position.x, glyph.position.y, glyph.position.z]}>
          <div className="text-xs bg-black/60 text-purple-300 px-1 py-0.5 rounded border border-purple-500/30">
            {glyph.sign}
          </div>
        </Html>
      ))}

      {/* Excavation Trigger Aura */}
      {isHovered && !isExcavated && (
        <mesh>
          <sphereGeometry args={[asteroidSize + 0.5, 16, 16]} />
          <meshBasicMaterial
            color="#4f46e5"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}

      {/* Excavated Content */}
      {isExcavated && showContent && (
        <Html position={[0, asteroidSize + 2, 0]} center>
          <div className="bg-black/90 backdrop-blur-sm border border-purple-500/50 rounded-lg p-4 max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-purple-300">{post.author}</span>
              <button
                onClick={() => setShowContent(false)}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-white mb-3">{post.content}</p>

            <div className="flex items-center gap-4 text-xs text-purple-300">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span className="capitalize">{post.emotionalTone}</span>
            </div>

            {post.zodiacSigns.length > 0 && (
              <div className="flex gap-1 mt-2">
                {post.zodiacSigns.map((sign) => (
                  <span key={sign} className="text-xs bg-purple-600/30 px-1 py-0.5 rounded">
                    {sign}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Engagement Crystals */}
      {isExcavated && (
        <group>
          {Array.from({ length: Math.min(post.likes, 5) }, (_, i) => (
            <mesh key={`like-${i}`} position={[i * 0.5 - 1, -asteroidSize - 1, 0]}>
              <octahedronGeometry args={[0.2, 0]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};