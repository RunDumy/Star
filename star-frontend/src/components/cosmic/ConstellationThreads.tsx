import { ArrowPathIcon, ChatBubbleLeftIcon, ChevronRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';

interface ZodiacSign {
    western: string;
    chinese?: string;
    galactic_tone?: number;
}

interface ConstellationPost {
    id: string;
    userId: string;
    username: string;
    avatar?: string;
    content: string;
    zodiacSign: ZodiacSign;
    timestamp: string;
    likes: number;
    replies: number;
    reposts: number;
    isLiked: boolean;
    isRepost: boolean;
    originalPost?: ConstellationPost;
    parentId?: string;
    threadId: string;
    constellationPath: string[]; // Array of zodiac signs in the thread path
    elementalResonance: 'fire' | 'water' | 'air' | 'earth';
    cosmicDepth: number; // Thread nesting level
}

interface ConstellationThread {
    id: string;
    rootPost: ConstellationPost;
    posts: ConstellationPost[];
    constellationPattern: string; // e.g., "Scorpio→Pisces→Cancer" (water signs connecting)
    elementalFlow: string; // e.g., "water→fire→earth"
    totalPosts: number;
    activeUsers: number;
    cosmicEnergy: number; // 0-100 thread activity score
}

interface ConstellationThreadsProps {
    threads: ConstellationThread[];
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
}

const ConstellationThreads: React.FC<ConstellationThreadsProps> = ({
    threads,
    onLoadMore,
    hasMore,
    loading
}) => {
    const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
    const [selectedPost, setSelectedPost] = useState<string | null>(null);

    // Zodiac sign mappings
    const getZodiacEmoji = (sign: string) => {
        const emojiMap: { [key: string]: string } = {
            'aries': '♈', 'taurus': '♉', 'gemini': '♊', 'cancer': '♋',
            'leo': '♌', 'virgo': '♍', 'libra': '♎', 'scorpio': '♏',
            'sagittarius': '♐', 'capricorn': '♑', 'aquarius': '♒', 'pisces': '♓'
        };
        return emojiMap[sign.toLowerCase()] || '⭐';
    };

    // Elemental colors
    const getElementalColor = (element: string) => {
        const colorMap = {
            fire: 'from-red-500 to-orange-500',
            water: 'from-blue-500 to-cyan-500',
            air: 'from-yellow-500 to-purple-500',
            earth: 'from-green-500 to-amber-500'
        };
        return colorMap[element as keyof typeof colorMap] || 'from-purple-500 to-pink-500';
    };

    // Constellation line pattern based on zodiac connections
    const getConstellationLines = (constellationPath: string[]) => {
        const positions = constellationPath.map((_, index) => ({
            x: 20 + (index * 60),
            y: 20 + Math.sin(index * 0.7) * 15
        }));

        return positions.map((pos, index) => (
            index > 0 && {
                x1: positions[index - 1].x,
                y1: positions[index - 1].y,
                x2: pos.x,
                y2: pos.y
            }
        )).filter(Boolean);
    };

    // Toggle thread expansion
    const toggleThread = useCallback((threadId: string) => {
        setExpandedThreads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(threadId)) {
                newSet.delete(threadId);
            } else {
                newSet.add(threadId);
            }
            return newSet;
        });
    }, []);

    // Handle post interactions
    const handleLike = async (postId: string) => {
        try {
            // API call to like/unlike post
            console.log(`Liking post ${postId}`);
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };

    const handleReply = (postId: string) => {
        setSelectedPost(postId);
        // Open reply composer
    };

    const handleRepost = async (postId: string) => {
        try {
            // API call to repost
            console.log(`Reposting ${postId}`);
        } catch (error) {
            console.error('Failed to repost:', error);
        }
    };

    // Format relative time
    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    // Render individual post
    const renderPost = (post: ConstellationPost, isRoot = false, depth = 0) => {
        const indentLevel = Math.min(depth * 12, 48); // Max indent of 48px

        return (
            <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`relative ${depth > 0 ? 'ml-' + indentLevel : ''}`}
            >
                {/* Thread connection line for replies */}
                {depth > 0 && (
                    <div
                        className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b opacity-30"
                        style={{
                            background: `linear-gradient(to bottom, ${getElementalColor(post.elementalResonance)})`
                        }}
                    />
                )}

                <div className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-purple-500/50 transition-colors ${isRoot ? 'border-l-4' : ''}`}
                    style={isRoot ? { borderLeftColor: `var(--${post.elementalResonance}-500)` } : {}}>

                    {/* Post Header */}
                    <div className="flex items-start space-x-3">
                        <div className="relative">
                            <img
                                src={post.avatar || '/default-avatar.png'}
                                alt={post.username}
                                className="w-10 h-10 rounded-full border-2"
                                style={{ borderColor: `var(--${post.elementalResonance}-400)` }}
                            />

                            {/* Zodiac indicator */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-xs">
                                {getZodiacEmoji(post.zodiacSign.western)}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* User info */}
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-white truncate">
                                    {post.username}
                                </span>
                                <div className="flex items-center space-x-1 text-sm text-gray-400">
                                    <span>{getZodiacEmoji(post.zodiacSign.western)}</span>
                                    {post.zodiacSign.chinese && (
                                        <span className="text-purple-300">{post.zodiacSign.chinese}</span>
                                    )}
                                    {post.zodiacSign.galactic_tone && (
                                        <span className="text-purple-400">T{post.zodiacSign.galactic_tone}</span>
                                    )}
                                </div>
                                <span className="text-gray-500 text-sm">
                                    {formatTimeAgo(post.timestamp)}
                                </span>
                            </div>

                            {/* Post content */}
                            <div className="mt-2">
                                {post.isRepost && post.originalPost && (
                                    <div className="mb-2 p-2 border-l-2 border-gray-600 bg-gray-800/30 rounded">
                                        <div className="text-gray-400 text-sm mb-1 flex items-center">
                                            <ArrowPathIcon className="w-4 h-4 mr-1" />
                                            Reposted from @{post.originalPost.username}
                                        </div>
                                        <p className="text-gray-300 text-sm">{post.originalPost.content}</p>
                                    </div>
                                )}

                                <p className="text-white leading-relaxed">
                                    {post.content}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Post Actions */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            {/* Reply */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReply(post.id)}
                                className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                <span className="text-sm">{post.replies}</span>
                            </motion.button>

                            {/* Repost */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRepost(post.id)}
                                className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                <span className="text-sm">{post.reposts}</span>
                            </motion.button>

                            {/* Like */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center space-x-1 transition-colors ${post.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                                    }`}
                            >
                                {post.isLiked ? (
                                    <HeartSolidIcon className="w-5 h-5" />
                                ) : (
                                    <HeartIcon className="w-5 h-5" />
                                )}
                                <span className="text-sm">{post.likes}</span>
                            </motion.button>
                        </div>

                        {/* Cosmic depth indicator */}
                        {depth > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <span>Depth:</span>
                                <div className="flex space-x-0.5">
                                    {Array.from({ length: Math.min(depth, 5) }, (_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 h-3 rounded-full bg-gradient-to-t"
                                            style={{
                                                background: `linear-gradient(to top, ${getElementalColor(post.elementalResonance)})`
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render thread with constellation visualization
    const renderThread = (thread: ConstellationThread) => {
        const isExpanded = expandedThreads.has(thread.id);
        const visiblePosts = isExpanded ? thread.posts : thread.posts.slice(0, 3);

        return (
            <motion.div
                key={thread.id}
                layout
                className="mb-6"
            >
                {/* Thread Header with Constellation Pattern */}
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-sm">✦</span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Constellation Thread</h3>
                                <p className="text-gray-300 text-sm">
                                    Pattern: {thread.constellationPattern} • Energy: {thread.cosmicEnergy}%
                                </p>
                            </div>
                        </div>

                        <div className="text-right text-sm text-gray-400">
                            <div>{thread.totalPosts} posts</div>
                            <div>{thread.activeUsers} cosmic beings</div>
                        </div>
                    </div>

                    {/* Constellation Visualization */}
                    <div className="relative h-16 bg-black/30 rounded-lg overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full">
                            {/* Constellation lines */}
                            {getConstellationLines(thread.rootPost.constellationPath).map((line, index) => (
                                line && (
                                    <motion.line
                                        key={index}
                                        x1={line.x1}
                                        y1={line.y1}
                                        x2={line.x2}
                                        y2={line.y2}
                                        stroke="url(#constellationGradient)"
                                        strokeWidth="2"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.7 }}
                                        transition={{ delay: index * 0.2 }}
                                    />
                                )
                            ))}

                            {/* Zodiac nodes */}
                            {thread.rootPost.constellationPath.map((sign, index) => (
                                <motion.circle
                                    key={`${sign}-${index}`}
                                    cx={20 + (index * 60)}
                                    cy={20 + Math.sin(index * 0.7) * 15}
                                    r="8"
                                    fill={`var(--${getElementFromZodiac(sign)}-500)`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.3 }}
                                />
                            ))}

                            {/* Gradient definitions */}
                            <defs>
                                <linearGradient id="constellationGradient">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Floating zodiac symbols */}
                        {thread.rootPost.constellationPath.map((sign, index) => (
                            <motion.div
                                key={`symbol-${sign}-${index}`}
                                className="absolute text-white text-xs font-bold"
                                style={{
                                    left: `${15 + (index * 60)}px`,
                                    top: `${15 + Math.sin(index * 0.7) * 15}px`
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.4 }}
                            >
                                {getZodiacEmoji(sign)}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Root Post */}
                {renderPost(thread.rootPost, true, 0)}

                {/* Thread Posts */}
                <AnimatePresence>
                    <div className="mt-4 space-y-3">
                        {visiblePosts.map((post, index) => (
                            renderPost(post, false, post.cosmicDepth || 1)
                        ))}
                    </div>
                </AnimatePresence>

                {/* Expand/Collapse Thread */}
                {thread.posts.length > 3 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleThread(thread.id)}
                        className="mt-4 w-full p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 transition-colors flex items-center justify-center space-x-2 text-gray-300"
                    >
                        <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <span>
                            {isExpanded
                                ? 'Collapse thread'
                                : `Show ${thread.posts.length - 3} more cosmic responses`
                            }
                        </span>
                    </motion.button>
                )}
            </motion.div>
        );
    };

    // Helper function to get element from zodiac sign
    const getElementFromZodiac = (sign: string): string => {
        const elementMap: { [key: string]: string } = {
            'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
            'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
            'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
            'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
        };
        return elementMap[sign.toLowerCase()] || 'fire';
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-center space-x-3 mb-2"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold">✦</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Constellation Threads</h1>
                </motion.div>
                <p className="text-gray-400 text-sm">
                    Cosmic conversations connected by astrological resonance
                </p>
            </div>

            {/* Threads */}
            <div className="space-y-6">
                {threads.map(renderThread)}
            </div>

            {/* Load More */}
            {hasMore && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLoadMore}
                    disabled={loading}
                    className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
                >
                    {loading ? 'Loading more threads...' : 'Discover more constellations'}
                </motion.button>
            )}
        </div>
    );
};

export default ConstellationThreads;
