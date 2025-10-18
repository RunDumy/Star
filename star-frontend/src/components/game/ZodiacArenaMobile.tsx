import { Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { zodiacAPI } from '../../lib/api';
import { getAssetUrl } from '../../lib/storage';
import { EnhancedPlanetButton } from '../cosmic/EnhancedPlanetButton';
import styles from './ZodiacArenaMobile.module.css';

interface Unit {
    id: string;
    zodiacSign: 'Aries' | 'Taurus';
    position: [number, number, number];
    health: number;
    targetPosition?: [number, number, number];
    lastAttackTime: number;
    damage: number;
}

interface DamagePopup {
    id: string;
    value: number;
    position: [number, number, number];
    createdAt: number;
}

interface TouchPoint {
    x: number;
    y: number;
    worldPos: [number, number, number];
}

const Arena = React.forwardRef<THREE.Group>((props, ref) => {
    return (
        <group ref={ref}>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[8, 0.1, 8]} />
                <meshStandardMaterial color="#0a0a1a" transparent opacity={0.9} />
            </mesh>
            <Stars radius={15} depth={15} count={300} factor={2} saturation={0} fade />
        </group>
    );
});

Arena.displayName = 'Arena';

const ZodiacArenaMobile: React.FC = () => {
    const arenaRef = useRef<THREE.Group>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [units, setUnits] = useState<Unit[]>([
        { id: 'aries', zodiacSign: 'Aries', position: [1.5, 0.7, 1.5], health: 100, lastAttackTime: 0, damage: 12 },
        { id: 'taurus', zodiacSign: 'Taurus', position: [-1.5, 0.7, -1.5], health: 100, lastAttackTime: 0, damage: 8 },
    ]);
    const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<string>('aries');
    const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
    const [winner, setWinner] = useState<string | null>(null);
    const [touchPoint, setTouchPoint] = useState<TouchPoint | null>(null);
    const [isTouch, setIsTouch] = useState(false);
    const [uiCollapsed, setUiCollapsed] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsTouch('ontouchstart' in globalThis || navigator.maxTouchPoints > 0);
        };
        checkMobile();
        globalThis.addEventListener('resize', checkMobile);
        return () => globalThis.removeEventListener('resize', checkMobile);
    }, []);

    // Audio setup with uploaded sound effects
    const soundEffects = useMemo(() => ({
        Aries: getAssetUrl('whoosh-flame-388763.mp3'),
        Taurus: getAssetUrl('whoosh-truck-2-386138.mp3'),
        attack: getAssetUrl('whoosh-axe-throw-389751.mp3'),
        victory: getAssetUrl('whoosh-velocity-383019.mp3'),
        defeat: getAssetUrl('whoosh-dark-tension-386134.mp3')
    }), []);

    const playSound = useCallback((soundType: 'Aries' | 'Taurus' | 'attack' | 'victory' | 'defeat') => {
        try {
            const audio = new Audio(soundEffects[soundType]);
            audio.volume = 0.3; // Set volume to 30% to avoid being too loud
            audio.play().catch(err => {
                console.log(`Audio playback failed for ${soundType}:`, err);
            });
        } catch (error) {
            console.log(`Error playing sound ${soundType}:`, error);
        }
    }, [soundEffects]);

    const handleArenaTouch = useCallback((event: React.TouchEvent | React.MouseEvent) => {
        if (gameState !== 'playing' || selectedUnit !== 'aries') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in event && event.touches.length > 0) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else if ('clientX' in event) {
            clientX = event.clientX;
            clientY = event.clientY;
        } else {
            return;
        }

        // Convert screen coordinates to world coordinates
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        // Project to arena plane
        const worldX = x * 3; // Scale to arena size
        const worldZ = y * 3;

        // Clamp to arena bounds
        const clampedX = Math.max(-3.5, Math.min(3.5, worldX));
        const clampedZ = Math.max(-3.5, Math.min(3.5, worldZ));

        setUnits((prevUnits) =>
            prevUnits.map((unit) =>
                unit.id === 'aries'
                    ? { ...unit, targetPosition: [clampedX, 0.7, clampedZ] }
                    : unit
            )
        );

        // Visual feedback
        setTouchPoint({
            x: clientX - rect.left,
            y: clientY - rect.top,
            worldPos: [clampedX, 0.7, clampedZ]
        });

        setTimeout(() => setTouchPoint(null), 1000);

        // Haptic feedback for mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }, [gameState, selectedUnit]);

    const addDamagePopup = (targetId: string, value: number, position: [number, number, number]) => {
        setDamagePopups((prev) => [
            ...prev,
            { id: `${targetId}-${Date.now()}`, value, position: [position[0], position[1] + 1.2, position[2]], createdAt: Date.now() },
        ]);
    };

    const shareVictory = async () => {
        if (!winner) return;

        try {
            const battleData = {
                winner,
                battle_duration: Math.floor(Math.random() * 60) + 30,
                participant_signs: ['Aries', 'Taurus'],
                damage_dealt: Math.floor(Math.random() * 100) + 50
            };

            await zodiacAPI.shareArenaResult(battleData);
            alert(`Victory shared to cosmic feed! 🌟 ${winner} reigns supreme!`);
        } catch (error) {
            console.error('Failed to share victory:', error);
            alert('Failed to share victory to cosmic feed');
        }
    };

    const restartGame = () => {
        setUnits([
            { id: 'aries', zodiacSign: 'Aries', position: [1.5, 0.7, 1.5], health: 100, lastAttackTime: 0, damage: 12 },
            { id: 'taurus', zodiacSign: 'Taurus', position: [-1.5, 0.7, -1.5], health: 100, lastAttackTime: 0, damage: 8 },
        ]);
        setDamagePopups([]);
        setCombatLog([]);
        setGameState('playing');
        setWinner(null);
        setTouchPoint(null);
    };

    const toggleUI = () => {
        setUiCollapsed(!uiCollapsed);
    };

    // Game loop inside Canvas component
    const GameLoop: React.FC = () => {
        useFrame((state, delta) => {
            if (gameState !== 'playing') return;

            // Movement and AI
            setUnits((prevUnits) => {
                return prevUnits.map((unit) => {
                    if (unit.health <= 0) return unit;

                    if (unit.id === 'aries' && unit.targetPosition) {
                        const current = new THREE.Vector3(...unit.position);
                        const target = new THREE.Vector3(...unit.targetPosition);
                        const distance = current.distanceTo(target);

                        if (distance < 0.1) {
                            return { ...unit, targetPosition: undefined };
                        }

                        const newPos = current.lerp(target, 2 * delta);
                        return { ...unit, position: [newPos.x, newPos.y, newPos.z] };
                    } else if (unit.id === 'taurus') {
                        const aries = prevUnits.find((u) => u.id === 'aries' && u.health > 0);
                        if (aries) {
                            const distance = new THREE.Vector3(...unit.position).distanceTo(new THREE.Vector3(...aries.position));
                            let target: [number, number, number];

                            if (distance <= 1.5) {
                                target = unit.position;
                            } else if (distance < 4) {
                                target = aries.position;
                            } else {
                                const randomX = Math.max(-3, Math.min(3, unit.position[0] + (Math.random() - 0.5) * 2));
                                const randomZ = Math.max(-3, Math.min(3, unit.position[2] + (Math.random() - 0.5) * 2));
                                target = [randomX, 0.7, randomZ];
                            }

                            const current = new THREE.Vector3(...unit.position);
                            const newPos = current.lerp(new THREE.Vector3(...target), 1.5 * delta);
                            return { ...unit, position: [newPos.x, newPos.y, newPos.z] };
                        }
                    }
                    return unit;
                });
            });

            // Auto-attack
            setUnits((prevUnits) => {
                const currentTime = state.clock.getElapsedTime();
                let newUnits = prevUnits.map((unit) => {
                    if (unit.health <= 0) return unit;
                    const target = prevUnits.find((u) => u.id !== unit.id && u.health > 0);
                    if (target && currentTime - unit.lastAttackTime >= 1.5) {
                        const distance = new THREE.Vector3(...unit.position).distanceTo(new THREE.Vector3(...target.position));
                        if (distance <= 1.8) {
                            playSound(unit.zodiacSign);
                            const timestamp = new Date().toLocaleTimeString();
                            setCombatLog((prev) => [...prev.slice(-3), `[${timestamp}] ${unit.zodiacSign} ⚔️ ${target.zodiacSign}`]);
                            addDamagePopup(target.id, unit.damage, target.position);
                            return { ...unit, lastAttackTime: currentTime };
                        }
                    }
                    return unit;
                });

                // Apply damage
                newUnits = newUnits.map((unit) => {
                    const totalDamage = damagePopups
                        .filter((popup) => popup.id.includes(unit.id) && currentTime - popup.createdAt / 1000 < 1)
                        .reduce((sum, popup) => sum + popup.value, 0);
                    return { ...unit, health: Math.max(0, unit.health - totalDamage) };
                });

                // Check win/lose
                const aliveUnits = newUnits.filter((unit) => unit.health > 0);
                if (aliveUnits.length <= 1) {
                    setGameState('ended');
                    setWinner(aliveUnits.length === 1 ? aliveUnits[0].zodiacSign : null);
                    if (aliveUnits.length === 1) {
                        playSound('victory');
                    } else {
                        playSound('defeat');
                    }
                }

                return newUnits;
            });

            // Clean up damage popups
            setDamagePopups((prev) => prev.filter((popup) => Date.now() - popup.createdAt < 1000));
        });

        return null;
    };

    return (
        <div className={styles.container}>
            <Canvas
                ref={canvasRef}
                camera={{ position: [0, 4, 8], fov: 65 }}
                onPointerDown={handleArenaTouch}
                onTouchStart={handleArenaTouch}
                className={styles.canvas}
                gl={{
                    antialias: false,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: false
                }}
                performance={{ min: 0.5 }}
            >
                <ambientLight intensity={0.6} />
                <pointLight position={[4, 4, 4]} intensity={0.8} />
                <Arena ref={arenaRef} />
                <GameLoop />

                {units.map((unit) => {
                    const isTakingDamage = damagePopups.some((popup) => popup.id.includes(unit.id));
                    const shakeY = isTakingDamage ? 0.7 + Math.sin(Date.now() * 0.02) * 0.15 : 0.7;

                    return (
                        <group key={unit.id}>
                            <EnhancedPlanetButton
                                position={[unit.position[0], shakeY, unit.position[2]]}
                                planetType={unit.zodiacSign === 'Aries' ? 'desert' : 'rocky'}
                                size={0.6}
                                atmosphere={true}
                                customColor={unit.zodiacSign === 'Aries' ? '#ef4444' : '#8b4513'}
                                label={unit.zodiacSign}
                                zodiacSign={unit.zodiacSign}
                                onClick={() => setSelectedUnit(unit.id)}
                                isActive={unit.id === selectedUnit}
                            />
                            <Text
                                position={[unit.position[0], shakeY + 1, unit.position[2]]}
                                fontSize={0.18}
                                color="#fef3c7"
                                anchorX="center"
                                anchorY="middle"
                            >
                                {`HP: ${Math.round(unit.health)}`}
                            </Text>
                        </group>
                    );
                })}

                {damagePopups.map((popup) => (
                    <Text
                        key={popup.id}
                        position={[popup.position[0], popup.position[1] + (Date.now() - popup.createdAt) / 1000 * 0.4, popup.position[2]]}
                        fontSize={0.12}
                        color="#ff6b6b"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {`-${popup.value}`}
                    </Text>
                ))}

                {touchPoint && (
                    <mesh position={touchPoint.worldPos}>
                        <ringGeometry args={[0.1, 0.2, 16]} />
                        <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
                    </mesh>
                )}

                {gameState === 'ended' && (
                    <Text
                        position={[0, 2, 0]}
                        fontSize={0.4}
                        color="#fef3c7"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {winner ? `${winner} Wins! 🏆` : 'Draw! 🤝'}
                    </Text>
                )}
            </Canvas>

            {/* Mobile UI Toggle Button */}
            <button
                className={styles.uiToggle}
                onClick={toggleUI}
                aria-label="Toggle UI"
            >
                {uiCollapsed ? '📱' : '❌'}
            </button>

            {/* Touch Instructions */}
            {isTouch && gameState === 'playing' && (
                <div className={styles.touchInstructions}>
                    <p>👆 Tap arena to move {selectedUnit === 'aries' ? 'Aries' : 'selected unit'}</p>
                </div>
            )}

            {/* Mobile-Optimized Control Panel */}
            <div className={`${styles.controlPanel} ${uiCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>Units</h3>
                </div>

                <div className={styles.unitsGrid}>
                    {units.map((unit) => (
                        <div key={unit.id} className={styles.unitCard}>
                            <button
                                onClick={() => setSelectedUnit(unit.id)}
                                disabled={unit.id !== 'aries' || gameState === 'ended'}
                                className={`${styles.unitButton} ${unit.id === selectedUnit ? styles.selected : ''}`}
                            >
                                <span className={styles.unitIcon}>
                                    {unit.zodiacSign === 'Aries' ? '♈' : '♉'}
                                </span>
                                <span className={styles.unitName}>{unit.zodiacSign}</span>
                            </button>
                            <div className={styles.healthBar}>
                                <div
                                    className={styles.healthFill}
                                    data-health={unit.health}
                                />
                                <span className={styles.healthText}>{Math.round(unit.health)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {gameState === 'ended' && (
                    <div className={styles.gameEndActions}>
                        <button
                            onClick={shareVictory}
                            className={styles.actionButton}
                        >
                            🌟 Share Victory
                        </button>
                        <button
                            onClick={restartGame}
                            className={styles.actionButton}
                        >
                            🔄 New Battle
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Combat Log */}
            {!uiCollapsed && (
                <div className={styles.logPanel}>
                    <h4 className={styles.logTitle}>Battle Log</h4>
                    <div className={styles.logEntries}>
                        {combatLog.slice(-4).map((log, index) => (
                            <p key={`log-${index}-${log.substring(0, 10)}`} className={styles.logEntry}>
                                {log}
                            </p>
                        ))}
                        {combatLog.length === 0 && (
                            <p className={styles.logEntry}>Awaiting battle...</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZodiacArenaMobile;