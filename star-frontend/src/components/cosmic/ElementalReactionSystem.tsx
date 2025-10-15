import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';

interface ElementalReaction {
    type: 'fire' | 'water' | 'air' | 'earth';
    emoji: string;
    name: string;
    color: string;
    gradient: string;
    sound?: string;
}

interface ZodiacAction {
    zodiac: string;
    action: string;
    emoji: string;
    description: string;
    color: string;
}

interface ReactionSystemProps {
    postId: string;
    currentReactions?: {
        fire: number;
        water: number;
        air: number;
        earth: number;
        zodiac_specific: { [zodiac: string]: number };
    };
    onReactionUpdate?: (reactions: any) => void;
    size?: 'small' | 'medium' | 'large';
}

const ElementalReactionSystem: React.FC<ReactionSystemProps> = ({
    postId,
    currentReactions = { fire: 0, water: 0, air: 0, earth: 0, zodiac_specific: {} },
    onReactionUpdate,
    size = 'medium'
}) => {
    const [reactions, setReactions] = useState(currentReactions);
    const [userReaction, setUserReaction] = useState<string | null>(null);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [animatingReactions, setAnimatingReactions] = useState<string[]>([]);
    const { user } = useAuth();
    const animationTimeoutRef = useRef<NodeJS.Timeout>();

    // Elemental reactions with mythic theming
    const elementalReactions: ElementalReaction[] = [
        {
            type: 'fire',
            emoji: '🔥',
            name: 'Ignite',
            color: 'text-red-400',
            gradient: 'from-red-500 to-orange-500',
            sound: 'fire-crackle.mp3'
        },
        {
            type: 'water',
            emoji: '🌊',
            name: 'Flow',
            color: 'text-blue-400',
            gradient: 'from-blue-500 to-cyan-500',
            sound: 'water-flow.mp3'
        },
        {
            type: 'air',
            emoji: '🌬️',
            name: 'Elevate',
            color: 'text-gray-300',
            gradient: 'from-gray-400 to-white',
            sound: 'wind-whisper.mp3'
        },
        {
            type: 'earth',
            emoji: '🌍',
            name: 'Ground',
            color: 'text-green-400',
            gradient: 'from-green-600 to-emerald-500',
            sound: 'earth-rumble.mp3'
        }
    ];

    // Zodiac-specific actions (expanded for all signs)
    const zodiacActions: ZodiacAction[] = [
        { zodiac: 'Aries', action: 'Charge', emoji: '⚡', description: 'Lead the cosmic charge', color: 'text-red-500' },
        { zodiac: 'Taurus', action: 'Anchor', emoji: '🏔️', description: 'Provide steady grounding', color: 'text-amber-600' },
        { zodiac: 'Gemini', action: 'Spark', emoji: '✨', description: 'Ignite brilliant ideas', color: 'text-yellow-400' },
        { zodiac: 'Cancer', action: 'Embrace', emoji: '🤗', description: 'Offer nurturing support', color: 'text-blue-300' },
        { zodiac: 'Leo', action: 'Radiate', emoji: '☀️', description: 'Shine cosmic confidence', color: 'text-orange-400' },
        { zodiac: 'Virgo', action: 'Refine', emoji: '💎', description: 'Perfect the details', color: 'text-purple-300' },
        { zodiac: 'Libra', action: 'Balance', emoji: '⚖️', description: 'Harmonize the energies', color: 'text-pink-400' },
        { zodiac: 'Scorpio', action: 'Sting', emoji: '🦂', description: 'Penetrate the depths', color: 'text-red-600' },
        { zodiac: 'Sagittarius', action: 'Aim', emoji: '🏹', description: 'Target higher truth', color: 'text-indigo-400' },
        { zodiac: 'Capricorn', action: 'Ascend', emoji: '🏔️', description: 'Climb to new heights', color: 'text-gray-600' },
        { zodiac: 'Aquarius', action: 'Innovate', emoji: '🔮', description: 'Channel future visions', color: 'text-cyan-400' },
        { zodiac: 'Pisces', action: 'Dream', emoji: '🌙', description: 'Swim in cosmic waters', color: 'text-purple-400' }
    ];

    // Get user's zodiac action
    const getUserZodiacAction = () => {
        const userZodiac = (user as any)?.zodiac_signs?.western || (user as any)?.zodiac;
        return zodiacActions.find(action => action.zodiac === userZodiac);
    };

    // Handle elemental reaction
    const handleElementalReaction = async (element: ElementalReaction) => {
        try {
            // Optimistic update
            const newReactions = { ...reactions };
            newReactions[element.type] = (newReactions[element.type] || 0) + 1;
            setReactions(newReactions);
            setUserReaction(element.type);

            // Trigger animation
            triggerReactionAnimation(element.type);

            // API call
            await axios.post(`/api/v1/posts/${postId}/react`, {
                reaction_type: 'elemental',
                element: element.type
            });

            // Notify parent component
            onReactionUpdate?.(newReactions);

            // Play sound effect (if enabled)
            if (element.sound) {
                playReactionSound(element.sound);
            }

        } catch (error) {
            console.error('Failed to send elemental reaction:', error);
            // Revert optimistic update on error
            setReactions(currentReactions);
        }
    };

    // Handle zodiac-specific reaction
    const handleZodiacReaction = async (zodiacAction: ZodiacAction) => {
        try {
            // Optimistic update
            const newReactions = { ...reactions };
            if (!newReactions.zodiac_specific) {
                newReactions.zodiac_specific = {};
            }
            newReactions.zodiac_specific[zodiacAction.zodiac] =
                (newReactions.zodiac_specific[zodiacAction.zodiac] || 0) + 1;

            setReactions(newReactions);
            setUserReaction(`zodiac_${zodiacAction.zodiac}`);

            // Trigger animation
            triggerReactionAnimation(`zodiac_${zodiacAction.zodiac}`);

            // API call
            await axios.post(`/api/v1/posts/${postId}/react`, {
                reaction_type: 'zodiac',
                zodiac: zodiacAction.zodiac,
                action: zodiacAction.action
            });

            // Notify parent component
            onReactionUpdate?.(newReactions);

        } catch (error) {
            console.error('Failed to send zodiac reaction:', error);
            // Revert optimistic update on error
            setReactions(currentReactions);
        }
    };

    // Trigger reaction animation
    const triggerReactionAnimation = (reactionType: string) => {
        setAnimatingReactions(prev => [...prev, reactionType]);

        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        animationTimeoutRef.current = setTimeout(() => {
            setAnimatingReactions(prev => prev.filter(r => r !== reactionType));
        }, 1000);
    };

    // Play reaction sound effect
    const playReactionSound = (soundFile: string) => {
        try {
            const audio = new Audio(`/sounds/reactions/${soundFile}`);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore audio play errors (user interaction required)
            });
        } catch (error) {
            console.error('Failed to play reaction sound:', error);
        }
    };

    // Calculate total reactions
    const getTotalReactions = () => {
        const elementalTotal = reactions.fire + reactions.water + reactions.air + reactions.earth;
        const zodiacTotal = Object.values(reactions.zodiac_specific || {}).reduce((sum, count) => sum + count, 0);
        return elementalTotal + zodiacTotal;
    };

    // Get size classes
    const getSizeClasses = () => {
        switch (size) {
            case 'small': return { button: 'p-1 text-xs', icon: 'text-sm', count: 'text-xs' };
            case 'large': return { button: 'p-3 text-lg', icon: 'text-2xl', count: 'text-lg' };
            default: return { button: 'p-2 text-sm', icon: 'text-lg', count: 'text-sm' };
        }
    };

    const sizeClasses = getSizeClasses();
    const userZodiacAction = getUserZodiacAction();

    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="elemental-reaction-system relative">
            {/* Main Reaction Button */}
            <div className="flex items-center gap-2">
                {/* Reaction Picker Toggle */}
                <motion.button
                    className={`${sizeClasses.button} bg-purple-900/30 hover:bg-purple-800/50 rounded-full border border-purple-500/30 hover:border-purple-400/50 transition-all flex items-center gap-2 ${sizeClasses.icon}`}
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span>✨</span>
                    <span className={`${sizeClasses.count} text-purple-300`}>
                        {getTotalReactions()}
                    </span>
                </motion.button>

                {/* Quick Elemental Reactions */}
                <div className="flex gap-1">
                    {elementalReactions.map((element) => {
                        const count = reactions[element.type] || 0;
                        const isAnimating = animatingReactions.includes(element.type);

                        if (count === 0 && size === 'small') return null;

                        return (
                            <motion.button
                                key={element.type}
                                className={`${sizeClasses.button} hover:bg-black/30 rounded-full flex items-center gap-1 transition-all ${element.color}`}
                                onClick={() => handleElementalReaction(element)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                animate={isAnimating ? {
                                    scale: [1, 1.3, 1],
                                    rotate: [0, 10, -10, 0],
                                } : {}}
                                transition={{ duration: 0.6 }}
                            >
                                <span className={sizeClasses.icon}>{element.emoji}</span>
                                {count > 0 && (
                                    <span className={`${sizeClasses.count} font-semibold`}>
                                        {count}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Zodiac Reaction (if user has one) */}
                {userZodiacAction && (
                    <motion.button
                        className={`${sizeClasses.button} hover:bg-black/30 rounded-full flex items-center gap-1 transition-all ${userZodiacAction.color} border border-current/20`}
                        onClick={() => handleZodiacReaction(userZodiacAction)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={animatingReactions.includes(`zodiac_${userZodiacAction.zodiac}`) ? {
                            scale: [1, 1.3, 1],
                            rotate: [0, 15, -15, 0],
                        } : {}}
                        title={`${userZodiacAction.action}: ${userZodiacAction.description}`}
                    >
                        <span className={sizeClasses.icon}>{userZodiacAction.emoji}</span>
                        {(reactions.zodiac_specific?.[userZodiacAction.zodiac] || 0) > 0 && (
                            <span className={`${sizeClasses.count} font-semibold`}>
                                {reactions.zodiac_specific[userZodiacAction.zodiac]}
                            </span>
                        )}
                    </motion.button>
                )}
            </div>

            {/* Expanded Reaction Picker */}
            <AnimatePresence>
                {showReactionPicker && (
                    <motion.div
                        className="absolute bottom-full mb-2 left-0 z-50 bg-black/90 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 shadow-2xl min-w-80"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => setShowReactionPicker(false)}
                        >
                            ✕
                        </button>

                        <div className="space-y-4">
                            {/* Elemental Reactions */}
                            <div>
                                <h4 className="text-purple-200 text-sm font-semibold mb-2">
                                    🌟 Elemental Resonance
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {elementalReactions.map((element) => (
                                        <motion.button
                                            key={element.type}
                                            className={`p-3 bg-gradient-to-r ${element.gradient} rounded-lg text-white font-semibold flex items-center gap-2 hover:shadow-lg transition-all`}
                                            onClick={() => {
                                                handleElementalReaction(element);
                                                setShowReactionPicker(false);
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span className="text-lg">{element.emoji}</span>
                                            <div className="text-left">
                                                <div className="text-sm">{element.name}</div>
                                                <div className="text-xs opacity-80">
                                                    {reactions[element.type] || 0} reactions
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Zodiac Actions */}
                            <div>
                                <h4 className="text-purple-200 text-sm font-semibold mb-2">
                                    ♈ Zodiac Powers
                                </h4>
                                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                                    {zodiacActions.map((zodiac) => {
                                        const count = reactions.zodiac_specific?.[zodiac.zodiac] || 0;
                                        return (
                                            <motion.button
                                                key={zodiac.zodiac}
                                                className={`p-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg ${zodiac.color} hover:from-gray-700 hover:to-gray-600 transition-all flex items-center gap-3`}
                                                onClick={() => {
                                                    handleZodiacReaction(zodiac);
                                                    setShowReactionPicker(false);
                                                }}
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <span className="text-lg">{zodiac.emoji}</span>
                                                <div className="flex-1 text-left">
                                                    <div className="text-sm font-semibold">
                                                        {zodiac.zodiac} • {zodiac.action}
                                                    </div>
                                                    <div className="text-xs opacity-70">
                                                        {zodiac.description}
                                                    </div>
                                                </div>
                                                {count > 0 && (
                                                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                                                        {count}
                                                    </span>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Reaction Animations */}
            <div className="absolute inset-0 pointer-events-none">
                {animatingReactions.map((reactionType, index) => (
                    <motion.div
                        key={`${reactionType}-${index}`}
                        className="absolute text-2xl"
                        initial={{
                            x: 20,
                            y: 0,
                            opacity: 1,
                            scale: 1
                        }}
                        animate={{
                            x: 20 + Math.random() * 60,
                            y: -50 - Math.random() * 30,
                            opacity: 0,
                            scale: 1.5,
                            rotate: Math.random() * 360
                        }}
                        transition={{ duration: 1 }}
                    >
                        {reactionType.startsWith('zodiac_')
                            ? zodiacActions.find(z => z.zodiac === reactionType.replace('zodiac_', ''))?.emoji
                            : elementalReactions.find(e => e.type === reactionType)?.emoji
                        }
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ElementalReactionSystem;