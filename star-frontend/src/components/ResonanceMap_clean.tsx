'use client';

import React, { useEffect, useState } from 'react';

interface MoodState {
    primary: string;
    intensity: number;
    elements: string[];
    zodiacInfluence: string;
}

interface ResonancePoint {
    id: string;
    x: number;
    y: number;
    intensity: number;
    element: string;
    timestamp: number;
    mood: string;
}

interface ResonanceMapProps {
    resonanceMap: any;
    cosmicUI?: any;
    currentMood?: MoodState;
    width?: number;
    height?: number;
}

const ResonanceMap: React.FC<ResonanceMapProps> = ({
    resonanceMap,
    cosmicUI,
    currentMood = { primary: 'balanced', intensity: 5, elements: ['spirit'], zodiacInfluence: 'neutral' },
    width = 400,
    height = 300
}) => {
    const [resonancePoints, setResonancePoints] = useState<ResonancePoint[]>([]);
    const [selectedAspect, setSelectedAspect] = useState<string | null>(null);
    const [activeConnections, setActiveConnections] = useState<Array<{ from: ResonancePoint; to: ResonancePoint; strength: number }>>([]);
    const [energyFlow, setEnergyFlow] = useState<string>('balanced');

    const aspects = ['life_path', 'destiny', 'soul_urge', 'personality', 'birth_day'] as const;

    const aspectTitles = {
        life_path: 'Life Path',
        destiny: 'Destiny',
        soul_urge: 'Soul Urge',
        personality: 'Personality',
        birth_day: 'Birth Day'
    };

    const aspectIcons = {
        life_path: '🌟',
        destiny: '✨',
        soul_urge: '💫',
        personality: '🎭',
        birth_day: '🌙'
    };

    // Element colors for visualization
    const elementColors = {
        fire: '#ff6b35',
        water: '#42a5f5',
        air: '#29b6f6',
        earth: '#8bc34a',
        spirit: '#ab47bc'
    };

    const getPosition = (index: number, total: number) => {
        const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
        const radius = 120;
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    };

    const ResonancePoint = ({
        aspect,
        index,
        total
    }: {
        aspect: keyof typeof resonanceMap;
        index: number;
        total: number;
    }) => {
        if (!resonanceMap || !resonanceMap[aspect]) return null;

        const data = resonanceMap[aspect];
        const cosmicData = cosmicUI?.[aspect];
        const position = getPosition(index, total);
        const isSelected = selectedAspect === aspect;

        return (
            <g>
                {/* Connection lines when aspect is selected */}
                {isSelected && aspects.map((otherAspect, otherIndex) => {
                    if (otherAspect !== aspect && resonanceMap[otherAspect]) {
                        const pos = getPosition(otherIndex, total);
                        const strength = (data.number || 0) * 5; // Line thickness based on number

                        return (
                            <line
                                key={`${aspect}-${otherAspect}`}
                                x1={position.x}
                                y1={position.y}
                                x2={pos.x}
                                y2={pos.y}
                                stroke={cosmicData?.colors?.glow || '#00bcd4'}
                                strokeWidth={0.5 + (strength / 10)}
                                opacity={0.6}
                                className="animate-pulse"
                            />
                        );
                    }
                    return null;
                })}

                {/* Main resonance point */}
                <circle
                    cx={position.x}
                    cy={position.y}
                    r={isSelected ? 25 : 15}
                    fill={cosmicData?.colors?.primary || '#FACC15'}
                    stroke={cosmicData?.colors?.secondary || '#FEF08A'}
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setSelectedAspect(isSelected ? null : aspect)}
                >
                    <title>{aspectTitles[aspect]}: {data.number}</title>
                </circle>

                {/* Icon on the point */}
                <text
                    x={position.x}
                    y={position.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs cursor-pointer select-none"
                    onClick={() => setSelectedAspect(isSelected ? null : aspect)}
                >
                    {aspectIcons[aspect]}
                </text>

                {/* Resonance strength indicator */}
                <circle
                    cx={position.x}
                    cy={position.y}
                    r={35}
                    fill="none"
                    stroke={cosmicData?.colors?.glow || '#00bcd4'}
                    strokeWidth={1}
                    strokeDasharray={3}
                    opacity={isSelected ? 1 : (data.number || 0) / 33}
                    className="animate-pulse"
                />

                {/* Element/Planet labels */}
                {isSelected && (
                    <g>
                        <text
                            x={position.x}
                            y={position.y - 45}
                            textAnchor="middle"
                            className="text-xs text-star-white font-semibold fill-current"
                        >
                            {aspectTitles[aspect]}
                        </text>
                        <text
                            x={position.x}
                            y={position.y + 35}
                            textAnchor="middle"
                            className="text-xs text-cosmic-glow font-semibold fill-current"
                        >
                            {data.number}
                        </text>
                        <text
                            x={position.x}
                            y={position.y + 50}
                            textAnchor="middle"
                            className="text-xs text-gray-300 fill-current"
                        >
                            {data.planet}/{data.element}
                        </text>
                    </g>
                )}
            </g>
        );
    };

    // Add new resonance point when mood changes
    useEffect(() => {
        if (currentMood.primary) {
            const newPoint: ResonancePoint = {
                id: `point_${Date.now()}`,
                x: Math.random() * (width - 40) + 20,
                y: Math.random() * (height - 40) + 20,
                intensity: currentMood.intensity,
                element: currentMood.elements[0] || 'spirit',
                timestamp: Date.now(),
                mood: currentMood.primary
            };

            setResonancePoints(prev => {
                const updated = [...prev, newPoint];
                // Keep only last 12 points
                return updated.slice(-12);
            });
        }
    }, [currentMood, width, height]);

    if (!resonanceMap) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-starlight mb-3">Cosmic Resonance Map</h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Loading resonance data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-starlight mb-3">Cosmic Resonance Map</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                    Explore the harmonic connections between your archetypal aspects.
                    Click on any point to reveal its planetary correspondences and see how energies flow through your cosmic self.
                </p>
            </div>

            {/* SVG Resonance Map */}
            <div className="bg-gradient-to-br from-cosmic-deep/50 to-cosmic-purple/20 rounded-xl p-8 border border-cosmic-glow/30 mb-6">
                <svg viewBox="-180 -180 360 360" className="w-full h-96 max-w-lg mx-auto">
                    {/* Background circles */}
                    <circle cx="0" cy="0" r="150" fill="none" stroke="#4a0e4e" strokeWidth="1" opacity="0.3" />
                    <circle cx="0" cy="0" r="120" fill="none" stroke="#00bcd4" strokeWidth="1" opacity="0.2" />
                    <circle cx="0" cy="0" r="90" fill="none" stroke="#00bcd4" strokeWidth="1" opacity="0.15" />
                    <circle cx="0" cy="0" r="60" fill="none" stroke="#00bcd4" strokeWidth="1" opacity="0.1" />
                    <circle cx="0" cy="0" r="30" fill="none" stroke="#00bcd4" strokeWidth="1" opacity="0.05" />

                    {/* Center glow */}
                    <defs>
                        <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FACC15" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#FACC15" stopOpacity="0.1" />
                        </radialGradient>
                    </defs>
                    <circle cx="0" cy="0" r="20" fill="url(#centerGradient)" className="animate-pulse" />

                    {/* Resonance Points */}
                    {aspects.map((aspect, index) => (
                        <ResonancePoint
                            key={aspect}
                            aspect={aspect}
                            index={index}
                            total={aspects.length}
                        />
                    ))}
                </svg>
            </div>

            {/* Detailed Information Panel */}
            {selectedAspect && resonanceMap[selectedAspect as keyof typeof resonanceMap] && (
                <div className="bg-gradient-to-r from-cosmic-deep to-cosmic-purple/20 rounded-xl p-6 border border-cosmic-glow/30">
                    <h3 className="text-xl font-semibold text-starlight mb-4 text-center">
                        {aspectIcons[selectedAspect as keyof typeof aspectIcons]} {aspectTitles[selectedAspect as keyof typeof aspectTitles]} Resonance
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(() => {
                            const data = resonanceMap[selectedAspect as keyof typeof resonanceMap];
                            const cosmicData = cosmicUI?.[selectedAspect as keyof typeof cosmicUI];

                            return [
                                {
                                    title: 'Core Number',
                                    value: data.number,
                                    color: 'text-yellow-400'
                                },
                                {
                                    title: 'Planet',
                                    value: data.planet,
                                    color: 'text-blue-400'
                                },
                                {
                                    title: 'Element',
                                    value: data.element,
                                    color: 'text-orange-400'
                                }
                            ].map((item, index) => (
                                <div key={index} className="text-center p-4 bg-cosmic-purple/10 rounded-lg">
                                    <div className="text-xs text-gray-300 mb-1">{item.title}</div>
                                    <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                                </div>
                            ));
                        })()}
                    </div>

                    {/* Mystical Interpretation */}
                    {(() => {
                        const data = resonanceMap[selectedAspect as keyof typeof resonanceMap];
                        return (
                            <div className="md:col-span-3 text-center p-4 bg-cosmic-gold/10 rounded-lg border border-cosmic-gold/30">
                                <div className="text-sm text-cosmic-glow italic">
                                    "{data.poetic_description || `Your ${aspectTitles[selectedAspect as keyof typeof aspectTitles].toLowerCase()} resonates with the mystique of ${data.planet}, carrying the elemental force of ${data.element}.`}"
                                </div>
                                {data.karmic_ritual && (
                                    <div className="mt-3 text-xs text-red-300 border-t border-red-300/30 pt-2">
                                        <strong>Karmic Ritual:</strong> {data.karmic_ritual.ritual}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Instructions */}
            {!selectedAspect && (
                <div className="text-center text-gray-400 text-sm">
                    Click on any star to explore its cosmic resonance and planetary influences.
                </div>
            )}
        </div>
    );
};

export default ResonanceMap;