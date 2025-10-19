'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageCircle, Shield, Sparkles, Star, Users, Users2, Zap } from 'lucide-react';
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
  zodiacInsights: string[];
  elementalFlow: string;
  tribeSuggestions: string[];
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
      overallRating,
      zodiacInsights: generateZodiacInsights(sign1Data, sign2Data),
      elementalFlow: generateElementalFlow(sign1Data.element, sign2Data.element),
      tribeSuggestions: generateTribeSuggestions(sign1Data, sign2Data)
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

  const generateZodiacInsights = (sign1: ZodiacSign, sign2: ZodiacSign): string[] => {
    const insights = [];
    insights.push(`${sign1.name}'s ${sign1.traits[0].toLowerCase()} nature complements ${sign2.name}'s ${sign2.traits[0].toLowerCase()} approach`);
    insights.push(`Together they create a balanced cosmic energy flow`);
    insights.push(`${sign1.element} and ${sign2.element} elements create unique dynamic interactions`);
    return insights;
  };

  const generateElementalFlow = (element1: string, element2: string): string => {
    const flows = {
      'Fire+Fire': 'Intense passion and creative energy',
      'Fire+Earth': 'Grounded ambition with fiery drive',
      'Fire+Air': 'Inspiring ideas with passionate execution',
      'Fire+Water': 'Emotional depth with transformative energy',
      'Earth+Earth': 'Stable foundation and practical harmony',
      'Earth+Air': 'Grounded ideas with intellectual depth',
      'Earth+Water': 'Nurturing stability with emotional wisdom',
      'Water+Water': 'Deep emotional connection and intuition',
      'Water+Air': 'Emotional intelligence with mental clarity',
      'Air+Air': 'Intellectual stimulation and communication'
    };
    return flows[`${element1}+${element2}` as keyof typeof flows] || 'Balanced elemental interaction';
  };

  const generateTribeSuggestions = (sign1: ZodiacSign, sign2: ZodiacSign): string[] => {
    const suggestions = [];
    suggestions.push(`${sign1.name} Creative Collective`);
    suggestions.push(`${sign2.name} Wisdom Circle`);
    suggestions.push(`${sign1.element} & ${sign2.element} Elemental Alliance`);
    suggestions.push('Cosmic Harmony Seekers');
    return suggestions;
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
    <div className="relative z-10 max-w-6xl mx-auto p-8">
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
                className={`p-4 rounded-lg border-2 transition-all ${selectedSign1 === key
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
                className={`p-4 rounded-lg border-2 transition-all ${selectedSign2 === key
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

            {/* Enhanced Analysis Sections */}
            <div className="grid md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-700/50">
              {/* Zodiac Insights */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Zodiac Insights
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {compatibility.zodiacInsights.map((insight, index) => (
                    <li key={`insight-${selectedSign1}-${selectedSign2}-${index}`} className="flex items-start gap-2">
                      <Star className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Elemental Flow */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Elemental Flow
                </h3>
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 border border-blue-500/20">
                  <p className="text-sm text-gray-300">{compatibility.elementalFlow}</p>
                </div>
              </div>

              {/* Tribe Suggestions */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Suggested Tribes
                </h3>
                <div className="space-y-2">
                  {compatibility.tribeSuggestions.map((tribe, index) => (
                    <motion.button
                      key={`tribe-${selectedSign1}-${selectedSign2}-${tribe.replaceAll(/\s+/g, '-')}`}
                      className="w-full bg-gradient-to-r from-green-900/30 to-blue-900/30 hover:from-green-800/40 hover:to-blue-800/40 rounded-lg p-2 border border-green-500/20 transition-colors text-sm text-gray-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {tribe}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Elemental Harmony Visualization */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">Elemental Harmony</h3>
              <div className="flex items-center justify-center gap-8 mb-6">
                {/* First Element */}
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-6xl mb-2">
                    {zodiacSigns[selectedSign1]?.element === 'Fire' && '🔥'}
                    {zodiacSigns[selectedSign1]?.element === 'Earth' && '🌍'}
                    {zodiacSigns[selectedSign1]?.element === 'Air' && '💨'}
                    {zodiacSigns[selectedSign1]?.element === 'Water' && '💧'}
                  </div>
                  <div className={`text-lg font-semibold bg-gradient-to-r ${elementColors[zodiacSigns[selectedSign1]?.element as keyof typeof elementColors]} bg-clip-text text-transparent`}>
                    {zodiacSigns[selectedSign1]?.element}
                  </div>
                  <div className="text-2xl">{zodiacSigns[selectedSign1]?.emoji}</div>
                </motion.div>

                {/* Harmony Flow */}
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl"
                  >
                    ⚡
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-3xl text-yellow-400"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    className="text-2xl"
                  >
                    🌊
                  </motion.div>
                </motion.div>

                {/* Second Element */}
                <motion.div
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="text-6xl mb-2">
                    {zodiacSigns[selectedSign2]?.element === 'Fire' && '🔥'}
                    {zodiacSigns[selectedSign2]?.element === 'Earth' && '🌍'}
                    {zodiacSigns[selectedSign2]?.element === 'Air' && '💨'}
                    {zodiacSigns[selectedSign2]?.element === 'Water' && '💧'}
                  </div>
                  <div className={`text-lg font-semibold bg-gradient-to-r ${elementColors[zodiacSigns[selectedSign2]?.element as keyof typeof elementColors]} bg-clip-text text-transparent`}>
                    {zodiacSigns[selectedSign2]?.element}
                  </div>
                  <div className="text-2xl">{zodiacSigns[selectedSign2]?.emoji}</div>
                </motion.div>
              </div>

              <div className="text-center">
                <motion.div
                  className="inline-block bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-500/30"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-purple-300 font-medium">{compatibility.elementalFlow}</p>
                </motion.div>
              </div>
            </div>

            {/* Social Interaction Features */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Cosmic Connections</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Send Compatibility Message
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users2 className="w-5 h-5" />
                  Find Compatible Tribes
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-5 h-5" />
                  Save This Pairing
                </motion.button>
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
  );
}