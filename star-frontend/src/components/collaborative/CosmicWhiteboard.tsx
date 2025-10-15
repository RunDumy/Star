import { Line, Sphere, Text } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import {
    Brush,
    Circle,
    Eraser,
    Minus,
    MousePointer,
    Redo,
    Save,
    Square,
    Triangle,
    Type,
    Undo,
    Users
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

interface DrawingPoint {
    x: number;
    y: number;
    z: number;
    pressure?: number;
    timestamp: number;
    userId: string;
    userName: string;
    color: string;
}

interface DrawingStroke {
    id: string;
    points: DrawingPoint[];
    tool: string;
    color: string;
    size: number;
    userId: string;
    userName: string;
    timestamp: number;
}

interface CosmicWhiteboardProps {
    roomId: string;
    onStrokeAdded?: (stroke: DrawingStroke) => void;
    onStrokeRemoved?: (strokeId: string) => void;
    collaborators?: Array<{
        id: string;
        name: string;
        color: string;
        cursor?: { x: number; y: number; z: number };
    }>;
}

interface DrawingToolsProps {
    selectedTool: string;
    onToolChange: (tool: string) => void;
    selectedColor: string;
    onColorChange: (color: string) => void;
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onSave: () => void;
    canUndo: boolean;
    canRedo: boolean;
    collaboratorCount: number;
}

// 3D Drawing Surface Component
const DrawingSurface: React.FC<{
    strokes: DrawingStroke[];
    onDrawingStart: (point: DrawingPoint) => void;
    onDrawingUpdate: (point: DrawingPoint) => void;
    onDrawingEnd: () => void;
    currentTool: string;
    currentColor: string;
    brushSize: number;
    collaborators: any[];
}> = ({
    strokes,
    onDrawingStart,
    onDrawingUpdate,
    onDrawingEnd,
    currentTool,
    currentColor,
    brushSize,
    collaborators
}) => {
        const meshRef = useRef<THREE.Mesh>(null);
        const { camera, raycaster, mouse } = useThree();
        const [isDrawing, setIsDrawing] = useState(false);
        const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);

        const handlePointerDown = useCallback((event: any) => {
            if (currentTool === 'select') return;

            const point = event.point;
            const drawingPoint: DrawingPoint = {
                x: point.x,
                y: point.y,
                z: point.z,
                pressure: event.pressure || 1,
                timestamp: Date.now(),
                userId: 'current-user', // Get from auth context
                userName: 'Current User',
                color: currentColor
            };

            setIsDrawing(true);
            setCurrentStroke([drawingPoint]);
            onDrawingStart(drawingPoint);
        }, [currentTool, currentColor, onDrawingStart]);

        const handlePointerMove = useCallback((event: any) => {
            if (!isDrawing || currentTool === 'select') return;

            const point = event.point;
            const drawingPoint: DrawingPoint = {
                x: point.x,
                y: point.y,
                z: point.z,
                pressure: event.pressure || 1,
                timestamp: Date.now(),
                userId: 'current-user',
                userName: 'Current User',
                color: currentColor
            };

            setCurrentStroke(prev => [...prev, drawingPoint]);
            onDrawingUpdate(drawingPoint);
        }, [isDrawing, currentTool, currentColor, onDrawingUpdate]);

        const handlePointerUp = useCallback(() => {
            if (!isDrawing) return;
            setIsDrawing(false);
            setCurrentStroke([]);
            onDrawingEnd();
        }, [isDrawing, onDrawingEnd]);

        return (
            <group>
                {/* Drawing Surface */}
                <mesh
                    ref={meshRef}
                    position={[0, 0, 0]}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    <planeGeometry args={[20, 15]} />
                    <meshBasicMaterial
                        color="#0a0a2a"
                        transparent
                        opacity={0.1}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Render completed strokes */}
                {strokes.map((stroke) => (
                    <StrokeRenderer key={stroke.id} stroke={stroke} />
                ))}

                {/* Render current stroke being drawn */}
                {currentStroke.length > 1 && (
                    <StrokeRenderer
                        stroke={{
                            id: 'current',
                            points: currentStroke,
                            tool: currentTool,
                            color: currentColor,
                            size: brushSize,
                            userId: 'current-user',
                            userName: 'Current User',
                            timestamp: Date.now()
                        }}
                    />
                )}

                {/* Collaborator cursors */}
                {collaborators.map((collaborator) => (
                    collaborator.cursor && (
                        <CollaboratorCursor
                            key={collaborator.id}
                            position={collaborator.cursor}
                            color={collaborator.color}
                            name={collaborator.name}
                        />
                    )
                ))}
            </group>
        );
    };

