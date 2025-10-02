'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Starfield from '../components/Starfield';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const socket = io(API_URL.replace('/api/v1', ''), {
  path: '/socket.io',
});

export default function Home() {
  const [posts, setPosts] = useState([]);

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Starfield />
      <main className="container mx-auto p-4 relative z-10">
        <h1 className="text-3xl font-bold mb-2">Welcome to Star</h1>
        <nav className="mb-6 space-x-4">
          <a href="/login" className="text-blue-400 underline">Login</a>
          <a href="/register" className="text-blue-400 underline">Register</a>
          <a href="/zodiac" className="text-blue-400 underline">Zodiac Numbers</a>
          <a href="/archetype-oracle" className="text-blue-400 underline">My Oracle</a>
          <a href="/public-archetype-oracle" className="text-blue-400 underline">Public Oracle</a>
          <a href="/post" className="text-blue-400 underline">Create Post</a>
        </nav>
        {posts.map((post: any) => (
          <div key={post.id} className="mb-2">
            <strong>{post.username} ({post.zodiac_sign})</strong>: {post.content}
          </div>
        ))}
      </main>
    </div>
  );
}
