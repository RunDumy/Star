import { useCollaboration } from '@/contexts/CollaborationContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    Crown,
    MessageCircle,
    Play,
    Sparkles,
    Star,
    Users
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface TarotCard {
    id: string;
    name: string;
    suit?: string;
    number?: number;
    image: string;
    meaning: {
        upright: string[];
        reversed: string[];
    };
    isRevealed: boolean;
    isReversed: boolean;
    position: { x: number; y: number };
    revealedBy?: string;
    revealedAt?: number;
}

interface CollaborativeTarotSessionProps {
    sessionId: string;
    hostId: string;
    isHost?: boolean;
    participants?: Array<{
        id: string;
        name: string;
        zodiacSign?: string;
        isOnline: boolean;
    }>;
}

interface TarotSpread {
    id: string;
    name: string;
    positions: Array<{
        id: string;
        name: string;
        description: string;
        x: number;
        y: number;
        card?: TarotCard;
    }>;
    maxCards: number;
}

const TAROT_SPREADS: TarotSpread[] = [
    {
        id: 'past-present-future',
        name: 'Past, Present, Future',
        maxCards: 3,
        positions: [
            { id: 'past', name: 'Past', description: 'What has influenced this situation', x: 100, y: 200 },
            { id: 'present', name: 'Present', description: 'Current situation and energies', x: 300, y: 200 },
            { id: 'future', name: 'Future', description: 'Potential outcome', x: 500, y: 200 }
        ]
    },
    {
        id: 'celtic-cross',
        name: 'Celtic Cross',
        maxCards: 10,
        positions: [
            { id: 'situation', name: 'Situation', description: 'Current situation', x: 300, y: 250 },
            { id: 'challenge', name: 'Challenge', description: 'Cross or challenge', x: 300, y: 150 },
            { id: 'distant-past', name: 'Distant Past', description: 'Distant past/foundation', x: 200, y: 250 },
            { id: 'recent-past', name: 'Recent Past', description: 'Recent past', x: 300, y: 350 },
            { id: 'crown', name: 'Crown', description: 'Possible outcome', x: 300, y: 50 },
            { id: 'immediate-future', name: 'Near Future', description: 'Immediate future', x: 400, y: 250 },
            { id: 'approach', name: 'Your Approach', description: 'Your approach', x: 500, y: 350 },
            { id: 'external', name: 'External', description: 'External influences', x: 500, y: 250 },
            { id: 'hopes-fears', name: 'Hopes & Fears', description: 'Hopes and fears', x: 500, y: 150 },
            { id: 'outcome', name: 'Outcome', description: 'Final outcome', x: 500, y: 50 }
        ]
    }
];

