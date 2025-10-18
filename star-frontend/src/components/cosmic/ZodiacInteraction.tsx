import { Canvas } from '@react-three/fiber';
import React, { useCallback, useState } from 'react';
import { getZodiacActions, getZodiacColor, getZodiacType } from '../../utils/zodiacActions';
import ZodiacAvatar from './ZodiacAvatar';

interface ZodiacInteractionProps {
    userZodiac: string;
    targetZodiac: string;
    interactionType: 'comment' | 'like' | 'follow' | 'share';
    onInteraction: (action: string) => void;
    className?: string;
}

const ZodiacInteraction: React.FC<ZodiacInteractionProps> = ({
    userZodiac,
    targetZodiac,
    interactionType,
    onInteraction,
    className = ''
}) => {
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const userActions = getZodiacActions(userZodiac);
    const actionName = userActions ? userActions[interactionType] : null;

    const handleInteraction = useCallback(() => {
        if (!actionName || isAnimating) return;

        setActiveAction(actionName);
        setIsAnimating(true);
        onInteraction(actionName);
    }, [actionName, isAnimating, onInteraction]);

    const handleAnimationComplete = useCallback(() => {
        setIsAnimating(false);
        setActiveAction(null);
    }, []);

    const zodiacType = getZodiacType(userZodiac);
    const zodiacColor = getZodiacColor(userZodiac);

    // Get emoji for interaction type
    const getInteractionEmoji = (type: string) => {
        switch (type) {
            case 'comment': return '💬';
            case 'like': return '❤️';
            case 'follow': return '✨';
            case 'share': return '🔄';
            default: return '⭐';
        }
    };

    return (
        <div className={`zodiac-interaction ${className}`}>
            <div className="interaction-controls">
                <button
                    className="zodiac-action-btn cosmic-button"
                    onClick={handleInteraction}
                    disabled={isAnimating}
                    style={{
                        '--zodiac-color': zodiacColor,
                        '--opacity': isAnimating ? '0.6' : '1'
                    } as React.CSSProperties}
                    aria-label={`${actionName || interactionType} as ${userZodiac}`}
                >
                    <span className="interaction-emoji">{getInteractionEmoji(interactionType)}</span>
                    <span className="interaction-text">{actionName || interactionType}</span>
                </button>
            </div>

            <div className="zodiac-avatars">
                <Canvas camera={{ position: [0, 0, 10] }} style={{ height: '200px' }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />

                    <ZodiacAvatar
                        zodiacSign={userZodiac}
                        position={[-2, 0, 0]}
                        action={activeAction || undefined}
                        onActionComplete={handleAnimationComplete}
                        interactive={true}
                    />
                    <ZodiacAvatar
                        zodiacSign={targetZodiac}
                        position={[2, 0, 0]}
                        size={0.8}
                        interactive={false}
                    />
                </Canvas>
            </div>

            <div className="zodiac-info">
                <div
                    className="zodiac-badge"
                    style={{ '--zodiac-color': zodiacColor } as React.CSSProperties}
                >
                    <span className="zodiac-sign">{userZodiac}</span>
                    <span className="zodiac-type">({zodiacType})</span>
                </div>
                <div className="action-description">
                    {isAnimating && actionName ? `Performing: ${actionName}` : 'Ready to interact'}
                </div>
            </div>
        </div>
    );
};

export default ZodiacInteraction;