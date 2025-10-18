import { Stars, Text } from '@react-three/drei';
import React, { useEffect, useState } from 'react';

interface ConstellationMapProps {
    setResonances: React.Dispatch<React.SetStateAction<Resonance[]>>;
}

interface Resonance {
    id: string;
    zodiacSign: 'Aries' | 'Taurus' | 'Gemini' | 'Cancer';
    role: 'HERO' | 'SAGE' | 'TRICKSTER' | 'CAREGIVER';
    rp: number;
    tier: number;
    skills: { id: string; name: string; level: number; cost: number; damage?: number; healing?: number; defense?: number; wisdom?: number; buff?: number; }[];
    purchasedItems: string[];
}

interface ConstellationNode {
    id: string;
    position: [number, number, number];
    type: 'LORE' | 'ESSENCE' | 'COSMIC_EVENT';
    zodiacSign?: string;
    discovered: boolean;
}

const INITIAL_NODES: ConstellationNode[] = [
    { id: 'aries_lore', position: [-2, 2, -2], type: 'LORE', zodiacSign: 'Aries', discovered: false },
    { id: 'taurus_essence', position: [2, 2, 2], type: 'ESSENCE', zodiacSign: 'Taurus', discovered: false },
    { id: 'gemini_lore', position: [-3, 1, 1], type: 'LORE', zodiacSign: 'Gemini', discovered: false },
    { id: 'cancer_essence', position: [1, 2, -3], type: 'ESSENCE', zodiacSign: 'Cancer', discovered: false },
];

export const ConstellationMap: React.FC<ConstellationMapProps> = ({ setResonances }) => {
    const [nodes, setNodes] = useState<ConstellationNode[]>(INITIAL_NODES);
    const [discoveredCount, setDiscoveredCount] = useState(0);

    useEffect(() => {
        // Cosmic events - random node spawning
        const interval = setInterval(() => {
            if (Math.random() < 0.2) { // 20% chance per minute
                const newNode: ConstellationNode = {
                    id: `cosmic_event_${Date.now()}`,
                    position: [
                        Math.random() * 4 - 2,
                        Math.random() * 2 + 1,
                        Math.random() * 4 - 2
                    ],
                    type: 'COSMIC_EVENT',
                    discovered: false
                };

                setNodes(prev => [...prev, newNode]);

                // Auto-remove cosmic events after 30 seconds
                setTimeout(() => {
                    setNodes(prev => prev.filter(n => n.id !== newNode.id));
                }, 30000);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    const handleNodeClick = (nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || node.discovered) return;

        // Mark node as discovered
        setNodes(prev => prev.map(n =>
            n.id === nodeId ? { ...n, discovered: true } : n
        ));

        setDiscoveredCount(prev => prev + 1);

        // Grant rewards based on node type
        if (node.type === 'LORE') {
            setResonances(prev => prev.map(r =>
                r.zodiacSign.toLowerCase() === node.zodiacSign?.toLowerCase()
                    ? { ...r, rp: r.rp + 10 }
                    : r
            ));
            console.log(`Discovered ${node.zodiacSign} lore! +10 RP`);
        } else if (node.type === 'ESSENCE') {
            setResonances(prev => prev.map(r =>
                r.zodiacSign.toLowerCase() === node.zodiacSign?.toLowerCase()
                    ? { ...r, rp: r.rp + 5 }
                    : r
            ));
            console.log(`Collected ${node.zodiacSign} essence! +5 RP`);
        } else if (node.type === 'COSMIC_EVENT') {
            // Cosmic events give universal bonuses
            setResonances(prev => prev.map(r => ({ ...r, rp: r.rp + 20 })));
            console.log('Cosmic event discovered! +20 RP to all!');
        }
    };

    const getNodeColor = (node: ConstellationNode) => {
        if (node.discovered) return '#6b7280';

        switch (node.type) {
            case 'LORE': return '#f59e0b';
            case 'ESSENCE': return '#06b6d4';
            case 'COSMIC_EVENT': return '#8b5cf6';
            default: return '#ffffff';
        }
    };

    const getNodeSize = (node: ConstellationNode) => {
        if (node.discovered) return 0.1;
        return node.type === 'COSMIC_EVENT' ? 0.3 : 0.2;
    };

    return (
        <group>
            <Stars radius={50} count={300} factor={4} saturation={0} fade />

            {/* Constellation nodes */}
            {nodes.map((node) => (
                <group key={node.id}>
                    <mesh
                        position={node.position}
                        onClick={() => handleNodeClick(node.id)}
                        onPointerOver={(e) => {
                            e.stopPropagation();
                            document.body.style.cursor = node.discovered ? 'default' : 'pointer';
                        }}
                        onPointerOut={() => {
                            document.body.style.cursor = 'default';
                        }}
                    >
                        <sphereGeometry args={[getNodeSize(node), 16, 16]} />
                        <meshBasicMaterial
                            color={getNodeColor(node)}
                            transparent
                            opacity={node.discovered ? 0.3 : 0.8}
                        />
                    </mesh>

                    {!node.discovered && (
                        <Text
                            position={[node.position[0], node.position[1] + 0.4, node.position[2]]}
                            fontSize={0.12}
                            color="#fef3c7"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {node.type === 'COSMIC_EVENT' ? '🌠' : node.zodiacSign || node.type}
                        </Text>
                    )}

                    {/* Pulsing effect for undiscovered nodes */}
                    {!node.discovered && (
                        <mesh position={node.position}>
                            <ringGeometry args={[getNodeSize(node) + 0.1, getNodeSize(node) + 0.2, 16]} />
                            <meshBasicMaterial
                                color={getNodeColor(node)}
                                transparent
                                opacity={0.3}
                            />
                        </mesh>
                    )}
                </group>
            ))}

            {/* Discovery counter */}
            <Text
                position={[-4, 3, 0]}
                fontSize={0.2}
                color="#fef3c7"
                anchorX="left"
                anchorY="middle"
            >
                {`Discovered: ${discoveredCount}/${INITIAL_NODES.length}`}
            </Text>
        </group>
    );
};

export default ConstellationMap;