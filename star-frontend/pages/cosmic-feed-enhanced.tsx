import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';
import { useInfiniteScroll } from '../src/hooks/useInfiniteScrollEnhanced';

// Enhanced cosmic feed with real-time updates, personalization, and advanced features

const CosmicFeedEnhanced = () => {
    const router = useRouter();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [newPostsNotification, setNewPostsNotification] = useState(0);
    const [cosmicEvents, setCosmicEvents] = useState<any[]>([]);

    // Initialize WebSocket connection
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/register');
            return;
        }

        // Mock user data (in production, fetch from API)
        const mockUser = {
            id: 'user_1',
            username: 'CosmicTraveler',
            zodiac_signs: {
                western: 'Scorpio',
                chinese: 'Dragon',
                vedic: 'Vrishchika',
                mayan: 'Serpent',
                galactic_tone: 8
            },
            interests: ['tarot', 'astrology', 'cosmic_events']
        };
        setCurrentUser(mockUser);

        // Initialize socket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling']
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('🌌 Connected to cosmic network');

            // Join personalized room
            socketInstance.emit('join_feed_room', {
                room: `feed:${JSON.stringify(mockUser.zodiac_signs)}`
            });
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('🌙 Disconnected from cosmic network');
        });

        socketInstance.on('feed_update', (data) => {
            if (data.type === 'new_post') {
                setNewPostsNotification(prev => prev + 1);
                // Could auto-refresh or show notification
            }
        });

        socketInstance.on('cosmic_alert', (data) => {
            if (data.type === 'cosmic_event') {
                setCosmicEvents(prev => [data.event, ...prev.slice(0, 4)]); // Keep latest 5
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [router]);

    // Enhanced infinite scroll with real-time and personalization
    const {
        data: feed,
        loading,
        hasMore,
        error,
        refresh,
        loadMoreRef,
        setFilters,
        virtualData
    } = useInfiniteScroll({
        endpoint: '/api/v1/feed',
        limit: 15,
        initialLoad: true,
        enableRealTime: true,
        enableVirtual: true,
        cacheKey: currentUser?.id || 'default'
    });

    // Filter handlers
    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(newFilters);
        setShowFilters(false);
    }, [setFilters]);

    const handlePersonalizedFeed = useCallback(() => {
        if (currentUser) {
            const personalizedFilters = {
                zodiacSigns: Object.values(currentUser.zodiac_signs),
                interests: currentUser.interests
            };
            handleFilterChange(personalizedFilters);
        }
    }, [currentUser, handleFilterChange]);

    const handleLoadNewPosts = useCallback(() => {
        refresh();
        setNewPostsNotification(0);
    }, [refresh]);

    // Pull-to-refresh gesture (simplified)
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (isPulling && window.scrollY === 0) {
            const touch = e.touches[0];
            const distance = Math.max(0, touch.clientY - 100);
            setPullDistance(Math.min(distance, 100));
        }
    }, [isPulling]);

    const handleTouchEnd = useCallback(() => {
        if (isPulling && pullDistance > 50) {
            refresh();
        }
        setIsPulling(false);
        setPullDistance(0);
    }, [isPulling, pullDistance, refresh]);

    const getZodiacEmoji = (zodiac: string) => {
        const emojiMap: { [key: string]: string } = {
            'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
            'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
            'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
        };
        return emojiMap[zodiac] || '⭐';
    };

    const getMultiZodiacDisplay = (zodiacSigns: any) => {
        if (!zodiacSigns) return '⭐';

        return (
            <div className="flex gap-1">
                <span title={`Western: ${zodiacSigns.western}`}>
                    {getZodiacEmoji(zodiacSigns.western)}
                </span>
                <span title={`Chinese: ${zodiacSigns.chinese}`} className="text-sm">
                    {zodiacSigns.chinese?.slice(0, 2)}
                </span>
                <span title={`Galactic Tone: ${zodiacSigns.galactic_tone}`} className="text-xs">
                    {zodiacSigns.galactic_tone}
                </span>
            </div>
        );
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

    if (loading && feed.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <motion.div
                    className="text-white text-2xl text-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <div className="text-4xl mb-4">🌌</div>
                    Loading cosmic feed...
                    <div className="text-sm mt-2 text-purple-300">
                        {isConnected ? '🟢 Real-time connected' : '🟡 Connecting...'}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <CosmicPageWrapper>
            <div
                className="container mx-auto px-4 py-8 space-color"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Pull-to-refresh indicator */}
                {isPulling && (
                    <motion.div
                        className="fixed top-0 left-0 right-0 z-50 bg-purple-600/80 backdrop-blur-sm text-white text-center py-2"
                        initial={{ y: -50 }}
                        animate={{ y: pullDistance > 50 ? 0 : -50 }}
                    >
                        {pullDistance > 50 ? '🔄 Release to refresh' : '⬇️ Pull to refresh'}
                    </motion.div>
                )}

                {/* Header with connection status */}
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
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                            {isConnected ? 'Real-time active' : 'Connecting...'}
                        </div>
                        {virtualData && (
                            <div className="text-sm text-purple-300">
                                📊 {virtualData.totalCount} posts loaded
                            </div>
                        )}
                    </div>
                    <p className="text-purple-300 text-xl">
                        Discover personalized cosmic wisdom from your multidimensional zodiac community
                    </p>
                </motion.div>

                {/* Cosmic Events Alert Bar */}
                {cosmicEvents.length > 0 && (
                    <motion.div
                        className="mb-6 bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-xl p-4 border border-purple-400/30"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            🌟 Active Cosmic Events
                        </h3>
                        <div className="space-y-1">
                            {cosmicEvents.slice(0, 2).map((event, index) => (
                                <div key={index} className="text-sm text-purple-200">
                                    <span className="font-medium">{event.name}:</span> {event.description}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Enhanced Controls */}
                <motion.div
                    className="flex flex-wrap gap-3 justify-center mb-8"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <button
                        onClick={handleLoadNewPosts}
                        className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 backdrop-blur-sm rounded-lg text-white transition-colors text-sm border border-purple-400/30 relative"
                        disabled={loading}
                    >
                        {loading ? '🔄 Refreshing...' : '🔄 Refresh Feed'}
                        {newPostsNotification > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {newPostsNotification}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={handlePersonalizedFeed}
                        className="px-4 py-2 bg-indigo-600/50 hover:bg-indigo-600/70 backdrop-blur-sm rounded-lg text-white transition-colors text-sm border border-indigo-400/30"
                    >
                        🎯 My Cosmic Profile
                    </button>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-teal-600/50 hover:bg-teal-600/70 backdrop-blur-sm rounded-lg text-white transition-colors text-sm border border-teal-400/30"
                    >
                        🔍 Filter Content
                    </button>
                </motion.div>

                {/* Advanced Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            className="mb-6 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <h3 className="text-white font-bold mb-4">🎛️ Cosmic Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-purple-300 text-sm mb-2 block">Zodiac Systems:</label>
                                    <div className="space-y-1">
                                        {['Western', 'Chinese', 'Vedic', 'Mayan'].map(system => (
                                            <label key={system} className="flex items-center text-white text-sm">
                                                <input type="checkbox" className="mr-2" />
                                                {system}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-purple-300 text-sm mb-2 block">Content Type:</label>
                                    <div className="space-y-1">
                                        {['Tarot Readings', 'Cosmic Events', 'Daily Features', 'Community'].map(type => (
                                            <label key={type} className="flex items-center text-white text-sm">
                                                <input type="checkbox" className="mr-2" />
                                                {type}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-purple-300 text-sm mb-2 block">Search:</label>
                                    <input
                                        type="text"
                                        placeholder="Search cosmic wisdom..."
                                        className="w-full bg-purple-900/30 border border-purple-400/30 rounded px-3 py-2 text-white text-sm"
                                    />
                                    <div className="mt-2 space-x-2">
                                        <button className="px-3 py-1 bg-purple-600 rounded text-white text-xs">Apply</button>
                                        <button className="px-3 py-1 bg-gray-600 rounded text-white text-xs">Clear</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                {/* Enhanced Feed Display */}
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
                                    className="feed-post bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all"
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.05 * index }}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    {/* Enhanced Post Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                                {getMultiZodiacDisplay(post.zodiac_signs)}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                                    {post.username}
                                                    {isConnected && (
                                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">LIVE</span>
                                                    )}
                                                </h3>
                                                <p className="text-purple-300 text-sm">
                                                    {post.zodiac_signs?.western || post.zodiac} • {formatTimeAgo(post.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        {post.engagement && (
                                            <div className="text-right text-xs text-purple-400">
                                                ❤️ {post.engagement.likes} 💬 {post.engagement.comments}
                                            </div>
                                        )}
                                    </div>

                                    {/* Enhanced Post Content */}
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
                                                        <h4 className="text-purple-200 font-bold mb-2 flex items-center gap-2">
                                                            {post.content.card_name}
                                                            {post.content.spread_type && (
                                                                <span className="text-xs bg-purple-600/30 px-2 py-1 rounded">
                                                                    {post.content.spread_type.replace('_', ' ')}
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-white text-sm leading-relaxed">
                                                            {post.content.interpretation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : post.type === 'cosmic_event' ? (
                                        <div className="cosmic-event bg-gradient-to-br from-indigo-800/50 to-purple-800/50 p-4 rounded-xl border border-indigo-400/30 mb-4">
                                            <h4 className="text-indigo-200 font-bold mb-2 flex items-center gap-2">
                                                🌟 {post.content.event_name}
                                                <span className="text-xs bg-indigo-600/30 px-2 py-1 rounded">
                                                    {new Date(post.content.date).toLocaleDateString()}
                                                </span>
                                            </h4>
                                            <p className="text-white text-sm leading-relaxed">
                                                {post.content.description}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-purple-900/30 p-4 rounded-xl mb-4">
                                            <p className="text-white leading-relaxed">{post.content}</p>
                                        </div>
                                    )}

                                    {/* Enhanced Cosmic Energy Indicators */}
                                    <div className="cosmic-indicators flex flex-wrap gap-3 pt-4 border-t border-purple-500/30">
                                        <span className="flex items-center gap-2 text-purple-300 cosmic-text text-sm">
                                            ✨ {post.zodiac_signs?.western || post.zodiac} Energy
                                        </span>
                                        {post.zodiac_signs?.galactic_tone && (
                                            <span className="flex items-center gap-2 text-purple-300 cosmic-text text-sm">
                                                🎵 Tone {post.zodiac_signs.galactic_tone}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-2 text-purple-300 cosmic-text text-sm">
                                            🌟 {post.type.replace('_', ' ')}
                                        </span>
                                        {post.engagement && (
                                            <span className="flex items-center gap-2 text-purple-300 cosmic-text text-sm">
                                                💫 {post.engagement.likes + post.engagement.comments} interactions
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Enhanced Infinite Scroll Trigger */}
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
                                    {virtualData && (
                                        <div className="text-xs text-purple-400 mt-2">
                                            Virtual scrolling: {virtualData.startIndex}-{virtualData.endIndex} of {virtualData.totalCount}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* End of Feed with Personalization Suggestions */}
                            {!hasMore && feed.length > 0 && (
                                <motion.div
                                    className="text-center py-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="text-purple-300 text-lg mb-4">
                                        ✨ You've explored the cosmic depths ✨
                                    </div>
                                    <p className="text-purple-400 text-sm mb-4">
                                        Navigate to other planets or try personalized filters to discover more content
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={handlePersonalizedFeed}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white text-sm transition-colors"
                                        >
                                            🎯 Personalized Feed
                                        </button>
                                        <button
                                            onClick={() => handleFilterChange({})}
                                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white text-sm transition-colors"
                                        >
                                            🌊 All Content
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {/* Floating Cosmic Energy Indicator */}
                <motion.div
                    className="fixed bottom-8 right-8 pointer-events-none z-40"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{
                        delay: 0.5,
                        type: "spring",
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                    }}
                >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl cosmic-text bg-purple-900/30 backdrop-blur border border-purple-500/30">
                        🔮
                    </div>
                </motion.div>
            </div>
        </CosmicPageWrapper>
    );
};

export default CosmicFeedEnhanced;