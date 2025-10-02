'use client';

import { ReactNode } from 'react';
import { DndContext, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { TarotSpread, DraggedCard, EnergyFlow } from '../types/tarot-interactions';
import TarotCard from './TarotCard';
import EnergyFlowVisualizer from './EnergyFlowVisualizer';

interface SpreadCanvasProps {
  spread: TarotSpread;
  cards: DraggedCard[];
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  canvasSize?: { width: number; height: number };
  energyFlows?: EnergyFlow[];
  showEnergyFlows?: boolean;
  onEnergyFlowClick?: (flow: EnergyFlow) => void;
}

export default function SpreadCanvas({
  spread,
  cards,
  onDragEnd,
  onDragOver,
  canvasSize = { width: 800, height: 600 },
  energyFlows = [],
  showEnergyFlows = false,
  onEnergyFlowClick
}: SpreadCanvasProps) {
  const canvasStyle = {
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    background: 'linear-gradient(135deg, rgba(23, 12, 61, 0.8) 0%, rgba(46, 24, 98, 0.6) 100%)',
    borderRadius: '12px',
    position: 'relative' as const,
    border: '1px solid rgba(139, 92, 246, 0.3)',
  };

  return (
    <DndContext onDragEnd={onDragEnd} onDragOver={onDragOver}>
      <div style={canvasStyle} className="spread-canvas mx-auto my-4 overflow-hidden">
        {/* Render spread position guidelines with prediction zones */}
        {spread.positions.map((position) => (
          <div
            key={position.id}
            className="absolute border-2 border-dashed border-cosmic-light/30 rounded-lg flex items-center justify-center text-cosmic-light text-xs font-mystical opacity-60 transition-all duration-500"
            style={{
              left: `${position.x * canvasSize.width / 100}px`,
              top: `${position.y * canvasSize.height / 100}px`,
              width: '120px',
              height: '180px',
              transform: `translate(-50%, -50%) rotate(${position.rotation}deg) scale(${position.scale})`,
            }}
          >
            {/* Prediction glow effect when dragging */}
            <div className="absolute inset-0 rounded-lg bg-cosmic-accent/20 border-2 border-cosmic-accent/50 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="text-center px-2 py-1 bg-cosmic-deep/50 rounded backdrop-blur-sm relative">
              {position.label}
            </div>
          </div>
        ))}

        {/* Render cards */}
        {cards.map((card) => (
          <TarotCard
            key={card.id}
            card={card}
          />
        ))}

        {/* Energy Flow Visualization Overlay */}
        {showEnergyFlows && energyFlows.length > 0 && (
          <div className="absolute inset-0 pointer-events-auto">
            <EnergyFlowVisualizer
              width={canvasSize.width}
              height={canvasSize.height}
              energyFlows={energyFlows}
              cardPositions={new Map(cards.map(card => [card.id, card.position]))}
              onFlowClick={onEnergyFlowClick}
              animated={true}
            />
          </div>
        )}

        {/* Cosmic overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-20">
            <defs>
              <radialGradient id="cosmic-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx={canvasSize.width / 2} cy={canvasSize.height / 2} r="100" fill="url(#cosmic-gradient)" />
            <circle cx={canvasSize.width / 4} cy={canvasSize.height / 4} r="50" fill="url(#cosmic-gradient)" />
            <circle cx={3 * canvasSize.width / 4} cy={3 * canvasSize.height / 4} r="50" fill="url(#cosmic-gradient)" />
          </svg>
        </div>
      </div>
    </DndContext>
  );
}
