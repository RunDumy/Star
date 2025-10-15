import { useAuth } from '@/lib/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calculator, Calendar, Hash, Sparkles, Star, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface NumerologyReading {
    life_path: number;
    destiny_number: number;
    soul_urge: number;
    personality_number: number;
    maturity_number: number;
    birth_day: number;
    life_path_description: string;
    destiny_description: string;
    soul_urge_description: string;
    personality_description: string;
    compatibility_notes: string[];
    karmic_lessons: number[];
    master_numbers: number[];
}

interface CosmicNumerologyProps {
    onReadingComplete?: (reading: NumerologyReading) => void;
    showInProfile?: boolean;
    className?: string;
}

export const CosmicNumerology: React.FC<CosmicNumerologyProps> = ({
    onReadingComplete,
    showInProfile = false,
    className = ''
}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        birth_date: user?.birth_date || ''
    });
    const [reading, setReading] = useState<NumerologyReading | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (user?.full_name && user?.birth_date && showInProfile) {
            // Auto-calculate for profile view
            calculateNumerology();
        }
    }, [user, showInProfile]);

    const calculateNumerology = async () => {
        if (!formData.full_name || !formData.birth_date) {
            setError('Please provide both full name and birth date');
            return;
        }

        setIsCalculating(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.post(`${API_URL}/api/oracle/numerology`, {
                full_name: formData.full_name,
                birth_date: formData.birth_date
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                const numerologyData = response.data.numerology;
                setReading(numerologyData);
                setShowResults(true);
                onReadingComplete?.(numerologyData);
            } else {
                setError('Failed to calculate numerology reading');
            }
        } catch (err: any) {
            console.error('Numerology calculation error:', err);
            setError(err.response?.data?.error || 'Failed to calculate numerology');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const resetCalculation = () => {
        setReading(null);
        setShowResults(false);
        setError(null);
    };

    if (showInProfile && reading) {
        return <NumerologyProfileDisplay reading={reading} />;
    }

    return (
        <div className={`cosmic-numerology-container ${className}`}>
            <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-xl border border-purple-500/30">
                {!showResults ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="numerology-input-form"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Calculator className="w-8 h-8 text-purple-400" />
                                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                                    Cosmic Numerology
                                </h2>
                                <Hash className="w-8 h-8 text-purple-400" />
                            </div>
                            <p className="text-purple-200 text-lg">
                                Discover the mystical numbers that shape your destiny
                            </p>
                        </div>

                        {/* Input Form */}
                        <div className="space-y-6 mb-8">
                            <div className="relative">
                                <label className="block text-purple-300 font-medium mb-2">
                                    <User className="inline w-4 h-4 mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your complete birth name"
                                    className="w-full p-4 bg-purple-800/30 border border-purple-600/50 rounded-lg text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                                />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/10 to-pink-600/10 pointer-events-none"></div>
                            </div>

                            <div className="relative">
                                <label className="block text-purple-300 font-medium mb-2">
                                    <Calendar className="inline w-4 h-4 mr-2" />
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleInputChange}
                                    className="w-full p-4 bg-purple-800/30 border border-purple-600/50 rounded-lg text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all"
                                />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/10 to-pink-600/10 pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Calculate Button */}
                        <div className="text-center">
                            <button
                                onClick={calculateNumerology}
                                disabled={isCalculating || !formData.full_name || !formData.birth_date}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isCalculating ? (
                                    <>
                                        <Sparkles className="inline w-5 h-5 mr-2 animate-spin" />
                                        Calculating Cosmic Numbers...
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="inline w-5 h-5 mr-2" />
                                        Calculate My Numerology
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <NumerologyResults
                        reading={reading!}
                        onReset={resetCalculation}
                    />
                )}
            </div>
        </div>
    );
};

