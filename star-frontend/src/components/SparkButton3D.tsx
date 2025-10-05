'use client';
import { Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

interface SparkButton3DProps {
  isSparked?: boolean;
  sparkCount: number;
  onSpark: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'cosmic';
}

export function SparkButton3D({
  isSparked = false,
  sparkCount,
  onSpark,
  size = 'md',
  variant = 'cosmic'
}: SparkButton3DProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { button: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { button: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base' },
    lg: { button: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-lg' }
  };

  // Mouse interaction for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Spark animation
  const handleSpark = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    onSpark();

    // Create particle burst effect
    createParticleBurst();

    // Reset animation after duration
    setTimeout(() => setIsAnimating(false), 1000);
  };

  // Create particle burst animation
  const createParticleBurst = () => {
    if (!particlesRef.current) return;

    const particles = particlesRef.current;
    particles.innerHTML = '';

    // Create 8 particles in a burst pattern
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'spark-particle';

      // Calculate position in circle
      const angle = (i / 8) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.style.setProperty('--particle-x', `${x}px`);
      particle.style.setProperty('--particle-y', `${y}px`);
      particle.style.setProperty('--particle-delay', `${i * 0.05}s`);

      particles.appendChild(particle);
    }
  };

  // Calculate 3D transform
  const get3DTransform = () => {
    const rotateX = mousePosition.y * 15;
    const rotateY = mousePosition.x * -15;
    const scale = isAnimating ? 1.2 : 1 + Math.abs(mousePosition.x + mousePosition.y) * 0.1;

    return {
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`
    };
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleSpark}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        spark-button-3d relative ${sizeConfig[size].button} rounded-full
        flex items-center justify-center transition-all duration-300
        ${isSparked
          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-yellow-400/50'
          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
        }
        shadow-lg hover:shadow-xl transform-gpu
        ${isAnimating ? 'spark-burst' : ''}
        ${variant === 'cosmic' ? 'cosmic-spark-glow' : ''}
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900
      `}
      style={get3DTransform()}
      aria-label={`${isSparked ? 'Unspark' : 'Spark'} this post`}
      aria-pressed={!!isSparked}
    >
      {/* Particle container */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none overflow-visible"
        aria-hidden="true"
      />

      {/* Spark icon with 3D effect */}
      <Sparkles
        className={`
          ${sizeConfig[size].icon} transition-all duration-300 text-white
          ${isAnimating ? 'spark-icon-pulse' : ''}
        `}
        style={{
          filter: `drop-shadow(0 0 ${isAnimating ? '8px' : '4px'} ${isSparked ? '#fbbf24' : '#a855f7'})`
        }}
      />

      {/* Spark count */}
      <span
        className={`
          absolute -top-1 -right-1 ${sizeConfig[size].text} font-bold
          ${isSparked ? 'text-yellow-300' : 'text-purple-300'}
          bg-gray-900 rounded-full px-1 min-w-[1.2em] text-center
          border border-gray-700
        `}
      >
        {sparkCount}
      </span>

      {/* Ripple effect on click */}
      {isAnimating && (
        <div
          className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping"
          aria-hidden="true"
        />
      )}
    </button>
  );
}