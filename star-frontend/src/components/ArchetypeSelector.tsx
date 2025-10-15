import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Crown, Eye, Heart, Sparkles, User, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ArchetypeProfile {
    tarot: {
        life_path: { card: string; number: number; meaning: string };
        birth_card: { card: string; meaning: string };
        soul_urge: { card: string; meaning: string };
        personality: { card: string; meaning: string };
    };
    zodiac_data: {
        western: { sign: string; element: string; modality: string };
        chinese: { animal: string; element: string; year: number };
        vedic: { sign: string; nakshatra: string };
    };
    numerology: {
        life_path: number;
        expression: number;
        soul_urge: number;
        personality: number;
    };
}

interface MentorPersona {
    name: string;
    evolutions: string[];
    archetypal_alignment: string;
    mood_state: string;
    voice_features: {
        tone: string;
        pace: string;
        emphasis: string[];
    };
}

interface ArchetypeSelectorProps {
    onArchetypeSelected?: (archetype: ArchetypeProfile, mentor: MentorPersona) => void;
    showMentorChat?: boolean;
}

const ARCHETYPE_ICONS = {
    'The Magician': Zap,
    'The High Priestess': Eye,
    'The Empress': Heart,
    'The Emperor': Crown,
    'The Fool': Compass,
    'The Star': Sparkles,
    'The Sun': Sparkles,
    'The Moon': Eye,
    'Default': User
};

const MOOD_COLORS = {
    nurturing: 'from-green-500 to-emerald-400',
    empowering: 'from-yellow-500 to-orange-400',
    mysterious: 'from-purple-600 to-indigo-500',
    inspirational: 'from-blue-500 to-cyan-400',
    transformative: 'from-pink-500 to-rose-400'
};

