// star-frontend/src/components/cosmic/ZodiacDisplaySystem.tsx
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

interface ZodiacSigns {
    western: string;
    chinese: string;
    vedic: string;
    mayan: string;
    galacticTone: number;
}

interface Sigil {
    id: string;
    points: number[][];
    strokes: any[];
    metadata: {
        zodiac_sign: string;
        archetype: string;
        element: string;
        generated_at: string;
    };
}

interface CosmicProfile {
    zodiacSigns: ZodiacSigns;
    archetype?: {
        primary: string;
        mentor: string;
    };
    selectedSigil?: Sigil;
    badges?: any[];
    elementalBalance: {
        fire: number;
        earth: number;
        air: number;
        water: number;
    };
}

interface ZodiacDisplaySystemProps {
    profile: CosmicProfile;
    displayMode: 'grid' | 'carousel' | 'orbit' | 'shrine';
    onBadgeSelect?: (badge: any) => void;
    onSigilSelect?: (sigil: Sigil) => void;
}

// Zodiac Sign Icons and Metadata
const ZODIAC_METADATA = {
    aries: {
        symbol: '♈',
        element: 'fire',
        ruler: 'mars',
        colors: ['#ff4444', '#ff6666'],
        glyph: '♂',
        season: 'spring'
    },
    taurus: {
        symbol: '♉',
        element: 'earth',
        ruler: 'venus',
        colors: ['#44ff44', '#66ff66'],
        glyph: '♀',
        season: 'spring'
    },
    gemini: {
        symbol: '♊',
        element: 'air',
        ruler: 'mercury',
        colors: ['#ffff44', '#ffff66'],
        glyph: '☿',
        season: 'spring'
    },
    cancer: {
        symbol: '♋',
        element: 'water',
        ruler: 'moon',
        colors: ['#4444ff', '#6666ff'],
        glyph: '☽',
        season: 'summer'
    },
    leo: {
        symbol: '♌',
        element: 'fire',
        ruler: 'sun',
        colors: ['#ffaa44', '#ffcc66'],
        glyph: '☉',
        season: 'summer'
    },
    virgo: {
        symbol: '♍',
        element: 'earth',
        ruler: 'mercury',
        colors: ['#44aa44', '#66cc66'],
        glyph: '☿',
        season: 'summer'
    },
    libra: {
        symbol: '♎',
        element: 'air',
        ruler: 'venus',
        colors: ['#ff44ff', '#ff66ff'],
        glyph: '♀',
        season: 'autumn'
    },
    scorpio: {
        symbol: '♏',
        element: 'water',
        ruler: 'mars',
        colors: ['#aa44aa', '#cc66cc'],
        glyph: '♂',
        season: 'autumn'
    },
    sagittarius: {
        symbol: '♐',
        element: 'fire',
        ruler: 'jupiter',
        colors: ['#44aaff', '#66ccff'],
        glyph: '♃',
        season: 'autumn'
    },
    capricorn: {
        symbol: '♑',
        element: 'earth',
        ruler: 'saturn',
        colors: ['#666666', '#888888'],
        glyph: '♄',
        season: 'winter'
    },
    aquarius: {
        symbol: '♒',
        element: 'air',
        ruler: 'uranus',
        colors: ['#44ffff', '#66ffff'],
        glyph: '♅',
        season: 'winter'
    },
    pisces: {
        symbol: '♓',
        element: 'water',
        ruler: 'neptune',
        colors: ['#4488ff', '#66aaff'],
        glyph: '♆',
        season: 'winter'
    }
};

// Elemental Aura Styles
const ELEMENTAL_AURAS = {
    fire: {
        background: 'radial-gradient(circle, rgba(255,68,68,0.3) 0%, rgba(255,102,68,0.1) 70%, transparent 100%)',
        animation: 'fireFlicker',
        particles: '🔥'
    },
    earth: {
        background: 'radial-gradient(circle, rgba(68,170,68,0.3) 0%, rgba(102,204,102,0.1) 70%, transparent 100%)',
        animation: 'earthPulse',
        particles: '🌱'
    },
    air: {
        background: 'radial-gradient(circle, rgba(255,255,68,0.3) 0%, rgba(255,255,102,0.1) 70%, transparent 100%)',
        animation: 'airFlow',
        particles: '💨'
    },
    water: {
        background: 'radial-gradient(circle, rgba(68,68,255,0.3) 0%, rgba(102,102,255,0.1) 70%, transparent 100%)',
        animation: 'waterRipple',
        particles: '💧'
    }
};

