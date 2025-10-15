import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CosmicBadgeSystem from '../src/components/cosmic/CosmicBadgeSystem';
import EnhancedTarotDraw from '../src/components/cosmic/EnhancedTarotDraw';

interface ProfileData {
    username: string;
    cosmicId: string;
    westernZodiac: string;
    chineseZodiac: string;
    bio: string;
    avatar: string;
    background: string;
}

const EnhancedCosmicProfile = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'tarot'>('profile');
    const [profile, setProfile] = useState<ProfileData>({
        username: '',
        cosmicId: '',
        westernZodiac: 'aries',
        chineseZodiac: 'rat',
        bio: '',
        avatar: '',
        background: ''
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/register');
                    return;
                }

                const response = await axios.get(`${API_URL}/api/v1/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProfile({
                    username: response.data.username || '',
                    cosmicId: response.data.cosmic_id || '',
                    westernZodiac: response.data.western_zodiac || 'aries',
                    chineseZodiac: response.data.chinese_zodiac || 'rat',
                    bio: response.data.bio || '',
                    avatar: response.data.avatar || '',
                    background: response.data.background || ''
                });
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/register');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router, API_URL]);

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/v1/user/profile`, {
                cosmic_id: profile.cosmicId,
                western_zodiac: profile.westernZodiac,
                chinese_zodiac: profile.chineseZodiac,
                bio: profile.bio,
                avatar: profile.avatar,
                background: profile.background
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Cosmic profile updated successfully! ✨');
        } catch (error) {
            console.error('Profile update failed:', error);
            alert('Failed to update cosmic profile. Please try again.');
        }
    };

    const handleShareReading = async (reading: any) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/v1/posts`, {
                content: `🔮 Just completed a ${reading.type} tarot reading! The cosmic energies revealed: ${reading.cards.map((c: any) => c.name).join(', ')}. ✨`,
                type: 'tarot_reading',
                tarot_data: reading
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Tarot reading shared to cosmic feed! 🌟');
        } catch (error) {
            console.error('Failed to share reading:', error);
            alert('Failed to share reading to cosmic feed.');
        }
    };

    const tabVariants = {
        inactive: { backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'rgba(255, 255, 255, 0.7)' },
        active: { backgroundColor: 'rgba(139, 92, 246, 0.8)', color: '#ffffff' }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cosmic-deep via-cosmic-purple/20 to-cosmic-blue/30 
                      flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-4xl"
                >
                    🌌
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cosmic-deep via-cosmic-purple/20 to-cosmic-blue/30">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-6xl font-mystical text-cosmic-gold mb-2">
                        Cosmic Profile
                    </h1>
                    <p className="text-cosmic-light text-lg">
                        Customize your cosmic identity and explore the universe within
                    </p>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="flex bg-cosmic-deep/50 backdrop-blur-sm rounded-full p-2 border border-cosmic-gold/30">
                        {[
                            { key: 'profile', label: 'Profile', icon: '👤' },
                            { key: 'badges', label: 'Badges', icon: '🏆' },
                            { key: 'tarot', label: 'Tarot', icon: '🔮' }
                        ].map(tab => (
                            <motion.button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className="px-6 py-3 rounded-full font-medium flex items-center space-x-2 transition-all"
                                variants={tabVariants}
                                animate={activeTab === tab.key ? 'active' : 'inactive'}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-xl">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'profile' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-cosmic-deep/80 backdrop-blur-sm rounded-lg p-8 border border-cosmic-gold/30">
                                    <h2 className="text-2xl font-bold text-cosmic-gold mb-6">Cosmic Identity</h2>

                                    <div className="space-y-6">
                                        {/* Cosmic ID */}
                                        <div>
                                            <label className="block text-cosmic-light font-medium mb-2">
                                                Cosmic ID (Display Name)
                                            </label>
                                            <input
                                                type="text"
                                                value={profile.cosmicId}
                                                onChange={(e) => setProfile({ ...profile, cosmicId: e.target.value })}
                                                className="w-full px-4 py-3 bg-cosmic-deep/50 border border-cosmic-gold/30 rounded-lg 
                                   text-white placeholder-cosmic-light/50 focus:border-cosmic-gold 
                                   focus:outline-none transition-colors"
                                                placeholder="Enter your cosmic identity..."
                                            />
                                        </div>

                                        {/* Zodiac Signs */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-cosmic-light font-medium mb-2">
                                                    Western Zodiac
                                                </label>
                                                <select
                                                    value={profile.westernZodiac}
                                                    onChange={(e) => setProfile({ ...profile, westernZodiac: e.target.value })}
                                                    title="Select your Western zodiac sign"
                                                    className="w-full px-4 py-3 bg-cosmic-deep/50 border border-cosmic-gold/30 rounded-lg 
                                     text-white focus:border-cosmic-gold focus:outline-none transition-colors"
                                                >
                                                    {['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                                                        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'].map(sign => (
                                                            <option key={sign} value={sign} className="bg-cosmic-deep">
                                                                {sign.charAt(0).toUpperCase() + sign.slice(1)}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-cosmic-light font-medium mb-2">
                                                    Chinese Zodiac
                                                </label>
                                                <select
                                                    value={profile.chineseZodiac}
                                                    onChange={(e) => setProfile({ ...profile, chineseZodiac: e.target.value })}
                                                    title="Select your Chinese zodiac animal"
                                                    className="w-full px-4 py-3 bg-cosmic-deep/50 border border-cosmic-gold/30 rounded-lg 
                                     text-white focus:border-cosmic-gold focus:outline-none transition-colors"
                                                >
                                                    {['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
                                                        'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'].map(animal => (
                                                            <option key={animal} value={animal} className="bg-cosmic-deep">
                                                                {animal.charAt(0).toUpperCase() + animal.slice(1)}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-cosmic-light font-medium mb-2">
                                                Cosmic Bio
                                            </label>
                                            <textarea
                                                value={profile.bio}
                                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-cosmic-deep/50 border border-cosmic-gold/30 rounded-lg 
                                   text-white placeholder-cosmic-light/50 focus:border-cosmic-gold 
                                   focus:outline-none transition-colors resize-none"
                                                placeholder="Share your cosmic journey..."
                                            />
                                        </div>

                                        {/* Save Button */}
                                        <motion.button
                                            onClick={handleUpdateProfile}
                                            className="w-full py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue 
                                 text-white font-bold rounded-lg hover:from-cosmic-blue 
                                 hover:to-cosmic-purple transition-all duration-300 shadow-lg"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            ✨ Update Cosmic Profile ✨
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'badges' && (
                            <CosmicBadgeSystem
                                userId={profile.username}
                                userZodiac={profile.westernZodiac}
                                onSave={(positions) => {
                                    console.log('Badge positions saved:', positions);
                                }}
                            />
                        )}

                        {activeTab === 'tarot' && (
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-cosmic-deep/80 backdrop-blur-sm rounded-lg p-8 border border-cosmic-gold/30">
                                    <h2 className="text-2xl font-bold text-cosmic-gold mb-6 text-center">
                                        Cosmic Tarot Reading
                                    </h2>
                                    <EnhancedTarotDraw
                                        type="daily"
                                        userZodiac={profile.westernZodiac}
                                        userId={profile.username}
                                        onShare={(cards) => {
                                            handleShareReading({
                                                type: 'daily',
                                                cards: cards,
                                                zodiac: profile.westernZodiac,
                                                timestamp: new Date().toISOString()
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Cosmic Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-2 h-2 bg-cosmic-gold rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-3/4 right-1/4 w-1 h-1 bg-cosmic-light rounded-full"
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
                <motion.div
                    className="absolute top-1/2 right-1/3 w-3 h-3 bg-cosmic-purple rounded-full"
                    animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.3, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                />
            </div>
        </div>
    );
};

export default EnhancedCosmicProfile;