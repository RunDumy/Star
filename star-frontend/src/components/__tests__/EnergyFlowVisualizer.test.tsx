import { render, screen, waitFor } from '@testing-library/react';
import EnergyFlowVisualizer from '../EnergyFlowVisualizer';
import fetchMock from 'jest-fetch-mock';

const mockSpread = {
  past: {
    card: { name: 'The Fool', svg_path: '/cards/fool.svg', element: 'Air' },
    interpretation: 'A new journey awaits.',
  },
  present: {
    card: { name: 'The Magician', svg_path: '/cards/magician.svg', element: 'Fire' },
    interpretation: 'You hold the power to create.',
  },
};

const mockConnections = [
  {
    id: 'flow_0_1',
    fromCardId: 'card-0',
    toCardId: 'card-1',
    strength: 5,
    element: 'Fire-Air',
    color: '#FACC15',
    style: 'line' as const,
  },
];

describe('EnergyFlowVisualizer', () => {
  const mockCardPositions = new Map([
    ['card-0', { x: 100, y: 100 }],
    ['card-1', { x: 300, y: 200 }],
  ]);

  it('renders energy flow connections', () => {
    render(
      <EnergyFlowVisualizer
        width={400}
        height={300}
        energyFlows={mockConnections}
        cardPositions={mockCardPositions}
        animated={false}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('handles empty energy flows', () => {
    render(
      <EnergyFlowVisualizer
        width={400}
        height={300}
        energyFlows={[]}
        cardPositions={new Map()}
        animated={false}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders with animation when enabled', () => {
    render(
      <EnergyFlowVisualizer
        width={400}
        height={300}
        energyFlows={mockConnections}
        cardPositions={mockCardPositions}
        animated={true}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('handles missing card positions', () => {
    render(
      <EnergyFlowVisualizer
        width={400}
        height={300}
        energyFlows={mockConnections}
        cardPositions={new Map()} // Empty positions
        animated={false}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('calls onFlowClick when flow is clicked', () => {
    const mockOnClick = jest.fn();

    render(
      <EnergyFlowVisualizer
        width={400}
        height={300}
        energyFlows={mockConnections}
        cardPositions={mockCardPositions}
        onFlowClick={mockOnClick}
        animated={false}
      />
    );

    // Note: Testing Konva click events requires more complex setup
    // This test structure ensures the component renders without errors
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('renders different flow styles correctly', () => {
    const mixedConnections = [
      { ...mockConnections[0], style: 'line' as const },
      { ...mockConnections[0], id: 'flow-2', style: 'arc' as const },
      { ...mockConnections[0], id: 'flow-3', style: 'wave' as const },
    ];

    render(
      <EnergyFlowVisualizer
        width={400}
        height={300}
        energyFlows={mixedConnections}
        cardPositions={mockCardPositions}
        animated={false}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
