import { AnimatePresence, motion } from 'framer-motion';
import {
    Book,
    Compass,
    Edit3,
    Feather,
    Heart,
    MessageCircle,
    Moon,
    PlayCircle,
    Plus,
    Send,
    SkipForward,
    Sparkles,
    Star,
    Sun,
    Users,
    Volume2,
    VolumeX,
    Wand2,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface StorySegment {
    id: string;
    authorId: string;
    authorName: string;
    authorZodiac: string;
    content: string;
    wordCount: number;
    timestamp: number;
    isEditable: boolean;
    reactions: Array<{
        userId: string;
        type: 'heart' | 'star' | 'sparkle' | 'moon' | 'sun';
    }>;
    annotations?: Array<{
        id: string;
        userId: string;
        text: string;
        range: { start: number; end: number };
    }>;
}

interface CosmicStory {
    id: string;
    title: string;
    description: string;
    genre: 'fantasy' | 'sci-fi' | 'cosmic' | 'mystical' | 'adventure' | 'romance';
    totalWords: number;
    segments: StorySegment[];
    contributors: Array<{
        id: string;
        name: string;
        zodiacSign: string;
        contributionCount: number;
        role: 'creator' | 'contributor' | 'reader';
    }>;
    settings: {
        maxWordsPerSegment: number;
        turnDuration: number; // minutes
        allowEditing: boolean;
        requireApproval: boolean;
        isPublic: boolean;
        allowReactions: boolean;
        allowComments: boolean;
    };
    status: 'active' | 'paused' | 'completed' | 'archived';
    createdAt: number;
    lastActivity: number;
    cosmicTheme: {
        primaryColor: string;
        secondaryColor: string;
        atmosphere: string;
        soundscape?: string[];
    };
}

interface CollaborativeStoryWeaverProps {
    storyId?: string;
    mode?: 'create' | 'join' | 'browse';
    onStoryCreate?: (story: CosmicStory) => void;
    onStoryJoin?: (storyId: string) => void;
}

export const CollaborativeStoryWeaver: React.FC<CollaborativeStoryWeaverProps> = ({
    storyId,
    mode = 'browse',
    onStoryCreate,
    onStoryJoin
}) => {
    const [currentStory, setCurrentStory] = useState<CosmicStory | null>(null);
    const [availableStories, setAvailableStories] = useState<CosmicStory[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [currentSegmentDraft, setCurrentSegmentDraft] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'read' | 'discuss' | 'analytics'>('write');
    const [readerMode, setReaderMode] = useState({
        isReading: false,
        currentSegmentIndex: 0,
        readingSpeed: 200, // words per minute
        autoAdvance: false,
        voiceEnabled: false
    });

    // Mock stories data
    const mockStories: CosmicStory[] = [
        {
            id: '1',
            title: 'The Constellation Keeper\'s Quest',
            description: 'An epic journey through the cosmic realms where star-keepers must unite to save the fading constellations.',
            genre: 'cosmic',
            totalWords: 2847,
            segments: [
                {
                    id: 'seg1',
                    authorId: 'user1',
                    authorName: 'StarWeaver_Luna',
                    authorZodiac: 'Pisces',
                    content: 'In the depths of the Cosmic Observatory, Lyra discovered that the constellation of Ursa Major was slowly dimming. The ancient stars, once bright as celestial diamonds, now flickered like dying candles in an ethereal wind. She traced her fingers along the crystalline viewing globe, feeling the cosmic energy pulse beneath her touch.',
                    wordCount: 58,
                    timestamp: Date.now() - 3600000,
                    isEditable: false,
                    reactions: [
                        { userId: 'user2', type: 'star' },
                        { userId: 'user3', type: 'sparkle' },
                        { userId: 'user4', type: 'heart' }
                    ]
                },
                {
                    id: 'seg2',
                    authorId: 'user2',
                    authorName: 'CosmicScribe',
                    authorZodiac: 'Gemini',
                    content: 'The Observatory\'s ancient keeper, Master Orion, appeared beside her with a shimmer of stardust. His robes, woven from threads of moonlight, rustled as he approached. "The Great Dimming has begun," he whispered, his voice carrying the weight of millennia. "Only the chosen constellation keepers can restore the celestial balance before our universe falls into eternal darkness."',
                    wordCount: 63,
                    timestamp: Date.now() - 3000000,
                    isEditable: false,
                    reactions: [
                        { userId: 'user1', type: 'moon' },
                        { userId: 'user3', type: 'star' }
                    ]
                }
            ],
            contributors: [
                { id: 'user1', name: 'StarWeaver_Luna', zodiacSign: 'Pisces', contributionCount: 1, role: 'creator' },
                { id: 'user2', name: 'CosmicScribe', zodiacSign: 'Gemini', contributionCount: 1, role: 'contributor' },
                { id: 'user3', name: 'NebulaReader', zodiacSign: 'Virgo', contributionCount: 0, role: 'reader' }
            ],
            settings: {
                maxWordsPerSegment: 100,
                turnDuration: 30,
                allowEditing: false,
                requireApproval: false,
                isPublic: true,
                allowReactions: true,
                allowComments: true
            },
            status: 'active',
            createdAt: Date.now() - 86400000,
            lastActivity: Date.now() - 1800000,
            cosmicTheme: {
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                atmosphere: 'mystical-space',
                soundscape: ['cosmic-ambience', 'gentle-chimes', 'distant-stars']
            }
        },
        {
            id: '2',
            title: 'Zodiac Academy Chronicles',
            description: 'Students at the mystical Zodiac Academy discover their elemental powers and face ancient cosmic challenges.',
            genre: 'fantasy',
            totalWords: 1523,
            segments: [
                {
                    id: 'seg1',
                    authorId: 'user3',
                    authorName: 'ElementalMage',
                    authorZodiac: 'Leo',
                    content: 'The grand halls of Zodiac Academy shimmered with elemental magic as first-year students arrived for orientation. Aries students conjured flames that danced in their palms, while Aquarius pupils made water spiral through the air in impossible patterns. At the center of it all stood Headmaster Cosmos, his robes shifting colors like an aurora.',
                    wordCount: 72,
                    timestamp: Date.now() - 7200000,
                    isEditable: false,
                    reactions: [
                        { userId: 'user1', type: 'sparkle' },
                        { userId: 'user4', type: 'heart' }
                    ]
                }
            ],
            contributors: [
                { id: 'user3', name: 'ElementalMage', zodiacSign: 'Leo', contributionCount: 1, role: 'creator' },
                { id: 'user1', name: 'StarWeaver_Luna', zodiacSign: 'Pisces', contributionCount: 0, role: 'reader' }
            ],
            settings: {
                maxWordsPerSegment: 80,
                turnDuration: 45,
                allowEditing: true,
                requireApproval: true,
                isPublic: true,
                allowReactions: true,
                allowComments: true
            },
            status: 'active',
            createdAt: Date.now() - 172800000,
            lastActivity: Date.now() - 3600000,
            cosmicTheme: {
                primaryColor: '#f59e0b',
                secondaryColor: '#ef4444',
                atmosphere: 'magical-academy',
                soundscape: ['mystical-chimes', 'elemental-whispers']
            }
        }
    ];

    useEffect(() => {
        setAvailableStories(mockStories);
        if (storyId) {
            const story = mockStories.find(s => s.id === storyId);
            if (story) {
                setCurrentStory(story);
            }
        }
    }, [storyId]);

    const joinStory = useCallback((story: CosmicStory) => {
        setCurrentStory(story);
        onStoryJoin?.(story.id);
    }, [onStoryJoin]);

    const addSegment = useCallback(() => {
        if (!currentStory || !currentSegmentDraft.trim()) return;

        const newSegment: StorySegment = {
            id: `seg-${Date.now()}`,
            authorId: 'current-user',
            authorName: 'Current User',
            authorZodiac: 'Virgo',
            content: currentSegmentDraft.trim(),
            wordCount: currentSegmentDraft.trim().split(' ').length,
            timestamp: Date.now(),
            isEditable: currentStory.settings.allowEditing,
            reactions: []
        };

        setCurrentStory(prev => prev ? {
            ...prev,
            segments: [...prev.segments, newSegment],
            totalWords: prev.totalWords + newSegment.wordCount,
            lastActivity: Date.now()
        } : null);

        setCurrentSegmentDraft('');
        setIsWriting(false);
    }, [currentStory, currentSegmentDraft]);

    const addReaction = useCallback((segmentId: string, reactionType: 'heart' | 'star' | 'sparkle' | 'moon' | 'sun') => {
        setCurrentStory(prev => {
            if (!prev) return null;

            return {
                ...prev,
                segments: prev.segments.map(segment =>
                    segment.id === segmentId
                        ? {
                            ...segment,
                            reactions: segment.reactions.filter(r => r.userId !== 'current-user').concat({
                                userId: 'current-user',
                                type: reactionType
                            })
                        }
                        : segment
                )
            };
        });
    }, []);

    const startReading = useCallback(() => {
        setReaderMode(prev => ({ ...prev, isReading: true, currentSegmentIndex: 0 }));
    }, []);

    const toggleAutoAdvance = useCallback(() => {
        setReaderMode(prev => ({ ...prev, autoAdvance: !prev.autoAdvance }));
    }, []);

    if (!currentStory) {
        return (
            <StoryBrowser
                stories={availableStories}
                onStoryJoin={joinStory}
                onCreateNew={() => setShowCreateModal(true)}
                showCreateModal={showCreateModal}
                onCreateModalClose={() => setShowCreateModal(false)}
                onStoryCreate={onStoryCreate}
            />
        );
    }

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="w-full h-full"
                    style={{
                        background: `radial-gradient(circle at center, ${currentStory.cosmicTheme.primaryColor}40 0%, transparent 70%)`
                    }}
                />
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-black/80 backdrop-blur-lg border-b border-white/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setCurrentStory(null)}
                            className="p-2 text-white/60 hover:text-white transition-colors"
                            title="Back to stories"
                        >
                            <Book className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-white">{currentStory.title}</h1>
                            <p className="text-white/60 text-sm">
                                {currentStory.totalWords} words • {currentStory.contributors.length} contributors
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-sm text-white/60">
                            <Users className="w-4 h-4" />
                            <span>{currentStory.contributors.filter(c => c.role !== 'reader').length}</span>
                        </div>
                        <button
                            onClick={startReading}
                            className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                        >
                            <PlayCircle className="w-4 h-4 mr-2 inline" />
                            Read Story
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mt-4">
                    {[
                        { id: 'write', label: 'Write', icon: Edit3 },
                        { id: 'read', label: 'Read', icon: Book },
                        { id: 'discuss', label: 'Discuss', icon: MessageCircle },
                        { id: 'analytics', label: 'Stats', icon: Star }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="absolute top-32 left-0 right-0 bottom-0 p-6">
                {activeTab === 'write' && (
                    <WritingInterface
                        story={currentStory}
                        currentDraft={currentSegmentDraft}
                        onDraftChange={setCurrentSegmentDraft}
                        isWriting={isWriting}
                        onWritingToggle={setIsWriting}
                        onAddSegment={addSegment}
                        onAddReaction={addReaction}
                    />
                )}

                {activeTab === 'read' && (
                    <ReadingInterface
                        story={currentStory}
                        readerMode={readerMode}
                        onReaderModeChange={setReaderMode}
                        onToggleAutoAdvance={toggleAutoAdvance}
                    />
                )}

                {activeTab === 'discuss' && (
                    <DiscussionInterface story={currentStory} />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsInterface story={currentStory} />
                )}
            </div>

            {/* Reader Mode Overlay */}
            <AnimatePresence>
                {readerMode.isReading && (
                    <ReaderModeOverlay
                        story={currentStory}
                        readerMode={readerMode}
                        onReaderModeChange={setReaderMode}
                        onClose={() => setReaderMode(prev => ({ ...prev, isReading: false }))}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Story Browser Component
const StoryBrowser: React.FC<{
    stories: CosmicStory[];
    onStoryJoin: (story: CosmicStory) => void;
    onCreateNew: () => void;
    showCreateModal: boolean;
    onCreateModalClose: () => void;
    onStoryCreate?: (story: CosmicStory) => void;
}> = ({ stories, onStoryJoin, onCreateNew, showCreateModal, onCreateModalClose, onStoryCreate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
                    <Feather className="w-8 h-8 mr-3 text-amber-400" />
                    Collaborative Story Weaver
                </h1>
                <p className="text-white/60">Create magical tales together with fellow cosmic storytellers</p>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onCreateNew}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5 mr-2 inline" />
                    Create New Story
                </button>
                <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors">
                    Browse All Stories
                </button>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stories.map((story) => (
                    <StoryCard key={story.id} story={story} onJoin={() => onStoryJoin(story)} />
                ))}
            </div>

            {/* Create Story Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateStoryModal
                        onClose={onCreateModalClose}
                        onCreate={(story) => {
                            onStoryCreate?.(story);
                            onCreateModalClose();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Story Card Component
const StoryCard: React.FC<{
    story: CosmicStory;
    onJoin: () => void;
}> = ({ story, onJoin }) => {
    const getGenreIcon = (genre: string) => {
        const icons = {
            fantasy: Wand2,
            'sci-fi': Zap,
            cosmic: Star,
            mystical: Moon,
            adventure: Compass,
            romance: Heart
        };
        return icons[genre as keyof typeof icons] || Book;
    };

    const GenreIcon = getGenreIcon(story.genre);
    const lastActivity = new Date(story.lastActivity);
    const timeSince = Math.floor((Date.now() - story.lastActivity) / (1000 * 60));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-amber-500/30 transition-all"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div
                        className="p-3 rounded-full"
                        style={{ backgroundColor: story.cosmicTheme.primaryColor + '20' }}
                    >
                        <GenreIcon
                            className="w-6 h-6"
                            style={{ color: story.cosmicTheme.primaryColor }}
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{story.title}</h3>
                        <p className="text-sm text-white/60 capitalize">{story.genre}</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${story.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        story.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                            story.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                    }`}>
                    {story.status}
                </div>
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm mb-4 line-clamp-2">{story.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-white font-medium">{story.totalWords}</div>
                    <div className="text-white/60 text-xs">Words</div>
                </div>
                <div className="text-center">
                    <div className="text-white font-medium">{story.segments.length}</div>
                    <div className="text-white/60 text-xs">Segments</div>
                </div>
                <div className="text-center">
                    <div className="text-white font-medium">{story.contributors.length}</div>
                    <div className="text-white/60 text-xs">Contributors</div>
                </div>
            </div>

            {/* Contributors */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Contributors</span>
                    <span className="text-white/60 text-xs">{timeSince}m ago</span>
                </div>
                <div className="flex -space-x-2">
                    {story.contributors.slice(0, 4).map((contributor) => (
                        <div
                            key={contributor.id}
                            className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-white"
                            title={`${contributor.name} (${contributor.zodiacSign})`}
                        >
                            {contributor.name[0]}
                        </div>
                    ))}
                    {story.contributors.length > 4 && (
                        <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-black flex items-center justify-center text-xs text-white">
                            +{story.contributors.length - 4}
                        </div>
                    )}
                </div>
            </div>

            {/* Join Button */}
            <button
                onClick={onJoin}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors font-medium"
            >
                {story.status === 'active' ? 'Join Story' : 'Read Story'}
            </button>
        </motion.div>
    );
};

// Writing Interface Component
const WritingInterface: React.FC<{
    story: CosmicStory;
    currentDraft: string;
    onDraftChange: (draft: string) => void;
    isWriting: boolean;
    onWritingToggle: (writing: boolean) => void;
    onAddSegment: () => void;
    onAddReaction: (segmentId: string, reactionType: any) => void;
}> = ({ story, currentDraft, onDraftChange, isWriting, onWritingToggle, onAddSegment, onAddReaction }) => {
    const wordCount = currentDraft.trim().split(' ').filter(word => word).length;
    const isOverLimit = wordCount > story.settings.maxWordsPerSegment;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Story Timeline */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 overflow-y-auto">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Book className="w-5 h-5 mr-2" />
                    Story Timeline
                </h3>

                <div className="space-y-4">
                    {story.segments.map((segment, index) => (
                        <SegmentCard
                            key={segment.id}
                            segment={segment}
                            segmentNumber={index + 1}
                            onAddReaction={(reactionType) => onAddReaction(segment.id, reactionType)}
                        />
                    ))}
                </div>
            </div>

            {/* Writing Panel */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center">
                        <Edit3 className="w-5 h-5 mr-2" />
                        Your Turn to Write
                    </h3>
                    <div className="text-sm text-white/60">
                        {wordCount}/{story.settings.maxWordsPerSegment} words
                    </div>
                </div>

                {!isWriting ? (
                    <div className="flex-1 flex items-center justify-center">
                        <button
                            onClick={() => onWritingToggle(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
                        >
                            Start Writing
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <textarea
                            value={currentDraft}
                            onChange={(e) => onDraftChange(e.target.value)}
                            className={`flex-1 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none resize-none ${isOverLimit ? 'focus:border-red-500/50' : 'focus:border-cyan-500/50'
                                }`}
                            placeholder="Continue the story... Let your imagination flow with the cosmic energy of your fellow writers."
                        />

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        onWritingToggle(false);
                                        onDraftChange('');
                                    }}
                                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>

                            <button
                                onClick={onAddSegment}
                                disabled={!currentDraft.trim() || isOverLimit}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${!currentDraft.trim() || isOverLimit
                                        ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                    }`}
                            >
                                <Send className="w-4 h-4 mr-2 inline" />
                                Add Segment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Segment Card Component
const SegmentCard: React.FC<{
    segment: StorySegment;
    segmentNumber: number;
    onAddReaction: (reactionType: 'heart' | 'star' | 'sparkle' | 'moon' | 'sun') => void;
}> = ({ segment, segmentNumber, onAddReaction }) => {
    const reactions = [
        { type: 'heart' as const, icon: Heart, color: '#ef4444' },
        { type: 'star' as const, icon: Star, color: '#f59e0b' },
        { type: 'sparkle' as const, icon: Sparkles, color: '#8b5cf6' },
        { type: 'moon' as const, icon: Moon, color: '#06b6d4' },
        { type: 'sun' as const, icon: Sun, color: '#f97316' }
    ];

    return (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {segment.authorName[0]}
                    </div>
                    <div>
                        <div className="text-white font-medium">{segment.authorName}</div>
                        <div className="text-white/60 text-xs">
                            Segment {segmentNumber} • {segment.wordCount} words • {segment.authorZodiac}
                        </div>
                    </div>
                </div>
                <div className="text-white/40 text-xs">
                    {new Date(segment.timestamp).toLocaleDateString()}
                </div>
            </div>

            {/* Content */}
            <p className="text-white/90 text-sm leading-relaxed mb-3">{segment.content}</p>

            {/* Reactions */}
            <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                    {reactions.map((reaction) => {
                        const ReactionIcon = reaction.icon;
                        const hasReaction = segment.reactions.some(r => r.userId === 'current-user' && r.type === reaction.type);
                        const reactionCount = segment.reactions.filter(r => r.type === reaction.type).length;

                        return (
                            <button
                                key={reaction.type}
                                onClick={() => onAddReaction(reaction.type)}
                                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${hasReaction
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                                style={{
                                    backgroundColor: hasReaction ? reaction.color + '20' : undefined,
                                    color: hasReaction ? reaction.color : undefined
                                }}
                            >
                                <ReactionIcon className="w-3 h-3" />
                                {reactionCount > 0 && <span>{reactionCount}</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Reading Interface Component
const ReadingInterface: React.FC<{
    story: CosmicStory;
    readerMode: any;
    onReaderModeChange: (mode: any) => void;
    onToggleAutoAdvance: () => void;
}> = ({ story, readerMode, onReaderModeChange, onToggleAutoAdvance }) => {
    return (
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto h-full overflow-y-auto">
            {/* Reading Controls */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{story.title}</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onToggleAutoAdvance}
                        className={`p-2 rounded-lg transition-colors ${readerMode.autoAdvance ? 'text-cyan-400' : 'text-white/60 hover:text-white'
                            }`}
                        title="Auto-advance"
                    >
                        <SkipForward className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onReaderModeChange({ ...readerMode, voiceEnabled: !readerMode.voiceEnabled })}
                        className={`p-2 rounded-lg transition-colors ${readerMode.voiceEnabled ? 'text-cyan-400' : 'text-white/60 hover:text-white'
                            }`}
                        title="Text-to-speech"
                    >
                        {readerMode.voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Story Content */}
            <div className="prose prose-lg text-white/90 leading-relaxed space-y-6">
                {story.segments.map((segment, index) => (
                    <motion.div
                        key={segment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-6"
                    >
                        <p className="text-base leading-relaxed">{segment.content}</p>
                        <div className="mt-2 text-sm text-white/40 italic">
                            — {segment.authorName} ({segment.authorZodiac})
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// Reader Mode Overlay Component
const ReaderModeOverlay: React.FC<{
    story: CosmicStory;
    readerMode: any;
    onReaderModeChange: (mode: any) => void;
    onClose: () => void;
}> = ({ story, readerMode, onReaderModeChange, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-8"
        >
            <div className="w-full max-w-4xl text-center">
                {/* Controls */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onClose}
                        className="p-3 text-white/60 hover:text-white transition-colors"
                    >
                        ×
                    </button>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => onReaderModeChange({
                                ...readerMode,
                                currentSegmentIndex: Math.max(0, readerMode.currentSegmentIndex - 1)
                            })}
                            disabled={readerMode.currentSegmentIndex === 0}
                            className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            ←
                        </button>

                        <span className="text-white/60 text-sm">
                            {readerMode.currentSegmentIndex + 1} / {story.segments.length}
                        </span>

                        <button
                            onClick={() => onReaderModeChange({
                                ...readerMode,
                                currentSegmentIndex: Math.min(story.segments.length - 1, readerMode.currentSegmentIndex + 1)
                            })}
                            disabled={readerMode.currentSegmentIndex === story.segments.length - 1}
                            className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            →
                        </button>
                    </div>
                </div>

                {/* Current Segment */}
                <div className="text-xl leading-relaxed text-white/90 mb-8">
                    {story.segments[readerMode.currentSegmentIndex]?.content}
                </div>

                <div className="text-white/40 italic">
                    — {story.segments[readerMode.currentSegmentIndex]?.authorName}
                </div>
            </div>
        </motion.div>
    );
};

// Discussion Interface Component
const DiscussionInterface: React.FC<{
    story: CosmicStory;
}> = ({ story }) => {
    return (
        <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full">
            <div className="text-center py-20">
                <MessageCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Story Discussion</h3>
                <p className="text-white/60">
                    Chat with fellow writers about plot development, characters, and creative ideas
                </p>
            </div>
        </div>
    );
};

// Analytics Interface Component
const AnalyticsInterface: React.FC<{
    story: CosmicStory;
}> = ({ story }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Story Statistics */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Story Statistics
                </h3>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-white/60">Total Words</span>
                        <span className="text-white font-medium">{story.totalWords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Segments</span>
                        <span className="text-white font-medium">{story.segments.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Contributors</span>
                        <span className="text-white font-medium">{story.contributors.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Avg. Segment Length</span>
                        <span className="text-white font-medium">
                            {Math.round(story.totalWords / story.segments.length)} words
                        </span>
                    </div>
                </div>
            </div>

            {/* Contributors */}
            <div className="bg-black/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Contributors
                </h3>

                <div className="space-y-3">
                    {story.contributors.map((contributor) => (
                        <div key={contributor.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    {contributor.name[0]}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{contributor.name}</div>
                                    <div className="text-white/60 text-xs">{contributor.zodiacSign}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-medium">{contributor.contributionCount}</div>
                                <div className="text-white/60 text-xs">segments</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Create Story Modal Component
const CreateStoryModal: React.FC<{
    onClose: () => void;
    onCreate: (story: CosmicStory) => void;
}> = ({ onClose, onCreate }) => {
    const [storyData, setStoryData] = useState({
        title: '',
        description: '',
        genre: 'fantasy' as const,
        maxWordsPerSegment: 100,
        turnDuration: 30,
        isPublic: true,
        allowEditing: false,
        allowReactions: true
    });

    const handleCreate = () => {
        const newStory: CosmicStory = {
            id: `story-${Date.now()}`,
            ...storyData,
            totalWords: 0,
            segments: [],
            contributors: [{
                id: 'current-user',
                name: 'Current User',
                zodiacSign: 'Virgo',
                contributionCount: 0,
                role: 'creator'
            }],
            settings: {
                maxWordsPerSegment: storyData.maxWordsPerSegment,
                turnDuration: storyData.turnDuration,
                allowEditing: storyData.allowEditing,
                requireApproval: false,
                isPublic: storyData.isPublic,
                allowReactions: storyData.allowReactions,
                allowComments: true
            },
            status: 'active',
            createdAt: Date.now(),
            lastActivity: Date.now(),
            cosmicTheme: {
                primaryColor: '#8b5cf6',
                secondaryColor: '#06b6d4',
                atmosphere: 'cosmic'
            }
        };

        onCreate(newStory);
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
                    <h2 className="text-xl font-bold text-white">Create New Story</h2>
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
                        <label className="block text-white/80 text-sm mb-2">Story Title</label>
                        <input
                            type="text"
                            value={storyData.title}
                            onChange={(e) => setStoryData({ ...storyData, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                            placeholder="Enter your story title..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-white/80 text-sm mb-2">Description</label>
                        <textarea
                            value={storyData.description}
                            onChange={(e) => setStoryData({ ...storyData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 h-24"
                            placeholder="Describe your story concept..."
                        />
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">Genre</label>
                            <select
                                value={storyData.genre}
                                onChange={(e) => setStoryData({ ...storyData, genre: e.target.value as any })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                            >
                                <option value="fantasy">Fantasy</option>
                                <option value="sci-fi">Sci-Fi</option>
                                <option value="cosmic">Cosmic</option>
                                <option value="mystical">Mystical</option>
                                <option value="adventure">Adventure</option>
                                <option value="romance">Romance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">Max Words per Segment</label>
                            <input
                                type="number"
                                value={storyData.maxWordsPerSegment}
                                onChange={(e) => setStoryData({ ...storyData, maxWordsPerSegment: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                                min="50"
                                max="500"
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Public Story</span>
                            <button
                                onClick={() => setStoryData({ ...storyData, isPublic: !storyData.isPublic })}
                                className={`w-12 h-6 rounded-full transition-colors ${storyData.isPublic ? 'bg-cyan-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${storyData.isPublic ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Allow Editing</span>
                            <button
                                onClick={() => setStoryData({ ...storyData, allowEditing: !storyData.allowEditing })}
                                className={`w-12 h-6 rounded-full transition-colors ${storyData.allowEditing ? 'bg-cyan-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${storyData.allowEditing ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Allow Reactions</span>
                            <button
                                onClick={() => setStoryData({ ...storyData, allowReactions: !storyData.allowReactions })}
                                className={`w-12 h-6 rounded-full transition-colors ${storyData.allowReactions ? 'bg-cyan-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${storyData.allowReactions ? 'translate-x-6' : 'translate-x-1'
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
                        disabled={!storyData.title || !storyData.description}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Create Story
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CollaborativeStoryWeaver;