import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './VirtualFeedSimple.module.css';

interface VirtualFeedProps {
    posts: any[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    onPostClick?: (post: any) => void;
}

interface VirtualizedPostItemProps {
    post: any;
    onPostClick?: (post: any) => void;
}

const VirtualizedPostItem: React.FC<VirtualizedPostItemProps> = ({ post, onPostClick }) => {
    const getZodiacEmoji = (zodiac: string) => {
        const emojiMap: { [key: string]: string } = {
            'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
            'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
            'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
        };
        return emojiMap[zodiac] || '⭐';
    };

    const getMultiZodiacDisplay = (zodiacSigns: any) => {
        if (!zodiacSigns) return getZodiacEmoji(post.zodiac);

        return (
            <div className="flex gap-1 items-center">
                <span title={`Western: ${zodiacSigns.western}`}>
                    {getZodiacEmoji(zodiacSigns.western)}
                </span>
                <span title={`Chinese: ${zodiacSigns.chinese}`} className="text-xs text-purple-300">
                    {zodiacSigns.chinese?.slice(0, 2)}
                </span>
                <span title={`Galactic Tone: ${zodiacSigns.galactic_tone}`} className="text-xs text-purple-400">
                    T{zodiacSigns.galactic_tone}
                </span>
            </div>
        );
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (diff < 60) return 'now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    const renderContent = () => {
        if (post.type === 'tarot_reading') {
            return (
                <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 p-3 rounded-lg border border-purple-400/20">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-12 bg-purple-900/50 rounded flex items-center justify-center text-lg">
                            🔮
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-purple-200 font-semibold text-sm mb-1">
                                {post.content.card_name}
                            </h4>
                            <p className="text-white text-xs leading-relaxed line-clamp-2">
                                {post.content.interpretation}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (post.type === 'cosmic_event') {
            return (
                <div className="bg-gradient-to-r from-indigo-800/30 to-purple-800/30 p-3 rounded-lg border border-indigo-400/20">
                    <h4 className="text-indigo-200 font-semibold text-sm mb-1 flex items-center gap-1">
                        🌟 {post.content.event_name}
                    </h4>
                    <p className="text-white text-xs leading-relaxed line-clamp-2">
                        {post.content.description}
                    </p>
                </div>
            );
        }

        return (
            <div className="bg-purple-900/20 p-3 rounded-lg">
                <p className="text-white text-sm leading-relaxed line-clamp-3">
                    {post.content}
                </p>
            </div>
        );
    };

    return (
        <div className="p-3 virtual-post-item">
            <motion.div
                className="feed-post bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer"
                whileHover={{ scale: 1.01 }}
                onClick={() => onPostClick?.(post)}
                layout
            >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-sm">
                            {getMultiZodiacDisplay(post.zodiac_signs)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-white font-semibold text-sm truncate">
                                {post.username}
                            </h3>
                            <p className="text-purple-300 text-xs">
                                {post.zodiac_signs?.western || post.zodiac} • {formatTimeAgo(post.created_at)}
                            </p>
                        </div>
                    </div>
                    {post.engagement && (
                        <div className="text-xs text-purple-400 flex gap-2">
                            <span>❤️{post.engagement.likes}</span>
                            <span>💬{post.engagement.comments}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    {renderContent()}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                        {post.type.replace('_', ' ')}
                    </span>
                    {post.zodiac_signs?.galactic_tone && (
                        <span className="text-xs bg-pink-600/20 text-pink-300 px-2 py-1 rounded">
                            Tone {post.zodiac_signs.galactic_tone}
                        </span>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const VirtualFeed: React.FC<VirtualFeedProps> = ({
    posts,
    loading,
    hasMore,
    loadMore,
    onPostClick
}) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const containerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 280; // Estimated height per item
    const bufferSize = 10; // Number of items to render outside visible area

    // Calculate visible items based on scroll position
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
        const endIndex = Math.min(
            posts.length,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
        );

        setVisibleRange({ start: startIndex, end: endIndex });

        // Load more when approaching end
        if (hasMore && endIndex > posts.length - 5) {
            loadMore();
        }
    }, [posts.length, hasMore, loadMore, itemHeight, bufferSize]);

    // Throttled scroll handler
    const throttledScroll = useCallback(() => {
        let ticking = false;
        return () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };
    }, [handleScroll]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scrollHandler = throttledScroll();
        container.addEventListener('scroll', scrollHandler);

        // Initial calculation
        handleScroll();

        return () => {
            container.removeEventListener('scroll', scrollHandler);
        };
    }, [throttledScroll, handleScroll]);

    // Get visible posts
    const visiblePosts = posts.slice(visibleRange.start, visibleRange.end);
    const totalHeight = posts.length * itemHeight;

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Virtual Scrolling Header */}
            <div className="mb-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300">
                        📊 Virtual Scrolling ({visibleRange.start}-{visibleRange.end})
                    </span>
                    <span className="text-purple-400">
                        {posts.length} total posts
                    </span>
                </div>
            </div>

            {/* Virtual Container */}
            <div
                ref={containerRef}
                className={`${styles.virtualContainer} overflow-auto bg-black/20 rounded-lg border border-purple-500/20`}
            >
                {/* Spacer before visible items - Dynamic height required for virtualization */}
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                <div
                    className="virtual-spacer-top"
                    style={{ height: `${visibleRange.start * itemHeight}px` }}
                />                {/* Visible Items */}
                <div className="virtual-items">
                    {visiblePosts.map((post, index) => (
                        <VirtualizedPostItem
                            key={post.id || visibleRange.start + index}
                            post={post}
                            onPostClick={onPostClick}
                        />
                    ))}
                </div>

                {/* Loading items */}
                {loading && (
                    <div className="space-y-4 p-4">
                        {Array.from({ length: 3 }, (_, i) => `loading-skeleton-${i}`).map((skeletonKey, i) => (
                            <div key={skeletonKey} className="bg-purple-900/30 rounded-xl p-6 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-purple-700 rounded-full"></div>
                                    <div>
                                        <div className="w-24 h-4 bg-purple-700 rounded mb-1"></div>
                                        <div className="w-16 h-3 bg-purple-800 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-4 bg-purple-700 rounded"></div>
                                    <div className="w-3/4 h-4 bg-purple-700 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Spacer after visible items */}
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div
                    className="virtual-spacer-bottom"
                    style={{
                        height: `${Math.max(0, totalHeight - (visibleRange.end * itemHeight))}px`
                    }}
                />
            </div>

            {/* Performance Stats */}
            <div className="mt-4 p-3 bg-black/20 rounded-lg border border-purple-500/20 text-xs">
                <div className="flex justify-between text-purple-400">
                    <span>Rendered: {visiblePosts.length} items</span>
                    <span>Total: {posts.length} items</span>
                    <span>Performance: {Math.round((visiblePosts.length / posts.length) * 100)}% efficiency</span>
                </div>
            </div>

            {/* End Indicator */}
            {!hasMore && posts.length > 0 && (
                <div className="text-center py-6">
                    <div className="text-purple-300 text-sm">
                        ✨ All cosmic content loaded ✨
                    </div>
                    <div className="text-purple-400 text-xs mt-1">
                        Virtual scrolling handled {posts.length} posts efficiently
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualFeed;