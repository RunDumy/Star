import { useCollaboration } from '@/contexts/CollaborationContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Heart,
    MessageCircle,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Send,
    Smile,
    Sparkles,
    Users,
    Volume2,
    VolumeX,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CosmicMessage {
    id: string;
    userId: string;
    userName: string;
    zodiacSign?: string;
    message: string;
    timestamp: number;
    type: 'text' | 'emoji' | 'reaction' | 'system';
    reactions?: Array<{
        userId: string;
        emoji: string;
        zodiacAction?: string;
    }>;
    replyTo?: string;
    coordinates?: { x: number; y: number; z: number };
}

interface VoiceParticipant {
    id: string;
    name: string;
    zodiacSign?: string;
    isMuted: boolean;
    isDeafened: boolean;
    isSpeaking: boolean;
    volume: number;
}

interface CosmicCommunicationHubProps {
    roomId: string;
    position?: { x: number; y: number };
    onClose?: () => void;
    initialMode?: 'chat' | 'voice' | 'orbs';
}

// Zodiac-themed emoji reactions
const ZODIAC_REACTIONS = {
    WESTERN: {
        Aries: { emoji: '🔥', action: 'Ignite', color: '#ff6b6b' },
        Taurus: { emoji: '🌱', action: 'Ground', color: '#4ecdc4' },
        Gemini: { emoji: '💫', action: 'Spark', color: '#ffe66d' },
        Cancer: { emoji: '🌙', action: 'Nurture', color: '#a8e6cf' },
        Leo: { emoji: '☀️', action: 'Radiate', color: '#ffd700' },
        Virgo: { emoji: '✨', action: 'Refine', color: '#dda0dd' },
        Libra: { emoji: '⚖️', action: 'Balance', color: '#87ceeb' },
        Scorpio: { emoji: '🦂', action: 'Transform', color: '#8b0000' },
        Sagittarius: { emoji: '🏹', action: 'Aim', color: '#ff8c00' },
        Capricorn: { emoji: '⛰️', action: 'Build', color: '#696969' },
        Aquarius: { emoji: '🌊', action: 'Flow', color: '#00ffff' },
        Pisces: { emoji: '🐟', action: 'Dream', color: '#9370db' }
    },
    GENERAL: {
        love: { emoji: '💖', action: 'Love', color: '#ff69b4' },
        wisdom: { emoji: '🧙‍♀️', action: 'Enlighten', color: '#9370db' },
        energy: { emoji: '⚡', action: 'Energize', color: '#ffd700' },
        peace: { emoji: '🕊️', action: 'Calm', color: '#87ceeb' },
        magic: { emoji: '✨', action: 'Enchant', color: '#dda0dd' },
        mystery: { emoji: '🔮', action: 'Divine', color: '#4b0082' }
    }
};

