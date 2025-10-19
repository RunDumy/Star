import { useEffect, useState } from 'react';

interface LeaderboardsProps {
    score: number;
    currentWave?: number;
    playerSign?: string;
}

interface LeaderboardEntry {
    id: string;
    score: number;
    wave: number;
    sign: string;
    tier: string;
    timestamp: string;
}

interface TierInfo {
    name: string;
    color: string;
    icon: string;
    minScore: number;
    description: string;
    badge: string;
}

const Leaderboards: React.FC<LeaderboardsProps> = ({ score, currentWave = 1, playerSign = 'Aries' }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const tiers: TierInfo[] = [
        { name: 'Bronze', color: '#cd7f32', icon: '🥉', minScore: 0, description: 'Cosmic Initiate', badge: '🌟' },
        { name: 'Silver', color: '#c0c0c0', icon: '🥈', minScore: 1000, description: 'Star Warrior', badge: '⭐' },
        { name: 'Gold', color: '#ffd700', icon: '🥇', minScore: 5000, description: 'Celestial Champion', badge: '👑' },
        { name: 'Platinum', color: '#e5e4e2', icon: '💎', minScore: 15000, description: 'Astral Master', badge: '💫' },
        { name: 'Diamond', color: '#b9f2ff', icon: '💠', minScore: 30000, description: 'Cosmic Legend', badge: '🌌' },
        { name: 'Mythril', color: '#8a2be2', icon: '🔮', minScore: 50000, description: 'Zodiac Sovereign', badge: '⚡' }
    ];

    const getTier = (s: number): TierInfo => {
        return tiers.slice().reverse().find(tier => s >= tier.minScore) || tiers[0];
    };

    const getNextTier = (s: number): TierInfo | null => {
        const currentTierIndex = tiers.findIndex(tier => tier.minScore <= s);
        return currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
    };

    const getProgressToNextTier = (s: number): number => {
        const currentTier = getTier(s);
        const nextTier = getNextTier(s);
        if (!nextTier) return 100;

        const progress = (s - currentTier.minScore) / (nextTier.minScore - currentTier.minScore);
        return Math.min(progress * 100, 100);
    };

    const currentTier = getTier(score);
    const nextTier = getNextTier(score);
    const progressPercent = getProgressToNextTier(score);

    useEffect(() => {
        setIsLoading(true);
        // Simulate API call - replace with actual API
        setTimeout(() => {
            const mockLeaderboard: LeaderboardEntry[] = [
                { id: 'aries', score, wave: currentWave, sign: playerSign, tier: currentTier.name, timestamp: new Date().toISOString() },
                { id: 'taurus', score: Math.floor(score * 0.9), wave: currentWave - 1, sign: 'Taurus', tier: getTier(Math.floor(score * 0.9)).name, timestamp: new Date().toISOString() },
                { id: 'gemini', score: Math.floor(score * 0.8), wave: currentWave - 2, sign: 'Gemini', tier: getTier(Math.floor(score * 0.8)).name, timestamp: new Date().toISOString() },
                { id: 'cancer', score: Math.floor(score * 0.7), wave: currentWave - 3, sign: 'Cancer', tier: getTier(Math.floor(score * 0.7)).name, timestamp: new Date().toISOString() },
                { id: 'leo', score: Math.floor(score * 0.6), wave: currentWave - 4, sign: 'Leo', tier: getTier(Math.floor(score * 0.6)).name, timestamp: new Date().toISOString() }
            ];
            setLeaderboard(mockLeaderboard.sort((a, b) => b.score - a.score));
            setIsLoading(false);
        }, 500);
    }, [score, currentWave, playerSign]);

    return (
        <div className="cosmic-ui-panel leaderboard" style={{
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
            border: `2px solid ${currentTier.color}`,
            borderRadius: '12px',
            padding: '20px',
            color: '#fef3c7',
            fontFamily: 'Arial, sans-serif',
            boxShadow: `0 0 20px ${currentTier.color}40`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: currentTier.color, textShadow: `0 0 10px ${currentTier.color}` }}>
                    🏆 Cosmic Leaderboards
                </h3>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    style={{
                        background: 'transparent',
                        border: `1px solid ${currentTier.color}`,
                        color: currentTier.color,
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            {/* Current Player Tier Display */}
            <div style={{
                background: `linear-gradient(135deg, ${currentTier.color}20, ${currentTier.color}10)`,
                border: `1px solid ${currentTier.color}`,
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '2em', marginBottom: '5px' }}>{currentTier.badge}</div>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: currentTier.color }}>
                    {currentTier.icon} {currentTier.name} {currentTier.badge}
                </div>
                <div style={{ fontSize: '0.9em', color: '#fef3c7', marginBottom: '10px' }}>
                    {currentTier.description}
                </div>

                {nextTier && (
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '0.8em', color: '#ccc', marginBottom: '5px' }}>
                            Progress to {nextTier.name}: {progressPercent.toFixed(1)}%
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: '#333',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                        <div style={{ fontSize: '0.7em', color: '#999', marginTop: '5px' }}>
                            {nextTier.minScore - score} points to {nextTier.name}
                        </div>
                    </div>
                )}
            </div>

            {/* Leaderboard List */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#fef3c7' }}>Top Warriors</h4>
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '1.5em' }}>🌌</div>
                        <div>Loading cosmic rankings...</div>
                    </div>
                ) : (
                    leaderboard.map((entry, i) => {
                        const entryTier = getTier(entry.score);
                        const isCurrentPlayer = entry.id === 'aries';

                        return (
                            <div key={entry.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                marginBottom: '8px',
                                background: isCurrentPlayer ? `linear-gradient(135deg, ${entryTier.color}30, ${entryTier.color}10)` : 'rgba(255,255,255,0.05)',
                                border: isCurrentPlayer ? `1px solid ${entryTier.color}` : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    background: entryTier.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '10px',
                                    fontSize: '0.8em'
                                }}>
                                    {i + 1}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: isCurrentPlayer ? 'bold' : 'normal',
                                        color: isCurrentPlayer ? entryTier.color : '#fef3c7'
                                    }}>
                                        {entry.sign} {isCurrentPlayer ? '(You)' : ''} {entryTier.badge}
                                    </div>
                                    <div style={{ fontSize: '0.8em', color: '#ccc' }}>
                                        Wave {entry.wave} • {entryTier.name} • {entry.score.toLocaleString()} pts
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '1.2em',
                                    color: entryTier.color,
                                    marginLeft: '10px'
                                }}>
                                    {entryTier.icon}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showDetails && (
                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    padding: '15px',
                    marginTop: '15px'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fef3c7' }}>Tier System</h4>
                    {tiers.map((tier, index) => (
                        <div key={tier.name} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: index < tiers.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: tier.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '10px',
                                fontSize: '0.7em'
                            }}>
                                {tier.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ color: tier.color, fontWeight: 'bold' }}>
                                    {tier.name} {tier.badge}
                                </span>
                                <span style={{ color: '#ccc', fontSize: '0.8em', marginLeft: '10px' }}>
                                    {tier.minScore.toLocaleString()}+ pts • {tier.description}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    style={{
                        background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}80)`,
                        border: 'none',
                        color: '#0a0a1a',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: `0 0 10px ${currentTier.color}40`
                    }}
                    onClick={() => alert('RP Boost purchased! +50% score multiplier for next battle!')}
                >
                    💎 Buy RP Boost ($1.99)
                </button>
            </div>
        </div>
    );
};

export default Leaderboards;
