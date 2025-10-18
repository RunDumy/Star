'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';
import {
    GiCrystalBall,
    GiFire,
    GiMeditation,
    GiMoon,
    GiSparkles,
    GiStarsStack,
    GiStoneBlock,
    GiWaterDrop,
    GiWhirlwind
} from 'react-icons/gi';
import { cosmicAPI } from '../../lib/api';
import { LunarGuidance } from '../../types/cosmic-intelligence';

interface LunarGuidancePanelProps {
    compact?: boolean;
    showActions?: boolean;
    onMeditationStart?: () => void;
}

export function LunarGuidancePanel({
    compact = false,
    showActions = true,
    onMeditationStart
}: LunarGuidancePanelProps) {
    const [lunarData, setLunarData] = useState<LunarGuidance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLunarData();
    }, []);

    const loadLunarData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await cosmicAPI.getLunarGuidance();
            setLunarData(data);
        } catch (err) {
            console.error('Error loading lunar guidance:', err);
            setError('Failed to load lunar guidance');
        } finally {
            setLoading(false);
        }
    };

    const getElementalIcon = (element: string) => {
        switch (element?.toLowerCase()) {
            case 'fire': return <GiFire className="w-5 h-5 text-red-400" />;
            case 'water': return <GiWaterDrop className="w-5 h-5 text-blue-400" />;
            case 'air': return <GiWhirlwind className="w-5 h-5 text-green-400" />;
            case 'earth': return <GiStoneBlock className="w-5 h-5 text-yellow-400" />;
            default: return <GiSparkles className="w-5 h-5 text-purple-400" />;
        }
    };

    const getPhaseColor = (phase: string) => {
        if (phase.toLowerCase().includes('new')) return 'text-slate-400';
        if (phase.toLowerCase().includes('crescent')) return 'text-blue-400';
        if (phase.toLowerCase().includes('quarter')) return 'text-yellow-400';
        if (phase.toLowerCase().includes('gibbous')) return 'text-orange-400';
        if (phase.toLowerCase().includes('full')) return 'text-yellow-300';
        if (phase.toLowerCase().includes('waning')) return 'text-indigo-400';
        return 'text-purple-400';
    };

    const getLunarEmoji = (phase: string) => {
        const phaseLower = phase.toLowerCase();
        if (phaseLower.includes('new')) return '🌑';
        if (phaseLower.includes('waxing crescent')) return '🌒';
        if (phaseLower.includes('first quarter')) return '🌓';
        if (phaseLower.includes('waxing gibbous')) return '🌔';
        if (phaseLower.includes('full')) return '🌕';
        if (phaseLower.includes('waning gibbous')) return '🌖';
        if (phaseLower.includes('last quarter')) return '🌗';
        if (phaseLower.includes('waning crescent')) return '🌘';
        return '🌙';
    };

    if (loading) {
        return (
            <div className={`bg-gray-800/50 rounded-lg border border-gray-700/50 p-6 ${compact ? 'p-4' : 'p-6'}`}>
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                </div>
            </div>
        );
    }

    if (error || !lunarData) {
        return (
            <div className={`bg-gray-800/50 rounded-lg border border-gray-700/50 p-6 ${compact ? 'p-4' : 'p-6'}`}>
                <div className="text-center text-gray-400">
                    <GiMoon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{error || 'Unable to load lunar guidance'}</p>
                    <button
                        onClick={loadLunarData}
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-slate-900/80 to-purple-900/30 rounded-lg border border-purple-500/20 overflow-hidden ${compact ? 'p-4' : 'p-6'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">{getLunarEmoji(lunarData.moon_phase)}</div>
                    <div>
                        <h3 className={`font-bold text-white ${compact ? 'text-lg' : 'text-xl'}`}>
                            Lunar Guidance
                        </h3>
                        <p className="text-sm text-gray-400">Current cosmic influences</p>
                    </div>
                </div>

                <button
                    onClick={loadLunarData}
                    className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                    title="Refresh lunar data"
                >
                    <FiRefreshCw className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Main Lunar Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GiMoon className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-400">Moon Phase</span>
                        </div>
                        <div className={`font-semibold ${getPhaseColor(lunarData.moon_phase)}`}>
                            {lunarData.moon_phase}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {lunarData.illumination} illuminated
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GiStarsStack className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-400">Lunar Mansion</span>
                        </div>
                        <div className="font-semibold text-yellow-400">
                            {lunarData.moon_mansion}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {lunarData.mansion_meaning}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {getElementalIcon(lunarData.element_emphasis)}
                            <span className="text-sm text-gray-400">Elemental Focus</span>
                        </div>
                        <div className="font-semibold text-purple-400 capitalize">
                            {lunarData.element_emphasis} Energy
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FiCalendar className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-gray-400">Lunar Day</span>
                        </div>
                        <div className="font-semibold text-green-400">
                            Day {lunarData.lunar_day}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GiCrystalBall className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-gray-400">Void of Course</span>
                        </div>
                        <div className={`font-semibold ${lunarData.void_of_course ? 'text-red-400' : 'text-green-400'}`}>
                            {lunarData.void_of_course ? 'Active' : 'Clear'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cosmic Weather */}
            <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                    <GiSparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <div className="text-sm font-medium text-white mb-1">Cosmic Weather</div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {lunarData.cosmic_weather}
                        </p>
                    </div>
                </div>
            </div>

            {/* Best Activities */}
            {!compact && (
                <div className="mb-4">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <GiMeditation className="w-4 h-4 text-blue-400" />
                        Recommended Activities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {lunarData.best_activities.slice(0, 4).map((activity, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/30 rounded px-3 py-2 text-sm text-gray-300"
                            >
                                {activity}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meditation Focus */}
            {!compact && lunarData.meditation_focus && (
                <div className="mb-4">
                    <h4 className="font-semibold text-white mb-2">Meditation Focus</h4>
                    <p className="text-sm text-gray-300 bg-gray-800/30 rounded p-3">
                        {lunarData.meditation_focus}
                    </p>
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2 pt-4 border-t border-gray-700/50">
                    <button
                        onClick={onMeditationStart}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <GiMeditation className="w-4 h-4" />
                        Lunar Meditation
                    </button>

                    <button
                        onClick={() => {/* Open mentor chat */ }}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <GiCrystalBall className="w-4 h-4" />
                        Seek Guidance
                    </button>
                </div>
            )}
        </motion.div>
    );
}