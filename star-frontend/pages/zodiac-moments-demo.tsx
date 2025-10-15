import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import ZodiacMoments from '../src/components/cosmic/ZodiacMoments';

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
    cosmicResonance: number;
}

const ZodiacMomentsDemo: React.FC = () => {
    const [moments, setMoments] = useState<ZodiacMoment[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    // Generate mock moments for demo
    const generateMockMoments = useCallback((startIndex: number, count: number): ZodiacMoment[] => {
        const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        const elements = ['fire', 'water', 'air', 'earth', 'none'];
        const mockVideos = [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        ];

        return Array.from({ length: count }, (_, i) => {
            const index = startIndex + i;
            const zodiac = zodiacSigns[index % zodiacSigns.length];

            return {
                id: `moment_${index}`,
                userId: `user_${index % 20}`,
                username: `cosmic_${zodiac}_${index}`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${zodiac}${index}`,
                videoUrl: mockVideos[index % mockVideos.length],
                thumbnail: `https://picsum.photos/400/600?random=${index}`,
                caption: `Embracing my ${zodiac.charAt(0).toUpperCase() + zodiac.slice(1)} energy today! ✨ #${zodiac} #cosmic #vibes`,
                zodiacSign: {
                    western: zodiac,
                    chinese: ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake'][index % 6],
                    galactic_tone: (index % 13) + 1
                },
                elementalFilter: elements[index % elements.length] as any,
                likes: Math.floor(Math.random() * 10000),
                comments: Math.floor(Math.random() * 500),
                shares: Math.floor(Math.random() * 200),
                isLiked: Math.random() > 0.7,
                timestamp: new Date(Date.now() - index * 3600000).toISOString(),
                duration: 15 + Math.floor(Math.random() * 45),
                tags: [zodiac, 'cosmic', 'vibes', `tone${(index % 13) + 1}`],
                cosmicResonance: Math.min(95, 30 + Math.floor(Math.random() * 70))
            };
        });
    }, []);

    // Load initial moments
    useEffect(() => {
        const initialMoments = generateMockMoments(0, 10);
        setMoments(initialMoments);
        setPage(1);
    }, [generateMockMoments]);

    // Load more moments
    const loadMoreMoments = useCallback(() => {
        if (loading) return;

        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const newMoments = generateMockMoments(page * 10, 10);
            setMoments(prev => [...prev, ...newMoments]);
            setPage(prev => prev + 1);
            setLoading(false);

            // Stop loading after 5 pages for demo
            if (page >= 5) {
                setHasMore(false);
            }
        }, 1000);
    }, [generateMockMoments, page, loading]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-indigo-900">
            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm"
            >
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold">✨</span>
                        </div>
                        <h1 className="text-white font-bold text-xl">Zodiac Moments</h1>
                    </div>

                    <div className="text-white text-sm">
                        {moments.length} cosmic moments loaded
                    </div>
                </div>
            </motion.div>

            {/* Zodiac Moments Feed */}
            <div className="pt-16">
                <ZodiacMoments
                    moments={moments}
                    onLoadMore={loadMoreMoments}
                    hasMore={hasMore}
                    loading={loading}
                />
            </div>

            {/* Demo Instructions Overlay */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 3, duration: 1 }}
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 pointer-events-none"
            >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-sm mx-4 text-center">
                    <div className="text-white mb-4">
                        <span className="text-4xl">🌌</span>
                    </div>
                    <h2 className="text-white font-bold text-xl mb-2">Welcome to Zodiac Moments!</h2>
                    <p className="text-gray-300 text-sm mb-4">
                        Swipe up/down to navigate • Tap to pause • Experience cosmic content
                    </p>
                    <div className="flex justify-center space-x-4 text-2xl">
                        <span>🔥</span>
                        <span>🌊</span>
                        <span>🌬️</span>
                        <span>🌍</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ZodiacMomentsDemo;