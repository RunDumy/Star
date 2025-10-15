import { motion } from 'framer-motion';
import React, { useCallback, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { InfiniteLoader } from 'react-window-infinite-loader';

interface VirtualFeedProps {
    posts: any[];
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    onPostClick?: (post: any) => void;
}

interface VirtualizedPostItemProps {
    index: number;
    style: React.CSSProperties;
    data: {
        posts: any[];
        onPostClick?: (post: any) => void;
    };
}

const VirtualizedPostItem: React.FC<VirtualizedPostItemProps> = ({ index, style, data }) => {
    const { posts, onPostClick } = data;
    const post = posts[index];

    if (!post) {
        return (
            <div style={style} className="p-4">
                <div className="bg-purple-900/30 rounded-xl p-6 animate-pulse">
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
            </div>
        );
    }

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

    return (
        <div style={style} className="p-3">
            <motion.div
                className="feed-post bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer"
                whileHover={{ scale: 1.01 }}
                onClick={() => onPostClick?.(post)}
                layout
            >
                {/* Compact Post Header */}
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

                {/* Compact Content */}
                <div className="space-y-2">
                    {post.type === 'tarot_reading' ? (
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
                    ) : post.type === 'cosmic_event' ? (
                        <div className="bg-gradient-to-r from-indigo-800/30 to-purple-800/30 p-3 rounded-lg border border-indigo-400/20">
                            <h4 className="text-indigo-200 font-semibold text-sm mb-1 flex items-center gap-1">
                                🌟 {post.content.event_name}
                            </h4>
                            <p className="text-white text-xs leading-relaxed line-clamp-2">
                                {post.content.description}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-purple-900/20 p-3 rounded-lg">
                            <p className="text-white text-sm leading-relaxed line-clamp-3">
                                {post.content}
                            </p>
                        </div>
                    )}
                </div>

                {/* Compact Tags */}
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
    const [listHeight] = useState(800); // Fixed height for virtualization
    const itemHeight = 280; // Estimated height per item

    // Create item data for virtualized list
    const itemData = useMemo(() => ({
        posts,
        onPostClick
    }), [posts, onPostClick]);

    // Determine if item is loaded
    const isItemLoaded = useCallback((index: number) => {
        return !!posts[index];
    }, [posts]);

    // Total item count (including loading items)
    const itemCount = hasMore ? posts.length + 5 : posts.length;

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Virtual List Header */}
            <div className="mb-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300">
                        📊 Virtual Scrolling Active
                    </span>
                    <span className="text-purple-400">
                        {posts.length} posts loaded
                    </span>
                </div>
            </div>

            {/* Virtualized List */}
            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={itemCount}
                loadMoreItems={loadMore}
                threshold={5} // Load more when 5 items from the end
            >
                {({ onItemsRendered, ref }) => (
                    <List
                        ref={ref}
                        height={listHeight}
                        itemCount={itemCount}
                        itemSize={itemHeight}
                        itemData={itemData}
                        onItemsRendered={onItemsRendered}
                        className="cosmic-virtual-list"
                        overscanCount={3} // Render 3 extra items for smoother scrolling
                    >
                        {VirtualizedPostItem}
                    </List>
                )}
            </InfiniteLoader>

            {/* Loading Indicator */}
            {loading && (
                <div className="text-center py-4">
                    <motion.div
                        className="text-purple-300"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        🌌 Loading more cosmic content...
                    </motion.div>
                </div>
            )}

            {/* End Indicator */}
            {!hasMore && posts.length > 0 && (
                <div className="text-center py-6">
                    <div className="text-purple-300 text-sm">
                        ✨ All cosmic content loaded ✨
                    </div>
                    <div className="text-purple-400 text-xs mt-1">
                        Handled {posts.length} posts with virtual scrolling
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualFeed;