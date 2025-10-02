'use client';

import ArchetypeProfileCard from './ArchetypeProfileCard';
import { CosmicProfileGridProps } from '../types/archetype-oracle';

export default function CosmicProfileGrid({
  profileData,
  onCardClick
}: CosmicProfileGridProps) {
  const aspects = ['life_path', 'destiny', 'soul_urge', 'personality', 'birth_day'] as const;

  const aspectTitles = {
    life_path: 'Life Path',
    destiny: 'Destiny',
    soul_urge: 'Soul Urge',
    personality: 'Personality',
    birth_day: 'Birth Day'
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-starlight mb-2">
          Cosmic Profile Grid
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Discover your archetypal blueprint through numerology, tarot, and planetary influences.
          Each aspect represents a unique dimension of your cosmic self.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {aspects.map((aspect) => (
          <ArchetypeProfileCard
            key={aspect}
            aspect={aspect}
            profileData={profileData}
            onExploreClick={(aspectKey) => onCardClick?.(aspectKey)}
          />
        ))}
      </div>

      {/* Grid Statistics */}
      <div className="mt-12 bg-gradient-to-r from-cosmic-deep to-cosmic-purple/20 rounded-xl p-6 border border-cosmic-glow/30">
        <div className="text-center text-starlight mb-4">
          <h3 className="text-xl font-semibold">Profile Analysis</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {aspects.map((aspect) => {
            const emotionalResonance = profileData.emotional_resonance?.[aspect];
            const numerology = profileData.numerology[aspect];

            return (
              <div key={aspect} className="p-3 bg-cosmic-purple/10 rounded-lg">
                <div className="text-xs text-gray-300 mb-1">{aspectTitles[aspect]}</div>
                <div className="text-lg font-bold text-starlight">
                  {numerology?.number || '?'}
                </div>
                <div className="text-xs text-cosmic-glow mt-1">
                  {emotionalResonance?.resonance_strength || 0}% Harmony
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
