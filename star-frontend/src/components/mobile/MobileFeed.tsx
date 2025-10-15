/**
 * Mobile-Responsive Social Feed Component
 * Optimized infinite scroll feed with touch gestures and performance optimizations
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDeviceDetection, useMobileOptimization, useTouchGestures } from '../../lib/MobileOptimization';

// Feed item interfaces
interface FeedItem {
    id: string;
    type: 'post' | 'tarot' | 'numerology' | 'music' | 'badge';
    author: {
        id: string;
        name: string;
        zodiacSign: string;
        avatar?: string;
    };
    content: {
        text?: string;
        images?: string[];
        tarotCards?: any[];
        numerologyData?: any;
        musicTrack?: any;
        badgeEarned?: any;
    };
    interactions: {
        likes: number;
        comments: number;
        shares: number;
        zodiacReactions: { [key: string]: number };
    };
    timestamp: Date;
    energy?: number;
    element?: 'fire' | 'water' | 'air' | 'earth' | 'spirit';
}

interface MobileFeedProps {
    items?: FeedItem[];
    onLoadMore?: () => Promise<FeedItem[]>;
    onItemInteract?: (itemId: string, action: string) => void;
    className?: string;
}

export const MobileFeed: React.FC<MobileFeedProps> = ({
    items = [],
    onLoadMore,
    onItemInteract,
    className = ''
}) => {
    const deviceInfo = useDeviceDetection();
    const { getFeedConfig, throttle, debounce } = useMobileOptimization();
    const feedConfig = getFeedConfig();

    // Feed state
    const [feedItems, setFeedItems] = useState<FeedItem[]>(items);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Refs for infinite scroll
    const feedRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Load more items
    const loadMoreItems = useCallback(async () => {
        if (loading || !onLoadMore || !hasMore) return;

        setLoading(true);
        try {
            const newItems = await onLoadMore();
            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                setFeedItems(prev => [...prev, ...newItems]);
            }
        } catch (error) {
            console.error('Failed to load more items:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, onLoadMore, hasMore]);

    // Throttled load more for performance
    const throttledLoadMore = useCallback(
        throttle(loadMoreItems, deviceInfo.isMobile ? 1000 : 500),
        [loadMoreItems, deviceInfo.isMobile]
    );

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    throttledLoadMore();
                }
            },
            {
                threshold: feedConfig.infiniteScrollThreshold,
                rootMargin: '50px'
            }
        );

        observerRef.current.observe(loadMoreRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [throttledLoadMore, feedConfig.infiniteScrollThreshold]);

    // Touch gesture handling
    const handleGesture = useCallback((itemId: string, gesture: any) => {
        switch (gesture.type) {
            case 'swipe':
                if (gesture.direction === 'left') {
                    // Quick like
                    onItemInteract?.(itemId, 'like');
                } else if (gesture.direction === 'right') {
                    // Quick share
                    onItemInteract?.(itemId, 'share');
                }
                break;

            case 'doubleTap':
                // Double tap to like
                onItemInteract?.(itemId, 'like');
                break;

            case 'longPress':
                // Show interaction menu
                setSelectedItem(itemId);
                break;
        }
    }, [onItemInteract]);

    // Feed item component
    const FeedItemComponent: React.FC<{ item: FeedItem; index: number }> = ({ item, index }) => {
        const touchHandlers = useTouchGestures((gesture) => handleGesture(item.id, gesture));
        const [imageLoaded, setImageLoaded] = useState(false);
        const [expanded, setExpanded] = useState(false);

        // Lazy load images based on device
        const shouldLoadImage = index < feedConfig.preloadImages || imageLoaded;

        return (
            <div
                className={`
          feed-item relative mb-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg
          ${deviceInfo.isMobile ? 'p-3' : 'p-4'}
          ${selectedItem === item.id ? 'ring-2 ring-blue-400' : ''}
          transition-all duration-200 hover:bg-opacity-15
        `}
                {...touchHandlers}
            >
                {/* Author header */}
                <div className="flex items-center space-x-3 mb-3">
                    <div className={`
            w-10 h-10 rounded-full bg-gradient-to-r
            ${getZodiacGradient(item.author.zodiacSign)}
            flex items-center justify-center text-white font-bold
            ${deviceInfo.isMobile ? 'text-sm' : 'text-base'}
          `}>
                        {item.author.avatar ? (
                            <img
                                src={item.author.avatar}
                                alt={item.author.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            getZodiacEmoji(item.author.zodiacSign)
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">{item.author.name}</span>
                            <span className="text-xs text-gray-300">{item.author.zodiacSign}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            {formatTimestamp(item.timestamp)}
                        </div>
                    </div>

                    {/* Energy indicator */}
                    {item.energy && (
                        <div className="text-xs bg-white bg-opacity-20 rounded-full px-2 py-1">
                            ⚡ {item.energy}%
                        </div>
                    )}
                </div>

                {/* Content based on type */}
                {renderContent(item, shouldLoadImage, expanded, setExpanded, deviceInfo)}

                {/* Interaction bar */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white border-opacity-20">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => onItemInteract?.(item.id, 'like')}
                            className="flex items-center space-x-1 text-gray-300 hover:text-red-400 transition-colors"
                        >
                            <span>❤️</span>
                            <span className="text-sm">{item.interactions.likes}</span>
                        </button>

                        <button
                            onClick={() => onItemInteract?.(item.id, 'comment')}
                            className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition-colors"
                        >
                            <span>💬</span>
                            <span className="text-sm">{item.interactions.comments}</span>
                        </button>

                        <button
                            onClick={() => onItemInteract?.(item.id, 'share')}
                            className="flex items-center space-x-1 text-gray-300 hover:text-green-400 transition-colors"
                        >
                            <span>🔄</span>
                            <span className="text-sm">{item.interactions.shares}</span>
                        </button>
                    </div>

                    {/* Zodiac reactions */}
                    <div className="flex items-center space-x-1">
                        {Object.entries(item.interactions.zodiacReactions).slice(0, 3).map(([zodiac, count]) => (
                            <div key={zodiac} className="flex items-center text-xs">
                                <span>{getZodiacEmoji(zodiac)}</span>
                                <span className="ml-1 text-gray-400">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile swipe indicators */}
                {deviceInfo.isMobile && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-400 to-pink-400 opacity-0 pointer-events-none" />
                )}
            </div>
        );
    };

    return (
        <div className={`mobile-feed ${className}`} ref={feedRef}>
            {/* Feed items */}
            <div className="space-y-4">
                {feedItems.map((item, index) => (
                    <FeedItemComponent key={item.id} item={item} index={index} />
                ))}
            </div>

            {/* Load more trigger */}
            {hasMore && (
                <div ref={loadMoreRef} className="py-8 text-center">
                    {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" />
                            <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-100" />
                            <div className="w-4 h-4 bg-pink-400 rounded-full animate-pulse delay-200" />
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm">Scroll for more cosmic content...</div>
                    )}
                </div>
            )}

            {/* Interaction menu modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div className="bg-gray-900 rounded-lg p-6 max-w-xs w-full">
                        <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {['like', 'comment', 'share', 'save'].map((action) => (
                                <button
                                    key={action}
                                    onClick={() => {
                                        onItemInteract?.(selectedItem, action);
                                        setSelectedItem(null);
                                    }}
                                    className="p-3 bg-white bg-opacity-10 rounded-lg text-white capitalize hover:bg-opacity-20 transition-colors"
                                >
                                    {getActionEmoji(action)} {action}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile performance indicator */}
            {deviceInfo.isMobile && process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-20 right-4 bg-black bg-opacity-50 rounded p-2 text-white text-xs z-40">
                    <div>Items: {feedItems.length}</div>
                    <div>Loading: {loading ? '✅' : '❌'}</div>
                    <div>Quality: {feedConfig.imageQuality}</div>
                </div>
            )}
        </div>
    );
};

// Helper functions
const getZodiacGradient = (zodiacSign: string): string => {
    const gradients: { [key: string]: string } = {
        aries: 'from-red-500 to-orange-500',
        taurus: 'from-green-500 to-emerald-500',
        gemini: 'from-yellow-500 to-amber-500',
        cancer: 'from-blue-500 to-cyan-500',
        leo: 'from-yellow-400 to-orange-400',
        virgo: 'from-green-400 to-teal-400',
        libra: 'from-pink-500 to-rose-500',
        scorpio: 'from-purple-600 to-indigo-600',
        sagittarius: 'from-orange-500 to-red-500',
        capricorn: 'from-gray-600 to-slate-600',
        aquarius: 'from-cyan-500 to-blue-500',
        pisces: 'from-purple-400 to-pink-400'
    };
    return gradients[zodiacSign.toLowerCase()] || 'from-gray-500 to-gray-600';
};

const getZodiacEmoji = (zodiacSign: string): string => {
    const emojis: { [key: string]: string } = {
        aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
        leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
        sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓'
    };
    return emojis[zodiacSign.toLowerCase()] || '⭐';
};

const getActionEmoji = (action: string): string => {
    const emojis: { [key: string]: string } = {
        like: '❤️', comment: '💬', share: '🔄', save: '⭐'
    };
    return emojis[action] || '✨';
};

const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const renderContent = (
    item: FeedItem,
    shouldLoadImage: boolean,
    expanded: boolean,
    setExpanded: (expanded: boolean) => void,
    deviceInfo: any
) => {
    switch (item.type) {
        case 'post':
            return (
                <div className="space-y-3">
                    {item.content.text && (
                        <div className="text-white">
                            {expanded || item.content.text.length < 200 ? (
                                item.content.text
                            ) : (
                                <>
                                    {item.content.text.slice(0, 200)}...
                                    <button
                                        onClick={() => setExpanded(true)}
                                        className="text-blue-400 ml-2 hover:underline"
                                    >
                                        Read more
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {item.content.images && shouldLoadImage && (
                        <div className={`grid gap-2 ${item.content.images.length > 1 ? 'grid-cols-2' : ''}`}>
                            {item.content.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Content ${index + 1}`}
                                    className="rounded-lg w-full object-cover"
                                    style={{ maxHeight: deviceInfo.isMobile ? '200px' : '300px' }}
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    )}
                </div>
            );

        case 'tarot':
            return (
                <div className="tarot-content p-4 bg-purple-900 bg-opacity-30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">🔮</span>
                        <span className="text-purple-300 font-semibold">Tarot Reading</span>
                    </div>
                    {item.content.tarotCards && (
                        <div className="grid grid-cols-3 gap-2">
                            {item.content.tarotCards.slice(0, 3).map((card: any, index: number) => (
                                <div key={index} className="text-center">
                                    <div className="w-16 h-24 bg-gradient-to-b from-purple-600 to-indigo-700 rounded-lg mb-1" />
                                    <div className="text-xs text-gray-300">{card.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );

        case 'numerology':
            return (
                <div className="numerology-content p-4 bg-yellow-900 bg-opacity-30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">🔢</span>
                        <span className="text-yellow-300 font-semibold">Numerology Insight</span>
                    </div>
                    <div className="text-white text-sm">
                        Life Path Number: <span className="font-bold text-yellow-400">{item.content.numerologyData?.lifePathNumber || 'N/A'}</span>
                    </div>
                </div>
            );

        case 'music':
            return (
                <div className="music-content p-4 bg-pink-900 bg-opacity-30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">🎵</span>
                        <span className="text-pink-300 font-semibold">Cosmic Track</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg" />
                        <div className="flex-1">
                            <div className="text-white font-semibold">{item.content.musicTrack?.name || 'Unknown Track'}</div>
                            <div className="text-gray-300 text-sm">{item.content.musicTrack?.artist || 'Unknown Artist'}</div>
                        </div>
                    </div>
                </div>
            );

        case 'badge':
            return (
                <div className="badge-content p-4 bg-green-900 bg-opacity-30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">🏆</span>
                        <span className="text-green-300 font-semibold">Badge Earned!</span>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-2" />
                        <div className="text-white font-semibold">{item.content.badgeEarned?.name || 'Achievement'}</div>
                    </div>
                </div>
            );

        default:
            return <div className="text-gray-400">Unknown content type</div>;
    }
};

export default MobileFeed;