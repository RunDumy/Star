import { useGesture } from '@use-gesture/react';
import { useRef, useCallback, useState } from 'react';
import { TouchGesture } from '../types/tarot-interactions';

interface TouchHandlerOptions {
  onDrag?: (gesture: TouchGesture) => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onRotate?: (angle: number, center: { x: number; y: number }) => void;
  onTap?: (position: { x: number; y: number }) => void;
  onDoubleTap?: (position: { x: number; y: number }) => void;
  onSwipe?: (direction: string, velocity: number) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
}

export function useTouchGestures(
  target: React.RefObject<HTMLElement>,
  handlers: TouchHandlerOptions = {}
) {
  const gestureState = useRef<TouchGesture[]>([]);
  const [isGesturing, setIsGesturing] = useState(false);
  const [activeGesture, setActiveGesture] = useState<TouchGesture | null>(null);

  // Detect swipe direction and velocity
  const detectSwipe = useCallback((velocity: number, direction: [number, number]): string => {
    const [dirX, dirY] = direction;
    const angle = Math.atan2(dirY, dirX) * 180 / Math.PI;

    // Convert angle to cardinal directions
    if (angle >= -45 && angle < 45) return 'right';
    if (angle >= 45 && angle < 135) return 'down';
    if (angle >= 135 || angle < -135) return 'left';
    return 'up';
  }, []);

  // Bind gestures using @use-gesture/react
  useGesture(
    {
      // Drag gesture
      onDrag: ({ active, movement: [mx, my], event }) => {
        if (handlers.onDrag && event) {
          const rect = target.current?.getBoundingClientRect();
          if (!rect) return;

          const currentPos = {
            x: (event as MouseEvent).clientX || mx,
            y: (event as MouseEvent).clientY || my
          };

          if (active && gestureState.current.length === 0) {
            // Gesture starting
            const gesture: TouchGesture = {
              startPosition: currentPos,
              currentPosition: currentPos,
              fingerCount: 1,
              gestureType: 'pan'
            };
            gestureState.current = [gesture];
            setActiveGesture(gesture);
            setIsGesturing(true);
          }

          if (gestureState.current.length > 0) {
            const gesture = gestureState.current[0];
            gesture.currentPosition = currentPos;

            if (active) {
              handlers.onDrag(gesture);
            } else {
              // Gesture ended
              setIsGesturing(false);
              setActiveGesture(null);
              gestureState.current = [];
            }
          }
        }
      },

      // Pinch gesture (scale)
      onPinch: ({ active, offset: [scale], origin: [ox, oy] }) => {
        if (handlers.onPinch && active) {
          handlers.onPinch(scale, { x: ox, y: oy });
        }
      },

      // Swipe gesture (drag end with velocity)
      onDragEnd: ({ velocity, direction }) => {
        if (handlers.onSwipe) {
          const speed = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
          if (speed > 0.5) {
            const swipeDirection = detectSwipe(speed, direction);
            handlers.onSwipe(swipeDirection, speed);
          }
        }
      }
    },
    {
      target: target.current || undefined,
      drag: { threshold: 10 },
      pinch: { threshold: 0.5 }
    }
  );

  return {
    isGesturing,
    activeGesture,
    gestureState: gestureState.current
  };
}

// Higher-level gesture recognition for common tarot interactions
export function useTarotGestures(
  target: React.RefObject<HTMLElement>,
  onCardSelect?: (cardId: string) => void,
  onCardMove?: (cardId: string, position: { x: number; y: number }) => void,
  onSpreadZoom?: (scale: number) => void,
  onSpreadRotate?: (angle: number) => void
) {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [gestureMode, setGestureMode] = useState<'select' | 'move' | 'zoom'>('select');

  const handleDrag = useCallback((gesture: TouchGesture) => {
    if (gestureMode === 'move' && onCardMove) {
      // Move selected cards
      selectedCards.forEach(cardId => {
        onCardMove(cardId, gesture.currentPosition);
      });
    }
  }, [gestureMode, selectedCards, onCardMove]);

  const handlePinch = useCallback((scale: number) => {
    if (gestureMode === 'zoom' && onSpreadZoom) {
      onSpreadZoom(scale);
    }
  }, [gestureMode, onSpreadZoom]);

  const handleTap = useCallback((position: { x: number; y: number }) => {
    if (gestureMode === 'select' && onCardSelect) {
      // Simple card selection by proximity - would need card position mapping
      // onCardSelect(findClosestCard(position));
    }
  }, [gestureMode, onCardSelect]);

  const handleSwipe = useCallback((direction: string) => {
    // Change gesture mode based on swipe direction
    if (direction === 'up') setGestureMode('zoom');
    else if (direction === 'down') setGestureMode('move');
    else if (direction === 'left' || direction === 'right') setGestureMode('select');
  }, []);

  const handleLongPress = useCallback((position: { x: number; y: number }) => {
    // Long press to select multiple cards or zoom
    setGestureMode('zoom');
  }, []);

  const gestures = useTouchGestures(target, {
    onDrag: handleDrag,
    onPinch: handlePinch,
    onTap: handleTap,
    onSwipe: handleSwipe,
    onLongPress: handleLongPress
  });

  return {
    ...gestures,
    selectedCards,
    gestureMode,
    setGestureMode,
    addToSelection: (cardId: string) => setSelectedCards(prev => new Set(prev).add(cardId)),
    removeFromSelection: (cardId: string) => setSelectedCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    }),
    clearSelection: () => setSelectedCards(new Set())
  };
}
