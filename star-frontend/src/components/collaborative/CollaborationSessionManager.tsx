/**
 * Collaboration Session Manager Component
 * Provides UI for creating, joining, and managing collaborative sessions
 * with session browser, room code entry, and session controls.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
    Clock,
    Copy,
    Crown,
    Eye,
    Hash,
    Lock,
    Mic,
    MicOff,
    PhoneCall,
    PhoneOff,
    Plus,
    Search,
    Star,
    Unlock,
    Users,
    Video,
    VideoOff
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CollaborationSession, useCollaboration } from '../lib/CollaborationContext';

interface SessionManagerProps {
    onSessionJoined?: (session: CollaborationSession) => void;
    onSessionCreated?: (sessionId: string) => void;
}

const SESSION_TYPES = [
    {
        id: 'tarot_reading',
        name: 'Tarot Reading',
        description: 'Collaborative tarot card reading with shared interpretations',
        icon: '🔮',
        color: 'from-purple-500 to-indigo-600'
    },
    {
        id: 'numerology_session',
        name: 'Numerology Circle',
        description: 'Group numerology analysis and cosmic timing exploration',
        icon: '🔢',
        color: 'from-blue-500 to-cyan-600'
    },
    {
        id: 'cosmos_exploration',
        name: 'Cosmos Journey',
        description: 'Shared 3D cosmic space exploration and celestial discovery',
        icon: '🌌',
        color: 'from-indigo-500 to-purple-600'
    },
    {
        id: 'group_meditation',
        name: 'Group Meditation',
        description: 'Synchronized meditation with elemental energy flows',
        icon: '🧘',
        color: 'from-green-500 to-teal-600'
    },
    {
        id: 'zodiac_circle',
        name: 'Zodiac Circle',
        description: 'Multi-zodiac compatibility analysis and archetypal exploration',
        icon: '♈',
        color: 'from-orange-500 to-red-600'
    },
    {
        id: 'cosmic_playlist',
        name: 'Cosmic Playlist',
        description: 'Collaborative music curation based on elemental energies',
        icon: '🎵',
        color: 'from-pink-500 to-rose-600'
    }
];

export const CollaborationSessionManager: React.FC<SessionManagerProps> = ({
    onSessionJoined,
    onSessionCreated
}) => {
    const {
        connected,
        currentSession,
        availableSessions,
        voiceChannel,
        createSession,
        joinSession,
        joinByRoomCode,
        leaveSession,
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        toggleVideo,
        refreshSessions
    } = useCollaboration();

    // UI State
    const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'join'>('browse');
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSessionDetails, setShowSessionDetails] = useState<string | null>(null);

    // Create Session Form State
    const [createForm, setCreateForm] = useState({
        session_type: 'tarot_reading',
        title: '',
        description: '',
        max_participants: 8,
        is_private: false,
        password: ''
    });

    // Loading states
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // Refresh sessions on mount and connection
    useEffect(() => {
        if (connected) {
            refreshSessions();
        }
    }, [connected, refreshSessions]);

    // Filter sessions based on search
    const filteredSessions = availableSessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        SESSION_TYPES.find(type => type.id === session.session_type)?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle session creation
    const handleCreateSession = async () => {
        if (!createForm.title.trim()) return;

        setIsCreating(true);
        try {
            const sessionId = await createSession({
                session_type: createForm.session_type as any,
                title: createForm.title,
                description: createForm.description,
                max_participants: createForm.max_participants,
                is_private: createForm.is_private
            });

            onSessionCreated?.(sessionId);

            // Reset form
            setCreateForm({
                session_type: 'tarot_reading',
                title: '',
                description: '',
                max_participants: 8,
                is_private: false,
                password: ''
            });

            setActiveTab('browse');
        } catch (error) {
            console.error('Failed to create session:', error);
        } finally {
            setIsCreating(false);
        }
    };

    // Handle joining session
    const handleJoinSession = async (sessionId: string, requiresPassword: boolean = false) => {
        if (requiresPassword && !createForm.password) return;

        setIsJoining(true);
        try {
            const success = await joinSession(sessionId, requiresPassword ? createForm.password : undefined);
            if (success) {
                onSessionJoined?.(currentSession!);
            }
        } catch (error) {
            console.error('Failed to join session:', error);
        } finally {
            setIsJoining(false);
        }
    };

    // Handle room code join
    const handleJoinByRoomCode = async () => {
        if (!roomCodeInput.trim()) return;

        setIsJoining(true);
        try {
            const success = await joinByRoomCode(roomCodeInput.toUpperCase());
            if (success) {
                setRoomCodeInput('');
                onSessionJoined?.(currentSession!);
            }
        } catch (error) {
            console.error('Failed to join by room code:', error);
        } finally {
            setIsJoining(false);
        }
    };

    // Handle leaving session
    const handleLeaveSession = async () => {
        try {
            if (voiceChannel.connected) {
                await leaveVoiceChannel();
            }
            await leaveSession();
        } catch (error) {
            console.error('Failed to leave session:', error);
        }
    };

    // Copy room code to clipboard
    const copyRoomCode = async (roomCode: string) => {
        try {
            await navigator.clipboard.writeText(roomCode);
        } catch (error) {
            console.error('Failed to copy room code:', error);
        }
    };

    // Get session type info
    const getSessionTypeInfo = (sessionType: string) => {
        return SESSION_TYPES.find(type => type.id === sessionType) || SESSION_TYPES[0];
    };

    // Format duration
    const formatDuration = (startTime: string) => {
        const start = new Date(startTime);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes}m`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${hours}h ${minutes}m`;
        }
    };

    // If currently in a session, show session controls
    if (currentSession) {
        const sessionTypeInfo = getSessionTypeInfo(currentSession.session_type);
        const isHost = currentSession.host_id === JSON.parse(localStorage.getItem('star_auth') || '{}').user?.id;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl p-6 border border-purple-500/30"
            >
                {/* Session Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${sessionTypeInfo.color} flex items-center justify-center text-2xl`}>
                            {sessionTypeInfo.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                {currentSession.title}
                                {isHost && <Crown className="w-5 h-5 text-yellow-400" />}
                            </h3>
                            <p className="text-purple-200 text-sm">{sessionTypeInfo.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {currentSession.room_code && (
                            <button
                                onClick={() => copyRoomCode(currentSession.room_code!)}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600/50 text-purple-100 rounded-lg hover:bg-purple-600/70 transition-colors"
                            >
                                <Hash className="w-4 h-4" />
                                {currentSession.room_code}
                                <Copy className="w-3 h-3" />
                            </button>
                        )}

                        <button
                            onClick={handleLeaveSession}
                            className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Leave Session
                        </button>
                    </div>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <Users className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                        <p className="text-sm text-purple-200">Participants</p>
                        <p className="text-lg font-bold text-white">{currentSession.participant_count}/{currentSession.max_participants}</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <Clock className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                        <p className="text-sm text-purple-200">Duration</p>
                        <p className="text-lg font-bold text-white">
                            {currentSession.started_at ? formatDuration(currentSession.started_at) : '0m'}
                        </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 text-center">
                        <Star className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                        <p className="text-sm text-purple-200">Status</p>
                        <p className="text-lg font-bold text-white capitalize">{currentSession.status}</p>
                    </div>
                </div>

                {/* Voice/Video Controls */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                    {!voiceChannel.connected ? (
                        <button
                            onClick={joinVoiceChannel}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <PhoneCall className="w-5 h-5" />
                            Join Voice
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={toggleMute}
                                className={`p-3 rounded-lg transition-colors ${voiceChannel.muted
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                            >
                                {voiceChannel.muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`p-3 rounded-lg transition-colors ${voiceChannel.video_enabled
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                            >
                                {voiceChannel.video_enabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={leaveVoiceChannel}
                                className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <PhoneOff className="w-5 h-5" />
                                Leave Voice
                            </button>
                        </>
                    )}
                </div>

                {/* Participants List */}
                <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white mb-3">Participants</h4>
                    <div className="grid gap-2">
                        {currentSession.participants.map((participant) => (
                            <div
                                key={participant.user_id}
                                className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {participant.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{participant.username}</p>
                                        <p className="text-purple-200 text-sm capitalize">{participant.zodiac_sign}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {participant.role === 'host' && <Crown className="w-4 h-4 text-yellow-400" />}
                                    <div className={`w-2 h-2 rounded-full ${participant.is_online ? 'bg-green-400' : 'bg-gray-400'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    // Main session manager interface
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Collaborative Cosmic Sessions</h2>
                <p className="text-purple-200">Join others in shared cosmic experiences and mystical discoveries</p>
            </div>

            {/* Connection Status */}
            {!connected && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                    <p className="text-red-300 text-center">Connecting to collaboration server...</p>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-1 p-1 bg-gray-800/50 rounded-lg">
                {[
                    { id: 'browse', label: 'Browse Sessions', icon: Eye },
                    { id: 'create', label: 'Create Session', icon: Plus },
                    { id: 'join', label: 'Join by Code', icon: Hash }
                ].map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors ${activeTab === id
                                ? 'bg-purple-600 text-white'
                                : 'text-purple-200 hover:text-white hover:bg-purple-600/50'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'browse' && (
                    <motion.div
                        key="browse"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                            />
                        </div>

                        {/* Sessions Grid */}
                        <div className="grid gap-4">
                            {filteredSessions.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                                    <p className="text-purple-200 text-lg">No active sessions found</p>
                                    <p className="text-purple-300 text-sm">Create a new session to get started</p>
                                </div>
                            ) : (
                                filteredSessions.map((session) => {
                                    const typeInfo = getSessionTypeInfo(session.session_type);
                                    return (
                                        <motion.div
                                            key={session.session_id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-purple-500/20 hover:border-purple-400/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${typeInfo.color} flex items-center justify-center text-2xl`}>
                                                        {typeInfo.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                            {session.title}
                                                            {session.is_private ? <Lock className="w-4 h-4 text-purple-400" /> : <Unlock className="w-4 h-4 text-green-400" />}
                                                        </h3>
                                                        <p className="text-purple-200 text-sm">{typeInfo.name}</p>
                                                        {session.description && (
                                                            <p className="text-purple-300 text-sm mt-1">{session.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <span className="text-purple-200 text-sm flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {session.participant_count}/{session.max_participants}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded text-xs capitalize ${session.status === 'active' ? 'bg-green-500/20 text-green-300' :
                                                                session.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                    'bg-gray-500/20 text-gray-300'
                                                            }`}>
                                                            {session.status}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleJoinSession(session.session_id, session.is_private)}
                                                        disabled={isJoining || session.participant_count >= session.max_participants}
                                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {isJoining ? 'Joining...' : 'Join Session'}
                                                    </button>
                                                </div>
                                            </div>

                                            {session.room_code && (
                                                <div className="mt-4 pt-4 border-t border-purple-500/20">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-purple-200 text-sm">Room Code:</span>
                                                        <button
                                                            onClick={() => copyRoomCode(session.room_code!)}
                                                            className="font-mono text-purple-300 hover:text-white transition-colors"
                                                        >
                                                            {session.room_code}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-purple-500/20"
                    >
                        <h3 className="text-xl font-bold text-white mb-6">Create New Session</h3>

                        <div className="space-y-6">
                            {/* Session Type Selection */}
                            <div>
                                <label className="block text-purple-200 text-sm font-medium mb-3">Session Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SESSION_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setCreateForm({ ...createForm, session_type: type.id })}
                                            className={`p-4 rounded-lg border-2 transition-colors text-left ${createForm.session_type === type.id
                                                    ? 'border-purple-400 bg-purple-600/20'
                                                    : 'border-purple-500/20 hover:border-purple-400/50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{type.icon}</span>
                                                <span className="text-white font-medium">{type.name}</span>
                                            </div>
                                            <p className="text-purple-200 text-sm">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">Session Title</label>
                                    <input
                                        type="text"
                                        value={createForm.title}
                                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                        placeholder="Enter session title..."
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-purple-200 text-sm font-medium mb-2">Max Participants</label>
                                    <select
                                        value={createForm.max_participants}
                                        onChange={(e) => setCreateForm({ ...createForm, max_participants: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                                    >
                                        <option value={2}>2 participants</option>
                                        <option value={4}>4 participants</option>
                                        <option value={6}>6 participants</option>
                                        <option value={8}>8 participants</option>
                                        <option value={12}>12 participants</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-purple-200 text-sm font-medium mb-2">Description (Optional)</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    placeholder="Describe your session..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 resize-none"
                                />
                            </div>

                            {/* Privacy Settings */}
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.is_private}
                                        onChange={(e) => setCreateForm({ ...createForm, is_private: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 bg-gray-700 border-purple-500/30 rounded focus:ring-purple-400"
                                    />
                                    <span className="text-purple-200">Private Session</span>
                                </label>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={handleCreateSession}
                                disabled={isCreating || !createForm.title.trim()}
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                {isCreating ? 'Creating Session...' : 'Create Session'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'join' && (
                    <motion.div
                        key="join"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-purple-500/20"
                    >
                        <h3 className="text-xl font-bold text-white mb-6">Join by Room Code</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-purple-200 text-sm font-medium mb-2">Room Code</label>
                                <input
                                    type="text"
                                    value={roomCodeInput}
                                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                                    placeholder="Enter 6-digit room code..."
                                    maxLength={6}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 text-center text-2xl font-mono tracking-widest"
                                />
                                <p className="text-purple-300 text-sm mt-2">Ask the session host for the room code</p>
                            </div>

                            <button
                                onClick={handleJoinByRoomCode}
                                disabled={isJoining || roomCodeInput.length !== 6}
                                className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                                {isJoining ? 'Joining...' : 'Join Session'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollaborationSessionManager;