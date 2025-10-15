import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';
import { useInfiniteScroll } from '../src/hooks/useInfiniteScroll';

// Navigation through 3D planets only - no traditional UI buttons

const CosmicFeed = () => {
    const router = useRouter();

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/register');
        }
    }, [router]);

    // Use infinite scroll hook for feed data
    const {
        data: feed,
        loading,
        hasMore,
        error,
        refresh,
        loadMoreRef
    } = useInfiniteScroll({
        endpoint: '/api/v1/feed',
        limit: 10,
        initialLoad: true
    });

    // Social interactions handled through cosmic energy flows - no UI buttons needed

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
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 backdrop-blur-sm rounded-lg text-white transition-colors text-sm border border-purple-400/30"
                        disabled={loading}
                    >
                        {loading ? '🔄 Refreshing...' : '🔄 Refresh Cosmic Feed'}
                    </button>
                </motion.div>

                {/* Error State */}
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
                    {!error && feed.length === 0 && !loading ? (
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
                            {feed.map((post: any, index: number) => (
                                <motion.div
                                    key={post.id}
                                    className="feed-post bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    {/* Post Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl">
                                                {getZodiacEmoji(post.zodiac)}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg">
                                                    {post.username}
                                                </h3>
                                                <p className="text-purple-300 text-sm">
                                                    {post.zodiac} • {formatTimeAgo(post.created_at)}
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
                                            <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-4 rounded-xl border border-purple-400/30 mb-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-24 bg-purple-900/50 rounded-lg flex items-center justify-center border border-purple-500/50">
                                                        <span className="text-2xl">🔮</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-purple-200 font-bold mb-2">
                                                            {post.content.card_name}
                                                        </h4>
                                                        <p className="text-white text-sm leading-relaxed">
                                                            {post.content.interpretation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="bg-purple-900/30 p-4 rounded-xl mb-4">
                                            <p className="text-white leading-relaxed">{post.content}</p>
                                        </div>
                                    )}

                                    {/* Cosmic Energy Indicators */}
                                    <div className="cosmic-indicators flex gap-3 pt-4 border-t border-purple-500/30">
                                        <span className="flex items-center gap-2 text-purple-300 cosmic-text">
                                            ✨ {post.zodiac} Energy
                                        </span>
                                        <span className="flex items-center gap-2 text-purple-300 cosmic-text">
                                            💫 Cosmic Resonance
                                        </span>
                                        <span className="flex items-center gap-2 text-purple-300 cosmic-text">
                                            🌟 Starlight Frequency
                                        </span>
                                    </div>
                                </motion.div>
                            ))}

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
                            {!hasMore && feed.length > 0 && (
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
                </div>                    {/* Cosmic Energy Flow Indicator */}
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
        </CosmicPageWrapper>
    );
};

export default CosmicFeed;