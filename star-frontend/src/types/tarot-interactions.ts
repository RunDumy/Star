import { CosmicUIProperties } from './archetype-oracle';

// Tarot card types for Minor and Major Arcana
export interface TarotCard {
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'cups' | 'pentacles' | 'swords' | 'wands';
  rank?: string; // 'Ace' through '10', 'Page', 'Knight', 'Queen', 'King'
  element: string;
  theme: string;
  intensity: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  significance: string;
}

// Card spread positions and layouts
export interface SpreadPosition {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  label: string;
  meaning_context: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  layout_type: 'celtic_cross' | 'three_card' | 'horseshoe' | 'single_card';
  positions: SpreadPosition[];
  description: string;
  cosmic_template: string; // Maps to astrological timing
}

export interface DraggedCard {
  id: string;
  cardName: string;
  number: number;
  position: { x: number; y: number };
  rotation: number;
  isFaceDown: boolean;
  cosmic_properties: CosmicUIProperties;
}

export interface InteractiveReading {
  id: string;
  spread: TarotSpread;
  cards: DraggedCard[];
  interpretations: Record<string, string>;
  cosmic_alignment: string;
  timestamp: Date;
  energy_flow: EnergyFlow[];
}

export interface EnergyFlow {
  id: string;
  fromCardId: string;
  toCardId: string;
  strength: number;
  element: string;
  color: string;
  style: 'arc' | 'line' | 'wave';
}

export interface SpringAnimation {
  mass: number;
  tension: number;
  friction: number;
  velocity: { x: number; y: number };
  position: { x: number; y: number };
}

export interface TouchGesture {
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  fingerCount: number;
  gestureType: 'pan' | 'pinch' | 'tap' | 'swipe';
}

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}
