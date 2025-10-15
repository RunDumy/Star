/**
 * GalacticTonesWheel.tsx - Interactive wheel displaying 13 Galactic Tones
 * Sacred Mayan/Aztec calendar tones with visual representation
 */

'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { GalacticTone, GalacticTonesWheelProps } from '../../lib/zodiac.types';

export const GalacticTonesWheel: React.FC<GalacticTonesWheelProps> = ({
    tones,
    selectedTone,
    onToneSelect,
    showLabels = true,
    size = 'medium',
}) => {
    const [activeTone, setActiveTone] = useState<GalacticTone | undefined>(selectedTone);
    const [isRotating, setIsRotating] = useState(false);

    // Update active tone when selectedTone prop changes
    useEffect(() => {
        setActiveTone(selectedTone);
    }, [selectedTone]);

    const handleToneClick = (tone: GalacticTone) => {
        setActiveTone(tone);
        onToneSelect?.(tone);

        // Trigger rotation animation
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 600);
    };

    // Calculate wheel dimensions based on size
    const getWheelSize = () => {
        const sizes = {
            small: { radius: 120, center: 140, toneSize: 30 },
            medium: { radius: 160, center: 180, toneSize: 40 },
            large: { radius: 200, center: 220, toneSize: 50 }
        };
        return sizes[size];
    };

    const { radius, center, toneSize } = getWheelSize();

    // Calculate position for each tone around the circle
    const calculateTonePosition = (index: number, total: number = 13) => {
        const angle = (index * 360) / total - 90; // Start from top (-90 degrees)
        const radian = (angle * Math.PI) / 180;
        const x = center + radius * Math.cos(radian);
        const y = center + radius * Math.sin(radian);
        return { x, y, angle };
    };

    // Get tone color based on chakra association or default gradient
    const getToneColor = (tone: GalacticTone): string => {
        const colors = {
            1: '#ff4757', // Red - Root
            2: '#ff6348', // Orange - Sacral  
            3: '#ffa502', // Yellow - Solar Plexus
            4: '#2ed573', // Green - Heart
            5: '#1e90ff', // Blue - Throat
            6: '#5352ed', // Indigo - Third Eye
            7: '#a55eea', // Violet - Crown
            8: '#ff9f43', // Gold - Higher Crown
            9: '#0abde3', // Turquoise - Thymus
            10: '#ee5a6f', // Coral - Solar Plexus
            11: '#778beb', // Spectral - Crown
            12: '#f8b500', // Crystal - All Chakras
            13: '#2f3542'  // Cosmic - Beyond Chakras
        };
        return colors[tone.tone_number] || '#667eea';
    };

    // Get tone symbol/glyph
    const getToneSymbol = (toneNumber: number): string => {
        const symbols = {
            1: '●', 2: '●●', 3: '●●●', 4: '◊', 5: '|||',
            6: '☰', 7: '◈', 8: '※', 9: '◉', 10: '⬢',
            11: '✱', 12: '◈', 13: '⬢'
        };
        return symbols[toneNumber] || '●';
    };

    return (
        <div className="galactic-tones-wheel">
            <div className="wheel-header">
                <h3 className="wheel-title">
                    <span className="title-icon">🌌</span>
                    13 Galactic Tones
                </h3>
                <p className="wheel-subtitle">Sacred Frequencies of Creation</p>
            </div>

            <div className="wheel-container">
                <svg
                    width={center * 2}
                    height={center * 2}
                    className="tones-wheel-svg"
                >
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius + 20}
                        fill="none"
                        stroke="rgba(102, 126, 234, 0.1)"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />

                    {/* Center energy point */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r="15"
                        fill="url(#centerGradient)"
                        animate={{
                            scale: isRotating ? [1, 1.2, 1] : 1,
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                            duration: isRotating ? 0.6 : 2,
                            repeat: isRotating ? 0 : Infinity
                        }}
                    />

                    {/* Gradient definitions */}
                    <defs>
                        <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#764ba2" />
                        </radialGradient>

                        {tones.map((tone) => (
                            <radialGradient key={tone.id} id={`toneGradient${tone.tone_number}`}>
                                <stop offset="0%" stopColor={getToneColor(tone)} stopOpacity="0.8" />
                                <stop offset="100%" stopColor={getToneColor(tone)} stopOpacity="0.3" />
                            </radialGradient>
                        ))}
                    </defs>

                    {/* Tone positions around the wheel */}
                    {tones.map((tone, index) => {
                        const position = calculateTonePosition(index, tones.length);
                        const isActive = activeTone?.tone_number === tone.tone_number;

                        return (
                            <g key={tone.id}>
                                {/* Connection line to center */}
                                <motion.line
                                    x1={center}
                                    y1={center}
                                    x2={position.x}
                                    y2={position.y}
                                    stroke={getToneColor(tone)}
                                    strokeWidth={isActive ? "3" : "1"}
                                    strokeOpacity={isActive ? 0.6 : 0.2}
                                    initial={{ pathLength: 0 }}
                                    animate={{
                                        pathLength: 1,
                                        strokeOpacity: isActive ? 0.6 : 0.2
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1
                                    }}
                                />

                                {/* Tone circle */}
                                <motion.circle
                                    cx={position.x}
                                    cy={position.y}
                                    r={isActive ? toneSize + 5 : toneSize}
                                    fill={`url(#toneGradient${tone.tone_number})`}
                                    stroke={getToneColor(tone)}
                                    strokeWidth={isActive ? "3" : "2"}
                                    className="tone-circle interactive"
                                    onClick={() => handleToneClick(tone)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    animate={{
                                        scale: isActive ? [1, 1.1, 1] : 1,
                                        rotate: isRotating ? 360 : 0
                                    }}
                                    transition={{
                                        scale: { duration: 0.3 },
                                        rotate: { duration: 0.6 }
                                    }}
                                />

                                {/* Tone number */}
                                <text
                                    x={position.x}
                                    y={position.y + 6}
                                    textAnchor="middle"
                                    className={`tone-number ${isActive ? 'active' : ''}`}
                                    onClick={() => handleToneClick(tone)}
                                >
                                    {tone.tone_number}
                                </text>

                                {/* Tone symbol */}
                                <text
                                    x={position.x}
                                    y={position.y - 8}
                                    textAnchor="middle"
                                    className="tone-symbol"
                                    onClick={() => handleToneClick(tone)}
                                >
                                    {getToneSymbol(tone.tone_number)}
                                </text>

                                {/* Tone label (if enabled and not small size) */}
                                {showLabels && size !== 'small' && (
                                    <text
                                        x={position.x}
                                        y={position.y + (toneSize + 25)}
                                        textAnchor="middle"
                                        className="tone-label"
                                        onClick={() => handleToneClick(tone)}
                                    >
                                        {tone.name}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Selected tone details */}
                {activeTone && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="active-tone-details"
                    >
                        <div className="tone-info">
                            <div className="tone-header">
                                <span
                                    className="tone-color-indicator"
                                    style={{ backgroundColor: getToneColor(activeTone) }}
                                />
                                <div>
                                    <h4 className="active-tone-name">
                                        Tone {activeTone.tone_number}: {activeTone.name}
                                    </h4>
                                    {activeTone.maya_name && (
                                        <p className="maya-name">{activeTone.maya_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="tone-properties">
                                <div className="property-item">
                                    <span className="property-label">Keyword:</span>
                                    <span className="property-value">{activeTone.keyword}</span>
                                </div>

                                <div className="property-item">
                                    <span className="property-label">Energy:</span>
                                    <span className="property-value">{activeTone.energy_type}</span>
                                </div>

                                {activeTone.chakra_association && (
                                    <div className="property-item">
                                        <span className="property-label">Chakra:</span>
                                        <span className="property-value">{activeTone.chakra_association}</span>
                                    </div>
                                )}
                            </div>

                            <div className="tone-descriptions">
                                {activeTone.power_description && (
                                    <p className="description-item">
                                        <strong>Power:</strong> {activeTone.power_description}
                                    </p>
                                )}

                                {activeTone.action_phrase && (
                                    <p className="description-item">
                                        <strong>Action:</strong> {activeTone.action_phrase}
                                    </p>
                                )}

                                {activeTone.essence_phrase && (
                                    <p className="description-item">
                                        <strong>Essence:</strong> {activeTone.essence_phrase}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* CSS Styles */}
            <style jsx>{`
        .galactic-tones-wheel {
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        .wheel-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .wheel-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .title-icon {
          font-size: 1.5rem;
        }

        .wheel-subtitle {
          color: #6b7280;
          font-size: 1rem;
          margin: 0;
          font-style: italic;
        }

        .wheel-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tones-wheel-svg {
          margin-bottom: 20px;
        }

        .tone-circle {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tone-circle:hover {
          filter: brightness(1.1);
        }

        .tone-number {
          font-size: ${size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px'};
          font-weight: 600;
          fill: white;
          cursor: pointer;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .tone-number.active {
          font-size: ${size === 'small' ? '14px' : size === 'medium' ? '16px' : '18px'};
        }

        .tone-symbol {
          font-size: ${size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px'};
          fill: white;
          cursor: pointer;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .tone-label {
          font-size: ${size === 'medium' ? '11px' : '12px'};
          fill: #4b5563;
          cursor: pointer;
          font-weight: 500;
        }

        .active-tone-details {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 2px solid rgba(102, 126, 234, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .tone-info {
          text-align: center;
        }

        .tone-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .tone-color-indicator {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .active-tone-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 5px 0;
        }

        .maya-name {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }

        .tone-properties {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .property-item {
          text-align: left;
          padding: 10px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .property-label {
          display: block;
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 3px;
        }

        .property-value {
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 500;
        }

        .tone-descriptions {
          text-align: left;
        }

        .description-item {
          margin: 0 0 12px 0;
          line-height: 1.4;
          color: #4b5563;
          font-size: 0.9rem;
        }

        .description-item:last-child {
          margin-bottom: 0;
        }

        .description-item strong {
          color: #1f2937;
        }

        /* Size-specific adjustments */
        .galactic-tones-wheel.small .wheel-title {
          font-size: 1.3rem;
        }

        .galactic-tones-wheel.small .active-tone-details {
          padding: 15px;
        }

        .galactic-tones-wheel.large .wheel-title {
          font-size: 2.2rem;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .wheel-title {
            font-size: 1.5rem;
          }

          .active-tone-details {
            padding: 20px;
          }

          .tone-properties {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .property-item {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .tones-wheel-svg {
            width: 100%;
            height: auto;
          }
          
          .wheel-title {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
        </div>
    );
};

export default GalacticTonesWheel;