export const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({
    onArchetypeSelected,
    showMentorChat = true
}) => {
    const [profile, setProfile] = useState<ArchetypeProfile | null>(null);
    const [mentor, setMentor] = useState<MentorPersona | null>(null);
    const [selectedMood, setSelectedMood] = useState<string>('mysterious');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mentorInput, setMentorInput] = useState('');
    const [mentorResponse, setMentorResponse] = useState<string>('');
    const [showChat, setShowChat] = useState(false);
    const { user, loading: authLoading } = useAuth();

    const isAuthenticated = !!user && !authLoading;

    const generateMentorPersona = useCallback(async (profileData?: ArchetypeProfile) => {
        if (!isAuthenticated || !profileData) return;

        try {
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.post(
                `${API_URL}/api/v1/mentor-personality`,
                {
                    user_input: 'Generate my archetypal mentor persona',
                    mood_override: selectedMood
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (response.data.mentor_response) {
                const mentorData = response.data.mentor_response;
                setMentor(mentorData);

                if (onArchetypeSelected) {
                    onArchetypeSelected(profileData, mentorData);
                }
            }
        } catch (err: any) {
            console.error('Error generating mentor persona:', err);
        }
    }, [selectedMood, onArchetypeSelected, isAuthenticated]);

    const generateCosmicProfile = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);

        try {
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/api/v1/archetype-oracle/cosmic-profile`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (response.data.success) {
                const profileData = response.data.cosmic_profile;
                setProfile(profileData);

                // Generate initial mentor persona
                await generateMentorPersona(profileData);
            } else {
                throw new Error(response.data.error || 'Failed to generate cosmic profile');
            }
        } catch (err: any) {
            console.error('Error generating cosmic profile:', err);
            setError('Failed to access cosmic frequencies');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, generateMentorPersona]);

    // Generate cosmic profile on component mount
    useEffect(() => {
        if (isAuthenticated) {
            generateCosmicProfile();
        }
    }, [isAuthenticated, generateCosmicProfile]);

    const sendMentorMessage = async () => {
        if (!mentorInput.trim() || !isAuthenticated) return;

        setLoading(true);
        const userMessage = mentorInput;
        setMentorInput('');

        try {
            const authToken = localStorage.getItem('auth_token');
            const response = await axios.post(
                `${API_URL}/api/v1/mentor-personality`,
                {
                    user_input: userMessage,
                    mood_override: selectedMood
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (response.data.mentor_response) {
                setMentorResponse(response.data.mentor_response.response_content);
            }
        } catch (err: any) {
            console.error('Error sending mentor message:', err);
            setError('Failed to connect with cosmic mentor');
        } finally {
            setLoading(false);
        }
    };

    const changeMentorMood = (newMood: string) => {
        setSelectedMood(newMood);
        if (profile) {
            generateMentorPersona(profile);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="archetype-selector-auth bg-gradient-to-br from-purple-900/50 to-blue-900/30 rounded-2xl p-8 text-center">
                <Eye className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Unlock Your Cosmic Archetype</h3>
                <p className="text-purple-200 mb-6">
                    Connect with your personal cosmic mentor and discover your archetypal essence.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all">
                    Sign In to Begin Journey
                </button>
            </div>
        );
    }

    if (loading && !profile) {
        return (
            <div className="archetype-selector-loading bg-gradient-to-br from-purple-900/50 to-blue-900/30 rounded-2xl p-8 text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl text-white mb-2">Scanning Cosmic Frequencies...</h3>
                <p className="text-purple-200">Aligning with your archetypal essence</p>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="archetype-selector-error bg-gradient-to-br from-red-900/50 to-purple-900/30 rounded-2xl p-8 text-center">
                <Zap className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">Cosmic Interference Detected</h3>
                <p className="text-red-200 mb-4">{error}</p>
                <button
                    onClick={generateCosmicProfile}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
                >
                    Reconnect to Source
                </button>
            </div>
        );
    }

    return (
        <div className="archetype-selector max-w-4xl mx-auto space-y-6">
            {/* Archetype Profile Display */}
            {profile && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-900/50 to-blue-900/30 rounded-2xl p-6 border border-purple-500/30"
                >
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* Life Path Archetype */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                {React.createElement(
                                    ARCHETYPE_ICONS[profile.tarot.life_path.card as keyof typeof ARCHETYPE_ICONS] || ARCHETYPE_ICONS.Default,
                                    { className: "w-8 h-8 text-purple-400" }
                                )}
                                Your Core Archetype
                            </h3>

                            <div className="bg-black/20 rounded-xl p-4">
                                <h4 className="text-xl text-purple-300 font-semibold">
                                    {profile.tarot.life_path.card}
                                </h4>
                                <p className="text-purple-200 mt-2">{profile.tarot.life_path.meaning}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-sm text-purple-300">Life Path Number:</span>
                                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold">
                                        {profile.tarot.life_path.number}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Zodiac Integration */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Compass className="w-8 h-8 text-blue-400" />
                                Cosmic Alignment
                            </h3>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-black/20 rounded-xl p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-300 text-sm">Western:</span>
                                        <span className="text-white font-semibold">
                                            {profile.zodiac_data.western.sign}
                                        </span>
                                    </div>
                                    <div className="text-xs text-purple-200">
                                        {profile.zodiac_data.western.element} • {profile.zodiac_data.western.modality}
                                    </div>
                                </div>

                                <div className="bg-black/20 rounded-xl p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-300 text-sm">Chinese:</span>
                                        <span className="text-white font-semibold">
                                            {profile.zodiac_data.chinese.animal}
                                        </span>
                                    </div>
                                    <div className="text-xs text-purple-200">
                                        {profile.zodiac_data.chinese.element} • {profile.zodiac_data.chinese.year}
                                    </div>
                                </div>

                                <div className="bg-black/20 rounded-xl p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-purple-300 text-sm">Vedic:</span>
                                        <span className="text-white font-semibold">
                                            {profile.zodiac_data.vedic.sign}
                                        </span>
                                    </div>
                                    <div className="text-xs text-purple-200">
                                        {profile.zodiac_data.vedic.nakshatra}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mentor Integration Section */}
                    {mentor && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 border-t border-purple-500/20 pt-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <User className="w-6 h-6 text-pink-400" />
                                    Your Cosmic Mentor: {mentor.name}
                                </h3>

                                {showMentorChat && (
                                    <button
                                        onClick={() => setShowChat(!showChat)}
                                        className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-500 hover:to-purple-500 transition-all"
                                    >
                                        {showChat ? 'Hide Chat' : 'Open Chat'}
                                    </button>
                                )}
                            </div>

                            {/* Mood Selector */}
                            <div className="mb-4">
                                <p className="text-purple-200 text-sm mb-2">Mentor Mood:</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(MOOD_COLORS).map((mood) => (
                                        <button
                                            key={mood}
                                            onClick={() => changeMentorMood(mood)}
                                            className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-all
                        ${selectedMood === mood
                                                    ? `bg-gradient-to-r ${MOOD_COLORS[mood as keyof typeof MOOD_COLORS]} text-white`
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }
                      `}
                                        >
                                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black/20 rounded-xl p-4">
                                <p className="text-purple-200 text-sm">Archetypal Alignment:</p>
                                <p className="text-white font-semibold">{mentor.archetypal_alignment}</p>
                                <p className="text-purple-300 text-sm mt-1">
                                    Available Evolutions: {mentor.evolutions.join(' • ')}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Mentor Chat Interface */}
            <AnimatePresence>
                {showChat && mentor && showMentorChat && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-br from-indigo-900/50 to-purple-900/30 rounded-2xl p-6 border border-indigo-500/30"
                    >
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                            Cosmic Guidance Session
                        </h3>

                        {/* Mentor Response Display */}
                        {mentorResponse && (
                            <div className="bg-black/30 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className={`
                    w-10 h-10 rounded-full bg-gradient-to-r ${MOOD_COLORS[selectedMood as keyof typeof MOOD_COLORS]} 
                    flex items-center justify-center
                  `}>
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-indigo-300 text-sm font-semibold mb-1">{mentor.name}</p>
                                        <p className="text-white leading-relaxed">{mentorResponse}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Chat Input */}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={mentorInput}
                                onChange={(e) => setMentorInput(e.target.value)}
                                placeholder="Ask your cosmic mentor for guidance..."
                                className="flex-1 bg-black/30 border border-indigo-500/30 rounded-xl px-4 py-3 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !loading) {
                                        sendMentorMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={sendMentorMessage}
                                disabled={loading || !mentorInput.trim()}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </div>

                        <p className="text-indigo-300 text-xs mt-2 text-center">
                            Your mentor responds based on your unique archetypal profile and chosen mood
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Regenerate Profile Button */}
            <div className="text-center">
                <button
                    onClick={generateCosmicProfile}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50"
                >
                    <Sparkles className="inline w-5 h-5 mr-2" />
                    Regenerate Cosmic Profile
                </button>
            </div>
        </div>
    );
};

export default ArchetypeSelector;