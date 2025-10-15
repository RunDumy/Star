/**
 * STAR Platform Analytics Dashboard
 * ================================
 * 
 * Comprehensive analytics interface showing user engagement insights,
 * cosmic patterns, personalized recommendations, and platform metrics.
 */

import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    ArrowDown,
    ArrowUp,
    Award,
    BarChart3,
    Calendar,
    Clock,
    Eye,
    Minus, RefreshCw,
    Sparkles,
    Star,
    Target,
    TrendingUp, Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// Types
interface UserInsights {
    engagement_score: number;
    active_hours: number[];
    favorite_elements: string[];
    cosmic_affinity: Record<string, number>;
    predicted_interests: string[];
    recommendation_tags: string[];
    last_updated: string;
}

interface Recommendation {
    type: string;
    title: string;
    description: string;
    confidence: number;
    tags: string[];
}

interface EngagementSummary {
    total_activities: number;
    daily_average: number;
    engagement_score: number;
    engagement_trend: 'high' | 'stable' | 'low';
    top_activities: Array<{ type: string; count: number }>;
    favorite_elements: string[];
    active_hours: number[];
}

interface CosmicTrend {
    pattern_type: string;
    trend_data: Record<string, number>;
    confidence_score: number;
    time_range: { start: string; end: string; days: number };
    affected_users: number;
    correlation_factors: string[];
}

// Element styling
const ELEMENT_COLORS = {
    fire: { bg: 'from-red-500/20 to-orange-500/20', text: 'text-red-400', icon: '🔥' },
    water: { bg: 'from-blue-500/20 to-teal-500/20', text: 'text-blue-400', icon: '💧' },
    air: { bg: 'from-yellow-500/20 to-green-500/20', text: 'text-yellow-400', icon: '💨' },
    earth: { bg: 'from-green-500/20 to-brown-500/20', text: 'text-green-400', icon: '🌱' }
};

