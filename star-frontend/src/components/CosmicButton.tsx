'use client';

import { ReactNode } from 'react';

interface CosmicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function CosmicButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: CosmicButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center font-bold transition-all duration-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-cosmic-glow';

  const variantClasses = {
    primary: 'bg-cosmic-accent text-star-white shadow-cosmic hover:shadow-cosmic-lg hover:scale-105',
    secondary: 'bg-transparent border-2 border-cosmic-glow text-cosmic-glow shadow-blue hover:shadow-gold hover:border-cosmic-gold hover:text-cosmic-gold',
    gold: 'bg-cosmic-gold text-cosmic-deep shadow-gold hover:shadow-cosmic-lg hover:scale-105',
    blue: 'bg-cosmic-blue text-star-white shadow-blue hover:shadow-cosmic-lg hover:scale-105',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{children}</span>
      {(variant === 'primary' || variant === 'gold' || variant === 'blue') && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-star-white to-transparent opacity-25 animate-pulse-glow" />
      )}
    </button>
  );
}
