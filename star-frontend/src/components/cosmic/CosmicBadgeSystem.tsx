import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Badge {
  id: string;
  name: string;
  category: 'western_zodiac' | 'chinese_zodiac' | 'element' | 'planet' | 'cosmic';
  src: string;
  description: string;
  element?: string;
  planet?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const BADGE_LIBRARY: Badge[] = [
  // Western Zodiac
  { id: 'aries', name: 'Aries', category: 'western_zodiac', src: 'aries_badge.png', description: 'The Ram - Fire sign ruled by Mars', element: 'Fire', planet: 'Mars', rarity: 'common' },
  { id: 'taurus', name: 'Taurus', category: 'western_zodiac', src: 'taurus_badge.png', description: 'The Bull - Earth sign ruled by Venus', element: 'Earth', planet: 'Venus', rarity: 'common' },
  { id: 'gemini', name: 'Gemini', category: 'western_zodiac', src: 'gemini_badge.png', description: 'The Twins - Air sign ruled by Mercury', element: 'Air', planet: 'Mercury', rarity: 'common' },
  { id: 'cancer', name: 'Cancer', category: 'western_zodiac', src: 'cancer_badge.png', description: 'The Crab - Water sign ruled by Moon', element: 'Water', planet: 'Moon', rarity: 'common' },
  { id: 'leo', name: 'Leo', category: 'western_zodiac', src: 'leo_badge.png', description: 'The Lion - Fire sign ruled by Sun', element: 'Fire', planet: 'Sun', rarity: 'common' },
  { id: 'virgo', name: 'Virgo', category: 'western_zodiac', src: 'virgo_badge.png', description: 'The Maiden - Earth sign ruled by Mercury', element: 'Earth', planet: 'Mercury', rarity: 'common' },
  { id: 'libra', name: 'Libra', category: 'western_zodiac', src: 'libra_badge.png', description: 'The Scales - Air sign ruled by Venus', element: 'Air', planet: 'Venus', rarity: 'common' },
  { id: 'scorpio', name: 'Scorpio', category: 'western_zodiac', src: 'scorpio_badge.png', description: 'The Scorpion - Water sign ruled by Pluto', element: 'Water', planet: 'Pluto', rarity: 'common' },
  { id: 'sagittarius', name: 'Sagittarius', category: 'western_zodiac', src: 'sagittarius_badge.png', description: 'The Archer - Fire sign ruled by Jupiter', element: 'Fire', planet: 'Jupiter', rarity: 'common' },
  { id: 'capricorn', name: 'Capricorn', category: 'western_zodiac', src: 'capricorn_badge.png', description: 'The Goat - Earth sign ruled by Saturn', element: 'Earth', planet: 'Saturn', rarity: 'common' },
  { id: 'aquarius', name: 'Aquarius', category: 'western_zodiac', src: 'aquarius_badge.png', description: 'The Water Bearer - Air sign ruled by Uranus', element: 'Air', planet: 'Uranus', rarity: 'common' },
  { id: 'pisces', name: 'Pisces', category: 'western_zodiac', src: 'pisces_badge.png', description: 'The Fish - Water sign ruled by Neptune', element: 'Water', planet: 'Neptune', rarity: 'common' },

  // Chinese Zodiac
  { id: 'rat', name: 'Year of Rat', category: 'chinese_zodiac', src: 'year-of-rat_badge.png', description: 'Clever, resourceful, and adaptable', rarity: 'common' },
  { id: 'ox', name: 'Year of Ox', category: 'chinese_zodiac', src: 'year-of-ox_badge.png', description: 'Reliable, strong, and determined', rarity: 'common' },
  { id: 'tiger', name: 'Year of Tiger', category: 'chinese_zodiac', src: 'year-of-tiger_badge.png', description: 'Brave, competitive, and confident', rarity: 'common' },
  { id: 'rabbit', name: 'Year of Rabbit', category: 'chinese_zodiac', src: 'year-of-rabbit_badge.png', description: 'Gentle, quiet, and elegant', rarity: 'common' },
  { id: 'dragon', name: 'Year of Dragon', category: 'chinese_zodiac', src: 'year-of-dragon_badge.png', description: 'Lucky, powerful, and wise', rarity: 'epic' },
  { id: 'snake', name: 'Year of Snake', category: 'chinese_zodiac', src: 'year-of-snake_badge.png', description: 'Wise, enigmatic, and intuitive', rarity: 'rare' },
  { id: 'horse', name: 'Year of Horse', category: 'chinese_zodiac', src: 'year-of-horse_badge.png', description: 'Active, energetic, and free-spirited', rarity: 'common' },
  { id: 'goat', name: 'Year of Goat', category: 'chinese_zodiac', src: 'year-of-goat_badge.png', description: 'Calm, gentle, and sympathetic', rarity: 'common' },
  { id: 'monkey', name: 'Year of Monkey', category: 'chinese_zodiac', src: 'year-of-monkey_badge.png', description: 'Witty, intelligent, and versatile', rarity: 'rare' },
  { id: 'rooster', name: 'Year of Rooster', category: 'chinese_zodiac', src: 'year-of-rooster_badge.png', description: 'Observant, hardworking, and courageous', rarity: 'common' },
  { id: 'dog', name: 'Year of Dog', category: 'chinese_zodiac', src: 'year-of-dog_badge.png', description: 'Loyal, responsible, and reliable', rarity: 'common' },
  { id: 'pig', name: 'Year of Pig', category: 'chinese_zodiac', src: 'year-of-pig_badge.png', description: 'Honest, generous, and diligent', rarity: 'common' },

  // Elements
  { id: 'fire', name: 'Fire Element', category: 'element', src: 'fire_badge.png', description: 'Passion, energy, and transformation', rarity: 'rare' },
  { id: 'water', name: 'Water Element', category: 'element', src: 'water-element_badge.png', description: 'Emotion, intuition, and flow', rarity: 'rare' },
  { id: 'earth', name: 'Earth Element', category: 'element', src: 'earth-element_badge.png', description: 'Stability, grounding, and growth', rarity: 'rare' },
  { id: 'air', name: 'Air Element', category: 'element', src: 'air_badge.png', description: 'Intellect, communication, and movement', rarity: 'rare' },

  // Planets
  { id: 'mars', name: 'Mars', category: 'planet', src: 'mars-symbol_badge.png', description: 'Planet of action, desire, and war', rarity: 'epic' },
  { id: 'venus', name: 'Venus', category: 'planet', src: 'venus-symbol_badge.png', description: 'Planet of love, beauty, and harmony', rarity: 'epic' },
  { id: 'jupiter', name: 'Jupiter', category: 'planet', src: 'jupiter-symbol_badge.png', description: 'Planet of expansion, luck, and wisdom', rarity: 'legendary' },
  { id: 'saturn', name: 'Saturn', category: 'planet', src: 'saturn-symbol_badge.png', description: 'Planet of discipline, structure, and time', rarity: 'legendary' },
  { id: 'mercury', name: 'Mercury', category: 'planet', src: 'mercury_badge.png', description: 'Planet of communication and intellect', rarity: 'epic' },
  { id: 'uranus', name: 'Uranus', category: 'planet', src: 'uranus-symbol_badge.png', description: 'Planet of innovation and rebellion', rarity: 'legendary' },
  { id: 'neptune', name: 'Neptune', category: 'planet', src: 'neptune-symbol_badge.png', description: 'Planet of dreams and illusion', rarity: 'legendary' },
  { id: 'pluto', name: 'Pluto', category: 'planet', src: 'pluto_badge.png', description: 'Planet of transformation and power', rarity: 'legendary' },

  // Cosmic
  { id: 'full-moon', name: 'Full Moon', category: 'cosmic', src: 'full-moon_badge.png', description: 'Peak energy and manifestation', rarity: 'rare' },
  { id: 'new-moon', name: 'New Moon', category: 'cosmic', src: 'new-moon_badge.png', description: 'New beginnings and fresh starts', rarity: 'rare' },
  { id: 'moon-and-stars', name: 'Moon & Stars', category: 'cosmic', src: 'moon-and-stars_badge.png', description: 'Mystery, guidance, and celestial wisdom', rarity: 'epic' },
  { id: 'moon-phase', name: 'Moon Phase', category: 'cosmic', src: 'moon-phase_badge.png', description: 'Cycles, change, and natural rhythm', rarity: 'rare' },
  { id: 'moon-symbol', name: 'Moon Symbol', category: 'cosmic', src: 'moon-symbol_badge.png', description: 'Intuition, emotion, and feminine energy', rarity: 'rare' },
];

interface BadgePosition {
  id: string;
  x: number;
  y: number;
  badge: Badge;
  zIndex: number;
}

const RARITY_EFFECTS = {
  common: { glow: '0 0 10px rgba(139, 92, 246, 0.3)', scale: 1, glowColor: '#8b5cf6' },
  rare: { glow: '0 0 15px rgba(59, 130, 246, 0.5)', scale: 1.05, glowColor: '#3b82f6' },
  epic: { glow: '0 0 25px rgba(168, 85, 247, 0.7)', scale: 1.1, glowColor: '#a855f7' },
  legendary: { glow: '0 0 35px rgba(251, 191, 36, 0.9)', scale: 1.15, glowColor: '#fbbf24' }
};

interface CosmicBadgeSystemProps {
  userId: string;
  userZodiac?: string;
  onSave: (positions: BadgePosition[]) => void;
}

const CosmicBadgeSystem: React.FC<CosmicBadgeSystemProps> = ({
  userId,
  userZodiac = 'aries',
  onSave
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedBadges, setSelectedBadges] = useState<BadgePosition[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('western_zodiac');
  const [dragging, setDragging] = useState<BadgePosition | null>(null);
  const [primaryBadge, setPrimaryBadge] = useState<Badge | null>(null);

  const categories = [
    { key: 'western_zodiac', name: 'Western Zodiac', icon: '♈', description: 'Traditional astrological signs' },
    { key: 'chinese_zodiac', name: 'Chinese Zodiac', icon: '🐉', description: 'Ancient Chinese animal signs' },
    { key: 'element', name: 'Elements', icon: '🔥', description: 'Fundamental cosmic forces' },
    { key: 'planet', name: 'Planets', icon: '♂', description: 'Celestial planetary influences' },
    { key: 'cosmic', name: 'Cosmic', icon: '🌙', description: 'Mystical lunar and stellar badges' }
  ];

  const filteredBadges = BADGE_LIBRARY.filter(badge => badge.category === activeCategory);

  // Suggest badges based on user's zodiac
  const suggestedBadges = React.useMemo(() => {
    const userBadge = BADGE_LIBRARY.find(b => b.id === userZodiac || b.name.toLowerCase().includes(userZodiac.toLowerCase()));
    if (!userBadge) return [];

    const suggestions = [userBadge];
    
    // Add element badge
    if (userBadge.element) {
      const elementBadge = BADGE_LIBRARY.find(b => 
        b.category === 'element' && 
        b.name.toLowerCase().includes(userBadge.element!.toLowerCase())
      );
      if (elementBadge && !suggestions.includes(elementBadge)) suggestions.push(elementBadge);
    }

    // Add planet badge
    if (userBadge.planet) {
      const planetBadge = BADGE_LIBRARY.find(b => 
        b.category === 'planet' && 
        (b.name.toLowerCase().includes(userBadge.planet!.toLowerCase()) || b.id === userBadge.planet!.toLowerCase())
      );
      if (planetBadge && !suggestions.includes(planetBadge)) suggestions.push(planetBadge);
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }, [userZodiac]);

  const addBadge = (badge: Badge) => {
    if (selectedBadges.length >= 5) {
      alert('Maximum 5 badges allowed');
      return;
    }

    // Check if it's a primary zodiac badge (only one allowed)
    const isPrimaryZodiac = badge.category === 'western_zodiac' || badge.category === 'chinese_zodiac';
    const hasPrimaryZodiac = selectedBadges.some(b => 
      b.badge.category === 'western_zodiac' || b.badge.category === 'chinese_zodiac'
    );

    if (isPrimaryZodiac && hasPrimaryZodiac) {
      alert('You can only have one primary zodiac badge (Western or Chinese)');
      return;
    }

    const newPosition: BadgePosition = {
      id: `${badge.id}-${Date.now()}`,
      x: 200 + (selectedBadges.length * 40),
      y: 150 + (selectedBadges.length * 30),
      badge,
      zIndex: selectedBadges.length
    };

    const updatedBadges = [...selectedBadges, newPosition];
    setSelectedBadges(updatedBadges);
    
    if (!primaryBadge && isPrimaryZodiac) {
      setPrimaryBadge(badge);
    }
    
    onSave(updatedBadges);
  };

  const removeBadge = (badgeId: string) => {
    const badgeToRemove = selectedBadges.find(b => b.id === badgeId);
    const updatedBadges = selectedBadges.filter(b => b.id !== badgeId);
    setSelectedBadges(updatedBadges);
    
    if (badgeToRemove && primaryBadge?.id === badgeToRemove.badge.id) {
      setPrimaryBadge(null);
    }
    
    onSave(updatedBadges);
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    selectedBadges.forEach((position) => {
      const img = new window.Image();
      img.src = `/assets/badges/${position.badge.src}`;
      img.onload = () => {
        const effect = RARITY_EFFECTS[position.badge.rarity];
        ctx.save();
        
        // Apply glow effect
        ctx.shadowColor = effect.glowColor;
        ctx.shadowBlur = 20;
        
        // Scale based on rarity
        const size = 64 * effect.scale;
        
        // Primary badge gets extra emphasis
        const isPrimary = primaryBadge?.id === position.badge.id;
        const finalSize = isPrimary ? size * 1.2 : size;
        
        ctx.drawImage(img, position.x - finalSize/2, position.y - finalSize/2, finalSize, finalSize);
        
        // Add primary badge indicator
        if (isPrimary) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fbbf24';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('⭐', position.x, position.y - finalSize/2 - 10);
        }
        
        ctx.restore();
      };
    });
  }, [selectedBadges, primaryBadge]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clicked = selectedBadges
      .slice()
      .reverse()
      .find(badge => {
        const effect = RARITY_EFFECTS[badge.badge.rarity];
        const size = 64 * effect.scale;
        const isPrimary = primaryBadge?.id === badge.badge.id;
        const finalSize = isPrimary ? size * 1.2 : size;
        
        const dx = x - badge.x;
        const dy = y - badge.y;
        return Math.sqrt(dx * dx + dy * dy) <= finalSize/2;
      });

    if (clicked) {
      setDragging(clicked);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(50, Math.min(canvas.width - 50, e.clientX - rect.left));
    const y = Math.max(50, Math.min(canvas.height - 50, e.clientY - rect.top));

    const updatedBadges = selectedBadges.map(badge =>
      badge.id === dragging.id ? { ...badge, x, y } : badge
    );

    setSelectedBadges(updatedBadges);
  };

  const handleCanvasMouseUp = () => {
    if (dragging) {
      onSave(selectedBadges);
      setDragging(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Badge Selection Panel */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-cosmic-deep/30 backdrop-blur-lg rounded-2xl p-6 border border-cosmic-glow/30">
            <h2 className="text-3xl font-mystical text-cosmic-gold mb-6 text-center bg-gradient-to-r from-cosmic-gold to-cosmic-accent bg-clip-text text-transparent">
              ✨ Cosmic Badge Collection ✨
            </h2>

            {/* Suggested Badges */}
            {suggestedBadges.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-xl border border-cosmic-glow/20">
                <h3 className="text-cosmic-accent font-semibold mb-3 flex items-center">
                  <span className="mr-2">💫</span>
                  Suggested for {userZodiac.charAt(0).toUpperCase() + userZodiac.slice(1)}:
                </h3>
                <div className="flex gap-3">
                  {suggestedBadges.map(badge => {
                    const effect = RARITY_EFFECTS[badge.rarity];
                    const isSelected = selectedBadges.some(b => b.badge.id === badge.id);
                    
                    return (
                      <motion.button
                        key={badge.id}
                        onClick={() => addBadge(badge)}
                        disabled={isSelected}
                        className="relative group"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <div
                          className={`relative w-16 h-16 rounded-full border-2 transition-all duration-300 ${
                            isSelected 
                              ? 'border-cosmic-gold opacity-50 cursor-not-allowed' 
                              : 'border-cosmic-glow/50 hover:border-cosmic-glow cursor-pointer'
                          }`}
                          style={{
                            boxShadow: effect.glow,
                            transform: `scale(${effect.scale})`
                          }}
                        >
                          <Image
                            src={`/assets/badges/${badge.src}`}
                            alt={badge.name}
                            width={64}
                            height={64}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/placeholder.png';
                            }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                              <span className="text-cosmic-gold text-xl">✓</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 min-w-32 text-center">
                          <div className="font-semibold text-cosmic-accent">{badge.name}</div>
                          <div className="text-cosmic-light text-xs capitalize">{badge.rarity}</div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <motion.button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeCategory === category.key
                      ? 'bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white shadow-lg'
                      : 'bg-cosmic-deep/50 text-cosmic-light hover:text-cosmic-accent border border-cosmic-glow/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-cosmic-glow/50">
              <AnimatePresence>
                {filteredBadges.map(badge => {
                  const effect = RARITY_EFFECTS[badge.rarity];
                  const isSelected = selectedBadges.some(b => b.badge.id === badge.id);
                  
                  return (
                    <motion.div
                      key={badge.id}
                      className="relative group cursor-pointer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: effect.scale * 1.1 }}
                      whileTap={{ scale: effect.scale * 0.9 }}
                      onClick={() => isSelected ? null : addBadge(badge)}
                    >
                      <div 
                        className={`relative transition-all duration-300 ${isSelected ? 'opacity-50' : ''}`}
                        style={{
                          filter: `drop-shadow(${effect.glow})`
                        }}
                      >
                        <Image
                          src={`/assets/badges/${badge.src}`}
                          alt={badge.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full border-2 border-cosmic-glow/30 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/placeholder.png';
                          }}
                        />
                        
                        {/* Rarity indicator */}
                        <div 
                          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border border-black/50 ${
                            badge.rarity === 'legendary' ? 'bg-yellow-400' :
                            badge.rarity === 'epic' ? 'bg-purple-500' :
                            badge.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-400'
                          }`} 
                        />
                        
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <span className="text-cosmic-gold text-xl">✓</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-48">
                        <div className="font-semibold text-cosmic-accent">{badge.name}</div>
                        <div className="text-cosmic-light">{badge.description}</div>
                        <div className={`text-xs mt-1 capitalize ${
                          badge.rarity === 'legendary' ? 'text-yellow-400' :
                          badge.rarity === 'epic' ? 'text-purple-400' :
                          badge.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          {badge.rarity}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Badge Arrangement Canvas */}
        <div className="space-y-6">
          <div className="bg-cosmic-deep/30 backdrop-blur-lg rounded-2xl p-6 border border-cosmic-glow/30">
            <h2 className="text-2xl font-mystical text-cosmic-gold mb-6 text-center bg-gradient-to-r from-cosmic-gold to-cosmic-accent bg-clip-text text-transparent">
              🎨 Cosmic Identity Preview
            </h2>

            <div className="relative bg-gradient-to-br from-cosmic-deep/50 to-cosmic-purple/20 rounded-xl p-4 mb-6 border border-cosmic-glow/20">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="w-full h-full cursor-pointer rounded-lg"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              
              {selectedBadges.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-cosmic-light/50 text-center">
                  <div>
                    <div className="text-4xl mb-2">🌌</div>
                    <div>Select badges to arrange your cosmic identity</div>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Badge Info */}
            {primaryBadge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-xl p-4 text-center mb-4 border border-cosmic-glow/20"
              >
                <h3 className="text-cosmic-accent font-semibold mb-2 flex items-center justify-center">
                  <span className="mr-2">⭐</span>
                  Primary Badge: {primaryBadge.name}
                </h3>
                <p className="text-cosmic-light text-sm">
                  {primaryBadge.description}
                </p>
              </motion.div>
            )}

            {/* Selected Badges List */}
            {selectedBadges.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-cosmic-accent font-semibold flex items-center">
                  <span className="mr-2">✨</span>
                  Selected Badges ({selectedBadges.length}/5):
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-cosmic-glow/50">
                  {selectedBadges.map(position => (
                    <motion.div
                      key={position.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between bg-cosmic-purple/10 rounded-lg p-3 border border-cosmic-glow/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Image
                            src={`/assets/badges/${position.badge.src}`}
                            alt={position.badge.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full"
                          />
                          {primaryBadge?.id === position.badge.id && (
                            <span className="absolute -top-1 -right-1 text-yellow-400 text-xs">⭐</span>
                          )}
                        </div>
                        <div>
                          <span className="text-cosmic-light font-medium">{position.badge.name}</span>
                          <div className={`text-xs capitalize ${
                            position.badge.rarity === 'legendary' ? 'text-yellow-400' :
                            position.badge.rarity === 'epic' ? 'text-purple-400' :
                            position.badge.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'
                          }`}>
                            {position.badge.rarity}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeBadge(position.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-400/20 rounded"
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="text-center mt-6">
              <motion.button
                onClick={() => onSave(selectedBadges)}
                className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-cosmic-gold/80 to-cosmic-accent/80 text-white shadow-lg hover:shadow-cosmic-glow/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💫 Save Cosmic Identity
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmicBadgeSystem;