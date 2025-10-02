'use client';

import { useState, useEffect, useRef } from 'react';
import { TAROT_SPREADS } from '../lib/tarot-spreads';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useSpringAnimation } from '../hooks/useSpringAnimation';
import { useTouchGestures } from '../hooks/useTouchGestures';
import { useTarotKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { DraggedCard, TarotSpread, InteractiveReading, EnergyFlow } from '../types/tarot-interactions';
import { CosmicUIProperties } from '../types/archetype-oracle';
import SpreadCanvas from './SpreadCanvas';
import EnergyFlowVisualizer from './EnergyFlowVisualizer';
import CosmicButton from './CosmicButton';
import CosmicCard from './CosmicCard';
import CardInterpretation from './CardInterpretation';
import SharingModal from './SharingModal';
import { soundManager } from '../lib/soundEffects';
import { hapticManager } from '../lib/hapticEffects';

export default function InteractiveTarotReader() {
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(TAROT_SPREADS.three_card);
  const [reading, setReading] = useState<InteractiveReading | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DraggedCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [energyFlows, setEnergyFlows] = useState<EnergyFlow[]>([]);
  const [cardPositions, setCardPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [showEnergyFlows, setShowEnergyFlows] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSharingModal, setShowSharingModal] = useState(false);

  // Refs for touch gestures
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate initial cards for the spread
  const generateInitialCards = (spreadType: string) => {
    const spread = TAROT_SPREADS[spreadType];
    const cards = spread.positions.map((position, index) => {
      const mockCosmicProperties: CosmicUIProperties = {
        colors: {
          primary: '#8b5cf6',
          secondary: '#3b82f6',
          glow: '#8b5cf6'
        },
        animation: 'glow-pulse',
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        glow_effect: 'glow-purple',
        constellation_pattern: 'ursa-major'
      };

      return {
        id: `card-${index}`,
        cardName: `Card ${index + 1}`,
        number: index + 1,
        position: {
          x: position.x * 8, // Convert percentage to canvas coords
          y: position.y * 6
        },
        rotation: position.rotation,
        isFaceDown: true,
        cosmic_properties: mockCosmicProperties
      };
    });

    // Update card positions map
    const positions = new Map<string, { x: number; y: number }>();
    cards.forEach(card => positions.set(card.id, card.position));
    setCardPositions(positions);

    return cards;
  };

  const initialCards = generateInitialCards(selectedSpread.layout_type);
  const dragState = useDragAndDrop({
    initialCards,
    spread: selectedSpread
  });

  // Spring animation for smooth card movements
  const springAnimations = useRef<Map<string, ReturnType<typeof useSpringAnimation>>>(new Map());

  // Calculate energy flows using backend API
  const calculateEnergyFlows = async (cards: DraggedCard[]) => {
    try {
      const response = await fetch('/api/v1/tarot/calculate-energy-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: cards.map(card => ({
            id: card.id,
            cardName: card.cardName,
            position: card.position
          })),
          spread: selectedSpread
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEnergyFlows(data.energy_flows || []);
      }
    } catch (error) {
      console.error('Failed to calculate energy flows:', error);
    }
  };

  // Enhanced reading generation with energy flows
  const handleGenerateReading = async () => {
    soundManager.playReadingStart();
    hapticManager.readingStart();
    setIsLoading(true);
    setError(null);

    try {
      // First calculate energy flows
      await calculateEnergyFlows(dragState.cards);

      const response = await fetch('/api/v1/tarot/enhanced-interpretation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: dragState.cards.map(card => ({
            id: card.id,
            cardName: card.cardName,
            position: card.position
          })),
          spread: selectedSpread
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      let interpretations: Record<string, string> = {};
      let cosmicAlignment = "Venus and Mercury alignment for clear communication";

      if (response.ok) {
        const data = await response.json();
        interpretations = data.interpretations || {};
        cosmicAlignment = data.cosmic_alignment || cosmicAlignment;

        // Update energy flows if not already calculated
        if (data.energy_flows && data.energy_flows.length > 0) {
          setEnergyFlows(data.energy_flows);
          setShowEnergyFlows(true);
        }
      } else {
        // Handle specific error status codes
        let errorMessage = 'Failed to connect with cosmic energies';
        if (response.status === 429) {
          errorMessage = 'Cosmic energies are overcharged. Please wait a moment.';
        } else if (response.status >= 500) {
          errorMessage = 'The cosmic realm is temporarily unreachable.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid card configuration detected.';
        }

        throw new Error(errorMessage);
      }

      const enhancedReading: InteractiveReading = {
        id: `reading-${Date.now()}`,
        spread: selectedSpread,
        cards: dragState.cards,
        interpretations,
        cosmic_alignment: cosmicAlignment,
        timestamp: new Date(),
        energy_flow: energyFlows
      };

      setReading(enhancedReading);
      soundManager.playReadingComplete();
      hapticManager.readingComplete();
      setShowInterpretation(true);
    } catch (error) {
      soundManager.playError();
      hapticManager.error();
      console.error('Failed to generate reading:', error);
      let errorMessage = 'An unexpected cosmic disruption occurred.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = 'Connection to the cosmos timed out.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShuffleCards = () => {
    // Reset cards through existing drag state
    dragState.resetCards();
    setEnergyFlows([]);
    setShowEnergyFlows(false);
    setReading(null);
    setShowInterpretation(false);
  };

  // Touch gestures integration
  const touchGestures = useTouchGestures(containerRef, {
    onDrag: (gesture) => {
      // Handle spread level gestures
      if (gesture.fingerCount === 2) {
        // Could implement spread panning/zooming here
      }
    },
    onPinch: (scale) => {
      // Handle pinch to zoom spread
      console.log('Pinch zoom:', scale);
    },
    onSwipe: (direction) => {
      // Handle swipe gestures for navigation
      if (direction === 'left') handleShuffleCards();
      else if (direction === 'right' && reading) setShowInterpretation(!showInterpretation);
    }
  });

  // Keyboard navigation integration
  const keyboardNav = useTarotKeyboardNavigation(
    (cardId) => {
      const card = dragState.cards.find(c => c.id === cardId);
      if (card) setSelectedCard(card);
    },
    (cardId) => {
      // Card focus handler for keyboard navigation
      console.log('Focusing card:', cardId);
    },
    handleShuffleCards,
    handleGenerateReading,
    () => {
      setReading(null);
      setShowInterpretation(false);
      setEnergyFlows([]);
      dragState.resetCards();
    },
    () => {
      // Show help dialog
      console.log('Help: Use arrow keys to navigate, S to shuffle, R to reveal');
    },
    dragState.cards.map(card => card.id)
  );

  const handleSpreadChange = (spreadType: string) => {
    const spread = TAROT_SPREADS[spreadType];
    if (spread) {
      setSelectedSpread(spread);
      // Reset all states when changing spreads
      setReading(null);
      setShowInterpretation(false);
      setEnergyFlows([]);
      setShowEnergyFlows(false);
      dragState.resetCards();
    }
  };

  return (
    <div className="interactive-tarot-reader w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Spread Selection */}
      <CosmicCard className="p-4">
        <h2 className="text-2xl font-mystical text-cosmic-gold mb-4 text-center">
          Choose Your Spread
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.values(TAROT_SPREADS).map((spread) => (
            <CosmicButton
              key={spread.id}
              onClick={() => handleSpreadChange(spread.id)}
              className={selectedSpread.id === spread.id ? 'ring-2 ring-cosmic-accent' : ''}
              disabled={dragState.isDragging}
            >
              <div className="text-center">
                <div className="font-mystical">{spread.name}</div>
                <div className="text-sm opacity-80">{spread.positions.length} cards</div>
              </div>
            </CosmicButton>
          ))}
        </div>
      </CosmicCard>

      {/* Error Display */}
      {error && (
        <CosmicCard className="border-red-500/30 bg-red-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-200 text-xl"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </CosmicCard>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <CosmicButton
          onClick={handleShuffleCards}
          className="px-6 py-2"
          disabled={dragState.isDragging || isLoading}
        >
          🔮 Shuffle Cards
        </CosmicButton>
        <CosmicButton
          onClick={handleGenerateReading}
          className="px-6 py-2"
          disabled={dragState.isDragging || isLoading}
        >
          {isLoading ? 'Generating...' : 'Reveal Reading ✨'}
        </CosmicButton>
        {reading && energyFlows.length > 0 && (
          <CosmicButton
            onClick={() => setShowEnergyFlows(!showEnergyFlows)}
            className={`px-6 py-2 ${showEnergyFlows ? 'ring-2 ring-energy-flow-active' : ''}`}
            disabled={isLoading}
          >
            ⚡ {showEnergyFlows ? 'Hide Energy Flows' : 'Show Energy Flows'}
          </CosmicButton>
        )}
        {reading && (
          <CosmicButton
            onClick={() => setShowSharingModal(true)}
            className="px-6 py-2"
            disabled={isLoading}
          >
            🌌 Share Spread
          </CosmicButton>
        )}
      </div>

      {/* Main Reading Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Spread Canvas */}
        <div className="flex-1">
          <SpreadCanvas
            spread={selectedSpread}
            cards={dragState.cards}
            onDragEnd={dragState.handleDragEnd}
            onDragOver={dragState.handleDragOver}
            canvasSize={{ width: showInterpretation ? 600 : 800, height: 500 }}
            energyFlows={energyFlows}
            showEnergyFlows={showEnergyFlows}
            onEnergyFlowClick={(flow) => console.log('Energy flow clicked:', flow)}
          />
        </div>

        {/* Interpretation Panel - Only show when we have a reading */}
        {showInterpretation && reading && (
          <div className="lg:w-80">
            <CardInterpretation
              reading={reading}
              selectedCard={selectedCard}
              onCardSelect={setSelectedCard}
            />
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-cosmic-deep/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl animate-spin mb-4">🌙</div>
            <div className="text-cosmic-gold font-mystical">Consulting the Cosmos...</div>
          </div>
        </div>
      )}

      {/* Sharing Modal */}
      {reading && (
        <SharingModal
          spread={reading.spread.positions.reduce((acc, pos) => ({
            ...acc,
            [pos.label]: {
              card: reading.cards.find(card => card.id === `card-${reading.spread.positions.indexOf(pos)}`) || null,
              interpretation: reading.interpretations[pos.id] || ''
            }
          }), {})}
          spreadType={selectedSpread.id}
          energyFlows={energyFlows}
          isOpen={showSharingModal}
          onClose={() => setShowSharingModal(false)}
        />
      )}
    </div>
  );
}
