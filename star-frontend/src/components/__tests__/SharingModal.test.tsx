import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SharingModal from '../SharingModal';
import { EnergyFlow } from '../../types/tarot-interactions';
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
  future: {
    card: null,
    interpretation: '',
  },
};

const mockConnections: EnergyFlow[] = [
  {
    id: 'flow_0_1',
    fromCardId: 'card-0',
    toCardId: 'card-1',
    strength: 5,
    element: 'Fire-Air',
    color: '#FACC15',
    style: 'line',
  },
];

describe('SharingModal', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses(
      [
        JSON.stringify({ share_url: 'https://cosmic-tarot.com/spread/123' }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          playlist: {
            name: 'Cosmic Tarot: Flowing Energy',
            uri: 'spotify:playlist:mock_flowing',
            tracks: ['spotify:track:1', 'spotify:track:2'],
          },
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          astrological_note: 'Your local celestial alignment enhances Air energies.',
          location: { city: 'Test City' },
        }),
        { status: 200 },
      ]
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal when open', async () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByRole('dialog', { name: /share your tarot spread/i })).toBeInTheDocument();
    expect(screen.getByText('Share Your Cosmic Spread')).toBeInTheDocument();

    // Await the async fetch-driven UI updates to avoid act() warnings
    expect(await screen.findByText(/past: The Fool - A new journey awaits./i)).toBeInTheDocument();
    expect(await screen.findByText(/present: The Magician - You hold the power to create./i)).toBeInTheDocument();
    expect(await screen.findByText(/enhances Air energies/i)).toBeInTheDocument();
    expect(await screen.findByText(/Listen to your Cosmic Tarot: Flowing Energy/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('generates and copies share URL', async () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy shareable link/i });
    fireEvent.click(copyButton);

    // Ensure share URL generation flow finishes before asserting clipboard calls
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://cosmic-tarot.com/spread/123'));
  });

  it('downloads canvas image', async () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    const downloadButton = screen.getByRole('button', { name: /download spread image/i });
    fireEvent.click(downloadButton);

    // The download handler is synchronous for the test fallback; assert the click occurred
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it('shows loading state during data generation', () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/Generating cosmic insights/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Reset and configure fetch mocks so the third call (location insights)
    // will reject, simulating an API failure for location data while other
    // endpoints return success.
    fetchMock.resetMocks();
    fetchMock.mockResponses(
      [
        JSON.stringify({ share_url: 'https://cosmic-tarot.com/spread/123' }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          playlist: {
            name: 'Cosmic Tarot: Flowing Energy',
            uri: 'spotify:playlist:mock_flowing',
            tracks: ['spotify:track:1', 'spotify:track:2'],
          },
        }),
        { status: 200 },
      ]
    );
    // Make the next (third) fetch call reject to simulate location API failure
    fetchMock.mockRejectOnce(new Error('API failure'));

    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Wait for the component to settle after the mocked failure
    expect(await screen.findByText(/past: The Fool/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/enhances Air energies/i)).not.toBeInTheDocument();
    });
  });
});
