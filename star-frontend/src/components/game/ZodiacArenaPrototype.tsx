import { Particles, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EnhancedPlanetButton } from '../cosmic/EnhancedPlanetButton';
import './universal-space.css';

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

const Arena: React.FC = () => {
    return (
        <group>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[10, 0.1, 10]} />
                <meshStandardMaterial color="#0a0a1a" transparent opacity={0.9} />
            </mesh>
            <Stars radius={20} depth={20} count={500} factor={2} saturation={0} fade />
        </group>
    );
};

const ZodiacArenaPrototype: React.FC = () => {
    const { camera, raycaster, pointer } = useThree();
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
            source.buffer = zodiacSign === 'Aries' ? fireSound.current?.buffer : earthSound.current?.buffer;
            source.connect(audioContext.current.destination);
            source.start();
        }
    };

    const handleArenaClick = (event: MouseEvent) => {
        if (gameState === 'playing' && selectedUnit === 'aries') {
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(arenaRef.current?.children || []);
            if (intersects.length > 0) {
                const point = intersects[0].point;
                setUnits((prevUnits) =>
                    prevUnits.map((unit) =>
                        unit.id === 'aries'
                            ? { ...unit, targetPosition: [Math.max(-5, Math.min(5, point.x)), 0.7, Math.max(-5, Math.min(5, point.z))] }
                            : unit
                    )
                );
            }
        }
    };

    const addDamagePopup = (targetId: string, value: number, position: [number, number, number]) => {
        setDamagePopups((prev) => [
            ...prev,
            { id: `${targetId}-${Date.now()}`, value, position: [position[0], position[1] + 1.2, position[2]], createdAt: Date.now() },
        ]);
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
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
                                <Particles
                                    count={10}
                                    size={unit.zodiacSign === 'Aries' ? 0.04 : 0.06}
                                    color={unit.zodiacSign === 'Aries' ? '#ef4444' : '#8b4513'}
                                    speed={2}
                                    spread={1}
                                    opacity={0.6}
                                />
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
            <div className="cosmic-ui-panel" style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '1rem' }}>
                <h3 style={{ color: '#fef3c7', margin: 0 }}>Select Unit</h3>
                {units.map((unit) => (
                    <div key={unit.id} style={{ marginTop: '0.5rem' }}>
                        <button
                            className="cosmic-button"
                            onClick={() => setSelectedUnit(unit.id)}
                            disabled={unit.id !== 'aries' || gameState === 'ended'}
                        >
                            {unit.zodiacSign}
                        </button>
                        <p style={{ color: '#fef3c7', margin: '0.2rem 0' }}>
                            Damage: {unit.damage} | HP: {Math.round(unit.health)}
                        </p>
                    </div>
                ))}
                {gameState === 'ended' && (
                    <button
                        className="cosmic-button"
                        style={{ marginTop: '0.5rem' }}
                        onClick={restartGame}
                    >
                        Restart Game
                    </button>
                )}
            </div>
            <div className="cosmic-ui-panel" style={{ position: 'absolute', bottom: '1rem', right: '1rem', padding: '1rem' }}>
                <h3 style={{ color: '#fef3c7', margin: 0 }}>Combat Log</h3>
                {combatLog.slice(-5).map((log, index) => (
                    <p key={index} style={{ color: '#fef3c7', margin: '0.2rem 0' }}>{log}</p>
                ))}
            </div>
        </div>
    );
};

export default ZodiacArenaPrototype;
