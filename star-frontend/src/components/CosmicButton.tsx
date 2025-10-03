'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { hapticManager } from '../lib/hapticEffects';
import { supabase } from '../lib/supabase';

interface CosmicButtonProps {
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'primary' | 'secondary' | 'gold' | 'blue' | 'planet';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly className?: string;
  readonly zodiacSign?: string; // New prop for zodiac-specific styling
  readonly planet?: 'venus' | 'mars' | 'jupiter'; // New prop for planet styling
}

export default function CosmicButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  zodiacSign,
  planet,
}: CosmicButtonProps) {
  const [userZodiac, setUserZodiac] = useState<string | null>(zodiacSign || null);

  useEffect(() => {
    async function fetchUserZodiac() {
      if (!zodiacSign) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('zodiac_sign')
            .eq('user_id', user.id)
            .single();
          setUserZodiac(profile?.zodiac_sign || 'default');
        }
      }
    }
    fetchUserZodiac();
  }, [zodiacSign]);

  const zodiacStyles = {
    Libra: 'from-blue-500 to-purple-500 shadow-blue-500/50',
    Aries: 'from-red-500 to-orange-500 shadow-red-500/50',
    Taurus: 'from-green-600 to-brown-500 shadow-green-600/50',
    Gemini: 'from-yellow-400 to-blue-300 shadow-yellow-400/50',
    Cancer: 'from-blue-600 to-teal-500 shadow-blue-600/50',
    Leo: 'from-orange-500 to-yellow-500 shadow-orange-500/50',
    Virgo: 'from-green-500 to-brown-400 shadow-green-500/50',
    Scorpio: 'from-blue-800 to-purple-800 shadow-blue-800/50',
    Sagittarius: 'from-purple-500 to-red-500 shadow-purple-500/50',
    Capricorn: 'from-gray-700 to-brown-600 shadow-gray-700/50',
    Aquarius: 'from-blue-300 to-cyan-400 shadow-blue-300/50',
    Pisces: 'from-blue-600 to-teal-600 shadow-blue-600/50',
    default: 'from-blue-500 to-purple-500 shadow-blue-500/50',
  };

  const zodiacSymbols = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌',
    Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐',
    Capricorn: '♑', Aquarius: '♒', Pisces: '♓', default: '🌟',
  };

  const planetStyles = {
    venus: 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-pink-500/50 ring-pink-300/30',
    mars: 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-600/50 ring-red-300/30',
    jupiter: 'bg-gradient-to-r from-orange-500 to-brown-600 shadow-orange-500/50 ring-orange-300/30',
  };

  const getZodiacStyle = (zodiac: string | null): string => {
    const validZodiacs = ['Libra', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'default'];
    const key = validZodiacs.includes(zodiac || '') ? (zodiac as keyof typeof zodiacStyles) : 'default';
    return zodiacStyles[key];
  };

  const getZodiacSymbol = (zodiac: string | null): string => {
    const validZodiacs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces', 'default'];
    const key = validZodiacs.includes(zodiac || '') ? (zodiac as keyof typeof zodiacSymbols) : 'default';
    return zodiacSymbols[key];
  };

  const baseClasses = `relative inline-flex items-center justify-center font-bold transition-all duration-300 ${variant === 'planet' ? 'rounded-full' : 'rounded-lg'} focus:outline-none focus:ring-4 focus:ring-cosmic-glow overflow-hidden`;

  const variantClasses = {
    primary: `bg-gradient-to-r ${getZodiacStyle(userZodiac)} text-star-white cosmic-glow`,
    secondary: 'bg-transparent border-2 border-cosmic-glow text-cosmic-glow hover:border-cosmic-gold hover:text-cosmic-gold cosmic-glow-secondary',
    gold: `bg-gradient-to-r ${getZodiacStyle(userZodiac)} text-cosmic-deep cosmic-glow`,
    blue: `bg-gradient-to-r ${getZodiacStyle(userZodiac)} text-star-white cosmic-glow`,
    planet: `bg-gradient-to-r ${planet ? planetStyles[planet] : getZodiacStyle(userZodiac)} text-star-white cosmic-glow planet-button`,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const handleClick = () => {
    if (!disabled) {
      hapticManager.buttonPress(); // Trigger haptic feedback
      onClick?.();
    }
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      initial={{ scale: 1, rotateX: 0, rotateY: 0, translateZ: 0 }}
      whileHover={{ scale: 1.2, rotateX: 10, rotateY: 10, translateZ: 20 }}
      whileTap={{ scale: 0.9, translateZ: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
    >
      <span className="relative z-10 flex items-center justify-center">
        {variant !== 'planet' && (
          <span className="zodiac-symbol mr-2">{getZodiacSymbol(userZodiac)}</span>
        )}
        {children}
      </span>
      {/* Nebula Texture */}
      <div className={`absolute inset-0 ${variant === 'planet' ? 'rounded-full' : 'rounded-lg'} bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/20 opacity-30`} />
      {/* Pulsing Glow Overlay */}
      {(variant === 'primary' || variant === 'gold' || variant === 'blue' || variant === 'planet') && (
        <div className={`absolute inset-0 ${variant === 'planet' ? 'rounded-full' : 'rounded-lg'} bg-gradient-to-r from-star-white/20 via-star-white/30 to-transparent opacity-25 animate-pulse-glow`} />
      )}
      {/* Orbiting Particles */}
      <div className="cosmic-particles absolute inset-0">
        <span className="particle particle-1" />
        <span className="particle particle-2" />
        <span className="particle particle-3" />
      </div>
      {/* Planet Ring for planet variant */}
      {variant === 'planet' && <div className="absolute inset-0 planet-ring" />}
    </motion.button>
  );
}
