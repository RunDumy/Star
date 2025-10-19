import { Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { zodiacAPI } from '../../lib/api';
import { EnhancedPlanetButton } from '../cosmic/EnhancedPlanetButton';
import Leaderboards from './Leaderboards';

interface Unit {
  id: string;
  zodiacSign: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  targetPosition?: [number, number, number];
  lastAttackTime: number;
  damage: number;
  level: number;
  experience: number;
  skills: string[];
  isPlayer: boolean;
}

interface Resonance {
  id: string;
  type: 'fire' | 'water' | 'earth' | 'air';
  position: [number, number, number];
  collected: boolean;
}

interface Wave {
  number: number;
  enemies: Unit[];
  completed: boolean;
  reward: number;
  stage: string;
  stageNumber: number;
}

interface Stage {
  name: string;
  number: number;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  difficultyMultiplier: number;
  specialEffects: string[];
}

interface DamagePopup {
  id: string;
  value: number;
  position: [number, number, number];
  createdAt: number;
  type: 'damage' | 'heal' | 'xp';
}

interface Particle {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  life: number;
  maxLife: number;
  color: string;
}

interface WeatherEffect {
  id: string;
  type: 'nebula' | 'aurora';
  position: [number, number, number];
  scale: number;
  opacity: number;
  color: string;
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
  resonances: Resonance[];
  damagePopups: DamagePopup[];
  particles: Particle[];
  selectedUnit: string;
  setSelectedUnit: (id: string) => void;
  gameState: 'playing' | 'ended' | 'wave-transition';
  winner: string | null;
  currentWave: number;
  weatherEffects: WeatherEffect[];
}> = ({ onArenaClick, units, resonances, damagePopups, particles, selectedUnit, setSelectedUnit, gameState, winner, currentWave, weatherEffects }) => {
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
      {weatherEffects.map((effect) => (
        <group key={effect.id}>
          {effect.type === 'nebula' && (
            <mesh position={effect.position}>
              <sphereGeometry args={[effect.scale, 16, 16]} />
              <meshBasicMaterial
                color={effect.color}
                transparent
                opacity={effect.opacity}
                wireframe
              />
            </mesh>
          )}
          {effect.type === 'aurora' && (
            <mesh position={effect.position} rotation={[0, 0, Math.PI / 4]}>
              <planeGeometry args={[effect.scale * 2, effect.scale * 2]} />
              <meshBasicMaterial
                color={effect.color}
                transparent
                opacity={effect.opacity}
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
};

const ZodiacArenaPrototype: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([
    {
      id: 'player',
      zodiacSign: 'Aries',
      position: [0, 0.7, 5],
      health: 100,
      maxHealth: 100,
      lastAttackTime: 0,
      damage: 15,
      level: 1,
      experience: 0,
      skills: ['fireball'],
      isPlayer: true
    }
  ]);
  const [resonances, setResonances] = useState<Resonance[]>([]);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>('player');
  const [gameState, setGameState] = useState<'playing' | 'ended' | 'wave-transition'>('playing');
  const [winner, setWinner] = useState<string | null>(null);
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());
  const [currentStage, setCurrentStage] = useState<string>('Aries');
  const [stageColorScheme, setStageColorScheme] = useState({ primary: '#ef4444', secondary: '#dc2626', accent: '#fca5a5' });
  const [weatherEffects, setWeatherEffects] = useState<WeatherEffect[]>([]);
  const [currentWaveData, setCurrentWaveData] = useState<Wave>({
    number: 1,
    enemies: [],
    completed: false,
    reward: 100,
    stage: 'Aries',
    stageNumber: 1
  });

  // Audio setup
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new AudioContext();
    return () => {
      audioContext.current?.close();
    };
  }, []);

  // Initialize current wave data
  useEffect(() => {
    setCurrentWaveData(generateWave(1));
    setWeatherEffects(generateWeatherEffects('Aries'));
  }, []);  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed(prev => new Set(prev).add(event.key.toLowerCase()));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.key.toLowerCase());
        return newSet;
      });
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    globalThis.addEventListener('keyup', handleKeyUp);

    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      globalThis.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const generateWave = useCallback((waveNumber: number): Wave => {
    const stageNumber = Math.ceil(waveNumber / 5);
    const stages: Stage[] = [
      {
        name: 'Aries',
        number: 1,
        colorScheme: { primary: '#ef4444', secondary: '#dc2626', accent: '#fca5a5' },
        difficultyMultiplier: 1,
        specialEffects: []
      },
      {
        name: 'Taurus',
        number: 2,
        colorScheme: { primary: '#10b981', secondary: '#059669', accent: '#6ee7b7' },
        difficultyMultiplier: 1.5,
        specialEffects: ['emerald_glow', 'increased_defense']
      },
      {
        name: 'Gemini',
        number: 3,
        colorScheme: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#c4b5fd' },
        difficultyMultiplier: 2,
        specialEffects: ['dual_enemies', 'speed_boost']
      },
      {
        name: 'Cancer',
        number: 4,
        colorScheme: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' },
        difficultyMultiplier: 2.5,
        specialEffects: ['healing_waves', 'regeneration']
      }
    ];

    const currentStage = stages[Math.min(stageNumber - 1, stages.length - 1)];
    const enemyCount = Math.min(3 + waveNumber, 12);
    const enemies: Unit[] = [];

    for (let i = 0; i < enemyCount; i++) {
      const signs = ['Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra'];
      const sign = signs[Math.floor(Math.random() * signs.length)];
      enemies.push({
        id: `enemy-${waveNumber}-${i}`,
        zodiacSign: sign,
        position: [
          (Math.random() - 0.5) * 16,
          0.7,
          (Math.random() - 0.5) * 16
        ] as [number, number, number],
        health: Math.round((30 + waveNumber * 10) * currentStage.difficultyMultiplier),
        maxHealth: Math.round((30 + waveNumber * 10) * currentStage.difficultyMultiplier),
        lastAttackTime: 0,
        damage: Math.round((8 + waveNumber * 2) * currentStage.difficultyMultiplier),
        level: Math.max(1, waveNumber - 1),
        experience: 0,
        skills: ['basic'],
        isPlayer: false
      });
    }

    return {
      number: waveNumber,
      enemies,
      completed: false,
      reward: waveNumber * 100 * currentStage.difficultyMultiplier,
      stage: currentStage.name,
      stageNumber: currentStage.number
    };
  }, []);

  const generateWeatherEffects = useCallback((stage: string) => {
    const effects: WeatherEffect[] = [];

    if (stage === 'Taurus') {
      // Emerald nebulae for Taurus stage
      for (let i = 0; i < 3; i++) {
        effects.push({
          id: `nebula-${i}`,
          type: 'nebula',
          position: [
            (Math.random() - 0.5) * 30,
            5 + Math.random() * 10,
            (Math.random() - 0.5) * 30
          ] as [number, number, number],
          scale: 2 + Math.random() * 3,
          opacity: 0.3 + Math.random() * 0.4,
          color: '#10b981'
        });
      }
    } else if (stage === 'Gemini') {
      // Aurora effects for Gemini stage
      for (let i = 0; i < 5; i++) {
        effects.push({
          id: `aurora-${i}`,
          type: 'aurora',
          position: [
            (Math.random() - 0.5) * 40,
            8 + Math.random() * 5,
            (Math.random() - 0.5) * 40
          ] as [number, number, number],
          scale: 1 + Math.random() * 2,
          opacity: 0.2 + Math.random() * 0.3,
          color: '#8b5cf6'
        });
      }
    }

    return effects;
  }, []);

  const addDamagePopup = (targetId: string, value: number, position: [number, number, number], type: 'damage' | 'heal' | 'xp' = 'damage') => {
    setDamagePopups((prev) => [
      ...prev,
      { id: `${targetId}-${Date.now()}`, value, position: [position[0], position[1] + 1.2, position[2]], createdAt: Date.now(), type },
    ]);
  };

  const addParticles = (position: [number, number, number], color: string, count: number = 5) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        position: [position[0], position[1], position[2]],
        velocity: [
          (Math.random() - 0.5) * 0.1,
          Math.random() * 0.1,
          (Math.random() - 0.5) * 0.1
        ],
        life: 60,
        maxLife: 60,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const collectResonance = (resonance: Resonance) => {
    setResonances(prev => prev.map(r => r.id === resonance.id ? { ...r, collected: true } : r));
    const player = units.find(u => u.isPlayer);
    if (player) {
      const healAmount = resonance.type === 'fire' ? 20 : resonance.type === 'water' ? 30 : resonance.type === 'earth' ? 25 : 15;
      setUnits(prev => prev.map(u =>
        u.isPlayer ? { ...u, health: Math.min(u.maxHealth, u.health + healAmount) } : u
      ));
      addDamagePopup(player.id, healAmount, player.position, 'heal');
      addParticles(player.position, resonance.type === 'fire' ? '#ef4444' : resonance.type === 'water' ? '#3b82f6' : resonance.type === 'earth' ? '#16a34a' : '#f59e0b');
      setScore(prev => prev + 50);
    }
  };

  const upgradeSkill = (skill: string) => {
    setUnits(prev => prev.map(u =>
      u.isPlayer ? {
        ...u,
        skills: u.skills.includes(skill) ? u.skills : [...u.skills, skill],
        damage: skill === 'fireball' ? u.damage + 5 : u.damage
      } : u
    ));
  };

  const handleArenaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing') return;

    const player = units.find(u => u.isPlayer);
    if (!player) return;

    // Simple click-to-move for desktop
    setUnits(prev => prev.map(u =>
      u.isPlayer ? { ...u, targetPosition: [event.clientX / 100 - 8, 0.7, event.clientY / 100 - 8] } : u
    ));
  };

  const shareVictory = async () => {
    if (!winner) return;

    try {
      const battleData = {
        winner,
        battle_duration: Math.floor(Math.random() * 600) + 300,
        participant_signs: ['Aries', winner],
        damage_dealt: Math.floor(Math.random() * 100) + 50
      };

      await zodiacAPI.shareArenaResult(battleData);
      alert(`Victory shared to cosmic feed! 🌟 Score: ${score}!`);
    } catch (error) {
      console.error('Failed to share victory:', error);
      alert('Failed to share victory to cosmic feed');
    }
  };

  const restartGame = () => {
    setUnits([{
      id: 'player',
      zodiacSign: 'Aries',
      position: [0, 0.7, 5],
      health: 100,
      maxHealth: 100,
      lastAttackTime: 0,
      damage: 15,
      level: 1,
      experience: 0,
      skills: ['fireball'],
      isPlayer: true
    }]);
    setResonances([]);
    setDamagePopups([]);
    setParticles([]);
    setCombatLog([]);
    setGameState('playing');
    setWinner(null);
    setCurrentWave(1);
    setScore(0);
    setCurrentWaveData(generateWave(1));
    setWeatherEffects(generateWeatherEffects('Aries'));
  };

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    const currentTime = state.clock.getElapsedTime();

    // Keyboard movement
    setUnits(prev => prev.map(unit => {
      if (!unit.isPlayer) return unit;

      let newX = unit.position[0];
      let newZ = unit.position[2];

      if (keysPressed.has('w') || keysPressed.has('arrowup')) newZ -= 5 * delta;
      if (keysPressed.has('s') || keysPressed.has('arrowdown')) newZ += 5 * delta;
      if (keysPressed.has('a') || keysPressed.has('arrowleft')) newX -= 5 * delta;
      if (keysPressed.has('d') || keysPressed.has('arrowright')) newX += 5 * delta;

      // Keep within bounds
      newX = Math.max(-9, Math.min(9, newX));
      newZ = Math.max(-9, Math.min(9, newZ));

      return { ...unit, position: [newX, unit.position[1], newZ] };
    }));

    // Generate resonances occasionally
    if (Math.random() < 0.005) {
      const types: ('fire' | 'water' | 'earth' | 'air')[] = ['fire', 'water', 'earth', 'air'];
      const type = types[Math.floor(Math.random() * types.length)];
      setResonances(prev => [...prev, {
        id: `resonance-${Date.now()}`,
        type,
        position: [
          (Math.random() - 0.5) * 16,
          0.7,
          (Math.random() - 0.5) * 16
        ] as [number, number, number],
        collected: false
      }]);
    }

    // Check resonance collection
    setResonances(prev => {
      const player = units.find(u => u.isPlayer);
      if (!player) return prev;

      return prev.map(resonance => {
        if (resonance.collected) return resonance;

        const distance = new THREE.Vector3(...player.position).distanceTo(new THREE.Vector3(...resonance.position));
        if (distance < 1) {
          collectResonance(resonance);
          return { ...resonance, collected: true };
        }
        return resonance;
      });
    });

    // Enemy AI and combat
    setUnits(prev => {
      const player = prev.find(u => u.isPlayer);
      if (!player) return prev;

      return prev.map(unit => {
        if (unit.isPlayer) return unit;

        // Move toward player
        const distance = new THREE.Vector3(...unit.position).distanceTo(new THREE.Vector3(...player.position));
        if (distance > 1.5) {
          const direction = new THREE.Vector3(...player.position).sub(new THREE.Vector3(...unit.position)).normalize();
          const newPos = new THREE.Vector3(...unit.position).add(direction.multiplyScalar(2 * delta));
          return { ...unit, position: [newPos.x, newPos.y, newPos.z] };
        }

        // Attack if close enough and cooldown passed
        if (distance <= 1.5 && currentTime - unit.lastAttackTime >= 1.5) {
          const damage = unit.damage;
          setUnits(prevUnits => prevUnits.map(u =>
            u.isPlayer ? { ...u, health: Math.max(0, u.health - damage) } : u
          ));
          addDamagePopup('player', damage, player.position, 'damage');
          addParticles(player.position, '#ef4444');
          setCombatLog(prev => [...prev.slice(-4), `${unit.zodiacSign} attacks for ${damage} damage!`]);
          return { ...unit, lastAttackTime: currentTime };
        }

        return unit;
      });
    });

    // Player attack (spacebar)
    if (keysPressed.has(' ')) {
      const player = units.find(u => u.isPlayer);
      if (player && currentTime - player.lastAttackTime >= 1) {
        const nearestEnemy = units
          .filter(u => !u.isPlayer && u.health > 0)
          .sort((a, b) => new THREE.Vector3(...a.position).distanceTo(new THREE.Vector3(...player.position)) -
            new THREE.Vector3(...b.position).distanceTo(new THREE.Vector3(...player.position)))[0];

        if (nearestEnemy && new THREE.Vector3(...nearestEnemy.position).distanceTo(new THREE.Vector3(...player.position)) <= 3) {
          const damage = player.damage;
          setUnits(prev => prev.map(u =>
            u.id === nearestEnemy.id ? { ...u, health: Math.max(0, u.health - damage) } : u
          ));
          addDamagePopup(nearestEnemy.id, damage, nearestEnemy.position, 'damage');
          addParticles(nearestEnemy.position, '#ef4444');

          // Experience gain
          const xpGain = 10;
          setUnits(prevUnits => prevUnits.map(u =>
            u.isPlayer ? (() => {
              const newExp = u.experience + xpGain;
              const newLevel = Math.floor(newExp / 100) + 1;
              const leveledUp = newLevel > u.level;
              if (leveledUp) {
                addDamagePopup(u.id, newLevel, u.position, 'xp');
                addParticles(u.position, '#a78bfa', 10);
              }
              return { ...u, experience: newExp % 100, level: newLevel, maxHealth: leveledUp ? u.maxHealth + 20 : u.maxHealth, health: leveledUp ? u.maxHealth + 20 : u.health };
            })() : u
          ));

          setCombatLog(prev => [...prev.slice(-4), `Player attacks ${nearestEnemy.zodiacSign} for ${damage} damage!`]);
          setScore(prev => prev + damage * 10);
        }
      }
    }

    // Update particles
    setParticles(prev => prev.map(particle => ({
      ...particle,
      position: [
        particle.position[0] + particle.velocity[0],
        particle.position[1] + particle.velocity[1],
        particle.position[2] + particle.velocity[2]
      ] as [number, number, number],
      life: particle.life - 1
    })).filter(p => p.life > 0));

    // Clean up damage popups
    setDamagePopups(prev => prev.filter(popup => Date.now() - popup.createdAt < 1500));

    // Check wave completion
    const aliveEnemies = units.filter(u => !u.isPlayer && u.health > 0);
    if (aliveEnemies.length === 0 && currentWaveData.enemies.length > 0) {
      setGameState('wave-transition');
      setTimeout(() => {
        const nextWave = currentWave + 1;
        setCurrentWave(nextWave);
        const newWave = generateWave(nextWave);
        setUnits(prev => [...prev, ...newWave.enemies]);
        setCurrentWaveData(newWave);
        setCurrentStage(newWave.stage);
        setStageColorScheme({
          primary: newWave.stage === 'Taurus' ? '#10b981' : newWave.stage === 'Gemini' ? '#8b5cf6' : newWave.stage === 'Cancer' ? '#06b6d4' : '#ef4444',
          secondary: newWave.stage === 'Taurus' ? '#059669' : newWave.stage === 'Gemini' ? '#7c3aed' : newWave.stage === 'Cancer' ? '#0891b2' : '#dc2626',
          accent: newWave.stage === 'Taurus' ? '#6ee7b7' : newWave.stage === 'Gemini' ? '#c4b5fd' : newWave.stage === 'Cancer' ? '#67e8f9' : '#fca5a5'
        });
        setWeatherEffects(generateWeatherEffects(newWave.stage));
        setGameState('playing');
        setScore(prev => prev + newWave.reward);
      }, 2000);
    }

    // Check game over
    const playerAlive = units.some(u => u.isPlayer && u.health > 0);
    if (!playerAlive) {
      setGameState('ended');
      setWinner(null);
    }
  });

  return (
    <div className="zodiac-arena-container">
      <Canvas camera={{ position: [0, 8, 12], fov: 60 }} onClick={handleArenaClick}>
        <ArenaScene
          onArenaClick={handleArenaClick}
          units={units}
          resonances={resonances}
          damagePopups={damagePopups}
          particles={particles}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          gameState={gameState}
          winner={winner}
          currentWave={currentWave}
          weatherEffects={weatherEffects}
        />
      </Canvas>

      <div className="arena-ui-top">
        <div className="wave-info" style={{ color: stageColorScheme.primary }}>
          Stage {currentWaveData.stageNumber}: {currentStage} - Wave {currentWave}
        </div>
        <div className="score-info">Score: {score}</div>
      </div>

      <div className="arena-ui-left">
        <div className="player-stats">
          <h3>Player Stats</h3>
          {units.filter(u => u.isPlayer).map(player => (
            <div key={player.id}>
              <p>Level: {player.level}</p>
              <p>HP: {Math.round(player.health)}/{player.maxHealth}</p>
              <p>Damage: {player.damage}</p>
              <p>XP: {player.experience}/100</p>
            </div>
          ))}
        </div>

        <div className="controls-info">
          <h3>Controls</h3>
          <p>WASD / Arrow Keys: Move</p>
          <p>Space: Attack</p>
          <p>Click: Move to position</p>
        </div>

        {gameState === 'ended' && (
          <div className="game-over">
            <button onClick={shareVictory}>Share Victory</button>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        )}
      </div>

      <div className="arena-ui-right">
        <div className="combat-log">
          <h3>Combat Log</h3>
          {combatLog.slice(-5).map((log, index) => (
            <p key={`combat-log-${index}-${log.substring(0, 10)}`}>{log}</p>
          ))}
        </div>

        <div className="archetype-system">
          <h4>Archetype System</h4>
          <p>Resonances collected: {resonances.filter(r => r.collected).length}</p>
        </div>
        <div className="emotional-engine">
          <h4>Emotional Engine</h4>
          <p>Game state: {gameState}</p>
        </div>
        <div className="constellation-map">
          <h4>Constellation Map</h4>
          <p>Wave: {currentWave}</p>
        </div>
      </div>

      <div className="arena-ui-bottom">
        <Leaderboards
          score={score}
          currentWave={currentWave}
          playerSign="Aries"
        />
      </div>
    </div>
  );
};

export default ZodiacArenaPrototype;