export const CollaborativeTarotSession: React.FC<CollaborativeTarotSessionProps> = ({
    sessionId,
    hostId,
    isHost = false,
    participants = []
}) => {
    const { socket, currentUser } = useCollaboration();
    const [selectedSpread, setSelectedSpread] = useState(TAROT_SPREADS[0]);
    const [sessionState, setSessionState] = useState<'waiting' | 'active' | 'complete'>('waiting');
    const [cards, setCards] = useState<TarotCard[]>([]);
    const [messages, setMessages] = useState<Array<{
        id: string;
        userId: string;
        userName: string;
        message: string;
        timestamp: number;
        cardId?: string;
    }>>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
    const [turnOrder, setTurnOrder] = useState<string[]>([]);
    const [currentTurn, setCurrentTurn] = useState(0);

    const handleSessionStateUpdate = useCallback((data: any) => {
        setSessionState(data.state);
        setCards(data.cards || []);
        setTurnOrder(data.turnOrder || []);
        setCurrentTurn(data.currentTurn || 0);
    }, []);

    const handleCardRevealed = useCallback((data: any) => {
        setCards(prev => prev.map(card =>
            card.id === data.cardId
                ? { ...card, isRevealed: true, revealedBy: data.userId, revealedAt: data.timestamp }
                : card
        ));
    }, []);

    const handleMessageReceived = useCallback((data: any) => {
        setMessages(prev => [...prev, data]);
    }, []);

    const handleTurnChanged = useCallback((data: any) => {
        setCurrentTurn(data.currentTurn);
    }, []);

    // Initialize session
    useEffect(() => {
        if (socket && sessionId) {
            socket.emit('join_tarot_session', {
                sessionId,
                userId: currentUser?.id,
                userName: currentUser?.username
            });

            socket.on('session_state_update', handleSessionStateUpdate);
            socket.on('card_revealed', handleCardRevealed);
            socket.on('message_received', handleMessageReceived);
            socket.on('turn_changed', handleTurnChanged);

            return () => {
                socket.off('session_state_update');
                socket.off('card_revealed');
                socket.off('message_received');
                socket.off('turn_changed');
            };
        }
    }, [socket, sessionId, currentUser, handleSessionStateUpdate, handleCardRevealed, handleMessageReceived, handleTurnChanged]);

    const startSession = () => {
        if (isHost && socket) {
            // Generate shuffled deck
            const shuffledCards = generateShuffledDeck();
            const sessionCards = shuffledCards.slice(0, selectedSpread.maxCards);

            socket.emit('start_tarot_session', {
                sessionId,
                spread: selectedSpread,
                cards: sessionCards,
                turnOrder: participants.map(p => p.id)
            });
        }
    };

    const revealCard = (cardId: string) => {
        if (socket && canRevealCard()) {
            socket.emit('reveal_card', {
                sessionId,
                cardId,
                userId: currentUser?.id
            });
        }
    };

    const sendMessage = () => {
        if (socket && newMessage.trim()) {
            socket.emit('send_tarot_message', {
                sessionId,
                message: newMessage.trim(),
                userId: currentUser?.id,
                userName: currentUser?.username,
                cardId: selectedCard?.id
            });
            setNewMessage('');
        }
    };

    const canRevealCard = () => {
        const currentParticipant = turnOrder[currentTurn];
        return currentParticipant === currentUser?.id || isHost;
    };

    const generateShuffledDeck = (): TarotCard[] => {
        // Mock tarot deck - in real implementation, load from assets
        const suits = ['Cups', 'Wands', 'Swords', 'Pentacles'];
        const court = ['Page', 'Knight', 'Queen', 'King'];
        const major = [
            'The Fool', 'The Magician', 'The High Priestess', 'The Empress',
            'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot',
            'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice',
            'The Hanged Man', 'Death', 'Temperance', 'The Devil',
            'The Tower', 'The Star', 'The Moon', 'The Sun',
            'Judgement', 'The World'
        ];

        const deck: TarotCard[] = [];

        // Major Arcana
        major.forEach((name, index) => {
            deck.push({
                id: `major-${index}`,
                name,
                image: `/tarot/major/${index}.jpg`,
                meaning: {
                    upright: [`Upright meaning for ${name}`],
                    reversed: [`Reversed meaning for ${name}`]
                },
                isRevealed: false,
                isReversed: Math.random() > 0.5,
                position: { x: 0, y: 0 }
            });
        });

        // Minor Arcana
        suits.forEach(suit => {
            // Number cards (Ace through 10)
            for (let i = 1; i <= 10; i++) {
                deck.push({
                    id: `${suit.toLowerCase()}-${i}`,
                    name: `${i === 1 ? 'Ace' : i.toString()} of ${suit}`,
                    suit,
                    number: i,
                    image: `/tarot/minor/${suit.toLowerCase()}/${i}.jpg`,
                    meaning: {
                        upright: [`Upright meaning for ${i} of ${suit}`],
                        reversed: [`Reversed meaning for ${i} of ${suit}`]
                    },
                    isRevealed: false,
                    isReversed: Math.random() > 0.5,
                    position: { x: 0, y: 0 }
                });
            }

            // Court cards
            court.forEach(rank => {
                deck.push({
                    id: `${suit.toLowerCase()}-${rank.toLowerCase()}`,
                    name: `${rank} of ${suit}`,
                    suit,
                    image: `/tarot/minor/${suit.toLowerCase()}/${rank.toLowerCase()}.jpg`,
                    meaning: {
                        upright: [`Upright meaning for ${rank} of ${suit}`],
                        reversed: [`Reversed meaning for ${rank} of ${suit}`]
                    },
                    isRevealed: false,
                    isReversed: Math.random() > 0.5,
                    position: { x: 0, y: 0 }
                });
            });
        });

        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    };

    return (
        <div className="w-full h-screen bg-gradient-to-br from-purple-900/20 to-blue-900/20 relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10">
                <div className="flex items-center justify-between bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                            <h1 className="text-xl font-bold text-white">Collaborative Tarot Session</h1>
                        </div>
                        <div className="text-sm text-white/60">
                            Spread: {selectedSpread.name}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-cyan-400" />
                            <span className="text-white text-sm">{participants.length + 1} participants</span>
                        </div>

                        {isHost && sessionState === 'waiting' && (
                            <button
                                onClick={startSession}
                                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-colors"
                            >
                                <Play className="w-4 h-4" />
                                <span>Start Session</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="pt-24 pb-4 px-4 h-full flex">
                {/* Tarot Spread Area */}
                <div className="flex-1 relative">
                    {sessionState === 'waiting' && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center bg-black/60 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                                <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Waiting to Begin</h2>
                                <p className="text-white/60">
                                    {isHost ? 'Click "Start Session" when everyone is ready' : 'Waiting for host to start the session'}
                                </p>

                                {/* Participant List */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Participants</h3>
                                    <div className="space-y-2">
                                        {participants.map(participant => (
                                            <div
                                                key={participant.id}
                                                className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg"
                                            >
                                                <div
                                                    className={`w-3 h-3 rounded-full ${participant.isOnline ? 'bg-green-400' : 'bg-gray-400'
                                                        }`}
                                                />
                                                <span className="text-white">{participant.name}</span>
                                                {participant.zodiacSign && (
                                                    <span className="text-sm text-white/60">({participant.zodiacSign})</span>
                                                )}
                                                {participant.id === hostId && (
                                                    <Crown className="w-4 h-4 text-yellow-400" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {sessionState === 'active' && (
                        <div className="relative w-full h-full">
                            {/* Spread Positions */}
                            {selectedSpread.positions.map((position, index) => {
                                const card = cards[index];
                                return (
                                    <div
                                        key={position.id}
                                        className="absolute"
                                        style={{ left: position.x, top: position.y }}
                                    >
                                        <TarotCardComponent
                                            card={card}
                                            position={position}
                                            isCurrentTurn={canRevealCard()}
                                            onReveal={() => card && revealCard(card.id)}
                                            onSelect={() => setSelectedCard(card || null)}
                                            isSelected={selectedCard?.id === card?.id}
                                        />
                                    </div>
                                );
                            })}

                            {/* Turn Indicator */}
                            {turnOrder.length > 0 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                                    <div className="text-center">
                                        <div className="text-white/60 text-sm">Current Turn</div>
                                        <div className="text-white font-medium">
                                            {participants.find(p => p.id === turnOrder[currentTurn])?.name || 'Unknown'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                <div className="w-80 bg-black/80 backdrop-blur-lg border-l border-white/20 flex flex-col">
                    <div className="p-4 border-b border-white/20">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Session Chat
                        </h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map(message => (
                            <div key={message.id} className="bg-white/10 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-white font-medium text-sm">{message.userName}</span>
                                    <span className="text-white/40 text-xs">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-white/80 text-sm">{message.message}</p>
                                {message.cardId && (
                                    <div className="mt-2 text-xs text-cyan-400">
                                        💫 About: {cards.find(c => c.id === message.cardId)?.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-white/20">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Share your insights..."
                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim()}
                                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                        {selectedCard && (
                            <div className="mt-2 text-xs text-white/60">
                                💫 Commenting on: {selectedCard.name}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tarot Card Component
const TarotCardComponent: React.FC<{
    card?: TarotCard;
    position: any;
    isCurrentTurn: boolean;
    onReveal: () => void;
    onSelect: () => void;
    isSelected: boolean;
}> = ({ card, position, isCurrentTurn, onReveal, onSelect, isSelected }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className={`relative cursor-pointer ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onSelect}
        >
            {/* Position Label */}
            <div className="absolute -top-8 left-0 text-xs text-white/60 font-medium">
                {position.name}
            </div>

            {/* Card */}
            <div className="w-24 h-36 relative">
                {!card || !card.isRevealed ? (
                    // Card Back
                    <motion.div
                        className="w-full h-full bg-gradient-to-br from-purple-800 to-blue-800 rounded-lg border-2 border-white/20 flex items-center justify-center"
                        onClick={isCurrentTurn ? onReveal : undefined}
                        whileHover={isCurrentTurn ? { borderColor: '#ffd700' } : {}}
                    >
                        <div className="text-center">
                            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <div className="text-xs text-white/60">
                                {isCurrentTurn ? 'Click to reveal' : 'Hidden'}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // Revealed Card
                    <div className="w-full h-full bg-white rounded-lg border-2 border-yellow-400/50 overflow-hidden">
                        <div className="p-2 text-center">
                            <div className="text-xs font-bold text-gray-800 mb-1">
                                {card.name}
                            </div>
                            <div className="w-full h-24 bg-gradient-to-br from-purple-200 to-blue-200 rounded flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            {card.isReversed && (
                                <div className="text-xs text-red-500 mt-1">Reversed</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tooltip */}
                <AnimatePresence>
                    {isHovered && card?.isRevealed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-10 -top-2 left-full ml-2 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-3 max-w-xs"
                        >
                            <h4 className="font-medium text-white mb-2">{card.name}</h4>
                            <div className="text-sm text-white/80">
                                <div className="mb-2">
                                    <strong>{card.isReversed ? 'Reversed' : 'Upright'}:</strong>
                                </div>
                                <ul className="list-disc list-inside space-y-1">
                                    {(card.isReversed ? card.meaning.reversed : card.meaning.upright).map((meaning, index) => (
                                        <li key={index}>{meaning}</li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CollaborativeTarotSession;