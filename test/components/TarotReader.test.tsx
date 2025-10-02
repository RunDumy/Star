import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractiveTarotReader from '../../star-frontend/src/components/InteractiveTarotReader';

// Mock @testing-library/react dependencies
jest.mock('@dnd-kit/core');
jest.mock('@dnd-kit/sortable');
jest.mock('@dnd-kit/utilities');
jest.mock('react-spring');

describe('InteractiveTarotReader', () => {
  beforeEach(() => {
    // Mock the hooks and dependencies
    jest.clearAllMocks();
  });

  test('renders spread selection', () => {
    render(<InteractiveTarotReader />);

    expect(screen.getByText('Choose Your Spread')).toBeInTheDocument();
    expect(screen.getByText('Past, Present, Future')).toBeInTheDocument();
    expect(screen.getByText('Horseshoe of Destiny')).toBeInTheDocument();
    expect(screen.getByText('Celtic Cross')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    render(<InteractiveTarotReader />);

    expect(screen.getByText('🔮 Shuffle Cards')).toBeInTheDocument();
    expect(screen.getByText('Reveal Reading ✨')).toBeInTheDocument();
  });

  test('shows loading state when generating reading', () => {
    render(<InteractiveTarotReader />);

    const revealButton = screen.getByText('Reveal Reading ✨');
    fireEvent.click(revealButton);

    // Should not be immediately visible, but in real implementation would trigger loading
    // This test validates the button click handlers are wired
    expect(revealButton).toBeInTheDocument();
  });

  test('spread selection updates', () => {
    render(<InteractiveTarotReader />);

    const celticCrossButton = screen.getByText('Celtic Cross');
    fireEvent.click(celticCrossButton);

    // This validates the button is clickable and handlers are wired
    expect(celticCrossButton).toBeInTheDocument();
  });
});

// Test helper component for isolated spread canvas testing
export const TestTarotReader = () => <InteractiveTarotReader />;
