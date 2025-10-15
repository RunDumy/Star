import axios from 'axios';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CosmicPageWrapper } from '../components/cosmic/CosmicPageWrapper';


// Navigation through 3D planets only - no traditional UI buttons

const ZodiacProfile = () => {
    const [profile, setProfile] = useState(null);
    const [avatar, setAvatar] = useState('');
    const [background, setBackground] = useState('');
    const [bio, setBio] = useState('');
    const [dailyFeatures, setDailyFeatures] = useState(null);
    const [weeklyTarot, setWeeklyTarot] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/register');
            return;
        }

        fetchProfile();
        fetchDailyFeatures();
        fetchWeeklyTarot();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/user/profile`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProfile(response.data);
            setAvatar(response.data.avatar || '');
            setBackground(response.data.background || '');
            setBio(response.data.bio || '');
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                router.push('/register');
            }
            setLoading(false);
        }
    };

    const fetchDailyFeatures = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/daily-features`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDailyFeatures(response.data);
        } catch (error) {
            console.error('Failed to fetch daily features:', error);
        }
    };

    const fetchWeeklyTarot = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/tarot/weekly`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setWeeklyTarot(response.data);
        } catch (error) {
            console.error('Failed to fetch weekly tarot:', error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await axios.put(`${API_URL}/api/v1/user/profile`, {
                avatar,
                background,
                bio
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update failed:', error);
            alert('Failed to update profile.');
        }
    };

    const handleShareReading = async (readingId: string) => {
        try {
            await axios.post(`${API_URL}/api/v1/share-reading`, {
                reading_id: readingId,
                share_to: 'profile'
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Tarot reading shared to profile!');
        } catch (error) {
            console.error('Failed to share reading:', error);
            alert('Failed to share reading.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <motion.div
                    className="text-white text-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    Loading your cosmic profile...
                </motion.div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Profile not found</div>
            </div>
        );
    }

    return (
        <CosmicPageWrapper>
            <motion.div
                className="profile-container relative space-color"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-4 py-8">
                    {/* Profile Header */}
                    <motion.div
                        className="profile-header text-center mb-8"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img
                            src={avatar}
                            alt="Zodiac Avatar"
                            className="avatar w-32 h-32 rounded-full mx-auto mb-4 border-4 border-purple-400 shadow-lg"
                            onError={(e) => {
                                e.currentTarget.src = '/assets/default_avatar.png';
                            }}
                        />
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {profile.username} the {profile.zodiac}
                        </h1>
                        <p className="text-purple-300 text-xl">Galactic Tone: {profile.galactic_tone}</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Cosmic DNA */}
                            <motion.div
                                className="cosmic-dna bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
                                    <span className="mr-2">🧬</span>
                                    Cosmic DNA
                                </h2>
                                {profile.cosmic_dna && (
                                    <>
                                        <p className="text-white mb-3">{profile.cosmic_dna.archetype}</p>
                                        <div className="compatibility">
                                            <p className="text-purple-200 font-semibold mb-2">Compatible Signs:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.cosmic_dna.compatibility?.map((sign: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="bg-purple-600/50 px-3 py-1 rounded-full text-sm text-white"
                                                    >
                                                        {sign}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>

                            {/* Daily Features */}
                            <motion.div
                                className="daily-section bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
                                    <span className="mr-2">⭐</span>
                                    Daily Star Features
                                </h2>
                                {dailyFeatures && (
                                    <ul className="space-y-2">
                                        {dailyFeatures.features?.map((feature: string, index: number) => (
                                            <li key={index} className="text-white bg-purple-800/30 p-3 rounded-lg">
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Weekly Tarot */}
                            <motion.div
                                className="tarot-section bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
                                    <span className="mr-2">🔮</span>
                                    Weekly Tarot Draw
                                </h2>
                                {weeklyTarot && (
                                    <div className="space-y-4">
                                        {weeklyTarot.cards?.map((card: any, index: number) => (
                                            <motion.div
                                                key={index}
                                                className="tarot-card bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-4 rounded-xl border border-purple-400/30"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={card.image_url || `/assets/tarot/${card.name?.toLowerCase().replace(/\s+/g, '_')}.png`}
                                                        alt={card.name}
                                                        className="w-16 h-24 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/assets/tarot/default.png';
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-purple-200 mb-2 cosmic-text">{card.name}</h3>
                                                        <p className="text-white text-sm mb-3">{card.interpretation}</p>
                                                        <p className="text-xs text-purple-300 cosmic-text">Navigate to feed planet to share</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Profile Customization */}
                            <motion.div
                                className="profile-customization bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center">
                                    <span className="mr-2">✨</span>
                                    Customize Your Profile
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-purple-300 font-semibold mb-2">Avatar URL</label>
                                        <input
                                            type="text"
                                            value={avatar}
                                            onChange={(e) => setAvatar(e.target.value)}
                                            placeholder="Enter avatar image URL"
                                            className="w-full p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-purple-300 font-semibold mb-2">Background URL</label>
                                        <input
                                            type="text"
                                            value={background}
                                            onChange={(e) => setBackground(e.target.value)}
                                            placeholder="Enter background image URL"
                                            className="w-full p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-purple-300 font-semibold mb-2">Bio</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="Tell the cosmos about yourself..."
                                            rows={4}
                                            className="w-full p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg focus:border-purple-400 focus:outline-none text-white resize-none"
                                        />
                                    </div>
                                    <p className="text-center text-purple-300 text-sm cosmic-text mt-4">
                                        Profile updates automatically save when you modify fields
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Navigation through 3D planets only */}
                    <motion.div
                        className="navigation-info mt-8 text-center"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <p className="text-white cosmic-text">
                            🌌 Navigate by clicking the 3D planets floating in space 🌌
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </CosmicPageWrapper>
    );
};

export default ZodiacProfile;