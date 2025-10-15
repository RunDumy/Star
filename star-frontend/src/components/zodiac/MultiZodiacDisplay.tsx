/**
 * MultiZodiacDisplay.tsx - Main component for STAR Multi-Zodiac System
 * Displays all 5 zodiac traditions with 76+ signs, animations, and cosmic signatures
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import {
    MultiZodiacCalculation,
    MultiZodiacDisplayProps,
    ZodiacSystem,
    ZodiacSystemType
} from '../../lib/zodiac.types';
import { CosmicSignatureView } from './CosmicSignatureView';
import { GalacticTonesWheel } from './GalacticTonesWheel';
import { ZodiacSystemCard } from './ZodiacSystemCard';

const ZODIAC_SYSTEMS: ZodiacSystemType[] = ['western', 'chinese', 'vedic', 'mayan', 'aztec'];

interface MultiZodiacDisplayState {
    loading: boolean;
    error: string | null;
    selectedSystems: Set<ZodiacSystemType>;
    showAnimations: boolean;
    compactMode: boolean;
    calculation?: MultiZodiacCalculation;
}

export const MultiZodiacDisplay: React.FC<MultiZodiacDisplayProps> = ({
    userReading,
    selectedSystems = ZODIAC_SYSTEMS,
    onSystemToggle,
    showAnimations = true,
    compactMode = false,
}) => {
    const [state, setState] = useState<MultiZodiacDisplayState>({
        loading: false,
        error: null,
        selectedSystems: new Set(selectedSystems),
        showAnimations,
        compactMode,
    });

    const [systemsData, setSystemsData] = useState<ZodiacSystem[]>([]);

    // Load zodiac systems data
    useEffect(() => {
        const loadSystemsData = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                const response = await fetch('/api/v1/zodiac/systems');
                const data = await response.json();

                if (data.success) {
                    setSystemsData(data.systems || []);

                    // If userReading exists, extract calculation results
                    if (userReading?.calculation_results) {
                        setState(prev => ({
                            ...prev,
                            calculation: userReading.calculation_results,
                            loading: false
                        }));
                    } else {
                        setState(prev => ({ ...prev, loading: false }));
                    }
                } else {
                    setState(prev => ({
                        ...prev,
                        error: data.error || 'Failed to load zodiac systems',
                        loading: false
                    }));
                }
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    error: 'Network error loading zodiac data',
                    loading: false
                }));
            }
        };

        loadSystemsData();
    }, [userReading]);

    // Handle system toggle
    const handleSystemToggle = (system: ZodiacSystemType) => {
        setState(prev => {
            const newSelected = new Set(prev.selectedSystems);
            if (newSelected.has(system)) {
                newSelected.delete(system);
            } else {
                newSelected.add(system);
            }
            return { ...prev, selectedSystems: newSelected };
        });

        onSystemToggle?.(system);
    };

    // Handle animation toggle
    const toggleAnimations = () => {
        setState(prev => ({
            ...prev,
            showAnimations: !prev.showAnimations
        }));
    };

    // Handle compact mode toggle
    const toggleCompactMode = () => {
        setState(prev => ({
            ...prev,
            compactMode: !prev.compactMode
        }));
    };

    // Calculate percentage of systems displayed
    const systemsPercentage = (state.selectedSystems.size / ZODIAC_SYSTEMS.length) * 100;

    if (state.loading) {
        return (
            <div className="multi-zodiac-display loading">
                <div className="loading-spinner">
                    <motion.div
                        className="cosmic-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        ✨
                    </motion.div>
                    <p>Loading your cosmic profile across 5 zodiac traditions...</p>
                </div>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="multi-zodiac-display error">
                <div className="error-message">
                    <h3>🌙 Cosmic Connection Error</h3>
                    <p>{state.error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="retry-button"
                    >
                        Reconnect to the Cosmos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`multi-zodiac-display ${state.compactMode ? 'compact' : 'expanded'}`}>
            {/* Header with controls */}
            <div className="zodiac-header">
                <div className="title-section">
                    <h1 className="cosmic-title">
                        <motion.span
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            🌟 Multi-Zodiac Cosmic Profile 🌟
                        </motion.span>
                    </h1>
                    <p className="subtitle">
                        {state.calculation?.total_signs || '76+'} Zodiac Signs Across 5 Ancient Traditions
                    </p>
                </div>

                <div className="controls-section">
                    <div className="system-progress">
                        <div className="progress-bar">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${systemsPercentage}%` }}
                                transition={{ duration: 0.8 }}
                            />
                        </div>
                        <span className="progress-text">
                            {state.selectedSystems.size}/5 Systems Active
                        </span>
                    </div>

                    <div className="toggle-buttons">
                        <button
                            onClick={toggleAnimations}
                            className={`toggle-btn ${state.showAnimations ? 'active' : ''}`}
                            title="Toggle Zodiac Animations"
                        >
                            🎭 Animations
                        </button>
                        <button
                            onClick={toggleCompactMode}
                            className={`toggle-btn ${state.compactMode ? 'active' : ''}`}
                            title="Toggle Compact Mode"
                        >
                            📱 Compact
                        </button>
                    </div>
                </div>
            </div>

            {/* System Selection Pills */}
            <div className="system-selector">
                {ZODIAC_SYSTEMS.map((system) => {
                    const isSelected = state.selectedSystems.has(system);
                    const systemData = systemsData.find(s => s.type === system);

                    return (
                        <motion.button
                            key={system}
                            onClick={() => handleSystemToggle(system)}
                            className={`system-pill ${isSelected ? 'selected' : ''} ${system}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: ZODIAC_SYSTEMS.indexOf(system) * 0.1 }}
                        >
                            <span className="system-emoji">
                                {system === 'western' && '♈'}
                                {system === 'chinese' && '🐉'}
                                {system === 'vedic' && '🕉️'}
                                {system === 'mayan' && '🌽'}
                                {system === 'aztec' && '🗿'}
                            </span>
                            <span className="system-name">
                                {system.charAt(0).toUpperCase() + system.slice(1)}
                            </span>
                            {systemData && (
                                <span className="system-count">
                                    {systemData.sign_count} signs
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Cosmic Signature Display (if available) */}
            <AnimatePresence>
                {state.calculation?.cosmic_signature && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="cosmic-signature-section"
                    >
                        <CosmicSignatureView
                            cosmicSignature={state.calculation.cosmic_signature}
                            showDetails={!state.compactMode}
                            interactive={true}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Galactic Tones Wheel (for Mayan/Aztec systems) */}
            <AnimatePresence>
                {(state.selectedSystems.has('mayan') || state.selectedSystems.has('aztec')) &&
                    state.calculation?.mayan?.galactic_tone && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="galactic-tones-section"
                        >
                            <GalacticTonesWheel
                                tones={[state.calculation.mayan.galactic_tone]}
                                selectedTone={state.calculation.mayan.galactic_tone}
                                showLabels={!state.compactMode}
                                size={state.compactMode ? 'small' : 'medium'}
                            />
                        </motion.div>
                    )}
            </AnimatePresence>

            {/* Zodiac Systems Grid */}
            <div className={`zodiac-systems-grid ${state.compactMode ? 'compact-grid' : 'full-grid'}`}>
                <AnimatePresence>
                    {Array.from(state.selectedSystems).map((systemType) => {
                        const systemData = systemsData.find(s => s.type === systemType);
                        const userSign = state.calculation ?
                            getUserSignForSystem(state.calculation, systemType) :
                            undefined;

                        return (
                            <motion.div
                                key={systemType}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                transition={{
                                    duration: 0.5,
                                    delay: Array.from(state.selectedSystems).indexOf(systemType) * 0.1
                                }}
                                className="system-card-container"
                            >
                                {systemData && (
                                    <ZodiacSystemCard
                                        system={systemData}
                                        userSign={userSign}
                                        isExpanded={!state.compactMode}
                                        showAnimation={state.showAnimations}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Summary Stats */}
            {state.calculation && (
                <div className="zodiac-summary">
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total Signs:</span>
                            <span className="stat-value">{state.calculation.total_signs}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Systems Active:</span>
                            <span className="stat-value">{state.selectedSystems.size}/5</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Cosmic Signature:</span>
                            <span className="stat-value">
                                {state.calculation.cosmic_signature?.kin_number || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Styles */}
            <style jsx>{`
        .multi-zodiac-display {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .zodiac-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .cosmic-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }

        .subtitle {
          color: #6b7280;
          font-size: 1.1rem;
        }

        .controls-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: flex-end;
        }

        .progress-bar {
          width: 200px;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
        }

        .progress-text {
          font-size: 0.9rem;
          color: #6b7280;
          margin-top: 5px;
        }

        .toggle-buttons {
          display: flex;
          gap: 10px;
        }

        .toggle-btn {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .toggle-btn:hover {
          border-color: #667eea;
        }

        .toggle-btn.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .system-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 30px;
          justify-content: center;
        }

        .system-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .system-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .system-pill.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .system-pill.western.selected { background: linear-gradient(135deg, #ff6b6b, #ee5a24); }
        .system-pill.chinese.selected { background: linear-gradient(135deg, #feca57, #ff9ff3); }
        .system-pill.vedic.selected { background: linear-gradient(135deg, #48dbfb, #0abde3); }
        .system-pill.mayan.selected { background: linear-gradient(135deg, #1dd1a1, #10ac84); }
        .system-pill.aztec.selected { background: linear-gradient(135deg, #a55eea, #8854d0); }

        .system-emoji {
          font-size: 1.2rem;
        }

        .system-count {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .zodiac-systems-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 30px;
        }

        .full-grid {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        }

        .compact-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .cosmic-signature-section,
        .galactic-tones-section {
          margin: 30px 0;
          padding: 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 15px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .zodiac-summary {
          margin-top: 40px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .summary-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .loading-spinner {
          text-align: center;
          padding: 60px 20px;
        }

        .cosmic-spinner {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .error-message {
          text-align: center;
          padding: 40px 20px;
          color: #dc2626;
        }

        .retry-button {
          margin-top: 15px;
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .zodiac-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .cosmic-title {
            font-size: 2rem;
          }

          .controls-section {
            align-items: center;
            margin-top: 20px;
          }

          .full-grid,
          .compact-grid {
            grid-template-columns: 1fr;
          }

          .summary-stats {
            gap: 20px;
          }
        }

        /* Compact mode adjustments */
        .compact .cosmic-title {
          font-size: 1.8rem;
        }

        .compact .zodiac-systems-grid {
          gap: 15px;
        }

        .compact .system-pill {
          padding: 8px 14px;
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
};

// Helper function to extract user's sign for a specific system
function getUserSignForSystem(calculation: MultiZodiacCalculation, systemType: ZodiacSystemType) {
    switch (systemType) {
        case 'western':
            return calculation.western?.sun_sign;
        case 'chinese':
            return calculation.chinese?.year_sign;
        case 'vedic':
            return calculation.vedic?.rashi;
        case 'mayan':
            return calculation.mayan?.day_sign;
        case 'aztec':
            return calculation.aztec?.day_sign;
        default:
            return undefined;
    }
}

export default MultiZodiacDisplay;