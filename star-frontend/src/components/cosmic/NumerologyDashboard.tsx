import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, Gem, Star, Target, TrendingUp, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NumerologyService, type FeedRecommendations, type PersonalizedRecommendations } from '../../lib/numerologyService';

interface NumerologyDashboardProps {
    onRecommendationSelect?: (recommendation: any) => void;
    onCompatibleUserSelect?: (user: any) => void;
    onPostSuggestionSelect?: (suggestion: any) => void;
    className?: string;
}

const NumerologyDashboard: React.FC<NumerologyDashboardProps> = ({
    onRecommendationSelect,
    onCompatibleUserSelect,
    onPostSuggestionSelect,
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'recommendations' | 'compatibility'>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Numerology data state
    const [dailyInsight, setDailyInsight] = useState<any>(null);
    const [feedRecommendations, setFeedRecommendations] = useState<FeedRecommendations | null>(null);
    const [personalizedRecs, setPersonalizedRecs] = useState<PersonalizedRecommendations | null>(null);
    const [cosmicProfile, setCosmicProfile] = useState<any>(null);

    useEffect(() => {
        loadNumerologyData();
    }, []);

    const loadNumerologyData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load all numerology data in parallel
            const [feedRecs, comprehensiveProfile] = await Promise.all([
                NumerologyService.getFeedRecommendations(),
                NumerologyService.getComprehensiveProfile()
            ]);

            setFeedRecommendations(feedRecs);
            setDailyInsight(feedRecs.daily_insight);
            setCosmicProfile(comprehensiveProfile.cosmic_profile);
            setPersonalizedRecs(comprehensiveProfile.personalized_recommendations);

        } catch (err: any) {
            console.error('Error loading numerology data:', err);
            setError(err.message || 'Failed to load numerology data');
        } finally {
            setLoading(false);
        }
    };

    const handleRecommendationClick = (rec: any, type: string) => {
        if (onRecommendationSelect) {
            onRecommendationSelect({ ...rec, type });
        }
    };

    const handleCompatibleUserClick = (user: any) => {
        if (onCompatibleUserSelect) {
            onCompatibleUserSelect(user);
        }
    };

    const handlePostSuggestionClick = (suggestion: any) => {
        if (onPostSuggestionSelect) {
            onPostSuggestionSelect(suggestion);
        }
    };

    if (loading) {
        return (
            <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6 ${className}`}>
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                    <span className="ml-4 text-purple-300">Loading cosmic insights...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-gradient-to-br from-red-900/20 to-purple-900/20 backdrop-blur-sm rounded-xl border border-red-500/30 p-6 ${className}`}>
                <div className="text-center">
                    <div className="text-red-400 mb-2">⚠️ Cosmic Connection Error</div>
                    <div className="text-red-300 text-sm">{error}</div>
                    <button
                        onClick={loadNumerologyData}
                        className="mt-4 px-4 py-2 bg-red-600/50 hover:bg-red-600/70 rounded-lg text-white transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-xl border border-purple-500/30 ${className}`}>
            {/* Header with Navigation */}
            <div className="p-6 border-b border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        ✨ Cosmic Numerology
                    </h2>
                    {dailyInsight && (
                        <div className="text-right">
                            <div className="text-sm text-purple-300">Daily Number</div>
                            <div className="text-3xl font-bold text-purple-400">{dailyInsight.daily_number}</div>
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-black/20 rounded-lg p-1">
                    {[
                        { key: 'overview', label: 'Overview', icon: Star },
                        { key: 'insights', label: 'Insights', icon: Zap },
                        { key: 'recommendations', label: 'Guidance', icon: Target },
                        { key: 'compatibility', label: 'Connections', icon: Users }
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${activeTab === key
                                    ? 'bg-purple-600/50 text-purple-100'
                                    : 'text-purple-300 hover:text-purple-100 hover:bg-purple-600/20'
                                }`}
                        >
                            <Icon size={16} />
                            <span className="text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Daily Insight Card */}
                            {dailyInsight && (
                                <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-lg p-6 border border-purple-500/20">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {dailyInsight.daily_number}
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-purple-200 mb-2">Today's Cosmic Insight</h3>
                                            <p className="text-purple-100 mb-3">{dailyInsight.insight}</p>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span className="flex items-center space-x-1 text-purple-300">
                                                    <Target size={14} />
                                                    <span>{dailyInsight.recommended_action}</span>
                                                </span>
                                                <span className="flex items-center space-x-1 text-purple-300">
                                                    <Clock size={14} />
                                                    <span>{dailyInsight.cosmic_timing}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Current Cycles */}
                            {feedRecommendations?.current_cycles && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Year */}
                                    <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg p-6 border border-amber-500/20">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Calendar className="text-amber-400" size={24} />
                                            <div>
                                                <h3 className="text-lg font-semibold text-amber-200">Personal Year</h3>
                                                <div className="text-2xl font-bold text-amber-400">
                                                    {feedRecommendations.current_cycles.personal_year.number}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-amber-100 font-medium">
                                                {feedRecommendations.current_cycles.personal_year.theme_data.theme}
                                            </div>
                                            <div className="text-amber-200 text-sm">
                                                Focus: {feedRecommendations.current_cycles.personal_year.theme_data.focus}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Month */}
                                    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-6 border border-cyan-500/20">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Zap className="text-cyan-400" size={24} />
                                            <div>
                                                <h3 className="text-lg font-semibold text-cyan-200">Personal Month</h3>
                                                <div className="text-2xl font-bold text-cyan-400">
                                                    {feedRecommendations.current_cycles.personal_month.number}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-cyan-100 font-medium">
                                                {feedRecommendations.current_cycles.personal_month.monthly_focus.focus}
                                            </div>
                                            <div className="text-cyan-200 text-sm">
                                                Energy: {feedRecommendations.current_cycles.personal_month.monthly_focus.energy_level}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Crystal & Element Profile */}
                            {cosmicProfile && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Crystal Recommendation */}
                                    <div className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 rounded-lg p-6 border border-emerald-500/20">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Gem className="text-emerald-400" size={24} />
                                            <h3 className="text-lg font-semibold text-emerald-200">Daily Crystal</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-emerald-100 font-medium text-xl">
                                                {cosmicProfile.crystal_profile?.daily_carry_recommendation || 'Clear Quartz'}
                                            </div>
                                            <div className="text-emerald-200 text-sm">
                                                Carry this crystal for optimal energy alignment today
                                            </div>
                                        </div>
                                    </div>

                                    {/* Elemental Profile */}
                                    <div className="bg-gradient-to-br from-rose-900/30 to-pink-900/30 rounded-lg p-6 border border-rose-500/20">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <Star className="text-rose-400" size={24} />
                                            <h3 className="text-lg font-semibold text-rose-200">Element</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-rose-100 font-medium text-xl">
                                                {cosmicProfile.elemental_profile?.primary_element || 'Discovering...'}
                                            </div>
                                            <div className="text-rose-200 text-sm">
                                                Your primary cosmic element influence
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'insights' && feedRecommendations && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Cosmic Timing */}
                            <div className="bg-gradient-to-r from-indigo-800/30 to-purple-800/30 rounded-lg p-6 border border-indigo-500/20">
                                <h3 className="text-lg font-semibold text-indigo-200 mb-4 flex items-center space-x-2">
                                    <Clock size={20} />
                                    <span>Cosmic Timing</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-indigo-300 font-medium mb-2">This Year - Best For:</h4>
                                        <p className="text-indigo-100">{feedRecommendations.cosmic_timing.year_timing.best_for}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-indigo-300 font-medium mb-2">This Month - Focus On:</h4>
                                        <p className="text-indigo-100">{feedRecommendations.cosmic_timing.month_timing.best_for}</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-indigo-900/30 rounded-md">
                                    <h4 className="text-indigo-300 font-medium mb-1">Integration Advice:</h4>
                                    <p className="text-indigo-200 text-sm">{feedRecommendations.cosmic_timing.integration_advice}</p>
                                </div>
                            </div>

                            {/* Feed Content Suggestions */}
                            <div className="bg-gradient-to-r from-teal-800/30 to-cyan-800/30 rounded-lg p-6 border border-teal-500/20">
                                <h3 className="text-lg font-semibold text-teal-200 mb-4 flex items-center space-x-2">
                                    <TrendingUp size={20} />
                                    <span>Content Alignment</span>
                                </h3>
                                <div className="space-y-4">
                                    {/* Content Types */}
                                    <div>
                                        <h4 className="text-teal-300 font-medium mb-2">Recommended Content Types:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {feedRecommendations.feed_recommendations.content_types.map((type: string, index: number) => (
                                                <button
                                                    key={`content-${type}-${index}`}
                                                    onClick={() => handlePostSuggestionClick({ type: 'content_type', value: type })}
                                                    className="px-3 py-1 bg-teal-600/30 hover:bg-teal-600/50 rounded-full text-teal-200 text-sm transition-all"
                                                >
                                                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hashtags */}
                                    <div>
                                        <h4 className="text-teal-300 font-medium mb-2">Cosmic Hashtags:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {feedRecommendations.feed_recommendations.hashtags.map((tag: string, index: number) => (
                                                <button
                                                    key={`hashtag-${tag}-${index}`}
                                                    onClick={() => handlePostSuggestionClick({ type: 'hashtag', value: tag })}
                                                    className="px-3 py-1 bg-teal-700/40 hover:bg-teal-700/60 rounded-full text-teal-300 text-sm transition-all"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Engagement Timing */}
                                    <div className="p-3 bg-teal-900/30 rounded-md">
                                        <h4 className="text-teal-300 font-medium mb-1">Optimal Engagement:</h4>
                                        <p className="text-teal-200 text-sm">{feedRecommendations.feed_recommendations.engagement_timing}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'recommendations' && personalizedRecs && (
                        <motion.div
                            key="recommendations"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Action Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Immediate Actions */}
                                <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-lg p-6 border border-red-500/20">
                                    <h3 className="text-lg font-semibold text-red-200 mb-4">🔥 Immediate Actions</h3>
                                    <div className="space-y-3">
                                        {personalizedRecs.immediate_actions.map((action: string, index: number) => (
                                            <div
                                                key={`action-${index}-${action.slice(0, 10)}`}
                                                className="p-3 bg-red-800/20 rounded-md cursor-pointer hover:bg-red-800/30 transition-all"
                                                onClick={() => handleRecommendationClick(action, 'immediate_action')}
                                            >
                                                <p className="text-red-100 text-sm">{action}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Weekly Focus */}
                                <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/30 rounded-lg p-6 border border-amber-500/20">
                                    <h3 className="text-lg font-semibold text-amber-200 mb-4">📅 Weekly Focus</h3>
                                    <div className="space-y-3">
                                        {personalizedRecs.weekly_focus.map((focus: string, index: number) => (
                                            <div
                                                key={`focus-${index}-${focus.slice(0, 10)}`}
                                                className="p-3 bg-amber-800/20 rounded-md cursor-pointer hover:bg-amber-800/30 transition-all"
                                                onClick={() => handleRecommendationClick(focus, 'weekly_focus')}
                                            >
                                                <p className="text-amber-100 text-sm">{focus}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Yearly Goals */}
                                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-lg p-6 border border-purple-500/20">
                                    <h3 className="text-lg font-semibold text-purple-200 mb-4">🎯 Yearly Goals</h3>
                                    <div className="space-y-3">
                                        {personalizedRecs.yearly_goals.map((goal: string, index: number) => (
                                            <div
                                                key={`goal-${index}-${goal.slice(0, 10)}`}
                                                className="p-3 bg-purple-800/20 rounded-md cursor-pointer hover:bg-purple-800/30 transition-all"
                                                onClick={() => handleRecommendationClick(goal, 'yearly_goal')}
                                            >
                                                <p className="text-purple-100 text-sm">{goal}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Spiritual Practices */}
                                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-6 border border-cyan-500/20">
                                    <h3 className="text-lg font-semibold text-cyan-200 mb-4">🧘 Spiritual Practices</h3>
                                    <div className="space-y-3">
                                        {personalizedRecs.spiritual_practices.map((practice: string, index: number) => (
                                            <div
                                                key={`practice-${index}-${practice.slice(0, 10)}`}
                                                className="p-3 bg-cyan-800/20 rounded-md cursor-pointer hover:bg-cyan-800/30 transition-all"
                                                onClick={() => handleRecommendationClick(practice, 'spiritual_practice')}
                                            >
                                                <p className="text-cyan-100 text-sm">{practice}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Crystal Work */}
                            {personalizedRecs.crystal_work.length > 0 && (
                                <div className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg p-6 border border-emerald-500/20">
                                    <h3 className="text-lg font-semibold text-emerald-200 mb-4 flex items-center space-x-2">
                                        <Gem size={20} />
                                        <span>Crystal Work</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {personalizedRecs.crystal_work.map((work: string, index: number) => (
                                            <div
                                                key={`crystal-${index}-${work.slice(0, 10)}`}
                                                className="p-3 bg-emerald-800/20 rounded-md cursor-pointer hover:bg-emerald-800/30 transition-all"
                                                onClick={() => handleRecommendationClick(work, 'crystal_work')}
                                            >
                                                <p className="text-emerald-100 text-sm">{work}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'compatibility' && feedRecommendations && (
                        <motion.div
                            key="compatibility"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Compatible Users */}
                            <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-lg p-6 border border-violet-500/20">
                                <h3 className="text-lg font-semibold text-violet-200 mb-4 flex items-center space-x-2">
                                    <Users size={20} />
                                    <span>Numerologically Compatible Users</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {feedRecommendations.compatible_users.map((user: any, index: number) => (
                                        <div
                                            key={`user-${user.username}-${index}`}
                                            className="p-4 bg-violet-800/20 rounded-lg cursor-pointer hover:bg-violet-800/30 transition-all"
                                            onClick={() => handleCompatibleUserClick(user)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-violet-200 font-medium">{user.username}</span>
                                                <span className="text-violet-400 text-sm">
                                                    {Math.round(user.compatibility_score * 100)}%
                                                </span>
                                            </div>
                                            <div className="text-violet-300 text-sm">
                                                Personal Year {user.personal_year}
                                            </div>
                                            <div className="mt-2 w-full bg-violet-900/30 rounded-full h-2">
                                                <div
                                                    className="bg-violet-500 h-2 rounded-full transition-all w-0"
                                                    style={{
                                                        width: `${user.compatibility_score * 100}%`,
                                                        transition: 'width 0.3s ease-in-out'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Compatibility Tips */}
                            <div className="bg-gradient-to-r from-rose-900/30 to-pink-900/30 rounded-lg p-6 border border-rose-500/20">
                                <h3 className="text-lg font-semibold text-rose-200 mb-4">💫 Numerology Connection Tips</h3>
                                <div className="space-y-3">
                                    <div className="p-3 bg-rose-800/20 rounded-md">
                                        <p className="text-rose-100 text-sm">
                                            <strong>Life Path Harmony:</strong> Connect with users whose Life Path numbers complement yours for deeper understanding.
                                        </p>
                                    </div>
                                    <div className="p-3 bg-rose-800/20 rounded-md">
                                        <p className="text-rose-100 text-sm">
                                            <strong>Personal Year Synergy:</strong> Collaborate with users in similar or complementary Personal Year cycles.
                                        </p>
                                    </div>
                                    <div className="p-3 bg-rose-800/20 rounded-md">
                                        <p className="text-rose-100 text-sm">
                                            <strong>Elemental Balance:</strong> Seek connections across different elements for well-rounded growth.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NumerologyDashboard;