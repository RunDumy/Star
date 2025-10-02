'use client';

import { useState, useEffect } from 'react';
import { PoeticScrollProps } from '../types/archetype-oracle';

export default function PoeticScroll({
  text,
  content,
  cosmicUI,
  delay = 0
}: PoeticScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Support both single text and multiple scrolls
  const scrollData = content || (text ? { main: text } : {});

  return (
    <div
      className={`relative transition-all duration-1000 overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label="Interactive cosmic scroll content"
    >
      {/* Scroll Background Effect */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isHovered ? 'bg-gradient-to-br from-cosmic-purple/30 to-cosmic-gold/30' : 'bg-gradient-to-br from-cosmic-deep/20 to-cosmic-purple/20'
        }`}
        style={{
          boxShadow: isHovered
            ? `inset 0 0 20px ${cosmicUI?.colors?.glow || 'rgba(124, 77, 255, 0.4)'}`
            : undefined
        }}
      />

      {/* Ancient Scroll Visual */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute h-1 bg-gradient-to-r ${cosmicUI?.gradient || 'from-cosmic-glow to-transparent'} opacity-20 animate-pulse`}
            style={{
              width: `${20 + i * 15}%`,
              top: `${10 + i * 18}%`,
              left: '10%',
              animationDelay: `${i * 200}ms`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Text Content */}
      <div className="relative p-6">
        {/* Decorative Elements */}
        <div className="absolute top-2 left-4 text-cosmic-glow text-xl animate-pulse">❦</div>
        <div className="absolute top-2 right-4 text-cosmic-glow text-xl animate-pulse">❦</div>
        <div className="absolute bottom-2 left-4 text-cosmic-glow text-xl animate-pulse">❦</div>
        <div className="absolute bottom-2 right-4 text-cosmic-glow text-xl animate-pulse">❦</div>

        {/* Text Content */}
        <div className={`text-sm italic font-serif ${isHovered ? 'text-cosmic-accent' : 'text-yellow-400'} transition-colors duration-300 space-y-4`}>
          {Object.entries(scrollData).map(([key, value]) => (
            <div key={key} className="text-center">
              {key !== 'main' && (
                <h4 className="text-xs uppercase text-cosmic-gold mb-1 font-semibold">
                  {key.replace('_', ' ')}
                </h4>
              )}
              <p>"{value}"</p>
            </div>
          ))}
        </div>

        {/* Glow Effect When Hovered */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              boxShadow: `inset 0 0 30px ${cosmicUI?.colors?.glow || 'rgba(255, 183, 77, 0.3)'}`,
              animation: 'pulse-glow 2s ease-in-out infinite'
            }}
          />
        )}
      </div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent">
        <div
          className={`absolute inset-0 rounded-lg transition-all duration-500 ${
            isHovered
              ? 'border-cosmic-accent opacity-100'
              : 'border-cosmic-glow/30 opacity-30'
          }`}
          style={{
            background: isHovered
              ? `linear-gradient(45deg, ${cosmicUI?.colors?.primary || '#FACC15'}, ${cosmicUI?.colors?.secondary || '#FEF08A'})`
              : undefined
          }}
        />
      </div>
    </div>
  );
}
