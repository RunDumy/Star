// star-frontend/pages/cosmic-profile-showcase.tsx
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import ZodiacDisplaySystem from '../src/components/cosmic/ZodiacDisplaySystem';

interface CosmicProfile {
    zodiacSigns: {
        western: string;
        chinese: string;
        vedic: string;
        mayan: string;
        galacticTone: number;
    };
    archetype?: {
        primary: string;
        mentor: string;
    };
    selectedSigil?: {
        id: string;
        points: number[][];
        strokes: any[];
        metadata: {
            zodiac_sign: string;
            archetype: string;
            element: string;
            generated_at: string;
        };
    };
    badges?: any[];
    elementalBalance: {
        fire: number;
        earth: number;
        air: number;
        water: number;
    };
}

const CosmicProfileShowcase: React.FC = () => {
    const [selectedProfile, setSelectedProfile] = useState<'scorpio' | 'aries' | 'aquarius'>('scorpio');
    const [displayMode, setDisplayMode] = useState<'grid' | 'carousel' | 'orbit' | 'shrine'>('shrine');

    // Sample cosmic profiles for different zodiac signs
    const sampleProfiles: Record<string, CosmicProfile> = {
        scorpio: {
            zodiacSigns: {
                western: 'scorpio',
                chinese: 'dragon',
                vedic: 'libra',
                mayan: 'ahau',
                galacticTone: 8
            },
            archetype: {
                primary: 'mystic',
                mentor: 'the_shadow_weaver'
            },
            selectedSigil: {
                id: 'scorpio_mystic_transformation',
                points: [[50, 20], [80, 40], [60, 70], [30, 60], [50, 20]],
                strokes: [],
                metadata: {
                    zodiac_sign: 'scorpio',
                    archetype: 'mystic',
                    element: 'water',
                    generated_at: new Date().toISOString()
                }
            },
            elementalBalance: {
                fire: 15,
                earth: 20,
                air: 25,
                water: 40
            }
        },
        aries: {
            zodiacSigns: {
                western: 'aries',
                chinese: 'tiger',
                vedic: 'aries',
                mayan: 'imix',
                galacticTone: 3
            },
            archetype: {
                primary: 'rebel',
                mentor: 'the_flame_bringer'
            },
            elementalBalance: {
                fire: 45,
                earth: 20,
                air: 25,
                water: 10
            }
        },
        aquarius: {
            zodiacSigns: {
                western: 'aquarius',
                chinese: 'rabbit',
                vedic: 'capricorn',
                mayan: 'kawak',
                galacticTone: 11
            },
            archetype: {
                primary: 'seeker',
                mentor: 'the_star_whisperer'
            },
            elementalBalance: {
                fire: 20,
                earth: 15,
                air: 50,
                water: 15
            }
        }
    };

    const handleBadgeSelect = (badge: any) => {
        console.log('[STAR] Badge selected in showcase:', badge);
    };

    const handleSigilSelect = (sigil: any) => {
        console.log('[STAR] Sigil selected in showcase:', sigil);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        🌟 Zodiac Badge & Sigil Display System
                    </h1>
                    <p className="text-xl text-purple-300 mb-6">
                        Interactive Cosmic Identity Visualization
                    </p>
                    <div className="text-sm text-purple-400 space-y-1">
                        <p>✨ Zodiac Sigil Shrines with Elemental Auras</p>
                        <p>🎨 Dynamic Planetary Glyph Overlays</p>
                        <p>🌀 Multiple Display Modes: Grid, Carousel, Orbit</p>
                    </div>
                </motion.div>

                {/* Profile Selector */}
                <motion.div
                    className="flex justify-center mb-8 space-x-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {Object.entries(sampleProfiles).map(([key, profile]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedProfile(key as any)}
                            className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center space-x-2 ${selectedProfile === key
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/30'
                                }`}
                        >
                            <span className="text-xl">
                                {key === 'scorpio' && '♏'}
                                {key === 'aries' && '♈'}
                                {key === 'aquarius' && '♒'}
                            </span>
                            <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                            <span className="text-sm opacity-70">
                                ({profile.archetype?.primary})
                            </span>
                        </button>
                    ))}
                </motion.div>

                {/* Display Mode Selector */}
                <motion.div
                    className="flex justify-center mb-8 space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {(['shrine', 'carousel', 'orbit', 'grid'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setDisplayMode(mode)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${displayMode === mode
                                ? 'bg-indigo-600 text-white'
                                : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40'
                                }`}
                        >
                            {mode === 'shrine' && '🏛️'}
                            {mode === 'carousel' && '🎠'}
                            {mode === 'orbit' && '🌌'}
                            {mode === 'grid' && '⚡'}
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </motion.div>

                {/* Main Display System */}
                <motion.div
                    className="max-w-4xl mx-auto"
                    key={selectedProfile}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <ZodiacDisplaySystem
                        profile={sampleProfiles[selectedProfile]}
                        displayMode={displayMode}
                        onBadgeSelect={handleBadgeSelect}
                        onSigilSelect={handleSigilSelect}
                    />
                </motion.div>

                {/* Profile Details Panel */}
                <motion.div
                    className="mt-12 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <span className="text-2xl mr-3" role="img" aria-label="profile">👤</span>
                            Current Profile Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-purple-300 mb-2"><strong>Zodiac Signs:</strong></p>
                                <ul className="space-y-1 text-white/80">
                                    <li>Western: {sampleProfiles[selectedProfile].zodiacSigns.western}</li>
                                    <li>Chinese: {sampleProfiles[selectedProfile].zodiacSigns.chinese}</li>
                                    <li>Vedic: {sampleProfiles[selectedProfile].zodiacSigns.vedic}</li>
                                    <li>Galactic Tone: {sampleProfiles[selectedProfile].zodiacSigns.galacticTone}</li>
                                </ul>
                            </div>

                            <div>
                                <p className="text-purple-300 mb-2"><strong>Elemental Balance:</strong></p>
                                <ul className="space-y-1 text-white/80">
                                    {Object.entries(sampleProfiles[selectedProfile].elementalBalance).map(([element, value]) => (
                                        <li key={element}>
                                            {element.charAt(0).toUpperCase() + element.slice(1)}: {value}%
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                    className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <div className="bg-gradient-to-br from-purple-800/30 to-indigo-800/30 rounded-2xl p-6 border border-purple-500/20">
                        <h4 className="text-lg font-bold mb-3 flex items-center">
                            <span className="text-xl mr-2" role="img" aria-label="shrine">🏛️</span>
                            Zodiac Sigil Shrine
                        </h4>
                        <p className="text-sm text-purple-300">
                            Sacred display of your cosmic symbols with elemental auras, archetype sigils, and planetary glyph overlays.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-800/30 to-red-800/30 rounded-2xl p-6 border border-pink-500/20">
                        <h4 className="text-lg font-bold mb-3 flex items-center">
                            <span className="text-xl mr-2" role="img" aria-label="carousel">🎠</span>
                            Interactive Displays
                        </h4>
                        <p className="text-sm text-pink-300">
                            Multiple viewing modes including carousel scrolling and 3D orbital arrangements for immersive exploration.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-800/30 to-blue-800/30 rounded-2xl p-6 border border-indigo-500/20">
                        <h4 className="text-lg font-bold mb-3 flex items-center">
                            <span className="text-xl mr-2" role="img" aria-label="elements">🌟</span>
                            Elemental Animations
                        </h4>
                        <p className="text-sm text-indigo-300">
                            Dynamic visual effects based on your elemental balance with fire flickers, earth pulses, air flows, and water ripples.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CosmicProfileShowcase;