"use client";

import { ContentNebula } from '../components/cosmic/ContentNebula';
import { CosmicInterface } from '../components/cosmic/CosmicInterface';
import { PostAsteroid } from '../components/cosmic/PostAsteroid';

// Mock post data for testing
const mockPosts = [
  {
    id: '1',
    content: 'The stars align in mysterious ways tonight...',
    author: 'Cosmic Wanderer',
    timestamp: new Date(),
    emotionalTone: 'peace',
    zodiacSigns: ['Pisces', 'Sagittarius'],
    engagementScore: 0.8,
    likes: 12,
    comments: 5
  },
  {
    id: '2',
    content: 'Feeling the lunar pull stronger than ever!',
    author: 'Moon Child',
    timestamp: new Date(),
    emotionalTone: 'joy',
    zodiacSigns: ['Cancer', 'Pisces'],
    engagementScore: 0.6,
    likes: 8,
    comments: 3
  },
  {
    id: '3',
    content: 'The void calls to me...',
    author: 'Shadow Walker',
    timestamp: new Date(),
    emotionalTone: 'fear',
    zodiacSigns: ['Scorpio', 'Capricorn'],
    engagementScore: 0.4,
    likes: 5,
    comments: 2
  }
];

export default function FloatingPostIslandsPage() {
  // Calculate orbital positions for posts with more depth
  const calculateOrbitalPosition = (index: number) => {
    const angle = (index / mockPosts.length) * Math.PI * 2;
    const distance = 20 + (index * 8); // Increased distance for depth
    const height = Math.sin(angle * 1.5) * 6;
    return [
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance
    ] as [number, number, number];
  };

  return (
    <div className="w-full h-screen cosmic-space-background relative overflow-hidden">
      {/* Animated Nebulae */}
      <div className="cosmic-nebula nebula-1"></div>
      <div className="cosmic-nebula nebula-2"></div>
      <div className="cosmic-nebula nebula-3"></div>

      {/* Shooting Stars */}
      <div className="cosmic-shooting-star shooting-star-1"></div>
      <div className="cosmic-shooting-star shooting-star-2"></div>
      <div className="cosmic-shooting-star shooting-star-3"></div>

      <CosmicInterface cameraPosition={[0, 5, 40]}>
        <ContentNebula density={0.8} emotionalResonance={0.7}>
          {mockPosts.map((post, index) => (
            <PostAsteroid
              key={post.id}
              post={post}
              position={calculateOrbitalPosition(index)}
              onExcavate={(postId) => console.log('Excavated post:', postId)}
            />
          ))}
        </ContentNebula>
      </CosmicInterface>

      {/* Enhanced UI Overlay */}
      <div className="absolute top-4 left-4 text-white z-10">
        <h1 className="text-3xl font-bold text-purple-300 mb-2 cosmic-float-3d">Floating Post Islands</h1>
        <p className="text-sm text-purple-200">Navigate the cosmos • Click asteroids to excavate posts</p>
        <div className="mt-4 text-xs text-purple-300/70">
          🌟 Planets orbit in 3D space<br />
          🌌 Nebulae drift through the void<br />
          ⭐ Shooting stars illuminate the darkness
        </div>
      </div>

      {/* Cosmic particles overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="cosmic-particle particle-1"></div>
        <div className="cosmic-particle particle-2"></div>
        <div className="cosmic-particle particle-3"></div>
      </div>
    </div>
  );
}