export const CosmicCommunicationHub: React.FC<CosmicCommunicationHubProps> = ({
    roomId,
    position = { x: 0, y: 0 },
    onClose,
    initialMode = 'chat'
}) => {
    const { socket, currentUser, onlineUsers } = useCollaboration();

    // State management
    const [activeMode, setActiveMode] = useState(initialMode);
    const [messages, setMessages] = useState<CosmicMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Voice chat state
    const [voiceParticipants, setVoiceParticipants] = useState<VoiceParticipant[]>([]);
    const [isInVoiceCall, setIsInVoiceCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isDeafened, setIsDeafened] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);

    // UI state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState<CosmicMessage | null>(null);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const chatInputRef = useRef<HTMLInputElement>(null);
    const audioContextRef = useRef<AudioContext>();

    // Initialize communication
    useEffect(() => {
        if (socket && roomId) {
            socket.emit('join_cosmic_room', {
                roomId,
                userId: currentUser?.id,
                userName: currentUser?.username,
                zodiacSign: currentUser?.zodiacSign
            });

            // Set up event listeners
            socket.on('cosmic_message', handleIncomingMessage);
            socket.on('user_typing', handleUserTyping);
            socket.on('user_stopped_typing', handleUserStoppedTyping);
            socket.on('voice_participant_update', handleVoiceParticipantUpdate);
            socket.on('reaction_added', handleReactionAdded);

            return () => {
                socket.off('cosmic_message');
                socket.off('user_typing');
                socket.off('user_stopped_typing');
                socket.off('voice_participant_update');
                socket.off('reaction_added');
            };
        }
    }, [socket, roomId, currentUser]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Event handlers
    const handleIncomingMessage = useCallback((message: CosmicMessage) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const handleUserTyping = useCallback((data: { userId: string; userName: string }) => {
        if (data.userId !== currentUser?.id) {
            setTypingUsers(prev => new Set([...prev, data.userName]));
        }
    }, [currentUser?.id]);

    const handleUserStoppedTyping = useCallback((data: { userId: string; userName: string }) => {
        setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userName);
            return newSet;
        });
    }, []);

    const handleVoiceParticipantUpdate = useCallback((participants: VoiceParticipant[]) => {
        setVoiceParticipants(participants);
    }, []);

    const handleReactionAdded = useCallback((data: {
        messageId: string;
        userId: string;
        emoji: string;
        zodiacAction?: string;
    }) => {
        setMessages(prev => prev.map(msg =>
            msg.id === data.messageId
                ? {
                    ...msg,
                    reactions: [
                        ...(msg.reactions || []),
                        {
                            userId: data.userId,
                            emoji: data.emoji,
                            zodiacAction: data.zodiacAction
                        }
                    ]
                }
                : msg
        ));
    }, []);

    // Typing indicator
    const handleTyping = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            socket?.emit('cosmic_typing_start', {
                roomId,
                userId: currentUser?.id,
                userName: currentUser?.username
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket?.emit('cosmic_typing_stop', {
                roomId,
                userId: currentUser?.id,
                userName: currentUser?.username
            });
        }, 1000);
    }, [socket, roomId, currentUser, isTyping]);

    // Send message
    const sendMessage = useCallback(() => {
        if (!newMessage.trim() || !socket) return;

        const message: CosmicMessage = {
            id: `msg-${Date.now()}-${Math.random()}`,
            userId: currentUser?.id || 'anonymous',
            userName: currentUser?.username || 'Anonymous',
            zodiacSign: currentUser?.zodiacSign,
            message: newMessage.trim(),
            timestamp: Date.now(),
            type: 'text',
            replyTo: replyingTo?.id
        };

        socket.emit('send_cosmic_message', {
            roomId,
            message
        });

        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setReplyingTo(null);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setIsTyping(false);
        socket.emit('cosmic_typing_stop', {
            roomId,
            userId: currentUser?.id,
            userName: currentUser?.username
        });
    }, [newMessage, socket, roomId, currentUser, replyingTo]);

    // Add reaction to message
    const addReaction = useCallback((messageId: string, emoji: string, zodiacAction?: string) => {
        if (!socket) return;

        socket.emit('add_cosmic_reaction', {
            roomId,
            messageId,
            userId: currentUser?.id,
            emoji,
            zodiacAction
        });
    }, [socket, roomId, currentUser]);

    // Voice chat functions
    const joinVoiceCall = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
            setIsInVoiceCall(true);

            socket?.emit('join_voice_call', {
                roomId,
                userId: currentUser?.id,
                userName: currentUser?.username
            });
        } catch (error) {
            console.error('Failed to join voice call:', error);
        }
    }, [socket, roomId, currentUser]);

    const leaveVoiceCall = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setIsInVoiceCall(false);

        socket?.emit('leave_voice_call', {
            roomId,
            userId: currentUser?.id
        });
    }, [socket, roomId, currentUser, localStream]);

    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = isMuted;
                setIsMuted(!isMuted);
            }
        }
    }, [localStream, isMuted]);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
            style={{
                left: position.x,
                top: position.y,
                width: '400px',
                height: '600px',
                zIndex: 50
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
                <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-white">Cosmic Communication</h3>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Mode Tabs */}
                    <div className="flex bg-white/10 rounded-lg p-1">
                        <button
                            onClick={() => setActiveMode('chat')}
                            className={`px-3 py-1 rounded text-sm transition-all ${activeMode === 'chat'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setActiveMode('voice')}
                            className={`px-3 py-1 rounded text-sm transition-all ${activeMode === 'voice'
                                    ? 'bg-cyan-500/20 text-cyan-400'
                                    : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col h-[calc(100%-80px)]">
                {activeMode === 'chat' && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((message) => (
                                <CosmicMessageComponent
                                    key={message.id}
                                    message={message}
                                    isOwn={message.userId === currentUser?.id}
                                    onReact={(emoji, zodiacAction) => addReaction(message.id, emoji, zodiacAction)}
                                    onReply={() => setReplyingTo(message)}
                                />
                            ))}

                            {/* Typing indicator */}
                            {typingUsers.size > 0 && (
                                <div className="flex items-center space-x-2 text-white/60 text-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span>
                                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                                    </span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply indicator */}
                        {replyingTo && (
                            <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex items-center justify-between">
                                <div className="text-sm">
                                    <span className="text-white/60">Replying to </span>
                                    <span className="text-cyan-400">{replyingTo.userName}</span>
                                </div>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="text-white/60 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="p-4 border-t border-white/20">
                            <div className="flex items-end space-x-2">
                                <div className="flex-1">
                                    <input
                                        ref={chatInputRef}
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Share your cosmic thoughts..."
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>

                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Emoji Picker */}
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-20 right-4 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-3 max-w-xs"
                                    >
                                        <ZodiacEmojiPicker
                                            zodiacSign={currentUser?.zodiacSign}
                                            onSelect={(emoji, zodiacAction) => {
                                                setNewMessage(prev => prev + emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                )}

                {activeMode === 'voice' && (
                    <VoiceChatPanel
                        isInCall={isInVoiceCall}
                        participants={voiceParticipants}
                        isMuted={isMuted}
                        isDeafened={isDeafened}
                        onJoinCall={joinVoiceCall}
                        onLeaveCall={leaveVoiceCall}
                        onToggleMute={toggleMute}
                        onToggleDeafen={() => setIsDeafened(!isDeafened)}
                    />
                )}
            </div>
        </motion.div>
    );
};

// Individual message component
const CosmicMessageComponent: React.FC<{
    message: CosmicMessage;
    isOwn: boolean;
    onReact: (emoji: string, zodiacAction?: string) => void;
    onReply: () => void;
}> = ({ message, isOwn, onReact, onReply }) => {
    const [showReactions, setShowReactions] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && (
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">{message.userName}</span>
                        {message.zodiacSign && (
                            <span className="text-xs text-white/60">({message.zodiacSign})</span>
                        )}
                    </div>
                )}

                <div
                    className={`relative group p-3 rounded-2xl ${isOwn
                            ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                            : 'bg-white/10 border border-white/20'
                        }`}
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                >
                    <p className="text-white text-sm">{message.message}</p>

                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/40">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </span>

                        {/* Reaction buttons */}
                        <AnimatePresence>
                            {showReactions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex space-x-1"
                                >
                                    <button
                                        onClick={() => onReact('💖')}
                                        className="p-1 text-pink-400 hover:bg-pink-500/20 rounded"
                                    >
                                        <Heart className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => onReact('✨')}
                                        className="p-1 text-yellow-400 hover:bg-yellow-500/20 rounded"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={onReply}
                                        className="p-1 text-white/60 hover:bg-white/20 rounded"
                                    >
                                        <MessageCircle className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-white/10 rounded-full px-2 py-1"
                                    title={reaction.zodiacAction || 'Reaction'}
                                >
                                    {reaction.emoji}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Zodiac emoji picker
const ZodiacEmojiPicker: React.FC<{
    zodiacSign?: string;
    onSelect: (emoji: string, zodiacAction?: string) => void;
}> = ({ zodiacSign, onSelect }) => {
    const userReactions = zodiacSign && ZODIAC_REACTIONS.WESTERN[zodiacSign as keyof typeof ZODIAC_REACTIONS.WESTERN]
        ? [ZODIAC_REACTIONS.WESTERN[zodiacSign as keyof typeof ZODIAC_REACTIONS.WESTERN]]
        : [];

    return (
        <div className="space-y-3">
            {userReactions.length > 0 && (
                <div>
                    <h4 className="text-white text-sm font-medium mb-2">Your Zodiac Energy</h4>
                    <div className="flex flex-wrap gap-2">
                        {userReactions.map((reaction) => (
                            <button
                                key={reaction.action}
                                onClick={() => onSelect(reaction.emoji, reaction.action)}
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                style={{ borderLeft: `3px solid ${reaction.color}` }}
                            >
                                <span className="text-lg">{reaction.emoji}</span>
                                <div className="text-xs text-white/60 mt-1">{reaction.action}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h4 className="text-white text-sm font-medium mb-2">Cosmic Reactions</h4>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(ZODIAC_REACTIONS.GENERAL).map((reaction) => (
                        <button
                            key={reaction.action}
                            onClick={() => onSelect(reaction.emoji, reaction.action)}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
                        >
                            <span className="text-lg block">{reaction.emoji}</span>
                            <div className="text-xs text-white/60 mt-1">{reaction.action}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Voice chat panel
const VoiceChatPanel: React.FC<{
    isInCall: boolean;
    participants: VoiceParticipant[];
    isMuted: boolean;
    isDeafened: boolean;
    onJoinCall: () => void;
    onLeaveCall: () => void;
    onToggleMute: () => void;
    onToggleDeafen: () => void;
}> = ({
    isInCall,
    participants,
    isMuted,
    isDeafened,
    onJoinCall,
    onLeaveCall,
    onToggleMute,
    onToggleDeafen
}) => {
        return (
            <div className="p-4 space-y-4">
                {!isInCall ? (
                    <div className="text-center">
                        <div className="mb-6">
                            <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Voice Chat</h3>
                            <p className="text-white/60">Connect with others through cosmic voice channels</p>
                        </div>

                        <button
                            onClick={onJoinCall}
                            className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-lg hover:from-green-600 hover:to-cyan-600 transition-colors"
                        >
                            <Phone className="w-5 h-5" />
                            <span>Join Voice Call</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Participants */}
                        <div>
                            <h4 className="text-white font-medium mb-3">In Voice Call</h4>
                            <div className="space-y-2">
                                {participants.map((participant) => (
                                    <div
                                        key={participant.id}
                                        className="flex items-center space-x-3 p-2 bg-white/10 rounded-lg"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${participant.isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                                            }`} />
                                        <span className="flex-1 text-white">{participant.name}</span>
                                        {participant.isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                                        {participant.isDeafened && <VolumeX className="w-4 h-4 text-red-400" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex space-x-2">
                            <button
                                onClick={onToggleMute}
                                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${isMuted
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-white/10 text-white border border-white/20'
                                    }`}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={onToggleDeafen}
                                className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${isDeafened
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-white/10 text-white border border-white/20'
                                    }`}
                            >
                                {isDeafened ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={onLeaveCall}
                                className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                                <PhoneOff className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

export default CosmicCommunicationHub;