'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Link from 'next/link';
import Starfield from '../components/Starfield';
import MentorOverlay from '../components/MentorOverlay';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const socket = io(API_URL.replace('/api/v1', ''), {
  path: '/socket.io',
});

interface Post {
  id: number;
  username: string;
  zodiac_sign: string;
  content: string;
  created_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showMentor, setShowMentor] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/posts`)
      .then((res) => setPosts(res.data.items || []))
      .catch((err) => console.error('Axios /posts error:', err.message));

    socket.on('post_update', (data) => {
      setPosts((prevPosts) => [...prevPosts, data]);
    });

    return () => {
      socket.off('post_update');
    };
  }, []);

  // Show mentor overlay after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMentor(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Starfield />
      <main className="container mx-auto p-4 relative z-10">
        <h1 className="text-3xl font-bold mb-2">Welcome to Star</h1>
        <nav className="mb-6 space-x-4">
          <Link href="/login" className="text-blue-400 underline">Login</Link>
          <Link href="/register" className="text-blue-400 underline">Register</Link>
          <Link href="/zodiac" className="text-blue-400 underline">Zodiac Numbers</Link>
          <Link href="/birth-chart/input" className="text-blue-400 underline">Birth Chart</Link>
          <Link href="/archetype-oracle" className="text-blue-400 underline">My Oracle</Link>
          <Link href="/public-archetype-oracle" className="text-blue-400 underline">Public Oracle</Link>
          <Link href="/post" className="text-blue-400 underline">Create Post</Link>
        </nav>
        {posts.map((post: Post) => (
          <div key={post.id} className="mb-2">
            <strong>{post.username} ({post.zodiac_sign})</strong>: {post.content}
          </div>
        ))}
      </main>

      {/* Mentor Overlay */}
      <MentorOverlay isVisible={showMentor} />
    </div>
  );
}
