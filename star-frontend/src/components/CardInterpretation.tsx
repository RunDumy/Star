'use client';

import { DraggedCard, InteractiveReading } from '../types/tarot-interactions';
import CosmicCard from './CosmicCard';
import { useState, useEffect } from 'react';

interface CardInterpretationProps {
  reading: InteractiveReading;
  selectedCard?: DraggedCard | null;
  onCardSelect: (card: DraggedCard | null) => void;
}

export default function CardInterpretation({
  reading,
  selectedCard,
  onCardSelect
}: CardInterpretationProps) {
  const [activeTab, setActiveTab] = useState<'positions' | 'cosmic'>('positions');
  const [hasError, setHasError] = useState(false);

  // Reset error state when reading changes
  useEffect(() => {
    setHasError(false);
  }, [reading]);

  // Safe error handler
  const handleError = (error: Error) => {
    console.error('CardInterpretation error:', error);
    setHasError(true);
  };

  const renderPositionInterpretations = () => {
    return (
      <div className="space-y-4">
        {reading.spread.positions.map((position) => {
          const cardInPosition = reading.cards.find(card => {
            const distX = Math.abs(position.x * 8 - card.position.x);
            const distY = Math.abs(position.y * 6 - card.position.y);
            return distX < 50 && distY < 50;
          });

          return (
            <div
              key={position.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                cardInPosition
                  ? 'border-cosmic-accent bg-cosmic-light/5 cursor-pointer hover:bg-cosmic-light/10'
                  : 'border-cosmic-purple/30 bg-cosmic-deep/20'
              }`}
              onClick={() => cardInPosition && onCardSelect(cardInPosition)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-mystical text-cosmic-gold">
                  {position.label}
                </h4>
                {cardInPosition && (
                  <span className="text-sm text-cosmic-light bg-cosmic-purple/20 px-2 py-1 rounded">
                    Card #{cardInPosition.number}
                  </span>
                )}
              </div>

              <p className="text-sm text-cosmic-light mb-3">
                {position.meaning_context}
              </p>

              {cardInPosition ? (
                <div className="space-y-2">
                  <p className="text-sm italic text-cosmic-light/80">
                    &ldquo;{reading.interpretations[position.id]}&rdquo;
                  </p>
                  {cardInPosition === selectedCard && (
                    <div className="mt-4 p-3 bg-cosmic-accent/20 rounded border border-cosmic-accent/50">
                      <p className="text-sm text-cosmic-light">
                        <strong>Card:</strong> {cardInPosition.cardName}<br/>
                        <strong>Cosmic Influence:</strong> Active pattern modifications
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-cosmic-light/60">
                  Position empty - awaiting your cosmic placement ✨
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCosmicAnalysis = () => {
    const energyStrength = reading.energy_flow?.reduce((sum, flow) => sum + flow.strength, 0) || 5;
    const dominantElement = reading.energy_flow?.[0]?.element || 'Universal';

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-mystical text-cosmic-gold mb-2">
            Cosmic Alignment Reading
          </h3>
          <p className="text-cosmic-light/80">{reading.cosmic_alignment}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/20 p-4 rounded-lg border border-cosmic-light/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-cosmic-gold mb-1">{energyStrength}/10</div>
              <div className="text-sm text-cosmic-light">Energy Intensity</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cosmic-accent/20 to-cosmic-gold/20 p-4 rounded-lg border border-cosmic-light/20">
            <div className="text-center">
              <div className="text-xl font-bold text-cosmic-light mb-1">{dominantElement}</div>
              <div className="text-sm text-cosmic-light/80">Dominant Element</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-mystical text-cosmic-gold">Energy Flow Analysis</h4>
          {reading.energy_flow?.slice(0, 3).map((flow, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-cosmic-deep/30 rounded">
              <span className="text-cosmic-light">
                Card {flow.fromCardId} → Card {flow.toCardId}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${flow.element === 'Fire' ? 'bg-red-500/20 text-red-300' :
                flow.element === 'Water' ? 'bg-blue-500/20 text-blue-300' :
                flow.element === 'Earth' ? 'bg-green-500/20 text-green-300' :
                'bg-yellow-500/20 text-yellow-300'}`}>
                {flow.element} • {flow.strength}/5
              </span>
            </div>
          )) || (
            <p className="text-cosmic-light/60">Analyzing cosmic connections...</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <CosmicCard className="w-full max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-mystical text-cosmic-gold mb-4 text-center">
          Reading Interpretation
        </h2>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 rounded-lg font-mystical transition-all ${
              activeTab === 'positions'
                ? 'bg-cosmic-accent text-cosmic-deep'
                : 'text-cosmic-light hover:bg-cosmic-purple/20'
            }`}
          >
            Position Analysis
          </button>
          <button
            onClick={() => setActiveTab('cosmic')}
            className={`px-4 py-2 rounded-lg font-mystical transition-all ${
              activeTab === 'cosmic'
                ? 'bg-cosmic-accent text-cosmic-deep'
                : 'text-cosmic-light hover:bg-cosmic-purple/20'
            }`}
          >
            Cosmic Flow
          </button>
        </div>
      </div>

      <div className="interpretation-content overflow-y-auto max-h-96">
        {hasError ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌙</div>
            <p className="text-cosmic-light mb-2">Cosmic alignment disrupted</p>
            <button
              onClick={() => setHasError(false)}
              className="px-4 py-2 bg-cosmic-accent text-cosmic-deep rounded-lg text-sm hover:opacity-80 transition-opacity"
            >
              Try Again
            </button>
          </div>
        ) : reading ? (
          <>
            {(() => {
              try {
                return activeTab === 'positions' ? renderPositionInterpretations() : renderCosmicAnalysis();
              } catch (error) {
                handleError(error as Error);
                return null;
              }
            })()}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin text-2xl mb-4">✨</div>
            <p className="text-cosmic-light/60">Preparing your cosmic reading...</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-cosmic-light/60 text-sm">
        ✨ Click cards to see their cosmic positioning ✨
      </div>
    </CosmicCard>
  );
}
