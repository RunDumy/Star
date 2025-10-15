// Enhanced Tarot Reading Component
// Integrates with enhanced_tarot_api.py for advanced spreads, AI interpretations, and cosmic timing

import { AnimatePresence, motion } from 'framer-motion';
import {
    Bookmark,
    BookOpen,
    Calendar,
    Clock,
    Compass,
    Eye,
    MessageCircle,
    Moon,
    RefreshCw,
    Share2,
    Shuffle,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

// Enhanced Tarot Reading Types
interface TarotCard {
    id: string;
    name: string;
    suit: string;
    element: string;
    number?: number;
    image_url: string;
    upright_meaning: string;
    reversed_meaning: string;
    is_reversed: boolean;
    cosmic_influences: {
        planetary_ruler: string;
        zodiac_association: string;
        numerological_value: number;
        chakra_connection: string;
    };
    elemental_energy: {
        fire: number;
        water: number;
        air: number;
        earth: number;
    };
}

interface TarotSpread {
    id: string;
    name: string;
    description: string;
    positions: string[];
    card_count: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    cosmic_timing: {
        optimal_time: string;
        moon_phase: string;
        planetary_influence: string;
    };
}

interface TarotReading {
    reading_id: string;
    spread_type: string;
    spread_name: string;
    spread_description: string;
    cards: TarotCard[];
    positions: string[];
    ai_interpretation: {
        summary: string;
        detailed_analysis: string;
        key_themes: string[];
        guidance: string;
        timeline: string;
        numerology_connection: string;
    };
    cosmic_timing: {
        optimal_actions: string[];
        planetary_advice: string;
        elemental_balance: string;
    };
    energy_flow: {
        dominant_element: string;
        energy_level: number;
        flow_direction: string;
    };
    numerology_guidance: string;
    follow_up_recommendations: string[];
    cosmic_influences: {
        current_transits: string[];
        personal_resonance: number;
    };
    created_at: string;
}

interface EnhancedTarotReaderProps {
    userZodiac?: string;
    numerologyData?: any;
    onReadingComplete?: (reading: TarotReading) => void;
    onShareReading?: (readingId: string, shareType: 'feed' | 'profile') => void;
}

const EnhancedTarotReader: React.FC<EnhancedTarotReaderProps> = ({
    userZodiac = 'Scorpio',
    numerologyData,
    onReadingComplete,
    onShareReading
}) => {
    // State management
    const [availableSpreads, setAvailableSpreads] = useState<Record<string, TarotSpread>>({});
    const [selectedSpread, setSelectedSpread] = useState<string>('');
    const [question, setQuestion] = useState<string>('');
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
    const [cosmicInfluences, setCosmicInfluences] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<string>('spread-selection');
    const [readingHistory, setReadingHistory] = useState<TarotReading[]>([]);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const [isLoadingInfluences, setIsLoadingInfluences] = useState<boolean>(false);
    const [reflectionText, setReflectionText] = useState<string>('');
    const [reflectionTags, setReflectionTags] = useState<string[]>([]);

    // Load available spreads on component mount
    useEffect(() => {
        loadAvailableSpreads();
        loadCosmicInfluences();
        loadReadingHistory();
    }, []);

    // API interaction functions
    const loadAvailableSpreads = async () => {
        try {
            const response = await fetch('/api/v1/tarot/enhanced-spreads', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableSpreads(data.spreads);

                // Set default spread if available
                const spreadKeys = Object.keys(data.spreads);
                if (spreadKeys.length > 0) {
                    setSelectedSpread(spreadKeys[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load available spreads:', error);
        }
    };

    const loadCosmicInfluences = async () => {
        setIsLoadingInfluences(true);
        try {
            const response = await fetch('/api/v1/tarot/cosmic-influences', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCosmicInfluences(data);
            }
        } catch (error) {
            console.error('Failed to load cosmic influences:', error);
        } finally {
            setIsLoadingInfluences(false);
        }
    };

    const loadReadingHistory = async () => {
        try {
            const response = await fetch('/api/v1/tarot/readings?limit=10', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReadingHistory(data.readings || []);
            }
        } catch (error) {
            console.error('Failed to load reading history:', error);
        }
    };

    const performTarotReading = async () => {
        if (!selectedSpread || !question.trim()) {
            return;
        }

        setIsDrawing(true);
        try {
            const response = await fetch('/api/v1/tarot/enhanced-draw', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    spread_type: selectedSpread,
                    question: question.trim(),
                    zodiac_context: {
                        user_zodiac: userZodiac,
                        numerology_data: numerologyData
                    }
                })
            });

            if (response.ok) {
                const reading = await response.json();
                setCurrentReading(reading);
                setActiveTab('reading-result');

                // Update reading history
                setReadingHistory(prev => [reading, ...prev.slice(0, 9)]);

                // Call completion callback
                if (onReadingComplete) {
                    onReadingComplete(reading);
                }
            } else {
                throw new Error('Failed to perform reading');
            }
        } catch (error) {
            console.error('Error performing tarot reading:', error);
        } finally {
            setIsDrawing(false);
        }
    };

    const shareReading = async (shareType: 'feed' | 'profile') => {
        if (!currentReading) return;

        try {
            const response = await fetch('/api/v1/tarot/share-reading', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reading_id: currentReading.reading_id,
                    share_type: shareType,
                    message: `Just completed a ${currentReading.spread_name} reading! ✨`
                })
            });

            if (response.ok && onShareReading) {
                onShareReading(currentReading.reading_id, shareType);
            }
        } catch (error) {
            console.error('Failed to share reading:', error);
        }
    };

    const addReflection = async () => {
        if (!currentReading || !reflectionText.trim()) return;

        try {
            const response = await fetch('/api/v1/tarot/reflection', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reading_id: currentReading.reading_id,
                    reflection: reflectionText.trim(),
                    tags: reflectionTags
                })
            });

            if (response.ok) {
                setReflectionText('');
                setReflectionTags([]);
                // Could update current reading with reflection
            }
        } catch (error) {
            console.error('Failed to add reflection:', error);
        }
    };

    // Memoized calculations
    const selectedSpreadInfo = useMemo(() => {
        return availableSpreads[selectedSpread] || null;
    }, [availableSpreads, selectedSpread]);

    const energyFlowVisualization = useMemo(() => {
        if (!currentReading?.energy_flow) return null;

        const { dominant_element, energy_level, flow_direction } = currentReading.energy_flow;

        return {
            element: dominant_element,
            level: energy_level,
            direction: flow_direction,
            color: {
                fire: '#FF6B6B',
                water: '#4ECDC4',
                air: '#45B7D1',
                earth: '#96CEB4'
            }[dominant_element] || '#888'
        };
    }, [currentReading]);

    // Card display component
    const TarotCardDisplay: React.FC<{
        card: TarotCard;
        position: string;
        index: number;
        isSelected: boolean;
        onSelect: () => void;
    }> = ({ card, position, index, isSelected, onSelect }) => (
        <motion.div
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
            className={`relative cursor-pointer ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
            onClick={onSelect}
        >
            <Card className="h-full min-h-[300px] bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300">
                <CardHeader className="pb-2">
                    <div className="text-center">
                        <Badge variant="outline" className="mb-2 text-xs">
                            {position}
                        </Badge>
                        <h4 className="font-semibold text-sm text-purple-800">
                            {card.name}
                        </h4>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="aspect-[2/3] bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {card.image_url ? (
                            <img
                                src={card.image_url}
                                alt={card.name}
                                className={`w-full h-full object-cover ${card.is_reversed ? 'rotate-180' : ''}`}
                            />
                        ) : (
                            <div className={`text-4xl ${card.is_reversed ? 'rotate-180' : ''}`}>
                                🔮
                            </div>
                        )}
                        {card.is_reversed && (
                            <div className="absolute top-2 right-2">
                                <Badge variant="destructive" className="text-xs">
                                    Reversed
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-purple-600" />
                            <span className="text-xs text-purple-700 font-medium">
                                {card.suit} • {card.element}
                            </span>
                        </div>

                        {card.cosmic_influences && (
                            <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    <span>{card.cosmic_influences.zodiac_association}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{card.cosmic_influences.chakra_connection}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header with cosmic influences */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-bold text-purple-800 flex items-center justify-center gap-2">
                        <Sparkles className="h-8 w-8" />
                        Enhanced Tarot Oracle
                        <Sparkles className="h-8 w-8" />
                    </h1>
                    <p className="text-gray-600">
                        Advanced cosmic readings with AI interpretation • {userZodiac} Energy
                    </p>
                </motion.div>

                {/* Current cosmic influences */}
                {cosmicInfluences && !isLoadingInfluences && (
                    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Moon className="h-4 w-4 text-purple-600" />
                                    <span>{cosmicInfluences.moon_phase?.phase_name || 'New Moon'}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                    <span>Energy: {cosmicInfluences.cosmic_influences?.energy_level || 'Balanced'}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="flex items-center gap-1">
                                    <Compass className="h-4 w-4 text-purple-600" />
                                    <span>{cosmicInfluences.optimal_reading_times?.[0] || 'Anytime'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Main content tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="spread-selection" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Spread Selection
                    </TabsTrigger>
                    <TabsTrigger value="reading-result" disabled={!currentReading} className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Reading
                    </TabsTrigger>
                    <TabsTrigger value="interpretation" disabled={!currentReading} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Interpretation
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        History
                    </TabsTrigger>
                </TabsList>

                {/* Spread Selection Tab */}
                <TabsContent value="spread-selection" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Target className="h-5 w-5 text-purple-600" />
                                Choose Your Cosmic Spread
                            </h2>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Spread selection */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Spread Type</label>
                                    <Select value={selectedSpread} onValueChange={setSelectedSpread}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a tarot spread..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(availableSpreads).map(([key, spread]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{spread.name}</span>
                                                        <Badge variant={spread.difficulty === 'beginner' ? 'default' :
                                                            spread.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                                                            {spread.difficulty}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedSpreadInfo && (
                                    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-purple-800">{selectedSpreadInfo.name}</h3>
                                                <Badge>{selectedSpreadInfo.card_count} cards</Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">{selectedSpreadInfo.description}</p>

                                            {selectedSpreadInfo.cosmic_timing && (
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 text-purple-600" />
                                                        <span>Optimal: {selectedSpreadInfo.cosmic_timing.optimal_time}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Moon className="h-3 w-3 text-purple-600" />
                                                        <span>Moon: {selectedSpreadInfo.cosmic_timing.moon_phase}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Question input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium">Your Question</label>
                                    <Textarea
                                        placeholder="Ask the universe your question... What guidance do you seek?"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        className="min-h-[100px] resize-none"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Be specific and open-hearted. The cosmos responds to sincere inquiry.
                                    </p>
                                </div>

                                {/* Draw button */}
                                <Button
                                    onClick={performTarotReading}
                                    disabled={!selectedSpread || !question.trim() || isDrawing}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                    size="lg"
                                >
                                    {isDrawing ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Drawing Cards...
                                        </>
                                    ) : (
                                        <>
                                            <Shuffle className="h-4 w-4 mr-2" />
                                            Draw Cards & Receive Guidance
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reading Result Tab */}
                <TabsContent value="reading-result" className="space-y-6">
                    {currentReading && (
                        <>
                            {/* Reading header */}
                            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-purple-800">{currentReading.spread_name}</h2>
                                            <p className="text-sm text-gray-600">{currentReading.spread_description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => shareReading('feed')}
                                                className="flex items-center gap-1"
                                            >
                                                <Share2 className="h-3 w-3" />
                                                Share to Feed
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => shareReading('profile')}
                                                className="flex items-center gap-1"
                                            >
                                                <Bookmark className="h-3 w-3" />
                                                Save to Profile
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Energy flow visualization */}
                                    {energyFlowVisualization && (
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: energyFlowVisualization.color }}
                                                />
                                                <span>Dominant Element: {energyFlowVisualization.element}</span>
                                            </div>
                                            <Progress
                                                value={energyFlowVisualization.level}
                                                className="flex-1 h-2"
                                            />
                                            <span>{energyFlowVisualization.level}% Energy</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cards display */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {currentReading.cards.map((card, index) => (
                                        <TarotCardDisplay
                                            key={`${card.id}-${index}`}
                                            card={card}
                                            position={currentReading.positions[index]}
                                            index={index}
                                            isSelected={selectedCardIndex === index}
                                            onSelect={() => setSelectedCardIndex(index)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Card details panel */}
                            {selectedCardIndex !== null && currentReading.cards[selectedCardIndex] && (
                                <Card className="border-purple-200">
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-purple-600" />
                                            {currentReading.cards[selectedCardIndex].name} Details
                                        </h3>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-green-700">Upright Meaning</h4>
                                                <p className="text-sm text-gray-600">
                                                    {currentReading.cards[selectedCardIndex].upright_meaning}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-medium text-red-700">Reversed Meaning</h4>
                                                <p className="text-sm text-gray-600">
                                                    {currentReading.cards[selectedCardIndex].reversed_meaning}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Elemental energies */}
                                        <div className="mt-6">
                                            <h4 className="font-medium mb-3">Elemental Energies</h4>
                                            <div className="grid grid-cols-4 gap-2">
                                                {Object.entries(currentReading.cards[selectedCardIndex].elemental_energy || {}).map(([element, value]) => (
                                                    <div key={element} className="text-center">
                                                        <div className="text-xs text-gray-500 capitalize">{element}</div>
                                                        <Progress value={value as number} className="h-2 mt-1" />
                                                        <div className="text-xs mt-1">{value}%</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Interpretation Tab */}
                <TabsContent value="interpretation" className="space-y-6">
                    {currentReading?.ai_interpretation && (
                        <>
                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        AI Oracle Interpretation
                                    </h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="prose prose-sm max-w-none">
                                        <h4 className="text-purple-700 font-medium">Summary</h4>
                                        <p className="text-gray-700">{currentReading.ai_interpretation.summary}</p>
                                    </div>

                                    <Separator />

                                    <div className="prose prose-sm max-w-none">
                                        <h4 className="text-purple-700 font-medium">Detailed Analysis</h4>
                                        <p className="text-gray-700">{currentReading.ai_interpretation.detailed_analysis}</p>
                                    </div>

                                    {/* Key themes */}
                                    {currentReading.ai_interpretation.key_themes && (
                                        <div>
                                            <h4 className="text-purple-700 font-medium mb-2">Key Themes</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {currentReading.ai_interpretation.key_themes.map((theme, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {theme}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="prose prose-sm max-w-none">
                                        <h4 className="text-purple-700 font-medium">Guidance</h4>
                                        <p className="text-gray-700">{currentReading.ai_interpretation.guidance}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cosmic timing and numerology */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {currentReading.cosmic_timing && (
                                    <Card>
                                        <CardHeader>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-purple-600" />
                                                Cosmic Timing
                                            </h3>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <h4 className="text-sm font-medium text-purple-700 mb-1">Optimal Actions</h4>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {currentReading.cosmic_timing.optimal_actions?.map((action, index) => (
                                                        <li key={index} className="flex items-center gap-2">
                                                            <Zap className="h-3 w-3 text-purple-500" />
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-purple-700 mb-1">Planetary Advice</h4>
                                                <p className="text-sm text-gray-600">{currentReading.cosmic_timing.planetary_advice}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {currentReading.numerology_guidance && (
                                    <Card>
                                        <CardHeader>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Target className="h-4 w-4 text-purple-600" />
                                                Numerology Connection
                                            </h3>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700">{currentReading.numerology_guidance}</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Follow-up recommendations */}
                            {currentReading.follow_up_recommendations && (
                                <Card>
                                    <CardHeader>
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Compass className="h-4 w-4 text-purple-600" />
                                            Recommended Next Steps
                                        </h3>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {currentReading.follow_up_recommendations.map((recommendation, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <Star className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                                                    {recommendation}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Reflection section */}
                            <Card>
                                <CardHeader>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4 text-purple-600" />
                                        Personal Reflection
                                    </h3>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea
                                        placeholder="Add your personal insights and reflections on this reading..."
                                        value={reflectionText}
                                        onChange={(e) => setReflectionText(e.target.value)}
                                        className="min-h-[100px]"
                                    />

                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Add tags (press Enter)"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                    setReflectionTags(prev => [...prev, e.currentTarget.value.trim()]);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={addReflection}
                                            disabled={!reflectionText.trim()}
                                            size="sm"
                                        >
                                            <MessageCircle className="h-3 w-3 mr-1" />
                                            Save Reflection
                                        </Button>
                                    </div>

                                    {reflectionTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {reflectionTags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-xs cursor-pointer"
                                                    onClick={() => setReflectionTags(prev => prev.filter((_, i) => i !== index))}
                                                >
                                                    {tag} ×
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                Reading History
                            </h3>
                        </CardHeader>
                        <CardContent>
                            {readingHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {readingHistory.map((reading) => (
                                        <Card
                                            key={reading.reading_id}
                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => {
                                                setCurrentReading(reading);
                                                setActiveTab('reading-result');
                                            }}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <h4 className="font-medium text-purple-800">{reading.spread_name}</h4>
                                                        <p className="text-sm text-gray-600 truncate max-w-md">
                                                            {reading.ai_interpretation?.summary?.substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-xs text-gray-500">
                                                        <div>{new Date(reading.created_at).toLocaleDateString()}</div>
                                                        <Badge variant="outline" className="mt-1">
                                                            {reading.cards?.length || 0} cards
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No readings yet. Start your cosmic journey!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EnhancedTarotReader;