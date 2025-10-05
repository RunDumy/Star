'use client';
import { useEffect, useRef, useState } from 'react';
import { CosmicPost3D } from './CosmicPost3D';

interface CosmicFeed3DProps {
  posts: Array<{
    id: number;
    content: string;
    username: string;
    zodiac_sign: string;
    image_url?: string;
    spark_count: number;
    echo_count: number;
    comment_count: number;
    created_at: string;
  }>;
}

export function CosmicFeed3D({ posts }: CosmicFeed3DProps) {
  const [scrollY, setScrollY] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={feedRef}
      className="cosmic-feed-3d relative min-h-screen"
      style={{
        '--scroll-y': `${scrollY}px`
      } as React.CSSProperties}
    >
      {/* 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating cosmic particles */}
        <div className="cosmic-particle particle-1" />
        <div className="cosmic-particle particle-2" />
        <div className="cosmic-particle particle-3" />

        {/* Nebula background with parallax */}
        <div className="cosmic-nebula nebula-1" />
        <div className="cosmic-nebula nebula-2" />
      </div>

      {/* Main Feed Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Feed Header */}
        <header className="text-center mb-12 cosmic-feed-header">
          <h1 className="text-4xl font-bold text-white mb-4 cosmic-glow">
            Cosmic Feed
          </h1>
          <p className="text-purple-300 text-lg">
            Explore the depths of shared consciousness
          </p>
        </header>

        {/* Posts with Staggered Animation */}
        <div className="space-y-8">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="cosmic-post-wrapper"
              style={{
                '--stagger-delay': `${index * 0.1}s`,
                '--scroll-offset': `${scrollY * 0.1}px`
              } as React.CSSProperties}
            >
              <CosmicPost3D post={post} index={index} />
            </div>
          ))}
        </div>

        {/* Load More Indicator */}
        {posts.length > 0 && (
          <div className="text-center py-12">
            <div className="cosmic-load-more text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-center space-x-2">
                <div className="cosmic-spinner" />
                <span>Load more cosmic posts...</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <div className="cosmic-empty-state text-gray-400 text-xl">
              No posts yet. Be the first to share your cosmic thoughts!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}