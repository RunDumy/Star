import { Line, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { EnhancedPlanetButton } from '../cosmic/EnhancedPlanetButton';
import styles from './ZodiacArenaEnhanced.module.css';

// 🎵 CODE-ONLY SOUND MANAGER - Web Audio API Synthesis
class SoundManager {
    private context: AudioContext | null = null;

    private getContext(): AudioContext {
        this.context ??= new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
        return this.context;
    }

    // Portal whoosh - synthesized
    playPortalSound() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.warn('Audio not available for portal sound:', e);
            // Continue silently - this is expected behavior when audio is disabled
        }
    }

    // Fire attack - noise-based
    playFireAttack() {
        try {
            const ctx = this.getContext();
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 8);
            }

            const source = ctx.createBufferSource();
            const gain = ctx.createGain();

            source.buffer = buffer;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            source.connect(gain);
            gain.connect(ctx.destination);

            source.start();
        } catch (e) {
            console.warn('Audio not available for fire attack:', e);
            // Continue silently - this is expected behavior when audio is disabled
        }
    }

    // Victory fanfare - chord progression
    playVictory() {
        try {
            const ctx = this.getContext();
            const frequencies = [523.25, 659.25, 783.99]; // C, E, G major chord

            frequencies.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
                gain.gain.setValueAtTime(0.08, ctx.currentTime + index * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + index * 0.1);
                osc.stop(ctx.currentTime + 1.0);
            });
        } catch (e) {
            console.warn('Audio not available for victory fanfare:', e);
            // Continue silently - this is expected behavior when audio is disabled
        }
    }

    // Earth Slam bass thump
    playEarthSlam() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.warn('Audio not available for level up sound:', e);
            // Continue silently - this is expected behavior when audio is disabled
        }
    }
}

// 🎨 CODE-ONLY PARTICLE TEXTURE GENERATOR
const createParticleTexture = (color: string, size: number = 64): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color + '88'); // Add transparency
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
};

// 🌟 ZODIAC CONSTELLATION PATTERNS - Code-Generated
const getZodiacConstellation = (sign: string): [number, number, number][] => {
    const patterns: Record<string, [number, number, number][]> = {
        Aries: [
            [0, 0, 0], [0.5, 0.8, 0], [1, 1.2, 0], [0.3, 1.5, 0]
        ],
        Taurus: [
            [0, 0, 0], [0.8, 0.2, 0], [1.2, 0.8, 0], [0.6, 1.2, 0], [0.2, 0.9, 0]
        ],
        Gemini: [
            [0, 0, 0], [0.4, 0.6, 0], [0.8, 0.3, 0], [1.2, 0.9, 0], [0.6, 1.5, 0], [1, 1.8, 0]
        ],
        Cancer: [
            [0, 0, 0], [0.3, 0.4, 0], [0.6, 0.2, 0], [0.9, 0.6, 0], [0.4, 1.0, 0]
        ],
        Scorpio: [
            [0, 0, 0], [0.4, 0.3, 0], [0.8, 0.1, 0], [1.2, 0.5, 0], [1.6, 0.8, 0], [1.8, 1.2, 0]
        ]
    };

    return patterns[sign] || patterns.Aries;
};

// 🎨 PROCEDURAL PLANET TEXTURE GENERATOR
const createPlanetTexture = (baseColor: string, highlightColor: string, size: number = 256): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const center = size / 2;
    // Create radial gradient for planet sphere effect
    const gradient = ctx.createRadialGradient(center * 0.7, center * 0.7, 0, center, center, center);
    gradient.addColorStop(0, highlightColor);
    gradient.addColorStop(0.7, baseColor);
    gradient.addColorStop(1, '#000000');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add procedural noise for surface texture
    const imageData = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (Math.random() > 0.85) {
            const noise = Math.random() * 40 - 20;
            imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));     // R
            imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise)); // G  
            imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise)); // B
        }
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
};

import { ConstellationMap } from './ConstellationMap';
import { EmotionalEngine } from './EmotionalEngine';
import { FeedbackForm } from './FeedbackForm';

// Enhanced interfaces for RPG elements
interface Unit {
    id: string;
    zodiacSign: 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Scorpio';
    position: [number, number, number];
    health: number;
    maxHealth: number;
    energy: number; // New: For shooter abilities
    level: number;
    experience: number;
    targetPosition?: [number, number, number];
    lastAttackTime: number;
    damage: number;
    defense: number;
    energyRegenRate: number;
    isPlayer?: boolean;
    isBoss?: boolean;
    moveSpeed?: number;
    lastSpecialAttack?: number;
}

interface Skill {
    id: string;
    name: string;
    level: number;
    cost: number;
    damage?: number;
    healing?: number;
    defense?: number;
    wisdom?: number;
    buff?: number;
}

interface Resonance {
    id: string;
    zodiacSign: 'Aries' | 'Taurus' | 'Gemini' | 'Cancer';
    role: 'HERO' | 'SAGE' | 'TRICKSTER' | 'CAREGIVER';
    rp: number;
    tier: number;
    skills: Skill[];
    purchasedItems: string[];
}

interface Quest {
    id: string;
    zodiacSign: string;
    name: string;
    description: string;
    progress: number;
    goal: number;
    reward: { type: 'STARDUST' | 'SKIN' | 'EMOTE' | 'RP'; value: number };
    completed: boolean;
}

interface Particle {
    id: string;
    position: [number, number, number];
    velocity: [number, number, number];
    color: string;
    life: number;
    maxLife: number;
    size: number;
    type: 'bolt' | 'explosion' | 'heal' | 'touch';
}

interface LeaderboardEntry {
    id: string;
    name: string;
    rp: number;
    tier: 'Bronze' | 'Silver' | 'Gold';
    zodiacSign: string;
}

