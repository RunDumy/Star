/**
 * CosmicSignatureView.tsx - Displays Mayan/Aztec cosmic signature
 * Shows Day Sign + Galactic Tone combination and oracle family
 */

'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { CosmicSignatureViewProps } from '../../lib/zodiac.types';

export const CosmicSignatureView: React.FC<CosmicSignatureViewProps> = ({
    cosmicSignature,
    showDetails = true,
    interactive = false,
    onKinClick,
}) => {
    const [activeOracle, setActiveOracle] = useState<string | null>(null);

    const handleKinClick = () => {
        if (interactive && onKinClick) {
            onKinClick(cosmicSignature.kin_number);
        }
    };

    const handleOracleClick = (oracleType: string) => {
        if (interactive) {
            setActiveOracle(activeOracle === oracleType ? null : oracleType);
        }
    };

    const getOracleIcon = (type: string): string => {
        const icons = {
            guide: '🌟',
            analog: '🔄',
            antipode: '⚖️',
            occult: '🔮'
        };
        return icons[type] || '✨';
    };

    const getOracleDescription = (type: string): string => {
        const descriptions = {
            guide: 'Your guiding energy that leads the way',
            analog: 'Your supportive ally and equal power',
            antipode: 'Your challenging teacher and strengthener',
            occult: 'Your hidden power and mystical gift'
        };
        return descriptions[type] || '';
    };

    return (
        <div className="cosmic-signature-view">
            <div className="signature-header">
                <h2 className="cosmic-title">
                    <span className="title-icon">🌌</span>
                    Cosmic Signature
                </h2>
                <p className="subtitle">
                    Your Sacred Calendar Position in the 260-Day Tzolkin Cycle
                </p>
            </div>

            {/* Main Signature Display */}
            <div className="signature-main">
                <div
                    className={`kin-display ${interactive ? 'interactive' : ''}`}
                    onClick={handleKinClick}
                >
                    <div className="kin-number">
                        <span className="kin-label">Kin</span>
                        <span className="kin-value">{cosmicSignature.kin_number}</span>
                        <span className="kin-total">/ 260</span>
                    </div>

                    <div className="signature-components">
                        <div className="day-sign-section">
                            <div className="day-sign">
                                <span className="sign-symbol">{cosmicSignature.day_sign.symbol}</span>
                                <h3 className="sign-name">{cosmicSignature.day_sign.name}</h3>
                                <p className="sign-maya-name">{cosmicSignature.day_sign.maya_name}</p>
                            </div>
                        </div>

                        <div className="tone-connector">
                            <div className="connector-line" />
                            <span className="plus-symbol">+</span>
                            <div className="connector-line" />
                        </div>

                        <div className="galactic-tone-section">
                            <div className="galactic-tone">
                                <span className="tone-number">{cosmicSignature.galactic_tone.tone_number}</span>
                                <h3 className="tone-name">{cosmicSignature.galactic_tone.name}</h3>
                                <p className="tone-keyword">{cosmicSignature.galactic_tone.keyword}</p>
                            </div>
                        </div>
                    </div>

                    <div className="signature-phrase">
                        <p>"{cosmicSignature.signature_phrase}"</p>
                    </div>
                </div>

                {/* Wavespell Position */}
                <div className="wavespell-info">
                    <div className="position-indicator">
                        <span className="position-label">Wavespell Position:</span>
                        <span className="position-value">{cosmicSignature.wavespell_position}/13</span>
                    </div>
                    <div className="castle-indicator">
                        <span className="castle-label">Castle:</span>
                        <span className={`castle-value ${cosmicSignature.castle_position}`}>
                            {cosmicSignature.castle_position.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Oracle Family (detailed view) */}
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="oracle-family"
                >
                    <h3 className="oracle-title">Oracle Family</h3>
                    <p className="oracle-subtitle">
                        The four archetypal energies that guide your cosmic signature
                    </p>

                    <div className="oracle-grid">
                        {Object.entries(cosmicSignature.oracle_family).map(([type, value]) => (
                            <motion.div
                                key={type}
                                className={`oracle-card ${type} ${activeOracle === type ? 'active' : ''}`}
                                onClick={() => handleOracleClick(type)}
                                whileHover={{ scale: interactive ? 1.05 : 1 }}
                                whileTap={{ scale: interactive ? 0.95 : 1 }}
                            >
                                <div className="oracle-icon">{getOracleIcon(type)}</div>
                                <h4 className="oracle-type">{type.toUpperCase()}</h4>
                                <p className="oracle-value">{value}</p>
                                {interactive && activeOracle === type && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="oracle-description"
                                    >
                                        {getOracleDescription(type)}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Meditation Focus */}
            {showDetails && cosmicSignature.meditation_focus && (
                <div className="meditation-section">
                    <h4 className="meditation-title">
                        <span className="meditation-icon">🧘‍♀️</span>
                        Today's Meditation Focus
                    </h4>
                    <p className="meditation-text">{cosmicSignature.meditation_focus}</p>
                </div>
            )}

            {/* CSS Styles */}
            <style jsx>{`
        .cosmic-signature-view {
          max-width: 800px;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        .signature-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .cosmic-title {
          font-size: 2.2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .title-icon {
          font-size: 2rem;
        }

        .subtitle {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0;
        }

        .signature-main {
          background: linear-gradient(135deg, rgba(29, 209, 161, 0.1) 0%, rgba(16, 172, 132, 0.1) 100%);
          border-radius: 20px;
          padding: 30px;
          border: 2px solid rgba(29, 209, 161, 0.2);
          margin-bottom: 30px;
        }

        .kin-display {
          text-align: center;
          margin-bottom: 20px;
        }

        .kin-display.interactive {
          cursor: pointer;
          transition: transform 0.2s;
        }

        .kin-display.interactive:hover {
          transform: scale(1.02);
        }

        .kin-number {
          margin-bottom: 30px;
        }

        .kin-label {
          display: block;
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 5px;
        }

        .kin-value {
          font-size: 4rem;
          font-weight: 700;
          color: #1dd1a1;
          margin: 0 10px;
        }

        .kin-total {
          font-size: 1.5rem;
          color: #9ca3af;
        }

        .signature-components {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .day-sign-section,
        .galactic-tone-section {
          flex: 1;
          min-width: 200px;
          text-align: center;
        }

        .day-sign,
        .galactic-tone {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }

        .sign-symbol,
        .tone-number {
          font-size: 3rem;
          display: block;
          margin-bottom: 10px;
        }

        .tone-number {
          font-weight: 700;
          color: #1dd1a1;
        }

        .sign-name,
        .tone-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .sign-maya-name,
        .tone-keyword {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }

        .tone-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .connector-line {
          width: 2px;
          height: 30px;
          background: linear-gradient(to bottom, #1dd1a1, #10ac84);
        }

        .plus-symbol {
          font-size: 2rem;
          color: #1dd1a1;
          font-weight: bold;
        }

        .signature-phrase {
          background: rgba(255,255,255,0.8);
          border-radius: 10px;
          padding: 15px 20px;
          border-left: 4px solid #1dd1a1;
        }

        .signature-phrase p {
          margin: 0;
          font-size: 1.1rem;
          color: #374151;
          font-style: italic;
          text-align: center;
        }

        .wavespell-info {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .position-indicator,
        .castle-indicator {
          text-align: center;
        }

        .position-label,
        .castle-label {
          display: block;
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 5px;
        }

        .position-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
        }

        .castle-value {
          font-size: 1.2rem;
          font-weight: 600;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 15px;
        }

        .castle-value.red { background: #fee2e2; color: #dc2626; }
        .castle-value.white { background: #f3f4f6; color: #374151; }
        .castle-value.blue { background: #dbeafe; color: #2563eb; }
        .castle-value.yellow { background: #fef3c7; color: #d97706; }
        .castle-value.green { background: #dcfce7; color: #16a34a; }

        .oracle-family {
          margin-bottom: 30px;
        }

        .oracle-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          margin-bottom: 10px;
        }

        .oracle-subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 25px;
        }

        .oracle-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
        }

        .oracle-card {
          background: white;
          border-radius: 12px;
          padding: 20px 15px;
          text-align: center;
          border: 2px solid #e5e7eb;
          transition: all 0.2s;
          cursor: ${interactive ? 'pointer' : 'default'};
        }

        .oracle-card:hover {
          border-color: #1dd1a1;
          box-shadow: 0 4px 12px rgba(29, 209, 161, 0.2);
        }

        .oracle-card.active {
          border-color: #1dd1a1;
          background: linear-gradient(135deg, rgba(29, 209, 161, 0.05) 0%, rgba(16, 172, 132, 0.05) 100%);
        }

        .oracle-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .oracle-type {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
          letter-spacing: 0.5px;
        }

        .oracle-value {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .oracle-description {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          font-size: 0.8rem;
          color: #4b5563;
          line-height: 1.4;
        }

        .meditation-section {
          background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(109, 40, 217, 0.1) 100%);
          border-radius: 15px;
          padding: 25px;
          border: 1px solid rgba(147, 51, 234, 0.2);
        }

        .meditation-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 15px 0;
        }

        .meditation-icon {
          font-size: 1.5rem;
        }

        .meditation-text {
          text-align: center;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
          font-style: italic;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .cosmic-title {
            font-size: 1.8rem;
          }

          .signature-components {
            flex-direction: column;
            gap: 20px;
          }

          .tone-connector {
            flex-direction: row;
            width: 100%;
          }

          .connector-line {
            flex: 1;
            height: 2px;
            width: auto;
          }

          .kin-value {
            font-size: 3rem;
          }

          .wavespell-info {
            gap: 20px;
          }

          .oracle-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .signature-main {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .oracle-grid {
            grid-template-columns: 1fr;
          }
          
          .cosmic-title {
            font-size: 1.5rem;
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
        </div>
    );
};

export default CosmicSignatureView;