// Individual stroke renderer
const StrokeRenderer: React.FC<{ stroke: DrawingStroke }> = ({ stroke }) => {
    const points = stroke.points.map(p => new THREE.Vector3(p.x, p.y, p.z));

    if (points.length < 2) return null;

    return (
        <Line
            points={points}
            color={stroke.color}
            lineWidth={stroke.size}
            transparent
            opacity={0.8}
        />
    );
};

// Collaborator cursor component
const CollaboratorCursor: React.FC<{
    position: { x: number; y: number; z: number };
    color: string;
    name: string;
}> = ({ position, color, name }) => {
    return (
        <group position={[position.x, position.y, position.z + 0.1]}>
            <Sphere args={[0.05]}>
                <meshBasicMaterial color={color} />
            </Sphere>
            <Text
                position={[0, 0.3, 0]}
                fontSize={0.2}
                color={color}
                anchorX="center"
                anchorY="bottom"
            >
                {name}
            </Text>
        </group>
    );
};

// Drawing tools panel
const DrawingTools: React.FC<DrawingToolsProps> = ({
    selectedTool,
    onToolChange,
    selectedColor,
    onColorChange,
    brushSize,
    onBrushSizeChange,
    onUndo,
    onRedo,
    onClear,
    onSave,
    canUndo,
    canRedo,
    collaboratorCount
}) => {
    const tools = [
        { id: 'brush', name: 'Brush', icon: Brush },
        { id: 'eraser', name: 'Eraser', icon: Eraser },
        { id: 'line', name: 'Line', icon: Minus },
        { id: 'circle', name: 'Circle', icon: Circle },
        { id: 'rectangle', name: 'Rectangle', icon: Square },
        { id: 'triangle', name: 'Triangle', icon: Triangle },
        { id: 'text', name: 'Text', icon: Type },
        { id: 'select', name: 'Select', icon: MousePointer }
    ];

    const colors = [
        '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
        '#ffeaa7', '#dda0dd', '#98fb98', '#f0e68c', '#ffa07a',
        '#20b2aa', '#87ceeb', '#dda0dd', '#f5deb3', '#ffffff'
    ];

    return (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-2xl">
            {/* Collaborator Count */}
            <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-white/20">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-sm">{collaboratorCount} online</span>
            </div>

            {/* Tools */}
            <div className="mb-4">
                <h3 className="text-white text-sm font-medium mb-2">Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => onToolChange(tool.id)}
                            className={`flex items-center justify-center p-3 rounded-lg transition-all ${selectedTool === tool.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                                }`}
                            title={tool.name}
                        >
                            <tool.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div className="mb-4">
                <h3 className="text-white text-sm font-medium mb-2">Colors</h3>
                <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => onColorChange(color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedColor === color
                                    ? 'border-white scale-110'
                                    : 'border-white/30 hover:border-white/60'
                                }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            {/* Brush Size */}
            {(selectedTool === 'brush' || selectedTool === 'eraser') && (
                <div className="mb-4">
                    <h3 className="text-white text-sm font-medium mb-2">Size</h3>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                    />
                    <div className="text-center text-white/60 text-xs mt-1">{brushSize}px</div>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
                <div className="flex space-x-2">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="flex-1 flex items-center justify-center space-x-2 p-2 bg-white/10 text-white/60 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Undo className="w-4 h-4" />
                        <span className="text-xs">Undo</span>
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="flex-1 flex items-center justify-center space-x-2 p-2 bg-white/10 text-white/60 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Redo className="w-4 h-4" />
                        <span className="text-xs">Redo</span>
                    </button>
                </div>
                <button
                    onClick={onSave}
                    className="w-full flex items-center justify-center space-x-2 p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30"
                >
                    <Save className="w-4 h-4" />
                    <span className="text-xs">Save</span>
                </button>
                <button
                    onClick={onClear}
                    className="w-full flex items-center justify-center space-x-2 p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30"
                >
                    <Eraser className="w-4 h-4" />
                    <span className="text-xs">Clear All</span>
                </button>
            </div>
        </div>
    );
};

// Main Cosmic Whiteboard Component
export const CosmicWhiteboard: React.FC<CosmicWhiteboardProps> = ({
    roomId,
    onStrokeAdded,
    onStrokeRemoved,
    collaborators = []
}) => {
    const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
    const [undoStack, setUndoStack] = useState<DrawingStroke[][]>([]);
    const [redoStack, setRedoStack] = useState<DrawingStroke[][]>([]);
    const [currentTool, setCurrentTool] = useState('brush');
    const [currentColor, setCurrentColor] = useState('#ffd700');
    const [brushSize, setBrushSize] = useState(5);
    const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);

    const handleDrawingStart = useCallback((point: DrawingPoint) => {
        setCurrentStroke([point]);
        // Save current state for undo
        setUndoStack(prev => [...prev, strokes]);
        setRedoStack([]);
    }, [strokes]);

    const handleDrawingUpdate = useCallback((point: DrawingPoint) => {
        setCurrentStroke(prev => [...prev, point]);
    }, []);

    const handleDrawingEnd = useCallback(() => {
        if (currentStroke.length > 1) {
            const newStroke: DrawingStroke = {
                id: `stroke-${Date.now()}-${Math.random()}`,
                points: currentStroke,
                tool: currentTool,
                color: currentColor,
                size: brushSize,
                userId: 'current-user',
                userName: 'Current User',
                timestamp: Date.now()
            };

            setStrokes(prev => [...prev, newStroke]);
            onStrokeAdded?.(newStroke);
        }
        setCurrentStroke([]);
    }, [currentStroke, currentTool, currentColor, brushSize, onStrokeAdded]);

    const handleUndo = useCallback(() => {
        if (undoStack.length > 0) {
            const previousState = undoStack[undoStack.length - 1];
            setRedoStack(prev => [strokes, ...prev]);
            setStrokes(previousState);
            setUndoStack(prev => prev.slice(0, -1));
        }
    }, [undoStack, strokes]);

    const handleRedo = useCallback(() => {
        if (redoStack.length > 0) {
            const nextState = redoStack[0];
            setUndoStack(prev => [...prev, strokes]);
            setStrokes(nextState);
            setRedoStack(prev => prev.slice(1));
        }
    }, [redoStack, strokes]);

    const handleClear = useCallback(() => {
        setUndoStack(prev => [...prev, strokes]);
        setRedoStack([]);
        setStrokes([]);
    }, [strokes]);

    const handleSave = useCallback(() => {
        // Export as JSON or image
        const whiteboardData = {
            roomId,
            strokes,
            timestamp: new Date().toISOString(),
            collaborators: collaborators.map(c => ({ id: c.id, name: c.name }))
        };

        const blob = new Blob([JSON.stringify(whiteboardData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cosmic-whiteboard-${roomId}-${Date.now()}.json`;
        link.click();
    }, [roomId, strokes, collaborators]);

    return (
        <div className="w-full h-screen relative bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 60 }}
                onCreated={({ gl }) => {
                    gl.setClearColor('#0a0a2a');
                }}
            >
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={0.8} />

                <DrawingSurface
                    strokes={strokes}
                    onDrawingStart={handleDrawingStart}
                    onDrawingUpdate={handleDrawingUpdate}
                    onDrawingEnd={handleDrawingEnd}
                    currentTool={currentTool}
                    currentColor={currentColor}
                    brushSize={brushSize}
                    collaborators={collaborators}
                />
            </Canvas>

            <DrawingTools
                selectedTool={currentTool}
                onToolChange={setCurrentTool}
                selectedColor={currentColor}
                onColorChange={setCurrentColor}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClear={handleClear}
                onSave={handleSave}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
                collaboratorCount={collaborators.length + 1}
            />

            {/* Room Info */}
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-lg rounded-xl p-3 border border-white/20">
                <div className="text-white text-sm">
                    <div className="font-medium">Room: {roomId}</div>
                    <div className="text-white/60">{collaborators.length + 1} active users</div>
                </div>
            </div>
        </div>
    );
};

export default CosmicWhiteboard;