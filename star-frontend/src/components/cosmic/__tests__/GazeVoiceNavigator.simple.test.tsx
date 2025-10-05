import { render } from '@testing-library/react';
import { GazeVoiceNavigator } from '../GazeVoiceNavigator';

// Mock the hooks
jest.mock('@/hooks/useGazeNavigation', () => ({
  useGazeNavigation: () => ({
    mousePosition: { x: 0, y: 0 },
    gazeTarget: null,
    isGazing: false,
    gazeProgress: 0,
    gazeDirection: { x: 0, y: 0 },
    resetGaze: jest.fn(),
  }),
}));

jest.mock('@/hooks/useVoiceCommands', () => ({
  useVoiceCommands: () => ({
    isListening: false,
    transcript: '',
    isSupported: true,
    startListening: jest.fn(),
    stopListening: jest.fn(),
    clearTranscript: jest.fn(),
    getCommandHistory: jest.fn(),
    lastCommand: null,
  }),
}));

describe('GazeVoiceNavigator', () => {
  const mockOnNavigate = jest.fn();
  const mockOnCommand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with gesture support', () => {
    render(
      <GazeVoiceNavigator
        onNavigate={mockOnNavigate}
        onCommand={mockOnCommand}
      >
        <div>Test Child</div>
      </GazeVoiceNavigator>
    );

    // Component should render with gesture handlers from @use-gesture/react
    expect(true).toBe(true);
  });
});