import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';

interface InfluenceData {
    topFollows: Array<{
        id: string;
        username: string;
        zodiac: string;
        zodiac_signs: any;
        compatibility_score: number;
        mutual_connections: number;
        avatar_url?: string;
        follower_count: number;
    }>;
    mostLikedPosts: Array<{
        id: string;
        content: string;
        type: string;
        likes_count: number;
        ritual_reactions: {
            fire: number;
            water: number;
            air: number;
            earth: number;
            zodiac_specific: { [key: string]: number };
        };
        created_at: string;
        viral_score: number;
    }>;
    viralContent: Array<{
        id: string;
        content: string;
        type: string;
        cross_sign_resonance: number;
        engagement_diversity: number;
        cosmic_reach: number;
        created_at: string;
    }>;
    elementalPlaylist: {
        current_song?: string;
        artist?: string;
        elemental_vibe: 'fire' | 'water' | 'air' | 'earth';
        spotify_track_id?: string;
    };
    cosmicStats: {
        total_ritual_reactions: number;
        zodiac_influence_score: number;
        cross_sign_engagement: number;
        mythic_reach: number;
    };
}

interface InfluenceShowcaseProps {
    userId?: string;
    isOwnProfile?: boolean;
    layout?: 'grid' | 'orbit' | 'constellation';
}

