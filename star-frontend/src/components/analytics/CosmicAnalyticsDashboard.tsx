import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowDown,
    ArrowUp,
    BarChart3,
    ChevronRight,
    Crown,
    Download,
    Eye,
    Flame,
    Heart,
    MessageCircle,
    Moon,
    Refresh,
    Share2,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface AnalyticsMetric {
    id: string;
    name: string;
    value: number;
    previousValue: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    icon: React.ComponentType<any>;
    color: string;
    description: string;
}

interface CosmicInfluenceData {
    userId: string;
    username: string;
    zodiacSign: string;
    influenceScore: number;
    engagementRate: number;
    viralContentCount: number;
    followersCount: number;
    collaborationsCount: number;
    cosmicReach: number;
    trending: boolean;
}

interface ContentPerformance {
    id: string;
    type: 'tarot-reading' | 'story-segment' | 'art-piece' | 'meditation-session';
    title: string;
    author: string;
    createdAt: number;
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
    viralityScore: number;
    reachScore: number;
}

interface SharingAnalytics {
    platform: string;
    shares: number;
    clicks: number;
    conversionRate: number;
    topContent: string[];
    peakTimes: Array<{
        hour: number;
        shares: number;
    }>;
}

interface CosmicAnalyticsDashboardProps {
    userId?: string;
    timeRange?: '24h' | '7d' | '30d' | '90d' | '1y';
    onTimeRangeChange?: (range: string) => void;
}

export const CosmicAnalyticsDashboard: React.FC<CosmicAnalyticsDashboardProps> = ({
    userId,
    timeRange = '7d',
    onTimeRangeChange
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'sharing' | 'influence' | 'insights'>('overview');
    const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
    const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
    const [sharingAnalytics, setSharingAnalytics] = useState<SharingAnalytics[]>([]);
    const [cosmicInfluencers, setCosmicInfluencers] = useState<CosmicInfluenceData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showInsights, setShowInsights] = useState(false);

    // Mock analytics data
    const mockMetrics: AnalyticsMetric[] = [
        {
            id: 'total-engagement',
            name: 'Total Engagement',
            value: 12847,
            previousValue: 10235,
            change: 25.5,
            changeType: 'increase',
            icon: Heart,
            color: '#ef4444',
            description: 'Likes, shares, comments across all content'
        },
        {
            id: 'content-views',
            name: 'Content Views',
            value: 45623,
            previousValue: 42108,
            change: 8.3,
            changeType: 'increase',
            icon: Eye,
            color: '#06b6d4',
            description: 'Total views on tarot readings, stories, and art'
        },
        {
            id: 'sharing-rate',
            name: 'Sharing Rate',
            value: 234,
            previousValue: 189,
            change: 23.8,
            changeType: 'increase',
            icon: Share2,
            color: '#8b5cf6',
            description: 'Content shares across social platforms'
        },
        {
            id: 'cosmic-influence',
            name: 'Cosmic Influence',
            value: 847,
            previousValue: 782,
            change: 8.3,
            changeType: 'increase',
            icon: Sparkles,
            color: '#f59e0b',
            description: 'Your influence score in the cosmic community'
        },
        {
            id: 'collaborations',
            name: 'Collaborations',
            value: 23,
            previousValue: 19,
            change: 21.1,
            changeType: 'increase',
            icon: Users,
            color: '#10b981',
            description: 'Collaborative sessions and projects'
        },
        {
            id: 'viral-content',
            name: 'Viral Content',
            value: 7,
            previousValue: 4,
            change: 75.0,
            changeType: 'increase',
            icon: Flame,
            color: '#f97316',
            description: 'Content that reached viral threshold'
        }
    ];

    const mockContentPerformance: ContentPerformance[] = [
        {
            id: '1',
            type: 'tarot-reading',
            title: 'Full Moon Transformation Spread',
            author: 'StarSeeker_Luna',
            createdAt: Date.now() - 86400000,
            views: 2847,
            likes: 456,
            shares: 89,
            comments: 67,
            engagementRate: 21.5,
            viralityScore: 8.7,
            reachScore: 94.2
        },
        {
            id: '2',
            type: 'story-segment',
            title: 'The Constellation Keeper\'s Quest - Chapter 3',
            author: 'CosmicScribe',
            createdAt: Date.now() - 172800000,
            views: 1923,
            likes: 312,
            shares: 45,
            comments: 89,
            engagementRate: 23.2,
            viralityScore: 6.4,
            reachScore: 78.1
        },
        {
            id: '3',
            type: 'art-piece',
            title: 'Nebula Dreams Collaborative Canvas',
            author: 'CosmicArtist_Nova',
            createdAt: Date.now() - 259200000,
            views: 3421,
            likes: 678,
            shares: 134,
            comments: 112,
            engagementRate: 27.0,
            viralityScore: 9.2,
            reachScore: 96.8
        }
    ];

    const mockSharingAnalytics: SharingAnalytics[] = [
        {
            platform: 'Twitter',
            shares: 456,
            clicks: 2847,
            conversionRate: 16.0,
            topContent: ['Full Moon Transformation Spread', 'Cosmic Art Canvas'],
            peakTimes: [
                { hour: 9, shares: 67 },
                { hour: 12, shares: 89 },
                { hour: 18, shares: 134 },
                { hour: 21, shares: 98 }
            ]
        },
        {
            platform: 'Instagram',
            shares: 789,
            clicks: 4523,
            conversionRate: 17.4,
            topContent: ['Nebula Dreams Canvas', 'Zodiac Meditation'],
            peakTimes: [
                { hour: 8, shares: 123 },
                { hour: 13, shares: 156 },
                { hour: 19, shares: 234 },
                { hour: 22, shares: 189 }
            ]
        },
        {
            platform: 'TikTok',
            shares: 1234,
            clicks: 8967,
            conversionRate: 13.8,
            topContent: ['Quick Tarot Reading', 'Cosmic Dance'],
            peakTimes: [
                { hour: 11, shares: 234 },
                { hour: 16, shares: 345 },
                { hour: 20, shares: 456 },
                { hour: 23, shares: 287 }
            ]
        }
    ];

    const mockCosmicInfluencers: CosmicInfluenceData[] = [
        {
            userId: '1',
            username: 'StarWeaver_Luna',
            zodiacSign: 'Pisces',
            influenceScore: 2847,
            engagementRate: 24.7,
            viralContentCount: 12,
            followersCount: 15420,
            collaborationsCount: 89,
            cosmicReach: 94.2,
            trending: true
        },
        {
            userId: '2',
            username: 'CosmicArtist_Nova',
            zodiacSign: 'Aquarius',
            influenceScore: 2156,
            engagementRate: 27.3,
            viralContentCount: 8,
            followersCount: 12834,
            collaborationsCount: 67,
            cosmicReach: 89.7,
            trending: true
        },
        {
            userId: '3',
            username: 'ZodiacMaster_Sol',
            zodiacSign: 'Leo',
            influenceScore: 1934,
            engagementRate: 22.1,
            viralContentCount: 15,
            followersCount: 18765,
            collaborationsCount: 134,
            cosmicReach: 91.5,
            trending: false
        }
    ];

    useEffect(() => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setMetrics(mockMetrics);
            setContentPerformance(mockContentPerformance);
            setSharingAnalytics(mockSharingAnalytics);
            setCosmicInfluencers(mockCosmicInfluencers);
            setIsLoading(false);
        }, 1000);
    }, [timeRange, userId]);

    const refreshData = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            // Simulate updated data
            setIsLoading(false);
        }, 800);
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <BarChart3 className="w-8 h-8 mr-3 text-cyan-400" />
                        Cosmic Analytics
                    </h1>
                    <p className="text-white/60">
                        Track your cosmic influence and content performance across the universe
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => onTimeRangeChange?.(e.target.value)}
                        className="px-4 py-2 bg-black/60 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                        title="Select time range"
                    >
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>

                    {/* Refresh Button */}
                    <button
                        onClick={refreshData}
                        disabled={isLoading}
                        className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                        title="Refresh data"
                    >
                        <Refresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Export Button */}
                    <button
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-colors"
                        title="Export data"
                    >
                        <Download className="w-4 h-4 mr-2 inline" />
                        Export
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6">
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'content', label: 'Content', icon: Star },
                    { id: 'sharing', label: 'Sharing', icon: Share2 },
                    { id: 'influence', label: 'Influence', icon: Crown },
                    { id: 'insights', label: 'Insights', icon: Target }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Based on Active Tab */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <OverviewDashboard
                        metrics={metrics}
                        contentPerformance={contentPerformance.slice(0, 3)}
                        isLoading={isLoading}
                    />
                )}

                {activeTab === 'content' && (
                    <ContentAnalytics
                        contentPerformance={contentPerformance}
                        isLoading={isLoading}
                    />
                )}

                {activeTab === 'sharing' && (
                    <SharingAnalyticsDashboard
                        sharingAnalytics={sharingAnalytics}
                        isLoading={isLoading}
                    />
                )}

                {activeTab === 'influence' && (
                    <InfluenceDashboard
                        influencers={cosmicInfluencers}
                        currentUserInfluence={cosmicInfluencers[0]} // Assuming first is current user
                        isLoading={isLoading}
                    />
                )}

                {activeTab === 'insights' && (
                    <InsightsDashboard
                        metrics={metrics}
                        contentPerformance={contentPerformance}
                        isLoading={isLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Overview Dashboard Component
const OverviewDashboard: React.FC<{
    metrics: AnalyticsMetric[];
    contentPerformance: ContentPerformance[];
    isLoading: boolean;
}> = ({ metrics, contentPerformance, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
                        <div className="h-4 bg-white/20 rounded mb-4" />
                        <div className="h-8 bg-white/20 rounded mb-2" />
                        <div className="h-3 bg-white/20 rounded w-2/3" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                    <MetricCard key={metric.id} metric={metric} />
                ))}
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Trend */}
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
                        Engagement Trend
                    </h3>
                    <EngagementChart />
                </div>

                {/* Top Content */}
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-400" />
                        Top Performing Content
                    </h3>
                    <div className="space-y-3">
                        {contentPerformance.map((content, index) => (
                            <TopContentItem key={content.id} content={content} rank={index + 1} />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Metric Card Component
const MetricCard: React.FC<{
    metric: AnalyticsMetric;
}> = ({ metric }) => {
    const IconComponent = metric.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/30 transition-all"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: metric.color + '20' }}
                >
                    <IconComponent
                        className="w-6 h-6"
                        style={{ color: metric.color }}
                    />
                </div>

                <div className={`flex items-center space-x-1 text-sm font-medium ${metric.changeType === 'increase' ? 'text-green-400' :
                        metric.changeType === 'decrease' ? 'text-red-400' :
                            'text-white/60'
                    }`}>
                    {metric.changeType === 'increase' && <ArrowUp className="w-4 h-4" />}
                    {metric.changeType === 'decrease' && <ArrowDown className="w-4 h-4" />}
                    <span>{metric.change.toFixed(1)}%</span>
                </div>
            </div>

            {/* Metric */}
            <div className="mb-2">
                <h3 className="text-2xl font-bold text-white">
                    {metric.value.toLocaleString()}
                </h3>
                <p className="text-white/60 font-medium">{metric.name}</p>
            </div>

            {/* Description */}
            <p className="text-white/40 text-sm">{metric.description}</p>
        </motion.div>
    );
};

// Engagement Chart Component (Mock)
const EngagementChart: React.FC = () => {
    const data = [
        { day: 'Mon', engagement: 65 },
        { day: 'Tue', engagement: 72 },
        { day: 'Wed', engagement: 88 },
        { day: 'Thu', engagement: 94 },
        { day: 'Fri', engagement: 107 },
        { day: 'Sat', engagement: 89 },
        { day: 'Sun', engagement: 76 }
    ];

    return (
        <div className="h-48 flex items-end justify-between space-x-2">
            {data.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center">
                    <div
                        className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                        style={{ height: `${(item.engagement / 120) * 100}%` }}
                    />
                    <span className="text-white/60 text-xs mt-2">{item.day}</span>
                </div>
            ))}
        </div>
    );
};

// Top Content Item Component
const TopContentItem: React.FC<{
    content: ContentPerformance;
    rank: number;
}> = ({ content, rank }) => {
    const getTypeIcon = (type: string) => {
        const icons = {
            'tarot-reading': Star,
            'story-segment': MessageCircle,
            'art-piece': Sparkles,
            'meditation-session': Moon
        };
        return icons[type as keyof typeof icons] || Star;
    };

    const TypeIcon = getTypeIcon(content.type);

    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rank === 1 ? 'bg-yellow-500 text-black' :
                        rank === 2 ? 'bg-gray-400 text-black' :
                            rank === 3 ? 'bg-amber-600 text-white' : 'bg-white/20 text-white'
                    }`}>
                    {rank}
                </div>

                <TypeIcon className="w-4 h-4 text-cyan-400" />

                <div>
                    <div className="text-white font-medium text-sm line-clamp-1">{content.title}</div>
                    <div className="text-white/60 text-xs">by {content.author}</div>
                </div>
            </div>

            <div className="text-right">
                <div className="text-white font-medium">{content.views.toLocaleString()}</div>
                <div className="text-white/60 text-xs">views</div>
            </div>
        </div>
    );
};

// Content Analytics Component
const ContentAnalytics: React.FC<{
    contentPerformance: ContentPerformance[];
    isLoading: boolean;
}> = ({ contentPerformance, isLoading }) => {
    const [sortBy, setSortBy] = useState<'views' | 'engagement' | 'virality'>('views');
    const [filterType, setFilterType] = useState<'all' | 'tarot-reading' | 'story-segment' | 'art-piece' | 'meditation-session'>('all');

    const filteredContent = contentPerformance
        .filter(content => filterType === 'all' || content.type === filterType)
        .sort((a, b) => {
            switch (sortBy) {
                case 'views':
                    return b.views - a.views;
                case 'engagement':
                    return b.engagementRate - a.engagementRate;
                case 'virality':
                    return b.viralityScore - a.viralityScore;
                default:
                    return 0;
            }
        });

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
                        <div className="h-6 bg-white/20 rounded mb-4" />
                        <div className="grid grid-cols-4 gap-4">
                            <div className="h-4 bg-white/20 rounded" />
                            <div className="h-4 bg-white/20 rounded" />
                            <div className="h-4 bg-white/20 rounded" />
                            <div className="h-4 bg-white/20 rounded" />
                        </div>
                    </div>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Filters */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="px-4 py-2 bg-black/60 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                        title="Filter by content type"
                    >
                        <option value="all">All Content</option>
                        <option value="tarot-reading">Tarot Readings</option>
                        <option value="story-segment">Story Segments</option>
                        <option value="art-piece">Art Pieces</option>
                        <option value="meditation-session">Meditation Sessions</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-4 py-2 bg-black/60 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                        title="Sort by metric"
                    >
                        <option value="views">Sort by Views</option>
                        <option value="engagement">Sort by Engagement</option>
                        <option value="virality">Sort by Virality</option>
                    </select>
                </div>

                <div className="text-white/60 text-sm">
                    {filteredContent.length} content pieces
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {filteredContent.map((content) => (
                    <ContentPerformanceCard key={content.id} content={content} />
                ))}
            </div>
        </motion.div>
    );
};

// Content Performance Card Component
const ContentPerformanceCard: React.FC<{
    content: ContentPerformance;
}> = ({ content }) => {
    const getTypeIcon = (type: string) => {
        const icons = {
            'tarot-reading': Star,
            'story-segment': MessageCircle,
            'art-piece': Sparkles,
            'meditation-session': Moon
        };
        return icons[type as keyof typeof icons] || Star;
    };

    const TypeIcon = getTypeIcon(content.type);

    return (
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/30 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <TypeIcon className="w-6 h-6 text-cyan-400" />
                    <div>
                        <h3 className="text-white font-medium">{content.title}</h3>
                        <p className="text-white/60 text-sm">
                            by {content.author} • {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs ${content.viralityScore >= 8 ? 'bg-orange-500/20 text-orange-400' :
                        content.viralityScore >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                    }`}>
                    {content.viralityScore >= 8 ? 'Viral' :
                        content.viralityScore >= 6 ? 'Trending' : 'Growing'}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                    <div className="text-white font-medium">{content.views.toLocaleString()}</div>
                    <div className="text-white/60 text-xs">Views</div>
                </div>
                <div className="text-center">
                    <div className="text-white font-medium">{content.likes.toLocaleString()}</div>
                    <div className="text-white/60 text-xs">Likes</div>
                </div>
                <div className="text-center">
                    <div className="text-white font-medium">{content.shares}</div>
                    <div className="text-white/60 text-xs">Shares</div>
                </div>
                <div className="text-center">
                    <div className="text-white font-medium">{content.engagementRate.toFixed(1)}%</div>
                    <div className="text-white/60 text-xs">Engagement</div>
                </div>
                <div className="text-center">
                    <div className="text-white font-medium">{content.viralityScore.toFixed(1)}</div>
                    <div className="text-white/60 text-xs">Virality</div>
                </div>
            </div>
        </div>
    );
};

