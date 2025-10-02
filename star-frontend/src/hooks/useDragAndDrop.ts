'use client';

import { useState, useCallback } from 'react';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { DraggedCard, TarotSpread, SpreadPosition } from '../types/tarot-interactions';

interface UseDragAndDropOptions {
  initialCards: DraggedCard[];
  spread: TarotSpread;
  snapDistance?: number; // pixels to trigger snap to position
}

export function useDragAndDrop({
  initialCards,
  spread,
  snapDistance = 50
}: UseDragAndDropOptions) {
  const [cards, setCards] = useState<DraggedCard[]>(initialCards);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false);
    const { active, delta } = event;

    if (!active.id || !delta) return;

    setCards(currCards => currCards.map(card => {
      if (card.id !== active.id) return card;

      const newX = card.position.x + delta.x;
      const newY = card.position.y + delta.y;

      // Check for snap to spread positions
      let snappedPosition = { x: newX, y: newY };
      for (const position of spread.positions) {
        const posX = position.x * 1000; // Assuming canvas width 1000px for calculation
        const posY = position.y * 1000;
        const distance = Math.sqrt((posX - newX) ** 2 + (posY - newY) ** 2);

        if (distance < snapDistance) {
          snappedPosition = { x: posX, y: posY };
          break;
        }
      }

      return {
        ...card,
        position: snappedPosition,
      };
    }));
  }, [spread.positions, snapDistance]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over logic - for now, just log
    console.log('Drag over:', event);
  }, []);

  const updateCardPosition = useCallback((cardId: string, position: { x: number; y: number }) => {
    setCards(currCards => currCards.map(card =>
      card.id === cardId ? { ...card, position } : card
    ));
  }, []);

  const rotateCard = useCallback((cardId: string, rotation: number) => {
    setCards(currCards => currCards.map(card =>
      card.id === cardId ? { ...card, rotation } : card
    ));
  }, []);

  const flipCard = useCallback((cardId: string) => {
    setCards(currCards => currCards.map(card =>
      card.id === cardId ? { ...card, isFaceDown: !card.isFaceDown } : card
    ));
  }, []);

  const resetCards = useCallback(() => {
    setCards(initialCards);
  }, [initialCards]);

  return {
    cards,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    updateCardPosition,
    rotateCard,
    flipCard,
    resetCards,
  };
}
