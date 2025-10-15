import { OrbitControls, Sphere, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Compass,
    Eye,
    Heart,
    MessageCircle,
    Mic,
    MicOff,
    Moon,
    Pause,
    Play,
    Sparkles,
    Star,
    Users,
    Volume2,
    VolumeX,
    Waves
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';

interface MeditationSession {
    id: string;
    title: string;
    description: string;
    type: 'guided' | 'silent' | 'chakra' | 'breathwork' | 'visualization' | 'sound-healing';
    duration: number; // in minutes
    maxParticipants: number;
    currentParticipants: number;
    host: {
        id: string;
        name: string;
        zodiacSign: string;
        isVerified: boolean;
    };
    participants: Array<{
        id: string;
        name: string;
        zodiacSign: string;
        isOnline: boolean;
        meditationLevel: number;
        aura: string;
    }>;
    startTime: string;
    isActive: boolean;
    cosmicTheme: {
        primaryColor: string;
        secondaryColor: string;
        environment: 'space' | 'forest' | 'ocean' | 'mountains' | 'cosmos';
        soundscape: string[];
    };
    settings: {
        allowChat: boolean;
        allowVoice: boolean;
        allowVideo: boolean;
        isPublic: boolean;
        requiresApproval: boolean;
    };
}

interface GroupMeditationSpaceProps {
    sessionId?: string;
    onSessionCreate?: (session: MeditationSession) => void;
    onSessionJoin?: (sessionId: string) => void;
    onSessionLeave?: () => void;
}

export const GroupMeditationSpace: React.FC<GroupMeditationSpaceProps> = ({
    sessionId,
    onSessionCreate,
    onSessionJoin,
    onSessionLeave
}) => {
    const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null);
    const [availableSessions, setAvailableSessions] = useState<MeditationSession[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isInSession, setIsInSession] = useState(false);
    const [sessionSettings, setSessionSettings] = useState({
        audioEnabled: true,
        videoEnabled: false,
        micEnabled: false,
        chatEnabled: true,
        notificationsEnabled: true
    });
    const [meditationState, setMeditationState] = useState({
        isPlaying: false,
        currentTime: 0,
        totalTime: 0,
        phase: 'preparation' as 'preparation' | 'active' | 'integration' | 'completion',
        breathCount: 0,
        heartRate: 72,
        focusLevel: 50
    });

    // Mock sessions data
    const mockSessions: MeditationSession[] = [
        {
            id: '1',
            title: 'Cosmic Chakra Journey',
            description: 'A guided meditation through the seven chakras with cosmic visualizations and sound healing.',
            type: 'chakra',
            duration: 45,
            maxParticipants: 20,
            currentParticipants: 7,
            host: {
                id: 'host1',
                name: 'Luna_MoonWatcher',
                zodiacSign: 'Pisces',
                isVerified: true
            },
            participants: [
                { id: '1', name: 'StarSeeker', zodiacSign: 'Virgo', isOnline: true, meditationLevel: 85, aura: 'Golden' },
                { id: '2', name: 'CosmicBreather', zodiacSign: 'Leo', isOnline: true, meditationLevel: 72, aura: 'Blue' },
                { id: '3', name: 'ZenMaster', zodiacSign: 'Libra', isOnline: true, meditationLevel: 94, aura: 'Violet' }
            ],
            startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
            isActive: false,
            cosmicTheme: {
                primaryColor: '#9333ea',
                secondaryColor: '#06b6d4',
                environment: 'cosmos',
                soundscape: ['tibetan-bowls', 'cosmic-drones', 'nature-sounds']
            },
            settings: {
                allowChat: true,
                allowVoice: false,
                allowVideo: false,
                isPublic: true,
                requiresApproval: false
            }
        },
        {
            id: '2',
            title: 'Silent Sunrise Meditation',
            description: 'A peaceful silent meditation session to welcome the dawn and set intentions for the day.',
            type: 'silent',
            duration: 30,
            maxParticipants: 50,
            currentParticipants: 23,
            host: {
                id: 'host2',
                name: 'Dawnkeeper_Sol',
                zodiacSign: 'Aries',
                isVerified: true
            },
            participants: [],
            startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            isActive: true,
            cosmicTheme: {
                primaryColor: '#f59e0b',
                secondaryColor: '#f97316',
                environment: 'mountains',
                soundscape: ['gentle-wind', 'distant-birds']
            },
            settings: {
                allowChat: false,
                allowVoice: false,
                allowVideo: false,
                isPublic: true,
                requiresApproval: false
            }
        }
    ];

    useEffect(() => {
        setAvailableSessions(mockSessions);
        if (sessionId) {
            const session = mockSessions.find(s => s.id === sessionId);
            if (session) {
                setCurrentSession(session);
                setIsInSession(true);
            }
        }
    }, [sessionId]);

    const joinSession = useCallback((session: MeditationSession) => {
        setCurrentSession(session);
        setIsInSession(true);
        setMeditationState(prev => ({
            ...prev,
            totalTime: session.duration * 60,
            phase: session.isActive ? 'active' : 'preparation'
        }));
        onSessionJoin?.(session.id);
    }, [onSessionJoin]);

    const leaveSession = useCallback(() => {
        setCurrentSession(null);
        setIsInSession(false);
        setMeditationState(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: 0,
            phase: 'preparation'
        }));
        onSessionLeave?.();
    }, [onSessionLeave]);

    const togglePlayPause = useCallback(() => {
        setMeditationState(prev => ({
            ...prev,
            isPlaying: !prev.isPlaying
        }));
    }, []);

    if (isInSession && currentSession) {
        return (
            <MeditationSessionView
                session={currentSession}
                meditationState={meditationState}
                sessionSettings={sessionSettings}
                onSettingsChange={setSessionSettings}
                onStateChange={setMeditationState}
                onLeave={leaveSession}
                onTogglePlayPause={togglePlayPause}
            />
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                    <Heart className="w-8 h-8 mr-3 text-pink-400" />
                    Group Meditation Space
                </h1>
                <p className="text-white/60">Find inner peace together with cosmic companions</p>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                >
                    Create Session
                </button>
                <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Browse All Sessions
                </button>
            </div>

            {/* Active Sessions */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <Users className="w-6 h-6 mr-3 text-cyan-400" />
                    Available Sessions
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {availableSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onJoin={() => joinSession(session)}
                        />
                    ))}
                </div>
            </div>

            {/* Create Session Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateSessionModal
                        onClose={() => setShowCreateModal(false)}
                        onCreate={(session) => {
                            onSessionCreate?.(session);
                            setShowCreateModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Session Card Component
const SessionCard: React.FC<{
    session: MeditationSession;
    onJoin: () => void;
}> = ({ session, onJoin }) => {
    const getTypeIcon = (type: string) => {
        const icons = {
            guided: Compass,
            silent: Moon,
            chakra: Sparkles,
            breathwork: Waves,
            visualization: Eye,
            'sound-healing': Volume2
        };
        return icons[type as keyof typeof icons] || Star;
    };

    const TypeIcon = getTypeIcon(session.type);
    const timeToStart = new Date(session.startTime).getTime() - Date.now();
    const minutesToStart = Math.floor(timeToStart / (1000 * 60));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/30 transition-all"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div
                        className="p-3 rounded-full"
                        style={{ backgroundColor: session.cosmicTheme.primaryColor + '20' }}
                    >
                        <TypeIcon
                            className="w-6 h-6"
                            style={{ color: session.cosmicTheme.primaryColor }}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{session.title}</h3>
                        <p className="text-sm text-white/60 capitalize">{session.type.replace('-', ' ')}</p>
                    </div>
                </div>
                {session.isActive && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span>Live</span>
                    </div>
                )}
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm mb-4 line-clamp-2">{session.description}</p>

            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-sm">
                    <span className="text-white/60">Duration:</span>
                    <span className="text-white ml-2">{session.duration} min</span>
                </div>
                <div className="text-sm">
                    <span className="text-white/60">Participants:</span>
                    <span className="text-white ml-2">{session.currentParticipants}/{session.maxParticipants}</span>
                </div>
                <div className="text-sm">
                    <span className="text-white/60">Host:</span>
                    <span className="text-white ml-2">{session.host.name}</span>
                </div>
                <div className="text-sm">
                    <span className="text-white/60">Starts in:</span>
                    <span className={`ml-2 ${minutesToStart <= 5 ? 'text-orange-400' : 'text-white'}`}>
                        {minutesToStart > 0 ? `${minutesToStart} min` : 'Now'}
                    </span>
                </div>
            </div>

            {/* Participants Preview */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Participants</span>
                    <div className="flex -space-x-2">
                        {session.participants.slice(0, 4).map((participant) => (
                            <div
                                key={participant.id}
                                className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-white"
                                title={participant.name}
                            >
                                {participant.name[0]}
                            </div>
                        ))}
                        {session.participants.length > 4 && (
                            <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-black flex items-center justify-center text-xs text-white">
                                +{session.participants.length - 4}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Join Button */}
            <button
                onClick={onJoin}
                disabled={session.currentParticipants >= session.maxParticipants}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${session.currentParticipants >= session.maxParticipants
                        ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                        : session.isActive
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    }`}
            >
                {session.currentParticipants >= session.maxParticipants
                    ? 'Session Full'
                    : session.isActive
                        ? 'Join Now'
                        : 'Reserve Spot'
                }
            </button>
        </motion.div>
    );
};

// Meditation Session View Component
const MeditationSessionView: React.FC<{
    session: MeditationSession;
    meditationState: any;
    sessionSettings: any;
    onSettingsChange: (settings: any) => void;
    onStateChange: (state: any) => void;
    onLeave: () => void;
    onTogglePlayPause: () => void;
}> = ({ session, meditationState, sessionSettings, onSettingsChange, onStateChange, onLeave, onTogglePlayPause }) => {
    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            {/* 3D Meditation Environment */}
            <div className="absolute inset-0">
                <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} intensity={0.3} />

                    <Stars radius={300} depth={60} count={1000} factor={4} />

                    {/* Meditation Sphere */}
                    <MeditationSphere
                        color={session.cosmicTheme.primaryColor}
                        phase={meditationState.phase}
                        isPlaying={meditationState.isPlaying}
                    />

                    {/* Participant Spheres */}
                    <ParticipantSpheres participants={session.participants} />

                    <OrbitControls enablePan={false} enableZoom={false} enableRotate={true} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{session.title}</h1>
                        <p className="text-white/60">{session.participants.length + 1} participants</p>
                    </div>
                    <button
                        onClick={onLeave}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                        Leave Session
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
                <MeditationControls
                    session={session}
                    meditationState={meditationState}
                    sessionSettings={sessionSettings}
                    onSettingsChange={onSettingsChange}
                    onTogglePlayPause={onTogglePlayPause}
                />
            </div>

            {/* Side Panel */}
            <div className="absolute top-20 right-6 bottom-20 w-80 z-10">
                <MeditationSidePanel
                    session={session}
                    meditationState={meditationState}
                    sessionSettings={sessionSettings}
                    onSettingsChange={onSettingsChange}
                />
            </div>
        </div>
    );
};

// Meditation Sphere Component
const MeditationSphere: React.FC<{
    color: string;
    phase: string;
    isPlaying: boolean;
}> = ({ color, phase, isPlaying }) => {
    const meshRef = React.useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current || !isPlaying) return;

        // Breathing animation
        const breathScale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        meshRef.current.scale.setScalar(breathScale);

        // Phase-based rotation
        const rotationSpeed = phase === 'active' ? 0.01 : 0.005;
        meshRef.current.rotation.y += rotationSpeed;
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshPhongMaterial
                color={color}
                transparent
                opacity={0.3}
                emissive={color}
                emissiveIntensity={0.2}
            />
        </mesh>
    );
};

// Participant Spheres Component
const ParticipantSpheres: React.FC<{
    participants: Array<{
        id: string;
        name: string;
        aura: string;
        meditationLevel: number;
    }>;
}> = ({ participants }) => {
    return (
        <group>
            {participants.map((participant, index) => {
                const angle = (index / participants.length) * Math.PI * 2;
                const radius = 5;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

                return (
                    <group key={participant.id} position={[x, 0, z]}>
                        <Sphere args={[0.3]} material-color={participant.aura} material-transparent material-opacity={0.6} />
                        <Text
                            position={[0, -0.6, 0]}
                            fontSize={0.2}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {participant.name}
                        </Text>
                    </group>
                );
            })}
        </group>
    );
};

// Meditation Controls Component
const MeditationControls: React.FC<{
    session: MeditationSession;
    meditationState: any;
    sessionSettings: any;
    onSettingsChange: (settings: any) => void;
    onTogglePlayPause: () => void;
}> = ({ session, meditationState, sessionSettings, onSettingsChange, onTogglePlayPause }) => {
    return (
        <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
                {/* Play Controls */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onTogglePlayPause}
                        className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                        {meditationState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    <div className="text-white">
                        <div className="text-sm text-white/60">Phase</div>
                        <div className="capitalize">{meditationState.phase}</div>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex-1 mx-8">
                    <div className="flex justify-between text-sm text-white/60 mb-2">
                        <span>{Math.floor(meditationState.currentTime / 60)}:{(meditationState.currentTime % 60).toString().padStart(2, '0')}</span>
                        <span>{Math.floor(meditationState.totalTime / 60)}:{(meditationState.totalTime % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${(meditationState.currentTime / meditationState.totalTime) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onSettingsChange({ ...sessionSettings, audioEnabled: !sessionSettings.audioEnabled })}
                        className={`p-3 rounded-lg transition-colors ${sessionSettings.audioEnabled ? 'text-white' : 'text-white/40'
                            }`}
                    >
                        {sessionSettings.audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => onSettingsChange({ ...sessionSettings, micEnabled: !sessionSettings.micEnabled })}
                        className={`p-3 rounded-lg transition-colors ${sessionSettings.micEnabled ? 'text-white' : 'text-white/40'
                            }`}
                        disabled={!session.settings.allowVoice}
                    >
                        {sessionSettings.micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => onSettingsChange({ ...sessionSettings, chatEnabled: !sessionSettings.chatEnabled })}
                        className={`p-3 rounded-lg transition-colors ${sessionSettings.chatEnabled ? 'text-white' : 'text-white/40'
                            }`}
                        disabled={!session.settings.allowChat}
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Meditation Side Panel Component
const MeditationSidePanel: React.FC<{
    session: MeditationSession;
    meditationState: any;
    sessionSettings: any;
    onSettingsChange: (settings: any) => void;
}> = ({ session, meditationState, sessionSettings }) => {
    return (
        <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/20 h-full overflow-y-auto">
            <div className="space-y-6">
                {/* Vital Stats */}
                <div>
                    <h3 className="text-white font-semibold mb-3">Your State</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">Focus Level</span>
                            <span className="text-cyan-400">{meditationState.focusLevel}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                                style={{ width: `${meditationState.focusLevel}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">Heart Rate</span>
                            <span className="text-pink-400">{meditationState.heartRate} BPM</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/60 text-sm">Breaths</span>
                            <span className="text-green-400">{meditationState.breathCount}</span>
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div>
                    <h3 className="text-white font-semibold mb-3">Participants</h3>
                    <div className="space-y-2">
                        {session.participants.map((participant) => (
                            <div
                                key={participant.id}
                                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${participant.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                                    <span className="text-white text-sm">{participant.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-white/60">{participant.meditationLevel}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat (if enabled) */}
                {sessionSettings.chatEnabled && session.settings.allowChat && (
                    <div>
                        <h3 className="text-white font-semibold mb-3">Messages</h3>
                        <div className="space-y-2 mb-3">
                            <div className="text-xs text-white/60 p-2 bg-white/5 rounded">
                                Welcome to the meditation session. Find your comfortable position and focus on your breath.
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Type a gentle message..."
                                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                            />
                            <button className="p-2 text-cyan-400 hover:text-cyan-300">
                                <MessageCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Create Session Modal Component
const CreateSessionModal: React.FC<{
    onClose: () => void;
    onCreate: (session: MeditationSession) => void;
}> = ({ onClose, onCreate }) => {
    const [sessionData, setSessionData] = useState({
        title: '',
        description: '',
        type: 'guided' as const,
        duration: 30,
        maxParticipants: 10,
        isPublic: true,
        allowChat: true,
        allowVoice: false,
        environment: 'cosmos' as const
    });

    const handleCreate = () => {
        const newSession: MeditationSession = {
            id: `session-${Date.now()}`,
            ...sessionData,
            currentParticipants: 1,
            host: {
                id: 'current-user',
                name: 'Current User',
                zodiacSign: 'Virgo',
                isVerified: false
            },
            participants: [],
            startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            isActive: false,
            cosmicTheme: {
                primaryColor: '#9333ea',
                secondaryColor: '#06b6d4',
                environment: sessionData.environment,
                soundscape: ['ambient', 'nature']
            },
            settings: {
                allowChat: sessionData.allowChat,
                allowVoice: sessionData.allowVoice,
                allowVideo: false,
                isPublic: sessionData.isPublic,
                requiresApproval: false
            }
        };

        onCreate(newSession);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Create Meditation Session</h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Session Title</label>
                        <input
                            type="text"
                            value={sessionData.title}
                            onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                            placeholder="Enter session title..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Description</label>
                        <textarea
                            value={sessionData.description}
                            onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 h-24"
                            placeholder="Describe your meditation session..."
                        />
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">Type</label>
                            <select
                                value={sessionData.type}
                                onChange={(e) => setSessionData({ ...sessionData, type: e.target.value as any })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                            >
                                <option value="guided">Guided</option>
                                <option value="silent">Silent</option>
                                <option value="chakra">Chakra</option>
                                <option value="breathwork">Breathwork</option>
                                <option value="visualization">Visualization</option>
                                <option value="sound-healing">Sound Healing</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">Duration (minutes)</label>
                            <input
                                type="number"
                                value={sessionData.duration}
                                onChange={(e) => setSessionData({ ...sessionData, duration: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                                min="5"
                                max="120"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">Max Participants</label>
                            <input
                                type="number"
                                value={sessionData.maxParticipants}
                                onChange={(e) => setSessionData({ ...sessionData, maxParticipants: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                                min="2"
                                max="100"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">Environment</label>
                            <select
                                value={sessionData.environment}
                                onChange={(e) => setSessionData({ ...sessionData, environment: e.target.value as any })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                            >
                                <option value="cosmos">Cosmos</option>
                                <option value="forest">Forest</option>
                                <option value="ocean">Ocean</option>
                                <option value="mountains">Mountains</option>
                                <option value="space">Space</option>
                            </select>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Public Session</span>
                            <button
                                onClick={() => setSessionData({ ...sessionData, isPublic: !sessionData.isPublic })}
                                className={`w-12 h-6 rounded-full transition-colors ${sessionData.isPublic ? 'bg-cyan-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${sessionData.isPublic ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Allow Chat</span>
                            <button
                                onClick={() => setSessionData({ ...sessionData, allowChat: !sessionData.allowChat })}
                                className={`w-12 h-6 rounded-full transition-colors ${sessionData.allowChat ? 'bg-cyan-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${sessionData.allowChat ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Allow Voice</span>
                            <button
                                onClick={() => setSessionData({ ...sessionData, allowVoice: !sessionData.allowVoice })}
                                className={`w-12 h-6 rounded-full transition-colors ${sessionData.allowVoice ? 'bg-cyan-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${sessionData.allowVoice ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-white/60 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!sessionData.title || !sessionData.description}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Create Session
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default GroupMeditationSpace;