// Sharing Analytics Dashboard Component
const SharingAnalyticsDashboard: React.FC<{
    sharingAnalytics: SharingAnalytics[];
    isLoading: boolean;
}> = ({ sharingAnalytics, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
                        <div className="h-6 bg-white/20 rounded mb-4" />
                        <div className="space-y-3">
                            <div className="h-4 bg-white/20 rounded" />
                            <div className="h-4 bg-white/20 rounded w-3/4" />
                            <div className="h-4 bg-white/20 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Platform Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sharingAnalytics.map((platform) => (
                    <PlatformCard key={platform.platform} platform={platform} />
                ))}
            </div>

            {/* Sharing Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4">Peak Sharing Times</h3>
                    <SharingTimesChart data={sharingAnalytics[0]?.peakTimes || []} />
                </div>

                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4">Top Shared Content</h3>
                    <div className="space-y-3">
                        {sharingAnalytics[0]?.topContent.map((content, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-white">{content}</span>
                                <ChevronRight className="w-4 h-4 text-white/40" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Platform Card Component
const PlatformCard: React.FC<{
    platform: SharingAnalytics;
}> = ({ platform }) => {
    const getPlatformColor = (platformName: string) => {
        const colors = {
            Twitter: '#1da1f2',
            Instagram: '#e4405f',
            TikTok: '#000000',
            Facebook: '#1877f2'
        };
        return colors[platformName as keyof typeof colors] || '#8b5cf6';
    };

    return (
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">{platform.platform}</h3>
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getPlatformColor(platform.platform) }}
                />
            </div>

            <div className="space-y-4">
                <div>
                    <div className="text-2xl font-bold text-white">{platform.shares.toLocaleString()}</div>
                    <div className="text-white/60 text-sm">Total Shares</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-white font-medium">{platform.clicks.toLocaleString()}</div>
                        <div className="text-white/60 text-xs">Clicks</div>
                    </div>
                    <div>
                        <div className="text-white font-medium">{platform.conversionRate.toFixed(1)}%</div>
                        <div className="text-white/60 text-xs">Conversion</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sharing Times Chart Component (Mock)
const SharingTimesChart: React.FC<{
    data: Array<{ hour: number; shares: number }>;
}> = ({ data }) => {
    const maxShares = Math.max(...data.map(d => d.shares));

    return (
        <div className="h-32 flex items-end justify-between space-x-1">
            {data.map((item) => (
                <div key={item.hour} className="flex-1 flex flex-col items-center">
                    <div
                        className="w-full bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t"
                        style={{ height: `${(item.shares / maxShares) * 100}%` }}
                    />
                    <span className="text-white/60 text-xs mt-1">{item.hour}h</span>
                </div>
            ))}
        </div>
    );
};

// Influence Dashboard Component
const InfluenceDashboard: React.FC<{
    influencers: CosmicInfluenceData[];
    currentUserInfluence?: CosmicInfluenceData;
    isLoading: boolean;
}> = ({ influencers, currentUserInfluence, isLoading }) => {
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
                            <div className="h-4 bg-white/20 rounded mb-4" />
                            <div className="h-8 bg-white/20 rounded mb-4" />
                            <div className="space-y-2">
                                <div className="h-3 bg-white/20 rounded" />
                                <div className="h-3 bg-white/20 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Current User Influence */}
            {currentUserInfluence && (
                <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                        <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                        Your Cosmic Influence
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <div className="text-2xl font-bold text-white">{currentUserInfluence.influenceScore.toLocaleString()}</div>
                            <div className="text-white/60">Influence Score</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{currentUserInfluence.engagementRate.toFixed(1)}%</div>
                            <div className="text-white/60">Engagement Rate</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{currentUserInfluence.cosmicReach.toFixed(1)}%</div>
                            <div className="text-white/60">Cosmic Reach</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{currentUserInfluence.viralContentCount}</div>
                            <div className="text-white/60">Viral Content</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Influencers */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-6 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    Top Cosmic Influencers
                </h3>

                <div className="space-y-4">
                    {influencers.map((influencer, index) => (
                        <InfluencerCard key={influencer.userId} influencer={influencer} rank={index + 1} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// Influencer Card Component
const InfluencerCard: React.FC<{
    influencer: CosmicInfluenceData;
    rank: number;
}> = ({ influencer, rank }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? 'bg-yellow-500 text-black' :
                        rank === 2 ? 'bg-gray-400 text-black' :
                            rank === 3 ? 'bg-amber-600 text-white' : 'bg-white/20 text-white'
                    }`}>
                    {rank}
                </div>

                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {influencer.username[0]}
                </div>

                <div>
                    <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{influencer.username}</span>
                        {influencer.trending && (
                            <div className="flex items-center space-x-1 text-orange-400 text-xs">
                                <Flame className="w-3 h-3" />
                                <span>Trending</span>
                            </div>
                        )}
                    </div>
                    <div className="text-white/60 text-sm">{influencer.zodiacSign}</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-right">
                <div>
                    <div className="text-white font-medium">{influencer.influenceScore.toLocaleString()}</div>
                    <div className="text-white/60 text-xs">Influence</div>
                </div>
                <div>
                    <div className="text-white font-medium">{influencer.engagementRate.toFixed(1)}%</div>
                    <div className="text-white/60 text-xs">Engagement</div>
                </div>
                <div>
                    <div className="text-white font-medium">{influencer.followersCount.toLocaleString()}</div>
                    <div className="text-white/60 text-xs">Followers</div>
                </div>
            </div>
        </div>
    );
};

// Insights Dashboard Component
const InsightsDashboard: React.FC<{
    metrics: AnalyticsMetric[];
    contentPerformance: ContentPerformance[];
    isLoading: boolean;
}> = ({ metrics, contentPerformance, isLoading }) => {
    const insights = [
        {
            title: 'Peak Engagement Time',
            description: 'Your content performs best between 7-9 PM when cosmic energy is highest.',
            type: 'timing',
            importance: 'high',
            actionable: 'Schedule your most important content during these hours for maximum impact.'
        },
        {
            title: 'Zodiac Compatibility',
            description: 'Water signs engage 35% more with your content than other elements.',
            type: 'audience',
            importance: 'medium',
            actionable: 'Create more content that resonates with Cancer, Scorpio, and Pisces themes.'
        },
        {
            title: 'Collaborative Boost',
            description: 'Your collaborative content gets 3x more shares than solo work.',
            type: 'collaboration',
            importance: 'high',
            actionable: 'Seek more partnerships with complementary zodiac signs for viral potential.'
        }
    ];

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
            >
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
                        <div className="h-6 bg-white/20 rounded mb-4" />
                        <div className="h-4 bg-white/20 rounded mb-2" />
                        <div className="h-4 bg-white/20 rounded w-2/3" />
                    </div>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* AI-Generated Insights */}
            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} />
                ))}
            </div>

            {/* Recommendations */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-400" />
                    Personalized Recommendations
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-white/80 font-medium mb-3">Content Strategy</h4>
                        <ul className="space-y-2 text-white/60 text-sm">
                            <li>• Post tarot content during full moon phases for 40% higher engagement</li>
                            <li>• Collaborate with Air signs to balance your Water energy content</li>
                            <li>• Share behind-the-scenes content to increase personal connection</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white/80 font-medium mb-3">Growth Opportunities</h4>
                        <ul className="space-y-2 text-white/60 text-sm">
                            <li>• Cross-promote on Instagram Stories for 25% reach boost</li>
                            <li>• Host live meditation sessions during Mercury retrograde</li>
                            <li>• Create series content to keep audience returning</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Insight Card Component
const InsightCard: React.FC<{
    insight: {
        title: string;
        description: string;
        type: string;
        importance: string;
        actionable: string;
    };
}> = ({ insight }) => {
    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'high': return 'border-red-500/30 bg-red-500/10';
            case 'medium': return 'border-yellow-500/30 bg-yellow-500/10';
            case 'low': return 'border-green-500/30 bg-green-500/10';
            default: return 'border-white/20 bg-white/5';
        }
    };

    return (
        <div className={`bg-black/60 backdrop-blur-lg rounded-2xl p-6 border ${getImportanceColor(insight.importance)}`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-white font-semibold">{insight.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{insight.description}</p>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-medium ${insight.importance === 'high' ? 'bg-red-500/20 text-red-400' :
                        insight.importance === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                    }`}>
                    {insight.importance} priority
                </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border-l-4 border-cyan-500">
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Action Item</div>
                <div className="text-white/90 text-sm">{insight.actionable}</div>
            </div>
        </div>
    );
};

export default CosmicAnalyticsDashboard;