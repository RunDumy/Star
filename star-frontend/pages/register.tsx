'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import UserRegistration from '../src/components/cosmic/UserRegistration';
import StarBackground from '../src/components/StarBackground';

export default function Register() {
  const [profile, setProfile] = useState(null);

  const handleProfileCreated = (newProfile: any) => {
    setProfile(newProfile);
    // Optionally redirect to dashboard after a delay
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  if (profile) {
    return (
      <StarBackground>
        <motion.div 
          className="relative z-10 min-h-screen flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🌟</div>
            <h1 className="text-4xl font-bold mb-4">Welcome to STAR!</h1>
            <p className="text-xl mb-2">Your cosmic signature: <span className="text-purple-400 font-bold">{profile.signature}</span></p>
            <p className="text-purple-300 mb-8">Profile created successfully!</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Enter the Cosmos
            </button>
          </div>
        </motion.div>
      </StarBackground>
    );
  }

  return (
    <StarBackground>
      <div className="relative z-10">
        <UserRegistration onProfileCreated={handleProfileCreated} />
      </div>
    </StarBackground>
  );
}

