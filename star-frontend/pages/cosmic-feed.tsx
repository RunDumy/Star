import axios from 'axios';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';
import { useInfiniteScroll } from '../src/hooks/useInfiniteScroll';
import { useSocket } from '../src/lib/SocketContext';

// Supabase Storage URLs for cosmic icons
const SUPABASE_STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || 'https://your-project-id.supabase.co/storage/v1/object/public/assets';

// Planetary and lunar icons
const PLANETARY_ICONS = {
    sun: `${SUPABASE_STORAGE_URL}/icons/planetary/sun.png`,
    moon: `${SUPABASE_STORAGE_URL}/icons/planetary/moon.png`,
    mercury: `${SUPABASE_STORAGE_URL}/icons/planetary/mercury.png`,
    venus: `${SUPABASE_STORAGE_URL}/icons/planetary/venus.png`,
    mars: `${SUPABASE_STORAGE_URL}/icons/planetary/mars.png`,
    jupiter: `${SUPABASE_STORAGE_URL}/icons/planetary/jupiter.png`,
    saturn: `${SUPABASE_STORAGE_URL}/icons/planetary/saturn.png`,
    uranus: `${SUPABASE_STORAGE_URL}/icons/planetary/uranus.png`,
    neptune: `${SUPABASE_STORAGE_URL}/icons/planetary/neptune.png`,
    pluto: `${SUPABASE_STORAGE_URL}/icons/planetary/pluto.png`
};

const LUNAR_PHASES = {
    new_moon: `${SUPABASE_STORAGE_URL}/icons/lunar/new-moon.png`,
    waxing_crescent: `${SUPABASE_STORAGE_URL}/icons/lunar/waxing-crescent.png`,
    first_quarter: `${SUPABASE_STORAGE_URL}/icons/lunar/first-quarter.png`,
    waxing_gibbous: `${SUPABASE_STORAGE_URL}/icons/lunar/waxing-gibbous.png`,
    full_moon: `${SUPABASE_STORAGE_URL}/icons/lunar/full-moon.png`,
    waning_gibbous: `${SUPABASE_STORAGE_URL}/icons/lunar/waning-gibbous.png`,
    last_quarter: `${SUPABASE_STORAGE_URL}/icons/lunar/last-quarter.png`,
    waning_crescent: `${SUPABASE_STORAGE_URL}/icons/lunar/waning-crescent.png`
};

// Utility functions for cosmic calculations
const getCurrentLunarPhase = (): string => {
    const now = new Date();
    const lunarCycle = 29.53; // days
    const knownNewMoon = new Date('2024-01-11'); // Known new moon date
    const daysSinceNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;

    if (phase < 0.125) return 'new_moon';
    if (phase < 0.25) return 'waxing_crescent';
    if (phase < 0.375) return 'first_quarter';
    if (phase < 0.5) return 'waxing_gibbous';
    if (phase < 0.625) return 'full_moon';
    if (phase < 0.75) return 'waning_gibbous';
    if (phase < 0.875) return 'last_quarter';
    return 'waning_crescent';
};

const getPlanetaryPositions = (): { [key: string]: number } => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    // Simplified planetary position calculations (in degrees)
    return {
        sun: (dayOfYear * 360 / 365) % 360,
        moon: (dayOfYear * 360 / 29.53) % 360,
        mercury: (dayOfYear * 360 / 88) % 360,
        venus: (dayOfYear * 360 / 225) % 360,
        mars: (dayOfYear * 360 / 687) % 360,
        jupiter: (dayOfYear * 360 / 4333) % 360,
        saturn: (dayOfYear * 360 / 10759) % 360,
        uranus: (dayOfYear * 360 / 30687) % 360,
        neptune: (dayOfYear * 360 / 60190) % 360,
        pluto: (dayOfYear * 360 / 90560) % 360
    };
};

