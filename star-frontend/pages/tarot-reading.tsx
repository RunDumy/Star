'use client';

import { NextPage } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const InteractiveTarotReader = dynamic(
  () => import('../src/components/InteractiveTarotReader'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-cosmic-gold text-2xl">
          🌙
        </div>
      </div>
    ),
    ssr: false
  }
);

const TarotReadingPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-deep via-cosmic-purple/20 to-cosmic-blue/30 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-mystical text-cosmic-gold mb-4">
            Interactive Tarot Reader
          </h1>
          <p className="text-xl text-cosmic-light max-w-3xl mx-auto leading-relaxed">
            Experience the ancient wisdom of tarot through tactile interaction.
            Drag cards into sacred positions, feel the cosmic energies flow,
            and receive personalized insights from the universe.
          </p>
        </div>

        <InteractiveTarotReader />

        <div className="text-center mt-12 text-cosmic-light/60">
          <p className="text-sm">
            ✨ May your journey through the cards bring clarity, wisdom, and cosmic alignment ✨
          </p>
        </div>
      </div>

      {/* Background cosmic elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cosmic-gold rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cosmic-light rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-cosmic-gold rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
};

export default TarotReadingPage;

