'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import EmotionReactiveUI from '../src/components/EmotionReactiveUI';
import MoodInputSystem from '../src/components/MoodInputSystem';

interface MoodState {
    primary: string;
    intensity: number;
    elements: string[];
    zodiacInfluence: string;
}

interface TarotReading {
    question: string;
    cards: Array<{
        name: string;
        element: string;
        keywords: string[];
        interpretation: string;
    }>;
    summary: {
        dominant_element: string;
        energy_flow: string;
        key_message: string;
    };
}

interface ZodiacProfile {
    western: { sign: string; element: string };
    chinese: { animal: string; element: string };
    mayan: { day_sign: string; galactic_tone: number };
    cosmic_signature: {
        harmony_score: number;
        cosmic_archetype: string;
        dominant_element: string;
    };
}

export default function RitualIntelligenceDemo() {
    const [currentMood, setCurrentMood] = useState<MoodState>({
        primary: '',
        intensity: 5,
        elements: [],
        zodiacInfluence: ''
    });

    const [activeFeature, setActiveFeature] = useState<string>('mood');
    const [tarotReading, setTarotReading] = useState<TarotReading | null>(null);
    const [zodiacProfile, setZodiacProfile] = useState<ZodiacProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Simulate API calls for demo
    const generateTarotReading = async () => {
        setIsLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const mockReading: TarotReading = {
                question: "What energy should I focus on today?",
                cards: [
                    {
                        name: "The Star",
                        element: "air",
                        keywords: ["hope", "inspiration", "healing"],
                        interpretation: "A time of renewal and cosmic alignment approaches. Your intuitive gifts are heightened."
                    },
                    {
                        name: "Three of Cups",
                        element: "water",
                        keywords: ["celebration", "friendship", "joy"],
                        interpretation: "Social connections bring healing energy. Share your light with others."
                    },
                    {
                        name: "Ace of Wands",
                        element: "fire",
                        keywords: ["new beginnings", "creativity", "passion"],
                        interpretation: "A spark of creative fire ignites new possibilities. Take inspired action."
                    }
                ],
                summary: {
                    dominant_element: "air",
                    energy_flow: "dynamic",
                    key_message: "Trust in your intuitive wisdom and share your gifts with the cosmic community"
                }
            };
            setTarotReading(mockReading);
            setIsLoading(false);
        }, 2000);
    };

    const generateZodiacProfile = async () => {
        setIsLoading(true);
        setTimeout(() => {
            const mockProfile: ZodiacProfile = {
                western: { sign: "libra", element: "air" },
                chinese: { animal: "dragon", element: "earth" },
                mayan: { day_sign: "imix", galactic_tone: 7 },
                cosmic_signature: {
                    harmony_score: 87,
                    cosmic_archetype: "Libra Dragon Mystic",
                    dominant_element: "air"
                }
            };
            setZodiacProfile(mockProfile);
            setIsLoading(false);
        }, 1500);
    };

    const handleMoodChange = (mood: MoodState) => {
        setCurrentMood(mood);
    };

    const features = [
        { id: 'mood', name: '🌙 Mood Intelligence', description: 'Emotion-reactive cosmic interface' },
        { id: 'zodiac', name: '✨ 5-System Zodiac', description: 'Multi-tradition astrological analysis' },
        { id: 'tarot', name: '🔮 AI Tarot Engine', description: 'Intelligent cosmic guidance' },
        { id: 'mentor', name: '👁️ Cosmic Mentor', description: 'Archetypal wisdom system' }
    ];

    return (
        <EmotionReactiveUI mood={currentMood}>
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 text-white">
                {/* Cosmic Header */}
                <motion.div
                    className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border-b border-white/10"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 opacity-20"></div>

                    <div className="relative z-10 container mx-auto px-6 py-8">
                        <motion.h1
                            className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            🌌 Ritual Intelligence Backend 🔮
                        </motion.h1>

                        <motion.p
                            className="text-xl text-center text-purple-200 mb-8 max-w-3xl mx-auto"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                        >
                            Phase 3: Advanced AI-powered cosmic intelligence with 5-system zodiac calculations,
                            emotionally-reactive UX, and deep ritual wisdom
                        </motion.p>

                        {/* Feature Navigation */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {features.map((feature, index) => (
                                <motion.button
                                    key={feature.id}
                                    className={`feature-card p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${activeFeature === feature.id
                                            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20'
                                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                                        }`}
                                    onClick={() => setActiveFeature(feature.id)}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="text-2xl mb-2">{feature.name.split(' ')[0]}</div>
                                    <div className="font-semibold text-sm">{feature.name.split(' ').slice(1).join(' ')}</div>
                                    <div className="text-xs text-gray-300 mt-1">{feature.description}</div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="container mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Left Column - Interactive Demo */}
                        <motion.div
                            className="space-y-6"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                        >
                            {activeFeature === 'mood' && (
                                <motion.div
                                    key="mood-system"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <MoodInputSystem onMoodChange={handleMoodChange} userZodiac="libra" />
                                </motion.div>
                            )}

                            {activeFeature === 'zodiac' && (
                                <motion.div
                                    key="zodiac-system"
                                    className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl backdrop-blur-sm border border-white/10"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h3 className="text-2xl font-bold text-white mb-4">🌟 5-System Zodiac Calculator</h3>
                                    <p className="text-gray-300 mb-6">
                                        Advanced multi-tradition astrological analysis combining Western, Chinese, Vedic, Mayan, and Galactic systems
                                    </p>

                                    <motion.button
                                        className="w-full p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50"
                                        onClick={generateZodiacProfile}
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? '✨ Calculating Cosmic Signature...' : '🔮 Generate Zodiac Profile'}
                                    </motion.button>

                                    {zodiacProfile && (
                                        <motion.div
                                            className="mt-6 space-y-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-yellow-400 font-semibold">Western</div>
                                                    <div className="capitalize">{zodiacProfile.western.sign} ({zodiacProfile.western.element})</div>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-3">
                                                    <div className="text-red-400 font-semibold">Chinese</div>
                                                    <div className="capitalize">{zodiacProfile.chinese.animal} ({zodiacProfile.chinese.element})</div>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="text-green-400 font-semibold">Mayan Tzolkin</div>
                                                <div className="capitalize">{zodiacProfile.mayan.day_sign} - Tone {zodiacProfile.mayan.galactic_tone}</div>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-400/30">
                                                <div className="text-purple-300 font-semibold mb-2">Cosmic Signature</div>
                                                <div className="text-lg font-bold">{zodiacProfile.cosmic_signature.cosmic_archetype}</div>
                                                <div className="text-sm text-gray-300">
                                                    Harmony Score: {zodiacProfile.cosmic_signature.harmony_score}/100
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {activeFeature === 'tarot' && (
                                <motion.div
                                    key="tarot-system"
                                    className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl backdrop-blur-sm border border-white/10"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h3 className="text-2xl font-bold text-white mb-4">🔮 AI Tarot Engine</h3>
                                    <p className="text-gray-300 mb-6">
                                        Intelligent tarot interpretation powered by cosmic algorithms and zodiac-influenced card selection
                                    </p>

                                    <motion.button
                                        className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
                                        onClick={generateTarotReading}
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? '🔮 Channeling Cosmic Wisdom...' : '✨ Draw Three Cards'}
                                    </motion.button>

                                    {tarotReading && (
                                        <motion.div
                                            className="mt-6 space-y-4"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div className="text-center">
                                                <div className="text-purple-400 font-semibold mb-2">Your Question</div>
                                                <div className="italic">"{tarotReading.question}"</div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {tarotReading.cards.map((card, index) => (
                                                    <motion.div
                                                        key={card.name}
                                                        className="bg-white/5 rounded-lg p-4 border border-white/10"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 * index }}
                                                    >
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <div className="text-lg font-bold">{card.name}</div>
                                                            <div className="text-xs px-2 py-1 bg-purple-500/30 rounded-full capitalize">{card.element}</div>
                                                        </div>
                                                        <div className="text-sm text-gray-300 mb-2">
                                                            <strong>Keywords:</strong> {card.keywords.join(', ')}
                                                        </div>
                                                        <div className="text-sm">{card.interpretation}</div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-400/30">
                                                <div className="text-purple-300 font-semibold mb-2">Reading Summary</div>
                                                <div className="text-sm space-y-1">
                                                    <div><strong>Dominant Element:</strong> {tarotReading.summary.dominant_element}</div>
                                                    <div><strong>Energy Flow:</strong> {tarotReading.summary.energy_flow}</div>
                                                </div>
                                                <div className="mt-3 p-3 bg-black/20 rounded-lg">
                                                    <div className="text-yellow-300 font-semibold mb-1">Key Message</div>
                                                    <div className="italic">{tarotReading.summary.key_message}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {activeFeature === 'mentor' && (
                                <motion.div
                                    key="mentor-system"
                                    className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl backdrop-blur-sm border border-white/10"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h3 className="text-2xl font-bold text-white mb-4">👁️ Cosmic Mentor System</h3>
                                    <p className="text-gray-300 mb-6">
                                        Archetypal guidance combining your zodiac element with numerological life path
                                    </p>

                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-400/30">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="text-3xl">🔥</div>
                                                <div>
                                                    <div className="text-yellow-300 font-bold">The Solar Emperor</div>
                                                    <div className="text-sm text-yellow-200">Fire Element • Life Path 8</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-yellow-100 mb-3">
                                                "Manifest your vision with unwavering determination. The solar fires within you burn bright with leadership energy."
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="bg-black/20 rounded-lg p-2">
                                                    <div className="text-yellow-300 font-semibold">Daily Wisdom</div>
                                                    <div>Channel your passion into purposeful action today. Your leadership abilities are heightened.</div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-black/20 rounded-lg p-2">
                                                        <div className="text-yellow-300 font-semibold">Power Hours</div>
                                                        <div>6:00-8:00 AM<br />12:00-2:00 PM</div>
                                                    </div>
                                                    <div className="bg-black/20 rounded-lg p-2">
                                                        <div className="text-yellow-300 font-semibold">Affirmation</div>
                                                        <div>"I am a powerful creator of my reality."</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Right Column - Live Mood Visualization */}
                        <motion.div
                            className="space-y-6"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.6 }}
                        >
                            {/* Mood Status Display */}
                            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl backdrop-blur-sm border border-white/10">
                                <h4 className="text-xl font-bold text-white mb-4">🎭 Current Emotional State</h4>

                                {currentMood.primary ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">
                                                {currentMood.primary === 'excited' && '🔥'}
                                                {currentMood.primary === 'peaceful' && '🌊'}
                                                {currentMood.primary === 'creative' && '🎨'}
                                                {currentMood.primary === 'grounded' && '🌱'}
                                                {!['excited', 'peaceful', 'creative', 'grounded'].includes(currentMood.primary) && '✨'}
                                            </div>
                                            <div className="text-2xl font-bold capitalize text-purple-300">{currentMood.primary}</div>
                                            <div className="text-lg text-gray-400">Intensity: {currentMood.intensity}/10</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="text-gray-400 mb-1">Elements Active</div>
                                                <div className="font-semibold">
                                                    {currentMood.elements.length > 0
                                                        ? currentMood.elements.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')
                                                        : 'None'
                                                    }
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <div className="text-gray-400 mb-1">Zodiac Influence</div>
                                                <div className="font-semibold capitalize">{currentMood.zodiacInfluence}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 py-8">
                                        <div className="text-6xl mb-4">🌙</div>
                                        <div>Select a mood to see real-time visualization</div>
                                    </div>
                                )}
                            </div>

                            {/* System Status */}
                            <div className="p-6 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl backdrop-blur-sm border border-white/10">
                                <h4 className="text-xl font-bold text-white mb-4">⚡ System Status</h4>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">5-System Zodiac Calculator</span>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">ACTIVE</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">AI Tarot Engine</span>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">READY</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Emotion-Reactive UI</span>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">LIVE</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Cosmic Mentor System</span>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">ONLINE</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Numerology Engine</span>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">READY</span>
                                    </div>
                                </div>
                            </div>

                            {/* Development Progress */}
                            <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl backdrop-blur-sm border border-white/10">
                                <h4 className="text-xl font-bold text-white mb-4">🚀 Phase 3 Completion</h4>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-300">Ritual Intelligence Backend</span>
                                            <span className="text-green-400">100%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-400 h-2 rounded-full w-full"></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-300">Emotionally Intelligent UX</span>
                                            <span className="text-blue-400">100%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-400 h-2 rounded-full w-full"></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-300">Mobile PWA Optimization</span>
                                            <span className="text-yellow-400">Ready for Phase 4</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-yellow-400 h-2 rounded-full w-5/6"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <div className="text-2xl mb-2">🎉</div>
                                    <div className="text-lg font-semibold text-purple-300">Mythic Fusion Reactor</div>
                                    <div className="text-sm text-gray-400">Phase 3 Complete - Ready for Cosmic Launch!</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </EmotionReactiveUI>
    );
}