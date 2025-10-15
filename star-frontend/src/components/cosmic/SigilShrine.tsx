'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Badge } from '../../types/feed';
import CosmicCard from '../CosmicCard';

interface SigilShrineProps {
  badges: Badge[];
  onBadgePosition: (badgeId: string, x: number, y: number, zIndex: number) => void;
  zodiacSign: string;
  userProfile?: {
    archetypalTraits?: string[];
    elementalBalance?: {
      fire: number;
      water: number;
      air: number;
      earth: number;
    };
  };
  isEditable?: boolean;
  shrineSize?: 'small' | 'medium' | 'large';
}

interface DraggableBadgeProps {
  badge: Badge & { x: number; y: number; zIndex: number };
  onPosition: (x: number, y: number, zIndex: number) => void;
  isEditable: boolean;
  zodiacSign: string;
}

interface BadgePosition {
  id: string;
  x: number;
  y: number;
  zIndex: number;
}

// Individual draggable badge component
const DraggableBadge: React.FC<DraggableBadgeProps> = ({ 
  badge, 
  onPosition, 
  isEditable,
  zodiacSign 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: badge.x || 0, y: badge.y || 0 });

  const [{ opacity }, dragRef] = useDrag({
    type: 'badge',
    item: { id: badge.id, x: position.x, y: position.y },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
    canDrag: isEditable,
    end: (item, monitor) => {
      setIsDragging(false);
      if (monitor.didDrop()) {
        const dropResult = monitor.getDropResult<{ x: number; y: number }>();
        if (dropResult) {
          setPosition({ x: dropResult.x, y: dropResult.y });
          onPosition(dropResult.x, dropResult.y, badge.zIndex || 1);
        }
      }
    },
  });

  // Get zodiac-specific glow effect
  const getZodiacGlow = (sign: string, rarity: string) => {
    const zodiacColors = {
      aries: '#ff4444',
      taurus: '#44ff44', 
      gemini: '#ffff44',
      cancer: '#44ffff',
      leo: '#ff8844',
      virgo: '#88ff44',
      libra: '#ff44ff',
      scorpio: '#8844ff',
      sagittarius: '#ff4488',
      capricorn: '#448844',
      aquarius: '#4488ff',
      pisces: '#88ff88'
    };

    const rarityIntensity = {
      common: '0.3',
      rare: '0.5', 
      epic: '0.7',
      legendary: '1.0'
    };

    const color = zodiacColors[sign as keyof typeof zodiacColors] || '#8b5cf6';
    const intensity = rarityIntensity[rarity as keyof typeof rarityIntensity] || '0.5';
    
    return {
      boxShadow: `0 0 20px ${color}${intensity.replace('0.', '')}, inset 0 0 10px ${color}30`,
      border: `2px solid ${color}80`
    };
  };

  return (
    <motion.div
      ref={isEditable ? dragRef : undefined}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        opacity,
        zIndex: badge.zIndex || 1,
        cursor: isEditable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        ...getZodiacGlow(zodiacSign, badge.rarity)
      }}
      className="badge-container"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={isEditable ? { scale: 1.1, rotate: 5 } : { scale: 1.05 }}
      whileTap={isEditable ? { scale: 0.95 } : undefined}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        duration: 0.6 
      }}
    >
      <div className="relative group">
        {/* Badge Image/Icon */}
        <div 
          className="w-12 h-12 rounded-full bg-gradient-to-br from-cosmic-purple to-cosmic-blue flex items-center justify-center overflow-hidden backdrop-blur-sm"
          style={getZodiacGlow(zodiacSign, badge.rarity)}
        >
          {badge.badge_icon ? (
            <img 
              src={badge.badge_icon} 
              alt={badge.badge_name}
              className="w-8 h-8 object-cover"
            />
          ) : (
            <div className="text-2xl">
              {badge.rarity === 'legendary' ? '👑' : 
               badge.rarity === 'epic' ? '⭐' :
               badge.rarity === 'rare' ? '💫' : '✨'}
            </div>
          )}
        </div>

        {/* Badge Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="bg-cosmic-deep/95 text-cosmic-light px-3 py-2 rounded-lg shadow-lg border border-cosmic-accent/30 backdrop-blur-sm min-w-max">
            <div className="text-sm font-semibold text-cosmic-gold">{badge.badge_name}</div>
            <div className="text-xs text-cosmic-light/80">{badge.badge_description}</div>
            <div className="text-xs text-cosmic-accent capitalize mt-1">{badge.rarity} • {new Date(badge.unlocked_at).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Rarity Glow Animation */}
        <AnimatePresence>
          {badge.rarity === 'legendary' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: `radial-gradient(circle, ${getZodiacGlow(zodiacSign, badge.rarity).border?.split(' ')[3]} 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Main SigilShrine component
export const SigilShrine: React.FC<SigilShrineProps> = ({
  badges,
  onBadgePosition,
  zodiacSign,
  userProfile,
  isEditable = false,
  shrineSize = 'medium'
}) => {
  const shrineRef = useRef<HTMLDivElement>(null);
  const [badgePositions, setBadgePositions] = useState<BadgePosition[]>([]);

  // Initialize badge positions
  useEffect(() => {
    const positions = badges.map((badge, index) => ({
      id: badge.id,
      x: badge.x || (20 + (index % 4) * 20), // Default grid positioning
      y: badge.y || (20 + Math.floor(index / 4) * 25),
      zIndex: badge.zIndex || index + 1
    }));
    setBadgePositions(positions);
  }, [badges]);

  // Drop zone configuration
  const [, dropRef] = useDrop({
    accept: 'badge',
    drop: (item: { id: string; x: number; y: number }, monitor) => {
      if (!shrineRef.current) return;

      const offset = monitor.getClientOffset();
      const shrineRect = shrineRef.current.getBoundingClientRect();
      
      if (offset) {
        const x = ((offset.x - shrineRect.left) / shrineRect.width) * 100;
        const y = ((offset.y - shrineRect.top) / shrineRect.height) * 100;
        
        // Ensure badges stay within bounds
        const clampedX = Math.max(0, Math.min(85, x));
        const clampedY = Math.max(0, Math.min(85, y));
        
        return { x: clampedX, y: clampedY };
      }
      return null;
    },
  });

  // Get shrine dimensions based on size
  const getShrineClasses = () => {
    const baseClasses = "relative rounded-xl border-2 border-cosmic-accent/30 bg-gradient-to-br from-cosmic-deep/50 to-cosmic-purple/20 backdrop-blur-sm overflow-hidden";
    
    switch (shrineSize) {
      case 'small':
        return `${baseClasses} w-48 h-32`;
      case 'large': 
        return `${baseClasses} w-96 h-80`;
      default:
        return `${baseClasses} w-72 h-48`;
    }
  };

  // Handle badge positioning
  const handleBadgePosition = (badgeId: string, x: number, y: number, zIndex: number) => {
    setBadgePositions(prev => 
      prev.map(pos => 
        pos.id === badgeId 
          ? { ...pos, x, y, zIndex }
          : pos
      )
    );
    onBadgePosition(badgeId, x, y, zIndex);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <CosmicCard className="p-4 space-y-4" glow={badges.length > 0}>
        {/* Shrine Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-cosmic-gold flex items-center gap-2">
              🔮 Cosmic Sigil Shrine
              {badges.length > 0 && (
                <span className="text-sm text-cosmic-accent">({badges.length})</span>
              )}
            </h3>
            <p className="text-sm text-cosmic-light/70">
              {isEditable 
                ? "Drag badges to arrange your cosmic identity"
                : "Sacred badges reflecting your cosmic journey"
              }
            </p>
          </div>
          
          {/* Elemental Balance Indicator */}
          {userProfile?.elementalBalance && (
            <div className="flex space-x-1">
              {Object.entries(userProfile.elementalBalance).map(([element, value]) => (
                <div
                  key={element}
                  className="w-2 h-8 rounded-full bg-gradient-to-t from-cosmic-deep to-cosmic-accent/50"
                  style={{ 
                    background: `linear-gradient(to top, 
                      ${element === 'fire' ? '#ff4444' : 
                        element === 'water' ? '#4444ff' :
                        element === 'air' ? '#ffff44' : '#44ff44'} ${value}%, 
                      rgba(139, 92, 246, 0.1) ${value}%)`
                  }}
                  title={`${element}: ${value}%`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Shrine Canvas */}
        <div 
          ref={(node) => {
            shrineRef.current = node;
            if (isEditable) dropRef(node);
          }}
          className={getShrineClasses()}
        >
          {/* Mystical Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-4 border border-cosmic-accent/20 rounded-lg"></div>
            <div className="absolute inset-8 border border-cosmic-accent/10 rounded-lg rotate-45"></div>
            {/* Zodiac constellation pattern */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 opacity-20">
              <div className="text-4xl text-cosmic-gold">
                {zodiacSign === 'aries' ? '♈' :
                 zodiacSign === 'taurus' ? '♉' :
                 zodiacSign === 'gemini' ? '♊' :
                 zodiacSign === 'cancer' ? '♋' :
                 zodiacSign === 'leo' ? '♌' :
                 zodiacSign === 'virgo' ? '♍' :
                 zodiacSign === 'libra' ? '♎' :
                 zodiacSign === 'scorpio' ? '♏' :
                 zodiacSign === 'sagittarius' ? '♐' :
                 zodiacSign === 'capricorn' ? '♑' :
                 zodiacSign === 'aquarius' ? '♒' : '♓'}
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.map((badge) => {
            const position = badgePositions.find(pos => pos.id === badge.id);
            return (
              <DraggableBadge
                key={badge.id}
                badge={{
                  ...badge,
                  x: position?.x || 0,
                  y: position?.y || 0,
                  zIndex: position?.zIndex || 1
                }}
                onPosition={(x, y, zIndex) => handleBadgePosition(badge.id, x, y, zIndex)}
                isEditable={isEditable}
                zodiacSign={zodiacSign}
              />
            );
          })}

          {/* Empty State */}
          {badges.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-cosmic-light/50">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-sm">No badges yet</p>
                <p className="text-xs">Complete cosmic actions to unlock sigils</p>
              </div>
            </div>
          )}

          {/* Editing Hint */}
          {isEditable && badges.length > 0 && (
            <div className="absolute bottom-2 right-2 text-xs text-cosmic-accent/70 bg-cosmic-deep/50 px-2 py-1 rounded">
              Drag to reposition
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {badges.length > 0 && (
          <div className="flex justify-between text-xs text-cosmic-light/70">
            <div className="flex space-x-4">
              <span>Legendary: {badges.filter(b => b.rarity === 'legendary').length}</span>
              <span>Epic: {badges.filter(b => b.rarity === 'epic').length}</span>
              <span>Rare: {badges.filter(b => b.rarity === 'rare').length}</span>
            </div>
            <div>
              Total Power: {badges.length * 10} ⚡
            </div>
          </div>
        )}
      </CosmicCard>
    </DndProvider>
  );
};

export default SigilShrine;