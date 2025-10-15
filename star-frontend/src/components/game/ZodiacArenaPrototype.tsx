import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CosmicPageWrapper } from '../cosmic/CosmicPageWrapper';

// Unit types and their properties
const UNIT_TYPES = {
    ARIES: {
        name: 'Aries',
        element: 'Fire',
        color: '#ef4444',
        particleColor: '#f97316',
        damage: 12, // HP per second
        size: 0.7,
        audio: 'fire-whoosh.mp3',
    },
    TAURUS: {
        name: 'Taurus',
        element: 'Earth',
        color: '#8b4513',
        particleColor: '#16a34a',
        damage: 8, // HP per second
        size: 0.7,
        audio: 'earth-rumble.mp3',
    },
};

// Enhanced Particle System Component
function ParticleSystem({ position, color, active }) {
    const particlesRef = useRef();
    const [particles] = useState(() =>
        new Array(20).fill().map(() => ({
            position: new THREE.Vector3(),
            velocity: new THREE.Vector3(),
            life: 1,
        }))
    );

    useEffect(() => {
        if (active && particlesRef.current) {
            particles.forEach(particle => {
                particle.position.copy(position);
                particle.velocity.set(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                );
                particle.life = 1;
            });
        }
    }, [active, position, particles]);

    useFrame((state, delta) => {
        if (particlesRef.current) {
            particles.forEach(particle => {
                if (particle.life > 0) {
                    particle.position.add(
                        particle.velocity.clone().multiplyScalar(delta * 5)
                    );
                    particle.life -= delta * 2;
                }
            });
            particlesRef.current.setFromPoints(
                particles.map(p => p.position)
            );
        }
    });

    return (
        <points ref={particlesRef} visible={active}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={new Float32Array(particles.length * 3)}
                    count={particles.length}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color={color} transparent opacity={0.6} />
        </points>
    );
}

// Zodiac Unit 3D Component
function ZodiacUnit({ unit, onClick, isSelected }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group>
            <mesh
                ref={meshRef}
                position={[unit.x, 0, unit.z]}
                scale={[unit.size, unit.size, unit.size]}
                onClick={() => onClick(unit.id)}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial
                    color={unit.color}
                    emissive={isSelected ? unit.color : '#000000'}
                    emissiveIntensity={isSelected ? 0.3 : 0}
                />
            </mesh>

            {/* Selection ring */}
            {isSelected && (
                <mesh position={[unit.x, -0.2, unit.z]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[unit.size + 0.1, unit.size + 0.2, 16]} />
                    <meshBasicMaterial color="#fef3c7" side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Particle system for attacks */}
            <ParticleSystem
                position={new THREE.Vector3(unit.x, unit.size, unit.z)}
                color={UNIT_TYPES[unit.type].particleColor}
                active={unit.isAttacking}
            />
        </group>
    );
}

// Main game component
function ZodiacArenaGame() {
    const [units, setUnits] = useState([
        {
            id: 1,
            type: 'ARIES',
            x: -2,
            z: 0,
            health: 100,
            maxHealth: 100,
            isAttacking: false,
            targetId: null,
        },
        {
            id: 2,
            type: 'TAURUS',
            x: 2,
            z: 0,
            health: 100,
            maxHealth: 100,
            isAttacking: false,
            targetId: null,
        },
    ]);

    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [combatLog, setCombatLog] = useState([]);

    // Movement logic
    const updateMovement = useCallback(() => {
        setUnits(prevUnits =>
            prevUnits.map(unit => {
                if (unit.id !== 2) return unit; // Aries doesn't move automatically

                const taurus = units.find(u => u.id === 2);
                const aries = units.find(u => u.id === 1);
                if (!taurus || !aries) return unit;

                const distance = Math.sqrt(
                    Math.pow(taurus.x - aries.x, 2) +
                    Math.pow(taurus.z - aries.z, 2)
                );

                let targetX = unit.x;
                let targetZ = unit.z;

                // Taurus AI: chase if within 5 units, otherwise random movement
                if (distance <= 5) {
                    const dx = aries.x - taurus.x;
                    const dz = aries.z - taurus.z;
                    const length = Math.sqrt(dx * dx + dz * dz);
                    if (length > 0) {
                        targetX += (dx / length) * 3 * 0.016; // 3 * delta (assuming 60fps)
                        targetZ += (dz / length) * 3 * 0.016;
                    }
                } else {
                    targetX += (Math.random() - 0.5) * 3 * 0.016;
                    targetZ += (Math.random() - 0.5) * 3 * 0.016;
                }

                // Keep units within bounds (-5 to 5)
                targetX = Math.max(-5, Math.min(5, targetX));
                targetZ = Math.max(-5, Math.min(5, targetZ));

                return { ...unit, x: targetX, z: targetZ };
            })
        );
    }, [units]);

    // Combat logic
    const updateCombat = useCallback(() => {
        setUnits(prevUnits =>
            prevUnits.map(attacker => {
                const target = prevUnits.find(u => u.id !== attacker.id);
                if (!target) return attacker;

                const distance = Math.sqrt(
                    Math.pow(attacker.x - target.x, 2) +
                    Math.pow(attacker.z - target.z, 2)
                );

                if (distance <= 2) {
                    // Within attack range
                    const damage = UNIT_TYPES[attacker.type].damage * 0.016; // Per second
                    setUnits(oldUnits =>
                        oldUnits.map(u =>
                            u.id === target.id
                                ? { ...u, health: Math.max(0, u.health - damage) }
                                : u
                        )
                    );

                    // Add to combat log
                    if (!attacker.isAttacking) {
                        setCombatLog(prev => [
                            `${UNIT_TYPES[attacker.type].name} attacks ${UNIT_TYPES[target.type].name} (${damage.toFixed(2)} HP)`,
                            ...prev.slice(0, 5)
                        ]);
                    }

                    return { ...attacker, isAttacking: true, targetId: target.id };
                } else {
                    return { ...attacker, isAttacking: false, targetId: null };
                }
            })
        );
    }, []);

    // Game loop
    useEffect(() => {
        const interval = setInterval(() => {
            updateMovement();
            updateCombat();
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [updateMovement, updateCombat]);

    const selectedUnit = units.find(u => u.id === selectedUnitId);

    return (
        <div className="w-full h-screen relative">
            {/* Game UI */}
            <div className="absolute top-4 left-4 z-50 bg-black bg-opacity-70 p-4 rounded-lg min-w-[200px]">
                <h2 className="text-yellow-100 font-bold mb-3">Zodiac Arena</h2>

                {/* Unit Health Bars */}
                {units.map(unit => (
                    <div key={unit.id} className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm" style={{ color: unit.color }}>
                                {UNIT_TYPES[unit.type].name}
                            </span>
                            <span className="text-sm text-gray-300">
                                {unit.health.toFixed(0)}/{unit.maxHealth}
                            </span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                            <div
                                className="h-2 rounded-full"
                                style={{
                                    width: `${(unit.health / unit.maxHealth) * 100}%`,
                                    backgroundColor: unit.color,
                                }}
                            ></div>
                        </div>
                    </div>
                ))}

                {/* Selected Unit Info */}
                {selectedUnit && (
                    <div className="mt-4 p-2 border border-yellow-100 rounded">
                        <p className="text-sm text-yellow-100">
                            Selected: {UNIT_TYPES[selectedUnit.type].name}
                        </p>
                        <p className="text-xs text-gray-300">
                            Element: {UNIT_TYPES[selectedUnit.type].element}
                        </p>
                        <p className="text-xs text-gray-300">
                            Damage: {UNIT_TYPES[selectedUnit.type].damage}/s
                        </p>
                    </div>
                )}
            </div>

            {/* Combat Log */}
            <div className="absolute bottom-4 left-4 z-50 bg-black bg-opacity-70 p-4 rounded-lg max-w-[300px]">
                <h3 className="text-yellow-100 font-bold mb-2">Combat Log</h3>
                <div className="text-xs space-y-1 max-h-[100px] overflow-y-auto">
                    {combatLog.map((log, index) => (
                        <div key={index} className="text-gray-300">
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* Unit Controls */}
            <div className="absolute bottom-4 right-4 z-50 space-y-2">
                <button
                    className={`px-4 py-2 rounded ${selectedUnitId === 1 ? 'bg-red-600' : 'bg-gray-700'} text-white disabled:opacity-50`}
                    onClick={() => setSelectedUnitId(1)}
                    disabled={selectedUnitId === 1}
                >
                    Select Aries
                </button>
                <button
                    className={`px-4 py-2 rounded ${selectedUnitId === 2 ? 'bg-amber-800' : 'bg-gray-700'} text-white disabled:opacity-50`}
                    onClick={() => setSelectedUnitId(2)}
                    disabled={selectedUnitId === 2}
                >
                    Select Taurus
                </button>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 5, 5], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Stars background */}
                <color attach="background" args={['#0a0a1a']} />
                <fog attach="fog" args={['#0a0a1a', 10, 20]} />

                {/* Ground */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <meshBasicMaterial color="#1a1a2e" transparent opacity={0.5} />
                </mesh>

                {/* Units */}
                {units.map(unit => (
                    <ZodiacUnit
                        key={unit.id}
                        unit={unit}
                        onClick={setSelectedUnitId}
                        isSelected={selectedUnitId === unit.id}
                    />
                ))}

                {/* Camera controls */}
                <OrbitControls enablePan={false} maxDistance={15} minDistance={3} />
            </Canvas>
        </div>
    );
}

export default function ZodiacArenaPrototype() {
    return (
        <CosmicPageWrapper>
            <div className="min-h-screen">
                <ZodiacArenaGame />
            </div>
        </CosmicPageWrapper>
    );
}
