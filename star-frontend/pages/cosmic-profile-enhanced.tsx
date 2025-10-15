import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CosmicPageWrapper } from '../src/components/cosmic/CosmicPageWrapper';
import CosmicBadgeSystem from '../src/components/cosmic/CosmicBadgeSystem';
import EnhancedTarotDraw from '../src/components/cosmic/EnhancedTarotDraw';

interface BadgePosition {
  id: string;
  x: number;
  y: number;
  badge: {
    id: string;
    name: string;
    category: string;
    src: string;
    description: string;
    rarity: string;
  };
  zIndex: number;
}

interface UserProfile {
  username?: string;
  zodiac?: string;
  cosmic_signature?: string;
  bio?: string;
  avatar?: string;
  background?: string;
}

const CosmicProfile = () => {
    const [userZodiac, setUserZodiac] = useState<string>('aries');
    const [userId, setUserId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({});
    const [bio, setBio] = useState<string>('');
    const [avatar, setAvatar] = useState<string>('');
    const [background, setBackground] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'tarot'>('profile');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        // Initialize user data
        const storedId = localStorage.getItem('userId') || `user_${Date.now()}`;
        const storedZodiac = localStorage.getItem('userZodiac') || 'aries';
        
        setUserId(storedId);
        setUserZodiac(storedZodiac);
        
        // Save to localStorage for persistence
        localStorage.setItem('userId', storedId);
        localStorage.setItem('userZodiac', storedZodiac);
        
        // Load profile if exists
        loadProfile(storedId);
    }, [API_URL]);

    const loadProfile = async (id: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/profile/${id}`);
            
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setBio(data.bio || '');
                setAvatar(data.avatar || '');
                setBackground(data.background || '');
                setUserZodiac(data.zodiac || userZodiac);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        if (!userId) return;
        
        try {
            const profileData = {
                user_id: userId,
                username: profile.username || userId,
                zodiac: userZodiac,
                bio,
                avatar,
                background,
                updated_at: new Date().toISOString()
            };

            await fetch(`${API_URL}/api/v1/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });

            // Update localStorage
            localStorage.setItem('userZodiac', userZodiac);
            
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    const handleSaveBadges = async (positions: BadgePosition[]) => {
        if (!userId) {
            alert('Please configure your User ID first');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/v1/profile/badges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    badge_positions: positions,
                    zodiac: userZodiac,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('Cosmic badges saved successfully');
            }
        } catch (error) {
            console.error('Error saving badges:', error);
        }
    };

    const handleTarotShare = async (reading: any) => {
        if (!userId) {
            alert('Please configure your User ID first');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/v1/tarot/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    reading_type: reading.type,
                    cards: reading.cards,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                alert('✨ Tarot reading shared to cosmic feed! ✨');
            }
        } catch (error) {
            console.error('Error sharing tarot reading:', error);
            alert('Failed to share reading to cosmic feed');
        }
    };

    if (loading) {
        return (
            <CosmicPageWrapper>
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        className="text-center"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <div className="text-6xl mb-4">🌌</div>
                        <p className="text-cosmic-light text-xl">Loading cosmic profile...</p>
                    </motion.div>
                </div>
            </CosmicPageWrapper>
        );
    }

    return (
        <CosmicPageWrapper>
            <div className="min-h-screen bg-gradient-to-br from-cosmic-deep via-cosmic-purple/20 to-cosmic-blue/30 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-5xl md:text-6xl font-mystical text-cosmic-gold mb-4 bg-gradient-to-r from-cosmic-gold to-cosmic-accent bg-clip-text text-transparent">
                            ✨ Cosmic Profile ✨
                        </h1>
                        <p className="text-xl text-cosmic-light max-w-3xl mx-auto leading-relaxed">
                            Customize your celestial identity, arrange cosmic badges, and explore mystical tarot readings
                        </p>
                    </motion.div>

                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center mb-8"
                    >
                        <div className="bg-cosmic-deep/30 backdrop-blur-lg rounded-2xl p-2 border border-cosmic-glow/30">
                            {[
                                { id: 'profile', label: '👤 Profile', icon: '🌟' },
                                { id: 'badges', label: '🏆 Badges', icon: '✨' },
                                { id: 'tarot', label: '🔮 Tarot', icon: '🌙' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 mx-1 ${
                                        activeTab === tab.id
                                            ? 'bg-cosmic-accent text-cosmic-deep shadow-lg transform scale-105'
                                            : 'text-cosmic-light hover:text-cosmic-accent hover:bg-cosmic-glow/10'
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* User Configuration */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-cosmic-deep/30 backdrop-blur-lg rounded-2xl p-6 border border-cosmic-glow/30"
                                >
                                    <h2 className="text-2xl font-mystical text-cosmic-gold mb-6 flex items-center">
                                        <span className="mr-3">🆔</span>
                                        Cosmic Identity
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        {/* User ID */}
                                        <div>
                                            <label className="block text-cosmic-accent font-semibold mb-3">
                                                Your Cosmic ID:
                                            </label>
                                            <input
                                                type="text"
                                                value={userId}
                                                onChange={(e) => setUserId(e.target.value)}
                                                onBlur={saveProfile}
                                                className="w-full px-4 py-3 bg-cosmic-deep/50 border-2 border-cosmic-glow/30 rounded-xl text-cosmic-light placeholder-cosmic-light/50 focus:border-cosmic-accent transition-colors duration-300"
                                                placeholder="Enter your unique cosmic ID"
                                            />
                                        </div>

                                        {/* Zodiac Selection */}
                                        <div>
                                            <label className="block text-cosmic-accent font-semibold mb-3">
                                                Your Zodiac Sign:
                                            </label>
                                            <select
                                                value={userZodiac}
                                                onChange={(e) => {
                                                    setUserZodiac(e.target.value);
                                                    setTimeout(saveProfile, 100);
                                                }}
                                                className="w-full px-4 py-3 bg-cosmic-deep/50 border-2 border-cosmic-glow/30 rounded-xl text-cosmic-light focus:border-cosmic-accent transition-colors duration-300"
                                            >
                                                <optgroup label="Western Zodiac">
                                                    {[
                                                        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                                                        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
                                                    ].map(sign => (
                                                        <option key={sign} value={sign}>
                                                            {sign.charAt(0).toUpperCase() + sign.slice(1)}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Chinese Zodiac">
                                                    {[
                                                        'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
                                                        'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'
                                                    ].map(sign => (
                                                        <option key={sign} value={sign}>
                                                            Year of {sign.charAt(0).toUpperCase() + sign.slice(1)}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-cosmic-accent font-semibold mb-3">
                                                Cosmic Bio:
                                            </label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                onBlur={saveProfile}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-cosmic-deep/50 border-2 border-cosmic-glow/30 rounded-xl text-cosmic-light placeholder-cosmic-light/50 focus:border-cosmic-accent transition-colors duration-300 resize-none"
                                                placeholder="Tell the cosmos about your mystical journey..."
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Profile Display */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-cosmic-deep/30 backdrop-blur-lg rounded-2xl p-6 border border-cosmic-glow/30"
                                >
                                    <h2 className="text-2xl font-mystical text-cosmic-gold mb-6 flex items-center">
                                        <span className="mr-3">✨</span>
                                        Cosmic Preview
                                    </h2>

                                    {/* Profile Card */}
                                    <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl p-6 border border-cosmic-glow/20">
                                        <div className="text-center">
                                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-cosmic-gold to-cosmic-accent flex items-center justify-center text-3xl border-4 border-cosmic-glow/50">
                                                {avatar ? (
                                                    <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span>🌟</span>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-xl font-mystical text-cosmic-gold mb-2">
                                                {userId || 'Cosmic Wanderer'}
                                            </h3>
                                            
                                            <p className="text-cosmic-accent mb-2">
                                                {userZodiac.charAt(0).toUpperCase() + userZodiac.slice(1)} Sign
                                            </p>
                                            
                                            {bio && (
                                                <p className="text-cosmic-light text-sm leading-relaxed">
                                                    {bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-center text-cosmic-accent text-sm mt-4">
                                        ✨ Profile updates save automatically ✨
                                    </p>
                                </motion.div>
                            </div>
                        )}

                        {activeTab === 'badges' && (
                            <CosmicBadgeSystem
                                userId={userId}
                                userZodiac={userZodiac}
                                onSave={handleSaveBadges}
                            />
                        )}

                        {activeTab === 'tarot' && (
                            <EnhancedTarotDraw
                                userZodiac={userZodiac}
                                onShare={handleTarotShare}
                            />
                        )}
                    </motion.div>

                    {/* Footer Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-12 text-cosmic-light/70"
                    >
                        <p className="text-sm">
                            🌌 Navigate through the cosmic realm using the floating 3D planets 🌌
                        </p>
                    </motion.div>
                </div>
            </div>
        </CosmicPageWrapper>
    );
};

export default CosmicProfile;