const ZodiacDisplaySystem: React.FC<ZodiacDisplaySystemProps> = ({
    profile,
    displayMode,
    onBadgeSelect,
    onSigilSelect
}) => {
    const [selectedView, setSelectedView] = useState<'sigils' | 'badges' | 'glyphs'>('sigils');
    const [isAnimating, setIsAnimating] = useState(false);

    const primaryZodiac = profile.zodiacSigns?.western?.toLowerCase() || 'scorpio';
    const zodiacData = ZODIAC_METADATA[primaryZodiac as keyof typeof ZODIAC_METADATA];
    const primaryElement = zodiacData?.element || 'water';
    const elementalAura = ELEMENTAL_AURAS[primaryElement as keyof typeof ELEMENTAL_AURAS];

    // Render Zodiac Sigil Shrine (Grid Layout)
    const renderSigilShrine = () => (
        <motion.div
            className="relative p-8 rounded-3xl backdrop-blur-sm border border-purple-500/30"
            style={{ background: elementalAura.background }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                    🔮 Zodiac Sigil Shrine
                </h2>
                <p className="text-purple-300">
                    Your Sacred Cosmic Symbols
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                {/* Primary Zodiac Sigil */}
                <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSigilSelect?.(profile.selectedSigil!)}
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-3xl cursor-pointer">
                        {zodiacData?.symbol}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs text-purple-300 bg-black/50 px-2 py-1 rounded">
                            {primaryZodiac}
                        </span>
                    </div>
                </motion.div>

                {/* Archetype Sigil */}
                <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-2xl cursor-pointer">
                        {getArchetypeSymbol(profile.archetype?.primary)}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs text-purple-300 bg-black/50 px-2 py-1 rounded">
                            {profile.archetype?.primary}
                        </span>
                    </div>
                </motion.div>

                {/* Elemental Sigil */}
                <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-3xl cursor-pointer"
                        style={{
                            background: `linear-gradient(45deg, ${zodiacData?.colors[0]}, ${zodiacData?.colors[1]})`
                        }}
                    >
                        {getElementalSymbol(primaryElement)}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs text-purple-300 bg-black/50 px-2 py-1 rounded">
                            {primaryElement}
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Planetary Glyph Overlay */}
            <motion.div
                className="absolute top-4 right-4 text-4xl opacity-70"
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity }
                }}
            >
                {zodiacData?.glyph}
            </motion.div>
        </motion.div>
    );

    // Render Carousel View
    const renderCarousel = () => (
        <motion.div
            className="relative w-full max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {generateCarouselItems().map((item, index) => (
                    <motion.div
                        key={index}
                        className="flex-shrink-0 w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-purple-500/30 flex items-center justify-center text-4xl cursor-pointer"
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleItemSelect(item)}
                    >
                        {item.symbol}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    // Render Floating Orbit (3D Badge Ring)
    const renderFloatingOrbit = () => (
        <motion.div
            className="relative w-80 h-80 mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Central Avatar */}
            <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-3xl">
                {zodiacData?.symbol}
            </div>

            {/* Orbiting Badges */}
            {generateOrbitItems().map((item, index) => (
                <motion.div
                    key={index}
                    className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xl cursor-pointer"
                    style={{
                        left: '50%',
                        top: '50%',
                        transformOrigin: '50% 50%'
                    }}
                    animate={{
                        rotate: 360,
                        x: Math.cos((index * 60) * Math.PI / 180) * 120 - 32,
                        y: Math.sin((index * 60) * Math.PI / 180) * 120 - 32
                    }}
                    transition={{
                        rotate: { duration: 15 + index * 2, repeat: Infinity, ease: "linear" },
                        x: { duration: 0 },
                        y: { duration: 0 }
                    }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => handleItemSelect(item)}
                >
                    {item.symbol}
                </motion.div>
            ))}
        </motion.div>
    );

    // Helper Functions
    const getArchetypeSymbol = (archetype?: string) => {
        const symbols = {
            seeker: '🔍',
            guardian: '🛡️',
            rebel: '⚡',
            mystic: '🔮'
        };
        return symbols[archetype as keyof typeof symbols] || '✨';
    };

    const getElementalSymbol = (element: string) => {
        const symbols = {
            fire: '🔥',
            earth: '🌍',
            air: '💨',
            water: '🌊'
        };
        return symbols[element as keyof typeof symbols] || '✨';
    };

    const generateCarouselItems = () => [
        { symbol: zodiacData?.symbol, type: 'zodiac', data: primaryZodiac },
        { symbol: getArchetypeSymbol(profile.archetype?.primary), type: 'archetype', data: profile.archetype?.primary },
        { symbol: getElementalSymbol(primaryElement), type: 'element', data: primaryElement },
        { symbol: zodiacData?.glyph, type: 'planetary', data: zodiacData?.ruler },
        { symbol: '🌟', type: 'galactic', data: profile.zodiacSigns?.galacticTone }
    ];

    const generateOrbitItems = () => [
        { symbol: zodiacData?.glyph, type: 'planetary' },
        { symbol: getElementalSymbol(primaryElement), type: 'element' },
        { symbol: getArchetypeSymbol(profile.archetype?.primary), type: 'archetype' },
        { symbol: '🌙', type: 'lunar' },
        { symbol: '⭐', type: 'stellar' },
        { symbol: '🌟', type: 'galactic' }
    ];

    const handleItemSelect = (item: any) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        if (item.type === 'sigil' && onSigilSelect) {
            onSigilSelect(item.data);
        } else if (onBadgeSelect) {
            onBadgeSelect(item);
        }
    };

    // Main Render
    return (
        <div className="relative w-full">
            {/* Display Mode Selector */}
            <div className="flex justify-center mb-6 space-x-2">
                {['grid', 'carousel', 'orbit', 'shrine'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setSelectedView(mode as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${displayMode === mode
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/40'
                            }`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
            </div>

            {/* Display Content */}
            <AnimatePresence mode="wait">
                {displayMode === 'shrine' && (
                    <motion.div key="shrine">
                        {renderSigilShrine()}
                    </motion.div>
                )}
                {displayMode === 'carousel' && (
                    <motion.div key="carousel">
                        {renderCarousel()}
                    </motion.div>
                )}
                {displayMode === 'orbit' && (
                    <motion.div key="orbit">
                        {renderFloatingOrbit()}
                    </motion.div>
                )}
                {displayMode === 'grid' && (
                    <motion.div key="grid">
                        {renderSigilShrine()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Elemental Particles Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-2xl opacity-40"
                        initial={{
                            x: Math.random() * 400,
                            y: Math.random() * 400,
                        }}
                        animate={{
                            x: Math.random() * 400,
                            y: Math.random() * 400,
                            rotate: 360
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        {elementalAura.particles}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ZodiacDisplaySystem;