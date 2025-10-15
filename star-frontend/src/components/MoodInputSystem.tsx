'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

interface MoodState {
    primary: string;
    intensity: number;
    elements: string[];
    zodiacInfluence: string;
}

interface MoodInputSystemProps {
    onMoodChange: (mood: MoodState) => void;
    userZodiac?: string;
}

const MoodInputSystem: React.FC<MoodInputSystemProps> = ({
    onMoodChange,
    userZodiac = 'libra'
}) => {
    const [selectedMood, setSelectedMood] = useState<string>('');
    const [intensity, setIntensity] = useState<number>(5);
    const [activeElements, setActiveElements] = useState<string[]>([]);
    const [showDetails, setShowDetails] = useState<boolean>(false);

    // Cosmic mood categories with zodiac influences
    const cosmicMoods = {
        fire: {
            excited: {
                color: '#ff6b35',
                cosmic: '🔥✨',
                description: 'Burning bright with passion and energy',
                zodiacs: ['aries', 'leo', 'sagittarius']
            },
            passionate: {
                color: '#ff4757',
                cosmic: '💫🔥',
                description: 'Deep flames of desire and creation',
                zodiacs: ['aries', 'scorpio', 'leo']
            },
            motivated: {
                color: '#ffa726',
                cosmic: '⚡🌟',
                description: 'Solar energy driving forward motion',
                zodiacs: ['leo', 'sagittarius', 'aries']
            },
            angry: {
                color: '#d32f2f',
                cosmic: '⚡🌋',
                description: 'Volcanic energy seeking transformation',
                zodiacs: ['aries', 'scorpio', 'mars']
            }
        },
        water: {
            peaceful: {
                color: '#42a5f5',
                cosmic: '🌊💙',
                description: 'Flowing like gentle streams',
                zodiacs: ['pisces', 'cancer', 'libra']
            },
            emotional: {
                color: '#5c6bc0',
                cosmic: '🌙💧',
                description: 'Deep lunar tides of feeling',
                zodiacs: ['cancer', 'scorpio', 'pisces']
            },
            intuitive: {
                color: '#7e57c2',
                cosmic: '🔮💫',
                description: 'Psychic waters of inner knowing',
                zodiacs: ['pisces', 'scorpio', 'cancer']
            },
            sad: {
                color: '#546e7a',
                cosmic: '🌧️💙',
                description: 'Cleansing rains of release',
                zodiacs: ['cancer', 'pisces', 'moon']
            }
        },
        earth: {
            grounded: {
                color: '#8bc34a',
                cosmic: '🌱🏔️',
                description: 'Rooted in stability and strength',
                zodiacs: ['taurus', 'virgo', 'capricorn']
            },
            focused: {
                color: '#66bb6a',
                cosmic: '🎯🌿',
                description: 'Crystalline clarity of purpose',
                zodiacs: ['virgo', 'capricorn', 'taurus']
            },
            nurturing: {
                color: '#81c784',
                cosmic: '🌸🤱',
                description: 'Earth mother energy of care',
                zodiacs: ['taurus', 'cancer', 'virgo']
            },
            stuck: {
                color: '#795548',
                cosmic: '🪨⛰️',
                description: 'Heavy mountain energy needing movement',
                zodiacs: ['taurus', 'capricorn', 'saturn']
            }
        },
        air: {
            curious: {
                color: '#29b6f6',
                cosmic: '🧠💨',
                description: 'Mental winds of exploration',
                zodiacs: ['gemini', 'aquarius', 'libra']
            },
            social: {
                color: '#26c6da',
                cosmic: '👥🌬️',
                description: 'Harmonious connections and communication',
                zodiacs: ['libra', 'gemini', 'aquarius']
            },
            creative: {
                color: '#ab47bc',
                cosmic: '🎨💫',
                description: 'Innovative breeze of inspiration',
                zodiacs: ['aquarius', 'gemini', 'libra']
            },
            anxious: {
                color: '#78909c',
                cosmic: '🌪️😰',
                description: 'Whirlwind thoughts seeking calm',
                zodiacs: ['gemini', 'virgo', 'mercury']
            }
        }
    };

    // Zodiac-specific mood amplifiers
    const zodiacAmplifiers = {
        aries: { element: 'fire', amplifier: 1.3, trait: 'intensity' },
        taurus: { element: 'earth', amplifier: 1.1, trait: 'stability' },
        gemini: { element: 'air', amplifier: 1.4, trait: 'variety' },
        cancer: { element: 'water', amplifier: 1.2, trait: 'depth' },
        leo: { element: 'fire', amplifier: 1.5, trait: 'expression' },
        virgo: { element: 'earth', amplifier: 1.2, trait: 'precision' },
        libra: { element: 'air', amplifier: 1.1, trait: 'harmony' },
        scorpio: { element: 'water', amplifier: 1.6, trait: 'transformation' },
        sagittarius: { element: 'fire', amplifier: 1.4, trait: 'exploration' },
        capricorn: { element: 'earth', amplifier: 1.3, trait: 'achievement' },
        aquarius: { element: 'air', amplifier: 1.5, trait: 'innovation' },
        pisces: { element: 'water', amplifier: 1.3, trait: 'empathy' }
    };

    const handleMoodSelect = (element: string, mood: string) => {
        setSelectedMood(`${element}_${mood}`);

        // Calculate zodiac influence
        const zodiacData = zodiacAmplifiers[userZodiac as keyof typeof zodiacAmplifiers];

        const moodState: MoodState = {
            primary: mood,
            intensity: intensity * (zodiacData?.amplifier || 1),
            elements: [element, ...(zodiacData?.element ? [zodiacData.element] : [])],
            zodiacInfluence: zodiacData?.trait || 'balance'
        };

        onMoodChange(moodState);
        setShowDetails(true);
    };

    const toggleElement = (element: string) => {
        setActiveElements(prev =>
            prev.includes(element)
                ? prev.filter(e => e !== element)
                : [...prev, element]
        );
    };

    return (
        <div className="mood-input-system p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl backdrop-blur-sm border border-white/10">
            <motion.h3
                className="text-2xl font-bold text-white mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                ✨ Cosmic Mood Reading ✨
            </motion.h3>

            {/* Elemental Mood Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(cosmicMoods).map(([element, moods]) => (
                    <motion.div
                        key={element}
                        className={`element-section p-4 rounded-lg border-2 transition-all duration-300 ${activeElements.includes(element)
                                ? 'border-yellow-400 bg-yellow-400/10'
                                : 'border-white/20 bg-white/5'
                            }`}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleElement(element)}
                    >
                        <div className="text-center mb-3">
                            <div className="text-3xl mb-2">
                                {element === 'fire' && '🔥'}
                                {element === 'water' && '🌊'}
                                {element === 'earth' && '🌱'}
                                {element === 'air' && '💨'}
                            </div>
                            <h4 className="text-white font-semibold capitalize">{element}</h4>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(moods).map(([mood, data]) => (
                                <motion.button
                                    key={mood}
                                    className={`mood-button w-full p-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedMood === `${element}_${mood}`
                                            ? 'ring-2 ring-yellow-400'
                                            : ''
                                        }`}
                                    style={{
                                        backgroundColor: data.color + '40',
                                        color: data.color,
                                        border: `1px solid ${data.color}60`
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoodSelect(element, mood);
                                    }}
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>{data.cosmic}</span>
                                        <span className="capitalize">{mood}</span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Intensity Slider */}
            <div className="intensity-control mb-6">
                <label className="block text-white font-medium mb-3">
                    Intensity Level: {intensity}/10
                </label>
                <motion.div className="relative">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={intensity}
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg appearance-none cursor-pointer"
                        aria-label="Mood intensity level"
                        title="Adjust intensity from 1 (gentle) to 10 (intense)"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Gentle</span>
                        <span>Moderate</span>
                        <span>Intense</span>
                    </div>
                </motion.div>
            </div>

            {/* Zodiac Influence Display */}
            <motion.div
                className="zodiac-influence p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">♈</span>
                        <span className="text-white font-medium capitalize">{userZodiac} Energy</span>
                    </div>
                    <div className="text-purple-300 text-sm">
                        {zodiacAmplifiers[userZodiac as keyof typeof zodiacAmplifiers]?.trait || 'balance'} enhanced
                    </div>
                </div>
            </motion.div>

            {/* Mood Details */}
            <AnimatePresence>
                {showDetails && selectedMood && (
                    <motion.div
                        className="mood-details mt-6 p-4 bg-black/20 rounded-lg border border-white/10"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h4 className="text-white font-semibold mb-2">Current Mood Analysis</h4>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-xl">✨</span>
                                <span className="text-white capitalize">{selectedMood.split('_')[1]}</span>
                                <span className="text-gray-400">({selectedMood.split('_')[0]} energy)</span>
                            </div>
                            <p className="text-gray-300 text-sm">
                                Cosmic energy reading for your current emotional state
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">Active elements:</span>
                                <div className="flex space-x-1">
                                    {activeElements.map((element) => (
                                        <span
                                            key={element}
                                            className="text-xs px-2 py-1 bg-white/10 rounded-full text-white capitalize"
                                        >
                                            {element}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default MoodInputSystem;