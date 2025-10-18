'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FiShare2, FiTarget } from 'react-icons/fi';
import {
    GiCheckMark,
    GiCrystalBall,
    GiMoon,
    GiSparkles
} from 'react-icons/gi';
import { cosmicAPI } from '../../lib/api';
import { MentorGuidance, Quest } from '../../types/cosmic-intelligence';

interface CosmicSocialShareProps {
    isOpen: boolean;
    onClose: () => void;
    quest?: Quest;
    mentorGuidance?: MentorGuidance;
    lunarEvent?: {
        type: string;
        title: string;
        description: string;
        significance: string;
    };
}

export function CosmicSocialShare({
    isOpen,
    onClose,
    quest,
    mentorGuidance,
    lunarEvent
}: CosmicSocialShareProps) {
    const [customMessage, setCustomMessage] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);

    const getShareContent = () => {
        if (quest) {
            return {
                type: 'quest_progress',
                title: `Completed: ${quest.title}`,
                defaultMessage: `🌙 Just completed "${quest.title}" - ${quest.description}. Gained ${quest.rewards.cosmic_energy} cosmic energy! The journey continues... ✨`,
                icon: <FiTarget className="w-6 h-6 text-blue-400" />,
                color: 'blue'
            };
        }

        if (mentorGuidance) {
            return {
                type: 'mentor_insight',
                title: `Guidance from ${mentorGuidance.mentor}`,
                defaultMessage: `"${mentorGuidance.response}" - ${mentorGuidance.mentor}, ${mentorGuidance.archetype} (${mentorGuidance.mood} mood)`,
                icon: <GiCrystalBall className="w-6 h-6 text-purple-400" />,
                color: 'purple'
            };
        }

        if (lunarEvent) {
            return {
                type: 'lunar_event',
                title: lunarEvent.title,
                defaultMessage: `${lunarEvent.description} - ${lunarEvent.significance}`,
                icon: <GiMoon className="w-6 h-6 text-yellow-400" />,
                color: 'yellow'
            };
        }

        return null;
    };

    const shareContent = getShareContent();
    const messageToShare = customMessage.trim() || (shareContent?.defaultMessage || '');

    const handleShare = async () => {
        if (!shareContent || !messageToShare.trim()) return;

        setIsSharing(true);
        try {
            if (quest) {
                await cosmicAPI.shareQuestProgress(quest.id, messageToShare);
            } else if (mentorGuidance) {
                await cosmicAPI.shareMentorInsight(
                    mentorGuidance.mentor,
                    messageToShare
                );
            } else if (lunarEvent) {
                await cosmicAPI.shareLunarEvent(
                    lunarEvent.type,
                    { ...lunarEvent, message: messageToShare }
                );
            }

            setShareSuccess(true);
            setTimeout(() => {
                onClose();
                setShareSuccess(false);
                setCustomMessage('');
            }, 2000);

        } catch (error) {
            console.error('Error sharing to social feed:', error);
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen || !shareContent) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-gray-900 rounded-xl border border-gray-700 max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            {shareContent.icon}
                            <h3 className="text-lg font-bold text-white">Share to Cosmic Feed</h3>
                        </div>
                        <p className="text-gray-400 text-sm">{shareContent.title}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {shareSuccess ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-center py-8"
                            >
                                <GiCheckMark className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                <h4 className="text-white font-semibold mb-2">Shared Successfully!</h4>
                                <p className="text-gray-400 text-sm">Your cosmic moment is now visible to the community</p>
                            </motion.div>
                        ) : (
                            <>
                                {/* Preview */}
                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                            <GiSparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">You</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${shareContent.color === 'blue' ? 'bg-blue-900/50 text-blue-400' :
                                                        shareContent.color === 'purple' ? 'bg-purple-900/50 text-purple-400' :
                                                            'bg-yellow-900/50 text-yellow-400'
                                                    }`}>
                                                    {shareContent.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {messageToShare}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Customize your message (optional)
                                    </label>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Add your personal reflection..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        disabled={isSharing || !messageToShare.trim()}
                                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSharing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Sharing...
                                            </>
                                        ) : (
                                            <>
                                                <FiShare2 className="w-4 h-4" />
                                                Share
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook for easy integration
export function useCosmicSocialShare() {
    const [shareModal, setShareModal] = useState<{
        isOpen: boolean;
        quest?: Quest;
        mentorGuidance?: MentorGuidance;
        lunarEvent?: any;
    }>({
        isOpen: false
    });

    const shareQuest = (quest: Quest) => {
        setShareModal({ isOpen: true, quest });
    };

    const shareMentorGuidance = (guidance: MentorGuidance) => {
        setShareModal({ isOpen: true, mentorGuidance: guidance });
    };

    const shareLunarEvent = (event: any) => {
        setShareModal({ isOpen: true, lunarEvent: event });
    };

    const closeShare = () => {
        setShareModal({ isOpen: false });
    };

    return {
        shareQuest,
        shareMentorGuidance,
        shareLunarEvent,
        shareModal,
        closeShare
    };
}