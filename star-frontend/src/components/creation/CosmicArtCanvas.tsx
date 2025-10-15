import { OrbitControls, Sphere, Stars, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Brush,
    Download,
    Eraser,
    Eye,
    EyeOff,
    Heart,
    Lock,
    Move,
    Palette,
    Redo,
    Save,
    Share2,
    Type,
    Undo,
    Unlock,
    Users,
    Wand2
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

interface CollaborativeStroke {
    id: string;
    userId: string;
    userName: string;
    points: THREE.Vector3[];
    color: string;
    width: number;
    opacity: number;
    timestamp: number;
    tool: 'brush' | 'pen' | 'marker' | 'cosmic-brush';
    zodiacElement?: string;
}

interface CosmicLayer {
    id: string;
    name: string;
    isVisible: boolean;
    isLocked: boolean;
    opacity: number;
    strokes: CollaborativeStroke[];
    createdBy: string;
    createdAt: number;
}

interface ArtworkState {
    layers: CosmicLayer[];
    activeLayerId: string;
    canvas: {
        width: number;
        height: number;
        background: 'space' | 'nebula' | 'starfield' | 'cosmic-void';
        animatedElements: boolean;
    };
    collaboration: {
        isLive: boolean;
        participants: string[];
        permissions: 'view' | 'comment' | 'edit' | 'admin';
    };
}

interface CosmicArtCanvasProps {
    sessionId?: string;
    mode?: 'solo' | 'collaborative';
    onStrokeAdd?: (stroke: CollaborativeStroke) => void;
    onCanvasUpdate?: (state: ArtworkState) => void;
}

export const CosmicArtCanvas: React.FC<CosmicArtCanvasProps> = ({
    sessionId,
    mode = 'solo',
    onStrokeAdd,
    onCanvasUpdate
}) => {
    const [artworkState, setArtworkState] = useState<ArtworkState>({
        layers: [{
            id: 'base-layer',
            name: 'Base Layer',
            isVisible: true,
            isLocked: false,
            opacity: 1,
            strokes: [],
            createdBy: 'current-user',
            createdAt: Date.now()
        }],
        activeLayerId: 'base-layer',
        canvas: {
            width: 1920,
            height: 1080,
            background: 'space',
            animatedElements: true
        },
        collaboration: {
            isLive: mode === 'collaborative',
            participants: ['current-user'],
            permissions: 'admin'
        }
    });

    const [currentTool, setCurrentTool] = useState<{
        type: 'brush' | 'pen' | 'marker' | 'cosmic-brush' | 'eraser' | 'text' | 'move';
        color: string;
        size: number;
        opacity: number;
    }>({
        type: 'cosmic-brush',
        color: '#00FFFF',
        size: 5,
        opacity: 0.8
    });

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<THREE.Vector3[]>([]);
    const [showToolbar, setShowToolbar] = useState(true);
    const [showLayers, setShowLayers] = useState(false);
    const [showCollaborators, setShowCollaborators] = useState(false);
    const canvasRef = useRef<THREE.Group>(null);

    // Mock collaborative participants
    const [collaborators] = useState([
        { id: '1', name: 'StarWeaver_Luna', zodiacSign: 'Pisces', isActive: true, cursor: { x: 0.3, y: 0.4 } },
        { id: '2', name: 'CosmicArtist_Sol', zodiacSign: 'Leo', isActive: true, cursor: { x: 0.7, y: 0.2 } },
        { id: '3', name: 'NebulaShaper', zodiacSign: 'Aquarius', isActive: false, cursor: null }
    ]);

    const handleCanvasClick = useCallback((event: THREE.Event) => {
        if (currentTool.type === 'move') return;

        const intersected = event.intersections[0];
        if (!intersected) return;

        const point = intersected.point;

        if (!isDrawing) {
            setIsDrawing(true);
            setCurrentStroke([point]);
        }
    }, [currentTool.type, isDrawing]);

    const handleCanvasMouseMove = useCallback((event: THREE.Event) => {
        if (!isDrawing || currentTool.type === 'move') return;

        const intersected = event.intersections[0];
        if (!intersected) return;

        const point = intersected.point;
        setCurrentStroke(prev => [...prev, point]);
    }, [isDrawing, currentTool.type]);

    const handleCanvasMouseUp = useCallback(() => {
        if (!isDrawing || currentStroke.length < 2) {
            setIsDrawing(false);
            setCurrentStroke([]);
            return;
        }

        const newStroke: CollaborativeStroke = {
            id: `stroke-${Date.now()}-${Math.random()}`,
            userId: 'current-user',
            userName: 'Current User',
            points: currentStroke,
            color: currentTool.color,
            width: currentTool.size,
            opacity: currentTool.opacity,
            timestamp: Date.now(),
            tool: currentTool.type === 'cosmic-brush' ? 'cosmic-brush' : 'brush'
        };

        setArtworkState(prev => ({
            ...prev,
            layers: prev.layers.map(layer =>
                layer.id === prev.activeLayerId
                    ? { ...layer, strokes: [...layer.strokes, newStroke] }
                    : layer
            )
        }));

        onStrokeAdd?.(newStroke);
        setIsDrawing(false);
        setCurrentStroke([]);
    }, [isDrawing, currentStroke, currentTool, onStrokeAdd, artworkState.activeLayerId]);

    const addNewLayer = useCallback(() => {
        const newLayer: CosmicLayer = {
            id: `layer-${Date.now()}`,
            name: `Layer ${artworkState.layers.length + 1}`,
            isVisible: true,
            isLocked: false,
            opacity: 1,
            strokes: [],
            createdBy: 'current-user',
            createdAt: Date.now()
        };

        setArtworkState(prev => ({
            ...prev,
            layers: [...prev.layers, newLayer],
            activeLayerId: newLayer.id
        }));
    }, [artworkState.layers.length]);

    const toggleLayerVisibility = useCallback((layerId: string) => {
        setArtworkState(prev => ({
            ...prev,
            layers: prev.layers.map(layer =>
                layer.id === layerId
                    ? { ...layer, isVisible: !layer.isVisible }
                    : layer
            )
        }));
    }, []);

    const deleteLayer = useCallback((layerId: string) => {
        if (artworkState.layers.length <= 1) return;

        setArtworkState(prev => {
            const remainingLayers = prev.layers.filter(layer => layer.id !== layerId);
            const newActiveLayerId = prev.activeLayerId === layerId
                ? remainingLayers[0]?.id
                : prev.activeLayerId;

            return {
                ...prev,
                layers: remainingLayers,
                activeLayerId: newActiveLayerId
            };
        });
    }, [artworkState.layers.length, artworkState.activeLayerId]);

    const saveArtwork = useCallback(async () => {
        try {
            // In real implementation, save to backend
            const artworkData = {
                ...artworkState,
                sessionId,
                savedAt: Date.now()
            };

            console.log('Saving artwork:', artworkData);
            // Mock save success
            alert('Artwork saved successfully!');
        } catch (error) {
            console.error('Failed to save artwork:', error);
            alert('Failed to save artwork. Please try again.');
        }
    }, [artworkState, sessionId]);

    const exportArtwork = useCallback(async (format: 'png' | 'svg' | 'json') => {
        try {
            // Mock export functionality
            console.log(`Exporting as ${format}:`, artworkState);
            alert(`Artwork exported as ${format.toUpperCase()}!`);
        } catch (error) {
            console.error('Failed to export artwork:', error);
            alert('Failed to export artwork. Please try again.');
        }
    }, [artworkState]);

    return (
        <div className="w-full h-full relative bg-black overflow-hidden">
            {/* 3D Canvas */}
            <div className="w-full h-full">
                <Canvas
                    camera={{ position: [0, 0, 10], fov: 75 }}
                    style={{ background: 'radial-gradient(circle, #1a0033 0%, #000000 100%)' }}
                >
                    <ambientLight intensity={0.4} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} />

                    {/* Background Elements */}
                    <Stars radius={300} depth={60} count={3000} factor={7} />

                    {/* Animated Cosmic Background */}
                    <AnimatedCosmicBackground
                        type={artworkState.canvas.background}
                        animated={artworkState.canvas.animatedElements}
                    />

                    {/* Drawing Surface */}
                    <group
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        onPointerMove={handleCanvasMouseMove}
                        onPointerUp={handleCanvasMouseUp}
                    >
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[16, 9]} />
                            <meshBasicMaterial
                                transparent
                                opacity={0.1}
                                color="#ffffff"
                            />
                        </mesh>

                        {/* Render Layers */}
                        {artworkState.layers.map((layer) => (
                            <LayerRenderer
                                key={layer.id}
                                layer={layer}
                                isActive={layer.id === artworkState.activeLayerId}
                            />
                        ))}

                        {/* Current Stroke Preview */}
                        {isDrawing && currentStroke.length > 1 && (
                            <StrokeRenderer
                                points={currentStroke}
                                color={currentTool.color}
                                width={currentTool.size}
                                opacity={currentTool.opacity}
                            />
                        )}

                        {/* Collaborative Cursors */}
                        {mode === 'collaborative' && collaborators
                            .filter(c => c.isActive && c.cursor)
                            .map((collaborator) => (
                                <CollaboratorCursor
                                    key={collaborator.id}
                                    position={[
                                        (collaborator.cursor!.x - 0.5) * 16,
                                        (0.5 - collaborator.cursor!.y) * 9,
                                        0.1
                                    ]}
                                    name={collaborator.name}
                                    zodiacSign={collaborator.zodiacSign}
                                />
                            ))}
                    </group>

                    <OrbitControls
                        enabled={currentTool.type === 'move'}
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={false}
                    />
                </Canvas>
            </div>

            {/* Toolbar */}
            <AnimatePresence>
                {showToolbar && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-4 left-4 right-4 z-10"
                    >
                        <CosmicToolbar
                            currentTool={currentTool}
                            onToolChange={setCurrentTool}
                            onSave={saveArtwork}
                            onExport={exportArtwork}
                            canUndo={false} // Implement undo/redo logic
                            canRedo={false}
                            isCollaborative={mode === 'collaborative'}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Layer Panel */}
            <AnimatePresence>
                {showLayers && (
                    <motion.div
                        initial={{ opacity: 0, x: -300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        className="absolute top-20 left-4 bottom-4 w-80 z-10"
                    >
                        <LayerPanel
                            layers={artworkState.layers}
                            activeLayerId={artworkState.activeLayerId}
                            onLayerSelect={(layerId) => setArtworkState(prev => ({ ...prev, activeLayerId: layerId }))}
                            onLayerAdd={addNewLayer}
                            onLayerToggle={toggleLayerVisibility}
                            onLayerDelete={deleteLayer}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collaborator Panel */}
            <AnimatePresence>
                {showCollaborators && mode === 'collaborative' && (
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className="absolute top-20 right-4 bottom-4 w-80 z-10"
                    >
                        <CollaboratorPanel collaborators={collaborators} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Control Buttons */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-10">
                <button
                    onClick={() => setShowToolbar(!showToolbar)}
                    className="p-3 bg-black/80 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors"
                    title="Toggle Toolbar"
                >
                    <Palette className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setShowLayers(!showLayers)}
                    className="p-3 bg-black/80 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors"
                    title="Toggle Layers"
                >
                    <Users className="w-5 h-5" />
                </button>
                {mode === 'collaborative' && (
                    <button
                        onClick={() => setShowCollaborators(!showCollaborators)}
                        className="p-3 bg-black/80 backdrop-blur-lg border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors"
                        title="Toggle Collaborators"
                    >
                        <Users className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/20 p-2 text-sm text-white/60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span>Layer: {artworkState.layers.find(l => l.id === artworkState.activeLayerId)?.name}</span>
                        <span>Tool: {currentTool.type}</span>
                        <span>Size: {currentTool.size}px</span>
                    </div>
                    {mode === 'collaborative' && (
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span>{collaborators.filter(c => c.isActive).length} active</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Animated Cosmic Background Component
const AnimatedCosmicBackground: React.FC<{
    type: 'space' | 'nebula' | 'starfield' | 'cosmic-void';
    animated: boolean;
}> = ({ type, animated }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!animated || !meshRef.current) return;

        meshRef.current.rotation.z += 0.001;
        meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    });

    const getBackgroundMaterial = () => {
        const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

        const fragmentShaders = {
            space: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 st = vUv;
          float noise = sin(st.x * 10.0 + time) * sin(st.y * 10.0 + time) * 0.1;
          vec3 color = vec3(0.05, 0.05, 0.2) + noise;
          gl_FragColor = vec4(color, 0.8);
        }
      `,
            nebula: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 st = vUv * 2.0 - 1.0;
          float dist = length(st);
          vec3 color = mix(vec3(0.8, 0.2, 0.8), vec3(0.2, 0.6, 1.0), sin(time + dist * 5.0) * 0.5 + 0.5);
          float alpha = 1.0 - smoothstep(0.0, 1.5, dist);
          gl_FragColor = vec4(color, alpha * 0.6);
        }
      `,
            starfield: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 st = vUv * 50.0;
          vec2 ipos = floor(st);
          vec2 fpos = fract(st);
          
          float rand = fract(sin(dot(ipos, vec2(12.9898, 78.233))) * 43758.5453);
          float star = step(0.98, rand) * smoothstep(0.4, 0.5, 1.0 - length(fpos - 0.5));
          
          gl_FragColor = vec4(vec3(star), star * 0.8);
        }
      `,
            'cosmic-void': `
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 st = vUv;
          float void = sin(time + st.x * 5.0) * sin(time + st.y * 5.0) * 0.05;
          gl_FragColor = vec4(0.0, 0.0, 0.1 + void, 0.9);
        }
      `
        };

        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader: fragmentShaders[type],
            uniforms: { time: { value: 0 } },
            transparent: true
        });
    };

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <planeGeometry args={[50, 50]} />
            <primitive object={getBackgroundMaterial()} attach="material" />
        </mesh>
    );
};

// Layer Renderer Component
const LayerRenderer: React.FC<{
    layer: CosmicLayer;
    isActive: boolean;
}> = ({ layer, isActive }) => {
    if (!layer.isVisible) return null;

    return (
        <group opacity={layer.opacity}>
            {layer.strokes.map((stroke) => (
                <StrokeRenderer
                    key={stroke.id}
                    points={stroke.points}
                    color={stroke.color}
                    width={stroke.width}
                    opacity={stroke.opacity * layer.opacity}
                />
            ))}
        </group>
    );
};

// Stroke Renderer Component
const StrokeRenderer: React.FC<{
    points: THREE.Vector3[];
    color: string;
    width: number;
    opacity: number;
}> = ({ points, color, width, opacity }) => {
    if (points.length < 2) return null;

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
        <line geometry={geometry}>
            <lineBasicMaterial color={color} linewidth={width} transparent opacity={opacity} />
        </line>
    );
};

// Collaborator Cursor Component
const CollaboratorCursor: React.FC<{
    position: [number, number, number];
    name: string;
    zodiacSign: string;
}> = ({ position, name, zodiacSign }) => {
    return (
        <group position={position}>
            <Sphere args={[0.05]} material-color="#ff6b6b" />
            <Text
                position={[0.1, 0.1, 0]}
                fontSize={0.1}
                color="#ffffff"
                anchorX="left"
                anchorY="bottom"
            >
                {name}
            </Text>
        </group>
    );
};

// Cosmic Toolbar Component
const CosmicToolbar: React.FC<{
    currentTool: any;
    onToolChange: (tool: any) => void;
    onSave: () => void;
    onExport: (format: 'png' | 'svg' | 'json') => void;
    canUndo: boolean;
    canRedo: boolean;
    isCollaborative: boolean;
}> = ({ currentTool, onToolChange, onSave, onExport, canUndo, canRedo, isCollaborative }) => {
    const tools = [
        { type: 'cosmic-brush', icon: Wand2, name: 'Cosmic Brush' },
        { type: 'brush', icon: Brush, name: 'Brush' },
        { type: 'pen', icon: Type, name: 'Pen' },
        { type: 'eraser', icon: Eraser, name: 'Eraser' },
        { type: 'move', icon: Move, name: 'Move' }
    ];

    return (
        <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
                {/* Tool Selection */}
                <div className="flex items-center space-x-2">
                    {tools.map((tool) => (
                        <button
                            key={tool.type}
                            onClick={() => onToolChange({ ...currentTool, type: tool.type })}
                            className={`p-3 rounded-lg transition-colors ${currentTool.type === tool.type
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                            title={tool.name}
                        >
                            <tool.icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>

                {/* Tool Settings */}
                <div className="flex items-center space-x-4">
                    {/* Color Picker */}
                    <div className="flex items-center space-x-2">
                        <span className="text-white/60 text-sm">Color:</span>
                        <input
                            type="color"
                            value={currentTool.color}
                            onChange={(e) => onToolChange({ ...currentTool, color: e.target.value })}
                            className="w-8 h-8 rounded border border-white/20"
                        />
                    </div>

                    {/* Size Slider */}
                    <div className="flex items-center space-x-2">
                        <span className="text-white/60 text-sm">Size:</span>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={currentTool.size}
                            onChange={(e) => onToolChange({ ...currentTool, size: parseInt(e.target.value) })}
                            className="w-20"
                        />
                        <span className="text-white text-sm w-8">{currentTool.size}</span>
                    </div>

                    {/* Opacity Slider */}
                    <div className="flex items-center space-x-2">
                        <span className="text-white/60 text-sm">Opacity:</span>
                        <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={currentTool.opacity}
                            onChange={(e) => onToolChange({ ...currentTool, opacity: parseFloat(e.target.value) })}
                            className="w-20"
                        />
                        <span className="text-white text-sm w-8">{Math.round(currentTool.opacity * 100)}%</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => { }}
                        disabled={!canUndo}
                        className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                        title="Undo"
                    >
                        <Undo className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { }}
                        disabled={!canRedo}
                        className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                        title="Redo"
                    >
                        <Redo className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-2" />
                    <button
                        onClick={onSave}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors"
                        title="Save"
                    >
                        <Save className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onExport('png')}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Export"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { }}
                        className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                        title="Share"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Layer Panel Component
const LayerPanel: React.FC<{
    layers: CosmicLayer[];
    activeLayerId: string;
    onLayerSelect: (layerId: string) => void;
    onLayerAdd: () => void;
    onLayerToggle: (layerId: string) => void;
    onLayerDelete: (layerId: string) => void;
}> = ({ layers, activeLayerId, onLayerSelect, onLayerAdd, onLayerToggle, onLayerDelete }) => {
    return (
        <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-2xl p-4 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Layers</h3>
                <button
                    onClick={onLayerAdd}
                    className="p-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors"
                    title="Add Layer"
                >
                    <Users className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2">
                {layers.map((layer) => (
                    <div
                        key={layer.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${layer.id === activeLayerId
                                ? 'bg-white/10 border-cyan-500/30'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        onClick={() => onLayerSelect(layer.id)}
                    >
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLayerToggle(layer.id);
                                }}
                                className="text-white/60 hover:text-white"
                            >
                                {layer.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <span className="text-white text-sm">{layer.name}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Toggle lock
                                }}
                                className="text-white/60 hover:text-white"
                            >
                                {layer.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            {layers.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onLayerDelete(layer.id);
                                    }}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Collaborator Panel Component
const CollaboratorPanel: React.FC<{
    collaborators: Array<{
        id: string;
        name: string;
        zodiacSign: string;
        isActive: boolean;
        cursor: { x: number; y: number } | null;
    }>;
}> = ({ collaborators }) => {
    return (
        <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-2xl p-4 h-full">
            <h3 className="text-white font-semibold mb-4">Collaborators</h3>

            <div className="space-y-3">
                {collaborators.map((collaborator) => (
                    <div
                        key={collaborator.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${collaborator.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                            <div>
                                <div className="text-white text-sm font-medium">{collaborator.name}</div>
                                <div className="text-white/60 text-xs">{collaborator.zodiacSign}</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button className="p-1 text-white/60 hover:text-white">
                                <Heart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
                <button className="w-full py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors text-sm">
                    Invite More Artists
                </button>
            </div>
        </div>
    );
};

export default CosmicArtCanvas;