const ZodiacArenaEnhanced: React.FC = () => {
    // 🎵 Sound Manager - Code-Generated Audio
    const soundManager = useRef(new SoundManager());

    // 🎨 Procedural Asset Cache
    const particleTextures = useRef<Map<string, THREE.Texture>>(new Map());
    const planetTextures = useRef<Map<string, THREE.Texture>>(new Map());

    // Generate particle texture on demand
    const getParticleTexture = (color: string) => {
        if (!particleTextures.current.has(color)) {
            particleTextures.current.set(color, createParticleTexture(color));
        }
        return particleTextures.current.get(color)!;
    };

    // Generate planet texture on demand  
    const getPlanetTexture = (baseColor: string, highlightColor?: string) => {
        const key = `${baseColor}-${highlightColor || baseColor}`;
        if (!planetTextures.current.has(key)) {
            planetTextures.current.set(key, createPlanetTexture(baseColor, highlightColor || baseColor));
        }
        return planetTextures.current.get(key)!;
    };

    // Core game state
    const [units, setUnits] = useState<Unit[]>([
        {
            id: 'aries',
            zodiacSign: 'Aries',
            position: [-2, 0.7, -2],
            health: 100,
            maxHealth: 100,
            energy: 50,
            level: 1,
            experience: 0,
            lastAttackTime: 0,
            damage: 15,
            defense: 10,
            energyRegenRate: 12
        },
        {
            id: 'taurus',
            zodiacSign: 'Taurus',
            position: [2, 0.7, 2],
            health: 120,
            maxHealth: 120,
            energy: 40,
            level: 1,
            experience: 0,
            lastAttackTime: 0,
            damage: 12,
            defense: 15,
            energyRegenRate: 10
        },
        {
            id: 'gemini',
            zodiacSign: 'Gemini',
            position: [-2, 0.7, 2],
            health: 90,
            maxHealth: 90,
            energy: 60,
            level: 1,
            experience: 0,
            lastAttackTime: 0,
            damage: 10,
            defense: 8,
            energyRegenRate: 15
        },
        {
            id: 'cancer',
            zodiacSign: 'Cancer',
            position: [2, 0.7, -2],
            health: 110,
            maxHealth: 110,
            energy: 45,
            level: 1,
            experience: 0,
            lastAttackTime: 0,
            damage: 8,
            defense: 18,
            energyRegenRate: 11
        },
    ]);

    // RPG progression system
    const [resonances, setResonances] = useState<Resonance[]>([
        {
            id: 'aries',
            zodiacSign: 'Aries',
            role: 'HERO',
            rp: 150, // Starting with some RP for demonstration
            tier: 1,
            skills: [
                { id: 'fiery_bolt', name: 'Fiery Bolt', level: 1, cost: 10, damage: 15 },
                { id: 'blaze_aura', name: 'Blaze Aura', level: 0, cost: 20, damage: 8 },
                { id: 'ram_charge', name: 'Ram Charge', level: 0, cost: 25, damage: 20 },
            ],
            purchasedItems: []
        },
        {
            id: 'taurus',
            zodiacSign: 'Taurus',
            role: 'CAREGIVER',
            rp: 100,
            tier: 0,
            skills: [
                { id: 'earth_shield', name: 'Earth Shield', level: 0, cost: 15, defense: 10 },
                { id: 'heal_aura', name: 'Healing Aura', level: 1, cost: 25, healing: 20 },
                { id: 'root_bind', name: 'Root Bind', level: 0, cost: 20, damage: 5 },
            ],
            purchasedItems: []
        },
        {
            id: 'gemini',
            zodiacSign: 'Gemini',
            role: 'SAGE',
            rp: 75,
            tier: 0,
            skills: [
                { id: 'puzzle_solve', name: 'Puzzle Solve', level: 1, cost: 15, wisdom: 10 },
                { id: 'twin_strike', name: 'Twin Strike', level: 0, cost: 20, damage: 12 },
                { id: 'knowledge_buff', name: 'Knowledge Buff', level: 0, cost: 30, buff: 15 },
            ],
            purchasedItems: []
        },
        {
            id: 'cancer',
            zodiacSign: 'Cancer',
            role: 'CAREGIVER',
            rp: 90,
            tier: 0,
            skills: [
                { id: 'lunar_heal', name: 'Lunar Heal', level: 1, cost: 20, healing: 25 },
                { id: 'protective_shell', name: 'Protective Shell', level: 0, cost: 25, defense: 15 },
                { id: 'tidal_wave', name: 'Tidal Wave', level: 0, cost: 35, damage: 18 },
            ],
            purchasedItems: []
        },
    ]);

    // Quest system
    const [quests, setQuests] = useState<Quest[]>([
        {
            id: 'aries_hero_path',
            zodiacSign: 'Aries',
            name: 'Path of the Hero',
            description: 'Defeat 10 enemies to prove your valor in cosmic battle.',
            progress: 0,
            goal: 10,
            reward: { type: 'STARDUST', value: 50 },
            completed: false
        },
        {
            id: 'taurus_guardian_path',
            zodiacSign: 'Taurus',
            name: 'Guardian\'s Duty',
            description: 'Heal allies 5 times to master the caregiver\'s art.',
            progress: 0,
            goal: 5,
            reward: { type: 'RP', value: 75 },
            completed: false
        },
        {
            id: 'gemini_sage_path',
            zodiacSign: 'Gemini',
            name: 'Path of the Sage',
            description: 'Solve 7 cosmic puzzles to unlock twin wisdom.',
            progress: 0,
            goal: 7,
            reward: { type: 'RP', value: 100 },
            completed: false
        },
        {
            id: 'cancer_lunar_path',
            zodiacSign: 'Cancer',
            name: 'Lunar Guardian',
            description: 'Protect allies with shields 8 times to master lunar arts.',
            progress: 0,
            goal: 8,
            reward: { type: 'STARDUST', value: 85 },
            completed: false
        }
    ]);

    // Leaderboard system
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
        { id: 'player1', name: 'Cosmic Warrior', rp: 850, tier: 'Gold', zodiacSign: 'Leo' },
        { id: 'player2', name: 'Star Guardian', rp: 420, tier: 'Silver', zodiacSign: 'Virgo' },
        { id: 'aries', name: 'Fire Ram', rp: 150, tier: 'Bronze', zodiacSign: 'Aries' },
        { id: 'taurus', name: 'Earth Bull', rp: 100, tier: 'Bronze', zodiacSign: 'Taurus' },
        { id: 'gemini', name: 'Twin Sage', rp: 75, tier: 'Bronze', zodiacSign: 'Gemini' },
        { id: 'cancer', name: 'Lunar Shell', rp: 90, tier: 'Bronze', zodiacSign: 'Cancer' }
    ]);

    // Visual effects
    const [particles, setParticles] = useState<Particle[]>([]);
    const [gameState, setGameState] = useState<'idle' | 'started' | 'ended'>('started');
    const [winner, setWinner] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string>('aries');
    const [showStore, setShowStore] = useState(false);
    const [showConstellations, setShowConstellations] = useState(false);
    const [combatStreak, setCombatStreak] = useState(0);

    // Wave system for Taurus Stage and progression
    const [currentWave, setCurrentWave] = useState<number>(1);
    const [waveEnemies, setWaveEnemies] = useState<Unit[]>([]);
    const [obstacles, setObstacles] = useState<{ id: string; position: [number, number, number] }[]>([]);
    const [score, setScore] = useState<number>(0);
    const [waveActive, setWaveActive] = useState<boolean>(false);

    // Particle effects for visual feedback
    const [earthSlamParticles, setEarthSlamParticles] = useState<Array<{
        id: string;
        position: [number, number, number];
        velocity: [number, number, number];
        life: number;
        maxLife: number;
        color: string;
    }>>([]);

    // 🎨 Visual Effects State - Replaces Audio with Visuals
    const [screenShake, setScreenShake] = useState(0);
    const [flashColor, setFlashColor] = useState<string | null>(null);
    const [victoryParticles, setVictoryParticles] = useState<Particle[]>([]);

    // 🎵 Visual Sound System - Audio Alternatives
    const playVisualSound = (type: 'portal' | 'attack' | 'victory' | 'earthSlam', position: [number, number, number] = [0, 0, 0]) => {
        switch (type) {
            case 'portal':
                // Portal visual effect + optional audio
                setParticles(prev => [...prev, {
                    id: `portal-vfx-${Date.now()}`,
                    position: position,
                    velocity: [0, 2, 0],
                    color: '#06b6d4',
                    life: 0.7,
                    maxLife: 0.7,
                    size: 0.8,
                    type: 'explosion'
                }]);
                soundManager.current.playPortalSound();
                break;

            case 'attack':
                // Screen shake + flash + optional audio
                setScreenShake(0.3);
                setFlashColor('#ef4444');
                setTimeout(() => setFlashColor(null), 100);
                soundManager.current.playFireAttack();
                if ('vibrate' in navigator) navigator.vibrate([30]);
                break;

            case 'earthSlam':
                // Massive screen shake + brown flash + optional audio
                setScreenShake(0.6);
                setFlashColor('#8b4513');
                setTimeout(() => setFlashColor(null), 200);
                soundManager.current.playEarthSlam();
                if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
                break;

            case 'victory':
                // Starburst explosion + optional audio
                setVictoryParticles(Array.from({ length: 30 }, (_, i) => ({
                    id: `victory-${i}`,
                    position: [Math.random() * 4 - 2, Math.random() * 4 + 1, Math.random() * 4 - 2],
                    velocity: [(Math.random() - 0.5) * 6, Math.random() * 4 + 2, (Math.random() - 0.5) * 6],
                    color: ['#f59e0b', '#ef4444', '#06b6d4', '#10b981'][i % 4],
                    life: 1.5 + Math.random(),
                    maxLife: 1.5 + Math.random(),
                    size: 0.4 + Math.random() * 0.6,
                    type: 'explosion'
                })));
                soundManager.current.playVictory();
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
                break;
        }
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // 🎉 Victory Effects Trigger
    React.useEffect(() => {
        if (gameState === 'ended' && winner) {
            // Trigger victory visual celebration
            playVisualSound('victory', [0, 2, 0]);

            // Add confetti-like particle burst
            setTimeout(() => {
                playVisualSound('victory', [2, 3, 0]);
            }, 500);

            setTimeout(() => {
                playVisualSound('victory', [-2, 3, 0]);
            }, 1000);
        }
    }, [gameState, winner]);

    // Enhanced touch/click handling for shooter mechanics
    const handleArenaInteraction = (event: React.TouchEvent | React.MouseEvent) => {
        if (gameState !== 'started' || !selectedUnit) return;

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
        } else return;

        // Convert to world coordinates
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const camera = new THREE.PerspectiveCamera(60, rect.width / rect.height, 0.1, 1000);
        camera.position.set(0, 5, 10);
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        plane.position.set(0, 0, 0);
        plane.rotation.x = -Math.PI / 2;

        const intersects = raycaster.intersectObject(plane);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            const shooter = units.find(u => u.id === selectedUnit);

            if (shooter && shooter.energy >= 10) {
                fireProjectile(shooter, [point.x, 0.7, point.z]);

                // Haptic feedback
                if ('vibrate' in navigator) navigator.vibrate(50);
            }
        }
    };

    // Shooter mechanics - projectile system
    const fireProjectile = (shooter: Unit, targetPos: [number, number, number]) => {
        const skill = resonances.find(r => r.id === shooter.id)?.skills.find(s => s.id === 'fiery_bolt');
        if (!skill || skill.level === 0) return;

        const damage = (skill.damage || 10) + (skill.level * 5);
        const energyCost = Math.max(5, skill.cost - skill.level * 2);

        // Create projectile particle
        const direction = [
            targetPos[0] - shooter.position[0],
            0,
            targetPos[2] - shooter.position[2]
        ] as [number, number, number];
        const distance = Math.sqrt(direction[0] ** 2 + direction[2] ** 2);

        if (distance === 0) return;

        // Normalize direction
        direction[0] /= distance;
        direction[2] /= distance;

        const projectile: Particle = {
            id: `projectile_${Date.now()}`,
            position: [shooter.position[0], shooter.position[1], shooter.position[2]],
            velocity: [direction[0] * 8, 0, direction[2] * 8], // Speed: 8 units/second
            color: shooter.zodiacSign === 'Aries' ? '#ef4444' : '#06b6d4',
            life: 2.0,
            maxLife: 2.0,
            size: 0.15,
            type: 'bolt'
        };

        setParticles(prev => [...prev, projectile]);

        // 🎵 Visual + Audio Feedback for Attack
        playVisualSound('attack', shooter.position);

        // Consume energy
        setUnits(prev => prev.map(u =>
            u.id === shooter.id ? { ...u, energy: Math.max(0, u.energy - energyCost) } : u
        ));

        // Check for hits after travel time
        setTimeout(() => {
            setUnits(prev => prev.map(unit => {
                if (unit.id !== shooter.id &&
                    Math.hypot(targetPos[0] - unit.position[0], targetPos[2] - unit.position[2]) < 1.2) {

                    // Apply damage
                    const newHealth = Math.max(0, unit.health - damage);

                    // Create damage popup
                    const damageParticle: Particle = {
                        id: `damage_${Date.now()}`,
                        position: [unit.position[0], unit.position[1] + 1, unit.position[2]],
                        velocity: [0, 2, 0],
                        color: '#ff6b6b',
                        life: 1.5,
                        maxLife: 1.5,
                        size: 0.2,
                        type: 'explosion'
                    };

                    setParticles(prev => [...prev, damageParticle]);

                    // Update quest progress
                    updateQuestProgress(shooter.zodiacSign, 'DEFEAT_ENEMY');

                    // Update combat streak
                    setCombatStreak(prev => prev + 1);

                    return { ...unit, health: newHealth };
                }
                return unit;
            }));
        }, distance / 8 * 1000); // Travel time based on distance and speed
    };

    // Quest progression system
    const updateQuestProgress = (zodiacSign: string, action: 'DEFEAT_ENEMY' | 'HEAL_ALLY' | 'USE_ABILITY') => {
        setQuests(prev => prev.map(quest => {
            if (quest.zodiacSign === zodiacSign && !quest.completed) {
                const newProgress = Math.min(quest.progress + 1, quest.goal);
                const completed = newProgress >= quest.goal;

                if (completed && !quest.completed) {
                    // Grant reward
                    if (quest.reward.type === 'RP') {
                        setResonances(prevRes => prevRes.map(r =>
                            r.zodiacSign === zodiacSign ? { ...r, rp: r.rp + quest.reward.value } : r
                        ));
                    }

                    // Update leaderboard
                    setLeaderboard(prevLead => prevLead.map(entry =>
                        entry.id === zodiacSign.toLowerCase()
                            ? { ...entry, rp: entry.rp + quest.reward.value, tier: getTierFromRP(entry.rp + quest.reward.value) }
                            : entry
                    ));
                }

                return { ...quest, progress: newProgress, completed };
            }
            return quest;
        }));
    };

    // Skill upgrade system
    const upgradeSkill = (unitId: string, skillId: string) => {
        const resonance = resonances.find(r => r.id === unitId);
        const skill = resonance?.skills.find(s => s.id === skillId);

        if (!resonance || !skill || skill.level >= 5) return;

        const upgradeCost = 50 + (skill.level * 25);

        if (resonance.rp >= upgradeCost) {
            setResonances(prev => prev.map(r =>
                r.id === unitId ? {
                    ...r,
                    rp: r.rp - upgradeCost,
                    skills: r.skills.map(s =>
                        s.id === skillId ? { ...s, level: s.level + 1 } : s
                    )
                } : r
            ));
        }
    };

    // Store system for monetization
    const purchaseItem = async (itemId: string, price: number, type: 'BOOST' | 'COSMETIC') => {
        try {
            // In production, this would integrate with payment processing
            const purchase = {
                user_id: 'demo-user',
                item_id: itemId,
                type,
                value: type === 'BOOST' ? 1.5 : 1, // 50% RP boost or cosmetic
                timestamp: new Date().toISOString()
            };

            // Simulate API call
            console.log('Purchase attempted:', purchase);

            // Apply boost immediately for demo
            if (type === 'BOOST') {
                setResonances(prev => prev.map(r => ({ ...r, rp: Math.floor(r.rp * 1.5) })));
            }

            alert(`Successfully purchased ${itemId}!`);
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        }
    };

    // Wave generation system for Taurus Stage
    const generateWave = (waveNumber: number) => {
        const isAriesStage = waveNumber <= 10;
        const isTaurusStage = waveNumber >= 11 && waveNumber <= 20;
        const isBossWave = waveNumber === 20;

        // Base enemy count + progression scaling
        const baseEnemies = isAriesStage ? 2 : 7; // Taurus Stage: +5 enemies per wave
        const enemyCount = baseEnemies + Math.floor(waveNumber / 2);

        const enemies: Unit[] = [];

        if (isBossWave) {
            // Taurus Boss: 200 HP, Earth Slam ability
            enemies.push({
                id: 'taurus_boss',
                zodiacSign: 'Taurus',
                position: [0, 0.7, 2],
                health: 200,
                maxHealth: 200,
                energy: 50,
                level: 3,
                experience: 0,
                lastAttackTime: 0,
                damage: 25,
                defense: 20,
                energyRegenRate: 15,
                isPlayer: false,
                isBoss: true,
                moveSpeed: 0.2,
                lastSpecialAttack: 0
            });
        } else {
            // Generate Scorpio drones
            for (let i = 0; i < enemyCount; i++) {
                enemies.push({
                    id: `scorpio_${waveNumber}_${i}`,
                    zodiacSign: 'Scorpio',
                    position: [
                        (Math.random() - 0.5) * 6,
                        0.7,
                        (Math.random() - 0.5) * 6
                    ],
                    health: isTaurusStage ? 60 : 50,
                    maxHealth: isTaurusStage ? 60 : 50,
                    energy: 30,
                    level: 1,
                    experience: 0,
                    lastAttackTime: 0,
                    damage: 8,
                    defense: 5,
                    energyRegenRate: 8,
                    isPlayer: false,
                    isBoss: false,
                    moveSpeed: isTaurusStage ? 0.3 : 0.2, // Faster in Taurus Stage
                    lastSpecialAttack: 0
                });
            }
        }

        // Generate obstacles
        const obstacleCount = isTaurusStage ? 2 : 1; // Double obstacles in Taurus Stage
        const newObstacles: { id: string; position: [number, number, number] }[] = [];

        for (let i = 0; i < obstacleCount; i++) {
            newObstacles.push({
                id: `asteroid_${waveNumber}_${i}`,
                position: [
                    (Math.random() - 0.5) * 4,
                    0.5,
                    (Math.random() - 0.5) * 4
                ]
            });
        }

        setWaveEnemies(enemies);
        setObstacles(newObstacles);
        setWaveActive(true);

        // Update arena visuals based on stage
        const arenaElement = document.querySelector('.cosmic-page-wrapper');
        if (arenaElement && isTaurusStage) {
            (arenaElement as HTMLElement).style.background = '#8b4513'; // Earthy brown
        }
    };

    // Start next wave
    const startNextWave = () => {
        if (currentWave <= 20) {
            generateWave(currentWave);
            setCurrentWave(prev => prev + 1);
        } else {
            setGameState('ended');
            setWinner(selectedUnit);
        }
    };

    // Check wave completion
    const checkWaveCompletion = () => {
        if (waveActive && waveEnemies.every(enemy => enemy.health <= 0)) {
            const isTaurusStage = (currentWave - 1) >= 11;
            const isBossWave = (currentWave - 1) === 20;

            // Award points and RP
            const waveBonus = isTaurusStage ? 150 : 100;
            const rpBonus = isBossWave ? 100 : (isTaurusStage ? 30 : 20);

            setScore(prev => prev + waveBonus);
            setResonances(prev => prev.map(r =>
                r.id === selectedUnit ? { ...r, rp: r.rp + rpBonus } : r
            ));

            // Create reward particles
            const rewardColor = isTaurusStage ? '#8b4513' : '#fef3c7';
            const dustParticle: Particle = {
                id: `wave_complete_${Date.now()}`,
                position: [0, 1, 0],
                velocity: [0, 1, 0],
                color: rewardColor,
                life: 2.0,
                maxLife: 2.0,
                size: 0.3,
                type: 'explosion'
            };

            setParticles(prev => [...prev, dustParticle]);
            setWaveActive(false);

            // Start next wave after delay
            setTimeout(() => {
                startNextWave();
            }, 2000);
        }
    };

    // Taurus Boss Earth Slam ability
    const executeEarthSlam = (boss: Unit, playerUnit: Unit) => {
        const distance = Math.hypot(
            boss.position[0] - playerUnit.position[0],
            boss.position[2] - playerUnit.position[2]
        );

        if (distance <= 2 && boss.energy >= 20 &&
            (!boss.lastSpecialAttack || Date.now() - boss.lastSpecialAttack > 2000)) {

            // Create Earth Slam particle effect
            const slamParticle: Particle = {
                id: `earth_slam_${Date.now()}`,
                position: [playerUnit.position[0], 0.1, playerUnit.position[2]],
                velocity: [0, 0, 0],
                color: '#8b4513',
                life: 1.0,
                maxLife: 1.0,
                size: 2.0, // Large AoE effect
                type: 'explosion'
            };

            setParticles(prev => [...prev, slamParticle]);

            // 🎵 Visual + Audio Feedback for Earth Slam
            playVisualSound('earthSlam', [playerUnit.position[0], 0, playerUnit.position[2]]);

            // Deal AoE damage (10 damage)
            setUnits(prev => prev.map(unit => {
                if (unit.isPlayer &&
                    Math.hypot(unit.position[0] - playerUnit.position[0],
                        unit.position[2] - playerUnit.position[2]) <= 2) {
                    return { ...unit, health: Math.max(0, unit.health - 10) };
                }
                return unit.id === boss.id ?
                    { ...unit, energy: unit.energy - 20, lastSpecialAttack: Date.now() } : unit;
            }));

            // Haptic feedback for mobile
            if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        }
    };

    // Helper functions
    const getTierFromRP = (rp: number): 'Bronze' | 'Silver' | 'Gold' => {
        if (rp >= 500) return 'Gold';
        if (rp >= 100) return 'Silver';
        return 'Bronze';
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Gold': return '#f59e0b';
            case 'Silver': return '#94a3b8';
            case 'Bronze': return '#d4d4d4';
            default: return '#ffffff';
        }
    };

    // Game loop with enhanced mechanics
    const GameLoop: React.FC = () => {
        useFrame((state, delta) => {
            if (gameState !== 'started') return;

            // Update particles
            setParticles(prev => {
                return prev.map(p => ({
                    ...p,
                    position: [
                        p.position[0] + p.velocity[0] * delta,
                        p.position[1] + p.velocity[1] * delta,
                        p.position[2] + p.velocity[2] * delta
                    ] as [number, number, number],
                    life: p.life - delta
                })).filter(p => p.life > 0);
            });

            // Update Earth Slam particles with gravity and bounce
            setEarthSlamParticles(prev => {
                return prev.map(particle => ({
                    ...particle,
                    position: [
                        particle.position[0] + particle.velocity[0] * delta,
                        Math.max(0, particle.position[1] + particle.velocity[1] * delta),
                        particle.position[2] + particle.velocity[2] * delta
                    ] as [number, number, number],
                    velocity: [
                        particle.velocity[0] * 0.95, // Air resistance
                        particle.velocity[1] - 15 * delta, // Gravity
                        particle.velocity[2] * 0.95
                    ] as [number, number, number],
                    life: particle.life - 2 * delta // Fade faster
                })).filter(particle => particle.life > 0);
            });

            // 🎨 Update Visual Effects - Screen Shake & Victory Particles
            if (screenShake > 0) {
                setScreenShake(prev => Math.max(0, prev - delta * 3));
                // Apply camera shake
                if (state.camera) {
                    state.camera.position.x += (Math.random() - 0.5) * screenShake * 0.2;
                    state.camera.position.y += (Math.random() - 0.5) * screenShake * 0.1;
                    state.camera.position.z += (Math.random() - 0.5) * screenShake * 0.2;
                }
            }

            // Update victory particles
            setVictoryParticles(prev => {
                return prev.map(p => ({
                    ...p,
                    position: [
                        p.position[0] + p.velocity[0] * delta,
                        p.position[1] + p.velocity[1] * delta,
                        p.position[2] + p.velocity[2] * delta
                    ] as [number, number, number],
                    velocity: [
                        p.velocity[0] * 0.98,
                        p.velocity[1] - 9.8 * delta, // Gravity
                        p.velocity[2] * 0.98
                    ] as [number, number, number],
                    life: p.life - delta
                })).filter(p => p.life > 0);
            });

            // Wave enemy AI and movement
            if (waveActive) {
                const playerUnit = units.find(u => u.id === selectedUnit && u.isPlayer);

                setWaveEnemies(prev => prev.map(enemy => {
                    if (enemy.health <= 0 || !playerUnit) return enemy;

                    // Calculate direction to player
                    const dx = playerUnit.position[0] - enemy.position[0];
                    const dz = playerUnit.position[2] - enemy.position[2];
                    const distance = Math.hypot(dx, dz);

                    if (distance > 0.1) {
                        const moveSpeed = (enemy.moveSpeed || 0.2) * delta;
                        const newX = enemy.position[0] + (dx / distance) * moveSpeed;
                        const newZ = enemy.position[2] + (dz / distance) * moveSpeed;

                        // Check obstacle collision
                        const hasObstacleCollision = obstacles.some(obstacle =>
                            Math.hypot(newX - obstacle.position[0], newZ - obstacle.position[2]) < 0.8
                        );

                        if (!hasObstacleCollision) {
                            enemy.position = [newX, enemy.position[1], newZ];
                        }
                    }

                    // Taurus Boss special ability - Earth Slam
                    if (enemy.isBoss && enemy.zodiacSign === 'Taurus') {
                        executeEarthSlam(enemy, playerUnit);
                    }

                    // Energy regeneration for enemies
                    return {
                        ...enemy,
                        energy: Math.min(50, enemy.energy + (enemy.energyRegenRate * delta))
                    };
                }));

                // Check wave completion
                checkWaveCompletion();
            }

            // Auto-regenerate energy and health for player units
            setUnits(prev => prev.map(unit => {
                const resonance = resonances.find(r => r.id === unit.id);
                const caregiverNearby = units.some(other =>
                    other.id !== unit.id &&
                    resonances.find(r => r.id === other.id)?.role === 'CAREGIVER' &&
                    Math.hypot(unit.position[0] - other.position[0], unit.position[2] - other.position[2]) < 2
                );

                const energyRegen = unit.energyRegenRate * delta;
                const healthRegen = caregiverNearby ? 5 * delta : 0;

                return {
                    ...unit,
                    energy: Math.min(50, unit.energy + energyRegen),
                    health: Math.min(unit.maxHealth, unit.health + healthRegen)
                };
            }));

            // Check game over condition (player defeated)
            const playerUnit = units.find(u => u.id === selectedUnit && u.isPlayer);
            if (playerUnit && playerUnit.health <= 0) {
                setGameState('ended');
                setWinner(null);
            }
        });

        return null;
    };

    return (
        <div className={`cosmic-page-wrapper ${styles.cosmicPageWrapper}`}>
            <Canvas
                ref={canvasRef}
                camera={{ position: [0, 5, 10], fov: 60 }}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
                performance={{ min: 0.5 }}
                onPointerDown={handleArenaInteraction}
                onTouchStart={handleArenaInteraction}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[4, 4, 4]} intensity={0.8} />

                {/* Arena floor */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[8, 0.1, 8]} />
                    <meshStandardMaterial color="#0a0a1a" transparent opacity={0.9} />
                </mesh>

                {/* Constellation map (when enabled) */}
                {showConstellations && <ConstellationMap setResonances={setResonances} />}

                {/* Regular starfield when constellations disabled */}
                {!showConstellations && <Stars radius={50} count={300} factor={4} saturation={0} fade />}

                {/* Game systems */}
                <GameLoop />
                {/* <ArchetypeSystem playerId={selectedUnit} resonances={resonances} setResonances={setResonances} /> */}
                <EmotionalEngine gameState={gameState} winner={winner} resonances={resonances} />

                {/* Wave Enemies */}
                {waveEnemies.map((enemy) => {
                    // Extract planet type logic
                    let planetType: 'rocky' | 'desert' | 'gas' | 'ice' = 'desert';
                    if (enemy.zodiacSign === 'Scorpio') planetType = 'gas';
                    else if (enemy.zodiacSign === 'Taurus') planetType = 'rocky';

                    return (
                        <group key={enemy.id}>
                            <EnhancedPlanetButton
                                position={enemy.position}
                                planetType={planetType}
                                size={enemy.isBoss ? 1.0 : 0.4}
                                atmosphere={enemy.isBoss}
                                customColor={
                                    enemy.zodiacSign === 'Scorpio' ? '#b91c1c' :
                                        enemy.zodiacSign === 'Taurus' ? '#8b4513' : '#06b6d4'
                                }
                                label={enemy.isBoss ? `${enemy.zodiacSign} Boss` : enemy.zodiacSign}
                                zodiacSign={enemy.zodiacSign}
                                onClick={() => { }}
                                isActive={false}
                            />

                            {/* Enemy Health bar */}
                            <Line
                                points={[
                                    [enemy.position[0] - 0.3, enemy.position[1] + 0.6, enemy.position[2]],
                                    [enemy.position[0] + 0.3, enemy.position[1] + 0.6, enemy.position[2]]
                                ]}
                                color="#333333"
                                lineWidth={2}
                            />
                            <Line
                                points={[
                                    [enemy.position[0] - 0.3, enemy.position[1] + 0.6, enemy.position[2]],
                                    [enemy.position[0] - 0.3 + (enemy.health / enemy.maxHealth) * 0.6, enemy.position[1] + 0.6, enemy.position[2]]
                                ]}
                                color={enemy.health > enemy.maxHealth * 0.3 ? "#ef4444" : "#dc2626"}
                                lineWidth={2}
                            />

                            {/* Boss indicator */}
                            {enemy.isBoss && (
                                <Text
                                    position={[enemy.position[0], enemy.position[1] + 1.5, enemy.position[2]]}
                                    fontSize={0.25}
                                    color="#fbbf24"
                                    anchorX="center"
                                    anchorY="middle"
                                >
                                    👑 BOSS 👑
                                </Text>
                            )}
                        </group>
                    );
                })}

                {/* Obstacles */}
                {obstacles.map((obstacle) => (
                    <mesh key={obstacle.id} position={obstacle.position}>
                        <boxGeometry args={[0.8, 0.8, 0.8]} />
                        <meshStandardMaterial
                            color={currentWave >= 11 ? '#4b2e08' : '#6b7280'}
                            roughness={0.8}
                        />
                    </mesh>
                ))}

                {/* Earth Slam Particle Effects */}
                {earthSlamParticles.map((particle) => (
                    <mesh key={particle.id} position={particle.position}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshBasicMaterial
                            color={particle.color}
                            transparent
                            opacity={particle.life / particle.maxLife}
                        />
                    </mesh>
                ))}                {/* Player Units */}
                {units.map((unit) => {
                    const resonance = resonances.find(r => r.id === unit.id);
                    const isSelected = unit.id === selectedUnit;

                    return (
                        <group key={unit.id}>
                            <EnhancedPlanetButton
                                position={unit.position}
                                planetType={
                                    unit.zodiacSign === 'Aries' ? 'desert' :
                                        unit.zodiacSign === 'Taurus' ? 'rocky' :
                                            unit.zodiacSign === 'Gemini' ? 'gas' :
                                                unit.zodiacSign === 'Cancer' ? 'ice' : 'desert'
                                }
                                size={isSelected ? 0.7 : 0.6}
                                atmosphere={true}
                                customColor={
                                    unit.zodiacSign === 'Aries' ? '#ef4444' :
                                        unit.zodiacSign === 'Taurus' ? '#8b4513' :
                                            unit.zodiacSign === 'Gemini' ? '#f59e0b' :
                                                unit.zodiacSign === 'Cancer' ? '#06b6d4' : '#a855f7'
                                }
                                label={unit.zodiacSign}
                                zodiacSign={unit.zodiacSign}
                                onClick={() => setSelectedUnit(unit.id)}
                                isActive={isSelected}
                            />

                            {/* Health bar */}
                            <Line
                                points={[
                                    [unit.position[0] - 0.4, unit.position[1] + 0.8, unit.position[2]],
                                    [unit.position[0] + 0.4, unit.position[1] + 0.8, unit.position[2]]
                                ]}
                                color="#333333"
                                lineWidth={3}
                            />
                            <Line
                                points={[
                                    [unit.position[0] - 0.4, unit.position[1] + 0.8, unit.position[2]],
                                    [unit.position[0] - 0.4 + (unit.health / unit.maxHealth) * 0.8, unit.position[1] + 0.8, unit.position[2]]
                                ]}
                                color="#10b981"
                                lineWidth={3}
                            />

                            {/* Energy bar */}
                            <Line
                                points={[
                                    [unit.position[0] - 0.3, unit.position[1] + 1.0, unit.position[2]],
                                    [unit.position[0] + 0.3, unit.position[1] + 1.0, unit.position[2]]
                                ]}
                                color="#1e293b"
                                lineWidth={2}
                            />
                            <Line
                                points={[
                                    [unit.position[0] - 0.3, unit.position[1] + 1.0, unit.position[2]],
                                    [unit.position[0] - 0.3 + (unit.energy / 50) * 0.6, unit.position[1] + 1.0, unit.position[2]]
                                ]}
                                color="#06b6d4"
                                lineWidth={2}
                            />

                            {/* Unit info text */}
                            <Text
                                position={[unit.position[0], unit.position[1] + 1.3, unit.position[2]]}
                                fontSize={0.15}
                                color="#fef3c7"
                                anchorX="center"
                                anchorY="middle"
                            >
                                {`${unit.zodiacSign} L${unit.level}`}
                            </Text>

                            {/* RP indicator */}
                            <Text
                                position={[unit.position[0], unit.position[1] - 0.5, unit.position[2]]}
                                fontSize={0.12}
                                color={getTierColor(getTierFromRP(resonance?.rp || 0))}
                                anchorX="center"
                                anchorY="middle"
                            >
                                {`${resonance?.rp || 0} RP`}
                            </Text>
                        </group>
                    );
                })}

                {/* Particles */}
                {particles.map((particle) => (
                    <mesh key={particle.id} position={particle.position}>
                        <sphereGeometry args={[particle.size, 8, 8]} />
                        <meshBasicMaterial
                            color={particle.color}
                            transparent
                            opacity={particle.life / particle.maxLife}
                        />
                    </mesh>
                ))}

                {/* 🎉 Victory Particles - Code-Generated Celebration */}
                {victoryParticles.map((particle) => (
                    <mesh key={particle.id} position={particle.position}>
                        <boxGeometry args={[particle.size * 0.8, particle.size * 0.8, particle.size * 0.8]} />
                        <meshBasicMaterial
                            color={particle.color}
                            transparent
                            opacity={Math.min(1, particle.life / particle.maxLife * 1.5)}
                        />
                    </mesh>
                ))}

                {/* Game end screen */}
                {gameState === 'ended' && (
                    <Text
                        position={[0, 2.5, 0]}
                        fontSize={0.5}
                        color="#f59e0b"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {winner ? `${winner} Wins! 🏆` : 'Draw! 🤝'}
                    </Text>
                )}
            </Canvas>

            {/* UI Panels */}

            {/* Mobile Controls */}
            <div className={`${styles.cosmicUiPanel} ${styles.mobileControlsPanel}`}>
                <button
                    onClick={() => setShowConstellations(!showConstellations)}
                    className={`${styles.constellationButton} ${showConstellations ? styles.constellationButtonActive : ''}`}
                >
                    {showConstellations ? '🌌 Hide Map' : '🗺️ Constellation'}
                </button>

                <button
                    onClick={() => setShowStore(!showStore)}
                    className={styles.storeButton}
                >
                    💰 Store
                </button>

                {/* Wave System Display */}
                <div className={`${styles.waveDisplayContainer} ${currentWave >= 11 ? styles.waveDisplayBoss : styles.waveDisplayNormal}`}>
                    <div className={currentWave >= 11 ? styles.waveDisplayTextBoss : styles.waveDisplayTextNormal}>
                        Wave {currentWave}
                    </div>
                    <div className={styles.waveDisplaySubtext}>
                        {currentWave >= 11 ? '🐂 Taurus Stage' : '🔥 Aries Stage'}
                    </div>
                    <div className={styles.waveDisplaySubtext}>
                        Score: {score.toLocaleString()}
                    </div>
                    {waveActive && (
                        <div className={`${styles.waveDisplaySubtext} ${styles.enemyCountText}`}>
                            {waveEnemies.length} enemies
                        </div>
                    )}
                </div>
            </div>

            {/* Quest Panel */}
            <div className={`cosmic-ui-panel quests ${styles.questPanel}`}>
                <h3 className={styles.questContainer}>Quests</h3>
                {quests.filter(q => !q.completed).slice(0, 3).map((quest) => (
                    <div key={quest.id} className={styles.questItem}>
                        <p className={styles.questTitle}>
                            {quest.name}
                        </p>
                        <div className={styles.questProgress}>
                            <div
                                className={`${styles.questProgressBar} ${quest.progress >= quest.goal ? styles.questProgressComplete : styles.questProgressIncomplete}`}
                                style={{
                                    width: `${Math.min(100, (quest.progress / quest.goal) * 100)}%`
                                }}
                            />
                        </div>
                        <p className={styles.questReward}>
                            {quest.progress}/{quest.goal} • +{quest.reward.value} {quest.reward.type}
                        </p>
                    </div>
                ))}
            </div>

            {/* Leaderboard */}
            <div className={`cosmic-ui-panel leaderboard ${styles.leaderboardPanel}`}>
                <h3 className={styles.questContainer}>Arena Leaders</h3>
                {leaderboard.slice(0, 4).map((entry, index) => (
                    <div key={entry.id} className={styles.leaderboardItem}>
                        <span
                            className={`${styles.leaderboardName} ${entry.id === selectedUnit ? styles.leaderboardNameBold : styles.leaderboardNameNormal}`}
                            style={{
                                color: getTierColor(entry.tier)
                            }}
                        >
                            #{index + 1} {entry.name}
                        </span>
                        <span className={styles.leaderboardScore}>
                            {entry.rp} RP
                        </span>
                    </div>
                ))}
            </div>

            {/* Skills Panel */}
            <div className={`cosmic-ui-panel skills ${styles.skillsPanel}`}>
                <h3 className={styles.skillsContainer}>
                    {units.find(u => u.id === selectedUnit)?.zodiacSign} Skills
                </h3>
                {resonances.find(r => r.id === selectedUnit)?.skills.slice(0, 3).map((skill) => (
                    <div key={skill.id} className={styles.skillItem}>
                        <div className={styles.skillHeader}>
                            <span className={styles.skillName}>
                                {skill.name} L{skill.level}
                            </span>
                            <button
                                onClick={() => upgradeSkill(selectedUnit, skill.id)}
                                disabled={skill.level >= 5 || (resonances.find(r => r.id === selectedUnit)?.rp || 0) < (50 + skill.level * 25)}
                                className={styles.skillUpgradeButton}
                            >
                                {skill.level >= 5 ? 'MAX' : `${50 + skill.level * 25} RP`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Store Modal */}
            {showStore && (
                <div className={styles.storeOverlay}>
                    <div className={styles.storeModal}>
                        <div className={styles.storeHeader}>
                            <h2 className={styles.storeTitle}>Cosmic Store 💰</h2>
                            <button
                                onClick={() => setShowStore(false)}
                                className={styles.storeCloseButton}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.storeGrid}>
                            <div className={`${styles.storeItem} ${styles.storeItemBoost}`}>
                                <h3 className={styles.storeItemTitleBoost}>RP Boost (50%)</h3>
                                <p className={styles.storeItemDescription}>
                                    Increase all RP gains by 50% for next hour
                                </p>
                                <button
                                    onClick={() => purchaseItem('rp_boost_50', 1.99, 'BOOST')}
                                    className={styles.storeItemButton}
                                >
                                    $1.99 USD
                                </button>
                            </div>

                            <div className={`${styles.storeItem} ${styles.storeItemSkin}`}>
                                <h3 className={styles.storeItemTitleSkin}>Mystic Aura Skin</h3>
                                <p className={styles.storeItemDescription}>
                                    Exclusive purple cosmic aura effect
                                </p>
                                <button
                                    onClick={() => purchaseItem('mystic_aura_skin', 0.99, 'COSMETIC')}
                                    className={styles.storeItemButton}
                                >
                                    $0.99 USD
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Combat streak indicator */}
            {combatStreak > 2 && (
                <div className={styles.combatStreak}>
                    🔥 {combatStreak}x Combo!
                </div>
            )}

            <FeedbackForm />

            {/* Touch instructions for mobile */}
            <div className={styles.touchInstructions}>
                👆 Tap arena to fire abilities • Select unit to control
            </div>

            {/* 🎨 Screen Flash Overlay - Visual Sound Effect */}
            {flashColor && (
                <div
                    className={`${styles.screenFlash} ${styles.screenFlashPulse}`}
                    style={{
                        backgroundColor: flashColor
                    }}
                />
            )}
        </div>
    );
};

export default ZodiacArenaEnhanced;