// Enhanced types for posts
interface Post {
    id: string;
    user_id: string;
    content: string;
    zodiac_sign: string;
    display_name: string;
    created_at: string;
    like_count: number;
    liked_by_user: boolean;
    comments: Comment[];
    type?: 'tarot_reading' | 'regular';
    image_url?: string;
    video_url?: string;
    lunar_phase?: string;
    planetary_positions?: { [key: string]: number };
}

interface Comment {
    id: string;
    user_id: string;
    content: string;
    display_name: string;
    created_at: string;
}

// Navigation through 3D planets only - no traditional UI buttons

const CosmicFeed = () => {
    const router = useRouter();
    const { socket, connected, joinRoom } = useSocket();
    const [selectedPost, setSelectedPost] = useState<string | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/register');
        }
    }, [router]);

    // Use infinite scroll hook for posts data
    const {
        data: posts,
        loading,
        hasMore,
        error,
        refresh,
        loadMoreRef
    } = useInfiniteScroll({
        endpoint: '/api/v1/posts',
        limit: 10,
        initialLoad: true
    });

    // Join cosmic feed room for real-time updates
    useEffect(() => {
        if (connected && socket) {
            joinRoom('cosmic_feed');

            // Listen for real-time events
            const handleNewPost = () => {
                console.log('🌟 New post detected, refreshing feed...');
                refresh();
            };

            const handlePostUpdate = () => {
                console.log('💫 Post updated, refreshing feed...');
                refresh();
            };

            // Listen to custom events dispatched by SocketContext
            globalThis.addEventListener('cosmic_new_post', handleNewPost);
            globalThis.addEventListener('cosmic_post_liked', handlePostUpdate);
            globalThis.addEventListener('cosmic_new_comment', handlePostUpdate);

            return () => {
                globalThis.removeEventListener('cosmic_new_post', handleNewPost);
                globalThis.removeEventListener('cosmic_post_liked', handlePostUpdate);
                globalThis.removeEventListener('cosmic_new_comment', handlePostUpdate);
            };
        }
    }, [connected, socket, joinRoom, refresh]);

    // Handle like action with zodiac-themed animation
    const handleLike = async (postId: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await axios.post(`${API_URL}/api/v1/posts/${postId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Trigger refresh to update like counts
            refresh();

            // Add zodiac-specific particle animation effect
            const zodiacParticle = document.createElement('div');
            zodiacParticle.textContent = '✨';
            zodiacParticle.className = 'fixed pointer-events-none text-2xl animate-ping';
            zodiacParticle.style.left = Math.random() * globalThis.innerWidth + 'px';
            zodiacParticle.style.top = Math.random() * globalThis.innerHeight + 'px';
            document.body.appendChild(zodiacParticle);
            setTimeout(() => zodiacParticle.remove(), 1000);

            console.log('✨ Cosmic like sent!');
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    // Handle comment submission
    const handleComment = async (postId: string, content: string) => {
        const token = localStorage.getItem('token');
        if (!token || !content.trim()) return;

        try {
            await axios.post(`${API_URL}/api/v1/posts/${postId}/comment`,
                { content: content.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Trigger refresh to show new comment
            refresh();

            console.log('💫 Cosmic comment sent!');
        } catch (error) {
            console.error('Failed to comment:', error);
        }
    };    // Social interactions handled through cosmic energy flows - no UI buttons needed

    const getZodiacEmoji = (zodiac: string) => {
        const emojiMap: { [key: string]: string } = {
            'Aries': '♈',
            'Taurus': '♉',
            'Gemini': '♊',
            'Cancer': '♋',
            'Leo': '♌',
            'Virgo': '♍',
            'Libra': '♎',
            'Scorpio': '♏',
            'Sagittarius': '♐',
            'Capricorn': '♑',
            'Aquarius': '♒',
            'Pisces': '♓'
        };
        return emojiMap[zodiac] || '⭐';
    };

    const getZodiacColors = (zodiac: string) => {
        const colorMap: { [key: string]: { from: string; to: string; accent: string } } = {
            'Aries': { from: 'from-red-600', to: 'to-orange-600', accent: 'border-red-400' },
            'Taurus': { from: 'from-green-600', to: 'to-emerald-600', accent: 'border-green-400' },
            'Gemini': { from: 'from-yellow-600', to: 'to-amber-600', accent: 'border-yellow-400' },
            'Cancer': { from: 'from-blue-600', to: 'to-cyan-600', accent: 'border-blue-400' },
            'Leo': { from: 'from-orange-600', to: 'to-yellow-600', accent: 'border-orange-400' },
            'Virgo': { from: 'from-green-600', to: 'to-teal-600', accent: 'border-green-400' },
            'Libra': { from: 'from-pink-600', to: 'to-rose-600', accent: 'border-pink-400' },
            'Scorpio': { from: 'from-purple-600', to: 'to-indigo-600', accent: 'border-purple-400' },
            'Sagittarius': { from: 'from-indigo-600', to: 'to-purple-600', accent: 'border-indigo-400' },
            'Capricorn': { from: 'from-gray-600', to: 'to-slate-600', accent: 'border-gray-400' },
            'Aquarius': { from: 'from-cyan-600', to: 'to-blue-600', accent: 'border-cyan-400' },
            'Pisces': { from: 'from-teal-600', to: 'to-green-600', accent: 'border-teal-400' }
        };
        return colorMap[zodiac] || { from: 'from-purple-600', to: 'to-pink-600', accent: 'border-purple-400' };
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <motion.div
                    className="text-white text-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    Loading cosmic feed...
                </motion.div>
            </div>
        );
    }

    return (
        <CosmicPageWrapper>
            <div className="container mx-auto px-4 py-8 space-color">
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl font-bold text-white mb-4">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Cosmic Feed
                        </span>
                    </h1>
                    <p className="text-purple-300 text-xl">
                        Discover the zodiac wisdom of your cosmic community
                    </p>
                </motion.div>

                {/* Planetary Navigation */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-4">🌌 Planetary Navigation</h2>
                    <div className="flex justify-center gap-4 mb-4 flex-wrap">
                        {Object.entries(PLANETARY_ICONS).map(([planet, iconUrl]) => (
                            <motion.div
                                key={planet}
                                className="flex flex-col items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30 hover:bg-purple-900/50 transition-colors cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img
                                    src={iconUrl}
                                    alt={`${planet} navigation`}
                                    className="w-12 h-12"
                                />
                                <span className="text-purple-200 text-sm capitalize">{planet}</span>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-purple-300 text-sm">
                        Click planets to navigate through different cosmic realms
                    </p>
                </motion.div>

                {/* Navigation and Refresh Controls */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-white cosmic-text mb-4">
                        🌌 Navigate by clicking the 3D planets in space 🌌
                    </p>

                    {/* Real-time Connection Status */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${connected
                            ? 'bg-green-600/30 text-green-200 border border-green-400/30'
                            : 'bg-red-600/30 text-red-200 border border-red-400/30'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                            {connected ? '🌌 Cosmic Stream Active' : '⭐ Cosmic Stream Reconnecting...'}
                        </div>
                    </div>

                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 backdrop-blur-sm rounded-lg text-white transition-colors text-sm border border-purple-400/30"
                        disabled={loading}
                    >
                        {loading ? '🔄 Refreshing...' : '🔄 Refresh Cosmic Feed'}
                    </button>
                </motion.div>            {/* Planetary Navigation */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-4">🌌 Planetary Navigation</h2>
                    <div className="flex justify-center gap-4 mb-4 flex-wrap">
                        {Object.entries(PLANETARY_ICONS).map(([planet, iconUrl]) => (
                            <motion.div
                                key={planet}
                                className="flex flex-col items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30 hover:bg-purple-900/50 transition-colors cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img
                                    src={iconUrl}
                                    alt={`${planet} navigation`}
                                    className="w-12 h-12"
                                />
                                <span className="text-purple-200 text-sm capitalize">{planet}</span>
                            </motion.div>
                        ))}
                    </div>
                    <p className="text-purple-300 text-sm">
                        Click planets to navigate through different cosmic realms
                    </p>
                </motion.div>
                {error && (
                    <motion.div
                        className="text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
                        <button
                            onClick={refresh}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Feed */}
                <div className="max-w-2xl mx-auto space-y-6">
                    {!error && posts.length === 0 && !loading ? (
                        <motion.div
                            className="text-center py-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="text-6xl mb-4">🌌</div>
                            <h2 className="text-2xl font-bold text-white mb-2">The cosmos is quiet...</h2>
                            <p className="text-purple-300 mb-6 cosmic-text">
                                Share a tarot reading or create some cosmic content to get started!<br />
                                Navigate to the Tarot Oracle planet to begin your journey.
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            {posts.map((post: Post, index: number) => {
                                const zodiacColors = getZodiacColors(post.zodiac_sign);
                                const currentLunarPhase = getCurrentLunarPhase();
                                const planetaryPositions = getPlanetaryPositions();

                                return (
                                    <motion.div
                                        key={post.id}
                                        className={`feed-post bg-black/50 backdrop-blur-sm rounded-2xl p-6 border ${zodiacColors.accent}/30`}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * index }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {/* Cosmic Header with Lunar Phase and Planetary Positions */}
                                        <div className="cosmic-header flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg border border-purple-500/30">
                                            <div className="flex items-center gap-3">
                                                {/* Lunar Phase Icon */}
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={LUNAR_PHASES[currentLunarPhase as keyof typeof LUNAR_PHASES]}
                                                        alt={`Current lunar phase: ${currentLunarPhase.replace('_', ' ')}`}
                                                        className="w-8 h-8"
                                                    />
                                                    <span className="text-purple-200 text-sm capitalize">
                                                        {currentLunarPhase.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                {/* Planetary Positions */}
                                                <div className="flex gap-1">
                                                    {Object.entries(planetaryPositions).slice(0, 3).map(([planet, position]) => (
                                                        <div key={planet} className="flex items-center gap-1">
                                                            <img
                                                                src={PLANETARY_ICONS[planet as keyof typeof PLANETARY_ICONS]}
                                                                alt={`${planet} position`}
                                                                className="w-6 h-6"
                                                            />
                                                            <span className="text-purple-300 text-xs">
                                                                {Math.round(position)}°
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="text-purple-300 text-xs">
                                                Cosmic Alignment Active
                                            </div>
                                        </div>
                                        {/* Post Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${zodiacColors.from} ${zodiacColors.to} rounded-full flex items-center justify-center text-2xl`}>
                                                    {getZodiacEmoji(post.zodiac_sign)}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">
                                                        {post.display_name || 'Cosmic Traveler'}
                                                    </h3>
                                                    <p className="text-purple-300 text-sm">
                                                        {post.zodiac_sign} • {formatTimeAgo(post.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        {post.type === 'tarot_reading' ? (
                                            <motion.div
                                                className="tarot-post"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className={`bg-gradient-to-br ${zodiacColors.from}/50 ${zodiacColors.to}/50 p-4 rounded-xl border ${zodiacColors.accent}/30 mb-4`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-16 h-24 bg-purple-900/50 rounded-lg flex items-center justify-center border border-purple-500/50">
                                                            <span className="text-2xl">🔮</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-purple-200 font-bold mb-2">
                                                                Cosmic Tarot Reading
                                                            </h4>
                                                            <p className="text-white text-sm leading-relaxed">
                                                                {post.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className={`bg-gradient-to-br ${zodiacColors.from}/30 ${zodiacColors.to}/30 p-4 rounded-xl mb-4`}>
                                                <p className="text-white leading-relaxed">{post.content}</p>

                                                {/* Media Content */}
                                                {post.image_url && (
                                                    <img
                                                        src={post.image_url}
                                                        alt="Cosmic post content"
                                                        className="w-full mt-4 rounded-lg"
                                                    />
                                                )}
                                                {post.video_url && (
                                                    <video
                                                        src={post.video_url}
                                                        controls
                                                        className="w-full mt-4 rounded-lg"
                                                        aria-label="Post video content"
                                                    >
                                                        <track kind="captions" src="" label="Captions" />
                                                    </video>
                                                )}
                                            </div>
                                        )}

                                        {/* Social Actions */}
                                        <div className="social-actions flex items-center justify-between pt-4 border-t border-purple-500/30">
                                            <div className="flex items-center gap-4">
                                                {/* Like Button */}
                                                <motion.button
                                                    onClick={() => handleLike(post.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${post.liked_by_user
                                                        ? 'bg-red-600/50 text-red-200'
                                                        : 'bg-gray-600/30 text-gray-300 hover:bg-gray-600/50'
                                                        }`}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <span className="text-lg">{post.liked_by_user ? '❤️' : '🤍'}</span>
                                                    <span className="text-sm">{post.like_count}</span>
                                                </motion.button>

                                                {/* Comment Toggle */}
                                                <motion.button
                                                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-600/30 text-gray-300 hover:bg-gray-600/50 transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <span className="text-lg">💬</span>
                                                    <span className="text-sm">{post.comments.length}</span>
                                                </motion.button>

                                                {/* Share Button */}
                                                <motion.button
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-600/30 text-gray-300 hover:bg-gray-600/50 transition-colors"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <span className="text-lg">✨</span>
                                                    <span className="text-sm">Share</span>
                                                </motion.button>
                                            </div>

                                            {/* Cosmic Energy Indicators */}
                                            <div className="cosmic-indicators flex gap-2">
                                                <span className="text-purple-300 text-sm">
                                                    ✨ {post.zodiac_sign} Energy
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        {selectedPost === post.id && (
                                            <motion.div
                                                className="comments-section mt-4 pt-4 border-t border-purple-500/30"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                {/* Existing Comments */}
                                                {post.comments.map((comment) => (
                                                    <div key={comment.id} className="mb-3 p-3 bg-gray-800/50 rounded-lg">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-purple-300 font-semibold text-sm">
                                                                {comment.display_name}
                                                            </span>
                                                            <span className="text-gray-500 text-xs">
                                                                {formatTimeAgo(comment.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-white text-sm">{comment.content}</p>
                                                    </div>
                                                ))}

                                                {/* Comment Input */}
                                                <div className="mt-3">
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            const input = e.currentTarget.elements.namedItem('comment') as HTMLInputElement;
                                                            if (input.value.trim()) {
                                                                handleComment(post.id, input.value);
                                                                input.value = '';
                                                            }
                                                        }}
                                                        className="flex gap-2"
                                                    >
                                                        <input
                                                            name="comment"
                                                            type="text"
                                                            placeholder="Share your cosmic wisdom..."
                                                            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                                        />
                                                        <motion.button
                                                            type="submit"
                                                            className={`px-4 py-2 bg-gradient-to-r ${zodiacColors.from} ${zodiacColors.to} text-white rounded-lg hover:opacity-80 transition-opacity`}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            💫
                                                        </motion.button>
                                                    </form>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}

                            {/* Infinite Scroll Trigger */}
                            {hasMore && (
                                <motion.div
                                    ref={loadMoreRef}
                                    className="text-center py-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.div
                                        className="text-purple-300 text-lg"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        🌌 Loading more cosmic wisdom...
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* End of Feed Indicator */}
                            {!hasMore && posts.length > 0 && (
                                <motion.div
                                    className="text-center py-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="text-purple-300 text-lg">
                                        ✨ You've reached the edge of the cosmos ✨
                                    </div>
                                    <p className="text-purple-400 text-sm mt-2">
                                        Navigate to other planets to explore more cosmic content
                                    </p>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {/* Cosmic Energy Flow Indicator */}
                <motion.div
                    className="fixed bottom-8 right-8 pointer-events-none"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ delay: 0.5, type: "spring", rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl cosmic-text">
                        🔮
                    </div>
                </motion.div>
            </div>
        </CosmicPageWrapper >
    );
};

export default CosmicFeed;