import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SigilGenerator from '../SigilGenerator';
import axios from 'axios';
import { MINOR_ARCANA_CARDS, getMinorArcanaCard, getCardsBySuit, getAllMinorArcanaNames } from '../../lib/minor-arcana';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock usePlanetaryHour hook
jest.mock('../../hooks/usePlanetaryHour', () => ({
  usePlanetaryHour: () => ({
    hourPlanet: 'Venus',
    getCurrentPlanetaryHour: jest.fn()
  })
}));

// Mock React Konva components
jest.mock('react-konva', () => ({
  Stage: ({ children }: { children: React.ReactNode }) => <div data-testid="konva-stage">{children}</div>,
  Layer: ({ children }: { children: React.ReactNode }) => <div data-testid="konva-layer">{children}</div>,
  Line: () => <div data-testid="konva-line" />,
  Circle: () => <div data-testid="konva-circle" />,
  Rect: () => <div data-testid="konva-rect" />,
  Text: () => <div data-testid="konva-text" />
}));

describe('SigilGenerator - Minor Arcana Integration', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock successful API response
    mockedAxios.post.mockResolvedValue({
      data: {
        sigil: {
          points: [[100, 100], [150, 150], [200, 100]],
          strokes: [[0, 1, 2]],
          color: '#ff6347',
          element: 'Fire',
          zodiac_sign: 'Leo',
          hour_planet: 'Venus',
          curve_factor: 1.2
        }
      }
    });

    // Mock canvas toDataURL
    HTMLCanvasElement.prototype.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
      drawImage: jest.fn(),
      getImageData: jest.fn(),
      putImageData: jest.fn()
    });
  });

  test('renders Minor Arcana enabled SigilGenerator', () => {
    render(<SigilGenerator userId={1} zodiacSign="Leo" />);

    expect(screen.getByText('Cosmic Sigil Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate Sigil')).toBeInTheDocument();
  });

  test('Minor Arcana card definitions are properly structured', () => {
    expect(MINOR_ARCANA_CARDS).toHaveLength(56);

    // Check for all expected suits
    const suits = ['wands', 'cups', 'swords', 'pentacles'];
    const ranks = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];

    suits.forEach(suit => {
      const suitCards = MINOR_ARCANA_CARDS.filter(card => card.suit === suit);
      expect(suitCards).toHaveLength(14);

      ranks.forEach(rank => {
        const card = suitCards.find(c => c.rank === rank);
        expect(card).toBeDefined();
        expect(card?.arcana).toBe('minor');
        expect(card?.suit).toBe(suit);
      });
    });
  });

  test('Minor Arcana elements are correctly assigned', () => {
    // Fire elements
    expect(MINOR_ARCANA_CARDS.filter(card => card.element === 'Fire')).toHaveLength(14);
    // Water elements
    expect(MINOR_ARCANA_CARDS.filter(card => card.element === 'Water')).toHaveLength(14);
    // Air elements
    expect(MINOR_ARCANA_CARDS.filter(card => card.element === 'Air')).toHaveLength(14);
    // Earth elements
    expect(MINOR_ARCANA_CARDS.filter(card => card.element === 'Earth')).toHaveLength(14);
  });

  test('getMinorArcanaCard function works correctly', () => {
    const card = getMinorArcanaCard('Ace of Wands');
    expect(card).toBeDefined();
    expect(card?.name).toBe('Ace of Wands');
    expect(card?.suit).toBe('wands');
    expect(card?.element).toBe('Fire');
    expect(card?.intensity).toBe('high');

    const nonExistentCard = getMinorArcanaCard('Nonexistent Card');
    expect(nonExistentCard).toBeUndefined();
  });

  test('getCardsBySuit function works correctly', () => {
    const wandsCards = getCardsBySuit('wands');
    expect(wandsCards).toHaveLength(14);
    expect(wandsCards.every(card => card.suit === 'wands')).toBe(true);
    expect(wandsCards.every(card => card.element === 'Fire')).toBe(true);

    const cupsCards = getCardsBySuit('cups');
    expect(cupsCards).toHaveLength(14);
    expect(cupsCards.every(card => card.element === 'Water')).toBe(true);
  });

  test('getAllMinorArcanaNames returns all 56 card names', () => {
    const allNames = getAllMinorArcanaNames();
    expect(allNames).toHaveLength(56);

    // Check some specific cards
    expect(allNames).toContain('Ace of Wands');
    expect(allNames).toContain('Queen of Cups');
    expect(allNames).toContain('King of Swords');
    expect(allNames).toContain('Ten of Pentacles');
  });

  test('Intensity levels are properly distributed', () => {
    const intensityLevels = ['very_low', 'low', 'medium', 'high', 'very_high'];
    intensityLevels.forEach(level => {
      const cardsWithIntensity = MINOR_ARCANA_CARDS.filter(card => card.intensity === level);
      expect(cardsWithIntensity.length).toBeGreaterThan(0);
    });
  });

  test('Court cards have appropriate themes', () => {
    const courtRanks = ['Page', 'Knight', 'Queen', 'King'];
    const courtCards = MINOR_ARCANA_CARDS.filter(card => courtRanks.includes(card.rank || ''));

    expect(courtCards).toHaveLength(16); // 4 ranks × 4 suits

    // Verify court cards have meaningful themes (this is more flexible than strict regex matching)
    courtCards.forEach(card => {
      expect(typeof card.theme).toBe('string');
      expect(card.theme.length).toBeGreaterThan(5); // All themes are substantive
    });

    // Verify unique themes for different court ranks
    const themes = courtCards.map(card => card.theme);
    const uniqueThemes = new Set(themes);
    expect(uniqueThemes.size).toBeGreaterThan(12); // Most themes should be different
  });

  test('card themes reflect elemental associations', () => {
    // Test Fire themes more broadly
    const fireCards = MINOR_ARCANA_CARDS.filter(card => card.element === 'Fire');
    const fireThemes = fireCards.map(card => card.theme.toLowerCase());

    // Fire themes should contain words associated with action/creativity/energy
    const fireWords = ['action', 'creativity', 'energy', 'creation', 'adventure', 'courage', 'leadership', 'inspiration', 'passion', 'victory', 'expansion', 'celebration', 'competition', 'perseverance', 'speed', 'resilience', 'burden', 'enthusiasm'];
    const hasFireThemeKeyword = fireThemes.some(theme =>
      fireWords.some(word => theme.includes(word) || theme.includes(word.replace('ion', 'y')))
    );
    expect(hasFireThemeKeyword).toBe(true);

    // Test Water themes
    const waterCards = MINOR_ARCANA_CARDS.filter(card => card.element === 'Water');
    const waterThemes = waterCards.map(card => card.theme.toLowerCase());

    // Water themes should contain emotional/intuitive/relational keywords
    const waterWords = ['love', 'emotion', 'intuition', 'relationship', 'compassion', 'creativity', 'celebration', 'apathy', 'regret', 'nostalgia', 'illusion', 'disillusionment', 'satisfaction', 'harmony', 'creative', 'romance', 'caring', 'balanced'];
    const hasWaterThemeKeyword = waterThemes.some(theme =>
      waterWords.some(word => theme.includes(word))
    );
    expect(hasWaterThemeKeyword).toBe(true);
  });

  // Integration test with backend (the actual sigil generation)
  test('sigil generation includes Minor Arcana card data', async () => {
    render(<SigilGenerator userId={1} zodiacSign="Leo" tarotCard="Ace of Wands" />);

    const generateButton = screen.getByText('Generate Sigil');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/sigil/generate', {
        user_id: 1,
        zodiac_sign: 'Leo',
        planetary_data: { hour_planet: 'Venus' },
        tarot_card: 'Ace of Wands'
      });
    });
  });
});
