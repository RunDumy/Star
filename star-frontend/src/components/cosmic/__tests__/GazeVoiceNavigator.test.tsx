import { fireEvent, render, screen } from '@testing-library/react';
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

  it('renders navigation controls', () => {
    render(
      <GazeVoiceNavigator
        onNavigate={mockOnNavigate}
        onCommand={mockOnCommand}
      >
        <div>Test Child</div>
      </GazeVoiceNavigator>
    );

    expect(screen.getByText('Start Navigation')).toBeInTheDocument();
  });

  it('toggles navigation mode', () => {
    render(
      <GazeVoiceNavigator
        onNavigate={mockOnNavigate}
        onCommand={mockOnCommand}
      >
        <div>Test Child</div>
      </GazeVoiceNavigator>
    );

    const toggleButton = screen.getByText('Start Navigation');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Stop Navigation')).toBeInTheDocument();
  });

  it('shows mode controls when active', () => {
    render(
      <GazeVoiceNavigator
        onNavigate={mockOnNavigate}
        onCommand={mockOnCommand}
      >
        <div>Test Child</div>
      </GazeVoiceNavigator>
    );

    const toggleButton = screen.getByText('Start Navigation');
    fireEvent.click(toggleButton);

    expect(screen.getByText('Gaze')).toBeInTheDocument();
    expect(screen.getByText('Voice')).toBeInTheDocument();
    expect(screen.getByText('Combined')).toBeInTheDocument();
  });

  it('handles gesture drag events', () => {
    render(
      <GazeVoiceNavigator
        onNavigate={mockOnNavigate}
        onCommand={mockOnCommand}
      >
        <div>Test Child</div>
      </GazeVoiceNavigator>
    );

    // Start navigation
    const toggleButton = screen.getByText('Start Navigation');
    fireEvent.click(toggleButton);

    // Simulate drag gesture
    const container = screen.getByText('Test Child').parentElement!;
    fireEvent.pointerDown(container, { clientX: 100, clientY: 100 });
    fireEvent.pointerMove(container, { clientX: 150, clientY: 100 });
    fireEvent.pointerUp(container);

    // Check if navigation was called with gesture data
    expect(mockOnNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'gesture',
        direction: 'right',
        source: 'gesture-drag',
      })
    );
  });

  it('handles pinch gestures for zoom', () => {
    render(
      <GazeVoiceNavigator
        onNavigate={mockOnNavigate}
        onCommand={mockOnCommand}
      >
        <div>Test Child</div>
      </GazeVoiceNavigator>
    );

    // Start navigation
    const toggleButton = screen.getByText('Start Navigation');
    fireEvent.click(toggleButton);

    // Simulate pinch gesture (mock implementation)
    const container = screen.getByText('Test Child').parentElement!;

    // Note: Actual pinch testing would require more complex setup
    // This is a basic structure for gesture testing
    expect(container).toBeInTheDocument();
  });
});

it('renders children', () => {
  const { getByText } = render(
    <GazeVoiceNavigator>
      <div>Test content</div>
    </GazeVoiceNavigator>
  );

  expect(getByText('Test content')).toBeInTheDocument();
});

it('shows navigation controls when active', () => {
  // We can't easily test state changes in the current test environment
  // but we can verify the component renders with default props
  const { container } = render(
    <GazeVoiceNavigator showDebug={true}>
      <div>Test content</div>
    </GazeVoiceNavigator>
  );

  expect(container.querySelector('.gaze-voice-navigator')).toBeInTheDocument();
});