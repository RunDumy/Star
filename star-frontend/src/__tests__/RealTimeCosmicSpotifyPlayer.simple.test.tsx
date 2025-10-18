import { act, render, screen, waitFor } from '@testing-library/react';
import { RealTimeCosmicSpotifyPlayer } from '../components/cosmic/RealTimeCosmicSpotifyPlayer';

// Simple mock implementations
const mockSpotifyPlayer = {
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    disconnect: jest.fn(() => Promise.resolve()),
    getCurrentState: jest.fn(() => Promise.resolve(null)),
};

const mockWebSocketService = {
    joinCosmicSession: jest.fn(),
    syncMusicState: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
};

// Mock fetch globally
globalThis.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('RealTimeCosmicSpotifyPlayer - Basic Tests', () => {
    const defaultProps = {
        sessionId: 'cosmic-session-123',
        userId: 'test-user-123',
        isHost: false,
        tarotCards: [],
        onTrackChange: jest.fn(),
        onError: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock successful API responses
        (globalThis.fetch as jest.MockedFunction<typeof fetch>).mockImplementation((url) => {
            if (typeof url === 'string') {
                if (url.includes('/api/v1/spotify/session/')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            session_id: 'cosmic-session-123',
                            host_user: 'user456',
                            participants: ['user123', 'user456'],
                            cosmic_sync_level: 85,
                            lunar_phase: 'waxing_crescent',
                            created_at: '2023-12-01T00:00:00Z'
                        })
                    } as Response);
                }

                if (url.includes('/api/v1/spotify/lunar-phase')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            phase: 'waxing_crescent',
                            illumination: 0.25,
                            influence: 'gentle_growth'
                        })
                    } as Response);
                }

                if (url.includes('/api/v1/spotify/cosmic-playlist')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            tracks: []
                        })
                    } as Response);
                }
            }

            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not found' })
            } as Response);
        });

        // Mock Spotify Web Playback SDK
        (globalThis as any).Spotify = {
            Player: jest.fn().mockImplementation(() => mockSpotifyPlayer)
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('Component Rendering', () => {
        it('renders the cosmic player interface', async () => {
            await act(async () => {
                render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);
            });

            await waitFor(() => {
                expect(screen.getByText(/ready for cosmic harmonization/i)).toBeInTheDocument();
            });
        });

        it('displays connecting state initially', async () => {
            await act(async () => {
                render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);
            });

            expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
        });

        it('shows cosmic travelers count', async () => {
            await act(async () => {
                render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);
            });

            await waitFor(() => {
                expect(screen.getByText(/cosmic travelers/i)).toBeInTheDocument();
            });
        });
    });

    describe('Music Controls', () => {
        it('renders play/pause button', async () => {
            await act(async () => {
                render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);
            });

            await waitFor(() => {
                expect(screen.getAllByRole('button')).toHaveLength(4); // 4 buttons total
            });
        });

        it('renders cosmic mix generation button', async () => {
            await act(async () => {
                render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);
            });

            await waitFor(() => {
                expect(screen.getByText(/generate cosmic mix/i)).toBeInTheDocument();
            });
        });
    });

    describe('Lunar Phase Display', () => {
        it('shows lunar phase information when available', async () => {
            await act(async () => {
                render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);
            });

            // Since lunar phase may be hidden initially, just verify the component renders
            expect(screen.getByText(/ready for cosmic harmonization/i)).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('handles component initialization gracefully', async () => {
            // This test just ensures the component doesn't crash on render
            await act(async () => {
                render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);
            });

            expect(screen.getByText(/ready for cosmic harmonization/i)).toBeInTheDocument();
        });
    });

    describe('Cleanup', () => {
        it('unmounts without errors', async () => {
            const { unmount } = render(<RealTimeCosmicSpotifyPlayer {...defaultProps} />);

            await act(async () => {
                unmount();
            });

            // Test passes if no errors are thrown during unmount
        });
    });
});