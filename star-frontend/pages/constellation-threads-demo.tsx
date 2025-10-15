import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import ConstellationThreads from '../src/components/cosmic/ConstellationThreads';

interface ConstellationThread {
    id: string;
    rootPost: any;
    posts: any[];
    constellationPattern: string;
    elementalFlow: string;
    totalPosts: number;
    activeUsers: number;
    cosmicEnergy: number;
}

const ConstellationThreadsDemo: React.FC = () => {
    const [threads, setThreads] = useState<ConstellationThread[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    // Generate mock threads for demo
    const generateMockThreads = useCallback((startIndex: number, count: number): ConstellationThread[] => {
        const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        const elements = ['fire', 'water', 'air', 'earth'];

        return Array.from({ length: count }, (_, i) => {
            const index = startIndex + i;
            const rootZodiac = zodiacSigns[index % zodiacSigns.length];
            const threadZodiacs = [
                rootZodiac,
                zodiacSigns[(index + 3) % zodiacSigns.length],
                zodiacSigns[(index + 7) % zodiacSigns.length]
            ];

            const rootPost = {
                id: `post_${index}_root`,
                userId: `user_${index}`,
                username: `cosmic_${rootZodiac}_${index}`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rootZodiac}${index}`,
                content: `Just experienced an incredible ${rootZodiac} moment during Mercury retrograde! Anyone else feeling this cosmic shift? The energy is absolutely transformative... ✨ #${rootZodiac} #mercury #retrograde`,
                zodiacSign: {
                    western: rootZodiac,
                    chinese: ['rat', 'ox', 'tiger', 'rabbit'][index % 4],
                    galactic_tone: (index % 13) + 1
                },
                timestamp: new Date(Date.now() - index * 3600000).toISOString(),
                likes: Math.floor(Math.random() * 500),
                replies: Math.floor(Math.random() * 50) + 10,
                reposts: Math.floor(Math.random() * 100),
                isLiked: Math.random() > 0.7,
                isRepost: false,
                threadId: `thread_${index}`,
                constellationPath: threadZodiacs,
                elementalResonance: elements[index % elements.length] as any,
                cosmicDepth: 0
            };

            const threadPosts = Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, j) => {
                const replyZodiac = threadZodiacs[j % threadZodiacs.length];
                return {
                    id: `post_${index}_${j}`,
                    userId: `user_${index + j + 1}`,
                    username: `cosmic_${replyZodiac}_${index + j}`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${replyZodiac}${index + j}`,
                    content: j === 0
                        ? `Absolutely! I'm a ${replyZodiac} and I've been feeling this energy building for weeks. The planetary alignment is creating such powerful vibrations! 🌟`
                        : j === 1
                            ? `This is so interesting! As a ${replyZodiac}, I've been having the most vivid dreams lately. Do you think it's connected to the current cosmic weather?`
                            : `The ${rootZodiac}-${replyZodiac} energy connection is real! I pulled the ${['Death', 'Star', 'Moon', 'Sun'][j % 4]} card today and it perfectly aligns with what you're describing. The universe is speaking! 🔮`,
                    zodiacSign: {
                        western: replyZodiac,
                        chinese: ['dragon', 'snake', 'horse', 'goat'][j % 4],
                        galactic_tone: ((index + j) % 13) + 1
                    },
                    timestamp: new Date(Date.now() - (index * 3600000) + (j * 900000)).toISOString(),
                    likes: Math.floor(Math.random() * 200),
                    replies: Math.floor(Math.random() * 10),
                    reposts: Math.floor(Math.random() * 20),
                    isLiked: Math.random() > 0.6,
                    isRepost: j === 2 && Math.random() > 0.5,
                    parentId: j === 0 ? rootPost.id : `post_${index}_${j - 1}`,
                    threadId: `thread_${index}`,
                    constellationPath: threadZodiacs,
                    elementalResonance: elements[(index + j) % elements.length] as any,
                    cosmicDepth: Math.min(j + 1, 5)
                };
            });

            return {
                id: `thread_${index}`,
                rootPost,
                posts: threadPosts,
                constellationPattern: threadZodiacs.join('→'),
                elementalFlow: elements.slice(0, 3).join('→'),
                totalPosts: threadPosts.length + 1,
                activeUsers: Math.floor(Math.random() * 15) + 3,
                cosmicEnergy: Math.floor(Math.random() * 60) + 40
            };
        });
    }, []);

    // Load initial threads
    useEffect(() => {
        const initialThreads = generateMockThreads(0, 5);
        setThreads(initialThreads);
        setPage(1);
    }, [generateMockThreads]);

    // Load more threads
    const loadMoreThreads = useCallback(() => {
        if (loading) return;

        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const newThreads = generateMockThreads(page * 5, 5);
            setThreads(prev => [...prev, ...newThreads]);
            setPage(prev => prev + 1);
            setLoading(false);

            // Stop loading after 4 pages for demo
            if (page >= 4) {
                setHasMore(false);
            }
        }, 1500);
    }, [generateMockThreads, page, loading]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-purple-500/30"
            >
                <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white font-bold">✦</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl">Constellation Threads</h1>
                            <p className="text-gray-300 text-sm">Cosmic conversations connected by astrological resonance</p>
                        </div>
                    </div>

                    <div className="text-white text-sm text-right">
                        <div className="font-medium">{threads.length} cosmic threads</div>
                        <div className="text-gray-400">{threads.reduce((sum, t) => sum + t.totalPosts, 0)} total posts</div>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-4">
                {/* Feature Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-6 border border-purple-500/30"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-white font-semibold text-lg mb-3 flex items-center">
                                <span className="mr-2">🌟</span>
                                Astrological Threading
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                Unlike traditional social media threads, Constellation Threads connect conversations
                                based on astrological compatibility and elemental resonance, creating meaningful
                                cosmic storylines.
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-red-500/20 p-2 rounded border border-red-500/30">
                                    <span className="text-red-300 font-medium">🔥 Fire Signs</span>
                                    <div className="text-gray-400">Passionate threads</div>
                                </div>
                                <div className="bg-blue-500/20 p-2 rounded border border-blue-500/30">
                                    <span className="text-blue-300 font-medium">🌊 Water Signs</span>
                                    <div className="text-gray-400">Emotional depths</div>
                                </div>
                                <div className="bg-yellow-500/20 p-2 rounded border border-yellow-500/30">
                                    <span className="text-yellow-300 font-medium">🌬️ Air Signs</span>
                                    <div className="text-gray-400">Ideas & communication</div>
                                </div>
                                <div className="bg-green-500/20 p-2 rounded border border-green-500/30">
                                    <span className="text-green-300 font-medium">🌍 Earth Signs</span>
                                    <div className="text-gray-400">Grounded wisdom</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-white font-semibold text-lg mb-3 flex items-center">
                                <span className="mr-2">📈</span>
                                Cosmic Metrics
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Average Thread Energy:</span>
                                    <span className="text-purple-300 font-medium">
                                        {Math.round(threads.reduce((sum, t) => sum + t.cosmicEnergy, 0) / threads.length || 0)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Most Active Element:</span>
                                    <span className="text-pink-300 font-medium">Water 🌊</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Peak Constellation:</span>
                                    <span className="text-purple-300 font-medium">Scorpio→Pisces→Cancer</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Active Cosmic Beings:</span>
                                    <span className="text-blue-300 font-medium">
                                        {threads.reduce((sum, t) => sum + t.activeUsers, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Threads Feed */}
                <ConstellationThreads
                    threads={threads}
                    onLoadMore={loadMoreThreads}
                    hasMore={hasMore}
                    loading={loading}
                />
            </div>

            {/* Demo Instructions Overlay */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 5, duration: 1 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-none"
            >
                <div className="bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-sm rounded-xl p-8 max-w-md mx-4 text-center border border-purple-500/30">
                    <div className="text-6xl mb-4">✦</div>
                    <h2 className="text-white font-bold text-2xl mb-4">Constellation Threads Demo</h2>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        Experience cosmic conversations that connect through astrological resonance.
                        Watch how threads form constellation patterns based on zodiac compatibility.
                    </p>
                    <div className="space-y-2 text-left text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span>Threads connect by zodiac compatibility</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                            <span>Elemental energy flows create deeper bonds</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>Cosmic energy builds with engagement</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ConstellationThreadsDemo;