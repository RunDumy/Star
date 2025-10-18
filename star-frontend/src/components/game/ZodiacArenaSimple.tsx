import { Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { zodiacAPI } from '../../lib/api';
import { EnhancedPlanetButton } from '../cosmic/EnhancedPlanetButton';
import styles from './ZodiacArenaSimple.module.css';

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

const Arena = React.forwardRef<THREE.Group>((props, ref) => {
    return (
        <group ref={ref}>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[10, 0.1, 10]} />
                <meshStandardMaterial color="#0a0a1a" transparent opacity={0.9} />
            </mesh>
            <Stars radius={20} depth={20} count={500} factor={2} saturation={0} fade />
        </group>
    );
});

Arena.displayName = 'Arena';

const ZodiacArenaSimple: React.FC = () => {
    const arenaRef = useRef<THREE.Group>(null);
    const [units, setUnits] = useState<Unit[]>([
        { id: 'aries', zodiacSign: 'Aries', position: [2, 0.7, 2], health: 100, lastAttackTime: 0, damage: 12 },
        { id: 'taurus', zodiacSign: 'Taurus', position: [-2, 0.7, -2], health: 100, lastAttackTime: 0, damage: 8 },
    ]);
    const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
    const [combatLog, setCombatLog] = useState<string[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<string>('aries');
    const [gameState, setGameState] = useState<'playing' | 'ended'>('playing');
    const [winner, setWinner] = useState<string | null>(null);

    // Audio setup (simplified)
    const playSound = (zodiacSign: 'Aries' | 'Taurus') => {
        // Placeholder for audio
        console.log(`Playing ${zodiacSign} sound`);
    };

    const handleArenaClick = () => {
        if (gameState === 'playing' && selectedUnit === 'aries') {
            const randomX = Math.random() * 8 - 4;
            const randomZ = Math.random() * 8 - 4;
            setUnits((prevUnits) =>
                prevUnits.map((unit) =>
                    unit.id === 'aries'
                        ? { ...unit, targetPosition: [randomX, 0.7, randomZ] }
                        : unit
                )
            );
        }
    };

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
            { id: 'aries', zodiacSign: 'Aries', position: [2, 0.7, 2], health: 100, lastAttackTime: 0, damage: 12 },
            { id: 'taurus', zodiacSign: 'Taurus', position: [-2, 0.7, -2], health: 100, lastAttackTime: 0, damage: 8 },
        ]);
        setDamagePopups([]);
        setCombatLog([]);
        setGameState('playing');
        setWinner(null);
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
                        const newPos = current.lerp(target, 3 * delta);
                        return { ...unit, position: [newPos.x, newPos.y, newPos.z] };
                    } else if (unit.id === 'taurus') {
                        const aries = prevUnits.find((u) => u.id === 'aries' && u.health > 0);
                        if (aries) {
                            const distance = new THREE.Vector3(...unit.position).distanceTo(new THREE.Vector3(...aries.position));
                            let target: [number, number, number];
                            if (distance <= 2) {
                                target = unit.position;
                            } else if (distance < 5) {
                                target = aries.position;
                            } else {
                                const randomX = Math.max(-5, Math.min(5, unit.position[0] + (Math.random() - 0.5) * 2));
                                const randomZ = Math.max(-5, Math.min(5, unit.position[2] + (Math.random() - 0.5) * 2));
                                target = [randomX, 0.7, randomZ];
                            }
                            const current = new THREE.Vector3(...unit.position);
                            const newPos = current.lerp(new THREE.Vector3(...target), 2 * delta);
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
                    if (target && currentTime - unit.lastAttackTime >= 1) {
                        const distance = new THREE.Vector3(...unit.position).distanceTo(new THREE.Vector3(...target.position));
                        if (distance <= 2) {
                            playSound(unit.zodiacSign);
                            const timestamp = new Date().toLocaleTimeString();
                            setCombatLog((prev) => [...prev.slice(-4), `[${timestamp}] ${unit.zodiacSign} deals ${unit.damage} to ${target.zodiacSign}`]);
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
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }} onClick={handleArenaClick}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <Arena ref={arenaRef} />
                <GameLoop />
                {units.map((unit) => {
                    const isTakingDamage = damagePopups.some((popup) => popup.id.includes(unit.id));
                    const shakeY = isTakingDamage ? 0.7 + Math.sin(Date.now() * 0.02) * 0.2 : 0.7;

                    return (
                        <group key={unit.id}>
                            <EnhancedPlanetButton
                                position={unit.position}
                                planetType={unit.zodiacSign === 'Aries' ? 'desert' : 'rocky'}
                                size={0.7}
                                atmosphere={true}
                                customColor={unit.zodiacSign === 'Aries' ? '#ef4444' : '#8b4513'}
                                label={unit.zodiacSign}
                                zodiacSign={unit.zodiacSign}
                                onClick={() => setSelectedUnit(unit.id)}
                                isActive={unit.id === selectedUnit}
                            />
                            <Text
                                position={[unit.position[0], shakeY + 1.2, unit.position[2]]}
                                fontSize={0.2}
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
                        position={[popup.position[0], popup.position[1] + (Date.now() - popup.createdAt) / 1000 * 0.5, popup.position[2]]}
                        fontSize={0.15}
                        color="#fef3c7"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {`-${popup.value}`}
                    </Text>
                ))}
                {gameState === 'ended' && (
                    <Text
                        position={[0, 2, 0]}
                        fontSize={0.5}
                        color="#fef3c7"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {winner ? `${winner} Wins!` : 'Draw!'}
                    </Text>
                )}
            </Canvas>

            {/* UI Panels */}
            <div className={styles.controlPanel}>
                <h3 className={styles.panelTitle}>Select Unit</h3>
                {units.map((unit) => (
                    <div key={unit.id} className={styles.unitContainer}>
                        <button
                            onClick={() => setSelectedUnit(unit.id)}
                            disabled={unit.id !== 'aries' || gameState === 'ended'}
                            className={styles.unitButton}
                        >
                            {unit.zodiacSign}
                        </button>
                        <p className={styles.unitStats}>
                            Damage: {unit.damage} | HP: {Math.round(unit.health)}
                        </p>
                    </div>
                ))}
                {gameState === 'ended' && (
                    <>
                        <button
                            onClick={shareVictory}
                            className={styles.actionButton}
                        >
                            Share Victory 🌟
                        </button>
                        <button
                            onClick={restartGame}
                            className={styles.actionButton}
                        >
                            Restart Game
                        </button>
                    </>
                )}
            </div>

            <div className={styles.logPanel}>
                <h3 className={styles.panelTitle}>Combat Log</h3>
                {combatLog.slice(-5).map((log, logIndex) => (
                    <p key={`log-${logIndex}-${log.substring(0, 20)}`} className={styles.logEntry}>
                        {log}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default ZodiacArenaSimple;