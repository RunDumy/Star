/// <reference path="../../global.d.ts" />
import { Line, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EnhancedPlanetButton } from '../cosmic/EnhancedPlanetButton';
import { ArchetypeSystem } from './ArchetypeSystem';
import { ConstellationMap } from './ConstellationMap';
import { EmotionalEngine } from './EmotionalEngine';
import Leaderboards from './Leaderboards';

// Temporary Three.js JSX declarations
declare global {
    namespace JSX {
        interface IntrinsicElements {
            ambientLight: any;
            pointLight: any;
            mesh: any;
            sphereGeometry: any;
            meshStandardMaterial: any;
            meshBasicMaterial: any;
            ringGeometry: any;
            points: any;
            bufferGeometry: any;
            bufferAttribute: any;
            pointsMaterial: any;
            group: any;
            planeGeometry: any;
            cylinderGeometry: any;
            line: any;
            lineBasicMaterial: any;
            primitive: any;
            circleGeometry: any;
            boxGeometry: any;
        }
    }
}

interface Unit {
    id: string;
    zodiacSign: string;
    position: [number, number, number];
    health: number;
    maxHealth: number;
    energy: number;
    isPlayer: boolean;
}

interface Resonance {
    id: string;
    zodiacSign: string;
    role: string;
    rp: number;
    tier: number;
    skills: { id: string; name: string; level: number; cost: number }[];
}

interface Wave {
    id: string;
    enemies: Unit[];
    obstacles: { id: string; position: [number, number, number] }[];
}

