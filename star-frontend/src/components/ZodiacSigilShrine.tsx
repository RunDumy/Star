import { useAuth } from '@/lib/AuthContext';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Crown, Shield, Sparkles, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Rarity configurations
const RARITY_CONFIG = {
    common: {
        color: '#9ca3af',
        gradient: 'from-gray-400 to-gray-600',
        glow: 'shadow-gray-400/30',
        icon: Star,
        name: 'Common'
    },
    rare: {
        color: '#3b82f6',
        gradient: 'from-blue-400 to-blue-600',
        glow: 'shadow-blue-400/50',
        icon: Award,
        name: 'Rare'
    },
    epic: {
        color: '#8b5cf6',
        gradient: 'from-purple-400 to-purple-600',
        glow: 'shadow-purple-400/60',
        icon: Shield,
        name: 'Epic'
    },
    legendary: {
        color: '#f59e0b',
        gradient: 'from-amber-400 to-orange-500',
        glow: 'shadow-amber-400/70',
        icon: Trophy,
        name: 'Legendary'
    },
    mythic: {
        color: '#ef4444',
        gradient: 'from-red-400 via-pink-500 to-purple-600',
        glow: 'shadow-red-400/80',
        icon: Crown,
        name: 'Mythic'
    }
};

interface Badge {
    badge_id: string;
    manifest: {
        metadata: {
            id: string;
            name: string;
            description: string;
            category: string;
        };
        rarity: keyof typeof RARITY_CONFIG;
        effects?: {
            cosmic_influence?: Record<string, number>;
            ui_enhancements?: Record<string, boolean>;
        };
    };
    unlocked_at?: string;
    equipped?: boolean;
}

interface ZodiacSigilShrineProps {
    userId?: string;
    showEquippedOnly?: boolean;
    onBadgeSelect?: (badge: Badge) => void;
}

