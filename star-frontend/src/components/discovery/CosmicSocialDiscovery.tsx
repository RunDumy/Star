import { AnimatePresence, motion } from 'framer-motion';
import {
    Compass,
    Crown,
    Filter,
    Globe,
    Heart,
    MapPin,
    MessageCircle,
    Search,
    Target,
    UserPlus,
    Users
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface CosmicUser {
    id: string;
    username: string;
    zodiacSign: string;
    chineseZodiac?: string;
    vedicSign?: string;
    element: string;
    compatibilityScore?: number;
    sharedInterests: string[];
    location?: {
        city: string;
        country: string;
        coordinates?: { lat: number; lng: number };
    };
    isOnline: boolean;
    lastActive: string;
    profileImage?: string;
    bio?: string;
    cosmicEnergy: {
        level: number;
        aura: string;
        resonance: string[];
    };
    statistics: {
        postsCount: number;
        readingsGiven: number;
        constellationsCreated: number;
        collaborations: number;
    };
}

interface CosmicCommunity {
    id: string;
    name: string;
    description: string;
    type: 'zodiac-sign' | 'element' | 'interest' | 'location' | 'practice';
    memberCount: number;
    isPublic: boolean;
    tags: string[];
    recentActivity: string;
    moderators: string[];
    cosmicTheme: {
        primaryColor: string;
        constellation: string;
        element: string;
    };
}

interface SocialDiscoveryProps {
    currentUserId: string;
    onUserSelect?: (user: CosmicUser) => void;
    onCommunityJoin?: (community: CosmicCommunity) => void;
}

export const CosmicSocialDiscovery: React.FC<SocialDiscoveryProps> = ({
    currentUserId,
    onUserSelect,
    onCommunityJoin
}) => {
    const [activeTab, setActiveTab] = useState<'discover' | 'compatibility' | 'communities' | 'map'>('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [discoveredUsers, setDiscoveredUsers] = useState<CosmicUser[]>([]);
    const [communities, setCommunities] = useState<CosmicCommunity[]>([]);
    const [filters, setFilters] = useState({
        zodiacSigns: [] as string[],
        elements: [] as string[],
        location: '',
        interests: [] as string[],
        isOnline: false,
        compatibilityRange: [50, 100] as [number, number]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState<CosmicUser | null>(null);

    // Mock data - in real implementation, fetch from API
    const mockUsers: CosmicUser[] = [
        {
            id: '1',
            username: 'StarSeeker_Luna',
            zodiacSign: 'Pisces',
            chineseZodiac: 'Dragon',
            vedicSign: 'Meena',
            element: 'Water',
            compatibilityScore: 89,
            sharedInterests: ['Tarot Reading', 'Astrology', 'Meditation', 'Crystal Healing'],
            location: { city: 'San Francisco', country: 'USA' },
            isOnline: true,
            lastActive: 'now',
            bio: 'Exploring the cosmic mysteries through ancient wisdom and modern insights. Tarot reader for 5+ years.',
            cosmicEnergy: {
                level: 87,
                aura: 'Ethereal Blue',
                resonance: ['Intuitive', 'Empathetic', 'Mystical']
            },
            statistics: {
                postsCount: 245,
                readingsGiven: 89,
                constellationsCreated: 12,
                collaborations: 34
            }
        },
        {
            id: '2',
            username: 'CosmicFireWalker',
            zodiacSign: 'Aries',
            chineseZodiac: 'Tiger',
            element: 'Fire',
            compatibilityScore: 76,
            sharedInterests: ['Energy Healing', 'Chakra Work', 'Numerology'],
            location: { city: 'Austin', country: 'USA' },
            isOnline: false,
            lastActive: '2 hours ago',
            bio: 'Passionate about energy work and helping others discover their cosmic potential.',
            cosmicEnergy: {
                level: 92,
                aura: 'Radiant Gold',
                resonance: ['Dynamic', 'Leadership', 'Transformative']
            },
            statistics: {
                postsCount: 156,
                readingsGiven: 67,
                constellationsCreated: 8,
                collaborations: 29
            }
        },
        {
            id: '3',
            username: 'EarthMother_Sage',
            zodiacSign: 'Taurus',
            chineseZodiac: 'Ox',
            element: 'Earth',
            compatibilityScore: 94,
            sharedInterests: ['Herbalism', 'Nature Spirituality', 'Sacred Geometry'],
            location: { city: 'Boulder', country: 'USA' },
            isOnline: true,
            lastActive: 'now',
            bio: 'Grounded in earth wisdom, sharing the healing power of nature and sacred plants.',
            cosmicEnergy: {
                level: 88,
                aura: 'Verdant Green',
                resonance: ['Nurturing', 'Grounded', 'Healing']
            },
            statistics: {
                postsCount: 189,
                readingsGiven: 45,
                constellationsCreated: 15,
                collaborations: 52
            }
        }
    ];

    const mockCommunities: CosmicCommunity[] = [
        {
            id: '1',
            name: 'Water Signs United',
            description: 'A gathering space for Cancer, Scorpio, and Pisces to share emotional insights and intuitive wisdom.',
            type: 'zodiac-sign',
            memberCount: 2847,
            isPublic: true,
            tags: ['Water Element', 'Intuition', 'Emotions', 'Psychic Development'],
            recentActivity: 'Active discussion about moon phases and emotional cycles',
            moderators: ['AquarianMystic', 'DeepWaterHealer'],
            cosmicTheme: {
                primaryColor: '#4682b4',
                constellation: 'Aquarius',
                element: 'Water'
            }
        },
        {
            id: '2',
            name: 'Tarot Masters Circle',
            description: 'Advanced tarot practitioners sharing techniques, spreads, and collaborative readings.',
            type: 'practice',
            memberCount: 1205,
            isPublic: false,
            tags: ['Tarot', 'Divination', 'Card Reading', 'Symbolism'],
            recentActivity: 'Weekly group reading challenge in progress',
            moderators: ['CardWhisperer', 'ArcanaExplorer'],
            cosmicTheme: {
                primaryColor: '#800080',
                constellation: 'The Magician',
                element: 'Spirit'
            }
        },
        {
            id: '3',
            name: 'Crystal Healers Collective',
            description: 'Sharing knowledge about crystal properties, healing techniques, and mineral wisdom.',
            type: 'interest',
            memberCount: 3421,
            isPublic: true,
            tags: ['Crystals', 'Healing', 'Minerals', 'Energy Work'],
            recentActivity: 'New crystal identification challenge posted',
            moderators: ['CrystalSage', 'GeodeGoddess'],
            cosmicTheme: {
                primaryColor: '#9370db',
                constellation: 'Draco',
                element: 'Earth'
            }
        }
    ];

    useEffect(() => {
        setDiscoveredUsers(mockUsers);
        setCommunities(mockCommunities);
        // In real implementation, fetch current user profile
        setCurrentUserProfile({
            id: currentUserId,
            username: 'CurrentUser',
            zodiacSign: 'Virgo',
            element: 'Earth',
            sharedInterests: ['Tarot Reading', 'Astrology'],
            isOnline: true,
            lastActive: 'now',
            cosmicEnergy: { level: 75, aura: 'Gentle Silver', resonance: ['Analytical', 'Helpful'] },
            statistics: { postsCount: 89, readingsGiven: 23, constellationsCreated: 5, collaborations: 12 }
        } as CosmicUser);
    }, [currentUserId]);

    const calculateCompatibility = useCallback((user1: CosmicUser, user2: CosmicUser): number => {
        let score = 0;

        // Zodiac compatibility matrix (simplified)
        const zodiacCompatibility: { [key: string]: { [key: string]: number } } = {
            Aries: { Leo: 90, Sagittarius: 85, Gemini: 75, Aquarius: 70 },
            Taurus: { Virgo: 90, Capricorn: 85, Cancer: 80, Pisces: 75 },
            Gemini: { Libra: 90, Aquarius: 85, Aries: 75, Leo: 70 },
            Cancer: { Scorpio: 90, Pisces: 85, Taurus: 80, Virgo: 75 },
            Leo: { Aries: 90, Sagittarius: 85, Gemini: 70, Libra: 75 },
            Virgo: { Taurus: 90, Capricorn: 85, Cancer: 75, Scorpio: 70 },
            Libra: { Gemini: 90, Aquarius: 85, Leo: 75, Sagittarius: 70 },
            Scorpio: { Cancer: 90, Pisces: 85, Virgo: 70, Capricorn: 75 },
            Sagittarius: { Aries: 90, Leo: 85, Libra: 70, Aquarius: 75 },
            Capricorn: { Taurus: 90, Virgo: 85, Scorpio: 75, Pisces: 70 },
            Aquarius: { Gemini: 90, Libra: 85, Aries: 70, Sagittarius: 75 },
            Pisces: { Cancer: 90, Scorpio: 85, Taurus: 75, Capricorn: 70 }
        };

        // Base zodiac compatibility
        const zodiacScore = zodiacCompatibility[user1.zodiacSign]?.[user2.zodiacSign] || 50;
        score += zodiacScore * 0.4;

        // Element compatibility
        const elementCompatibility = user1.element === user2.element ? 20 :
            (user1.element === 'Fire' && user2.element === 'Air') ||
                (user1.element === 'Air' && user2.element === 'Fire') ||
                (user1.element === 'Water' && user2.element === 'Earth') ||
                (user1.element === 'Earth' && user2.element === 'Water') ? 15 : 10;
        score += elementCompatibility;

        // Shared interests
        const sharedCount = user1.sharedInterests.filter(interest =>
            user2.sharedInterests.includes(interest)
        ).length;
        score += Math.min(sharedCount * 5, 25);

        // Cosmic energy resonance
        const resonanceMatch = user1.cosmicEnergy.resonance.some(trait =>
            user2.cosmicEnergy.resonance.includes(trait)
        ) ? 15 : 0;
        score += resonanceMatch;

        return Math.min(Math.round(score), 100);
    }, []);

    const handleSearch = useCallback(async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            let filteredUsers = mockUsers.filter(user => {
                if (searchQuery && !user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !user.bio?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }

                if (filters.zodiacSigns.length > 0 && !filters.zodiacSigns.includes(user.zodiacSign)) {
                    return false;
                }

                if (filters.elements.length > 0 && !filters.elements.includes(user.element)) {
                    return false;
                }

                if (filters.isOnline && !user.isOnline) {
                    return false;
                }

                return true;
            });

            // Calculate compatibility scores if current user profile exists
            if (currentUserProfile) {
                filteredUsers = filteredUsers.map(user => ({
                    ...user,
                    compatibilityScore: calculateCompatibility(currentUserProfile, user)
                })).filter(user =>
                    user.compatibilityScore! >= filters.compatibilityRange[0] &&
                    user.compatibilityScore! <= filters.compatibilityRange[1]
                );
            }

            setDiscoveredUsers(filteredUsers);
            setIsLoading(false);
        }, 1000);
    }, [searchQuery, filters, currentUserProfile, calculateCompatibility]);

    useEffect(() => {
        handleSearch();
    }, [filters]);

    const getZodiacIcon = (sign: string) => {
        const icons: { [key: string]: string } = {
            Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
            Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
            Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
        };
        return icons[sign] || '✨';
    };

    const getElementColor = (element: string) => {
        const colors: { [key: string]: string } = {
            Fire: '#ff6b6b',
            Earth: '#4ecdc4',
            Air: '#ffe66d',
            Water: '#a8e6cf'
        };
        return colors[element] || '#ffffff';
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                    <Compass className="w-8 h-8 mr-3 text-cyan-400" />
                    Cosmic Social Discovery
                </h1>
                <p className="text-white/60">Find your cosmic tribe and explore meaningful connections</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center">
                <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
                    {[
                        { id: 'discover', label: 'Discover', icon: Search },
                        { id: 'compatibility', label: 'Compatibility', icon: Heart },
                        { id: 'communities', label: 'Communities', icon: Users },
                        { id: 'map', label: 'Cosmic Map', icon: MapPin }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${activeTab === tab.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search by username, interests, or bio..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <FilterPanel filters={filters} onFiltersChange={setFilters} />

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {activeTab === 'discover' && (
                    <UserDiscoveryGrid
                        users={discoveredUsers}
                        onUserSelect={onUserSelect}
                        getZodiacIcon={getZodiacIcon}
                        getElementColor={getElementColor}
                    />
                )}

                {activeTab === 'compatibility' && currentUserProfile && (
                    <CompatibilityMatcher
                        currentUser={currentUserProfile}
                        users={discoveredUsers}
                        onUserSelect={onUserSelect}
                        calculateCompatibility={calculateCompatibility}
                    />
                )}

                {activeTab === 'communities' && (
                    <CommunityExplorer
                        communities={communities}
                        onCommunityJoin={onCommunityJoin}
                    />
                )}

                {activeTab === 'map' && (
                    <CosmicMap users={discoveredUsers} onUserSelect={onUserSelect} />
                )}
            </div>
        </div>
    );
};

// User Discovery Grid Component
const UserDiscoveryGrid: React.FC<{
    users: CosmicUser[];
    onUserSelect?: (user: CosmicUser) => void;
    getZodiacIcon: (sign: string) => string;
    getElementColor: (element: string) => string;
}> = ({ users, onUserSelect, getZodiacIcon, getElementColor }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
                <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/30 transition-all cursor-pointer"
                    onClick={() => onUserSelect?.(user)}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                                style={{ backgroundColor: getElementColor(user.element) + '20', color: getElementColor(user.element) }}
                            >
                                {getZodiacIcon(user.zodiacSign)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{user.username}</h3>
                                <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-white/60">{user.zodiacSign}</span>
                                    {user.compatibilityScore && (
                                        <span className="text-green-400">
                                            {user.compatibilityScore}% match
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                    </div>

                    {/* Bio */}
                    {user.bio && (
                        <p className="text-white/80 text-sm mb-4 line-clamp-2">{user.bio}</p>
                    )}

                    {/* Shared Interests */}
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {user.sharedInterests.slice(0, 3).map((interest) => (
                                <span
                                    key={interest}
                                    className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80"
                                >
                                    {interest}
                                </span>
                            ))}
                            {user.sharedInterests.length > 3 && (
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">
                                    +{user.sharedInterests.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Cosmic Energy */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Cosmic Energy</span>
                            <span className="text-cyan-400 font-medium">{user.cosmicEnergy.level}/100</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
                                style={{ width: `${user.cosmicEnergy.level}%` }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                        <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">Message</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors">
                            <UserPlus className="w-4 h-4" />
                            <span className="text-sm">Connect</span>
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// Filter Panel Component
const FilterPanel: React.FC<{
    filters: any;
    onFiltersChange: (filters: any) => void;
}> = ({ filters, onFiltersChange }) => {
    const [showFilters, setShowFilters] = useState(false);

    const zodiacSigns = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const elements = ['Fire', 'Earth', 'Air', 'Water'];

    return (
        <div className="relative">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
            </button>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl p-4 z-10"
                    >
                        <div className="space-y-4">
                            {/* Zodiac Signs */}
                            <div>
                                <h4 className="text-white font-medium mb-2">Zodiac Signs</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    {zodiacSigns.map((sign) => (
                                        <button
                                            key={sign}
                                            onClick={() => {
                                                const newSigns = filters.zodiacSigns.includes(sign)
                                                    ? filters.zodiacSigns.filter((s: string) => s !== sign)
                                                    : [...filters.zodiacSigns, sign];
                                                onFiltersChange({ ...filters, zodiacSigns: newSigns });
                                            }}
                                            className={`p-2 rounded-lg text-xs transition-colors ${filters.zodiacSigns.includes(sign)
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                }`}
                                        >
                                            {sign}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Elements */}
                            <div>
                                <h4 className="text-white font-medium mb-2">Elements</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {elements.map((element) => (
                                        <button
                                            key={element}
                                            onClick={() => {
                                                const newElements = filters.elements.includes(element)
                                                    ? filters.elements.filter((e: string) => e !== element)
                                                    : [...filters.elements, element];
                                                onFiltersChange({ ...filters, elements: newElements });
                                            }}
                                            className={`p-2 rounded-lg text-sm transition-colors ${filters.elements.includes(element)
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                }`}
                                        >
                                            {element}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Online Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-white font-medium">Online Only</span>
                                <button
                                    onClick={() => onFiltersChange({ ...filters, isOnline: !filters.isOnline })}
                                    className={`w-12 h-6 rounded-full transition-colors ${filters.isOnline ? 'bg-cyan-500' : 'bg-white/20'
                                        }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${filters.isOnline ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => onFiltersChange({
                                    zodiacSigns: [],
                                    elements: [],
                                    location: '',
                                    interests: [],
                                    isOnline: false,
                                    compatibilityRange: [50, 100]
                                })}
                                className="w-full py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Compatibility Matcher Component
const CompatibilityMatcher: React.FC<{
    currentUser: CosmicUser;
    users: CosmicUser[];
    onUserSelect?: (user: CosmicUser) => void;
    calculateCompatibility: (user1: CosmicUser, user2: CosmicUser) => number;
}> = ({ currentUser, users, onUserSelect, calculateCompatibility }) => {
    const sortedUsers = users
        .map(user => ({
            ...user,
            compatibilityScore: calculateCompatibility(currentUser, user)
        }))
        .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

    return (
        <div className="space-y-6">
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Target className="w-6 h-6 mr-3 text-pink-400" />
                    Your Cosmic Matches
                </h2>
                <p className="text-white/60 mb-6">
                    Compatibility calculated based on zodiac harmony, elemental resonance, and shared cosmic interests.
                </p>

                <div className="space-y-4">
                    {sortedUsers.slice(0, 5).map((user) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-pink-500/30 cursor-pointer transition-all"
                            onClick={() => onUserSelect?.(user)}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="text-2xl">{currentUser.zodiacSign === 'Pisces' ? '🐟' : '✨'}</div>
                                <div>
                                    <h3 className="font-medium text-white">{user.username}</h3>
                                    <p className="text-sm text-white/60">{user.zodiacSign} • {user.element}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-pink-400">
                                        {user.compatibilityScore}%
                                    </div>
                                    <div className="text-xs text-white/60">
                                        {user.compatibilityScore! >= 90 ? 'Soul Match' :
                                            user.compatibilityScore! >= 80 ? 'Great Match' :
                                                user.compatibilityScore! >= 70 ? 'Good Match' : 'Potential'}
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Heart
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor((user.compatibilityScore || 0) / 20)
                                                    ? 'text-pink-400 fill-current'
                                                    : 'text-white/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Community Explorer Component
const CommunityExplorer: React.FC<{
    communities: CosmicCommunity[];
    onCommunityJoin?: (community: CosmicCommunity) => void;
}> = ({ communities, onCommunityJoin }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {communities.map((community) => (
                <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/30 transition-all"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">{community.name}</h3>
                            <p className="text-white/80 text-sm mb-3">{community.description}</p>
                        </div>
                        {!community.isPublic && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Members</span>
                            <span className="text-white font-medium">{community.memberCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Type</span>
                            <span className="text-cyan-400 capitalize">{community.type.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {community.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <div className="text-xs text-white/60 mb-1">Recent Activity</div>
                        <div className="text-sm text-white/80">{community.recentActivity}</div>
                    </div>

                    <button
                        onClick={() => onCommunityJoin?.(community)}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                    >
                        {community.isPublic ? 'Join Community' : 'Request to Join'}
                    </button>
                </motion.div>
            ))}
        </div>
    );
};

// Cosmic Map Component (placeholder)
const CosmicMap: React.FC<{
    users: CosmicUser[];
    onUserSelect?: (user: CosmicUser) => void;
}> = ({ users, onUserSelect }) => {
    return (
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-center py-20">
                <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Cosmic Map</h3>
                <p className="text-white/60 mb-6">
                    Interactive map showing cosmic connections around the world
                </p>
                <div className="text-sm text-white/40">
                    Map integration coming soon...
                </div>
            </div>
        </div>
    );
};

export default CosmicSocialDiscovery;