const ZodiacArenaMobile: React.FC = () => {
    const [units, setUnits] = useState<Unit[]>([
        { id: 'aries', zodiacSign: 'Aries', position: [-2, 0, -2], health: 100, maxHealth: 100, energy: 50, isPlayer: true },
    ]);
    const [resonances, setResonances] = useState<Resonance[]>([
        {
            id: 'aries',
            zodiacSign: 'Aries',
            role: 'HERO',
            rp: 0,
            tier: 0,
            skills: [
                { id: 'starstrike', name: 'Starstrike', level: 0, cost: 10 },
                { id: 'cosmic_shield', name: 'Cosmic Shield', level: 0, cost: 15 },
            ],
        },
    ]);
    const [waves, setWaves] = useState<Wave[]>([
        {
            id: 'wave1',
            enemies: [
                { id: 'scorpio1', zodiacSign: 'Scorpio', position: [2, 0, 2], health: 50, maxHealth: 50, energy: 0, isPlayer: false },
                { id: 'scorpio2', zodiacSign: 'Scorpio', position: [0, 0, 2], health: 50, maxHealth: 50, energy: 0, isPlayer: false },
            ],
            obstacles: [{ id: 'asteroid1', position: [1, 0, 0] }],
        },
    ]);
    const [currentWave, setCurrentWave] = useState(0);
    const [gameState, setGameState] = useState<'idle' | 'started' | 'ended'>('idle');
    const [score, setScore] = useState(0);
    const [powerUps, setPowerUps] = useState<{ id: string; position: [number, number, number]; type: 'DAMAGE' | 'SHIELD'; life: number }[]>([]);
    const [particles, setParticles] = useState<{ id: string; position: [number, number, number]; color: string; life: number }[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        if ('vibrate' in navigator) navigator.vibrate([50]);
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        const camera = new THREE.PerspectiveCamera(60, rect.width / rect.height, 0.1, 1000);
        camera.position.set(0, 5, 10);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        plane.position.set(0, 0, 0);
        const intersects = raycaster.intersectObject(plane);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            const aries = units.find((u) => u.id === 'aries');
            if (aries && aries.energy >= 10) {
                setParticles((prev) => [
                    ...prev,
                    { id: `starstrike-${Date.now()}`, position: [aries.position[0], 0.5, aries.position[2]], color: '#ef4444', life: 0.5 },
                ]);
                setUnits((prev) =>
                    prev.map((unit) =>
                        !unit.isPlayer && Math.hypot(point.x - unit.position[0], point.z - unit.position[2]) < 1
                            ? { ...unit, health: unit.health - (10 + resonances.find((r) => r.id === 'aries')!.skills.find((s) => s.id === 'starstrike')!.level * 5) }
                            : unit.id === 'aries'
                                ? { ...unit, energy: unit.energy - 10 }
                                : unit
                    )
                );
                setScore((prev) => prev + 10);
            }
        }
    };

    useEffect(() => {
        if (waves[currentWave]?.enemies.every((e) => e.health <= 0)) {
            setScore((prev) => prev + 100);
            setResonances((prev) => prev.map((r) => (r.id === 'aries' ? { ...r, rp: r.rp + 20 } : r)));
            setPowerUps((prev) => [
                ...prev,
                { id: `powerup-${Date.now()}`, position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2], type: 'DAMAGE', life: 10 },
            ]);
            setCurrentWave((prev) => prev + 1);
            if (currentWave + 1 < waves.length) {
                setUnits((prev) => [...prev.filter((u) => u.isPlayer), ...waves[currentWave + 1].enemies]);
            } else {
                setGameState('ended');
            }
        }
    }, [units, currentWave, waves]);

    const collectPowerUp = (id: string, type: string) => {
        if (type === 'DAMAGE') {
            setResonances((prev) =>
                prev.map((r) => (r.id === 'aries' ? { ...r, skills: r.skills.map((s) => (s.id === 'starstrike' ? { ...s, level: Math.min(s.level + 1, 3) } : s)) } : r))
            );
        }
        setPowerUps((prev) => prev.filter((p) => p.id !== id));
        setScore((prev) => prev + 50);
    };

    const upgradeSkill = (skillId: string) => {
        const ariesResonance = resonances.find((r) => r.id === 'aries');
        if (ariesResonance && ariesResonance.rp >= 50) {
            setResonances((prev) =>
                prev.map((r) =>
                    r.id === 'aries'
                        ? {
                            ...r,
                            rp: r.rp - 50,
                            skills: r.skills.map((s) => (s.id === skillId && s.level < 3 ? { ...s, level: s.level + 1 } : s)),
                        }
                        : r
                )
            );
        }
    }; useFrame((state, delta) => {
        setParticles((prev) => prev.map((p) => ({ ...p, life: p.life - delta })).filter((p) => p.life > 0));
        setPowerUps((prev) => prev.map((p) => ({ ...p, life: p.life - delta })).filter((p) => p.life > 0));
        setUnits((prev) =>
            prev.map((u) => {
                const hasShield = resonances.find((r) => r.id === 'aries')?.skills.find((s) => s.id === 'cosmic_shield')?.level > 0;
                if (!u.isPlayer) {
                    const player = prev.find((p) => p.isPlayer);
                    if (!player) return u;
                    const dx = player.position[0] - u.position[0];
                    const dz = player.position[2] - u.position[2];
                    const dist = Math.hypot(dx, dz);
                    if (dist > 0.1) {
                        const speed = 0.2 * (1 + currentWave * 0.1);
                        return { ...u, position: [u.position[0] + dx / dist * speed * delta, 0, u.position[2] + dz / dist * speed * delta] };
                    }
                }
                const obstacleCollision = waves[currentWave]?.obstacles.some((o) => Math.hypot(u.position[0] - o.position[0], u.position[2] - o.position[2]) < 0.5);
                return {
                    ...u,
                    energy: Math.min(u.energy + delta * 10, 50),
                    health: u.isPlayer && hasShield ? Math.min(u.health + delta * 2, u.maxHealth) : obstacleCollision ? u.health - delta * 5 : u.health,
                };
            })
        );
    });

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <Canvas ref={canvasRef} camera={{ position: [0, 5, 10], fov: 60 }} gl={{ antialias: false }} onTouchStart={handleTouchStart}>
                <Stars radius={50} count={300} factor={4} saturation={0} fade />
                {units.map((unit) => (
                    <group key={unit.id} position={unit.position}>
                        <mesh>
                            <sphereGeometry args={[0.5, 16, 16]} />
                            <meshStandardMaterial color={unit.zodiacSign === 'Aries' ? '#ef4444' : '#b91c1c'} />
                        </mesh>
                        <Text position={[0, 1, 0]} fontSize={0.2} color="#fef3c7" anchorX="center" anchorY="middle">
                            {`${unit.zodiacSign} (${unit.health}/${unit.maxHealth} | E:${unit.energy})`}
                        </Text>
                        <Line points={[[-0.5, 0.7, 0], [0.5, 0.7, 0]]} color="#fef3c7" lineWidth={2} />
                        <Line points={[[-0.5, 0.7, 0], [-0.5 + (unit.health / unit.maxHealth), 0.7, 0]]} color="#10b981" lineWidth={2} />
                        <Line points={[[-0.5, 0.9, 0], [0.5, 0.9, 0]]} color="#06b6d4" lineWidth={1} />
                        <Line points={[[-0.5, 0.9, 0], [-0.5 + (unit.energy / 50), 0.9, 0]]} color="#06b6d4" lineWidth={1} />
                    </group>
                ))}
                {waves[currentWave]?.obstacles.map((obstacle) => (
                    <mesh key={obstacle.id} position={obstacle.position}>
                        <boxGeometry args={[0.5, 0.5, 0.5]} />
                        <meshStandardMaterial color="#6b7280" />
                    </mesh>
                ))}
                {powerUps.map((p) => (
                    <mesh key={p.id} position={p.position} onClick={() => collectPowerUp(p.id, p.type)}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshBasicMaterial color={p.type === 'DAMAGE' ? '#f59e0b' : '#10b981'} />
                        <Text position={[0, 0.3, 0]} fontSize={0.15} color="#fef3c7">
                            {p.type}
                        </Text>
                    </mesh>
                ))}
                {particles.map((p) => (
                    <mesh key={p.id} position={p.position}>
                        <circleGeometry args={[0.2, 16]} />
                        <meshBasicMaterial color={p.color} transparent opacity={p.life / 0.5} />
                    </mesh>
                ))}
                <ArchetypeSystem playerId="aries" resonances={resonances} setResonances={setResonances} />
                <EmotionalEngine gameState={gameState} winner={gameState === 'ended' && units.find((u) => u.isPlayer)?.health! > 0 ? 'Aries' : null} resonances={resonances} />
                <ConstellationMap setResonances={setResonances} />
            </Canvas>
            <div className="cosmic-ui-panel mobile-controls" style={{ position: 'absolute', bottom: '1rem', left: '1rem', padding: '0.5rem', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px' }}>
                <EnhancedPlanetButton
                    text={gameState === 'idle' ? 'Start Wave' : 'Toggle UI 📱/❌'}
                    color="#f59e0b"
                    onClick={() => {
                        if (gameState === 'idle') {
                            setGameState('started');
                            setUnits((prev) => [...prev, ...waves[currentWave].enemies]);
                        } else {
                            document.querySelector('.cosmic-ui-panel')?.classList.toggle('hidden');
                        }
                    }}
                    size={0.8}
                />
                {resonances.find((r) => r.id === 'aries')?.skills.map((skill) => (
                    <EnhancedPlanetButton
                        key={skill.id}
                        text={`Upgrade ${skill.name} (L${skill.level})`}
                        color="#ef4444"
                        onClick={() => upgradeSkill(skill.id)}
                        size={0.6}
                    />
                ))}
            </div>
            <Leaderboards score={score} />
        </div>
    );
};

export default ZodiacArenaMobile;
