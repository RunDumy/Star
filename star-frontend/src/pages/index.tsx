'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { NotificationPanel } from '../components/cosmic/NotificationPanel';
import CosmicButton from '../components/CosmicButton';
import CosmicFeed from '../components/CosmicFeed';
import StarBackground from '../components/StarBackground';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  username: string;
  zodiac_sign: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [zodiacFilter, setZodiacFilter] = useState('all');
  const [elementFilter, setElementFilter] = useState('all');

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, zodiac_sign')
          .eq('user_id', user.id)
          .single();
        setUser(profile);
        if (profile?.zodiac_sign) setZodiacFilter(profile.zodiac_sign.toLowerCase());
      }
    }
    fetchUser();
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const zodiacSigns = ['all', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  const elements = ['all', 'fire', 'earth', 'air', 'water'];

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
            {user && (
              <Link href={`/profile/${user.id}`}>
                <CosmicButton variant="blue" size="md" zodiacSign={user?.zodiac_sign}>
                  Profile
                </CosmicButton>
              </Link>
            )}
          </div>
          {user && (
            <div className="text-sm text-cosmic-light">
              Welcome, {user.username} ({user.zodiac_sign})
            </div>
          )}
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
            <button
              className="cosmic-menu-item text-white py-2 hover:bg-navy-700 rounded w-full text-left"
              onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            >
              Sign Out 🚪
            </button>
          </motion.div>
        )}

        {/* Notifications Panel */}
        {user && <NotificationPanel />}

        {/* Planet Buttons */}
        <div className="flex justify-center space-x-8 mb-8">
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
        <div className="main-content max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Welcome to the Star Universe, {user?.username || 'Cosmic Traveler'}!</h1>
          <p className="mb-6 text-center text-cosmic-light">Navigate the cosmos, connect with your zodiac tribe, and shine bright!</p>

          {/* Filter Controls */}
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-semibold text-cosmic-gold mr-2">Zodiac Filter:</span>
              {zodiacSigns.map(sign => (
                <CosmicButton
                  key={sign}
                  variant={zodiacFilter === sign ? 'primary' : 'secondary'}
                  size="sm"
                  zodiacSign={user?.zodiac_sign}
                  onClick={() => setZodiacFilter(sign)}
                >
                  {sign.charAt(0).toUpperCase() + sign.slice(1)}
                </CosmicButton>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm font-semibold text-cosmic-gold mr-2">Element Filter:</span>
              {elements.map(element => (
                <CosmicButton
                  key={element}
                  variant={elementFilter === element ? 'primary' : 'secondary'}
                  size="sm"
                  zodiacSign={user?.zodiac_sign}
                  onClick={() => setElementFilter(element)}
                >
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </CosmicButton>
              ))}
            </div>
          </div>

          {/* Star Universe Feed */}
          <div className="feed bg-navy-800 p-6 rounded-lg shadow-cosmic-lg">
            <h2 className="text-2xl mb-4 text-cosmic-gold">Star Universe Feed</h2>
            {user && (
              <CosmicFeed
                userId={user.id}
                className="cosmic-feed-container"
              />
            )}
          </div>
        </div>
      </div>
    </StarBackground>
  );
}
