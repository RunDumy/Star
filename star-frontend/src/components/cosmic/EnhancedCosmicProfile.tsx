// star-frontend/src/components/cosmic/EnhancedCosmicProfile.tsx
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import ZodiacDisplaySystem from './ZodiacDisplaySystem';

interface CosmicProfile {
    id: string;
    userId: string;
    zodiacSigns: {
        western: string;
        chinese: string;
        vedic: string;
        mayan: string;
        galacticTone: number;
    };
    numerology: {
        lifePathNumber: number;
        personalYear: number;
    };
    archetype: {
        primary: string;
        secondary: string;
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
    badges: Array<{
        id: string;
        name: string;
        category: string;
        x: number;
        y: number;
        earned_at: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
    elementalBalance: {
        fire: number;
        earth: number;
        air: number;
        water: number;
    };
}

interface EnhancedCosmicProfileProps {
    userId: string;
    profileData?: CosmicProfile;
    onProfileUpdate?: (profile: CosmicProfile) => void;
}

const EnhancedCosmicProfile: React.FC<EnhancedCosmicProfileProps> = ({
    userId,
    profileData,
    onProfileUpdate
}) => {
    const [profile, setProfile] = useState<CosmicProfile | null>(profileData || null);
    const [loading, setLoading] = useState(!profileData);
    const [activeTab, setActiveTab] = useState<'overview' | 'sigils' | 'badges' | 'elements'>('overview');
    const [displayMode, setDisplayMode] = useState<'grid' | 'carousel' | 'orbit' | 'shrine'>('shrine');



    const handleBadgeSelect = (badge: any) => {
        console.log('[STAR] Badge selected:', badge);
        // Handle badge selection logic
    };

    const handleSigilSelect = (sigil: any) => {
        console.log('[STAR] Sigil selected:', sigil);
        // Handle sigil selection logic
    };

    const calculateElementalDominance = () => {
        if (!profile?.elementalBalance) return 'balanced';

        const elements = profile.elementalBalance;
        const maxElement = Object.entries(elements).reduce((a, b) =>
            elements[a[0] as keyof typeof elements] > elements[b[0] as keyof typeof elements] ? a : b
        );

        return maxElement[0];
    };

    const getElementalPercentage = (element: keyof typeof profile.elementalBalance) => {
        if (!profile?.elementalBalance) return 0;
        const total = Object.values(profile.elementalBalance).reduce((sum, val) => sum + val, 0);
        return total > 0 ? (profile.elementalBalance[element] / total) * 100 : 0;
    };

    const renderOverviewTab = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Primary Zodiac Info */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-3">🌟</span>
                    Cosmic Identity
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl mb-2">♈</div>
                        <div className="text-sm text-purple-300">Western</div>
                        <div className="text-white font-medium">{profile?.zodiacSigns.western}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">🐉</div>
                        <div className="text-sm text-purple-300">Chinese</div>
                        <div className="text-white font-medium">{profile?.zodiacSigns.chinese}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">🕉️</div>
                        <div className="text-sm text-purple-300">Vedic</div>
                        <div className="text-white font-medium">{profile?.zodiacSigns.vedic}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl mb-2">🌀</div>
                        <div className="text-sm text-purple-300">Galactic</div>
                        <div className="text-white font-medium">Tone {profile?.zodiacSigns.galacticTone}</div>
                    </div>
                </div>
            </div>

            {/* Archetype & Numerology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center">
                        <span className="text-xl mr-2">🎭</span>
                        Archetype
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-indigo-300">Primary:</span>
                            <span className="text-white font-medium">{profile?.archetype.primary}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-indigo-300">Mentor:</span>
                            <span className="text-white font-medium">{profile?.archetype.mentor}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-900/50 to-red-900/50 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
                    <h4 className="text-lg font-bold text-white mb-3 flex items-center">
                        <span className="text-xl mr-2">🔢</span>
                        Numerology
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-pink-300">Life Path:</span>
                            <span className="text-white font-medium">{profile?.numerology.lifePathNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-pink-300">Personal Year:</span>
                            <span className="text-white font-medium">{profile?.numerology.personalYear}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderElementsTab = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-2xl mr-3">🌟</span>
                    Elemental Balance
                </h3>

                <div className="space-y-4">
                    {profile && Object.entries(profile.elementalBalance).map(([element, value]) => (
                        <div key={element} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white font-medium flex items-center">
                                    <span className="mr-2">
                                        {element === 'fire' && '🔥'}
                                        {element === 'earth' && '🌍'}
                                        {element === 'air' && '💨'}
                                        {element === 'water' && '🌊'}
                                    </span>
                                    {element.charAt(0).toUpperCase() + element.slice(1)}
                                </span>
                                <span className="text-purple-300">
                                    {getElementalPercentage(element as keyof typeof profile.elementalBalance).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div
                                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getElementalPercentage(element as keyof typeof profile.elementalBalance)}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-purple-800/30 rounded-xl">
                    <p className="text-purple-200 text-sm">
                        <strong>Dominant Element:</strong> {calculateElementalDominance().charAt(0).toUpperCase() + calculateElementalDominance().slice(1)}
                    </p>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <motion.div
                    className="text-4xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    🌟
                </motion.div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <p className="text-white">No cosmic profile found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-bold text-white mb-2">
                    🌟 Cosmic Profile
                </h1>
                <p className="text-purple-300">
                    Your celestial identity and spiritual essence
                </p>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex justify-center space-x-2">
                {[
                    { id: 'overview', label: 'Overview', icon: '🏛️' },
                    { id: 'sigils', label: 'Sigils', icon: '🔮' },
                    { id: 'badges', label: 'Badges', icon: '🏆' },
                    { id: 'elements', label: 'Elements', icon: '🌟' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center ${activeTab === tab.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/40'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div key="overview">
                        {renderOverviewTab()}
                    </motion.div>
                )}

                {(activeTab === 'sigils' || activeTab === 'badges') && (
                    <motion.div key="display-system">
                        <div className="mb-4 flex justify-center space-x-2">
                            {['shrine', 'carousel', 'orbit', 'grid'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setDisplayMode(mode as any)}
                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${displayMode === mode
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/40'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <ZodiacDisplaySystem
                            profile={profile}
                            displayMode={displayMode}
                            onBadgeSelect={handleBadgeSelect}
                            onSigilSelect={handleSigilSelect}
                        />
                    </motion.div>
                )}

                {activeTab === 'elements' && (
                    <motion.div key="elements">
                        {renderElementsTab()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnhancedCosmicProfile;