"use client";

import { CosmicInterface } from '../components/cosmic/CosmicInterface';
import { ContentNebula } from '../components/cosmic/ContentNebula';
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
  // Calculate orbital positions for posts
  const calculateOrbitalPosition = (index: number) => {
    const angle = (index / mockPosts.length) * Math.PI * 2;
    const radius = 15 + (index * 5);
    return [
      Math.cos(angle) * radius,
      Math.sin(angle * 0.5) * 8,
      Math.sin(angle) * radius
    ] as [number, number, number];
  };

  return (
    <div className="w-full h-screen bg-black">
      <CosmicInterface cameraPosition={[0, 5, 30]}>
        <ContentNebula density={0.7} emotionalResonance={0.6}>
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

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white">
        <h1 className="text-2xl font-bold text-purple-300 mb-2">Floating Post Islands</h1>
        <p className="text-sm text-purple-200">Click on asteroids to excavate cosmic posts</p>
      </div>
    </div>
  );
}