const NumerologyResults: React.FC<{
    reading: NumerologyReading;
    onReset: () => void;
}> = ({ reading, onReset }) => {
    const coreNumbers = [
        {
            number: reading.life_path,
            title: 'Life Path',
            description: reading.life_path_description,
            icon: '🛤️',
            gradient: 'from-blue-400 to-purple-500'
        },
        {
            number: reading.destiny_number,
            title: 'Destiny',
            description: reading.destiny_description,
            icon: '⭐',
            gradient: 'from-purple-400 to-pink-500'
        },
        {
            number: reading.soul_urge,
            title: 'Soul Urge',
            description: reading.soul_urge_description,
            icon: '💫',
            gradient: 'from-pink-400 to-red-500'
        },
        {
            number: reading.personality_number,
            title: 'Personality',
            description: reading.personality_description,
            icon: '🎭',
            gradient: 'from-green-400 to-blue-500'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="numerology-results"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                    Your Cosmic Number Profile
                </h3>
                <p className="text-purple-200">
                    The universe has calculated your mystical numerical essence
                </p>
            </div>

            {/* Core Numbers Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {coreNumbers.map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`number-card p-6 rounded-xl bg-gradient-to-br ${item.gradient} bg-opacity-20 border border-white/20 relative overflow-hidden`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xl font-bold text-white">{item.title}</h4>
                                <span className="text-2xl">{item.icon}</span>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-4xl font-bold text-white mb-2">
                                    {item.number}
                                </div>
                                {reading.master_numbers?.includes(item.number) && (
                                    <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-400 rounded-full text-yellow-200 text-xs font-medium">
                                        Master Number
                                    </span>
                                )}
                            </div>

                            <p className="text-white/90 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    </motion.div>
                ))}
            </div>

            {/* Additional Insights */}
            {reading.compatibility_notes && reading.compatibility_notes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 p-6 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl border border-emerald-500/30"
                >
                    <h4 className="text-lg font-bold text-emerald-200 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Compatibility Insights
                    </h4>
                    <ul className="space-y-2">
                        {reading.compatibility_notes.map((note, index) => (
                            <li key={index} className="text-emerald-100 text-sm flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                {note}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Karmic Lessons */}
            {reading.karmic_lessons && reading.karmic_lessons.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6 p-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl border border-orange-500/30"
                >
                    <h4 className="text-lg font-bold text-orange-200 mb-3">
                        Karmic Lessons to Master
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                        {reading.karmic_lessons.map((lesson) => (
                            <span
                                key={lesson}
                                className="px-3 py-1 bg-orange-500/20 border border-orange-400 rounded-full text-orange-200 font-medium"
                            >
                                {lesson}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Reset Button */}
            <div className="text-center">
                <button
                    onClick={onReset}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300"
                >
                    Calculate Another Reading
                </button>
            </div>
        </motion.div>
    );
};

const NumerologyProfileDisplay: React.FC<{
    reading: NumerologyReading;
}> = ({ reading }) => {
    return (
        <div className="numerology-profile-widget p-4 bg-gradient-to-br from-purple-800/30 to-indigo-800/30 rounded-lg border border-purple-500/30">
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-400" />
                Numerology Profile
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-purple-700/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-200">{reading.life_path}</div>
                    <div className="text-xs text-purple-300">Life Path</div>
                </div>
                <div className="text-center p-3 bg-purple-700/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-200">{reading.destiny_number}</div>
                    <div className="text-xs text-purple-300">Destiny</div>
                </div>
            </div>

            <p className="text-purple-200 text-sm leading-relaxed line-clamp-3">
                {reading.life_path_description}
            </p>

            {reading.master_numbers && reading.master_numbers.length > 0 && (
                <div className="mt-3 flex gap-1 flex-wrap">
                    {reading.master_numbers.map((num) => (
                        <span
                            key={num}
                            className="px-2 py-1 bg-yellow-500/20 border border-yellow-400 rounded text-yellow-200 text-xs"
                        >
                            Master {num}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CosmicNumerology;