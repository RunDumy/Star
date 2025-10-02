'use client';

import { useState } from 'react';
import CosmicButton from './CosmicButton';
import CosmicCard from './CosmicCard';
import { ArchetypeProfileCardProps } from '../types/archetype-oracle';

export default function ArchetypeProfileCard({
  aspect,
  profileData,
  onExploreClick
}: ArchetypeProfileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const aspectLabels = {
    life_path: 'Life Path',
    destiny: 'Destiny',
    soul_urge: 'Soul Urge',
    personality: 'Personality',
    birth_day: 'Birth Day'
  };

  const aspectIcon = {
    life_path: '🌟',
    destiny: '✨',
    soul_urge: '💫',
    personality: '🎭',
    birth_day: '🌙'
  };

  const numerology = profileData.numerology[aspect] || {};
  const tarot = profileData.tarot[aspect] || {};
  const planetary = profileData.planetary[aspect] || {};
  const persona = profileData.archetypal_persona[aspect] || '';
  const poeticScroll = profileData.poetic_scrolls[aspect] || '';
  const cosmicUI = profileData.cosmic_ui?.[aspect];
  const emotionalResonance = profileData.emotional_resonance?.[aspect];
  const tailwindClasses = profileData.tailwind_classes?.[aspect];

  return (
    <div
      className={`${tailwindClasses?.card_bg || 'bg-void border border-yellow-400'} transition-all duration-300 ${
        isHovered ? 'transform scale-105 shadow-cosmic-lg' : 'shadow-cosmic'
      } rounded-xl`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CosmicCard
        className="border-0 shadow-none bg-transparent"
        hover={false}
        glow={false}
      >
      <div className="text-center">
        {/* Icon and Gradient Background */}
        <div className={`w-16 h-16 mx-auto mb-4 ${cosmicUI?.gradient || 'bg-gradient-to-br from-yellow-400 to-yellow-200'} rounded-full flex items-center justify-center animate-pulse`}>
          <span className="text-void text-2xl">{aspectIcon[aspect]}</span>
        </div>

        {/* Aspect Title */}
        <h3 className={`${tailwindClasses?.text_color || 'text-starlight'} text-xl font-bold mb-2`}>
          {aspectLabels[aspect]}
        </h3>

        {/* Archetypal Persona */}
        <div className={`${tailwindClasses?.text_color || 'text-starlight'} text-lg font-semibold mb-3`}>
          {persona}
        </div>

        {/* Poetic Scroll */}
        <div className={`${tailwindClasses?.accent_color || 'text-yellow-400'} mb-4 text-sm italic bg-purple-900/20 p-3 rounded-lg border-l-4 border-pink-500`}>
          &ldquo;{poeticScroll}&rdquo;
        </div>

        {/* Numerology & Symbolism Grid */}
        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className={`${tailwindClasses?.text_color || 'text-starlight'}`}>Number:</span>
              <span className={`${tailwindClasses?.accent_color || 'text-yellow-400'} font-bold`}>
                {numerology.number || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${tailwindClasses?.text_color || 'text-starlight'}`}>Planet:</span>
              <span className={`${tailwindClasses?.accent_color || 'text-blue-400'}`}>
                {planetary.planet || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${tailwindClasses?.text_color || 'text-starlight'}`}>Element:</span>
              <span className={`${tailwindClasses?.accent_color || 'text-orange-400'}`}>
                {planetary.element || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${tailwindClasses?.text_color || 'text-starlight'}`}>Frequency:</span>
              <span className={`${tailwindClasses?.accent_color || 'text-emerald-400'}`}>
                {emotionalResonance?.frequency || 'Neutral'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${tailwindClasses?.text_color || 'text-starlight'}`}>Resonance:</span>
              <span className={`${tailwindClasses?.accent_color || 'text-pink-400'}`}>
                {emotionalResonance?.resonance_strength || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`${tailwindClasses?.text_color || 'text-starlight'}`}>Tarot:</span>
              <span className={`${tailwindClasses?.accent_color || 'text-purple-400'}`}>
                {tarot.card ? tarot.card.split(' ')[tarot.card.split(' ').length - 1] : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <CosmicButton
          onClick={() => onExploreClick?.(aspect)}
          variant="primary"
          size="sm"
          className={`${tailwindClasses?.button_classes || 'bg-yellow-400 text-void hover:bg-yellow-300'} mt-4`}
        >
          Explore {aspectLabels[aspect]}
        </CosmicButton>
      </div>

      {/* Cosmic Action Indicator */}
      {isHovered && emotionalResonance?.primary_emotions && (
        <div className="absolute top-2 right-2 bg-cosmic-deep/90 rounded-full p-2 border border-cosmic-glow/50">
          <div className="text-xs text-star-white font-semibold">
            {emotionalResonance.primary_emotions.length > 0 && emotionalResonance.primary_emotions[0].charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      </CosmicCard>
    </div>
  );
}
