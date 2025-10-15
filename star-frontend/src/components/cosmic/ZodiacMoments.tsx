import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ZodiacMoment {
    id: string;
    userId: string;
    username: string;
    avatar?: string;
    videoUrl: string;
    thumbnail?: string;
    caption: string;
    zodiacSign: {
        western: string;
        chinese?: string;
        galactic_tone?: number;
    };
    elementalFilter: 'fire' | 'water' | 'air' | 'earth' | 'none';
    likes: number;
    comments: number;
    shares: number;
    isLiked?: boolean;
    timestamp: string;
    duration: number;
    tags: string[];
    cosmicResonance: number; // 0-100 viral potential
}

interface ZodiacMomentsProps {
    moments: ZodiacMoment[];
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
}

const ZodiacMoments: React.FC<ZodiacMomentsProps> = ({
    moments,
    onLoadMore,
    hasMore,
    loading
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Zodiac-themed color schemes
    const getZodiacColors = (sign: string) => {
        const colorMap: { [key: string]: { primary: string; secondary: string; glow: string } } = {
            'aries': { primary: '#FF4444', secondary: '#FF6B6B', glow: 'shadow-red-500/50' },
            'taurus': { primary: '#4CAF50', secondary: '#66BB6A', glow: 'shadow-green-500/50' },
            'gemini': { primary: '#FFEB3B', secondary: '#FFF176', glow: 'shadow-yellow-500/50' },
            'cancer': { primary: '#2196F3', secondary: '#42A5F5', glow: 'shadow-blue-500/50' },
            'leo': { primary: '#FF9800', secondary: '#FFB74D', glow: 'shadow-orange-500/50' },
            'virgo': { primary: '#795548', secondary: '#A1887F', glow: 'shadow-amber-500/50' },
            'libra': { primary: '#E91E63', secondary: '#F06292', glow: 'shadow-pink-500/50' },
            'scorpio': { primary: '#9C27B0', secondary: '#BA68C8', glow: 'shadow-purple-500/50' },
            'sagittarius': { primary: '#FF5722', secondary: '#FF7043', glow: 'shadow-red-500/50' },
            'capricorn': { primary: '#607D8B', secondary: '#78909C', glow: 'shadow-slate-500/50' },
            'aquarius': { primary: '#00BCD4', secondary: '#26C6DA', glow: 'shadow-cyan-500/50' },
            'pisces': { primary: '#673AB7', secondary: '#9575CD', glow: 'shadow-indigo-500/50' }
        };
        return colorMap[sign.toLowerCase()] || colorMap['aries'];
    };

    // Elemental filter effects
    const getElementalEffect = (element: string) => {
        const effects = {
            fire: 'brightness-110 contrast-110 hue-rotate-15',
            water: 'brightness-95 contrast-105 hue-rotate-180 saturate-110',
            air: 'brightness-105 contrast-95 blur-[0.3px]',
            earth: 'brightness-90 contrast-115 sepia-20',
            none: ''
        };
        return effects[element as keyof typeof effects] || '';
    };

    // Zodiac emoji mapping
    const getZodiacEmoji = (sign: string) => {
        const emojiMap: { [key: string]: string } = {
            'aries': '♈', 'taurus': '♉', 'gemini': '♊', 'cancer': '♋',
            'leo': '♌', 'virgo': '♍', 'libra': '♎', 'scorpio': '♏',
            'sagittarius': '♐', 'capricorn': '♑', 'aquarius': '♒', 'pisces': '♓'
        };
        return emojiMap[sign.toLowerCase()] || '⭐';
    };

    // Elemental emoji mapping
    const getElementEmoji = (element: string) => {
        const elementMap: { [key: string]: string } = {
            'fire': '🔥',
            'water': '🌊',
            'air': '🌬️',
            'earth': '🌍',
            'none': ''
        };
        return elementMap[element] || '';
    };

    // Handle swipe gestures
    const handleDragEnd = useCallback((event: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.y > threshold && currentIndex > 0) {
            // Swipe down - previous video
            setCurrentIndex(prev => prev - 1);
        } else if (info.offset.y < -threshold && currentIndex < moments.length - 1) {
            // Swipe up - next video
            setCurrentIndex(prev => prev + 1);
            // Load more when near the end
            if (currentIndex >= moments.length - 3 && hasMore && !loading) {
                onLoadMore();
            }
        }
    }, [currentIndex, moments.length, hasMore, loading, onLoadMore]);

    // Video management
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === currentIndex && isPlaying) {
                    video.play().catch(console.error);
                } else {
                    video.pause();
                }
            }
        });
    }, [currentIndex, isPlaying]);

    // Auto-play next video when current ends
    const handleVideoEnd = useCallback(() => {
        if (currentIndex < moments.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, moments.length]);

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    // Handle interactions
    const handleLike = async (momentId: string) => {
        try {
            // API call to like/unlike
            console.log(`Liking moment ${momentId}`);
        } catch (error) {
            console.error('Failed to like moment:', error);
        }
    };

    const handleShare = async (moment: ZodiacMoment) => {
        try {
            await navigator.share({
                title: `${moment.username}'s Zodiac Moment`,
                text: moment.caption,
                url: window.location.href
            });
        } catch (error) {
            console.log('Share failed, falling back to clipboard:', error);
            try {
                await navigator.clipboard.writeText(window.location.href);
            } catch (clipboardError) {
                console.error('Clipboard write failed:', clipboardError);
            }
        }
    };

    const currentMoment = moments[currentIndex];
    if (!currentMoment) return null;

    const zodiacColors = getZodiacColors(currentMoment.zodiacSign.western);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen bg-black overflow-hidden"
        >
            {/* Video Container */}
            <motion.div
                className="absolute inset-0 flex flex-col"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
                dragElastic={0.1}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMoment.id}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full h-full"
                    >
                        {/* Background Video */}
                        <video
                            ref={(el) => { videoRefs.current[currentIndex] = el; }}
                            src={currentMoment.videoUrl}
                            className={`w-full h-full object-cover ${getElementalEffect(currentMoment.elementalFilter)}`}
                            loop
                            muted
                            playsInline
                            onEnded={handleVideoEnd}
                            onClick={togglePlayPause}
                            poster={currentMoment.thumbnail}
                        />

                        {/* Zodiac Overlay Effects */}
                        <div
                            className={`absolute inset-0 pointer-events-none opacity-20`}
                            style={{
                                background: `radial-gradient(circle at 50% 50%, ${zodiacColors.primary}20 0%, transparent 70%)`
                            }}
                        />

                        {/* Cosmic Resonance Indicator */}
                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                            <div className="flex items-center bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="text-lg">
                                    {getZodiacEmoji(currentMoment.zodiacSign.western)}
                                </span>
                                <div className="w-16 h-1 bg-gray-700 rounded-full ml-2 overflow-hidden">
                                    <motion.div
                                        className={`h-full bg-gradient-to-r from-${zodiacColors.primary} to-${zodiacColors.secondary}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${currentMoment.cosmicResonance}%` }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                    />
                                </div>
                                <span className="text-xs text-white ml-2 font-medium">
                                    {currentMoment.cosmicResonance}%
                                </span>
                            </div>
                        </div>

                        {/* User Info Overlay */}
                        <div className="absolute bottom-20 left-4 right-20">
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-3"
                            >
                                {/* User Profile */}
                                <div className="flex items-center space-x-3">
                                    <Image
                                        src={currentMoment.avatar || '/default-avatar.png'}
                                        alt={currentMoment.username}
                                        width={48}
                                        height={48}
                                        className={`rounded-full border-2 ${zodiacColors.glow}`}
                                        style={{ borderColor: zodiacColors.primary }}
                                    />
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-white font-bold text-lg">
                                                {currentMoment.username}
                                            </span>
                                            <div className="flex items-center space-x-1 text-sm">
                                                <span>{getZodiacEmoji(currentMoment.zodiacSign.western)}</span>
                                                {currentMoment.zodiacSign.chinese && (
                                                    <span className="text-purple-300">
                                                        {currentMoment.zodiacSign.chinese}
                                                    </span>
                                                )}
                                                {currentMoment.zodiacSign.galactic_tone && (
                                                    <span className="text-purple-400">
                                                        T{currentMoment.zodiacSign.galactic_tone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Caption */}
                                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3">
                                    <p className="text-white text-sm leading-relaxed">
                                        {currentMoment.caption}
                                    </p>
                                    {currentMoment.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {currentMoment.tags.map((tag) => (
                                                <span
                                                    key={`tag-${tag}`}
                                                    className="text-xs px-2 py-1 rounded-full bg-opacity-30"
                                                    style={{
                                                        backgroundColor: `${zodiacColors.primary}30`,
                                                        color: zodiacColors.secondary
                                                    }}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Interaction Sidebar */}
                        <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-6">
                            {/* Like Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLike(currentMoment.id)}
                                className="flex flex-col items-center space-y-1"
                            >
                                <div className={`w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-2 ${currentMoment.isLiked ? zodiacColors.glow : 'border-gray-600'}`}
                                    style={currentMoment.isLiked ? { borderColor: zodiacColors.primary } : {}}>
                                    <motion.span
                                        className={`text-2xl ${currentMoment.isLiked ? '' : 'text-gray-300'}`}
                                        style={currentMoment.isLiked ? { color: zodiacColors.primary } : {}}
                                        animate={currentMoment.isLiked ? { scale: [1, 1.3, 1] } : {}}
                                    >
                                        ❤️
                                    </motion.span>
                                </div>
                                <span className="text-white text-xs font-medium">
                                    {currentMoment.likes > 999 ? `${(currentMoment.likes / 1000).toFixed(1)}K` : currentMoment.likes}
                                </span>
                            </motion.button>

                            {/* Comment Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex flex-col items-center space-y-1"
                            >
                                <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-2 border-gray-600">
                                    <span className="text-2xl text-gray-300">💬</span>
                                </div>
                                <span className="text-white text-xs font-medium">
                                    {currentMoment.comments > 999 ? `${(currentMoment.comments / 1000).toFixed(1)}K` : currentMoment.comments}
                                </span>
                            </motion.button>

                            {/* Share Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleShare(currentMoment)}
                                className="flex flex-col items-center space-y-1"
                            >
                                <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-2 border-gray-600">
                                    <span className="text-2xl text-gray-300">✨</span>
                                </div>
                                <span className="text-white text-xs font-medium">
                                    {currentMoment.shares}
                                </span>
                            </motion.button>

                            {/* Elemental Filter Indicator */}
                            {currentMoment.elementalFilter !== 'none' && (
                                <div className="flex flex-col items-center space-y-1">
                                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                        <span className="text-sm">
                                            {getElementEmoji(currentMoment.elementalFilter)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Play/Pause Indicator */}
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="w-20 h-20 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center"
                                >
                                    <span className="text-white text-4xl ml-1">▶️</span>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Progress Indicators */}
            <div className="absolute top-2 left-4 right-4 flex space-x-1">
                {moments.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
                    const actualIndex = Math.max(0, currentIndex - 2) + index;
                    return (
                        <div
                            key={actualIndex}
                            className={`flex-1 h-1 rounded-full ${actualIndex === currentIndex ? 'bg-white' : 'bg-gray-600'
                                }`}
                        />
                    );
                })}
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-white text-sm">Loading more moments...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZodiacMoments;