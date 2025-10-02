'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import { EnergyFlow } from '../types/tarot-interactions';
import { useTouchGestures, useTarotGestures } from '../hooks/useTouchGestures';
import { useTarotKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface EnergyFlowVisualizerProps {
  width: number;
  height: number;
  energyFlows: EnergyFlow[];
  cardPositions: Map<string, { x: number; y: number }>;
  onFlowClick?: (flow: EnergyFlow) => void;
  animated?: boolean;
}

interface FlowPathPoint {
  x: number;
  y: number;
  amplitude?: number;
  phase?: number;
}

export default function EnergyFlowVisualizer({
  width,
  height,
  energyFlows,
  cardPositions,
  onFlowClick,
  animated = true
}: EnergyFlowVisualizerProps) {
  const animationRef = useRef<number>();
  const stageRef = useRef<HTMLDivElement>(null);
  const [animationOffset, setAnimationOffset] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState<EnergyFlow | null>(null);
  const [gestureMode, setGestureMode] = useState<'select' | 'zoom'>('select');

  // Generate path points for different flow styles
  const generateFlowPath = (start: { x: number; y: number }, end: { x: number; y: number }, flow: EnergyFlow): FlowPathPoint[] => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const segments = Math.max(20, Math.floor(distance / 5)); // More segments for longer distances

    switch (flow.style) {
      case 'arc':
        return generateArcPath(start, end, segments);

      case 'wave':
        return generateWavePath(start, end, segments);

      case 'line':
      default:
        return generateLinePath(start, end, segments);
    }
  };

  const generateLinePath = (start: { x: number; y: number }, end: { x: number; y: number }, segments: number): FlowPathPoint[] => {
    const points: FlowPathPoint[] = [];
    const dx = (end.x - start.x) / segments;
    const dy = (end.y - start.y) / segments;

    for (let i = 0; i <= segments; i++) {
      points.push({
        x: start.x + dx * i,
        y: start.y + dy * i
      });
    }
    return points;
  };

  const generateArcPath = (start: { x: number; y: number }, end: { x: number; y: number }, segments: number): FlowPathPoint[] => {
    const points: FlowPathPoint[] = [];
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const arcHeight = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) * 0.15; // 15% of distance as arc height

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;

      // Add quadratic bezier curve effect
      const parabola = 4 * t * (1 - t); // Peak at t=0.5
      const normalX = end.y - start.y;
      const normalY = -(end.x - start.x);
      const length = Math.sqrt(normalX * normalX + normalY * normalY);

      points.push({
        x: x + (normalX / length) * arcHeight * parabola,
        y: y + (normalY / length) * arcHeight * parabola
      });
    }
    return points;
  };

  const generateWavePath = (start: { x: number; y: number }, end: { x: number; y: number }, segments: number): FlowPathPoint[] => {
    const points: FlowPathPoint[] = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const waveLength = Math.max(distance / 4, 20); // At least 4 waves or minimum wavelength
    const amplitude = Math.min(distance / 8, 10); // Wave amplitude proportional to distance

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = start.x + dx * t;
      const y = start.y + dy * t;

      // Add sine wave perpendicular to flow direction
      const wavePhase = distance * t / waveLength;
      const waveOffset = Math.sin(wavePhase + animationOffset) * amplitude;

      const normalX = end.y - start.y;
      const normalY = -(end.x - start.x);
      const length = Math.sqrt(normalX * normalX + normalY * normalY);

      points.push({
        x: x + (normalX / length) * waveOffset,
        y: y + (normalY / length) * waveOffset,
        amplitude,
        phase: wavePhase
      });
    }
    return points;
  };

  // Memoize path calculation to avoid recalculation per frame
  const paths = useMemo(() => {
    const memoizedPaths: Map<string, FlowPathPoint[]> = new Map();

    if (!cardPositions.size) return memoizedPaths;

    energyFlows.forEach(flow => {
      const key = `${flow.id}-${animationOffset.toFixed(1)}`; // Cached with rounded offset
      if (!memoizedPaths.has(key)) {
        const startCard = cardPositions.get(flow.fromCardId);
        const endCard = cardPositions.get(flow.toCardId);
        if (startCard && endCard) {
          memoizedPaths.set(key, generateFlowPath(startCard, endCard, flow));
        }
      }
    });

    return memoizedPaths;
  }, [energyFlows, cardPositions, animationOffset]);

  // Animation loop for flowing energy effects
  useEffect(() => {
    if (!animated) return;

    const animate = () => {
      setAnimationOffset(prev => (prev + 0.02) % (2 * Math.PI));
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated]);

  // Convert path points to Konva Line points array
  const pathToPoints = (path: FlowPathPoint[]): number[] => {
    return path.flatMap(point => [point.x, point.y]);
  };

  // Render energy flow connections
  const renderEnergyFlows = useCallback(() => {
    if (!cardPositions.size) return null;

    return energyFlows.map((flow) => {
      const key = `${flow.id}-${animationOffset.toFixed(1)}`;
      const path = paths.get(key);

      if (!path) return null;

      const points = pathToPoints(path);

      // Create gradient-like opacity based on flow strength
      const opacity = Math.max(0.2, flow.strength / 5); // 0.2-1.0 range
      const strokeWidth = Math.max(1, Math.min(4, flow.strength));

      return (
        <Line
          key={`${flow.id}-${animationOffset.toFixed(1)}`}
          points={points}
          stroke={flow.color}
          strokeWidth={strokeWidth}
          opacity={opacity}
          dash={[5, 5]} // Dashed line for mystical effect
          shadowColor={flow.color}
          shadowBlur={animated ? 10 + Math.sin(animationOffset) * 5 : 10}
          shadowOpacity={animated ? 0.5 - Math.sin(animationOffset) * 0.2 : 0.5}
          tension={0.3} // Smooth curve
          lineCap="round"
          lineJoin="round"
          onClick={() => onFlowClick?.(flow)}
          onTap={() => onFlowClick?.(flow)}
        />
      );
    });
  }, [energyFlows, cardPositions, paths, animationOffset, animated, onFlowClick]);

  // Render energy intensity indicators
  const renderFlowIndicators = () => {
    if (!cardPositions.size) return null;

    return energyFlows.map((flow) => {
      const startCard = cardPositions.get(flow.fromCardId);
      const endCard = cardPositions.get(flow.toCardId);

      if (!startCard || !endCard) return null;

      const midX = (startCard.x + endCard.x) / 2;
      const midY = (startCard.y + endCard.y) / 2;

      return (
        <Circle
          key={`indicator-${flow.id}`}
          x={midX}
          y={midY}
          radius={flow.strength * 2}
          fill={flow.color}
          opacity={animated ? 0.6 + Math.sin(animationOffset * 2) * 0.4 : 0.6}
          onClick={() => onFlowClick?.(flow)}
          onTap={() => onFlowClick?.(flow)}
        />
      );
    });
  };

  // Render flow labels/description text
  const renderFlowLabels = () => {
    if (!cardPositions.size) return null;

    return energyFlows.map((flow) => {
      const startCard = cardPositions.get(flow.fromCardId);
      const endCard = cardPositions.get(flow.toCardId);

      if (!startCard || !endCard) return null;

      const midX = (startCard.x + endCard.x) / 2;
      const midY = (startCard.y + endCard.y) / 2;

      // Only show label for significant flows (strength > 3)
      if (flow.strength <= 3) return null;

      return (
        <Text
          key={`label-${flow.id}`}
          x={midX - 20}
          y={midY - 20}
          text={`${flow.element}`}
          fontSize={10}
          fill="white"
          fontFamily="serif"
          opacity={0.8}
          shadowColor="black"
          shadowBlur={3}
          onClick={() => onFlowClick?.(flow)}
          onTap={() => onFlowClick?.(flow)}
        />
      );
    });
  };

  // Touch gesture integration for mobile optimization
  const handleCardSelect = useCallback((cardId: string) => {
    const flow = energyFlows.find(f => f.id === cardId);
    if (flow) {
      setSelectedFlow(flow);
      onFlowClick?.(flow);
    }
  }, [energyFlows, onFlowClick]);

  const handleCardMove = useCallback((flowId: string, position: { x: number; y: number }) => {
    // Could implement flow path manipulation here
    console.log(`Moving flow ${flowId} to`, position);
  }, []);

  const handleSpreadZoom = useCallback((scale: number) => {
    // Handle pinch-to-zoom for energy field
    setGestureMode('zoom');
    console.log('Energy field zoom scale:', scale);
  }, []);

  const touchGestures = useTarotGestures(stageRef, handleCardSelect, handleCardMove, handleSpreadZoom);

  // Keyboard navigation integration for accessibility
  const keyboardNav = useTarotKeyboardNavigation(
    (flowId: string) => {
      const flow = energyFlows.find(f => f.id === flowId);
      if (flow) {
        setSelectedFlow(flow);
        onFlowClick?.(flow);
      }
    },
    (flowId: string) => {
      // Flow focus handler
      console.log('Focusing on flow:', flowId);
    },
    undefined, // No shuffle function
    () => {
      // Toggle energy flow visibility
      console.log('Toggle energy flows');
    },
    () => {
      // Reset flows
      setSelectedFlow(null);
    },
    () => {
      console.log('Energy Flow Help: Use arrow keys to navigate flows, Enter to select, Escape to deselect');
    },
    energyFlows.map(flow => flow.id)
  );

  return (
    <div ref={stageRef} className="energy-flow-visualizer">
      <Stage width={width} height={height}>
        <Layer>
          {/* Background energy field (subtle) */}
          <Circle
            x={width / 2}
            y={height / 2}
            radius={Math.max(width, height)}
            fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
            fillRadialGradientEndRadius={Math.max(width, height)}
            fillRadialGradientColorStops={[0, 'rgba(0,0,0,0)', 1, 'rgba(50,50,50,0.1)']}
            opacity={animated ? 0.3 + Math.sin(animationOffset * 0.5) * 0.1 : 0.3}
          />

          {/* Energy flow connections */}
          {renderEnergyFlows()}

          {/* Energy intensity indicators */}
          {renderFlowIndicators()}

          {/* Flow element labels */}
          {renderFlowLabels()}
        </Layer>
      </Stage>
    </div>
  );
}