// Engagement trend styling
const TREND_STYLES = {
    high: { icon: ArrowUp, color: 'text-green-400', bg: 'bg-green-500/20' },
    stable: { icon: Minus, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    low: { icon: ArrowDown, color: 'text-red-400', bg: 'bg-red-500/20' }
};

const AnalyticsDashboard: React.FC = () => {
    // State
    const [insights, setInsights] = useState<UserInsights | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [engagementSummary, setEngagementSummary] = useState<EngagementSummary | null>(null);
    const [cosmicTrends, setCosmicTrends] = useState<CosmicTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<number>(7);
    const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'recommendations' | 'patterns'>('overview');

    // Load analytics data
    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Authentication required');
            }

            const headers = { Authorization: `Bearer ${token}` };

            // Load multiple data sources in parallel
            const [
                insightsResponse,
                recommendationsResponse,
                summaryResponse,
                elementalTrendsResponse,
                dailyTrendsResponse
            ] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/insights/${localStorage.getItem('user_id')}`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/recommendations?type=general`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/engagement-summary?days=${selectedTimePeriod}`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/cosmic-patterns?pattern=elemental_affinity&days=${selectedTimePeriod}`, { headers }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/cosmic-patterns?pattern=time_of_day_patterns&days=${selectedTimePeriod}`, { headers })
            ]);

            setInsights(insightsResponse.data.insights);
            setRecommendations(recommendationsResponse.data.recommendations || []);
            setEngagementSummary(summaryResponse.data.engagement_summary);
            setCosmicTrends([elementalTrendsResponse.data, dailyTrendsResponse.data]);

        } catch (err: any) {
            console.error('Error loading analytics:', err);
            setError(err.response?.data?.error || 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and period change
    useEffect(() => {
        loadAnalyticsData();
    }, [selectedTimePeriod]);

    // Memoized calculations
    const engagementLevel = useMemo(() => {
        if (!insights) return 'Getting Started';
        const score = insights.engagement_score;
        if (score >= 80) return 'Cosmic Master';
        if (score >= 60) return 'Star Navigator';
        if (score >= 40) return 'Stellar Explorer';
        return 'Cosmic Seeker';
    }, [insights]);

    const topElement = useMemo(() => {
        if (!insights?.favorite_elements?.length) return null;
        return insights.favorite_elements[0];
    }, [insights]);

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-400 rounded-full"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="text-red-400 mb-4">
                            <Activity className="w-12 h-12" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Analytics Unavailable</h2>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={loadAnalyticsData}
                            className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-3">
                        <BarChart3 className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                            Cosmic Analytics
                        </h1>
                    </div>
                    <p className="text-gray-300 text-lg">
                        Discover your cosmic patterns and engagement insights
                    </p>

                    {/* Time period selector */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {[7, 14, 30].map((days) => (
                            <button
                                key={days}
                                onClick={() => setSelectedTimePeriod(days)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedTimePeriod === days
                                        ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/50'
                                    }`}
                            >
                                {days} days
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                >
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700/50">
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'insights', label: 'Insights', icon: Sparkles },
                            { id: 'recommendations', label: 'Recommendations', icon: Target },
                            { id: 'patterns', label: 'Cosmic Patterns', icon: Star }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as any)}
                                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id
                                        ? 'bg-purple-500/30 text-purple-300'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                {/* Engagement Score */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <Zap className="w-8 h-8 text-purple-400" />
                                        {engagementSummary && (
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${TREND_STYLES[engagementSummary.engagement_trend].bg}`}>
                                                {React.createElement(TREND_STYLES[engagementSummary.engagement_trend].icon, {
                                                    className: `w-3 h-3 ${TREND_STYLES[engagementSummary.engagement_trend].color}`
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {insights?.engagement_score?.toFixed(0) || '50'}
                                    </h3>
                                    <p className="text-purple-300 text-sm">{engagementLevel}</p>
                                </motion.div>

                                {/* Activity Count */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <Activity className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {engagementSummary?.total_activities || 0}
                                    </h3>
                                    <p className="text-blue-300 text-sm">Total Activities</p>
                                </motion.div>

                                {/* Daily Average */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/20"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <Calendar className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">
                                        {engagementSummary?.daily_average?.toFixed(1) || '0.0'}
                                    </h3>
                                    <p className="text-green-300 text-sm">Daily Average</p>
                                </motion.div>

                                {/* Favorite Element */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`bg-gradient-to-br ${topElement ? ELEMENT_COLORS[topElement as keyof typeof ELEMENT_COLORS]?.bg : 'from-gray-500/10 to-gray-600/10'} backdrop-blur-sm rounded-xl p-6 border ${topElement ? ELEMENT_COLORS[topElement as keyof typeof ELEMENT_COLORS]?.text.replace('text-', 'border-') + '/20' : 'border-gray-500/20'}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl">
                                            {topElement ? ELEMENT_COLORS[topElement as keyof typeof ELEMENT_COLORS]?.icon : '🌟'}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1 capitalize">
                                        {topElement || 'Exploring'}
                                    </h3>
                                    <p className={`text-sm ${topElement ? ELEMENT_COLORS[topElement as keyof typeof ELEMENT_COLORS]?.text : 'text-gray-300'}`}>
                                        Primary Element
                                    </p>
                                </motion.div>
                            </div>

                            {/* Recent Activity Chart */}
                            {engagementSummary?.top_activities && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                                >
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-purple-400" />
                                        Top Activities
                                    </h3>
                                    <div className="space-y-4">
                                        {engagementSummary.top_activities.slice(0, 5).map((activity, index) => (
                                            <div key={activity.type} className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-white font-medium capitalize">
                                                            {activity.type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-gray-400 text-sm">{activity.count}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(activity.count / Math.max(...engagementSummary.top_activities.map(a => a.count))) * 100}%` }}
                                                            transition={{ duration: 1, delay: index * 0.1 }}
                                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Insights Tab */}
                    {activeTab === 'insights' && insights && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Cosmic Affinity */}
                            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    Cosmic Affinity
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(insights.cosmic_affinity).map(([element, affinity]) => (
                                        <div key={element} className={`bg-gradient-to-br ${ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]?.bg} rounded-lg p-4 text-center`}>
                                            <div className="text-2xl mb-2">
                                                {ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]?.icon}
                                            </div>
                                            <div className="text-lg font-bold text-white capitalize">{element}</div>
                                            <div className={`text-sm ${ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS]?.text}`}>
                                                {(affinity * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Active Hours */}
                            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    Active Hours
                                </h3>
                                <div className="grid grid-cols-12 gap-1">
                                    {Array.from({ length: 24 }, (_, hour) => (
                                        <div
                                            key={hour}
                                            className={`h-8 rounded text-xs flex items-center justify-center font-medium ${insights.active_hours.includes(hour)
                                                    ? 'bg-blue-500/30 text-blue-300'
                                                    : 'bg-gray-700/30 text-gray-500'
                                                }`}
                                        >
                                            {hour}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Predicted Interests */}
                            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-green-400" />
                                    Predicted Interests
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {insights.predicted_interests.map((interest) => (
                                        <span
                                            key={interest}
                                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30"
                                        >
                                            {interest.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <motion.div
                            key="recommendations"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid gap-6">
                                {recommendations.length > 0 ? recommendations.map((rec, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-white mb-2">{rec.title}</h4>
                                                <p className="text-gray-300">{rec.description}</p>
                                            </div>
                                            <div className="ml-4 flex items-center gap-2">
                                                <div className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                    {(rec.confidence * 100).toFixed(0)}%
                                                </div>
                                                <Award className="w-5 h-5 text-yellow-400" />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {rec.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="text-center py-12">
                                        <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-gray-400 mb-2">No Recommendations Yet</h3>
                                        <p className="text-gray-500">Start engaging with the platform to get personalized recommendations!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Cosmic Patterns Tab */}
                    {activeTab === 'patterns' && (
                        <motion.div
                            key="patterns"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {cosmicTrends.map((trend, index) => (
                                <motion.div
                                    key={trend.pattern_type}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-white capitalize">
                                            {trend.pattern_type.replace('_', ' ')}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Users className="w-4 h-4" />
                                            {trend.affected_users} users
                                            <div className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                                                {(trend.confidence_score * 100).toFixed(0)}% confidence
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(trend.trend_data)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 8)
                                            .map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-4">
                                                    <div className="w-24 text-sm text-gray-300 capitalize">
                                                        {key.replace('_', ' ').replace('hour ', '')}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(value, 100)}%` }}
                                                                transition={{ duration: 1, delay: 0.1 }}
                                                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-12 text-right text-sm text-gray-400">
                                                        {value.toFixed(1)}%
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    {trend.correlation_factors.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-700/50">
                                            <div className="text-sm text-gray-400 mb-2">Correlation Factors:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {trend.correlation_factors.map((factor) => (
                                                    <span
                                                        key={factor}
                                                        className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs"
                                                    >
                                                        {factor.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default AnalyticsDashboard;