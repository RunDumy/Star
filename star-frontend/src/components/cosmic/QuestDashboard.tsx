'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiCheckCircle, FiPlay, FiTarget } from 'react-icons/fi';
import {
    GiCrystalBall,
    GiFire,
    GiMeditation,
    GiMoon,
    GiOrbital,
    GiSparkles,
    GiStarsStack,
    GiStoneBlock,
    GiWaterDrop,
    GiWhirlwind
} from 'react-icons/gi';
import { cosmicAPI } from '../../lib/api';
import { CosmicStats, Quest } from '../../types/cosmic-intelligence';
import { CosmicSocialShare, useCosmicSocialShare } from './CosmicSocialShare';

interface QuestDashboardProps {
    userId?: string;
    onQuestComplete?: (quest: Quest) => void;
}

export function QuestDashboard({ userId, onQuestComplete }: QuestDashboardProps) {
    const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
    const [recommendedQuests, setRecommendedQuests] = useState<Quest[]>([]);
    const [cosmicStats, setCosmicStats] = useState<CosmicStats | null>(null);
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { shareQuest, shareModal, closeShare } = useCosmicSocialShare(); useEffect(() => {
        loadQuestData();
    }, [userId]);

    const loadQuestData = async () => {
        try {
            setLoading(true);
            const [activeResponse, recommendedResponse, statsResponse] = await Promise.all([
                cosmicAPI.getActiveQuests(),
                cosmicAPI.getRecommendedQuests(),
                cosmicAPI.getCosmicStats()
            ]);

            setActiveQuests(activeResponse || []);
            setRecommendedQuests(recommendedResponse || []);
            setCosmicStats(statsResponse);
        } catch (err) {
            console.error('Error loading quest data:', err);
            setError('Failed to load quest data');
        } finally {
            setLoading(false);
        }
    };

    const startQuest = async (quest: Quest) => {
        try {
            await cosmicAPI.startQuest(quest.id);
            await loadQuestData(); // Refresh data
            setSelectedQuest(quest);
        } catch (err) {
            console.error('Error starting quest:', err);
            setError('Failed to start quest');
        }
    };

    const updateQuestProgress = async (questId: string, stepId: string, completed: boolean) => {
        try {
            await cosmicAPI.updateQuestProgress(questId, {
                step_id: stepId,
                completed,
                timestamp: new Date().toISOString()
            });
            await loadQuestData();
        } catch (err) {
            console.error('Error updating quest progress:', err);
        }
    };

    const completeQuest = async (quest: Quest) => {
        try {
            await cosmicAPI.completeQuest(quest.id, {
                completed_at: new Date().toISOString(),
                success: true
            });
            await loadQuestData();
            onQuestComplete?.(quest);

            // Automatically share quest completion to social feed
            shareQuest(quest);
        } catch (err) {
            console.error('Error completing quest:', err);
        }
    }; const getElementalIcon = (element: string) => {
        switch (element.toLowerCase()) {
            case 'fire': return <GiFire className="w-4 h-4 text-red-400" />;
            case 'water': return <GiWaterDrop className="w-4 h-4 text-blue-400" />;
            case 'air': return <GiWhirlwind className="w-4 h-4 text-green-400" />;
            case 'earth': return <GiStoneBlock className="w-4 h-4 text-yellow-400" />;
            default: return <GiSparkles className="w-4 h-4 text-purple-400" />;
        }
    }; const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-400 bg-green-400/10';
            case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
            case 'advanced': return 'text-orange-400 bg-orange-400/10';
            case 'master': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Cosmic Stats Header */}
            {cosmicStats && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/20"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">{cosmicStats.cosmic_energy_level}</div>
                            <div className="text-sm text-gray-400">Cosmic Energy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{cosmicStats.total_quests_completed}</div>
                            <div className="text-sm text-gray-400">Quests Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{cosmicStats.mentor_sessions}</div>
                            <div className="text-sm text-gray-400">Mentor Sessions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{cosmicStats.engagement_streak}</div>
                            <div className="text-sm text-gray-400">Day Streak</div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Quests */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <GiCrystalBall className="w-6 h-6 text-purple-400" />
                        Active Quests
                    </h2>

                    {activeQuests.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <GiMoon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No active quests. Choose a quest to begin your cosmic journey!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeQuests.map((quest) => (
                                <QuestCard
                                    key={quest.id}
                                    quest={quest}
                                    onUpdateProgress={updateQuestProgress}
                                    onComplete={completeQuest}
                                    onSelect={() => setSelectedQuest(quest)}
                                    isSelected={selectedQuest?.id === quest.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Recommended Quests */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <GiStarsStack className="w-5 h-5 text-yellow-400" />
                            Recommended for You
                        </h3>
                        <div className="grid gap-4">
                            {recommendedQuests.slice(0, 3).map((quest) => (
                                <motion.div
                                    key={quest.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-white">{quest.title}</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
                                            {quest.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
                                    <div className="flex items-center gap-2 mb-3">
                                        {quest.elemental_focus.map((element) => (
                                            <div key={element} className="flex items-center gap-1">
                                                {getElementalIcon(element)}
                                                <span className="text-xs text-gray-400">{element}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-400">
                                            {quest.duration_days} days • {quest.rewards.cosmic_energy} energy
                                        </div>
                                        <button
                                            onClick={() => startQuest(quest)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <FiPlay className="w-4 h-4" />
                                            Begin Quest
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quest Details Sidebar */}
                <div className="space-y-6">
                    {selectedQuest ? (
                        <QuestDetailPanel
                            quest={selectedQuest}
                            onUpdateProgress={updateQuestProgress}
                            onComplete={completeQuest}
                        />
                    ) : (
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 text-center">
                            <GiCrystalBall className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
                            <p className="text-gray-400">Select a quest to view details</p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center gap-2">
                                <GiMeditation className="w-4 h-4" />
                                Daily Meditation
                            </button>
                            <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center gap-2">
                                <GiOrbital className="w-4 h-4" />
                                Lunar Ritual
                            </button>
                            <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-2">
                                <GiCrystalBall className="w-4 h-4" />
                                Mentor Guidance
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 text-red-400">
                    {error}
                </div>
            )}

            <CosmicSocialShare
                isOpen={shareModal.isOpen}
                onClose={closeShare}
                quest={shareModal.quest}
            />
        </div>
    );
} interface QuestCardProps {
    quest: Quest;
    onUpdateProgress: (questId: string, stepId: string, completed: boolean) => void;
    onComplete: (quest: Quest) => void;
    onSelect: () => void;
    isSelected: boolean;
}

function QuestCard({ quest, onUpdateProgress, onComplete, onSelect, isSelected }: QuestCardProps) {
    const progressPercent = (quest.progress.current_step / quest.progress.total_steps) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gray-800/50 rounded-lg p-4 border transition-colors cursor-pointer ${isSelected ? 'border-purple-500/50 bg-purple-900/20' : 'border-gray-700/50 hover:border-purple-500/30'
                }`}
            onClick={onSelect}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-white">{quest.title}</h3>
                    <p className="text-gray-400 text-sm">{quest.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {quest.elemental_focus.map((element) => (
                        <div key={element} className="text-lg">
                            {element === 'fire' && <GiFire className="text-red-400" />}
                            {element === 'water' && <GiWaterDrop className="text-blue-400" />}
                            {element === 'air' && <GiWhirlwind className="text-green-400" />}
                            {element === 'earth' && <GiStoneBlock className="text-yellow-400" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{quest.progress.current_step}/{quest.progress.total_steps}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                    {quest.progress.success_probability}% success rate
                </div>
                {quest.progress.current_step === quest.progress.total_steps && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onComplete(quest);
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        <FiCheckCircle className="w-4 h-4" />
                        Complete
                    </button>
                )}
            </div>
        </motion.div>
    );
}

interface QuestDetailPanelProps {
    quest: Quest;
    onUpdateProgress: (questId: string, stepId: string, completed: boolean) => void;
    onComplete: (quest: Quest) => void;
}

function QuestDetailPanel({ quest, onUpdateProgress, onComplete }: QuestDetailPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 rounded-lg border border-gray-700/50"
        >
            <div className="p-4 border-b border-gray-700/50">
                <h3 className="font-semibold text-white text-lg">{quest.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{quest.description}</p>
            </div>

            <div className="p-4 space-y-4">
                <div>
                    <h4 className="font-medium text-white mb-2">Success Criteria</h4>
                    <ul className="space-y-1">
                        {quest.success_criteria.map((criteria, index) => (
                            <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                                <FiTarget className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {criteria}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="font-medium text-white mb-2">Rewards</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-yellow-400">
                            <GiSparkles className="w-4 h-4" />
                            {quest.rewards.cosmic_energy} Cosmic Energy
                        </div>
                        {quest.rewards.badges.length > 0 && (
                            <div className="text-purple-400">
                                {quest.rewards.badges.length} Badge{quest.rewards.badges.length !== 1 ? 's' : ''}
                            </div>
                        )}
                        {quest.rewards.mentor_sessions > 0 && (
                            <div className="text-blue-400">
                                {quest.rewards.mentor_sessions} Mentor Session{quest.rewards.mentor_sessions !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-700/50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-400">
                            Progress: {quest.progress.current_step}/{quest.progress.total_steps}
                        </div>
                        {quest.progress.current_step === quest.progress.total_steps ? (
                            <button
                                onClick={() => onComplete(quest)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors flex items-center gap-2"
                            >
                                <FiCheckCircle className="w-4 h-4" />
                                Complete Quest
                            </button>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Continue your journey...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}