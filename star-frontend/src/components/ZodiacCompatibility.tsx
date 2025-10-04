'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Shield, Star, Users, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ZodiacSign {
  name: string;
  emoji: string;
  element: string;
  dates: string;
  traits: string[];
  compatibility: Record<string, number>;
}

interface CompatibilityResult {
  score: number;
  description: string;
  strengths: string[];
  challenges: string[];
  elementHarmony: string;
  overallRating: 'excellent' | 'good' | 'moderate' | 'challenging';
}

const zodiacSigns: Record<string, ZodiacSign> = {
  aries: {
    name: 'Aries',
    emoji: '♈',
    element: 'Fire',
    dates: 'March 21 - April 19',
    traits: ['Bold', 'Energetic', 'Independent', 'Confident'],
    compatibility: {}
  },
  taurus: {
    name: 'Taurus',
    emoji: '♉',
    element: 'Earth',
    dates: 'April 20 - May 20',
    traits: ['Reliable', 'Patient', 'Practical', 'Devoted'],
    compatibility: {}
  },
  gemini: {
    name: 'Gemini',
    emoji: '♊',
    element: 'Air',
    dates: 'May 21 - June 20',
    traits: ['Adaptable', 'Communicative', 'Witty', 'Intellectual'],
    compatibility: {}
  },
  cancer: {
    name: 'Cancer',
    emoji: '♋',
    element: 'Water',
    dates: 'June 21 - July 22',
    traits: ['Emotional', 'Intuitive', 'Protective', 'Loyal'],
    compatibility: {}
  },
  leo: {
    name: 'Leo',
    emoji: '♌',
    element: 'Fire',
    dates: 'July 23 - August 22',
    traits: ['Creative', 'Passionate', 'Generous', 'Warm'],
    compatibility: {}
  },
  virgo: {
    name: 'Virgo',
    emoji: '♍',
    element: 'Earth',
    dates: 'August 23 - September 22',
    traits: ['Analytical', 'Practical', 'Hardworking', 'Kind'],
    compatibility: {}
  },
  libra: {
    name: 'Libra',
    emoji: '♎',
    element: 'Air',
    dates: 'September 23 - October 22',
    traits: ['Diplomatic', 'Fair-minded', 'Social', 'Idealistic'],
    compatibility: {}
  },
  scorpio: {
    name: 'Scorpio',
    emoji: '♏',
    element: 'Water',
    dates: 'October 23 - November 21',
    traits: ['Resourceful', 'Brave', 'Passionate', 'Stubborn'],
    compatibility: {}
  },
  sagittarius: {
    name: 'Sagittarius',
    emoji: '♐',
    element: 'Fire',
    dates: 'November 22 - December 21',
    traits: ['Optimistic', 'Freedom-loving', 'Jovial', 'Honest'],
    compatibility: {}
  },
  capricorn: {
    name: 'Capricorn',
    emoji: '♑',
    element: 'Earth',
    dates: 'December 22 - January 19',
    traits: ['Responsible', 'Disciplined', 'Self-controlled', 'Ambitious'],
    compatibility: {}
  },
  aquarius: {
    name: 'Aquarius',
    emoji: '♒',
    element: 'Air',
    dates: 'January 20 - February 18',
    traits: ['Progressive', 'Original', 'Independent', 'Humanitarian'],
    compatibility: {}
  },
  pisces: {
    name: 'Pisces',
    emoji: '♓',
    element: 'Water',
    dates: 'February 19 - March 20',
    traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'],
    compatibility: {}
  }
};

const elementColors = {
  Fire: 'from-red-500 to-orange-500',
  Earth: 'from-green-500 to-emerald-500',
  Air: 'from-blue-500 to-cyan-500',
  Water: 'from-purple-500 to-indigo-500'
};

export default function ZodiacCompatibility() {
  const [selectedSign1, setSelectedSign1] = useState<string>('');
  const [selectedSign2, setSelectedSign2] = useState<string>('');
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generateMockCompatibility = useCallback((sign1: string, sign2: string): CompatibilityResult => {
    const sign1Data = zodiacSigns[sign1];
    const sign2Data = zodiacSigns[sign2];

    // Simple compatibility calculation based on elements
    const elementHarmony = getElementHarmony(sign1Data.element, sign2Data.element);
    const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
    const score = Math.max(0, Math.min(100, baseScore + elementHarmony));

    let overallRating: CompatibilityResult['overallRating'];
    if (score >= 85) overallRating = 'excellent';
    else if (score >= 70) overallRating = 'good';
    else if (score >= 55) overallRating = 'moderate';
    else overallRating = 'challenging';

    return {
      score,
      description: `${sign1Data.name} and ${sign2Data.name} have a ${overallRating} cosmic connection!`,
      strengths: generateStrengths(sign1Data, sign2Data),
      challenges: generateChallenges(sign1Data, sign2Data),
      elementHarmony: `${sign1Data.element} + ${sign2Data.element}`,
      overallRating
    };
  }, []);

  const calculateCompatibility = useCallback(async () => {
    if (!selectedSign1 || !selectedSign2) return;

    setLoading(true);
    try {
      const response = await api.post('/api/v1/zodiac/compatibility', {
        sign1: selectedSign1,
        sign2: selectedSign2
      });
      setCompatibility(response.data);
    } catch (error) {
      console.error('Failed to calculate compatibility:', error);
      // Fallback to mock data if API fails
      setCompatibility(generateMockCompatibility(selectedSign1, selectedSign2));
    } finally {
      setLoading(false);
    }
  }, [selectedSign1, selectedSign2, generateMockCompatibility]);

  const getElementHarmony = (element1: string, element2: string): number => {
    if (element1 === element2) return 10; // Same element bonus
    if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) return 8;
    if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) return 8;
    return 0; // Neutral
  };

  const generateStrengths = (sign1: ZodiacSign, sign2: ZodiacSign): string[] => {
    const strengths = [];
    if (sign1.element === sign2.element) {
      strengths.push(`Shared ${sign1.element.toLowerCase()} energy creates natural harmony`);
    }
    strengths.push(`Combined traits: ${sign1.traits[0]} + ${sign2.traits[0]}`);
    strengths.push('Mutual understanding of emotional needs');
    return strengths;
  };

  const generateChallenges = (sign1: ZodiacSign, sign2: ZodiacSign): string[] => {
    const challenges = [];
    if (sign1.element !== sign2.element) {
      challenges.push(`Different elemental energies may require extra communication`);
    }
    challenges.push('Learning to balance individual needs with partnership');
    challenges.push('Navigating different approaches to problem-solving');
    return challenges;
  };

  useEffect(() => {
    if (selectedSign1 && selectedSign2) {
      calculateCompatibility();
    }
  }, [selectedSign1, selectedSign2, calculateCompatibility]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'moderate': return 'text-yellow-400';
      case 'challenging': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return Heart;
      case 'good': return Star;
      case 'moderate': return Users;
      case 'challenging': return Shield;
      default: return Star;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Heart className="w-10 h-10 text-pink-400" />
            Zodiac Compatibility Calculator
          </h1>
          <p className="text-gray-300 text-lg">Discover your cosmic connection with another zodiac sign</p>
        </motion.div>

        {/* Sign Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-8 mb-8"
        >
          {/* First Sign */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Your Sign</h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(zodiacSigns).map(([key, sign]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedSign1(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSign1 === key
                      ? 'border-purple-400 bg-purple-900/50'
                      : 'border-gray-600 hover:border-purple-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{sign.emoji}</div>
                    <div className="text-white font-medium text-sm">{sign.name}</div>
                    <div className={`text-xs bg-gradient-to-r ${elementColors[sign.element as keyof typeof elementColors]} bg-clip-text text-transparent font-medium`}>
                      {sign.element}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Second Sign */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Partner&apos;s Sign</h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(zodiacSigns).map(([key, sign]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedSign2(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedSign2 === key
                      ? 'border-pink-400 bg-pink-900/50'
                      : 'border-gray-600 hover:border-pink-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{sign.emoji}</div>
                    <div className="text-white font-medium text-sm">{sign.name}</div>
                    <div className={`text-xs bg-gradient-to-r ${elementColors[sign.element as keyof typeof elementColors]} bg-clip-text text-transparent font-medium`}>
                      {sign.element}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Compatibility Results */}
        <AnimatePresence>
          {compatibility && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-8 border border-purple-500/20"
            >
              {/* Score Display */}
              <div className="text-center mb-8">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${compatibility.score}, 100`}
                      className="text-gray-600"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${compatibility.score}, 100`}
                      className={getRatingColor(compatibility.overallRating)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{compatibility.score}%</div>
                      <div className={`text-sm font-medium ${getRatingColor(compatibility.overallRating)}`}>
                        {compatibility.overallRating.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  {zodiacSigns[selectedSign1]?.emoji} + {zodiacSigns[selectedSign2]?.emoji}
                  {React.createElement(getRatingIcon(compatibility.overallRating), { className: "w-6 h-6" })}
                </h2>
                <p className="text-gray-300 text-lg">{compatibility.description}</p>
                <p className="text-purple-400 font-medium mt-2">{compatibility.elementHarmony}</p>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Cosmic Strengths
                  </h3>
                  <ul className="space-y-2">
                    {compatibility.strengths.map((strength, index) => (
                      <li key={`strength-${index}-${strength.slice(0, 10)}`} className="text-gray-300 flex items-start gap-2">
                        <Star className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Growth Opportunities
                  </h3>
                  <ul className="space-y-2">
                    {compatibility.challenges.map((challenge, index) => (
                      <li key={`challenge-${index}-${challenge.slice(0, 10)}`} className="text-gray-300 flex items-start gap-2">
                        <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sign Details */}
              <div className="grid md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-700/50">
                <div className="text-center">
                  <div className="text-4xl mb-2">{zodiacSigns[selectedSign1]?.emoji}</div>
                  <h4 className="text-xl font-semibold text-white">{zodiacSigns[selectedSign1]?.name}</h4>
                  <p className="text-gray-400">{zodiacSigns[selectedSign1]?.dates}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${elementColors[zodiacSigns[selectedSign1]?.element as keyof typeof elementColors]} text-white mt-2`}>
                    {zodiacSigns[selectedSign1]?.element}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">{zodiacSigns[selectedSign2]?.emoji}</div>
                  <h4 className="text-xl font-semibold text-white">{zodiacSigns[selectedSign2]?.name}</h4>
                  <p className="text-gray-400">{zodiacSigns[selectedSign2]?.dates}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${elementColors[zodiacSigns[selectedSign2]?.element as keyof typeof elementColors]} text-white mt-2`}>
                    {zodiacSigns[selectedSign2]?.element}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Calculating cosmic compatibility...</p>
          </div>
        )}
      </div>
    </div>
  );
}