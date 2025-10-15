/**
 * ZodiacSystemCard.tsx - Individual zodiac system display card
 * Shows signs, traits, and animations for each zodiac tradition
 */

'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import {
    ZodiacSystemCardProps,
    ZodiacSystemType
} from '../../lib/zodiac.types';

export const ZodiacSystemCard: React.FC<ZodiacSystemCardProps> = ({
    system,
    userSign,
    isExpanded = true,
    onToggle,
    showAnimation = true,
}) => {
    const [isOpen, setIsOpen] = useState(isExpanded);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        onToggle?.();
    };

    const getSystemIcon = (type: ZodiacSystemType): string => {
        const icons = {
            western: '♈',
            chinese: '🐉',
            vedic: '🕉️',
            mayan: '🌽',
            aztec: '🗿'
        };
        return icons[type] || '⭐';
    };

    const getSystemGradient = (type: ZodiacSystemType): string => {
        const gradients = {
            western: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            chinese: 'linear-gradient(135deg, #feca57, #ff9ff3)',
            vedic: 'linear-gradient(135deg, #48dbfb, #0abde3)',
            mayan: 'linear-gradient(135deg, #1dd1a1, #10ac84)',
            aztec: 'linear-gradient(135deg, #a55eea, #8854d0)'
        };
        return gradients[type] || 'linear-gradient(135deg, #667eea, #764ba2)';
    };

    return (
        <div className={`zodiac-system-card ${system.type} ${isOpen ? 'expanded' : 'collapsed'}`}>
            {/* Header */}
            <div className="card-header" onClick={handleToggle}>
                <div className="system-info">
                    <div className="system-icon" style={{ background: getSystemGradient(system.type) }}>
                        {getSystemIcon(system.type)}
                    </div>
                    <div className="system-details">
                        <h3 className="system-name">{system.name}</h3>
                        <p className="system-origin">{system.cultural_origin}</p>
                        <span className="sign-count">{system.sign_count} signs</span>
                    </div>
                </div>

                {userSign && (
                    <div className="user-sign-preview">
                        <span className="your-sign-label">Your Sign:</span>
                        <span className="sign-name">{userSign.name}</span>
                        <span className="sign-symbol">{userSign.symbol}</span>
                    </div>
                )}

                <motion.div
                    className="expand-icon"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    ▼
                </motion.div>
            </div>

            {/* Expandable Content */}
            <motion.div
                initial={false}
                animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
            >
                <div className="card-content">
                    {/* System Description */}
                    <div className="system-description">
                        <p>{system.description}</p>
                    </div>

                    {/* User Sign Details */}
                    {userSign && (
                        <div className="user-sign-details">
                            <h4>Your {system.name} Profile</h4>

                            <div className="sign-properties">
                                <div className="sign-header">
                                    <span className="sign-symbol-large">{userSign.symbol}</span>
                                    <div>
                                        <h5 className="sign-name-large">{userSign.name}</h5>
                                        {userSign.date_range && (
                                            <p className="date-range">{userSign.date_range}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="properties-grid">
                                    {userSign.element && (
                                        <div className="property-item">
                                            <span className="property-label">Element:</span>
                                            <span className="property-value element">{userSign.element}</span>
                                        </div>
                                    )}

                                    {userSign.quality && (
                                        <div className="property-item">
                                            <span className="property-label">Quality:</span>
                                            <span className="property-value">{userSign.quality}</span>
                                        </div>
                                    )}

                                    {userSign.ruling_planet && (
                                        <div className="property-item">
                                            <span className="property-label">Ruling Planet:</span>
                                            <span className="property-value">{userSign.ruling_planet}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Traits */}
                                <div className="traits-section">
                                    {userSign.personality_traits.length > 0 && (
                                        <div className="trait-category">
                                            <h6>Personality Traits</h6>
                                            <div className="trait-tags">
                                                {userSign.personality_traits.slice(0, 3).map((trait, index) => (
                                                    <span key={index} className="trait-tag personality">{trait}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {userSign.strengths.length > 0 && (
                                        <div className="trait-category">
                                            <h6>Strengths</h6>
                                            <div className="trait-tags">
                                                {userSign.strengths.slice(0, 3).map((strength, index) => (
                                                    <span key={index} className="trait-tag strength">{strength}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {userSign.challenges.length > 0 && (
                                        <div className="trait-category">
                                            <h6>Growth Areas</h6>
                                            <div className="trait-tags">
                                                {userSign.challenges.slice(0, 2).map((challenge, index) => (
                                                    <span key={index} className="trait-tag challenge">{challenge}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Colors and Gems */}
                                {(userSign.colors.length > 0 || userSign.gems.length > 0) && (
                                    <div className="mystic-properties">
                                        {userSign.colors.length > 0 && (
                                            <div className="color-palette">
                                                <h6>Lucky Colors</h6>
                                                <div className="color-swatches">
                                                    {userSign.colors.slice(0, 4).map((color, index) => (
                                                        <div
                                                            key={index}
                                                            className="color-swatch"
                                                            style={{ backgroundColor: color.toLowerCase() }}
                                                            title={color}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {userSign.gems.length > 0 && (
                                            <div className="gems-section">
                                                <h6>Power Stones</h6>
                                                <div className="gem-list">
                                                    {userSign.gems.slice(0, 3).map((gem, index) => (
                                                        <span key={index} className="gem-item">💎 {gem}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Animation Trigger (if enabled) */}
                    {showAnimation && userSign && (
                        <div className="animation-section">
                            <button className="animation-trigger">
                                ✨ Activate {userSign.name} Energy
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* CSS Styles */}
            <style jsx>{`
        .zodiac-system-card {
          background: white;
          border-radius: 15px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .zodiac-system-card:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          cursor: pointer;
          background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%);
        }

        .system-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .system-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          font-weight: bold;
        }

        .system-details h3 {
          margin: 0 0 5px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
        }

        .system-origin {
          margin: 0 0 5px 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .sign-count {
          font-size: 0.8rem;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .user-sign-preview {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }

        .your-sign-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .sign-name {
          font-weight: 600;
          color: #1f2937;
        }

        .sign-symbol {
          font-size: 1.5rem;
          margin-left: 8px;
        }

        .expand-icon {
          color: #9ca3af;
          font-size: 1.2rem;
          margin-left: 15px;
        }

        .card-content {
          padding: 0 20px 20px 20px;
        }

        .system-description {
          margin-bottom: 20px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 10px;
          border-left: 4px solid ${getSystemGradient(system.type)};
        }

        .system-description p {
          margin: 0;
          color: #4b5563;
          line-height: 1.5;
        }

        .user-sign-details {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        .user-sign-details h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .sign-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .sign-symbol-large {
          font-size: 2.5rem;
        }

        .sign-name-large {
          margin: 0 0 5px 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
        }

        .date-range {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }

        .property-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .property-label {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .property-value {
          font-weight: 500;
          color: #1f2937;
        }

        .property-value.element {
          text-transform: capitalize;
          color: #667eea;
        }

        .traits-section {
          margin-bottom: 20px;
        }

        .trait-category {
          margin-bottom: 15px;
        }

        .trait-category h6 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #4b5563;
          font-weight: 600;
        }

        .trait-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .trait-tag {
          padding: 4px 10px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .trait-tag.personality {
          background: #e0f2fe;
          color: #0277bd;
        }

        .trait-tag.strength {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .trait-tag.challenge {
          background: #fff3e0;
          color: #ef6c00;
        }

        .mystic-properties {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }

        .color-palette h6,
        .gems-section h6 {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: #4b5563;
          font-weight: 600;
        }

        .color-swatches {
          display: flex;
          gap: 6px;
        }

        .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .gem-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .gem-item {
          font-size: 0.85rem;
          color: #4b5563;
        }

        .animation-section {
          text-align: center;
          margin-top: 15px;
        }

        .animation-trigger {
          background: ${getSystemGradient(system.type)};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .animation-trigger:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        /* System-specific styles */
        .zodiac-system-card.western {
          border-left: 4px solid #ff6b6b;
        }

        .zodiac-system-card.chinese {
          border-left: 4px solid #feca57;
        }

        .zodiac-system-card.vedic {
          border-left: 4px solid #48dbfb;
        }

        .zodiac-system-card.mayan {
          border-left: 4px solid #1dd1a1;
        }

        .zodiac-system-card.aztec {
          border-left: 4px solid #a55eea;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .user-sign-preview {
            align-items: flex-start;
          }

          .properties-grid {
            grid-template-columns: 1fr;
          }

          .mystic-properties {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default ZodiacSystemCard;