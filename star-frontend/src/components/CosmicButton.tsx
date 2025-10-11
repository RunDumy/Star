'use client';

import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { hapticManager } from '../lib/hapticEffects';

interface CosmicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'blue' | 'planet';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  zodiacSign?: string;
  planet?: 'venus' | 'mars' | 'jupiter';
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
  const [isHovered, setIsHovered] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const zodiacStyles: Record<string, string> = {
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

  const planetStyles = {
    venus: 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-pink-500/60 ring-pink-300/50',
    mars: 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-600/60 ring-red-300/50',
    jupiter: 'bg-gradient-to-r from-orange-500 to-brown-600 shadow-orange-500/60 ring-orange-300/50',
  };

  const planetSounds = {
    venus: '/sounds/venus-chime.mp3',
    mars: '/sounds/mars-pulse.mp3',
    jupiter: '/sounds/jupiter-hum.mp3',
  };

  const planetTooltips = {
    venus: 'Explore Love & Harmony',
    mars: 'Ignite Action & Passion',
    jupiter: 'Expand Wisdom & Growth',
  };

  const planetBursts = {
    venus: 'Venus Vibes!',
    mars: 'Mars Energy!',
    jupiter: 'Jupiter Wisdom!',
  };

  const zodiacSymbols: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌',
    Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐',
    Capricorn: '♑', Aquarius: '♒', Pisces: '♓', default: '🌟',
  };

  const constellationParticles = {
    venus: {
      particles: {
        shape: { type: 'star' },
        color: { value: '#ff69b4' },
        size: { value: 4 },
        number: { value: 5 },
        move: { speed: 2, direction: 'none', random: true },
        links: { enable: true, color: '#ff69b4', distance: 50, opacity: 0.5 },
      },
      interactivity: { events: { onHover: { enable: true, mode: 'connect' } }, modes: { connect: { distance: 70 } } },
    },
    mars: {
      particles: {
        shape: { type: 'circle' },
        color: { value: '#ff4500' },
        size: { value: 3, random: true },
        number: { value: 7 },
        move: { speed: 3, direction: 'none', random: true },
        links: { enable: true, color: '#ff4500', distance: 40, opacity: 0.6 },
      },
      interactivity: { events: { onHover: { enable: true, mode: 'connect' } }, modes: { connect: { distance: 60 } } },
    },
    jupiter: {
      particles: {
        shape: { type: 'triangle' },
        color: { value: '#ff8c00' },
        size: { value: 5 },
        number: { value: 4 },
        move: { speed: 1.5, direction: 'none', random: true },
        links: { enable: true, color: '#ff8c00', distance: 60, opacity: 0.4 },
      },
      interactivity: { events: { onHover: { enable: true, mode: 'connect' } }, modes: { connect: { distance: 80 } } },
    },
    scorpio: {
      particles: {
        shape: { type: 'image', image: { src: '/images/stinger.png', width: 32, height: 32 } },
        color: { value: '#f7dc6f' },
        size: { value: 6 },
        number: { value: 8 },
        move: { speed: 4, direction: 'none', random: true, straight: false },
        links: { enable: true, color: '#f7dc6f', distance: 30, opacity: 0.7 },
      },
      interactivity: { events: { onHover: { enable: true, mode: 'connect' } }, modes: { connect: { distance: 50 } } },
    },
  };

  const baseClasses = 'relative inline-flex items-center justify-center font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-4 focus:ring-cosmic-glow overflow-hidden planet-button';

  const variantClasses = {
    primary: `bg-gradient-to-r ${zodiacStyles[userZodiac || 'default']} text-star-white cosmic-glow`,
    secondary: 'bg-transparent border-2 border-cosmic-glow text-cosmic-glow hover:border-cosmic-gold hover:text-cosmic-gold cosmic-glow-secondary',
    gold: `bg-gradient-to-r ${zodiacStyles[userZodiac || 'default']} text-cosmic-deep cosmic-glow`,
    blue: `bg-gradient-to-r ${zodiacStyles[userZodiac || 'default']} text-star-white cosmic-glow`,
    planet: `bg-gradient-to-r ${planet ? planetStyles[planet] : zodiacStyles[userZodiac || 'default']} text-star-white cosmic-glow planet-${planet}`,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm w-12 h-12',
    md: 'px-6 py-3 text-base w-16 h-16',
    lg: 'px-8 py-4 text-lg w-20 h-20',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const handleClick = async () => {
    if (!disabled) {
      // Play sound
      if (planet && planetSounds[planet]) {
        audioRef.current = new Audio(planetSounds[planet]);
        audioRef.current.play().catch(() => {});
      }
      // Haptic feedback
      hapticManager.light();
      // Show burst text
      if (planet) {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 1000);
        // Track analytics
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('analytics_events').insert({
            user_id: user.id,
            event_type: 'planet_button_click',
            event_data: { planet, zodiac: userZodiac || 'default' },
            created_at: new Date().toISOString(),
          });
        }
      }
      onClick?.();
    }
  };

  const particlesInit = async (engine: any) => {
    await loadFull(engine);
  };

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={planet ? `${planetTooltips[planet]} (Planet ${planet.charAt(0).toUpperCase() + planet.slice(1)})` : 'Cosmic Button'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <motion.button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
        onClick={handleClick}
        disabled={disabled}
        initial={{ scale: 1, rotateX: 0, rotateY: 0, translateZ: 0 }}
        whileHover={{ scale: 1.3, rotateX: userZodiac ? 25 : 20, rotateY: userZodiac ? 25 : 20, translateZ: 30 }}
        whileTap={{ scale: 0.9, translateZ: 0 }}
        animate={variant === 'planet' ? {
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 0 15px ${planet ? planetStyles[planet].split(' ')[2] : zodiacStyles[userZodiac || 'default'].split(' ')[2]}`,
            `0 0 30px ${planet ? planetStyles[planet].split(' ')[2] : zodiacStyles[userZodiac || 'default'].split(' ')[2]}`,
            `0 0 15px ${planet ? planetStyles[planet].split(' ')[2] : zodiacStyles[userZodiac || 'default'].split(' ')[2]}`,
          ],
          rotate: userZodiac ? [0, 5, 0] : [0, 0, 0],
          transition: { repeat: Infinity, duration: 3 },
        } : {}}
      >
        <span className="relative z-10 flex items-center justify-center">
          {variant !== 'planet' && (
            <span className="zodiac-symbol mr-2">{zodiacSymbols[userZodiac || 'default']}</span>
          )}
          {children}
        </span>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/20 opacity-30" />
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-star-white/20 via-star-white/30 to-transparent opacity-25 animate-pulse-glow`} />
        <div className="cosmic-particles absolute inset-0">
          <span className="particle particle-1" />
          <span className="particle particle-2" />
          <span className="particle particle-3" />
          {isHovered && variant === 'planet' && (
            <>
              <span className="particle particle-burst-1" />
              <span className="particle particle-burst-2" />
              <span className="particle particle-burst-3" />
            </>
          )}
        </div>
        {variant === 'planet' && (
          <>
            <div className={`absolute inset-0 planet-ring planet-${planet}`} />
            <div className="absolute inset-0 comet-trail" />
          </>
        )}
      </motion.button>
      {variant === 'planet' && isHovered && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-navy-800 text-cosmic-light text-sm px-3 py-1 rounded-lg shadow-cosmic z-20 cosmic-tooltip">
          {planetTooltips[planet || 'venus']}
        </div>
      )}
      {variant === 'planet' && showBurst && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 text-cosmic-light text-xs font-bold z-30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: -40 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {planetBursts[planet || 'venus']}
        </motion.div>
      )}
      {variant === 'planet' && isHovered && planet && (
        <div className="absolute inset-0 pointer-events-none">
          <Particles
            id={`constellation-${planet}`}
            init={particlesInit}
            options={{
              particles: {
                ...(userZodiac === 'scorpio' ? constellationParticles.scorpio.particles : constellationParticles[planet].particles),
                number: { value: 10, density: { enable: true, value_area: 200 } },
                move: { enable: true, speed: 2, direction: 'none' as const, random: true },
              },
              interactivity: userZodiac === 'scorpio' ? constellationParticles.scorpio.interactivity : constellationParticles[planet].interactivity,
              detectRetina: true,
            }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
        </div>
      )}
    </motion.div>
  );
}
