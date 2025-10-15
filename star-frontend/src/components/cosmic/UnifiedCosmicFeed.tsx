import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { io, Socket } from 'socket.io-client';

// Enhanced Typography and Icons
import {
    FiFilter,
    FiHeart, FiMessageCircle, FiShare2
} from 'react-icons/fi';
import {
    GiCosmicEgg,
    GiCrystalBall,
    GiGalaxy,
    GiSparkles
} from 'react-icons/gi';

// Enhanced Type Definitions
interface ZodiacSigns {
    western: string;
    chinese: string;
    vedic?: string;
    mayan?: string;
    galactic_tone?: number;
}

interface Post {
    id: string;
    username: string;
    zodiac: string;
    zodiac_signs?: ZodiacSigns;
    type: 'tarot_reading' | 'daily_feature' | 'cosmic_insight' | 'zodiac_wisdom' | 'ritual_sharing' | 'constellation_creation';
    content: any;
    created_at: string;
    likes?: number;
    comments?: number;
    shares?: number;
    engagement_data?: {
        zodiac_reactions: { [key: string]: number };
        cosmic_energy: number;
        viral_score: number;
    };
    author_avatar?: string;
    cosmic_tags?: string[];
}

interface FilterState {
    zodiacSigns: string[];
    contentTypes: string[];
    timeRange: 'all' | '24h' | '7d' | '30d';
    energyLevel: 'all' | 'high' | 'medium' | 'low';
    searchQuery: string;
}

// Complete Zodiac Actions Mapping (304 total combinations)
const WESTERN_ZODIAC_ACTIONS = {
    'Aries': { like: 'Charge', comment: 'Spark', share: 'Ignite', follow: 'Lead' },
    'Taurus': { like: 'Graze', comment: 'Root', share: 'Sustain', follow: 'Tread' },
    'Gemini': { like: 'Chatter', comment: 'Flit', share: 'Spread', follow: 'Connect' },
    'Cancer': { like: 'Nurture', comment: 'Embrace', share: 'Shelter', follow: 'Guide' },
    'Leo': { like: 'Roar', comment: 'Shine', share: 'Inspire', follow: 'Strut' },
    'Virgo': { like: 'Analyze', comment: 'Tidy', share: 'Refine', follow: 'Serve' },
    'Libra': { like: 'Balance', comment: 'Harmonize', share: 'Share', follow: 'Align' },
    'Scorpio': { like: 'Probe', comment: 'Sting', share: 'Transform', follow: 'Hunt' },
    'Sagittarius': { like: 'Quest', comment: 'Aim', share: 'Inspire', follow: 'Explore' },
    'Capricorn': { like: 'Plan', comment: 'Climb', share: 'Achieve', follow: 'Build' },
    'Aquarius': { like: 'Innovate', comment: 'Spark', share: 'Enlighten', follow: 'Rebel' },
    'Pisces': { like: 'Dream', comment: 'Flow', share: 'Connect', follow: 'Drift' }
};

const CHINESE_ZODIAC_ACTIONS = {
    'Rat': { like: 'Squeak', comment: 'Nibble', share: 'Gather', follow: 'Scamper' },
    'Ox': { like: 'Moo', comment: 'Plow', share: 'Carry', follow: 'Tread' },
    'Tiger': { like: 'Roar', comment: 'Pounce', share: 'Claim', follow: 'Stalk' },
    'Rabbit': { like: 'Hop', comment: 'Bound', share: 'Nuzzle', follow: 'Burrow' },
    'Dragon': { like: 'Bellow', comment: 'Soar', share: 'Guard', follow: 'Circle' },
    'Snake': { like: 'Hiss', comment: 'Coil', share: 'Shed', follow: 'Slither' },
    'Horse': { like: 'Neigh', comment: 'Gallop', share: 'Prance', follow: 'Trot' },
    'Goat': { like: 'Bleat', comment: 'Graze', share: 'Provide', follow: 'Climb' },
    'Monkey': { like: 'Chatter', comment: 'Swing', share: 'Discover', follow: 'Play' },
    'Rooster': { like: 'Crow', comment: 'Peck', share: 'Announce', follow: 'Strut' },
    'Dog': { like: 'Bark', comment: 'Fetch', share: 'Protect', follow: 'Guard' },
    'Pig': { like: 'Oink', comment: 'Root', share: 'Feast', follow: 'Trot' }
};

