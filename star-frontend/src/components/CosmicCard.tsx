'use client';

import { ReactNode } from 'react';

interface CosmicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function CosmicCard({
  children,
  className = '',
  hover = false,
  glow = false,
}: CosmicCardProps) {
  const baseClasses = 'relative rounded-xl border backdrop-blur-sm bg-cosmic-deep/20 p-6';

  const glowClasses = glow ? 'shadow-cosmic border-cosmic-glow/30' : 'shadow-blue border-cosmic-purple/30';

  const hoverClasses = hover ? 'hover:shadow-cosmic-lg hover:border-cosmic-accent/50 transition-all duration-300' : '';

  return (
    <div className={`${baseClasses} ${glowClasses} ${hoverClasses} ${className}`}>
      {children}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cosmic-purple/5 to-cosmic-blue/5 pointer-events-none" />
    </div>
  );
}
