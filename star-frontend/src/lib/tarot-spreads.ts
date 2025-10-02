import { TarotSpread } from '../types/tarot-interactions';

export const TAROT_SPREADS: Record<string, TarotSpread> = {
  single_card: {
    id: 'single_card',
    name: 'Single Card Insight',
    layout_type: 'single_card',
    description: 'A solitary card drawn for immediate guidance and clarity',
    cosmic_template: 'Insight and intuition during moments of cosmic alignment',
    positions: [
      {
        id: 'center',
        x: 50,
        y: 50,
        rotation: 0,
        scale: 1.2,
        label: 'Present Moment',
        meaning_context: 'Immediate energy and guidance from the universe'
      }
    ]
  },

  three_card: {
    id: 'three_card',
    name: 'Past, Present, Future',
    layout_type: 'three_card',
    description: 'A linear spread revealing the flow of time and destiny',
    cosmic_template: 'Mercury and Saturn alignment for temporal wisdom',
    positions: [
      {
        id: 'past',
        x: 20,
        y: 50,
        rotation: -5,
        scale: 1,
        label: 'Past Influences',
        meaning_context: 'Influences from your history shaping current reality'
      },
      {
        id: 'present',
        x: 50,
        y: 50,
        rotation: 0,
        scale: 1.1,
        label: 'Present Situation',
        meaning_context: 'Current energies and challenges you face'
      },
      {
        id: 'future',
        x: 80,
        y: 50,
        rotation: 5,
        scale: 1,
        label: 'Future Potential',
        meaning_context: 'Coming opportunities and potential outcomes'
      }
    ]
  },

  horseshoe: {
    id: 'horseshoe',
    name: 'Horseshoe of Destiny',
    layout_type: 'horseshoe',
    description: 'Seven cards forming a protective arc of guidance',
    cosmic_template: 'Venus and Moon conjunction for emotional guidance',
    positions: [
      {
        id: 'situation',
        x: 50,
        y: 20,
        rotation: 0,
        scale: 1.1,
        label: 'Situation',
        meaning_context: 'The core challenge or focus of your inquiry'
      },
      {
        id: 'challenges',
        x: 25,
        y: 35,
        rotation: -10,
        scale: 1,
        label: 'Challenges',
        meaning_context: 'Obstacles or hidden factors affecting your path'
      },
      {
        id: 'resources',
        x: 75,
        y: 35,
        rotation: 10,
        scale: 1,
        label: 'Resources',
        meaning_context: 'Your strengths and available support'
      },
      {
        id: 'past',
        x: 10,
        y: 60,
        rotation: -20,
        scale: 1,
        label: 'Past Influences',
        meaning_context: 'How your history influences your current situation'
      },
      {
        id: 'conscious',
        x: 50,
        y: 65,
        rotation: 0,
        scale: 1,
        label: 'Conscious Mind',
        meaning_context: 'Your current mental state and rational approach'
      },
      {
        id: 'unconscious',
        x: 90,
        y: 60,
        rotation: 20,
        scale: 1,
        label: 'Unconscious Mind',
        meaning_context: 'Subconscious motivations and deep emotions'
      },
      {
        id: 'outcome',
        x: 50,
        y: 85,
        rotation: 0,
        scale: 1.05,
        label: 'Likely Outcome',
        meaning_context: 'The probable result if current courses remain steady'
      }
    ]
  },

  celtic_cross: {
    id: 'celtic_cross',
    name: 'Celtic Cross',
    layout_type: 'celtic_cross',
    description: 'The sacred ten-card spread of ancient Celtic wisdom',
    cosmic_template: 'Full moon timing for deep archetypal insights',
    positions: [
      {
        id: 'present',
        x: 50,
        y: 50,
        rotation: 0,
        scale: 1.2,
        label: 'Present Situation',
        meaning_context: 'The heart of the matter - your current reality'
      },
      {
        id: 'challenge',
        x: 50,
        y: 25,
        rotation: 0,
        scale: 1,
        label: 'Immediate Challenge',
        meaning_context: 'The obstacle crossing your path right now'
      },
      {
        id: 'distant_past',
        x: 75,
        y: 37.5,
        rotation: 90,
        scale: 1,
        label: 'Distant Past',
        meaning_context: 'Foundational influences from your history'
      },
      {
        id: 'possible_outcome',
        x: 75,
        y: 62.5,
        rotation: 90,
        scale: 1,
        label: 'Possible Outcome',
        meaning_context: 'What may emerge if current paths continue'
      },
      {
        id: 'recent_past',
        x: 25,
        y: 37.5,
        rotation: 90,
        scale: 1,
        label: 'Recent Past',
        meaning_context: 'Recent events shaping your current situation'
      },
      {
        id: 'near_future',
        x: 25,
        y: 62.5,
        rotation: 90,
        scale: 1,
        label: 'Near Future',
        meaning_context: 'Events developing in the coming months'
      },
      {
        id: 'approach',
        x: 37.5,
        y: 75,
        rotation: 0,
        scale: 0.9,
        label: 'Your Approach',
        meaning_context: 'Your attitude and how you are approaching the situation'
      },
      {
        id: 'external',
        x: 62.5,
        y: 75,
        rotation: 0,
        scale: 0.9,
        label: 'External Influence',
        meaning_context: 'People or forces outside your control'
      },
      {
        id: 'hopes_fears',
        x: 12.5,
        y: 50,
        rotation: 90,
        scale: 0.9,
        label: 'Hopes & Fears',
        meaning_context: 'Your deepest hopes and greatest fears'
      },
      {
        id: 'final_outcome',
        x: 87.5,
        y: 50,
        rotation: 90,
        scale: 0.95,
        label: 'Final Outcome',
        meaning_context: 'The ultimate result of following your true path'
      }
    ]
  }
};

export function getSpreadByType(type: string): TarotSpread | undefined {
  return TAROT_SPREADS[type];
}

export function getAllSpreadTypes(): string[] {
  return Object.keys(TAROT_SPREADS);
}

export function createSpreadLayout(type: string, customPositions?: any[]): TarotSpread | undefined {
  const baseSpread = TAROT_SPREADS[type];
  if (!baseSpread) return undefined;

  if (customPositions && customPositions.length > 0) {
    return {
      ...baseSpread,
      positions: customPositions
    };
  }

  return baseSpread;
}
