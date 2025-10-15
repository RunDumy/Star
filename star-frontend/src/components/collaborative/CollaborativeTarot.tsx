/**
 * Collaborative Tarot Reading Component
 * Enables shared tarot readings with real-time card draws, interpretations,
 * and synchronized spread interactions between participants.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    Eye,
    MessageCircle,
    Shuffle,
    Sparkles,
    Star,
    Users
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useCollaboration } from '../../lib/CollaborationContext';
import { CollaborationContainer, useCursorAwareness } from './LiveCursors';

// Tarot spread configurations
const TAROT_SPREADS = {
    three_card: {
        name: 'Three Card Spread',
        description: 'Past, Present, Future',
        positions: [
            { id: 'past', name: 'Past', x: 20, y: 50, description: 'What brought you here' },
            { id: 'present', name: 'Present', x: 50, y: 50, description: 'Current situation' },
            { id: 'future', name: 'Future', x: 80, y: 50, description: 'What lies ahead' }
        ]
    },
    celtic_cross: {
        name: 'Celtic Cross',
        description: 'Comprehensive 10-card reading',
        positions: [
            { id: 'situation', name: 'Current Situation', x: 50, y: 50, description: 'The heart of the matter' },
            { id: 'challenge', name: 'Challenge', x: 50, y: 35, description: 'Cross currents' },
            { id: 'distant_past', name: 'Distant Past', x: 35, y: 50, description: 'Foundation' },
            { id: 'recent_past', name: 'Recent Past', x: 50, y: 65, description: 'Recent influences' },
            { id: 'possible_outcome', name: 'Possible Outcome', x: 65, y: 50, description: 'Potential future' },
            { id: 'near_future', name: 'Near Future', x: 50, y: 20, description: 'Approaching influences' },
            { id: 'your_approach', name: 'Your Approach', x: 85, y: 80, description: 'Your inner state' },
            { id: 'external_influences', name: 'External Influences', x: 85, y: 65, description: 'Environmental factors' },
            { id: 'hopes_fears', name: 'Hopes & Fears', x: 85, y: 50, description: 'Inner desires and anxieties' },
            { id: 'final_outcome', name: 'Final Outcome', x: 85, y: 35, description: 'Ultimate resolution' }
        ]
    },
    elemental_cross: {
        name: 'Elemental Cross',
        description: 'Four elements harmony reading',
        positions: [
            { id: 'fire', name: 'Fire (Passion)', x: 50, y: 20, description: 'Creative energy and drive' },
            { id: 'water', name: 'Water (Emotion)', x: 80, y: 50, description: 'Feelings and intuition' },
            { id: 'earth', name: 'Earth (Material)', x: 50, y: 80, description: 'Practical matters' },
            { id: 'air', name: 'Air (Mental)', x: 20, y: 50, description: 'Thoughts and communication' },
            { id: 'spirit', name: 'Spirit (Center)', x: 50, y: 50, description: 'Spiritual essence' }
        ]
    }
};

// Sample tarot cards for demonstration
const SAMPLE_TAROT_CARDS = [
    { id: '0', name: 'The Fool', suit: 'major', meaning: 'New beginnings, innocence, adventure', image: '🃏' },
    { id: '1', name: 'The Magician', suit: 'major', meaning: 'Manifestation, willpower, desire', image: '🎩' },
    { id: '2', name: 'The High Priestess', suit: 'major', meaning: 'Intuition, sacred knowledge, divine feminine', image: '🔮' },
    { id: '3', name: 'The Empress', suit: 'major', meaning: 'Femininity, beauty, nature', image: '👑' },
    { id: '4', name: 'The Emperor', suit: 'major', meaning: 'Authority, structure, control', image: '⚖️' },
    { id: '5', name: 'The Hierophant', suit: 'major', meaning: 'Spiritual wisdom, conformity, tradition', image: '📿' },
    { id: '6', name: 'The Lovers', suit: 'major', meaning: 'Love, harmony, relationships', image: '💕' },
    { id: '7', name: 'The Chariot', suit: 'major', meaning: 'Control, willpower, success', image: '🏆' },
    { id: '8', name: 'Strength', suit: 'major', meaning: 'Strength, courage, patience', image: '🦁' },
    { id: '9', name: 'The Hermit', suit: 'major', meaning: 'Soul searching, introspection', image: '🏮' },
    { id: '10', name: 'Wheel of Fortune', suit: 'major', meaning: 'Good luck, karma, life cycles', image: '🎡' },
    { id: '11', name: 'Justice', suit: 'major', meaning: 'Justice, fairness, truth', image: '⚖️' },
    { id: '12', name: 'The Hanged Man', suit: 'major', meaning: 'Suspension, restriction, letting go', image: '🙃' },
    { id: '13', name: 'Death', suit: 'major', meaning: 'Endings, beginnings, change', image: '💀' },
    { id: '14', name: 'Temperance', suit: 'major', meaning: 'Balance, moderation, patience', image: '⚗️' },
    { id: '15', name: 'The Devil', suit: 'major', meaning: 'Bondage, addiction, sexuality', image: '😈' },
    { id: '16', name: 'The Tower', suit: 'major', meaning: 'Sudden change, upheaval', image: '🏗️' },
    { id: '17', name: 'The Star', suit: 'major', meaning: 'Hope, faith, purpose', image: '⭐' },
    { id: '18', name: 'The Moon', suit: 'major', meaning: 'Illusion, fear, anxiety', image: '🌙' },
    { id: '19', name: 'The Sun', suit: 'major', meaning: 'Happiness, success, vitality', image: '☀️' },
    { id: '20', name: 'Judgement', suit: 'major', meaning: 'Judgement, rebirth, inner calling', image: '📯' },
    { id: '21', name: 'The World', suit: 'major', meaning: 'Completion, accomplishment', image: '🌍' }
];

interface CollaborativeTarotProps {
    sessionId?: string;
}

interface TarotCard {
    id: string;
    name: string;
    suit: string;
    meaning: string;
    image: string;
    reversed?: boolean;
}

interface DrawnCard extends TarotCard {
    position: string;
    drawn_by: string;
    drawn_at: string;
    interpretation?: string;
    interpreted_by?: string;
}

export const CollaborativeTarot: React.FC<CollaborativeTarotProps> = ({ sessionId }) => {
    const { currentSession, sendTarotEvent, syncState } = useCollaboration();

    // Tarot state
    const [selectedSpread, setSelectedSpread] = useState<keyof typeof TAROT_SPREADS>('three_card');
    const [drawnCards, setDrawnCards] = useState<Record<string, DrawnCard>>({});
    const [availableCards, setAvailableCards] = useState<TarotCard[]>([...SAMPLE_TAROT_CARDS]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
    const [interpretationText, setInterpretationText] = useState('');
    const [showInterpretationModal, setShowInterpretationModal] = useState<string | null>(null);

    // Get current spread configuration
    const currentSpread = TAROT_SPREADS[selectedSpread];

    // Get current user info
    const getCurrentUser = () => {
        const auth = JSON.parse(localStorage.getItem('star_auth') || '{}');
        return {
            id: auth.user?.id || 'anonymous',
            username: auth.user?.username || 'Anonymous',
            zodiac_sign: auth.user?.zodiac_sign || 'unknown'
        };
    };

    // Load tarot state from session
    useEffect(() => {
        if (currentSession?.shared_state?.tarot_spread) {
            const tarotData = currentSession.shared_state.tarot_spread;
            const cards: Record<string, DrawnCard> = {};

            Object.entries(tarotData).forEach(([position, cardData]: [string, any]) => {
                if (cardData && cardData.card) {
                    cards[position] = {
                        ...cardData.card,
                        position,
                        drawn_by: cardData.drawn_by,
                        drawn_at: cardData.drawn_at,
                        interpretation: cardData.interpretation,
                        interpreted_by: cardData.interpreted_by
                    };
                }
            });

            setDrawnCards(cards);
        }
    }, [currentSession?.shared_state?.tarot_spread]);

    // Draw a card for a position
    const drawCard = useCallback(async (position: string) => {
        if (!currentSession || isDrawing || drawnCards[position]) return;

        setIsDrawing(true);

        try {
            // Simulate card selection with cosmic randomness
            await new Promise(resolve => setTimeout(resolve, 1000));

            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const selectedCard = availableCards[randomIndex];
            const reversed = Math.random() < 0.3; // 30% chance of reversed

            const drawnCard: DrawnCard = {
                ...selectedCard,
                position,
                reversed,
                drawn_by: getCurrentUser().id,
                drawn_at: new Date().toISOString()
            };

            // Update local state
            setDrawnCards(prev => ({
                ...prev,
                [position]: drawnCard
            }));

            // Remove card from available deck
            setAvailableCards(prev => prev.filter((_, index) => index !== randomIndex));

            // Send tarot event to other participants
            sendTarotEvent({
                event_type: 'card_drawn',
                card: drawnCard,
                position
            });

            // Sync state
            syncState({
                [`tarot_card_${position}`]: drawnCard
            });

        } catch (error) {
            console.error('Failed to draw card:', error);
        } finally {
            setIsDrawing(false);
        }
    }, [currentSession, isDrawing, drawnCards, availableCards, sendTarotEvent, syncState]);

    // Add interpretation to a card
    const addInterpretation = useCallback((position: string, interpretation: string) => {
        if (!currentSession || !drawnCards[position]) return;

        const updatedCard = {
            ...drawnCards[position],
            interpretation,
            interpreted_by: getCurrentUser().id
        };

        setDrawnCards(prev => ({
            ...prev,
            [position]: updatedCard
        }));

        // Send tarot event
        sendTarotEvent({
            event_type: 'interpretation_added',
            position,
            interpretation
        });

        // Close modal
        setShowInterpretationModal(null);
        setInterpretationText('');
    }, [currentSession, drawnCards, sendTarotEvent]);

    // Complete the reading
    const completeReading = useCallback(() => {
        if (!currentSession) return;

        sendTarotEvent({
            event_type: 'spread_completed'
        });
    }, [currentSession, sendTarotEvent]);

    // Reset the reading
    const resetReading = useCallback(() => {
        setDrawnCards({});
        setAvailableCards([...SAMPLE_TAROT_CARDS]);
        setSelectedPosition(null);
        setInterpretationText('');
        setShowInterpretationModal(null);

        // Sync reset state
        syncState({
            tarot_reset: true,
            tarot_timestamp: Date.now()
        });
    }, [syncState]);

    if (!currentSession) {
        return (
            <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-purple-200 text-lg">Join a collaboration session to access shared tarot readings</p>
            </div>
        );
    }

    const isHost = currentSession.host_id === getCurrentUser().id;
    const completedCards = Object.keys(drawnCards).length;
    const totalPositions = currentSpread.positions.length;
    const progress = (completedCards / totalPositions) * 100;

    return (
        <CollaborationContainer
            className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6"
            showCursors={true}
            showLabels={true}
            showTrails={true}
        >
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                            <Star className="text-yellow-400" />
                            Collaborative Tarot Reading
                            <Sparkles className="text-purple-400" />
                        </h1>
                        <p className="text-purple-200">
                            {currentSpread.name} - {currentSpread.description}
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-purple-200 text-sm">Progress</p>
                            <p className="text-white font-bold">{completedCards}/{totalPositions} cards</p>
                        </div>

                        {isHost && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={resetReading}
                                    className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Reset
                                </button>

                                {completedCards === totalPositions && (
                                    <button
                                        onClick={completeReading}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Complete Reading
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-purple-900/50 rounded-full h-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                    />
                </div>
            </div>

            {/* Spread selection (host only) */}
            {isHost && completedCards === 0 && (
                <div className="max-w-6xl mx-auto mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Choose Spread Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(TAROT_SPREADS).map(([key, spread]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedSpread(key as keyof typeof TAROT_SPREADS)}
                                className={`p-4 rounded-lg border-2 transition-colors text-left ${selectedSpread === key
                                        ? 'border-purple-400 bg-purple-600/20'
                                        : 'border-purple-500/20 hover:border-purple-400/50 bg-gray-800/50'
                                    }`}
                            >
                                <h4 className="text-white font-medium mb-2">{spread.name}</h4>
                                <p className="text-purple-200 text-sm mb-2">{spread.description}</p>
                                <p className="text-purple-300 text-xs">{spread.positions.length} cards</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tarot spread visualization */}
            <div className="max-w-6xl mx-auto">
                <div className="relative bg-gradient-to-br from-purple-800/20 to-indigo-800/20 rounded-2xl p-8 min-h-[600px] backdrop-blur-sm border border-purple-500/20">
                    {/* Cosmic background effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-purple-300 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    scale: [1, 1.5, 1]
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                }}
                            />
                        ))}
                    </div>

                    {/* Card positions */}
                    {currentSpread.positions.map((position) => {
                        const drawnCard = drawnCards[position.id];
                        const cursorAwareness = useCursorAwareness(`tarot-position-${position.id}`);

                        return (
                            <motion.div
                                key={position.id}
                                id={`tarot-position-${position.id}`}
                                style={{
                                    position: 'absolute',
                                    left: `${position.x}%`,
                                    top: `${position.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                                className="group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Position placeholder or drawn card */}
                                <div className="relative">
                                    {drawnCard ? (
                                        // Drawn card
                                        <motion.div
                                            initial={{ opacity: 0, rotateY: 180 }}
                                            animate={{ opacity: 1, rotateY: 0 }}
                                            className={`w-24 h-36 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg border-2 border-purple-400 flex flex-col items-center justify-center text-white cursor-pointer ${drawnCard.reversed ? 'rotate-180' : ''
                                                }`}
                                            onClick={() => setShowInterpretationModal(position.id)}
                                        >
                                            <div className="text-2xl mb-1">{drawnCard.image}</div>
                                            <div className="text-xs text-center px-1 leading-tight">
                                                {drawnCard.name}
                                            </div>
                                            {drawnCard.reversed && (
                                                <div className="text-xs text-purple-200 mt-1">Reversed</div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        // Empty position
                                        <motion.button
                                            onClick={() => drawCard(position.id)}
                                            disabled={isDrawing}
                                            className="w-24 h-36 bg-gray-800/50 border-2 border-dashed border-purple-400/50 rounded-lg flex flex-col items-center justify-center text-purple-300 hover:border-purple-400 hover:bg-purple-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isDrawing ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <Shuffle className="w-6 h-6" />
                                                </motion.div>
                                            ) : (
                                                <>
                                                    <Eye className="w-6 h-6 mb-2" />
                                                    <div className="text-xs text-center">Draw Card</div>
                                                </>
                                            )}
                                        </motion.button>
                                    )}

                                    {/* Position label */}
                                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                                        <div className="text-white text-sm font-medium">{position.name}</div>
                                        <div className="text-purple-300 text-xs">{position.description}</div>
                                    </div>

                                    {/* Interaction indicators */}
                                    {cursorAwareness.isBeingViewed && (
                                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                            {cursorAwareness.viewerCount}
                                        </div>
                                    )}

                                    {/* Interpretation indicator */}
                                    {drawnCard?.interpretation && (
                                        <div className="absolute -top-2 -left-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                            <MessageCircle className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Participants panel */}
            <div className="max-w-6xl mx-auto mt-8">
                <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Participants ({currentSession.participants.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {currentSession.participants.map((participant: any) => (
                            <div
                                key={participant.user_id}
                                className="flex items-center space-x-2 bg-purple-600/20 px-3 py-2 rounded-lg"
                            >
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                <span className="text-white text-sm">{participant.username}</span>
                                <span className="text-purple-300 text-xs">{participant.zodiac_sign}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interpretation Modal */}
            <AnimatePresence>
                {showInterpretationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowInterpretationModal(null);
                            }
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 max-w-md w-full border border-purple-500/20"
                        >
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {drawnCards[showInterpretationModal]?.name}
                                </h3>
                                <p className="text-purple-200 text-sm">
                                    {drawnCards[showInterpretationModal]?.meaning}
                                </p>
                                {drawnCards[showInterpretationModal]?.reversed && (
                                    <p className="text-yellow-300 text-sm mt-1">
                                        ⚠️ This card appears reversed, which may alter its meaning
                                    </p>
                                )}
                            </div>

                            {drawnCards[showInterpretationModal]?.interpretation ? (
                                <div className="bg-purple-600/20 rounded-lg p-4">
                                    <h4 className="text-purple-200 text-sm font-medium mb-2">Interpretation</h4>
                                    <p className="text-white">{drawnCards[showInterpretationModal].interpretation}</p>
                                    <p className="text-purple-300 text-xs mt-2">
                                        By {drawnCards[showInterpretationModal].interpreted_by}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">
                                        Add Your Interpretation
                                    </label>
                                    <textarea
                                        value={interpretationText}
                                        onChange={(e) => setInterpretationText(e.target.value)}
                                        placeholder="Share your insights about this card..."
                                        rows={4}
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 resize-none"
                                    />
                                    <div className="flex space-x-2 mt-4">
                                        <button
                                            onClick={() => addInterpretation(showInterpretationModal, interpretationText)}
                                            disabled={!interpretationText.trim()}
                                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Add Interpretation
                                        </button>
                                        <button
                                            onClick={() => setShowInterpretationModal(null)}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CollaborationContainer>
    );
};

export default CollaborativeTarot;