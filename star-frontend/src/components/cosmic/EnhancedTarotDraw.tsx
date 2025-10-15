import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TarotCard {
  name: string;
  meaning: string;
  reversedMeaning: string;
  element: string;
  zodiacs: string[];
  mysticalMessage: string;
  isReversed?: boolean;
}

// Complete 22 Major Arcana with comprehensive meanings
const MAJOR_ARCANA: TarotCard[] = [
  {
    name: 'The Fool',
    meaning: 'New beginnings, adventure, spontaneity, trusting the universe\'s path.',
    reversedMeaning: 'Recklessness, fear of change, lack of direction, impulsiveness.',
    element: 'Air',
    zodiacs: ['aquarius', 'uranus'],
    mysticalMessage: '✨ Step into the unknown with cosmic courage ✨'
  },
  {
    name: 'The Magician',
    meaning: 'Manifestation, resourcefulness, channeling divine power, willpower.',
    reversedMeaning: 'Manipulation, poor planning, untapped potential, deception.',
    element: 'Air',
    zodiacs: ['gemini', 'virgo', 'mercury'],
    mysticalMessage: '🌟 Channel universal energy into reality 🌟'
  },
  {
    name: 'The High Priestess',
    meaning: 'Intuition, inner wisdom, secrets of the cosmos unveiled, mystery.',
    reversedMeaning: 'Hidden motives, blocked intuition, disconnection from inner self.',
    element: 'Water',
    zodiacs: ['cancer', 'pisces', 'moon'],
    mysticalMessage: '🌙 Trust your inner wisdom and divine intuition 🌙'
  },
  {
    name: 'The Empress',
    meaning: 'Abundance, nurturing, creative fertility, motherly energy, nature.',
    reversedMeaning: 'Stagnation, neglect, creative blocks, lack of growth.',
    element: 'Earth',
    zodiacs: ['taurus', 'libra', 'venus'],
    mysticalMessage: '🌸 Nurture your creative potential and abundance 🌸'
  },
  {
    name: 'The Emperor',
    meaning: 'Authority, structure, leadership, disciplined control, stability.',
    reversedMeaning: 'Rigidity, dominance, lack of discipline, abuse of power.',
    element: 'Fire',
    zodiacs: ['aries', 'mars'],
    mysticalMessage: '👑 Lead with wisdom and cosmic authority 👑'
  },
  {
    name: 'The Hierophant',
    meaning: 'Tradition, spiritual guidance, wisdom through structure, teaching.',
    reversedMeaning: 'Rebellion, unconventional approaches, personal beliefs.',
    element: 'Earth',
    zodiacs: ['taurus', 'venus'],
    mysticalMessage: '🏛️ Seek wisdom through ancient traditions 🏛️'
  },
  {
    name: 'The Lovers',
    meaning: 'Harmony, love, choices aligned with the heart, partnership.',
    reversedMeaning: 'Disharmony, poor choices, relationship struggles, imbalance.',
    element: 'Air',
    zodiacs: ['gemini', 'mercury'],
    mysticalMessage: '💕 Choose love and cosmic harmony 💕'
  },
  {
    name: 'The Chariot',
    meaning: 'Willpower, determination, triumph through focus, control.',
    reversedMeaning: 'Lack of control, aggression, losing direction, scattered energy.',
    element: 'Water',
    zodiacs: ['cancer', 'moon'],
    mysticalMessage: '🏇 Harness your will to achieve victory 🏇'
  },
  {
    name: 'Strength',
    meaning: 'Inner strength, courage, taming instincts with compassion, patience.',
    reversedMeaning: 'Weakness, lack of confidence, brutality, impatience.',
    element: 'Fire',
    zodiacs: ['leo', 'sun'],
    mysticalMessage: '🦁 Find strength through gentle compassion 🦁'
  },
  {
    name: 'The Hermit',
    meaning: 'Introspection, solitude, seeking inner truth, soul searching.',
    reversedMeaning: 'Isolation, loneliness, withdrawal from others, lost guidance.',
    element: 'Earth',
    zodiacs: ['virgo', 'mercury'],
    mysticalMessage: '🔦 Illuminate your path through inner reflection 🔦'
  },
  {
    name: 'Wheel of Fortune',
    meaning: 'Destiny, cycles, unexpected turns of fate, karma, luck.',
    reversedMeaning: 'Bad luck, lack of control, resistance to change, negative cycles.',
    element: 'Fire',
    zodiacs: ['jupiter', 'sagittarius'],
    mysticalMessage: '🎰 Trust in the cosmic wheel of destiny 🎰'
  },
  {
    name: 'Justice',
    meaning: 'Balance, fairness, truth, karmic consequences, accountability.',
    reversedMeaning: 'Unfairness, lack of accountability, dishonesty, bias.',
    element: 'Air',
    zodiacs: ['libra', 'venus'],
    mysticalMessage: '⚖️ Seek truth and cosmic justice ⚖️'
  },
  {
    name: 'The Hanged Man',
    meaning: 'Surrender, sacrifice, new perspectives through letting go, patience.',
    reversedMeaning: 'Stalling, needless sacrifice, fear of sacrifice, martyrdom.',
    element: 'Water',
    zodiacs: ['pisces', 'neptune'],
    mysticalMessage: '🙃 Find wisdom through sacred surrender 🙃'
  },
  {
    name: 'Death',
    meaning: 'Transformation, endings, new beginnings, rebirth, letting go.',
    reversedMeaning: 'Resistance to change, stagnation, fear of loss, clinging.',
    element: 'Water',
    zodiacs: ['scorpio', 'pluto'],
    mysticalMessage: '🦋 Embrace transformation and cosmic renewal 🦋'
  },
  {
    name: 'Temperance',
    meaning: 'Balance, moderation, blending energies harmoniously, patience.',
    reversedMeaning: 'Imbalance, excess, lack of patience, extremes.',
    element: 'Fire',
    zodiacs: ['sagittarius', 'jupiter'],
    mysticalMessage: '🍵 Find harmony through cosmic balance 🍵'
  },
  {
    name: 'The Devil',
    meaning: 'Temptation, materialism, breaking free from chains, shadow self.',
    reversedMeaning: 'Breaking chains, overcoming addiction, freedom, enlightenment.',
    element: 'Earth',
    zodiacs: ['capricorn', 'saturn'],
    mysticalMessage: '😈 Break free from cosmic illusions 😈'
  },
  {
    name: 'The Tower',
    meaning: 'Sudden change, upheaval, awakening through disruption, revelation.',
    reversedMeaning: 'Avoiding disaster, fear of change, internal upheaval.',
    element: 'Fire',
    zodiacs: ['aries', 'mars'],
    mysticalMessage: '⚡ Embrace cosmic transformation ⚡'
  },
  {
    name: 'The Star',
    meaning: 'Hope, inspiration, healing, cosmic guidance, spiritual insight.',
    reversedMeaning: 'Despair, lack of faith, disconnection from purpose.',
    element: 'Air',
    zodiacs: ['aquarius', 'uranus'],
    mysticalMessage: '⭐ Your light guides others through darkness ⭐'
  },
  {
    name: 'The Moon',
    meaning: 'Illusion, intuition, dreams, subconscious fears, mystery.',
    reversedMeaning: 'Clarity, overcoming fears, reality surfacing, deception revealed.',
    element: 'Water',
    zodiacs: ['pisces', 'cancer', 'moon'],
    mysticalMessage: '🌙 Navigate through illusion to cosmic truth 🌙'
  },
  {
    name: 'The Sun',
    meaning: 'Joy, success, vitality, radiant energy, enlightenment.',
    reversedMeaning: 'Temporary setbacks, lack of enthusiasm, delayed success.',
    element: 'Fire',
    zodiacs: ['leo', 'sun'],
    mysticalMessage: '☀️ Radiate joy and cosmic vitality ☀️'
  },
  {
    name: 'Judgement',
    meaning: 'Awakening, renewal, answering a higher calling, rebirth.',
    reversedMeaning: 'Self-doubt, lack of self-awareness, harsh judgment.',
    element: 'Fire',
    zodiacs: ['scorpio', 'pluto'],
    mysticalMessage: '📯 Answer your cosmic calling 📯'
  },
  {
    name: 'The World',
    meaning: 'Completion, fulfillment, unity with the universe, achievement.',
    reversedMeaning: 'Incomplete goals, lack of closure, seeking shortcuts.',
    element: 'Earth',
    zodiacs: ['capricorn', 'saturn'],
    mysticalMessage: '🌍 Achieve cosmic unity and completion 🌍'
  }
];

interface EnhancedTarotDrawProps {
  type: 'daily' | 'weekly';
  userZodiac: string;
  userId?: string;
  onShare?: (cards: TarotCard[]) => void;
}

const EnhancedTarotDraw: React.FC<EnhancedTarotDrawProps> = ({
  type,
  userZodiac,
  userId,
  onShare
}) => {
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const drawCards = async () => {
    if (!userId) {
      alert('Please enter a User ID to draw cards');
      return;
    }

    setIsDrawing(true);
    setRevealedCards(new Set());
    
    const count = type === 'daily' ? 3 : 5;
    
    // Zodiac-weighted card selection with reversed possibility
    const weightedCards = MAJOR_ARCANA.map(card => ({
      ...card,
      weight: card.zodiacs.some(z => z.toLowerCase().includes(userZodiac.toLowerCase())) ? 3 : 1
    }));
    
    const totalWeight = weightedCards.reduce((sum, card) => sum + card.weight, 0);
    const selected: TarotCard[] = [];
    
    for (let i = 0; i < count; i++) {
      let rand = Math.random() * totalWeight;
      for (const card of weightedCards) {
        rand -= card.weight;
        if (rand <= 0) {
          // 20% chance for reversed card
          const isReversed = Math.random() < 0.2;
          selected.push({
            ...card,
            isReversed,
            meaning: isReversed ? card.reversedMeaning : card.meaning
          });
          break;
        }
      }
    }
    
    setDrawnCards(selected);
    
    // Save to backend
    try {
      await fetch(`${API_URL}/api/v1/tarot/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          draw_type: type,
          cards: selected,
          zodiac: userZodiac,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving tarot draw:', error);
    }
    
    // Reveal cards sequentially
    setTimeout(() => {
      selected.forEach((_, index) => {
        setTimeout(() => {
          setRevealedCards(prev => new Set([...prev, index]));
        }, index * 800);
      });
    }, 500);
    
    setTimeout(() => setIsDrawing(false), count * 800 + 1000);
  };

  const handleShare = async () => {
    if (!userId || !onShare) return;
    
    try {
      await fetch(`${API_URL}/api/v1/tarot/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          cards: drawnCards,
          type: `shared_${type}`,
          zodiac: userZodiac
        })
      });
      onShare(drawnCards);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} reading shared to cosmic feed!`);
    } catch (error) {
      console.error('Error sharing tarot draw:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-deep via-cosmic-purple/20 to-cosmic-blue/30 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-mystical text-cosmic-gold mb-4 bg-gradient-to-r from-cosmic-gold to-cosmic-accent bg-clip-text text-transparent">
            {type === 'daily' ? '🌅 Daily Cosmic Reading' : '🌌 Weekly Star Guidance'}
          </h2>
          <p className="text-cosmic-light text-lg">
            Zodiac: {userZodiac.charAt(0).toUpperCase() + userZodiac.slice(1)}
          </p>
        </motion.div>

        {/* Draw Button */}
        {drawnCards.length === 0 && (
          <div className="text-center mb-8">
            <motion.button
              onClick={drawCards}
              disabled={isDrawing}
              className="px-8 py-4 text-xl font-bold rounded-lg bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white shadow-lg hover:shadow-cosmic-glow/50 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDrawing ? 'Drawing Cards...' : `✨ Draw ${type.charAt(0).toUpperCase() + type.slice(1)} Cards ✨`}
            </motion.button>
          </div>
        )}

        {/* Cards Container */}
        <div className="relative min-h-[500px] flex justify-center items-center">
          <AnimatePresence>
            {drawnCards.map((card, index) => (
              <motion.div
                key={`${card.name}-${index}`}
                className="absolute"
                style={{
                  left: `${20 + (index * 60 / Math.max(drawnCards.length - 1, 1))}%`,
                  transform: 'translateX(-50%)'
                }}
                initial={{ scale: 0, rotateY: 180, y: -100 }}
                animate={{
                  scale: 1,
                  rotateY: revealedCards.has(index) ? (card.isReversed ? 180 : 0) : 180,
                  y: 0,
                  transition: { delay: index * 0.3, duration: 0.8 }
                }}
              >
                {/* Card Back */}
                <motion.div
                  className="tarot-card-container"
                  style={{
                    backfaceVisibility: 'hidden',
                    display: revealedCards.has(index) ? 'none' : 'block'
                  }}
                >
                  <div className="relative w-48 h-72 rounded-lg overflow-hidden shadow-2xl border-2 border-cosmic-glow/50">
                    <img
                      src="/assets/tarot/blank_tarot.png"
                      alt="Card Back"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-cosmic-purple/30 to-cosmic-blue/30 flex items-center justify-center">
                      <div className="text-cosmic-gold text-3xl animate-pulse">
                        ✨ 🌙 ✨
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card Front */}
                <motion.div
                  className="tarot-card-container"
                  style={{
                    backfaceVisibility: 'hidden',
                    display: revealedCards.has(index) ? 'block' : 'none'
                  }}
                >
                  <div className={`relative w-48 h-72 rounded-lg overflow-hidden shadow-2xl border-2 border-cosmic-glow/50 ${card.isReversed ? 'transform rotate-180' : ''}`}>
                    <img
                      src="/assets/tarot/blank_tarot.png"
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80" />
                    
                    {/* Card Text Overlay */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      {/* Card Name */}
                      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 text-center border border-cosmic-glow/30">
                        <h3 className="text-cosmic-gold font-bold text-lg mb-1">
                          {card.name}
                        </h3>
                        <p className="text-cosmic-accent text-xs">
                          {card.element} Element {card.isReversed ? '(Reversed)' : ''}
                        </p>
                      </div>

                      {/* Mystical Message */}
                      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 text-center border border-cosmic-glow/30">
                        <p className="text-cosmic-light text-sm font-medium">
                          {card.mysticalMessage}
                        </p>
                      </div>

                      {/* Card Meaning */}
                      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 text-center border border-cosmic-glow/30">
                        <p className="text-cosmic-light text-xs leading-relaxed">
                          {card.meaning}
                        </p>
                      </div>
                    </div>

                    {/* Particle Effect */}
                    {revealedCards.has(index) && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-cosmic-gold rounded-full"
                            initial={{
                              x: Math.random() * 100 + '%',
                              y: '100%',
                              scale: 0
                            }}
                            animate={{
                              y: '-10%',
                              scale: [0, 1, 0],
                              opacity: [0, 1, 0]
                            }}
                            transition={{
                              duration: 3,
                              delay: i * 0.3,
                              repeat: Infinity,
                              repeatDelay: 4
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {drawnCards.length > 0 && !isDrawing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8 space-x-4"
          >
            <motion.button
              onClick={drawCards}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white shadow-lg hover:shadow-cosmic-glow/50 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Draw Again
            </motion.button>
            {onShare && (
              <motion.button
                onClick={handleShare}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cosmic-gold/80 to-cosmic-accent/80 text-white shadow-lg hover:shadow-cosmic-glow/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📤 Share Reading
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Cosmic Insight */}
        {drawnCards.length > 0 && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-16 text-center"
          >
            <div className="bg-cosmic-deep/50 backdrop-blur-lg rounded-2xl p-8 border border-cosmic-glow/30 max-w-2xl mx-auto">
              <h3 className="text-2xl font-mystical text-cosmic-gold mb-4">
                ✨ Cosmic Insight ✨
              </h3>
              <p className="text-cosmic-light leading-relaxed">
                {type === 'daily' 
                  ? 'The cards reveal the energy flow of your day. Let the past inform you, the present empower you, and the future inspire you.'
                  : 'Your weekly path is illuminated. Each card represents a phase of cosmic energy flowing through your seven-day journey.'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .tarot-card-container {
          perspective: 1000px;
        }
        
        @keyframes cosmic-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }
      `}</style>
    </div>
  );
};

export default EnhancedTarotDraw;