/**
 * Enhanced Cosmic Analytics Dashboard for STAR Platform
 * Advanced insights with predictive analytics and cosmic correlations
 */

import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    RadialLinearScale,
    Title,
    Tooltip
} from 'chart.js';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    ArrowDown,
    ArrowUp,
    BarChart3,
    Clock,
    Moon,
    RefreshCw,
    Sparkles,
    Star,
    Target,
    TrendingUp, Users, Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useAuth } from '../../lib/AuthContext';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend
);

interface PredictiveInsight {
    type: string;
    title: string;
    description: string;
    confidence: number;
    impact_score: number;
    suggested_action: string;
    cosmic_correlation?: string;
    trend_direction: 'up' | 'down' | 'stable';
    timeframe: string;
}

interface CosmicAnalytics {
    zodiac_engagement: Record<string, number>;
    elemental_preferences: Record<string, number>;
    lunar_activity_correlation: number;
    tarot_draw_patterns: Record<string, number>;
    cosmic_sync_events: number;
    energy_flow_trends: number[];
}

interface UserInsights {
    engagement_score: number;
    active_hours: number[];
    favorite_elements: string[];
    cosmic_affinity: Record<string, number>;
    predicted_interests: string[];
    recommendation_tags: string[];
    personalization_score: number;
    last_updated: string;
}

interface AnalyticsMetrics {
    total_users: number;
    daily_active_users: number;
    weekly_retention: number;
    average_session_duration: number;
    cosmic_interactions: number;
    spotify_integrations: number;
    tarot_readings: number;
    real_time_sessions: number;
}

interface EnhancedCosmicAnalyticsDashboardProps {
    className?: string;
    timeRange?: '24h' | '7d' | '30d' | '90d';
    userId?: string;
}

