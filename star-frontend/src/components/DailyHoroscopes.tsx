'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Heart, Shield, Sparkles, Star, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface HoroscopeData {
  sign: string;
  date: string;
  prediction: string;
  love: string;
  career: string;
  health: string;
  lucky_number: number;
  lucky_color: string;
  mood: string;
}

const zodiacSigns = [
  { key: 'aries', name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19' },
  { key: 'taurus', name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20' },
  { key: 'gemini', name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20' },
  { key: 'cancer', name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
  { key: 'leo', name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22' },
  { key: 'virgo', name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22' },
  { key: 'libra', name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
  { key: 'scorpio', name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
  { key: 'sagittarius', name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21' },
  { key: 'capricorn', name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19' },
  { key: 'aquarius', name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18' },
  { key: 'pisces', name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20' }
];

const moodColors = {
  optimistic: 'text-yellow-400',
  passionate: 'text-red-400',
  calm: 'text-blue-400',
  energetic: 'text-green-400',
  thoughtful: 'text-purple-400',
  adventurous: 'text-orange-400'
};

const moodIcons = {
  optimistic: Star,
  passionate: Heart,
  calm: Shield,
  energetic: Zap,
  thoughtful: Sparkles,
  adventurous: Star
};

export default function DailyHoroscopes() {
  const [selectedSign, setSelectedSign] = useState<string>('');
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHoroscope = useCallback(async (sign: string) => {
    if (!sign) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/v1/horoscopes/daily?sign=${sign}`);
      setHoroscope(response.data);
    } catch (error) {
      console.error('Failed to fetch horoscope:', error);
      // Fallback to mock data
      setHoroscope(generateMockHoroscope(sign));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserSign = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/profile');
      if (response.data.zodiac_sign) {
        setSelectedSign(response.data.zodiac_sign);
        fetchHoroscope(response.data.zodiac_sign);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, [fetchHoroscope]);

  useEffect(() => {
    // Try to get user's zodiac sign from profile
    fetchUserSign();
  }, [fetchUserSign]);

  const generateMockHoroscope = (sign: string): HoroscopeData => {
    const today = new Date().toISOString().split('T')[0];

    const predictions = [
      "Today brings new opportunities for growth and self-discovery.",
      "Trust your intuition as it guides you toward positive changes.",
      "Focus on building meaningful connections with those around you.",
      "Your creativity shines brightly - express yourself freely.",
      "Take time for self-care and nurturing your inner peace.",
      "Embrace challenges as opportunities for personal development."
    ];

    const loveReadings = [
      "Romance is in the air - be open to unexpected connections.",
      "Existing relationships deepen with honest communication.",
      "Single? Focus on self-love before seeking partnership.",
      "Family bonds strengthen through shared experiences.",
      "Express appreciation to loved ones today."
    ];

    const careerReadings = [
      "Professional opportunities present themselves - stay alert.",
      "Collaboration leads to innovative solutions at work.",
      "Take initiative on projects that excite your passion.",
      "Networking opens doors to exciting possibilities.",
      "Balance work demands with personal well-being."
    ];

    const healthReadings = [
      "Prioritize rest and recovery for optimal energy.",
      "Gentle exercise supports both body and mind.",
      "Mindful eating nourishes your body's needs.",
      "Emotional wellness contributes to physical health.",
      "Listen to your body's signals for self-care."
    ];

    const moods = ['optimistic', 'passionate', 'calm', 'energetic', 'thoughtful', 'adventurous'];
    const colors = ['Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Pink', 'Orange'];

    return {
      sign,
      date: today,
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      love: loveReadings[Math.floor(Math.random() * loveReadings.length)],
      career: careerReadings[Math.floor(Math.random() * careerReadings.length)],
      health: healthReadings[Math.floor(Math.random() * healthReadings.length)],
      lucky_number: Math.floor(Math.random() * 99) + 1,
      lucky_color: colors[Math.floor(Math.random() * colors.length)],
      mood: moods[Math.floor(Math.random() * moods.length)]
    };
  };

  useEffect(() => {
    if (selectedSign) {
      fetchHoroscope(selectedSign);
    }
  }, [selectedSign, fetchHoroscope]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Calendar className="w-10 h-10 text-yellow-400" />
            Daily Horoscopes
          </h1>
          <p className="text-gray-300 text-lg">Discover what the stars have in store for you today</p>
        </motion.div>

        {/* Sign Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Select Your Zodiac Sign</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {zodiacSigns.map((sign) => (
              <motion.button
                key={sign.key}
                onClick={() => setSelectedSign(sign.key)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedSign === sign.key
                    ? 'border-yellow-400 bg-yellow-900/50'
                    : 'border-gray-600 hover:border-yellow-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{sign.emoji}</div>
                  <div className="text-white font-medium text-sm">{sign.name}</div>
                  <div className="text-gray-400 text-xs">{sign.dates}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Horoscope Display */}
        <AnimatePresence>
          {horoscope && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header Card */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {zodiacSigns.find(s => s.key === horoscope.sign)?.emoji}
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {zodiacSigns.find(s => s.key === horoscope.sign)?.name}
                  </h2>
                  <p className="text-gray-300 mb-4">{formatDate(horoscope.date)}</p>

                  {/* Mood Indicator */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {React.createElement(moodIcons[horoscope.mood as keyof typeof moodIcons], {
                      className: `w-6 h-6 ${moodColors[horoscope.mood as keyof typeof moodColors]}`
                    })}
                    <span className={`text-lg font-medium capitalize ${moodColors[horoscope.mood as keyof typeof moodColors]}`}>
                      {horoscope.mood} Day
                    </span>
                  </div>

                  {/* Lucky Elements */}
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-xl">{horoscope.lucky_number}</div>
                      <div className="text-gray-300">Lucky Number</div>
                    </div>
                    <div className="text-center">
                      <div className="text-pink-400 font-bold text-xl">{horoscope.lucky_color}</div>
                      <div className="text-gray-300">Lucky Color</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Prediction */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Daily Prediction
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">{horoscope.prediction}</p>
              </div>

              {/* Detailed Readings */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Love */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-pink-500/20">
                  <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Love & Relationships
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{horoscope.love}</p>
                </div>

                {/* Career */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-blue-500/20">
                  <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Career & Finance
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{horoscope.career}</p>
                </div>

                {/* Health */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-green-500/20 md:col-span-2">
                  <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Health & Wellness
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{horoscope.health}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Consulting the stars...</p>
          </div>
        )}

        {/* No Selection State */}
        {!selectedSign && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold text-white mb-2">Choose Your Sign</h3>
            <p className="text-gray-300">Select your zodiac sign to reveal today&apos;s cosmic guidance</p>
          </div>
        )}
      </div>
    </div>
  );
}