import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import InfluenceShowcase from './InfluenceShowcase';

interface ProfileModule {
    id: string;
    type: 'bio' | 'influence' | 'playlist' | 'badges' | 'tarot' | 'cosmic_chart' | 'connections';
    title: string;
    visible: boolean;
    position: number;
    config?: any;
}

interface ProfileLayout {
    type: 'grid' | 'orbit' | 'constellation';
    columns: number;
    spacing: 'compact' | 'normal' | 'spacious';
}

interface CosmicProfileProps {
    userId?: string;
    isOwnProfile?: boolean;
    editMode?: boolean;
}

const CosmicProfile: React.FC<CosmicProfileProps> = ({
    userId,
    isOwnProfile = false,
    editMode = false
}) => {
    const [profileData, setProfileData] = useState<any>(null);
    const [modules, setModules] = useState<ProfileModule[]>([]);
    const [layout, setLayout] = useState<ProfileLayout>({
        type: 'grid',
        columns: 2,
        spacing: 'normal'
    });
    const [isEditing, setIsEditing] = useState(editMode);
    const [selectedTheme, setSelectedTheme] = useState('cosmic');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const targetUserId = userId || user?.id;

    // Available themes
    const themes = [
        { id: 'cosmic', name: 'Cosmic Void', gradient: 'from-purple-900 via-blue-900 to-black' },
        { id: 'fire', name: 'Fire Realm', gradient: 'from-red-900 via-orange-800 to-yellow-900' },
        { id: 'water', name: 'Ocean Depths', gradient: 'from-blue-900 via-teal-800 to-cyan-900' },
        { id: 'earth', name: 'Forest Sanctuary', gradient: 'from-green-900 via-emerald-800 to-teal-900' },
        { id: 'air', name: 'Sky Palace', gradient: 'from-gray-800 via-slate-700 to-blue-800' },
        { id: 'starlight', name: 'Starlight', gradient: 'from-indigo-900 via-purple-800 to-pink-900' }
    ];

    // Default modules configuration
    const defaultModules: ProfileModule[] = [
        { id: 'bio', type: 'bio', title: 'Cosmic Bio', visible: true, position: 0 },
        { id: 'influence', type: 'influence', title: 'Influence Showcase', visible: true, position: 1 },
        { id: 'playlist', type: 'playlist', title: 'Elemental Playlist', visible: true, position: 2 },
        { id: 'badges', type: 'badges', title: 'Mythic Badges', visible: true, position: 3 },
        { id: 'tarot', type: 'tarot', title: 'Daily Tarot', visible: false, position: 4 },
        { id: 'cosmic_chart', type: 'cosmic_chart', title: 'Birth Chart', visible: false, position: 5 },
        { id: 'connections', type: 'connections', title: 'Zodiac Network', visible: true, position: 6 }
    ];

    useEffect(() => {
        fetchProfileData();
    }, [targetUserId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/profile/${targetUserId}/full`);
            setProfileData(response.data);

            // Load saved modules or use defaults
            const savedModules = response.data.modules || defaultModules;
            setModules(savedModules);

            // Load saved layout
            const savedLayout = response.data.layout || layout;
            setLayout(savedLayout);

            // Load saved theme
            const savedTheme = response.data.theme || 'cosmic';
            setSelectedTheme(savedTheme);

        } catch (error) {
            console.error('Failed to fetch profile data:', error);
            // Use defaults on error
            setModules(defaultModules);
        } finally {
            setLoading(false);
        }
    };

    const saveProfileConfiguration = async () => {
        try {
            await axios.post(`/api/v1/profile/${targetUserId}/customize`, {
                modules: modules,
                layout: layout,
                theme: selectedTheme
            });
        } catch (error) {
            console.error('Failed to save profile configuration:', error);
        }
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination || !isEditing) return;

        const items = Array.from(modules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update positions
        const updatedModules = items.map((item, index) => ({
            ...item,
            position: index
        }));

        setModules(updatedModules);
    };

    const toggleModuleVisibility = (moduleId: string) => {
        setModules(prev => prev.map(module =>
            module.id === moduleId
                ? { ...module, visible: !module.visible }
                : module
        ));
    };

    const getZodiacSigil = (zodiacSign: string) => {
        const sigils = {
            'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
            'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
            'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
        };
        return sigils[zodiacSign as keyof typeof sigils] || '⭐';
    };

    const getLayoutClasses = () => {
        switch (layout.type) {
            case 'orbit':
                return 'orbital-layout relative min-h-screen';
            case 'constellation':
                return 'constellation-layout relative min-h-screen';
            default:
                return `grid-layout grid gap-${layout.spacing === 'compact' ? '2' : layout.spacing === 'spacious' ? '8' : '4'} grid-cols-1 md:grid-cols-${layout.columns}`;
        }
    };

    const renderModule = (module: ProfileModule) => {
        if (!module.visible) return null;

        const baseClasses = "module bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20";

        switch (module.type) {
            case 'bio':
                return (
                    <div className={baseClasses}>
                        <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                            {getZodiacSigil(profileData?.zodiac_signs?.western || 'Aries')} Cosmic Identity
                        </h3>
                        <div className="space-y-3">
                            <p className="text-white">{profileData?.bio || "A cosmic traveler exploring the universe..."}</p>
                            <div className="flex flex-wrap gap-2">
                                {profileData?.zodiac_signs && (
                                    <>
                                        <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-xs">
                                            {profileData.zodiac_signs.western}
                                        </span>
                                        <span className="bg-red-600/30 text-red-200 px-2 py-1 rounded text-xs">
                                            {profileData.zodiac_signs.chinese}
                                        </span>
                                        <span className="bg-indigo-600/30 text-indigo-200 px-2 py-1 rounded text-xs">
                                            Tone {profileData.zodiac_signs.galactic_tone}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'influence':
                return (
                    <div className={baseClasses}>
                        <InfluenceShowcase
                            userId={targetUserId}
                            isOwnProfile={isOwnProfile}
                            layout={layout.type}
                        />
                    </div>
                );

            case 'playlist':
                return (
                    <div className={baseClasses}>
                        <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                            🎵 Elemental Soundtrack
                        </h3>
                        <div className="bg-gradient-to-r from-indigo-800/50 to-purple-800/50 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-2xl">
                                    🎧
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-semibold">Cosmic Meditation Mix</h4>
                                    <p className="text-purple-300 text-sm">Celestial Harmonics</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs bg-purple-600/30 text-purple-200 px-2 py-1 rounded">
                                            Fire Element
                                        </span>
                                        <span className="text-xs text-gray-400">3:47</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'badges':
                return (
                    <div className={baseClasses}>
                        <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                            🏆 Mythic Badges
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {['Tarot Master', 'Cosmic Guide', 'Fire Walker', 'Star Whisperer', 'Void Dancer', 'Time Keeper'].map((badge) => (
                                <div key={badge} className="bg-gradient-to-br from-yellow-600/30 to-orange-600/30 rounded-lg p-3 text-center border border-yellow-500/20">
                                    <div className="text-2xl mb-1">🌟</div>
                                    <div className="text-xs text-yellow-200">{badge}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'tarot':
                return (
                    <div className={baseClasses}>
                        <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                            🔮 Daily Tarot
                        </h3>
                        <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-lg p-4 text-center">
                            <div className="text-4xl mb-2">🃏</div>
                            <h4 className="text-white font-semibold mb-2">The Star</h4>
                            <p className="text-purple-200 text-sm">Hope and renewal guide your path today.</p>
                        </div>
                    </div>
                );

            case 'connections':
                return (
                    <div className={baseClasses}>
                        <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                            🌐 Cosmic Network
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-lg">
                                    {getZodiacSigil(['Aries', 'Leo', 'Scorpio', 'Aquarius'][i % 4])}
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderOrbitLayout = () => {
        const centerModule = modules.find(m => m.id === 'bio');
        const orbitModules = modules.filter(m => m.id !== 'bio' && m.visible);

        return (
            <div className="orbital-container relative w-full h-screen flex items-center justify-center">
                {/* Center Module */}
                <motion.div
                    className="absolute z-10 w-80 h-80"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {centerModule && renderModule(centerModule)}
                </motion.div>

                {/* Orbiting Modules */}
                {orbitModules.map((module, index) => {
                    const angle = (index * 360) / orbitModules.length;
                    const radius = 400;
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                        <motion.div
                            key={module.id}
                            className="absolute w-64 h-48"
                            initial={{ x: 0, y: 0, opacity: 0 }}
                            animate={{ x, y, opacity: 1 }}
                            transition={{ delay: index * 0.2, duration: 0.8 }}
                            whileHover={{ scale: 1.05, z: 10 }}
                        >
                            {renderModule(module)}
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    const renderConstellationLayout = () => {
        // Predefined constellation positions
        const positions = [
            { x: 20, y: 15 }, { x: 70, y: 25 }, { x: 15, y: 60 },
            { x: 85, y: 70 }, { x: 50, y: 45 }, { x: 30, y: 85 },
            { x: 75, y: 10 }
        ];

        return (
            <div className="constellation-container relative w-full min-h-screen">
                {modules.filter(m => m.visible).map((module, index) => {
                    const pos = positions[index % positions.length];
                    return (
                        <motion.div
                            key={module.id}
                            className="absolute w-72 h-64"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.3, duration: 0.6 }}
                            whileHover={{ scale: 1.02, z: 10 }}
                        >
                            {renderModule(module)}
                            {/* Constellation Lines */}
                            {index > 0 && (
                                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
                                    <line
                                        x1="50%"
                                        y1="50%"
                                        x2={`${positions[(index - 1) % positions.length].x - pos.x}%`}
                                        y2={`${positions[(index - 1) % positions.length].y - pos.y}%`}
                                        stroke="rgba(147, 51, 234, 0.3)"
                                        strokeWidth="1"
                                    />
                                </svg>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="cosmic-profile-loading flex items-center justify-center min-h-screen">
                <motion.div
                    className="text-purple-300 text-lg"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    🌌 Loading cosmic profile...
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`cosmic-profile min-h-screen bg-gradient-to-br ${themes.find(t => t.id === selectedTheme)?.gradient || 'from-purple-900 to-black'}`}>
            {/* Profile Header */}
            <div className="profile-header p-6 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl">
                            {getZodiacSigil(profileData?.zodiac_signs?.western || 'Aries')}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {profileData?.username || 'Cosmic Traveler'}
                            </h1>
                            <p className="text-purple-300">
                                {profileData?.zodiac_signs?.western || 'Unknown'} • {profileData?.zodiac_signs?.chinese || 'Mystery'}
                            </p>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <div className="flex gap-2">
                            <motion.button
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                                onClick={() => setIsEditing(!isEditing)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isEditing ? '💾 Save' : '✏️ Edit'}
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Layout Controls (Edit Mode) */}
            {isEditing && (
                <motion.div
                    className="edit-controls p-4 bg-black/20 border-b border-purple-500/20"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                >
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Layout Selector */}
                        <div className="flex gap-2">
                            {(['grid', 'orbit', 'constellation'] as const).map((layoutType) => (
                                <motion.button
                                    key={layoutType}
                                    className={`px-3 py-1 rounded ${layout.type === layoutType ? 'bg-purple-600 text-white' : 'bg-purple-800/30 text-purple-300'}`}
                                    onClick={() => setLayout(prev => ({ ...prev, type: layoutType }))}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {layoutType.charAt(0).toUpperCase() + layoutType.slice(1)}
                                </motion.button>
                            ))}
                        </div>

                        {/* Theme Selector */}
                        <div className="flex gap-1">
                            {themes.map((theme) => (
                                <motion.button
                                    key={theme.id}
                                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${theme.gradient} border-2 ${selectedTheme === theme.id ? 'border-white' : 'border-transparent'}`}
                                    onClick={() => setSelectedTheme(theme.id)}
                                    whileHover={{ scale: 1.2 }}
                                    title={theme.name}
                                />
                            ))}
                        </div>

                        {/* Module Toggles */}
                        <div className="flex flex-wrap gap-2">
                            {modules.map((module) => (
                                <motion.button
                                    key={module.id}
                                    className={`px-2 py-1 text-xs rounded ${module.visible ? 'bg-green-600/30 text-green-200' : 'bg-gray-600/30 text-gray-400'}`}
                                    onClick={() => toggleModuleVisibility(module.id)}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    {module.title}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Profile Content */}
            <div className="profile-content p-6">
                {layout.type === 'orbit' ? (
                    renderOrbitLayout()
                ) : layout.type === 'constellation' ? (
                    renderConstellationLayout()
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="modules" isDropDisabled={!isEditing}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={getLayoutClasses()}
                                >
                                    {modules
                                        .filter(m => m.visible)
                                        .sort((a, b) => a.position - b.position)
                                        .map((module, index) => (
                                            <Draggable
                                                key={module.id}
                                                draggableId={module.id}
                                                index={index}
                                                isDragDisabled={!isEditing}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`module-container ${snapshot.isDragging ? 'opacity-75 scale-105' : ''}`}
                                                    >
                                                        {renderModule(module)}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>

            {/* Save Configuration */}
            {isEditing && (
                <motion.div
                    className="fixed bottom-6 right-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <motion.button
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                        onClick={saveProfileConfiguration}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        💾 Save Changes
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
};

export default CosmicProfile;