export const EnhancedCosmicAnalyticsDashboard: React.FC<EnhancedCosmicAnalyticsDashboardProps> = ({
    className = '',
    timeRange = '7d',
    userId
}) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
    const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
    const [cosmicAnalytics, setCosmicAnalytics] = useState<CosmicAnalytics | null>(null);
    const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'cosmic' | 'predictions'>('overview');
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Auto-refresh effect
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchAnalyticsData();
            }, 30000); // Refresh every 30 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, selectedTimeRange]);

    // Initial data fetch
    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedTimeRange, userId]);

    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch dashboard overview data
            const dashboardResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/dashboard?timeframe=${selectedTimeRange}${userId ? `&user_id=${userId}` : ''}`,
                { headers }
            );

            if (dashboardResponse.ok) {
                const dashboardResult = await dashboardResponse.json();
                setDashboardData(dashboardResult);
                setMetrics(dashboardResult.metrics);
                setCosmicAnalytics(dashboardResult.cosmic_analytics);
            }

            // Fetch user insights if user is available
            if (user?.id) {
                const insightsResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/user-insights?user_id=${user.id}&timeframe=${selectedTimeRange}`,
                    { headers }
                );

                if (insightsResponse.ok) {
                    const insightsResult = await insightsResponse.json();
                    setUserInsights(insightsResult);
                }
            }

            // Fetch predictive insights
            const predictiveResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analytics/predictions?timeframe=${selectedTimeRange}${user?.id ? `&user_id=${user.id}` : ''}`,
                { headers }
            );

            if (predictiveResponse.ok) {
                const predictiveResult = await predictiveResponse.json();
                setPredictiveInsights(predictiveResult.predictions || []);
            }

        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            setError('Failed to load analytics data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Chart configurations
    const engagementChartData = useMemo(() => {
        if (!dashboardData?.engagement_trends) return null;

        const labels = dashboardData.engagement_trends.map((item: any) =>
            new Date(item.timestamp).toLocaleDateString()
        );
        const data = dashboardData.engagement_trends.map((item: any) => item.engagement_score);

        return {
            labels,
            datasets: [{
                label: 'Engagement Score',
                data,
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    }, [dashboardData]);

    const cosmicAffinityData = useMemo(() => {
        if (!userInsights?.cosmic_affinity) return null;

        return {
            labels: Object.keys(userInsights.cosmic_affinity),
            datasets: [{
                label: 'Cosmic Affinity',
                data: Object.values(userInsights.cosmic_affinity),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',   // Fire
                    'rgba(59, 130, 246, 0.8)',  // Water
                    'rgba(251, 191, 36, 0.8)',  // Air
                    'rgba(34, 197, 94, 0.8)',   // Earth
                    'rgba(147, 51, 234, 0.8)'   // Spirit
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(147, 51, 234, 1)'
                ],
                borderWidth: 2
            }]
        };
    }, [userInsights]);

    const zodiacEngagementData = useMemo(() => {
        if (!cosmicAnalytics?.zodiac_engagement) return null;

        return {
            labels: Object.keys(cosmicAnalytics.zodiac_engagement),
            datasets: [{
                label: 'Zodiac Engagement',
                data: Object.values(cosmicAnalytics.zodiac_engagement),
                backgroundColor: 'rgba(147, 51, 234, 0.6)',
                borderColor: 'rgba(147, 51, 234, 1)',
                borderWidth: 1
            }]
        };
    }, [cosmicAnalytics]);

    const activityHeatmapData = useMemo(() => {
        if (!userInsights?.active_hours) return null;

        const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        return {
            labels: hourLabels,
            datasets: [{
                label: 'Activity Level',
                data: userInsights.active_hours,
                backgroundColor: userInsights.active_hours.map(value =>
                    `rgba(147, 51, 234, ${value / 100})`
                ),
                borderColor: 'rgba(147, 51, 234, 1)',
                borderWidth: 1
            }]
        };
    }, [userInsights]);

    const getConfidenceColor = (confidence: number) => {
        if (confidence > 0.8) return 'text-green-400';
        if (confidence > 0.6) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
            case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
            default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
        }
    };

    const formatMetricValue = (value: number, type: 'percentage' | 'duration' | 'number' = 'number') => {
        switch (type) {
            case 'percentage':
                return `${(value * 100).toFixed(1)}%`;
            case 'duration':
                return `${Math.floor(value / 60)}m ${Math.floor(value % 60)}s`;
            default:
                return value.toLocaleString();
        }
    };

    if (isLoading && !dashboardData) {
        return (
            <div className={`cosmic-analytics-loading ${className}`}>
                <div className="flex items-center justify-center min-h-[400px]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                    />
                    <span className="ml-4 text-gray-300">Loading cosmic insights...</span>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className={`enhanced-cosmic-analytics-dashboard ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-purple-400" />
                        Cosmic Analytics
                    </h2>
                    <div className="flex items-center gap-4">
                        {/* Time Range Selector */}
                        <select
                            value={selectedTimeRange}
                            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                            title="Select time range for analytics"
                            aria-label="Select time range for analytics"
                            className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>

                        {/* Auto Refresh Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`p-2 rounded-lg border transition-colors ${autoRefresh
                                    ? 'bg-purple-500 border-purple-500 text-white'
                                    : 'bg-gray-800 border-gray-600 text-gray-300'
                                }`}
                        >
                            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                        </motion.button>

                        {/* Manual Refresh */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchAnalyticsData}
                            disabled={isLoading}
                            className="px-4 py-2 bg-purple-500 rounded-lg text-white hover:bg-purple-400 disabled:opacity-50"
                        >
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </motion.button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'personal', label: 'Personal Insights', icon: Users },
                        { id: 'cosmic', label: 'Cosmic Analytics', icon: Sparkles },
                        { id: 'predictions', label: 'Predictions', icon: TrendingUp }
                    ].map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${activeTab === tab.id
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300"
                >
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-200 hover:text-white"
                    >
                        ×
                    </button>
                </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Key Metrics */}
                        {metrics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {[
                                    { label: 'Total Users', value: metrics.total_users, icon: Users, color: 'blue' },
                                    { label: 'Daily Active', value: metrics.daily_active_users, icon: Activity, color: 'green' },
                                    { label: 'Retention', value: formatMetricValue(metrics.weekly_retention, 'percentage'), icon: Target, color: 'purple' },
                                    { label: 'Avg Session', value: formatMetricValue(metrics.average_session_duration, 'duration'), icon: Clock, color: 'orange' }
                                ].map((metric, index) => (
                                    <motion.div
                                        key={metric.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <metric.icon className={`w-6 h-6 text-${metric.color}-400`} />
                                            <span className="text-2xl font-bold text-white">{metric.value}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{metric.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Engagement Trend Chart */}
                        {engagementChartData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
                            >
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                    Engagement Trends
                                </h3>
                                <div className="h-64">
                                    <Line
                                        data={engagementChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false }
                                            },
                                            scales: {
                                                x: {
                                                    grid: { color: 'rgba(255,255,255,0.1)' },
                                                    ticks: { color: 'rgba(255,255,255,0.7)' }
                                                },
                                                y: {
                                                    grid: { color: 'rgba(255,255,255,0.1)' },
                                                    ticks: { color: 'rgba(255,255,255,0.7)' }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'personal' && userInsights && (
                    <motion.div
                        key="personal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Personal Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Engagement Score</h3>
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="text-3xl font-bold text-yellow-400 mb-2">
                                    {Math.round(userInsights.engagement_score * 100)}
                                </div>
                                <p className="text-gray-400 text-sm">Personal engagement level</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Personalization</h3>
                                    <Star className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="text-3xl font-bold text-purple-400 mb-2">
                                    {Math.round(userInsights.personalization_score * 100)}%
                                </div>
                                <p className="text-gray-400 text-sm">Content personalization accuracy</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Favorite Elements</h3>
                                    <Sparkles className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    {userInsights.favorite_elements.slice(0, 3).map((element, index) => (
                                        <div key={element} className="text-blue-400 text-sm capitalize">
                                            {index + 1}. {element}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Cosmic Affinity Chart */}
                            {cosmicAffinityData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                                >
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        Cosmic Affinity
                                    </h3>
                                    <div className="h-64">
                                        <Doughnut
                                            data={cosmicAffinityData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom',
                                                        labels: { color: 'rgba(255,255,255,0.7)' }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Activity Heatmap */}
                            {activityHeatmapData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                                >
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-blue-400" />
                                        Activity Patterns
                                    </h3>
                                    <div className="h-64">
                                        <Bar
                                            data={activityHeatmapData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false }
                                                },
                                                scales: {
                                                    x: {
                                                        grid: { color: 'rgba(255,255,255,0.1)' },
                                                        ticks: { color: 'rgba(255,255,255,0.7)' }
                                                    },
                                                    y: {
                                                        grid: { color: 'rgba(255,255,255,0.1)' },
                                                        ticks: { color: 'rgba(255,255,255,0.7)' }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cosmic' && cosmicAnalytics && (
                    <motion.div
                        key="cosmic"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Cosmic Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Lunar Correlation</h3>
                                    <Moon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="text-3xl font-bold text-blue-400 mb-2">
                                    {Math.round(cosmicAnalytics.lunar_activity_correlation * 100)}%
                                </div>
                                <p className="text-gray-400 text-sm">Activity correlation with lunar phases</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Cosmic Sync Events</h3>
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="text-3xl font-bold text-yellow-400 mb-2">
                                    {cosmicAnalytics.cosmic_sync_events.toLocaleString()}
                                </div>
                                <p className="text-gray-400 text-sm">Real-time synchronization events</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Energy Flow</h3>
                                    <Activity className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-3xl font-bold text-green-400 mb-2">
                                    {Math.round(cosmicAnalytics.energy_flow_trends.reduce((a, b) => a + b, 0) / cosmicAnalytics.energy_flow_trends.length)}
                                </div>
                                <p className="text-gray-400 text-sm">Average energy flow intensity</p>
                            </motion.div>
                        </div>

                        {/* Zodiac Engagement Chart */}
                        {zodiacEngagementData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-purple-400" />
                                    Zodiac Sign Engagement
                                </h3>
                                <div className="h-64">
                                    <Bar
                                        data={zodiacEngagementData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false }
                                            },
                                            scales: {
                                                x: {
                                                    grid: { color: 'rgba(255,255,255,0.1)' },
                                                    ticks: {
                                                        color: 'rgba(255,255,255,0.7)',
                                                        maxRotation: 45
                                                    }
                                                },
                                                y: {
                                                    grid: { color: 'rgba(255,255,255,0.1)' },
                                                    ticks: { color: 'rgba(255,255,255,0.7)' }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'predictions' && (
                    <motion.div
                        key="predictions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {predictiveInsights.length > 0 ? (
                            <div className="space-y-6">
                                {predictiveInsights.map((insight, index) => (
                                    <motion.div
                                        key={`${insight.type}-${insight.title}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3">
                                                {getTrendIcon(insight.trend_direction)}
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                                                    <p className="text-gray-300 mt-1">{insight.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                                                    {Math.round(insight.confidence * 100)}% confidence
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {insight.timeframe}
                                                </div>
                                            </div>
                                        </div>

                                        {insight.cosmic_correlation && (
                                            <div className="mb-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                                <div className="flex items-center gap-2 text-purple-300 text-sm">
                                                    <Sparkles className="w-4 h-4" />
                                                    Cosmic Correlation: {insight.cosmic_correlation}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-400">
                                                Impact Score: {Math.round(insight.impact_score * 100)}/100
                                            </div>
                                            <div className="text-sm text-blue-400">
                                                {insight.suggested_action}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <TrendingUp className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                                <h3 className="text-xl text-gray-400 mb-2">No Predictions Available</h3>
                                <p className="text-gray-500">
                                    Predictive insights will appear here as data accumulates.
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default EnhancedCosmicAnalyticsDashboard;