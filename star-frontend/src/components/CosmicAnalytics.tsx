'use client';

import { motion } from 'framer-motion';
import { Activity, BarChart3, Calendar, Heart, MessageCircle, Star, TrendingUp, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalNotifications: number;
  zodiacDistribution: Record<string, number>;
  activityPatterns: {
    hour: number;
    count: number;
  }[];
  engagementMetrics: {
    likes: number;
    comments: number;
    follows: number;
    messages: number;
  };
  planetClicks: Record<string, number>;
  constellationReveals: Record<string, number>;
  topZodiacPairs: {
    pair: string;
    compatibility: number;
    count: number;
  }[];
}

export default function CosmicAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/analytics?period=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const zodiacEmojis: Record<string, string> = {
    aries: '♈',
    taurus: '♉',
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading cosmic insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white text-lg">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <BarChart3 className="w-10 h-10 text-purple-400" />
            Cosmic Analytics Dashboard
          </h1>
          <p className="text-gray-300 text-lg">Insights into your cosmic social universe</p>

          {/* Time Range Selector */}
          <div className="flex justify-center gap-2 mt-6">
            {(['7d', '30d', '90d'] as const).map((range) => {
              const labels = { '7d': '7 Days', '30d': '30 Days', '90d': '90 Days' };
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {labels[range]}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8 text-blue-400" />
              <h3 className="text-white font-semibold">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.totalUsers.toLocaleString()}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-8 h-8 text-green-400" />
              <h3 className="text-white font-semibold">Active Users</h3>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.activeUsers.toLocaleString()}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-8 h-8 text-purple-400" />
              <h3 className="text-white font-semibold">Notifications</h3>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.totalNotifications.toLocaleString()}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <h3 className="text-white font-semibold">Engagement Rate</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {((analytics.engagementMetrics.likes + analytics.engagementMetrics.comments) / analytics.totalUsers * 100).toFixed(1)}%
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Zodiac Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Zodiac Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.zodiacDistribution).map(([sign, count]) => (
                <div key={sign} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{zodiacEmojis[sign] || '⭐'}</span>
                    <span className="text-white capitalize">{sign}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(count / Math.max(...Object.values(analytics.zodiacDistribution))) * 100}%` }} // eslint-disable-line react/style-prop-object
                      ></div>
                    </div>
                    <span className="text-gray-300 text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Patterns */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-400" />
              Activity Patterns (24h)
            </h3>
            <div className="space-y-2">
              {analytics.activityPatterns.map((pattern) => (
                <div key={pattern.hour} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm w-12">
                    {pattern.hour.toString().padStart(2, '0')}:00
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(pattern.count / Math.max(...analytics.activityPatterns.map(p => p.count))) * 100}%` }} // eslint-disable-line react/style-prop-object
                      ></div>
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm w-8 text-right">{pattern.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Engagement Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-400" />
              Engagement Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-1">{analytics.engagementMetrics.likes.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{analytics.engagementMetrics.comments.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">{analytics.engagementMetrics.follows.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Follows</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{analytics.engagementMetrics.messages.toLocaleString()}</div>
                <div className="text-gray-300 text-sm">Messages</div>
              </div>
            </div>
          </motion.div>

          {/* Planet Clicks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-orange-400" />
              Planet Button Clicks
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.planetClicks).map(([planet, count]) => (
                <div key={planet} className="flex items-center justify-between">
                  <span className="text-white capitalize">{planet}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(analytics.planetClicks))) * 100}%` }} // eslint-disable-line react/style-prop-object
                      ></div>
                    </div>
                    <span className="text-gray-300 text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Constellation Reveals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Constellation Reveals
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.constellationReveals).map(([zodiac, count]) => (
                <div key={zodiac} className="flex items-center justify-between">
                  <span className="text-white capitalize flex items-center gap-2">
                    {zodiacEmojis[zodiac] || '❓'} {zodiac}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(analytics.constellationReveals))) * 100}%` }} // eslint-disable-line react/style-prop-object
                      ></div>
                    </div>
                    <span className="text-gray-300 text-sm w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Zodiac Pairs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Top Zodiac Compatibility
            </h3>
            <div className="space-y-3">
              {analytics.topZodiacPairs.slice(0, 5).map((pair, index) => (
                <div key={pair.pair} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-yellow-400">#{index + 1}</span>
                    <span className="text-white">{pair.pair}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                        style={{ width: `${pair.compatibility}%` }} // eslint-disable-line react/style-prop-object
                      ></div>
                    </div>
                    <span className="text-gray-300 text-sm">{pair.compatibility}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}