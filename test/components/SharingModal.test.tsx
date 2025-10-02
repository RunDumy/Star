import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SharingModal from '../../star-frontend/src/components/SharingModal';
import { EnergyFlow } from '../../star-frontend/src/types/tarot-interactions';
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
    frequency: 'activating',
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

    await waitFor(() => {
      expect(screen.getByText(/past: The Fool - A new journey awaits./i)).toBeInTheDocument();
      expect(screen.getByText(/present: The Magician - You hold the power to create./i)).toBeInTheDocument();
      expect(screen.getByText(/enhances Air energies/i)).toBeInTheDocument();
      expect(screen.getByText(/Listen to your Cosmic Tarot: Flowing Energy/i)).toBeInTheDocument();
    });
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
    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });

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

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://cosmic-tarot.com/spread/123');
    });
  });

  it('downloads canvas image', async () => {
    const mockToDataURL = jest.fn().mockReturnValue('data:image/png;base64,mock');
    const mockClick = jest.fn();

    // Mock Konva Stage
    const MockKonva = require('konva');
    MockKonva.Stage.mockImplementation(() => ({
      toDataURL: mockToDataURL,
    }));

    // Mock anchor element click
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(mockClick);

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

    expect(mockToDataURL).toHaveBeenCalledWith({ pixelRatio: 2 });
    expect(mockClick).toHaveBeenCalled();
  });

  it('shows loading state during data generation', async () => {
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

  it('is accessible via keyboard', async () => {
    const onClose = jest.fn();
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close sharing modal/i });
    fireEvent.keyDown(closeButton, { key: 'Enter' });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
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

    await waitFor(() => {
      expect(screen.getByText(/past: The Fool/i)).toBeInTheDocument();
      expect(screen.queryByText(/enhances Air energies/i)).not.toBeInTheDocument();
    });
  });

  it('displays Spotify playlist link when available', async () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      const spotifyLink = screen.getByText(/Open on Spotify/i);
      expect(spotifyLink).toBeInTheDocument();
      expect(spotifyLink.closest('a')).toHaveAttribute('href', 'spotify:playlist:mock_flowing');
    });
  });

  it('shows location insights in summary', async () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Location Insights/i)).toBeInTheDocument();
      expect(screen.getByText(/enhances Air energies/i)).toBeInTheDocument();
    });
  });

  it('includes screen reader content', async () => {
    render(
      <SharingModal
        spread={mockSpread}
        spreadType="three-card"
        energyFlows={mockConnections}
        isOpen={true}
        onClose={() => {}}
      />
    );

    await waitFor(() => {
      const srContent = screen.getByText(/Shareable tarot spread summary/i, { selector: '.sr-only' });
      expect(srContent).toBeInTheDocument();
    });
  });
});
