import { Stars, Text } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { zodiacAPI } from '../../lib/api';
import { EnhancedPlanetButton } from '../cosmic/EnhancedPlanetButton';

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

const ArenaScene: React.FC<{
    onArenaClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    units: Unit[];
    damagePopups: DamagePopup[];
    selectedUnit: string;
    setSelectedUnit: (id: string) => void;
    gameState: 'playing' | 'ended';
    winner: string | null;
}> = ({ onArenaClick, units, damagePopups, selectedUnit, setSelectedUnit, gameState, winner }) => {
    const { camera, raycaster, pointer } = useThree();
    const arenaRef = useRef<THREE.Group>(null);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} />
            <Arena ref={arenaRef} />
            {units.map((unit) => {
                // Calculate shake without hook - simple boolean based animation
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
                        {unit.health > 0 && unit.id !== selectedUnit && new THREE.Vector3(...unit.position).distanceTo(new THREE.Vector3(...units.find((u) => u.id !== unit.id && u.health > 0)!.position)) <= 2 && (
                            <mesh position={[unit.position[0], unit.position[1] + 0.5, unit.position[2]]}>
                                <sphereGeometry args={[0.1, 8, 8]} />
                                <meshStandardMaterial
                                    color={unit.zodiacSign === 'Aries' ? '#ef4444' : '#8b4513'}
                                    emissive={unit.zodiacSign === 'Aries' ? '#ef4444' : '#8b4513'}
                                    emissiveIntensity={0.3}
                                    transparent
                                    opacity={0.6}
                                />
                            </mesh>
                        )}
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
        </>
    );
};

const ZodiacArenaPrototype: React.FC = () => {
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

    // Audio setup
    const audioContext = useRef<AudioContext | null>(null);
    const fireSound = useRef<AudioBufferSourceNode | null>(null);
    const earthSound = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        audioContext.current = new AudioContext();
        const loadSound = async (url: string) => {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return audioContext.current!.decodeAudioData(arrayBuffer);
        };
        // Placeholder URLs for royalty-free sounds
        Promise.all([
            loadSound('https://freesound.org/data/previews/171/171104_71257-lq.mp3'), // Fire whoosh
            loadSound('https://freesound.org/data/previews/242/242501_2065818-lq.mp3'), // Earth rumble
        ]).then(([fireBuffer, earthBuffer]) => {
            fireSound.current = audioContext.current!.createBufferSource();
            fireSound.current.buffer = fireBuffer;
            earthSound.current = audioContext.current!.createBufferSource();
            earthSound.current.buffer = earthBuffer;
        }).catch((err) => console.error('Audio load error:', err));
        return () => {
            audioContext.current?.close();
        };
    }, []);

    const playSound = (zodiacSign: 'Aries' | 'Taurus') => {
        if (audioContext.current) {
            const source = audioContext.current.createBufferSource();
            const buffer = zodiacSign === 'Aries' ? fireSound.current?.buffer : earthSound.current?.buffer;
            if (buffer) {
                source.buffer = buffer;
                source.connect(audioContext.current.destination);
                source.start();
            }
        }
    };

    const handleArenaClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // Simplified click handling without raycasting for now
        if (gameState === 'playing' && selectedUnit === 'aries') {
            const randomX = Math.random() * 8 - 4; // Random position between -4 and 4
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
                battle_duration: Math.floor(Math.random() * 60) + 30, // Simulated duration
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
                            // Stay in place to attack
                            target = unit.position;
                        } else if (distance < 5) {
                            // Move toward Aries
                            target = aries.position;
                        } else {
                            // Random movement
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

    return (
        <div className={styles.zodiacArenaMain}>
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }} onClick={handleArenaClick}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} intensity={1} />
                <Arena ref={arenaRef} />
                {units.map((unit) => {
                    // Calculate shake without hook - simple boolean based animation
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
                            {unit.health > 0 && unit.id !== selectedUnit && new THREE.Vector3(...unit.position).distanceTo(new THREE.Vector3(...units.find((u) => u.id !== unit.id && u.health > 0)!.position)) <= 2 && (
                                <mesh position={[unit.position[0], unit.position[1] + 0.5, unit.position[2]]}>
                                    <sphereGeometry args={[0.1, 8, 8]} />
                                    <meshStandardMaterial
                                        color={unit.zodiacSign === 'Aries' ? '#ef4444' : '#8b4513'}
                                        emissive={unit.zodiacSign === 'Aries' ? '#ef4444' : '#8b4513'}
                                        emissiveIntensity={0.3}
                                        transparent
                                        opacity={0.6}
                                    />
                                </mesh>
                            )}
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
            <div className={`${styles.cosmicUiPanel} ${styles.arenaUiLeft}`}>
                <h3 className={styles.arenaTitle}>Select Unit</h3>
                {units.map((unit) => (
                    <div key={unit.id} className={styles.unitSelector}>
                        <button
                            className={styles.cosmicButton}
                            onClick={() => setSelectedUnit(unit.id)}
                            disabled={unit.id !== 'aries' || gameState === 'ended'}
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
                            className={`${styles.cosmicButton} ${styles.victoryButton}`}
                            onClick={shareVictory}
                        >
                            Share Victory 🌟
                        </button>
                        <button
                            className={`${styles.cosmicButton} ${styles.victoryButton}`}
                            onClick={restartGame}
                        >
                            Restart Game
                        </button>
                    </>
                )}
            </div>
            <div className={`${styles.cosmicUiPanel} ${styles.arenaUiRight}`}>
                <h3 className={styles.arenaTitle}>Combat Log</h3>
                {combatLog.slice(-5).map((log, logIndex) => (
                    <p key={`log-${logIndex}-${log.substring(0, 20)}`} className={styles.unitStats}>{log}</p>
                ))}
            </div>
        </div>
    );
};

export default ZodiacArenaPrototype;
