'use client';

import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import CosmicButton from '../components/CosmicButton';
import CosmicNotifications from '../components/CosmicNotifications';
import MentorOverlay from '../components/MentorOverlay';
import StarBackground from '../components/StarBackground';

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

interface User {
  username: string;
  zodiac_sign: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showMentor, setShowMentor] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      // For now, we'll use a placeholder user. In a real app, you'd get this from auth
      setUser({ username: 'Cosmic Traveler', zodiac_sign: 'Libra' });
    }
    fetchUser();

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

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <StarBackground>
      <div className="min-h-screen p-4 text-white">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex space-x-4">
            <Link href="/">
              <CosmicButton variant="primary" size="md" zodiacSign={user?.zodiac_sign}>
                Home
              </CosmicButton>
            </Link>
            <CosmicButton variant="secondary" size="md" zodiacSign={user?.zodiac_sign} onClick={toggleMenu}>
              Menu
            </CosmicButton>
            <Link href="/groups">
              <CosmicButton variant="gold" size="md" zodiacSign={user?.zodiac_sign}>
                Groups
              </CosmicButton>
            </Link>
            <Link href="/profile/1">
              <CosmicButton variant="blue" size="md" zodiacSign={user?.zodiac_sign}>
                Profile
              </CosmicButton>
            </Link>
          </div>
          <CosmicNotifications />
        </nav>

        {/* Menu Dropdown */}
        {menuOpen && (
          <motion.div
            className="menu bg-navy-800 p-4 rounded-lg absolute top-16 left-4 w-48 border border-cosmic-gold/30"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Link href="/universe">
              <p className="cosmic-menu-item text-white py-2 hover:bg-navy-700 rounded">Star Universe 🌌</p>
            </Link>
            <Link href="/settings">
              <p className="cosmic-menu-item text-white py-2 hover:bg-navy-700 rounded">Settings ⚙️</p>
            </Link>
            <Link href="/login">
              <p className="cosmic-menu-item text-white py-2 hover:bg-navy-700 rounded w-full text-left">Sign Out 🚪</p>
            </Link>
          </motion.div>
        )}

        {/* Planet Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <Link href="/universe?filter=venus">
            <CosmicButton variant="planet" size="lg" zodiacSign={user?.zodiac_sign} planet="venus">
              Venus
            </CosmicButton>
          </Link>
          <Link href="/universe?filter=mars">
            <CosmicButton variant="planet" size="lg" zodiacSign={user?.zodiac_sign} planet="mars">
              Mars
            </CosmicButton>
          </Link>
          <Link href="/universe?filter=jupiter">
            <CosmicButton variant="planet" size="lg" zodiacSign={user?.zodiac_sign} planet="jupiter">
              Jupiter
            </CosmicButton>
          </Link>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <h1 className="text-3xl font-bold mb-4">Welcome to the Star Universe, {user?.username || 'Cosmic Traveler'}!</h1>
          <p className="mb-4">Explore your zodiac community, join houses, and shine bright!</p>
          <div className="feed bg-navy-800 p-4 rounded-lg">
            <h2 className="text-xl mb-2">Star Universe Feed</h2>
            <p>Coming soon: See posts from all zodiac houses!</p>
            {posts.map((post: Post) => (
              <div key={post.id} className="mb-2 p-2 bg-navy-700 rounded">
                <strong>{post.username} ({post.zodiac_sign})</strong>: {post.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mentor Overlay */}
      <MentorOverlay isVisible={showMentor} />
    </StarBackground>
  );
}
