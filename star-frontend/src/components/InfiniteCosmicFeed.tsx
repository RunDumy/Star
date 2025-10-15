import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Star, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import '../styles/InfiniteCosmicFeed.css';
import { CosmicPost3D } from './CosmicPost3D';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Post {
    id: number;
    content: string;
    username: string;
    zodiac_sign: string;
    image_url?: string;
    spark_count: number;
    echo_count: number;
    comment_count: number;
    created_at: string;
    user_id: string;
}

interface InfiniteCosmicFeedProps {
    initialPosts?: Post[];
    filters?: {
        zodiacSigns?: string[];
        elements?: string[];
        contentTypes?: string[];
    };
}const POSTS_PER_PAGE = 10;
const COSMIC_LOADING_MESSAGES = [
    "Scanning the cosmic frequencies...",
    "Aligning with stellar energies...",
    "Downloading universal wisdom...",
    "Synchronizing with the void...",
    "Channeling astral vibrations...",
    "Connecting to the cosmic grid..."
];

export const InfiniteCosmicFeed: React.FC<InfiniteCosmicFeedProps> = ({
    initialPosts = [],
    filters = {}
}) => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scrollY, setScrollY] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState(COSMIC_LOADING_MESSAGES[0]);

    // Intersection observer for infinite scroll
    const { ref: infiniteScrollRef, inView } = useInView({
        threshold: 0.1,
        rootMargin: '100px'
    });

    // Track scroll for parallax effects
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Rotate loading messages
    useEffect(() => {
        if (!loading) return;

        const interval = setInterval(() => {
            setLoadingMessage(prev => {
                const currentIndex = COSMIC_LOADING_MESSAGES.indexOf(prev);
                const nextIndex = (currentIndex + 1) % COSMIC_LOADING_MESSAGES.length;
                return COSMIC_LOADING_MESSAGES[nextIndex];
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [loading]);

    const loadMorePosts = useCallback(async () => {
        if (loading || !hasNextPage) return;

        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('auth_token');
            const params = {
                page: page + 1,
                limit: POSTS_PER_PAGE,
                ...filters
            };

            const response = await axios.get(`${API_URL}/api/v1/posts`, {
                params,
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            });

            if (response.data.success) {
                const newPosts = response.data.posts || [];

                if (newPosts.length === 0) {
                    setHasNextPage(false);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                    setPage(prev => prev + 1);

                    // Check if we got fewer posts than requested (indicates last page)
                    if (newPosts.length < POSTS_PER_PAGE) {
                        setHasNextPage(false);
                    }
                }
            } else {
                throw new Error(response.data.error || 'Failed to load posts');
            }
        } catch (err: any) {
            console.error('Error loading posts:', err);
            setError('Failed to load more cosmic transmissions');

            // Retry logic for network errors
            if (err.code === 'NETWORK_ERROR') {
                setTimeout(() => loadMorePosts(), 3000);
            }
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasNextPage, filters]);

    // Load more posts when scrolling to bottom
    useEffect(() => {
        if (inView && hasNextPage && !loading) {
            loadMorePosts();
        }
    }, [inView, hasNextPage, loading, loadMorePosts]);

    const refreshFeed = useCallback(async () => {
        setPosts([]);
        setPage(1);
        setHasNextPage(true);
        setError(null);

        // Reset and load first page
        await loadMorePosts();
    }, [loadMorePosts]);

    return (
        <div
            className="infinite-cosmic-feed relative min-h-screen"
            data-scroll-y={scrollY}
        >
            {/* 3D Cosmic Background */}
            <CosmicBackground scrollY={scrollY} />

            {/* Main Feed Container */}
            <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

                {/* Feed Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-white mb-4 cosmic-glow">
                        🌌 Infinite Cosmic Feed
                    </h1>
                    <p className="text-purple-300 text-lg">
                        Endless streams of consciousness across the digital cosmos
                    </p>

                    {/* Feed Controls */}
                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            onClick={refreshFeed}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Refresh Cosmos
                        </button>
                    </div>
                </motion.header>

                {/* Posts Feed */}
                <div className="space-y-8">
                    <AnimatePresence>
                        {posts.map((post, index) => (
                            <motion.div
                                key={`post-${post.id}-${index}`}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                className="cosmic-post-wrapper"
                                data-animation-delay={index * 100}
                            >
                                <CosmicPost3D
                                    post={post}
                                    index={index}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Loading Indicator */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-12"
                        >
                            <CosmicLoader message={loadingMessage} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8"
                    >
                        <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-6 max-w-md mx-auto">
                            <Zap className="w-8 h-8 text-red-400 mx-auto mb-3" />
                            <p className="text-red-200 mb-4">{error}</p>
                            <button
                                onClick={loadMorePosts}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
                            >
                                Retry Transmission
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* End of Feed Indicator */}
                {!hasNextPage && posts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="cosmic-end-indicator">
                            <Star className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-xl text-white mb-2">You've Reached the Edge of the Known Universe</h3>
                            <p className="text-purple-300 mb-6">
                                All cosmic transmissions have been received. New energies await discovery.
                            </p>
                            <button
                                onClick={refreshFeed}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                            >
                                <Sparkles className="inline w-5 h-5 mr-2" />
                                Scan for New Frequencies
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Infinite Scroll Trigger */}
                <div
                    ref={infiniteScrollRef}
                    className="h-20 flex items-center justify-center"
                >
                    {hasNextPage && !loading && (
                        <div className="text-purple-400 text-sm">
                            Approaching the event horizon...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Cosmic Background Component
const CosmicBackground: React.FC<{ scrollY: number }> = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating cosmic particles */}
        <div className="cosmic-particle particle-1" />
        <div className="cosmic-particle particle-2" />
        <div className="cosmic-particle particle-3" />

        {/* Nebula background */}
        <div className="cosmic-nebula nebula-1" />
        <div className="cosmic-nebula nebula-2" />
        <div className="cosmic-nebula nebula-3" />

        {/* Dynamic star field */}
        <div className="absolute inset-0 cosmic-star-field"></div>
    </div>
);

// Enhanced Cosmic Loader Component
const CosmicLoader: React.FC<{ message: string }> = ({ message }) => (
    <div className="cosmic-loader-container">
        <div className="relative">
            {/* Outer rotation ring */}
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>

            {/* Inner pulsing core */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-purple-400 rounded-full animate-pulse opacity-60"></div>

            {/* Orbiting particles */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {Array.from({ length: 3 }, (_, i) => `orbit-${Date.now()}-${i}`).map((orbitId, i) => (
                    <div
                        key={orbitId}
                        className={`absolute w-2 h-2 bg-pink-400 rounded-full orbit-animation orbit-delay-${i}`}
                    />
                ))}
            </div>
        </div>

        <motion.p
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-purple-200 mt-4 font-medium"
        >
            {message}
        </motion.p>

        <div className="flex justify-center mt-3 space-x-1">
            {Array.from({ length: 3 }, (_, i) => `bounce-${Date.now()}-${i}`).map((bounceId, i) => (
                <div
                    key={bounceId}
                    className={`w-2 h-2 bg-purple-400 rounded-full animate-bounce bounce-delay-${i}`}
                />
            ))}
        </div>
    </div>
);

export default InfiniteCosmicFeed;