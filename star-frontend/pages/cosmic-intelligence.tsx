import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FiCalendar, FiGrid, FiMessageCircle, FiTarget } from 'react-icons/fi';
import {
    GiCrystalBall,
    GiFire,
    GiMeditation,
    GiMoon,
    GiStarsStack,
    GiStoneBlock,
    GiWaterDrop,
    GiWhirlwind
} from 'react-icons/gi';
import { LunarGuidancePanel } from '../src/components/cosmic/LunarGuidancePanel';
import { MentorChat } from '../src/components/cosmic/MentorChat';
import { QuestDashboard } from '../src/components/cosmic/QuestDashboard';

type TabType = 'overview' | 'quests' | 'mentor' | 'lunar';

export default function CosmicIntelligencePage() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const tabs = [
        {
            id: 'overview' as TabType,
            label: 'Overview',
            icon: <FiGrid className="w-5 h-5" />,
            description: 'Cosmic intelligence dashboard'
        },
        {
            id: 'quests' as TabType,
            label: 'Quests',
            icon: <FiTarget className="w-5 h-5" />,
            description: 'Ritual quests and challenges'
        },
        {
            id: 'mentor' as TabType,
            label: 'Mentor',
            icon: <FiMessageCircle className="w-5 h-5" />,
            description: 'Archetypal guidance'
        },
        {
            id: 'lunar' as TabType,
            label: 'Lunar',
            icon: <GiMoon className="w-5 h-5" />,
            description: 'Lunar cycles and guidance'
        }
    ];

    const handleMeditationStart = () => {
        // Navigate to meditation or open meditation modal
        console.log('Starting lunar meditation...');
    };

    const handleQuestComplete = (quest: any) => {
        // Handle quest completion - could trigger social sharing
        console.log('Quest completed:', quest);
    };

    const handleGuidanceReceived = (guidance: any) => {
        // Handle mentor guidance - could trigger achievements
        console.log('Guidance received:', guidance);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <GiCrystalBall className="w-10 h-10 text-purple-400" />
                            <div>
                                <h1 className="text-3xl font-bold text-white">Cosmic Intelligence</h1>
                                <p className="text-gray-400">Unlock the wisdom of the stars</p>
                            </div>
                        </div>

                        {/* Elemental Balance Indicator */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <GiFire className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-gray-400">Fire</span>
                                <div className="w-16 h-2 bg-gray-700 rounded-full">
                                    <div className="w-3/4 h-full bg-red-400 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <GiWaterDrop className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-gray-400">Water</span>
                                <div className="w-16 h-2 bg-gray-700 rounded-full">
                                    <div className="w-1/2 h-full bg-blue-400 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <GiWhirlwind className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-gray-400">Air</span>
                                <div className="w-16 h-2 bg-gray-700 rounded-full">
                                    <div className="w-2/3 h-full bg-green-400 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <GiStoneBlock className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-gray-400">Earth</span>
                                <div className="w-16 h-2 bg-gray-700 rounded-full">
                                    <div className="w-1/4 h-full bg-yellow-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Welcome Section */}
                                <div className="text-center py-12">
                                    <GiStarsStack className="w-16 h-16 mx-auto mb-6 text-purple-400" />
                                    <h2 className="text-3xl font-bold text-white mb-4">
                                        Welcome to Cosmic Intelligence
                                    </h2>
                                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                        Discover your path through archetypal wisdom, lunar guidance, and transformative quests.
                                        The cosmos awaits your awakening.
                                    </p>
                                </div>

                                {/* Overview Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Lunar Guidance */}
                                    <LunarGuidancePanel
                                        onMeditationStart={handleMeditationStart}
                                    />

                                    {/* Quick Actions */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setActiveTab('mentor')}
                                                className="p-4 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-lg text-white transition-all group"
                                            >
                                                <GiCrystalBall className="w-8 h-8 mb-2 group-hover:animate-pulse" />
                                                <div className="font-semibold">Seek Guidance</div>
                                                <div className="text-sm opacity-80">Consult archetypal mentors</div>
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('quests')}
                                                className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-lg text-white transition-all group"
                                            >
                                                <FiTarget className="w-8 h-8 mb-2 group-hover:animate-pulse" />
                                                <div className="font-semibold">Start Quest</div>
                                                <div className="text-sm opacity-80">Begin cosmic journey</div>
                                            </button>

                                            <button
                                                onClick={() => setActiveTab('lunar')}
                                                className="p-4 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 rounded-lg text-white transition-all group"
                                            >
                                                <GiMoon className="w-8 h-8 mb-2 group-hover:animate-pulse" />
                                                <div className="font-semibold">Lunar Wisdom</div>
                                                <div className="text-sm opacity-80">Current moon guidance</div>
                                            </button>

                                            <button
                                                onClick={handleMeditationStart}
                                                className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 rounded-lg text-white transition-all group"
                                            >
                                                <GiMeditation className="w-8 h-8 mb-2 group-hover:animate-pulse" />
                                                <div className="font-semibold">Meditate</div>
                                                <div className="text-sm opacity-80">Lunar meditation</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Preview */}
                                <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
                                    <h3 className="text-xl font-bold text-white mb-4">Recent Cosmic Activity</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
                                            <GiCrystalBall className="w-6 h-6 text-purple-400" />
                                            <div className="flex-1">
                                                <div className="text-white font-medium">Mentor Session Completed</div>
                                                <div className="text-gray-400 text-sm">Guidance from Luna, The Nurturer</div>
                                            </div>
                                            <div className="text-gray-500 text-sm">2 hours ago</div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
                                            <FiTarget className="w-6 h-6 text-blue-400" />
                                            <div className="flex-1">
                                                <div className="text-white font-medium">Quest Progress</div>
                                                <div className="text-gray-400 text-sm">Lunar Cycle Quest - Step 3 of 7 completed</div>
                                            </div>
                                            <div className="text-gray-500 text-sm">1 day ago</div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
                                            <GiMoon className="w-6 h-6 text-yellow-400" />
                                            <div className="flex-1">
                                                <div className="text-white font-medium">Lunar Event</div>
                                                <div className="text-gray-400 text-sm">Entered Bharani Lunar Mansion</div>
                                            </div>
                                            <div className="text-gray-500 text-sm">3 days ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'quests' && (
                            <QuestDashboard
                                onQuestComplete={handleQuestComplete}
                            />
                        )}

                        {activeTab === 'mentor' && (
                            <MentorChat
                                onGuidanceReceived={handleGuidanceReceived}
                            />
                        )}

                        {activeTab === 'lunar' && (
                            <div className="space-y-8">
                                <LunarGuidancePanel
                                    compact={false}
                                    showActions={true}
                                    onMeditationStart={handleMeditationStart}
                                />

                                {/* Lunar Calendar/Upcoming Events */}
                                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <FiCalendar className="w-6 h-6 text-blue-400" />
                                        Upcoming Lunar Events
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                                <div>
                                                    <div className="text-white font-medium">Full Moon</div>
                                                    <div className="text-gray-400 text-sm">In Leo - Lunar Eclipse</div>
                                                </div>
                                            </div>
                                            <div className="text-gray-400 text-sm">March 14, 2025</div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                                                <div>
                                                    <div className="text-white font-medium">New Moon</div>
                                                    <div className="text-gray-400 text-sm">In Pisces - Solar Eclipse</div>
                                                </div>
                                            </div>
                                            <div className="text-gray-400 text-sm">March 29, 2025</div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                                <div>
                                                    <div className="text-white font-medium">Void of Course</div>
                                                    <div className="text-gray-400 text-sm">Moon enters Aries</div>
                                                </div>
                                            </div>
                                            <div className="text-gray-400 text-sm">Today, 8:45 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}