import React, { useEffect, useState } from 'react';
import './ZodiacDashboard.css';

interface ZodiacData {
    western_sign?: string;
    chinese_sign?: string;
    vedic_sign?: string;
    mayan_sign?: string;
    aztec_sign?: string;
    cosmic_signature?: {
        day_sign: string;
        galactic_tone: string;
        kin_number: number;
    };
    birth_chart?: any;
    compatibility?: any;
}

interface Props {
    zodiacData: ZodiacData | null;
    cosmicSignature: string | null;
    onShareCosmicSignature?: (signature: string) => void;
}

const ZodiacDashboard: React.FC<Props> = ({
    zodiacData,
    cosmicSignature,
    onShareCosmicSignature
}) => {
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [shareStatus, setShareStatus] = useState<string>('');
    const [animationTrigger, setAnimationTrigger] = useState<number>(0);

    // Trigger animation when cosmic signature changes
    useEffect(() => {
        if (cosmicSignature) {
            setAnimationTrigger(prev => prev + 1);
        }
    }, [cosmicSignature]);

    const handleShareToX = (content: string, signature?: string) => {
        const shareText = signature ?
            `🌟 My Cosmic Signature: ${signature} ✨\n${content}` :
            `🌌 ${content}`;
        const url = 'http://localhost:5000';
        const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${url}`;

        window.open(twitterUrl, '_blank');
        setShareStatus('Shared to X! ✨');
        setTimeout(() => setShareStatus(''), 3000);

        if (onShareCosmicSignature && signature) {
            onShareCosmicSignature(signature);
        }
    };

    const getZodiacEmoji = (tradition: string, sign?: string) => {
        const emojiMap: Record<string, string> = {
            // Western
            'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
            'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
            'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓',
            // Chinese
            'Rat': '🐭', 'Ox': '🐂', 'Tiger': '🐅', 'Rabbit': '🐰',
            'Dragon': '🐉', 'Snake': '🐍', 'Horse': '🐴', 'Goat': '🐐',
            'Monkey': '🐵', 'Rooster': '🐓', 'Dog': '🐕', 'Pig': '🐷',
            // Aztec/Mayan
            'Cipactli': '🐊', 'Ehecatl': '💨', 'Calli': '🏠', 'Cuetzpalin': '🦎',
            'Coatl': '🐍', 'Miquiztli': '💀', 'Mazatl': '🦌', 'Tochtli': '🐰',
            'Atl': '💧', 'Itzcuintli': '🐕', 'Ozomatli': '🐵', 'Malinalli': '🌿',
            'Acatl': '🎋', 'Ocelotl': '🐆', 'Cuauhtli': '🦅', 'Cozcacuauhtli': '🦅',
            'Ollin': '🌀', 'Tecpatl': '⚔️', 'Quiahuitl': '🌧️', 'Xochitl': '🌺'
        };
        return sign ? emojiMap[sign] || '⭐' : '🌟';
    };

    const getToneEmoji = (tone?: string) => {
        const toneEmojis: Record<string, string> = {
            'Magnetic': '🧲', 'Lunar': '🌙', 'Electric': '⚡', 'Self-Existing': '🏠',
            'Overtone': '🎵', 'Rhythmic': '🥁', 'Resonant': '🔔', 'Galactic': '🌌',
            'Solar': '☀️', 'Planetary': '🪐', 'Spectral': '🌈', 'Crystal': '💎', 'Cosmic': '🌟'
        };
        return tone ? toneEmojis[tone] || '⭐' : '🌟';
    };

    if (!zodiacData && !cosmicSignature) {
        return (
            <div className="zodiac-dashboard loading">
                <div className="loading-content">
                    <div className="cosmic-spinner"></div>
                    <h3>🌟 Loading Cosmic Data...</h3>
                    <p>Connecting to the Multi-Zodiac System</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`zodiac-dashboard ${animationTrigger > 0 ? 'animated' : ''}`}>
            {/* Header */}
            <div className="dashboard-header">
                <h2>🌟 Cosmic Dashboard</h2>
                {shareStatus && (
                    <div className="share-status">{shareStatus}</div>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    🌟 Overview
                </button>
                <button
                    className={`tab ${activeTab === 'systems' ? 'active' : ''}`}
                    onClick={() => setActiveTab('systems')}
                >
                    🌍 All Systems
                </button>
                <button
                    className={`tab ${activeTab === 'cosmic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cosmic')}
                >
                    🚀 Cosmic Signature
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="overview-content">
                        {cosmicSignature && (
                            <div className="cosmic-signature-card">
                                <h3>🌟 Your Cosmic Signature</h3>
                                <div className="signature-display">
                                    <span className="signature-text">{cosmicSignature}</span>
                                    <button
                                        className="share-btn"
                                        onClick={() => handleShareToX('Check out my cosmic signature from the Multi-Zodiac System!', cosmicSignature)}
                                    >
                                        Share on X ✨
                                    </button>
                                </div>
                                {zodiacData?.cosmic_signature && (
                                    <div className="signature-details">
                                        <div className="detail">
                                            <span>Day Sign:</span>
                                            <span>
                                                {getZodiacEmoji('aztec', zodiacData.cosmic_signature.day_sign)}
                                                {zodiacData.cosmic_signature.day_sign}
                                            </span>
                                        </div>
                                        <div className="detail">
                                            <span>Galactic Tone:</span>
                                            <span>
                                                {getToneEmoji(zodiacData.cosmic_signature.galactic_tone)}
                                                {zodiacData.cosmic_signature.galactic_tone}
                                            </span>
                                        </div>
                                        <div className="detail">
                                            <span>Kin Number:</span>
                                            <span>#{zodiacData.cosmic_signature.kin_number}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick Signs Summary */}
                        <div className="quick-signs">
                            {zodiacData?.western_sign && (
                                <div className="sign-card western">
                                    <h4>{getZodiacEmoji('western', zodiacData.western_sign)} Western</h4>
                                    <p>{zodiacData.western_sign}</p>
                                </div>
                            )}
                            {zodiacData?.chinese_sign && (
                                <div className="sign-card chinese">
                                    <h4>{getZodiacEmoji('chinese', zodiacData.chinese_sign)} Chinese</h4>
                                    <p>{zodiacData.chinese_sign}</p>
                                </div>
                            )}
                            {zodiacData?.aztec_sign && (
                                <div className="sign-card aztec">
                                    <h4>{getZodiacEmoji('aztec', zodiacData.aztec_sign)} Aztec</h4>
                                    <p>{zodiacData.aztec_sign}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* All Systems Tab */}
                {activeTab === 'systems' && zodiacData && (
                    <div className="systems-content">
                        <div className="system-grid">
                            {zodiacData.western_sign && (
                                <div className="system-card">
                                    <h3>♈ Western Zodiac</h3>
                                    <div className="system-sign">
                                        {getZodiacEmoji('western', zodiacData.western_sign)}
                                        {zodiacData.western_sign}
                                    </div>
                                    <button
                                        className="share-btn small"
                                        onClick={() => handleShareToX(`My Western Zodiac sign: ${zodiacData.western_sign} ${getZodiacEmoji('western', zodiacData.western_sign)}`)}
                                    >
                                        Share ✨
                                    </button>
                                </div>
                            )}
                            {zodiacData.chinese_sign && (
                                <div className="system-card">
                                    <h3>🐉 Chinese Zodiac</h3>
                                    <div className="system-sign">
                                        {getZodiacEmoji('chinese', zodiacData.chinese_sign)}
                                        {zodiacData.chinese_sign}
                                    </div>
                                    <button
                                        className="share-btn small"
                                        onClick={() => handleShareToX(`My Chinese Zodiac: ${zodiacData.chinese_sign} ${getZodiacEmoji('chinese', zodiacData.chinese_sign)}`)}
                                    >
                                        Share ✨
                                    </button>
                                </div>
                            )}
                            {zodiacData.vedic_sign && (
                                <div className="system-card">
                                    <h3>🕉️ Vedic Astrology</h3>
                                    <div className="system-sign">
                                        🌟 {zodiacData.vedic_sign}
                                    </div>
                                    <button
                                        className="share-btn small"
                                        onClick={() => handleShareToX(`My Vedic sign: ${zodiacData.vedic_sign} 🕉️`)}
                                    >
                                        Share ✨
                                    </button>
                                </div>
                            )}
                            {zodiacData.aztec_sign && (
                                <div className="system-card">
                                    <h3>🐊 Aztec Calendar</h3>
                                    <div className="system-sign">
                                        {getZodiacEmoji('aztec', zodiacData.aztec_sign)}
                                        {zodiacData.aztec_sign}
                                    </div>
                                    <button
                                        className="share-btn small"
                                        onClick={() => handleShareToX(`My Aztec day sign: ${zodiacData.aztec_sign} ${getZodiacEmoji('aztec', zodiacData.aztec_sign)}`)}
                                    >
                                        Share ✨
                                    </button>
                                </div>
                            )}
                            {zodiacData.mayan_sign && (
                                <div className="system-card">
                                    <h3>🌙 Mayan Tzolkin</h3>
                                    <div className="system-sign">
                                        🌟 {zodiacData.mayan_sign}
                                    </div>
                                    <button
                                        className="share-btn small"
                                        onClick={() => handleShareToX(`My Mayan Tzolkin: ${zodiacData.mayan_sign} 🌙`)}
                                    >
                                        Share ✨
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Cosmic Signature Tab */}
                {activeTab === 'cosmic' && (
                    <div className="cosmic-content">
                        {zodiacData?.cosmic_signature ? (
                            <div className="cosmic-detailed">
                                <h3>🚀 Deep Cosmic Analysis</h3>
                                <div className="cosmic-breakdown">
                                    <div className="cosmic-element">
                                        <h4>Day Sign Energy</h4>
                                        <div className="energy-display">
                                            {getZodiacEmoji('aztec', zodiacData.cosmic_signature.day_sign)}
                                            <span>{zodiacData.cosmic_signature.day_sign}</span>
                                        </div>
                                        <p>Your core essence and daily energy pattern</p>
                                    </div>
                                    <div className="cosmic-element">
                                        <h4>Galactic Tone</h4>
                                        <div className="energy-display">
                                            {getToneEmoji(zodiacData.cosmic_signature.galactic_tone)}
                                            <span>{zodiacData.cosmic_signature.galactic_tone}</span>
                                        </div>
                                        <p>Your cosmic purpose and vibrational frequency</p>
                                    </div>
                                    <div className="cosmic-element">
                                        <h4>Kin Number</h4>
                                        <div className="energy-display">
                                            🌟 <span>#{zodiacData.cosmic_signature.kin_number}</span>
                                        </div>
                                        <p>Your unique position in the 260-day Tzolkin cycle</p>
                                    </div>
                                </div>
                                <button
                                    className="share-btn large cosmic"
                                    onClick={() => handleShareToX(
                                        `🚀 My complete cosmic signature from the Multi-Zodiac System: ${cosmicSignature} - Day Sign: ${zodiacData.cosmic_signature?.day_sign}, Tone: ${zodiacData.cosmic_signature?.galactic_tone}, Kin: #${zodiacData.cosmic_signature?.kin_number}`,
                                        cosmicSignature || undefined
                                    )}
                                >
                                    Share Complete Cosmic Profile 🌟
                                </button>
                            </div>
                        ) : (
                            <div className="cosmic-placeholder">
                                <div className="placeholder-content">
                                    <h3>🌟 Cosmic Signature</h3>
                                    <p>Generate your complete cosmic profile to see detailed analysis</p>
                                    <div className="cosmic-preview">
                                        {cosmicSignature && (
                                            <>
                                                <span className="signature-preview">{cosmicSignature}</span>
                                                <button
                                                    className="share-btn"
                                                    onClick={() => handleShareToX('Check out my cosmic signature!', cosmicSignature)}
                                                >
                                                    Share Preview ✨
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="dashboard-footer">
                <div className="stats">
                    <span>🌟 Multi-Zodiac System</span>
                    <span>76+ Signs • 13 Tones • 304 Combinations</span>
                </div>
            </div>
        </div>
    );
};

export default ZodiacDashboard;