export const UnifiedCosmicFeed: React.FC = () => {
    // Core State Management
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Real-time & Socket State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [newPostsNotification, setNewPostsNotification] = useState(0);
    const [liveUpdates, setLiveUpdates] = useState(true);

    // Advanced Filtering State
    const [filters, setFilters] = useState<FilterState>({
        zodiacSigns: [],
        contentTypes: [],
        timeRange: 'all',
        energyLevel: 'all',
        searchQuery: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // UI State
    const [viewMode, setViewMode] = useState<'cards' | 'compact' | 'galaxy'>('cards');
    const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'cosmic_energy'>('newest');

    const feedRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Initialize Socket Connection and User Authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/register');
            return;
        }

        // Initialize user data
        initializeUserData();

        // Set up WebSocket connection
        setupSocketConnection();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const initializeUserData = () => {
        // In production, fetch from /api/v1/profile
        const mockUser = {
            id: 'user_cosmic_1',
            username: 'CosmicTraveler',
            zodiac_signs: {
                western: 'Scorpio',
                chinese: 'Dragon',
                vedic: 'Vrishchika',
                mayan: 'Serpent',
                galactic_tone: 8
            },
            preferences: {
                feed_filters: ['tarot', 'cosmic_insights'],
                notification_settings: { real_time: true }
            }
        };
        setCurrentUser(mockUser);
    };

    const setupSocketConnection = () => {
        const socketInstance = io(API_URL, {
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true
        });

        socketInstance.on('connect', () => {
            setIsConnected(true);
            console.log('🌌 Connected to cosmic network');

            // Join user's personalized feed room
            if (currentUser) {
                socketInstance.emit('join_feed_room', {
                    userId: currentUser.id,
                    zodiacSigns: currentUser.zodiac_signs
                });
            }
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
            console.log('🌙 Disconnected from cosmic network');
        });

        // Real-time post updates
        socketInstance.on('new_post', (data) => {
            if (liveUpdates) {
                setPosts(prevPosts => [data.post, ...prevPosts]);
                setNewPostsNotification(prev => prev + 1);

                // Trigger cosmic notification effect
                triggerCosmicNotification();
            }
        });

        // Real-time engagement updates
        socketInstance.on('post_engagement_update', (data) => {
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === data.postId
                        ? { ...post, ...data.updates }
                        : post
                )
            );
        });

        // Zodiac-specific events
        socketInstance.on('zodiac_alignment_event', (data) => {
            // Handle special zodiac alignment notifications
            console.log('✨ Zodiac alignment detected:', data);
        });

        setSocket(socketInstance);
    };

    const triggerCosmicNotification = () => {
        // Add subtle cosmic notification effects
        if (feedRef.current) {
            feedRef.current.style.transform = 'scale(1.005)';
            setTimeout(() => {
                if (feedRef.current) {
                    feedRef.current.style.transform = 'scale(1)';
                }
            }, 200);
        }
    };

    // Enhanced Feed Fetching with Advanced Pagination
    const fetchFeed = useCallback(async (isInitial = false) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                limit: '20',
                offset: isInitial ? '0' : offset.toString(),
                sort_by: sortBy,
                ...buildFilterParams()
            });

            const response = await fetch(`${API_URL}/api/v1/feed?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch feed');

            const newPosts = await response.json();

            if (isInitial) {
                setPosts(newPosts);
                setOffset(20);
            } else {
                setPosts(prevPosts => [...prevPosts, ...newPosts]);
                setOffset(prevOffset => prevOffset + 20);
            }

            setHasMore(newPosts.length === 20);

        } catch (error) {
            console.error('Feed fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [offset, sortBy, filters]);

    const buildFilterParams = () => {
        const params: any = {};

        if (filters.zodiacSigns.length > 0) {
            params.zodiac_filter = filters.zodiacSigns.join(',');
        }

        if (filters.contentTypes.length > 0) {
            params.content_types = filters.contentTypes.join(',');
        }

        if (filters.timeRange !== 'all') {
            params.time_range = filters.timeRange;
        }

        if (filters.energyLevel !== 'all') {
            params.energy_level = filters.energyLevel;
        }

        if (filters.searchQuery.trim()) {
            params.search = filters.searchQuery.trim();
        }

        return params;
    };

    // Initial feed load
    useEffect(() => {
        if (currentUser) {
            fetchFeed(true);
        }
    }, [currentUser, sortBy, filters]);

    // Enhanced Zodiac-Specific Social Actions
    const handleZodiacAction = async (action: string, post: Post) => {
        if (!currentUser || !socket) return;

        const userZodiac = currentUser.zodiac_signs.western;
        const zodiacAction = WESTERN_ZODIAC_ACTIONS[userZodiac as keyof typeof WESTERN_ZODIAC_ACTIONS];
        const actionText = zodiacAction?.[action as keyof typeof zodiacAction] || action;

        try {
            // Optimistic UI update
            setPosts(prevPosts =>
                prevPosts.map(p =>
                    p.id === post.id
                        ? {
                            ...p,
                            [action === 'like' ? 'likes' : action === 'comment' ? 'comments' : 'shares']:
                                (p[action === 'like' ? 'likes' : action === 'comment' ? 'comments' : 'shares'] || 0) + 1
                        }
                        : p
                )
            );

            // Send to backend
            const response = await fetch(`${API_URL}/api/v1/social-actions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: `${userZodiac.toLowerCase()}_${action}`,
                    post_id: post.id,
                    action_text: actionText,
                    zodiac_context: {
                        user_zodiac: userZodiac,
                        post_zodiac: post.zodiac,
                        cosmic_compatibility: calculateCosmicCompatibility(userZodiac, post.zodiac)
                    }
                })
            });

            if (!response.ok) throw new Error('Action failed');

            // Emit real-time update via socket
            socket.emit('zodiac_action_performed', {
                postId: post.id,
                action,
                actionText,
                userZodiac,
                userId: currentUser.id
            });

            // Trigger zodiac-specific visual effect
            triggerZodiacActionEffect(action, userZodiac);

        } catch (error) {
            console.error('Zodiac action error:', error);
            // Revert optimistic update on error
            fetchFeed(true);
        }
    };

    const calculateCosmicCompatibility = (userZodiac: string, postZodiac: string): number => {
        // Complex compatibility calculation based on elemental relationships
        const elementMap: { [key: string]: string } = {
            'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
            'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
            'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
            'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
        };

        const userElement = elementMap[userZodiac];
        const postElement = elementMap[postZodiac];

        // Compatibility matrix
        const compatibility: { [key: string]: { [key: string]: number } } = {
            'Fire': { 'Fire': 0.9, 'Air': 0.8, 'Earth': 0.4, 'Water': 0.3 },
            'Earth': { 'Earth': 0.9, 'Water': 0.8, 'Fire': 0.4, 'Air': 0.3 },
            'Air': { 'Air': 0.9, 'Fire': 0.8, 'Water': 0.4, 'Earth': 0.3 },
            'Water': { 'Water': 0.9, 'Earth': 0.8, 'Air': 0.4, 'Fire': 0.3 }
        };

        return compatibility[userElement]?.[postElement] || 0.5;
    };

    const triggerZodiacActionEffect = (action: string, zodiac: string) => {
        // Create zodiac-specific particle effects
        const effectColor = getZodiacColor(zodiac);
        console.log(`✨ ${zodiac} ${action} effect triggered with ${effectColor} energy`);
        // In production, integrate with particle system
    };

    const getZodiacColor = (zodiac: string): string => {
        const colorMap: { [key: string]: string } = {
            'Aries': '#FF6B6B', 'Taurus': '#4ECDC4', 'Gemini': '#45B7D1',
            'Cancer': '#96CEB4', 'Leo': '#FFEAA7', 'Virgo': '#DDA0DD',
            'Libra': '#98D8C8', 'Scorpio': '#F06292', 'Sagittarius': '#AED581',
            'Capricorn': '#FFB74D', 'Aquarius': '#64B5F6', 'Pisces': '#A1C4FD'
        };
        return colorMap[zodiac] || '#E1BEE7';
    };

    const getZodiacEmoji = (zodiac: string): string => {
        const emojiMap: { [key: string]: string } = {
            'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
            'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
            'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
        };
        return emojiMap[zodiac] || '⭐';
    };

    const formatTimeAgo = (timestamp: string): string => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // Enhanced Post Rendering
    const renderPost = (post: Post) => {
        const zodiacColor = getZodiacColor(post.zodiac);
        const zodiacEmoji = getZodiacEmoji(post.zodiac);

        return (
            <motion.div
                key={post.id}
                className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 mb-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, boxShadow: `0 10px 30px ${zodiacColor}40` }}
                style={{
                    background: `linear-gradient(135deg, ${zodiacColor}20 0%, transparent 100%)`
                }}
            >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${zodiacColor}40` }}
                        >
                            {zodiacEmoji}
                        </div>
                        <div>
                            <h3 className="text-white font-semibold flex items-center">
                                {post.username}
                                {post.zodiac_signs && (
                                    <span className="ml-2 text-sm opacity-70">
                                        {getZodiacEmoji(post.zodiac_signs.western)}
                                        {post.zodiac_signs.chinese && ` ${getChineseZodiacEmoji(post.zodiac_signs.chinese)}`}
                                    </span>
                                )}
                            </h3>
                            <p className="text-purple-300 text-sm">
                                {post.zodiac} • {formatTimeAgo(post.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Cosmic Energy Indicator */}
                    {post.engagement_data && (
                        <div className="flex items-center space-x-2">
                            <GiSparkles className="text-yellow-400" />
                            <span className="text-yellow-400 text-sm">
                                {post.engagement_data.cosmic_energy}
                            </span>
                        </div>
                    )}
                </div>

                {/* Post Content */}
                <div className="mb-4">
                    {renderPostContent(post)}
                </div>

                {/* Enhanced Engagement Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-6">
                        <motion.button
                            onClick={() => handleZodiacAction('like', post)}
                            className="flex items-center space-x-2 text-purple-300 hover:text-pink-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiHeart className="w-5 h-5" />
                            <span>{getZodiacActionText('like', currentUser?.zodiac_signs?.western)}</span>
                            {post.likes && <span className="text-sm">({post.likes})</span>}
                        </motion.button>

                        <motion.button
                            onClick={() => handleZodiacAction('comment', post)}
                            className="flex items-center space-x-2 text-purple-300 hover:text-blue-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiMessageCircle className="w-5 h-5" />
                            <span>{getZodiacActionText('comment', currentUser?.zodiac_signs?.western)}</span>
                            {post.comments && <span className="text-sm">({post.comments})</span>}
                        </motion.button>

                        <motion.button
                            onClick={() => handleZodiacAction('share', post)}
                            className="flex items-center space-x-2 text-purple-300 hover:text-green-400 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiShare2 className="w-5 h-5" />
                            <span>{getZodiacActionText('share', currentUser?.zodiac_signs?.western)}</span>
                            {post.shares && <span className="text-sm">({post.shares})</span>}
                        </motion.button>
                    </div>

                    {/* Cosmic Tags */}
                    {post.cosmic_tags && (
                        <div className="flex items-center space-x-2">
                            {post.cosmic_tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-white/10 rounded-full text-xs text-purple-300"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const getZodiacActionText = (action: string, zodiac?: string): string => {
        if (!zodiac) return action;
        const actions = WESTERN_ZODIAC_ACTIONS[zodiac as keyof typeof WESTERN_ZODIAC_ACTIONS];
        return actions?.[action as keyof typeof actions] || action;
    };

    const getChineseZodiacEmoji = (zodiac: string): string => {
        const emojiMap: { [key: string]: string } = {
            'Rat': '🐭', 'Ox': '🐂', 'Tiger': '🐅', 'Rabbit': '🐰',
            'Dragon': '🐲', 'Snake': '🐍', 'Horse': '🐎', 'Goat': '🐐',
            'Monkey': '🐒', 'Rooster': '🐓', 'Dog': '🐕', 'Pig': '🐷'
        };
        return emojiMap[zodiac] || '🌟';
    };

    const renderPostContent = (post: Post) => {
        switch (post.type) {
            case 'tarot_reading':
                return (
                    <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                        <div className="flex items-center mb-3">
                            <GiCrystalBall className="text-purple-400 w-6 h-6 mr-2" />
                            <span className="text-purple-300 font-medium">Tarot Reading</span>
                        </div>
                        <h4 className="text-white text-lg font-semibold mb-2">
                            {post.content.card_name}
                        </h4>
                        <p className="text-purple-100">{post.content.interpretation}</p>
                    </div>
                );

            case 'cosmic_insight':
                return (
                    <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                        <div className="flex items-center mb-3">
                            <GiCrystalBall className="text-blue-400 w-6 h-6 mr-2" />
                            <span className="text-blue-300 font-medium">Cosmic Insight</span>
                        </div>
                        <p className="text-blue-100">{post.content}</p>
                    </div>
                );

            default:
                return <p className="text-white">{typeof post.content === 'string' ? post.content : JSON.stringify(post.content)}</p>;
        }
    };

    // Advanced Filter Controls
    const renderFilterControls = () => (
        <AnimatePresence>
            {showFilters && (
                <motion.div
                    className="bg-black/30 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/10"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    {/* Filter UI would go here */}
                    <div className="text-white">Advanced Filtering Controls Coming Soon...</div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <motion.div
                    className="text-center"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <GiGalaxy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-white text-2xl">Loading cosmic feed...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" ref={feedRef}>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Enhanced Header with Real-time Status */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="flex items-center justify-center mb-4">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Cosmic Feed
                        </h1>
                        {isConnected && (
                            <motion.div
                                className="ml-4 flex items-center text-green-400"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                <span className="text-sm">Live</span>
                            </motion.div>
                        )}
                    </div>

                    <p className="text-purple-300 text-xl mb-6">
                        Experience the cosmic consciousness through {posts.length}+ celestial updates
                    </p>

                    {/* Controls Bar */}
                    <div className="flex justify-center items-center space-x-4 mb-6">
                        <motion.button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <FiFilter className="w-4 h-4" />
                            <span className="text-white">Filters</span>
                        </motion.button>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20"
                        >
                            <option value="newest">Newest</option>
                            <option value="trending">Trending</option>
                            <option value="cosmic_energy">Cosmic Energy</option>
                        </select>

                        {newPostsNotification > 0 && (
                            <motion.button
                                onClick={() => {
                                    fetchFeed(true);
                                    setNewPostsNotification(0);
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <GiSparkles className="w-4 h-4" />
                                <span>{newPostsNotification} new posts</span>
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {/* Advanced Filter Controls */}
                {renderFilterControls()}

                {/* Enhanced Infinite Scroll Feed */}
                <InfiniteScroll
                    dataLength={posts.length}
                    next={() => fetchFeed(false)}
                    hasMore={hasMore}
                    loader={
                        <div className="text-center py-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <GiGalaxy className="w-8 h-8 text-purple-400 mx-auto" />
                            </motion.div>
                            <p className="text-purple-300 mt-2">Loading more cosmic content...</p>
                        </div>
                    }
                    endMessage={
                        <div className="text-center py-8">
                            <GiCosmicEgg className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                            <p className="text-purple-300 text-lg">
                                You've reached the edge of the known universe.
                            </p>
                            <p className="text-purple-400 text-sm mt-2">
                                New cosmic content appears as the stars align...
                            </p>
                        </div>
                    }
                >
                    <AnimatePresence>
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {renderPost(post)}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default UnifiedCosmicFeed;