const InfluenceShowcase: React.FC<InfluenceShowcaseProps> = ({
    userId,
    isOwnProfile = false,
    layout = 'grid'
}) => {
    const [influenceData, setInfluenceData] = useState<InfluenceData | null>(null);
    const [activeTab, setActiveTab] = useState<'follows' | 'posts' | 'viral' | 'music'>('follows');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const targetUserId = userId || user?.id;

    const fetchInfluenceData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/profile/${targetUserId}/influence`);
            setInfluenceData(response.data);
        } catch (error) {
            console.error('Failed to fetch influence data:', error);
        } finally {
            setLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        fetchInfluenceData();
    }, [fetchInfluenceData]);

    const getZodiacEmoji = (zodiac: string) => {
        const emojiMap: { [key: string]: string } = {
            'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
            'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
            'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
        };
        return emojiMap[zodiac] || '⭐';
    };

    const getElementalEmoji = (element: string) => {
        const elementMap: { [key: string]: string } = {
            'fire': '🔥', 'water': '🌊', 'air': '🌬️', 'earth': '🌍'
        };
        return elementMap[element] || '✨';
    };

    const getCompatibilityColor = (score: number) => {
        if (score >= 0.8) return 'text-green-400 bg-green-400/20';
        if (score >= 0.6) return 'text-yellow-400 bg-yellow-400/20';
        if (score >= 0.4) return 'text-orange-400 bg-orange-400/20';
        return 'text-red-400 bg-red-400/20';
    };

    const getViralIntensity = (score: number) => {
        if (score >= 0.8) return 'from-purple-500 to-pink-500';
        if (score >= 0.6) return 'from-blue-500 to-purple-500';
        if (score >= 0.4) return 'from-indigo-500 to-blue-500';
        return 'from-gray-500 to-indigo-500';
    };

    const renderTopFollows = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                🌟 Cosmic Connections
            </h3>
            <div className="grid gap-3">
                {influenceData?.topFollows?.map((follow) => (
                    <motion.div
                        key={follow.id}
                        className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all"
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-lg">
                                    {getZodiacEmoji(follow.zodiac)}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">{follow.username}</h4>
                                    <p className="text-purple-300 text-sm">
                                        {follow.zodiac} • {follow.follower_count.toLocaleString()} followers
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`px-2 py-1 rounded text-xs font-semibold ${getCompatibilityColor(follow.compatibility_score)}`}>
                                    {Math.round(follow.compatibility_score * 100)}% Compatible
                                </div>
                                <p className="text-purple-400 text-xs mt-1">
                                    {follow.mutual_connections} mutual
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderMostLikedPosts = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                ❤️ Ritual Resonance
            </h3>
            <div className="grid gap-4">
                {influenceData?.mostLikedPosts?.map((post) => (
                    <motion.div
                        key={post.id}
                        className="bg-black/40 rounded-lg p-4 border border-purple-500/20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded text-xs">
                                {post.type.replace('_', ' ')}
                            </span>
                            <div className="text-purple-300 text-sm">
                                {post.likes_count.toLocaleString()} reactions
                            </div>
                        </div>

                        <p className="text-white text-sm mb-3 line-clamp-2">{post.content}</p>

                        {/* Elemental Reactions Display */}
                        <div className="flex gap-2 mb-2">
                            {Object.entries(post.ritual_reactions).map(([element, count]) => {
                                if (element === 'zodiac_specific' || typeof count !== 'number' || count === 0) return null;
                                return (
                                    <div key={element} className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded">
                                        <span>{getElementalEmoji(element)}</span>
                                        <span className="text-xs text-gray-300">{count}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Zodiac-Specific Reactions */}
                        {Object.keys(post.ritual_reactions.zodiac_specific).length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(post.ritual_reactions.zodiac_specific).map(([zodiac, count]) => (
                                    <div key={zodiac} className="flex items-center gap-1 bg-indigo-800/30 px-2 py-1 rounded">
                                        <span>{getZodiacEmoji(zodiac)}</span>
                                        <span className="text-xs text-indigo-200">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderViralContent = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                🚀 Cross-Sign Resonance
            </h3>
            <div className="grid gap-4">
                {influenceData?.viralContent?.map((content) => (
                    <motion.div
                        key={content.id}
                        className={`bg-gradient-to-r ${getViralIntensity(content.cross_sign_resonance)} p-4 rounded-lg border border-white/20`}
                        initial={{ opacity: 0, rotateY: 10 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        whileHover={{ scale: 1.02, rotateY: -2 }}
                    >
                        <div className="backdrop-blur-sm bg-black/40 p-3 rounded">
                            <div className="flex justify-between items-start mb-2">
                                <span className="px-2 py-1 bg-white/20 text-white rounded text-xs font-semibold">
                                    VIRAL
                                </span>
                                <div className="text-right">
                                    <div className="text-white text-sm font-bold">
                                        {Math.round(content.cross_sign_resonance * 100)}% Resonance
                                    </div>
                                    <div className="text-white/70 text-xs">
                                        {content.cosmic_reach.toLocaleString()} reach
                                    </div>
                                </div>
                            </div>

                            <p className="text-white text-sm mb-3 line-clamp-2">{content.content}</p>

                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/80">
                                    {content.engagement_diversity}% diversity score
                                </span>
                                <span className="text-white/60">
                                    {new Date(content.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderElementalPlaylist = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                🎵 Elemental Soundtrack
            </h3>
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-lg p-6 border border-purple-500/30">
                {influenceData?.elementalPlaylist?.current_song ? (
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="text-4xl mb-2">
                                {getElementalEmoji(influenceData.elementalPlaylist.elemental_vibe)}
                            </div>
                            <div className="text-purple-200 text-sm uppercase tracking-wide">
                                {influenceData.elementalPlaylist.elemental_vibe} vibes
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-white font-semibold text-lg">
                                {influenceData.elementalPlaylist.current_song}
                            </h4>
                            <p className="text-purple-300">
                                {influenceData.elementalPlaylist.artist}
                            </p>
                        </div>

                        <motion.button
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-sm font-semibold hover:from-green-500 hover:to-green-400 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🎧 Listen on Spotify
                        </motion.button>
                    </div>
                ) : (
                    <div className="text-center text-purple-400">
                        <div className="text-2xl mb-2">🎵</div>
                        <p>No elemental soundtrack set</p>
                        {isOwnProfile && (
                            <button className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-500 transition-colors">
                                Connect Spotify
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderCosmicStats = () => (
        <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                📊 Cosmic Influence
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-300">
                        {influenceData?.cosmicStats?.total_ritual_reactions?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-purple-400">Ritual Reactions</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-pink-300">
                        {influenceData?.cosmicStats?.zodiac_influence_score || 0}
                    </div>
                    <div className="text-xs text-pink-400">Zodiac Influence</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-300">
                        {Math.round((influenceData?.cosmicStats?.cross_sign_engagement || 0) * 100)}%
                    </div>
                    <div className="text-xs text-indigo-400">Cross-Sign Reach</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-300">
                        {influenceData?.cosmicStats?.mythic_reach?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-cyan-400">Mythic Reach</div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-8 bg-purple-900/30 rounded"></div>
                <div className="h-32 bg-purple-900/30 rounded"></div>
                <div className="h-48 bg-purple-900/30 rounded"></div>
            </div>
        );
    }

    return (
        <div className="influence-showcase w-full max-w-4xl mx-auto">
            {/* Cosmic Stats Overview */}
            {renderCosmicStats()}

            {/* Tab Navigation */}
            <div className="flex gap-2 my-6 bg-black/20 p-1 rounded-lg border border-purple-500/20">
                {[
                    { id: 'follows', label: 'Connections', icon: '🌟' },
                    { id: 'posts', label: 'Resonance', icon: '❤️' },
                    { id: 'viral', label: 'Viral', icon: '🚀' },
                    { id: 'music', label: 'Soundtrack', icon: '🎵' }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        className={`flex-1 py-3 px-4 rounded text-sm font-semibold transition-all ${activeTab === tab.id
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-purple-300 hover:text-white hover:bg-purple-800/30'
                            }`}
                        onClick={() => setActiveTab(tab.id as any)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'follows' && renderTopFollows()}
                    {activeTab === 'posts' && renderMostLikedPosts()}
                    {activeTab === 'viral' && renderViralContent()}
                    {activeTab === 'music' && renderElementalPlaylist()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default InfluenceShowcase;