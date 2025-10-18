'use client';

import { useDraggable } from '@dnd-kit/core';
import { getAssetUrl } from '../lib/storage';
import { DraggedCard } from '../types/tarot-interactions';
import CosmicCard from './CosmicCard';

interface TarotCardProps {
  readonly card: DraggedCard;
  readonly size?: 'sm' | 'md' | 'lg';
}

export default function TarotCard({ card, size = 'md' }: TarotCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  };

  const cardContent = card.isFaceDown ? (
    <div className="w-full h-full relative">
      <img
        src={getAssetUrl('blank_tarot.png')}
        alt="Blank Tarot Card"
        className="w-full h-full object-cover rounded-lg"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cosmic-deep/20 to-cosmic-purple/20 rounded-lg">
        <div className="text-cosmic-gold text-xs font-mystical tracking-wider rotate-90">
          ✨🌙✨
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      <div className="text-cosmic-gold text-center text-sm font-mystical mb-2">
        {card.cardName}
      </div>
      <div className="text-cosmic-light text-xs">
        #{card.number}
      </div>
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      // eslint-disable-next-line react/style-prop-object
      style={{
        '--tarot-card-rotation': `${card.rotation}deg`,
        '--tarot-card-x': transform ? `${transform.x}px` : '0px',
        '--tarot-card-y': transform ? `${transform.y}px` : '0px',
      } as React.CSSProperties}
      {...listeners}
      {...attributes}
      className={`absolute cursor-grab ${isDragging ? 'cursor-grabbing z-50 scale-110' : ''} transition-transform duration-200 ${sizeClasses[size]} ${transform ? 'tarot-card-dragging' : 'tarot-card-transform'}`}
    >
      <CosmicCard
        className={`w-full h-full overflow-hidden ${card.cosmic_properties.glow_effect}`}
        glow={true}
        hover={true}
      >
        <div
          className="w-full h-full rounded-xl relative overflow-hidden tarot-card-background"
          // eslint-disable-next-line react/style-prop-object
          style={{
            '--tarot-card-gradient': card.cosmic_properties.gradient,
            '--tarot-card-glow': card.cosmic_properties.glow_effect.replace('glow-effect-', '0 0 20px '),
          } as React.CSSProperties}
        >
          {cardContent}
          {/* Constellation overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            // eslint-disable-next-line react/style-prop-object
            style={{
              '--tarot-card-color-primary': card.cosmic_properties.colors.primary,
              '--tarot-card-color-secondary': card.cosmic_properties.colors.secondary,
            } as React.CSSProperties}
          >
            <svg className="w-full h-full">
              <defs>
                <pattern id={`constellation-${card.id}`} patternUnits="userSpaceOnUse" width="20" height="20">
                  <circle cx="2" cy="2" r="0.5" className="tarot-card-constellation-primary" opacity="0.3" />
                  <circle cx="18" cy="18" r="0.3" className="tarot-card-constellation-secondary" opacity="0.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#constellation-${card.id})`} />
            </svg>
          </div>
        </div>
      </CosmicCard>
    </div>
  );
}
