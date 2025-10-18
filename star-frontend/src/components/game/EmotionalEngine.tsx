import { Text } from '@react-three/drei';
import React, { useEffect, useState } from 'react';

interface EmotionalEngineProps {
    gameState: 'idle' | 'started' | 'ended';
    winner: string | null;
    resonances: Resonance[];
}

interface Resonance {
    id: string;
    zodiacSign: string;
    role: string;
    rp: number;
    tier: number;
}

interface EmotionalState {
    emotion: 'JOY' | 'EXCITEMENT' | 'ANXIETY' | 'TRIUMPH' | 'DISAPPOINTMENT' | 'FLOW';
    intensity: number;
    duration: number;
}

const EMOTIONAL_RESPONSES = {
    QUEST_COMPLETED: { emotion: 'JOY', intensity: 0.8, duration: 3 },
    ABILITY_SUCCESS: { emotion: 'EXCITEMENT', intensity: 0.6, duration: 2 },
    UNDER_ATTACK: { emotion: 'ANXIETY', intensity: 0.7, duration: 1.5 },
    VICTORY: { emotion: 'TRIUMPH', intensity: 1.0, duration: 5 },
    DEFEAT: { emotion: 'DISAPPOINTMENT', intensity: 0.9, duration: 4 },
    COMBO_STREAK: { emotion: 'FLOW', intensity: 0.8, duration: 2.5 }
} as const;

export const EmotionalEngine: React.FC<EmotionalEngineProps> = ({
    gameState,
    winner,
    resonances
}) => {
    const [currentEmotion, setCurrentEmotion] = useState<EmotionalState | null>(null);
    const [emotionHistory, setEmotionHistory] = useState<EmotionalState[]>([]);

    useEffect(() => {
        if (gameState === 'ended') {
            const emotion = winner ? EMOTIONAL_RESPONSES.VICTORY : EMOTIONAL_RESPONSES.DEFEAT;
            triggerEmotion(emotion.emotion, emotion.intensity, emotion.duration);
        }
    }, [gameState, winner]);

    const triggerEmotion = (emotion: EmotionalState['emotion'], intensity: number, duration: number) => {
        const newEmotion: EmotionalState = { emotion, intensity, duration };

        setCurrentEmotion(newEmotion);
        setEmotionHistory(prev => [...prev.slice(-4), newEmotion]);

        // Auto-clear emotion after duration
        setTimeout(() => {
            setCurrentEmotion(null);
        }, duration * 1000);
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case 'JOY': return '#f59e0b';
            case 'EXCITEMENT': return '#ef4444';
            case 'ANXIETY': return '#8b5cf6';
            case 'TRIUMPH': return '#10b981';
            case 'DISAPPOINTMENT': return '#6b7280';
            case 'FLOW': return '#06b6d4';
            default: return '#ffffff';
        }
    };

    const getEmotionEmoji = (emotion: string) => {
        switch (emotion) {
            case 'JOY': return '😊';
            case 'EXCITEMENT': return '🔥';
            case 'ANXIETY': return '😰';
            case 'TRIUMPH': return '🏆';
            case 'DISAPPOINTMENT': return '😔';
            case 'FLOW': return '🌟';
            default: return '😐';
        }
    };

    if (!currentEmotion) return null;

    return (
        <group>
            <Text
                position={[0, 4, 0]}
                fontSize={0.4}
                color={getEmotionColor(currentEmotion.emotion)}
                anchorX="center"
                anchorY="middle"
            >
                {`${getEmotionEmoji(currentEmotion.emotion)} ${currentEmotion.emotion}`}
            </Text>

            <mesh position={[0, 3.5, 0] as [number, number, number]}>
                <ringGeometry args={[0.5, 0.8, 32]} />
                <meshBasicMaterial
                    color={getEmotionColor(currentEmotion.emotion)}
                    transparent
                    opacity={currentEmotion.intensity * 0.6}
                />
            </mesh>
        </group>
    );
};

export default EmotionalEngine;