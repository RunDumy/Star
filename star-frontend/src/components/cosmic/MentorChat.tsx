'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FiRefreshCw, FiSend } from 'react-icons/fi';
import {
    GiCrystalBall,
    GiFire,
    GiMoon,
    GiSparkles,
    GiStarsStack,
    GiStoneBlock,
    GiWaterDrop,
    GiWhirlwind
} from 'react-icons/gi';
import { cosmicAPI } from '../../lib/api';
import { LunarGuidance, MentorGuidance } from '../../types/cosmic-intelligence';
import { useCosmicSocialShare } from './CosmicSocialShare';

interface MentorChatProps {
    userId?: string;
    initialQuestion?: string;
    onGuidanceReceived?: (guidance: MentorGuidance) => void;
}

export function MentorChat({ userId, initialQuestion, onGuidanceReceived }: MentorChatProps) {
    const [messages, setMessages] = useState<Array<{
        id: string;
        type: 'user' | 'mentor';
        content: string;
        timestamp: Date;
        guidance?: MentorGuidance;
    }>>([]);
    const [currentQuestion, setCurrentQuestion] = useState(initialQuestion || '');
    const [isLoading, setIsLoading] = useState(false);
    const [lunarData, setLunarData] = useState<LunarGuidance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { shareMentorGuidance, shareModal, closeShare } = useCosmicSocialShare(); useEffect(() => {
        loadLunarData();
        if (initialQuestion) {
            handleSubmit(initialQuestion);
        }
    }, [initialQuestion]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadLunarData = async () => {
        try {
            const data = await cosmicAPI.getLunarGuidance();
            setLunarData(data);
        } catch (err) {
            console.error('Error loading lunar data:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (question: string = currentQuestion) => {
        if (!question.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user' as const,
            content: question,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentQuestion('');
        setIsLoading(true);
        setError(null);

        try {
            const guidance = await cosmicAPI.getMentorGuidance(question);

            const mentorMessage = {
                id: (Date.now() + 1).toString(),
                type: 'mentor' as const,
                content: guidance.response,
                timestamp: new Date(),
                guidance
            };

            setMessages(prev => [...prev, mentorMessage]);
            onGuidanceReceived?.(guidance);

            // Optionally share significant guidance
            if (guidance.mood === 'transformative' || guidance.mood === 'inspirational') {
                // Could show a share prompt here
            }

        } catch (err) {
            console.error('Error getting mentor guidance:', err);
            setError('Failed to receive guidance from the mentor');

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                type: 'mentor' as const,
                content: 'I apologize, but I am unable to provide guidance at this moment. Please try again later.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const getElementalIcon = (element: string) => {
        switch (element?.toLowerCase()) {
            case 'fire': return <GiFire className="w-4 h-4 text-red-400" />;
            case 'water': return <GiWaterDrop className="w-4 h-4 text-blue-400" />;
            case 'air': return <GiWhirlwind className="w-4 h-4 text-green-400" />;
            case 'earth': return <GiStoneBlock className="w-4 h-4 text-yellow-400" />;
            default: return <GiSparkles className="w-4 h-4 text-purple-400" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-gray-900/50 rounded-xl border border-purple-500/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GiCrystalBall className="w-8 h-8 text-purple-400" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Archetypal Mentor</h2>
                            <p className="text-sm text-gray-400">Wisdom from the cosmic realms</p>
                        </div>
                    </div>

                    {lunarData && (
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-sm">
                                <GiMoon className="w-4 h-4 text-blue-400" />
                                <span className="text-gray-300">{lunarData.moon_phase}</span>
                                {getElementalIcon(lunarData.element_emphasis)}
                            </div>
                            <div className="text-xs text-gray-500">
                                {lunarData.void_of_course ? 'Void of Course' : 'Active Lunar Flow'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                                    }`}
                            >
                                {message.type === 'mentor' && message.guidance && (
                                    <div className="mb-2 pb-2 border-b border-gray-600">
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                            <GiStarsStack className="w-3 h-3" />
                                            <span>{message.guidance.mentor} • {message.guidance.archetype}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-1 rounded ${message.guidance.mood === 'inspirational' ? 'bg-yellow-900/50 text-yellow-400' :
                                                message.guidance.mood === 'mysterious' ? 'bg-purple-900/50 text-purple-400' :
                                                    message.guidance.mood === 'nurturing' ? 'bg-blue-900/50 text-blue-400' :
                                                        message.guidance.mood === 'empowering' ? 'bg-green-900/50 text-green-400' :
                                                            'bg-gray-900/50 text-gray-400'
                                                }`}>
                                                {message.guidance.mood}
                                            </span>
                                            {getElementalIcon(message.guidance.elemental_affirmation)}
                                        </div>
                                    </div>
                                )}

                                <p className="text-sm leading-relaxed">{message.content}</p>

                                {message.type === 'mentor' && message.guidance && (
                                    <div className="mt-3 pt-2 border-t border-gray-600">
                                        <div className="text-xs text-gray-400 mb-1">
                                            {message.guidance.lunar_influence}
                                        </div>
                                        <div className="text-xs text-purple-400 italic">
                                            "{message.guidance.elemental_affirmation}"
                                        </div>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                                    {message.timestamp.toLocaleTimeString()}
                                    {message.type === 'mentor' && message.guidance && (
                                        <button
                                            onClick={() => shareMentorGuidance(message.guidance!)}
                                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                                            title="Share this guidance"
                                        >
                                            Share ✨
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2">
                                <GiCrystalBall className="w-4 h-4 text-purple-400 animate-pulse" />
                                <span className="text-gray-400 text-sm">Consulting the cosmic realms...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700/50">
                {error && (
                    <div className="mb-3 p-2 bg-red-900/50 border border-red-500/50 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-2">
                    <textarea
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask your archetypal mentor for guidance..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                        rows={2}
                        disabled={isLoading}
                    />

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => handleSubmit()}
                            disabled={!currentQuestion.trim() || isLoading}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <FiRefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <FiSend className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            onClick={loadLunarData}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            title="Refresh lunar data"
                        >
                            <GiMoon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                    Press Enter to send • Shift+Enter for new line
                </div>
            </div>

            {/* Lunar Context */}
            {lunarData && (
                <div className="bg-gray-800/30 p-3 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <GiMoon className="w-3 h-3 text-blue-400" />
                            <span className="text-gray-400">
                                Lunar Mansion: {lunarData.moon_mansion}
                            </span>
                        </div>
                        <div className="text-gray-500">
                            {lunarData.cosmic_weather}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}