export const ZodiacSigilShrine: React.FC<ZodiacSigilShrineProps> = ({
    userId,
    showEquippedOnly = false,
    onBadgeSelect
}) => {
    const { user, token } = useAuth();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [view, setView] = useState<'grid' | 'shrine'>('shrine');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterRarity, setFilterRarity] = useState<string>('all');

    useEffect(() => {
        fetchUserBadges();
    }, [userId, showEquippedOnly]);

    const fetchUserBadges = async () => {
        try {
            setLoading(true);
            const targetUserId = userId || user?.id;

            const response = await axios.get(`${API_URL}/api/v1/badges/user/${targetUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { include_locked: !showEquippedOnly }
            });

            if (response.data.success) {
                const userBadges = response.data.badges;
                const badgeList = showEquippedOnly
                    ? userBadges.equipped_badges
                    : userBadges.unlocked_badges;

                setBadges(badgeList || []);
            }
        } catch (error) {
            console.error('Error fetching user badges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBadgeClick = (badge: Badge) => {
        setSelectedBadge(badge);
        onBadgeSelect?.(badge);
    };

    const toggleBadgeEquip = async (badge: Badge) => {
        try {
            const newEquipStatus = !badge.equipped;

            await axios.put(`${API_URL}/api/v1/badges/equip/${badge.badge_id}`, {
                equipped: newEquipStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setBadges(prevBadges =>
                prevBadges.map(b =>
                    b.badge_id === badge.badge_id
                        ? { ...b, equipped: newEquipStatus }
                        : b
                )
            );
        } catch (error) {
            console.error('Error equipping badge:', error);
        }
    };

    const filteredBadges = badges.filter(badge => {
        const categoryMatch = filterCategory === 'all' ||
            badge.manifest.metadata.category === filterCategory;
        const rarityMatch = filterRarity === 'all' ||
            badge.manifest.rarity === filterRarity;
        return categoryMatch && rarityMatch;
    });

    const categories = Array.from(new Set(badges.map(b => b.manifest.metadata.category)));
    const rarities = Array.from(new Set(badges.map(b => b.manifest.rarity)));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="cosmic-loading-spinner">
                    <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="zodiac-sigil-shrine min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text mb-4">
                    🏛️ Zodiac Sigil Shrine
                </h1>
                <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                    Behold your cosmic achievements, earned through dedication to the stellar mysteries.
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('shrine')}
                        className={`px-4 py-2 rounded-lg transition-all ${view === 'shrine'
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50'
                            }`}
                    >
                        🏛️ Shrine View
                    </button>
                    <button
                        onClick={() => setView('grid')}
                        className={`px-4 py-2 rounded-lg transition-all ${view === 'grid'
                                ? 'bg-purple-600 text-white'
                                : 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50'
                            }`}
                    >
                        📊 Grid View
                    </button>
                </div>

                {/* Filters */}
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white"
                >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                    ))}
                </select>

                <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="px-3 py-2 bg-purple-800/50 border border-purple-600 rounded-lg text-white"
                >
                    <option value="all">All Rarities</option>
                    {rarities.map(rarity => (
                        <option key={rarity} value={rarity}>
                            {RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG]?.name || rarity}
                        </option>
                    ))}
                </select>
            </div>

            {/* Badge Display */}
            {view === 'shrine' ? (
                <ShrineView
                    badges={filteredBadges}
                    onBadgeClick={handleBadgeClick}
                    onToggleEquip={toggleBadgeEquip}
                />
            ) : (
                <GridView
                    badges={filteredBadges}
                    onBadgeClick={handleBadgeClick}
                    onToggleEquip={toggleBadgeEquip}
                />
            )}

            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <BadgeDetailModal
                        badge={selectedBadge}
                        onClose={() => setSelectedBadge(null)}
                        onToggleEquip={() => toggleBadgeEquip(selectedBadge)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const ShrineView: React.FC<{
    badges: Badge[];
    onBadgeClick: (badge: Badge) => void;
    onToggleEquip: (badge: Badge) => void;
}> = ({ badges, onBadgeClick, onToggleEquip }) => {
    const groupedBadges = badges.reduce((acc, badge) => {
        const rarity = badge.manifest.rarity;
        if (!acc[rarity]) acc[rarity] = [];
        acc[rarity].push(badge);
        return acc;
    }, {} as Record<string, Badge[]>);

    return (
        <div className="shrine-container space-y-12">
            {Object.entries(RARITY_CONFIG).reverse().map(([rarity, config]) => {
                const rarityBadges = groupedBadges[rarity] || [];
                if (rarityBadges.length === 0) return null;

                return (
                    <motion.div
                        key={rarity}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rarity-shrine"
                    >
                        <div className="text-center mb-6">
                            <h2 className={`text-2xl font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
                                {config.name} Sigils
                            </h2>
                            <div className="w-32 h-1 mx-auto bg-gradient-to-r ${config.gradient} rounded-full opacity-60"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {rarityBadges.map((badge, index) => (
                                <ShrineQualityBadge
                                    key={badge.badge_id}
                                    badge={badge}
                                    index={index}
                                    onClick={() => onBadgeClick(badge)}
                                    onToggleEquip={() => onToggleEquip(badge)}
                                />
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

const GridView: React.FC<{
    badges: Badge[];
    onBadgeClick: (badge: Badge) => void;
    onToggleEquip: (badge: Badge) => void;
}> = ({ badges, onBadgeClick, onToggleEquip }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {badges.map((badge, index) => (
            <CompactBadge
                key={badge.badge_id}
                badge={badge}
                index={index}
                onClick={() => onBadgeClick(badge)}
                onToggleEquip={() => onToggleEquip(badge)}
            />
        ))}
    </div>
);

const ShrineQualityBadge: React.FC<{
    badge: Badge;
    index: number;
    onClick: () => void;
    onToggleEquip: () => void;
}> = ({ badge, index, onClick, onToggleEquip }) => {
    const config = RARITY_CONFIG[badge.manifest.rarity];
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`shrine-badge-card relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${config.glow}`}
            style={{
                background: `linear-gradient(135deg, ${config.color}20, ${config.color}10)`,
                borderColor: config.color
            }}
            onClick={onClick}
        >
            {/* Equipped Indicator */}
            {badge.equipped && (
                <div className="absolute top-2 right-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                </div>
            )}

            {/* Badge Icon */}
            <div className="text-center mb-4">
                <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${config.color}30` }}
                >
                    <IconComponent
                        className="w-8 h-8"
                        style={{ color: config.color }}
                    />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-black/30 text-white">
                    {config.name}
                </span>
            </div>

            {/* Badge Info */}
            <h3 className="font-bold text-white text-center mb-2">
                {badge.manifest.metadata.name}
            </h3>
            <p className="text-gray-300 text-sm text-center mb-4 line-clamp-3">
                {badge.manifest.metadata.description}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleEquip();
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${badge.equipped
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                >
                    {badge.equipped ? 'Unequip' : 'Equip'}
                </button>
            </div>
        </motion.div>
    );
};

const CompactBadge: React.FC<{
    badge: Badge;
    index: number;
    onClick: () => void;
    onToggleEquip: () => void;
}> = ({ badge, index, onClick, onToggleEquip }) => {
    const config = RARITY_CONFIG[badge.manifest.rarity];
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`compact-badge relative p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${config.glow}`}
            style={{
                background: `linear-gradient(135deg, ${config.color}20, ${config.color}10)`,
                borderColor: config.color
            }}
            onClick={onClick}
        >
            {badge.equipped && (
                <Crown className="absolute top-1 right-1 w-3 h-3 text-yellow-400" />
            )}

            <div className="text-center">
                <IconComponent
                    className="w-6 h-6 mx-auto mb-2"
                    style={{ color: config.color }}
                />
                <p className="text-xs text-white font-medium truncate">
                    {badge.manifest.metadata.name.replace(/[🏛️🔥🌟🎴👥🌙]/g, '')}
                </p>
            </div>
        </motion.div>
    );
};

const BadgeDetailModal: React.FC<{
    badge: Badge;
    onClose: () => void;
    onToggleEquip: () => void;
}> = ({ badge, onClose, onToggleEquip }) => {
    const config = RARITY_CONFIG[badge.manifest.rarity];
    const IconComponent = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-8 max-w-md w-full border-2 ${config.glow}`}
                style={{ borderColor: config.color }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div
                        className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${config.color}30` }}
                    >
                        <IconComponent
                            className="w-10 h-10"
                            style={{ color: config.color }}
                        />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {badge.manifest.metadata.name}
                    </h2>

                    <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                            backgroundColor: `${config.color}20`,
                            color: config.color,
                            border: `1px solid ${config.color}`
                        }}
                    >
                        {config.name}
                    </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Cosmic Significance</h3>
                    <p className="text-gray-300 leading-relaxed">
                        {badge.manifest.metadata.description}
                    </p>
                </div>

                {/* Effects */}
                {badge.manifest.effects && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Mystical Effects</h3>
                        <div className="space-y-2">
                            {badge.manifest.effects.cosmic_influence && (
                                <div>
                                    <p className="text-sm text-purple-300 font-medium">Cosmic Influence:</p>
                                    <ul className="text-sm text-gray-300 ml-4">
                                        {Object.entries(badge.manifest.effects.cosmic_influence).map(([key, value]) => (
                                            <li key={key}>
                                                {key.replace(/_/g, ' ')}: +{((value - 1) * 100).toFixed(0)}%
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Unlock Date */}
                {badge.unlocked_at && (
                    <div className="mb-6">
                        <p className="text-sm text-gray-400">
                            Unlocked: {new Date(badge.unlocked_at).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onToggleEquip}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${badge.equipped
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {badge.equipped ? '👑 Unequip' : '⚡ Equip'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ZodiacSigilShrine;