'use client';

import { useEffect, useState } from 'react';
import { PostCreation } from './PostCreation';
import { FloatingPostIslands } from './feed/FloatingPostIslands';

interface Post {
  id: string;
  content: string;
  author: string;
  zodiacEmoji: string;
  emotionalTone: string;
  timestamp: string;
  image_url?: string;
  video_url?: string;
  hls_url?: string;
}

export function CosmicFeed3D() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts(); // Refresh posts after creating a new one
  };

  return (
    <div className="relative w-full h-screen">
      {/* Post Creation Form */}
      <div className="absolute top-4 left-4 z-10">
        <PostCreation onPostCreated={handlePostCreated} />
      </div>

      {/* 3D Feed */}
      <FloatingPostIslands posts={posts} />
    </div>
  );
}