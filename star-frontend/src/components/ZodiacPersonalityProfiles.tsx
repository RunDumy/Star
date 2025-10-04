import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ZodiacPersonality {
  name: string;
  element: string;
  symbol: string;
  dates: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  likes: string[];
  dislikes: string[];
  ruling_planet: string;
  compatibility: string[];
  lucky_numbers: number[];
  lucky_colors: string[];
  lucky_gems: string[];
  career_paths: string[];
  cosmic_insight?: string;
}

interface ZodiacOverview {
  [key: string]: {
    name: string;
    symbol: string;
    element: string;
    dates: string;
    personality: string;
  };
}

const ZodiacPersonalityProfiles: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [personalityData, setPersonalityData] = useState<ZodiacPersonality | null>(null);
  const [overviewData, setOverviewData] = useState<ZodiacOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (selectedSign) {
      loadPersonality(selectedSign);
    }
  }, [selectedSign]);

  const loadOverview = async () => {
    try {
      const response = await api.get('/api/v1/analytics/zodiac/personality');
      setOverviewData(response.data);
    } catch (err) {
      setError('Failed to load zodiac overview');
      console.error('Overview load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonality = async (sign: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/analytics/zodiac/personality/${sign}`);
      setPersonalityData(response.data);
    } catch (err) {
      setError('Failed to load personality profile');
      console.error('Personality load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getElementColor = (element: string) => {
    const colors = {
      Fire: 'from-red-500 to-orange-500',
      Earth: 'from-green-500 to-emerald-500',
      Air: 'from-blue-500 to-cyan-500',
      Water: 'from-purple-500 to-indigo-500'
    };
    return colors[element as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getElementIcon = (element: string) => {
    const icons = {
      Fire: '🔥',
      Earth: '🌍',
      Air: '💨',
      Water: '🌊'
    };
    return icons[element as keyof typeof icons] || '✨';
  };

  if (loading && !overviewData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold mb-2">Cosmic Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <h1 className="text-5xl font-bold text-white mb-4">
          Zodiac Personality Profiles
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Discover the cosmic blueprint of your personality. Explore the unique traits,
          strengths, and cosmic energies that shape each zodiac sign.
        </p>
      </motion.div>

      {/* Zodiac Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {!selectedSign ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {overviewData && Object.entries(overviewData).map(([sign, data]) => (
              <motion.div
                key={sign}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSign(sign)}
                className={`bg-gradient-to-br ${getElementColor(data.element)} p-6 rounded-xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{data.symbol}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{data.name}</h3>
                  <p className="text-white/80 mb-2">{data.dates}</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl">{getElementIcon(data.element)}</span>
                    <span className="text-white font-medium">{data.element}</span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {data.personality}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl mx-auto"
            >
              {personalityData && (
                <div className={`bg-gradient-to-br ${getElementColor(personalityData.element)} rounded-2xl p-8 shadow-2xl`}>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedSign(null)}
                      className="mb-6 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors"
                    >
                      ← Back to All Signs
                    </motion.button>
                    <div className="text-8xl mb-4">{personalityData.symbol}</div>
                    <h2 className="text-4xl font-bold text-white mb-2">{personalityData.name}</h2>
                    <p className="text-xl text-white/80 mb-4">{personalityData.dates}</p>
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <span className="text-3xl">{getElementIcon(personalityData.element)}</span>
                      <span className="text-white font-semibold text-lg">{personalityData.element} Sign</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/80">Ruling Planet: {personalityData.ruling_planet}</span>
                    </div>
                  </div>

                  {/* Personality Description */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Personality</h3>
                    <p className="text-white/90 leading-relaxed">{personalityData.personality}</p>
                  </div>

                  {/* Cosmic Insight */}
                  {personalityData.cosmic_insight && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-xl p-6 mb-6"
                    >
                      <h3 className="text-xl font-bold text-yellow-300 mb-2">🌟 Cosmic Insight</h3>
                      <p className="text-white/90">{personalityData.cosmic_insight}</p>
                    </motion.div>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-green-300 mb-4">✨ Strengths</h3>
                      <ul className="space-y-2">
                        {personalityData.strengths.map((strength) => (
                          <li key={strength} className="text-white/90 flex items-center gap-2">
                            <span className="text-green-400">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-red-300 mb-4">⚠️ Weaknesses</h3>
                      <ul className="space-y-2">
                        {personalityData.weaknesses.map((weakness) => (
                          <li key={weakness} className="text-white/90 flex items-center gap-2">
                            <span className="text-red-400">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Likes & Dislikes */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-blue-300 mb-4">💙 Likes</h3>
                      <ul className="space-y-2">
                        {personalityData.likes.map((like) => (
                          <li key={like} className="text-white/90 flex items-center gap-2">
                            <span className="text-blue-400">•</span>
                            {like}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-500/20 border border-gray-400/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-300 mb-4">👎 Dislikes</h3>
                      <ul className="space-y-2">
                        {personalityData.dislikes.map((dislike) => (
                          <li key={dislike} className="text-white/90 flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            {dislike}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Compatibility */}
                  <div className="bg-pink-500/20 border border-pink-400/30 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-pink-300 mb-4">💕 Compatible Signs</h3>
                    <div className="flex flex-wrap gap-3">
                      {personalityData.compatibility.map((sign) => (
                        <span key={sign} className="px-4 py-2 bg-pink-500/30 rounded-full text-white font-medium">
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Lucky Elements */}
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-6 text-center">
                      <h3 className="text-lg font-bold text-yellow-300 mb-3">🎯 Lucky Numbers</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {personalityData.lucky_numbers.map((number) => (
                          <span key={number} className="px-3 py-1 bg-yellow-500/30 rounded-full text-white font-bold">
                            {number}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-6 text-center">
                      <h3 className="text-lg font-bold text-purple-300 mb-3">🎨 Lucky Colors</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {personalityData.lucky_colors.map((color) => (
                          <span key={color} className="px-3 py-1 bg-purple-500/30 rounded-full text-white font-medium">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-xl p-6 text-center">
                      <h3 className="text-lg font-bold text-cyan-300 mb-3">💎 Lucky Gems</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {personalityData.lucky_gems.map((gem) => (
                          <span key={gem} className="px-3 py-1 bg-cyan-500/30 rounded-full text-white font-medium text-sm">
                            {gem}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Career Paths */}
                  <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-indigo-300 mb-4">💼 Career Paths</h3>
                    <div className="flex flex-wrap gap-3">
                      {personalityData.career_paths.map((career) => (
                        <span key={career} className="px-4 py-2 bg-indigo-500/30 rounded-full text-white font-medium">
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ZodiacPersonalityProfiles;